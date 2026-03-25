-- ==========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Run this to speed up queries across the app
-- ==========================================

-- Auth & Profile Queries (Fast Login)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- User Progress Queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);

-- Course Queries
CREATE INDEX IF NOT EXISTS idx_courses_id ON courses(id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);

-- Course Modules & Lessons
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_published ON course_lessons(course_id, is_published, order_index);

-- User Lesson Progress
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson ON user_lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);

-- Course Module Progress
CREATE INDEX IF NOT EXISTS idx_course_module_progress_user_id ON course_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_module_progress_module_id ON course_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_course_module_progress_user_module ON course_module_progress(user_id, module_id);

-- User Courses
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_course ON user_courses(user_id, course_id);

-- Flashcards (AI Feature)
CREATE INDEX IF NOT EXISTS idx_flashcards_course_id ON flashcards(course_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id ON user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_flashcard_id ON user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_flashcard ON user_flashcard_progress(user_id, flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review ON user_flashcard_progress(user_id, next_review_at);

-- Pomodoro Sessions
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_created ON pomodoro_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_course_id ON pomodoro_sessions(course_id);

-- Active Timer Sessions
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_user_id ON active_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_session_id ON active_timer_sessions(session_id);

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON study_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, date DESC);

-- Exams
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_user_date ON exams(user_id, exam_date);

-- Gamification
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Friends & Social
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_user_status ON friends(user_id, status);

-- Daily Challenges
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_date ON daily_challenges(user_id, challenge_date);

-- Högskoleprovet
CREATE INDEX IF NOT EXISTS idx_hogskoleprovet_questions_section ON hogskoleprovet_questions(section_code);
CREATE INDEX IF NOT EXISTS idx_hogskoleprovet_attempts_user_id ON hogskoleprovet_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_hogskoleprovet_attempts_created ON hogskoleprovet_attempts(created_at DESC);

-- University Courses
CREATE INDEX IF NOT EXISTS idx_university_courses_code ON university_courses(course_code);
CREATE INDEX IF NOT EXISTS idx_university_courses_program_id ON university_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_user_university_courses_user_id ON user_university_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_university_courses_course_id ON user_university_courses(course_id);

-- Remember Me Sessions (Fast Login)
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_user_id ON remember_me_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_token ON remember_me_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_expires ON remember_me_sessions(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_courses_active ON user_courses(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_flashcards_course_difficulty ON flashcards(course_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_pomodoro_complete ON pomodoro_sessions(user_id, is_completed, created_at DESC);

-- Optimize BTREE indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_level_program ON profiles(level, program);
CREATE INDEX IF NOT EXISTS idx_courses_level_subject ON courses(level, subject);

-- Full-text search indexes (if needed)
-- CREATE INDEX IF NOT EXISTS idx_courses_title_search ON courses USING gin(to_tsvector('english', title));
-- CREATE INDEX IF NOT EXISTS idx_flashcards_question_search ON flashcards USING gin(to_tsvector('swedish', question));

-- ==========================================
-- MAINTENANCE: Run ANALYZE after creating indexes
-- ==========================================
ANALYZE profiles;
ANALYZE courses;
ANALYZE course_modules;
ANALYZE course_lessons;
ANALYZE user_lesson_progress;
ANALYZE course_module_progress;
ANALYZE user_courses;
ANALYZE flashcards;
ANALYZE user_flashcard_progress;
ANALYZE pomodoro_sessions;
ANALYZE study_sessions;
ANALYZE exams;
ANALYZE achievements;
ANALYZE friends;

-- ==========================================
-- VERIFY INDEXES
-- ==========================================
-- Run this to see all indexes on a table:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'your_table_name';

-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
