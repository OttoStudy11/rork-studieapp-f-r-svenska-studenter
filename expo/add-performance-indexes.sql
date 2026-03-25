-- Performance Indexes for StudieStugan
-- Run this SQL in your Supabase SQL Editor to improve query performance
-- These indexes optimize the most frequently accessed queries in the app

-- Course Modules - Filtered by course_id and published status
CREATE INDEX IF NOT EXISTS idx_course_modules_course_published 
ON course_modules(course_id, is_published, order_index) 
WHERE is_published = true;

-- Course Lessons - Filtered by module_id and published status
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_published 
ON course_lessons(module_id, is_published, order_index) 
WHERE is_published = true;

-- Course Lessons - Filtered by course_id (for direct course queries)
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_published 
ON course_lessons(course_id, is_published, order_index) 
WHERE is_published = true;

-- User Lesson Progress - Most frequently joined table
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson 
ON user_lesson_progress(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson 
ON user_lesson_progress(lesson_id, status);

-- Flashcards - Filtered by course
CREATE INDEX IF NOT EXISTS idx_flashcards_course_id 
ON flashcards(course_id, created_at DESC);

-- User Flashcard Progress - For spaced repetition
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_card 
ON user_flashcard_progress(user_id, flashcard_id);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review 
ON user_flashcard_progress(user_id, next_review_at) 
WHERE next_review_at IS NOT NULL;

-- User Courses - Most accessed relation
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id 
ON user_courses(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_courses_course_id 
ON user_courses(course_id);

-- User University Courses
CREATE INDEX IF NOT EXISTS idx_user_university_courses_user 
ON user_university_courses(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_university_courses_course 
ON user_university_courses(course_id);

-- Pomodoro Sessions - For statistics and history
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_created 
ON pomodoro_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_course 
ON pomodoro_sessions(user_id, course_id) 
WHERE course_id IS NOT NULL;

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created 
ON study_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_course 
ON study_sessions(user_id, course_id) 
WHERE course_id IS NOT NULL;

-- Exams - For upcoming exam queries
CREATE INDEX IF NOT EXISTS idx_exams_user_date 
ON exams(user_id, exam_date);

CREATE INDEX IF NOT EXISTS idx_exams_course_date 
ON exams(course_id, exam_date) 
WHERE course_id IS NOT NULL;

-- User Progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_course 
ON user_progress(user_id, course_id);

-- Friends System
CREATE INDEX IF NOT EXISTS idx_friends_user_id 
ON friends(user_id, status);

CREATE INDEX IF NOT EXISTS idx_friends_friend_id 
ON friends(friend_id, status);

CREATE INDEX IF NOT EXISTS idx_friends_both_users 
ON friends(user_id, friend_id, status);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
ON user_achievements(user_id, unlocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement 
ON user_achievements(achievement_id);

-- Course Exercises
CREATE INDEX IF NOT EXISTS idx_course_exercises_lesson 
ON course_exercises(lesson_id, order_index);

-- User Exercise Progress
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_exercise 
ON user_exercise_progress(user_id, exercise_id);

-- Composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_courses_level_subject 
ON courses(level, subject);

-- University specific indexes
CREATE INDEX IF NOT EXISTS idx_university_courses_code 
ON university_courses(course_code);

CREATE INDEX IF NOT EXISTS idx_university_course_modules_course 
ON university_course_modules(course_id, order_index);

-- Analyze tables to update statistics
ANALYZE course_modules;
ANALYZE course_lessons;
ANALYZE user_lesson_progress;
ANALYZE flashcards;
ANALYZE user_flashcard_progress;
ANALYZE user_courses;
ANALYZE user_university_courses;
ANALYZE pomodoro_sessions;
ANALYZE study_sessions;
ANALYZE exams;
ANALYZE user_progress;
ANALYZE friends;
ANALYZE user_achievements;
ANALYZE course_exercises;
ANALYZE user_exercise_progress;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
