# Högskoleprovet: UI Overhaul + Image Support + Full Migration Plan


## What's Being Built

A major upgrade to the Högskoleprovet experience — better visuals, richer section boards, image/graph support in questions, and a clear database migration strategy to support real past-exam content.

---

## 🎨 UI/UX Improvements

### Hero Header (refined, not replaced)
- Tighter layout with the countdown card elevated — bigger day number, cleaner urgency indicator
- Add a **score target ring** (like an Apple Fitness ring) showing progress toward the user's goal score (e.g. 1.6 toward 2.0)
- "Höst 2026 · 18 oktober" label made more prominent with a calendar icon pill
- Subtle animated shimmer on the header gradient to make it feel alive

### Section Boards — Large Cards (replacing current small grid)
Each of the 8 delprov sections (ORD, LÄS, MEK, ELF, XYZ, KVA, NOG, DTK) gets a **full-width expanded card** showing:
- Section name + full name + color-coded icon
- **Progress bar** showing how many questions attempted vs total
- **Accuracy %** badge (e.g. "74% rätt") in the section's accent color
- **Estimated section score** (e.g. "14/20 poäng")
- Time required and "Öva nu" CTA button
- Locked sections show a clean premium upsell state

### Full Test Card — improved
- Add sub-labels for each of the 4 provpass (morning/afternoon sessions)
- Show a mini 4-segment progress bar for completed passes

### Quick Stats Row (new)
- Horizontal scrolling stats strip below the hero: Total questions answered · Current streak · Avg accuracy · Sessions this week

---

## 🖼️ Image Support in Questions

### Strategy: Two-layer approach

**Layer 1 — In-app SVG rendering (for math & simple charts)**
- For XYZ geometry questions: render shapes, coordinate grids, number lines using `react-native-svg` (already in Expo)
- For KVA comparisons with formulas: render clean inline math-style text blocks
- For NOG: structured data blocks with styled boxes
- This covers ~40% of visual questions with zero storage costs

**Layer 2 — Supabase Storage (for DTK, real scanned graphs & maps)**
- Add `imageUrl` field to the questions (the field already exists in `HPQuestion` interface!)
- Store images in a Supabase `hp-question-images` storage bucket (public CDN)
- Render with `Image` component in the question card with a loading skeleton
- Support tall images (scrollable inside question card)
- Add a **digital ruler overlay** for DTK questions (like the HP-Prep app — a draggable semi-transparent ruler line users can move over diagrams to read values)

### Question Renderer Upgrade
- The question card will detect `imageUrl` and render image above the question text
- Image tap = full-screen zoom modal with pinch-to-zoom
- `readingPassage` stays as scrollable text block for LÄS/ELF

---

## 🗄️ Supabase Migration Strategy & Plan

### Phase 1 — Database Schema (this week)
Create a `hp_questions` table in Supabase:
- `id`, `section_code`, `test_version_id`, `question_number`
- `question_text`, `question_type`, `options` (JSONB array)
- `correct_answer`, `explanation`, `difficulty`
- `image_url` (nullable), `reading_passage` (nullable)
- `has_image` boolean for quick filtering
- `source_year`, `source_season` (e.g. 2024, 'spring')

Create `hp_test_versions` table:
- `id`, `year`, `season`, `display_name`, `question_count`, `time_minutes`

### Phase 2 — Storage Bucket Setup
- `hp-question-images/` bucket in Supabase Storage
- Folder structure: `/{year}/{season}/{section_code}/{question_number}.jpg`
- Public read, admin-only write (via service key)

### Phase 3 — App Data Loading
- Replace hardcoded constants with `useQuery` fetching from Supabase
- Cache questions locally with React Query for offline support
- Graceful fallback to local hardcoded questions during migration

### Phase 4 — Admin Tooling (future)
- Web-based question uploader (upload image + enter question data → inserts to Supabase)
- Bulk import from CSV for text-only questions

---

## 🔬 Competitive Analysis Summary

**HP-Prep (top competitor, 5 stars)**
- Real official questions from 2022–2025 ✅
- Digital ruler for DTK ← we should copy this
- Video explanations for XYZ ← opportunity
- Offline support ← we have this

**Högskoleprovet - Prova på (established, 4 stars)**
- 200k+ users since 2004, trusted brand
- All 8 sections covered
- Videoförklaringar — step-by-step expert videos for math

**Högskoleprovsappen (newest)**
- Glassmorphism design, gamification, XP system ← we have this
- Tiger mascot chat assistant ← we have AI coach

**Our Differentiators to Strengthen:**
- AI study plan tied to Oct 18 deadline (unique)
- Personalized weak-area targeting
- AI-generated practice questions (unique)
- Digital ruler for DTK (add this)
- Image support to make DTK/XYZ questions authentic

---

## 📋 Implementation Order

1. **Section boards** — replace grid with large progress cards
2. **Hero refinements** — score ring, countdown polish, stats strip
3. **Image renderer** — add image display to question card (Layer 1 SVG + Layer 2 URL)
4. **DTK digital ruler** — draggable overlay tool
5. **Supabase schema** — create tables, bucket, update data loading
