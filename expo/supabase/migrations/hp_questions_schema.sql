-- ============================================================
-- Högskoleprov Question Bank — Supabase Migration
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── hp_test_versions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hp_test_versions (
  id             TEXT PRIMARY KEY,           -- e.g. 'vt2024', 'ht2024'
  year           INTEGER NOT NULL,           -- e.g. 2024
  season         TEXT NOT NULL               -- 'spring' | 'fall'
                   CHECK (season IN ('spring', 'fall')),
  display_name   TEXT NOT NULL,              -- e.g. 'Vår 2024'
  question_count INTEGER NOT NULL DEFAULT 160,
  time_minutes   INTEGER NOT NULL DEFAULT 260,
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with existing versions
INSERT INTO public.hp_test_versions (id, year, season, display_name, question_count, time_minutes, is_published)
VALUES
  ('vt2024', 2024, 'spring', 'Vår 2024 (April)', 160, 260, TRUE),
  ('ht2024', 2024, 'fall',   'Höst 2024 (Oktober)', 160, 260, TRUE),
  ('vt2023', 2023, 'spring', 'Vår 2023 (April)', 160, 260, TRUE),
  ('ht2023', 2023, 'fall',   'Höst 2023 (Oktober)', 160, 260, TRUE),
  ('vt2022', 2022, 'spring', 'Vår 2022 (April)', 160, 260, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── hp_questions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hp_questions (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  test_version_id   TEXT REFERENCES public.hp_test_versions(id) ON DELETE CASCADE,
  section_code      TEXT NOT NULL               -- 'ORD' | 'LÄS' | 'MEK' | 'ELF' | 'XYZ' | 'KVA' | 'NOG' | 'DTK'
                      CHECK (section_code IN ('ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK')),
  question_number   INTEGER NOT NULL,
  question_text     TEXT NOT NULL,
  question_type     TEXT NOT NULL DEFAULT 'multiple_choice'
                      CHECK (question_type IN ('multiple_choice', 'comparison', 'reading_comprehension', 'diagram', 'data_sufficiency')),
  options           JSONB NOT NULL DEFAULT '[]',   -- ["A) ...", "B) ...", "C) ...", "D) ..."]
  correct_answer    TEXT NOT NULL,
  explanation       TEXT,
  difficulty        TEXT NOT NULL DEFAULT 'medium'
                      CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Image support (Layer 2 — Supabase Storage CDN)
  image_url         TEXT,                          -- public URL from hp-question-images bucket
  has_image         BOOLEAN GENERATED ALWAYS AS (image_url IS NOT NULL) STORED,

  -- Reading passage (LÄS, ELF)
  reading_passage   TEXT,

  -- Source metadata
  source_year       INTEGER,
  source_season     TEXT CHECK (source_season IN ('spring', 'fall', NULL)),

  -- Ordering
  display_order     INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (test_version_id, section_code, question_number)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hp_questions_updated_at ON public.hp_questions;
CREATE TRIGGER hp_questions_updated_at
  BEFORE UPDATE ON public.hp_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hp_questions_section       ON public.hp_questions(section_code);
CREATE INDEX IF NOT EXISTS idx_hp_questions_version       ON public.hp_questions(test_version_id);
CREATE INDEX IF NOT EXISTS idx_hp_questions_has_image     ON public.hp_questions(has_image) WHERE has_image = TRUE;
CREATE INDEX IF NOT EXISTS idx_hp_questions_difficulty    ON public.hp_questions(difficulty);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.hp_test_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_questions     ENABLE ROW LEVEL SECURITY;

-- Published test versions are publicly readable
CREATE POLICY "Published versions are public"
  ON public.hp_test_versions FOR SELECT
  USING (is_published = TRUE);

-- Questions from published versions are publicly readable (even for anon)
CREATE POLICY "Questions from published versions are public"
  ON public.hp_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hp_test_versions v
      WHERE v.id = hp_questions.test_version_id
        AND v.is_published = TRUE
    )
    OR test_version_id IS NULL   -- standalone/ungrouped practice questions
  );

-- Only service_role can insert/update/delete
CREATE POLICY "Service role can manage questions"
  ON public.hp_questions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage versions"
  ON public.hp_test_versions FOR ALL
  USING (auth.role() = 'service_role');

-- ── Storage Bucket ────────────────────────────────────────────
-- Run this separately (or via Supabase dashboard):
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('hp-question-images', 'hp-question-images', TRUE)
-- ON CONFLICT DO NOTHING;
--
-- Folder structure: /{year}/{season}/{section_code}/{question_number}.webp
-- Example:          /2024/spring/DTK/3.webp
--
-- Storage RLS — public read:
-- CREATE POLICY "Public read hp images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'hp-question-images');
--
-- CREATE POLICY "Service role upload hp images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'hp-question-images' AND auth.role() = 'service_role');

-- ── Helper view: section stats ────────────────────────────────
CREATE OR REPLACE VIEW public.hp_section_question_counts AS
SELECT
  section_code,
  COUNT(*)                                     AS total_questions,
  COUNT(*) FILTER (WHERE has_image)            AS questions_with_images,
  COUNT(*) FILTER (WHERE difficulty = 'easy')  AS easy_count,
  COUNT(*) FILTER (WHERE difficulty = 'medium') AS medium_count,
  COUNT(*) FILTER (WHERE difficulty = 'hard')  AS hard_count
FROM public.hp_questions
GROUP BY section_code
ORDER BY section_code;

-- ============================================================
-- PHASE 3 NOTES — App Integration (when ready to migrate)
-- ============================================================
--
-- In the app, replace hardcoded constants with:
--
--   const { data: questions } = useQuery({
--     queryKey: ['hp_questions', sectionCode],
--     queryFn: async () => {
--       const { data } = await supabase
--         .from('hp_questions')
--         .select('*')
--         .eq('section_code', sectionCode)
--         .order('display_order');
--       return data;
--     },
--     staleTime: 1000 * 60 * 60 * 24,   // cache 24 hours
--     placeholderData: LOCAL_FALLBACK_QUESTIONS[sectionCode],
--   });
--
-- Image URL pattern:
--   const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/hp-question-images`;
--   const imageUrl = `${STORAGE_BASE}/${year}/${season}/${sectionCode}/${questionNumber}.webp`;
--
-- ============================================================
