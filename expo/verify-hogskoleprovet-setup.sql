-- Verification Script for Högskoleprovet System
-- Run this in Supabase SQL Editor to check your setup

-- 1. Check if tables exist
SELECT 
  'Table exists: ' || tablename as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('hp_tests', 'hp_sections', 'hp_questions', 'user_hp_question_answers', 'user_hp_test_attempts')
ORDER BY tablename;

-- 2. Check sections (should be 8)
SELECT 
  'Sections count: ' || COUNT(*)::text as status
FROM hp_sections;

SELECT * FROM hp_sections ORDER BY section_order;

-- 3. Check tests (should be at least 1)
SELECT 
  'Tests count: ' || COUNT(*)::text as status
FROM hp_tests;

SELECT * FROM hp_tests ORDER BY test_date DESC;

-- 4. Check questions per section
SELECT 
  s.section_code,
  s.section_name,
  COUNT(q.id) as question_count
FROM hp_sections s
LEFT JOIN hp_questions q ON q.section_id = s.id
GROUP BY s.id, s.section_code, s.section_name, s.section_order
ORDER BY s.section_order;

-- 5. Check total questions
SELECT 
  'Total questions: ' || COUNT(*)::text as status
FROM hp_questions;

-- 6. Sample questions from first section (ORD)
SELECT 
  q.id,
  q.question_number,
  q.question_text,
  q.options,
  q.correct_answer
FROM hp_questions q
JOIN hp_sections s ON q.section_id = s.id
WHERE s.section_code = 'ORD'
ORDER BY q.question_number
LIMIT 3;

-- 7. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename LIKE 'hp_%'
ORDER BY tablename, policyname;

-- 8. Test query that app uses
SELECT 
  'Test app query for ORD section' as test_name,
  COUNT(*) as result_count
FROM hp_questions
WHERE section_id = (SELECT id FROM hp_sections WHERE section_code = 'ORD' LIMIT 1);
