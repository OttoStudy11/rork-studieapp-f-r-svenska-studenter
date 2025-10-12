-- ============================================
-- STEP 3: INDEXES AND PERFORMANCE OPTIMIZATION
-- ============================================

-- Drop existing indexes if they exist to avoid conflicts
DROP INDEX IF EXISTS idx_user_courses_user_id;
DROP INDEX IF EXISTS idx_user_courses_course_id;
DROP INDEX IF EXISTS idx_user_lesson_progress_user_id;
DROP INDEX IF EXISTS idx_user_lesson_progress_lesson_id;
DROP INDEX IF EXISTS idx_user_lesson_progress_course_id;
DROP INDEX IF EXISTS idx_user_exercise_attempts_user_id;
DROP INDEX IF EXISTS idx_user_exercise_attempts_exercise_id;
DROP INDEX IF EXISTS idx_user_assessment_results_user_id;
DROP INDEX IF EXISTS idx_user_assessment_results_assessment_id;
DROP INDEX IF EXISTS idx_study_sessions_user_id;
DROP INDEX IF EXISTS idx_study_sessions_course_id;
DROP INDEX IF EXISTS idx_pomodoro_sessions_user_id;
DROP INDEX IF EXISTS idx_friendships_user1_id;
DROP INDEX IF EXISTS idx_friendships_user2_id;
DROP INDEX IF EXISTS idx_friendships_status;
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_course_lessons_course_id;
DROP INDEX IF EXISTS idx_course_lessons_module_id;
DROP INDEX IF EXISTS idx_course_modules_course_id;
DROP INDEX IF EXISTS idx_course_exercises_course_id;
DROP INDEX IF EXISTS idx_course_exercises_lesson_id;
DROP INDEX IF EXISTS idx_course_assessments_course_id;
DROP INDEX IF EXISTS idx_study_guides_course_id;
DROP INDEX IF EXISTS idx_lesson_materials_lesson_id;
DROP INDEX IF EXISTS idx_profiles_username;
DROP INDEX IF EXISTS idx_profiles_program_id;
DROP INDEX IF EXISTS idx_remember_me_sessions_user_id;
DROP INDEX IF EXISTS idx_remember_me_sessions_token_hash;

-- User-related indexes
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_course_id ON user_lesson_progress(course_id);
CREATE INDEX idx_user_exercise_attempts_user_id ON user_exercise_attempts(user_id);
CREATE INDEX idx_user_exercise_attempts_exercise_id ON user_exercise_attempts(exercise_id);
CREATE INDEX idx_user_assessment_results_user_id ON user_assessment_results(user_id);
CREATE INDEX idx_user_assessment_results_assessment_id ON user_assessment_results(assessment_id);

-- Study session indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_course_id ON study_sessions(course_id);
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);

-- Social features indexes
CREATE INDEX idx_friendships_user1_id ON friendships(user1_id);
CREATE INDEX idx_friendships_user2_id ON friendships(user2_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Course content indexes
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_exercises_course_id ON course_exercises(course_id);
CREATE INDEX idx_course_exercises_lesson_id ON course_exercises(lesson_id);
CREATE INDEX idx_course_assessments_course_id ON course_assessments(course_id);
CREATE INDEX idx_study_guides_course_id ON study_guides(course_id);
CREATE INDEX idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);

-- Profile indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_program_id ON profiles(program_id);

-- Authentication indexes
CREATE INDEX idx_remember_me_sessions_user_id ON remember_me_sessions(user_id);
CREATE INDEX idx_remember_me_sessions_token_hash ON remember_me_sessions(token_hash);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

DROP INDEX IF EXISTS idx_user_lesson_progress_composite;
DROP INDEX IF EXISTS idx_user_courses_active;
DROP INDEX IF EXISTS idx_friendships_composite;

CREATE INDEX idx_user_lesson_progress_composite ON user_lesson_progress(user_id, course_id, status);
CREATE INDEX idx_user_courses_active ON user_courses(user_id, is_active);
CREATE INDEX idx_friendships_composite ON friendships(user1_id, user2_id, status);

-- ============================================
-- ENABLE REALTIME FOR ALL TABLES
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE user_courses;
ALTER PUBLICATION supabase_realtime ADD TABLE user_lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE user_exercise_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE user_assessment_results;
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE pomodoro_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE course_lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE course_modules;
ALTER PUBLICATION supabase_realtime ADD TABLE course_exercises;
ALTER PUBLICATION supabase_realtime ADD TABLE course_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE study_guides;

-- ============================================
-- STEP 3 COMPLETE
-- ============================================
-- Next: Run step 4 for data population and initial content
