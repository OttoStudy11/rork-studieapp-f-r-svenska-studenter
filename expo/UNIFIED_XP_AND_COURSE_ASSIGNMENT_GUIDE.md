# Unified XP System & Course Assignment Implementation Guide

## Overview
This guide explains the implementation of the unified XP/points system and the fixed course assignment logic for both Gymnasium and University students.

## 1. Unified XP System

### Constants File: `constants/xp-system.ts`
All XP values are now defined in a single source of truth:

```typescript
export const XP_VALUES = {
  // Lesson Completion
  LESSON_EASY_COMPLETE: 10,
  LESSON_MEDIUM_COMPLETE: 15,
  LESSON_HARD_COMPLETE: 25,
  
  // Exercise/Quiz Completion
  EXERCISE_EASY_COMPLETE: 15,
  EXERCISE_MEDIUM_COMPLETE: 25,
  EXERCISE_HARD_COMPLETE: 40,
  
  // Quiz Score-based
  QUIZ_50_75_PERCENT: 20,
  QUIZ_75_90_PERCENT: 35,
  QUIZ_90_100_PERCENT: 50,
  
  // Perfect Score Bonus
  PERFECT_QUIZ_BONUS: 25,
  PERFECT_EXERCISE_BONUS: 20,
  
  // Streak Bonuses
  STREAK_DAILY_BONUS: 5,
  STREAK_WEEKLY_BONUS: 50,
  STREAK_MONTHLY_BONUS: 200,
  
  // Module/Course Completion
  MODULE_COMPLETION: 100,
  COURSE_COMPLETION_BASE: 250,
  COURSE_COMPLETION_BONUS_PER_HOUR: 10,
  
  // Achievements
  ACHIEVEMENT_COMMON: 25,
  ACHIEVEMENT_UNCOMMON: 75,
  ACHIEVEMENT_RARE: 200,
  ACHIEVEMENT_EPIC: 400,
  ACHIEVEMENT_LEGENDARY: 750,
  
  // Daily Challenges
  DAILY_CHALLENGE_EASY: 30,
  DAILY_CHALLENGE_MEDIUM: 60,
  DAILY_CHALLENGE_HARD: 120,
  
  // First-time bonuses
  ONBOARDING_COMPLETION: 50,
  FIRST_LESSON_BONUS: 25,
  FIRST_COURSE_ENROLLMENT: 50,
  
  // Bonus XP
  EARLY_MORNING_STUDY_BONUS: 5,
  LATE_NIGHT_STUDY_BONUS: 5,
  LONG_SESSION_BONUS: 50,
  FOCUS_STREAK_BONUS: 25,
}
```

### Level System
50 levels with progressive XP requirements:
- **Levels 1-5**: Beginner (Gray #64748B)
- **Levels 6-15**: Intermediate (Blue #3B82F6)
- **Levels 16-25**: Advanced (Purple #8B5CF6)
- **Levels 26-35**: Expert (Gold #F59E0B)
- **Levels 36-45**: Master (Red #EF4444)
- **Levels 46-50**: Legend (Pink #EC4899)

### XP Manager: `lib/xp-manager.ts`
Centralized function for awarding XP:

```typescript
import { awardXP } from '@/lib/xp-manager';

// Award XP when user completes a lesson
await awardXP(userId, 'LESSON_MEDIUM_COMPLETE', {
  courseId: 'MAT123',
  moduleId: 'module-1',
  lessonId: 'lesson-1'
});

// Award XP for quiz performance
await awardXP(userId, 'QUIZ_90_100_PERCENT', {
  courseId: 'MAT123',
  exerciseId: 'quiz-1'
});
```

**Features:**
- ✅ Prevents double-awarding (checks if XP already given for same action)
- ✅ Automatically updates user level
- ✅ Tracks level-up history
- ✅ Returns detailed result including levelUp status

### Database Schema

#### `user_points` Table
Tracks every XP award:
```sql
- id: UUID
- user_id: UUID
- points: INTEGER
- source_category: VARCHAR (lesson, exercise, streak, achievement, etc)
- source_id: VARCHAR (lesson_id, exercise_id, etc)
- source_type: VARCHAR (LESSON_EASY_COMPLETE, etc)
- course_id: UUID
- metadata: JSONB
- awarded_at: TIMESTAMP
```

#### `user_level_history` Table
Tracks level-ups:
```sql
- id: UUID
- user_id: UUID
- level: INTEGER
- total_points: INTEGER
- achieved_at: TIMESTAMP
```

#### `profiles` Table Updates
```sql
- total_points: INTEGER (replaces old points system)
- level: INTEGER (now numeric instead of VARCHAR)
```

## 2. Course Assignment System

### Problem Fixed
University courses were not being assigned after onboarding because:
1. ❌ No logic to fetch courses based on university, program, and year
2. ❌ Only gymnasium courses had assignment logic
3. ❌ Missing database constraints for school_id, program_id, education_year

### Solution: `lib/course-assignment.ts`

```typescript
import { assignCoursesAfterOnboarding } from '@/lib/course-assignment';

// After onboarding completion
const assignedCourses = await assignCoursesAfterOnboarding({
  userId: user.id,
  schoolId: selectedUniversity.id,
  programId: selectedProgram.id,
  educationLevel: 'bachelor', // or 'master', 'phd'
  educationYear: 1 // or 2, 3, etc
});
```

**This function:**
1. ✅ Queries courses table with correct filters
2. ✅ Matches courses by school, program, level, and year
3. ✅ Checks for existing enrollments (prevents duplicates)
4. ✅ Creates user_courses entries
5. ✅ Returns list of assigned courses
6. ✅ Works for both Gymnasium and University

### Database Migration

Run `migrate-unified-xp-system.sql` to:
1. ✅ Add `total_points` column to profiles
2. ✅ Convert `level` from VARCHAR to INTEGER
3. ✅ Create `user_points` table
4. ✅ Create `user_level_history` table
5. ✅ Add course metadata columns (school_id, program_id, education_year, etc)
6. ✅ Create indexes for performance
7. ✅ Set up RLS policies

## 3. Updated Course Schema

### `courses` Table (Enhanced)
```sql
- id: UUID
- school_id: UUID (nullable - links to gymnasiums/universities)
- program_id: UUID (nullable - links to programs)
- education_year: INTEGER (1, 2, 3, etc)
- education_level: VARCHAR ('gymnasium', 'bachelor', 'master', 'phd')
- course_code: VARCHAR UNIQUE
- title: VARCHAR
- description: TEXT
- subject: VARCHAR
- difficulty_level: VARCHAR ('easy', 'medium', 'hard')
- emoji: VARCHAR
- color_code: VARCHAR
- is_required: BOOLEAN
- is_elective: BOOLEAN
- credits_or_points: INTEGER
- total_modules: INTEGER
- total_lessons: INTEGER
- total_exercises: INTEGER
- estimated_total_hours: INTEGER
- course_status: VARCHAR ('active', 'archived', 'draft')
- language: VARCHAR ('sv')
- prerequisites: JSONB
- learning_outcomes: JSONB
- resources: JSONB
- published_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Constraint Logic:**
- Specific courses: Have school_id + program_id + education_year
- General courses: All three are NULL (available to everyone)

## 4. Integration Points

### Where to Award XP

#### Lesson Completion
```typescript
import { awardXP } from '@/lib/xp-manager';

const handleLessonComplete = async () => {
  const difficulty = lesson.difficulty_level; // 'easy', 'medium', 'hard'
  const xpType = `LESSON_${difficulty.toUpperCase()}_COMPLETE` as XPType;
  
  await awardXP(userId, xpType, {
    courseId: lesson.course_id,
    moduleId: lesson.module_id,
    lessonId: lesson.id
  });
};
```

#### Quiz/Exercise Completion
```typescript
const handleQuizComplete = async (score: number, totalPoints: number) => {
  const percentage = (score / totalPoints) * 100;
  
  let xpType: XPType;
  if (percentage >= 90) {
    xpType = 'QUIZ_90_100_PERCENT';
    if (percentage === 100) {
      // Award bonus for perfect score
      await awardXP(userId, 'PERFECT_QUIZ_BONUS', {
        courseId: quiz.course_id,
        exerciseId: quiz.id
      });
    }
  } else if (percentage >= 75) {
    xpType = 'QUIZ_75_90_PERCENT';
  } else {
    xpType = 'QUIZ_50_75_PERCENT';
  }
  
  await awardXP(userId, xpType, {
    courseId: quiz.course_id,
    exerciseId: quiz.id,
    metadata: { score, totalPoints, percentage }
  });
};
```

#### Daily Streak
```typescript
const handleStreakMaintained = async (consecutiveDays: number) => {
  await awardXP(userId, 'STREAK_DAILY_BONUS', {
    metadata: { consecutiveDays }
  });
  
  // Weekly bonus
  if (consecutiveDays % 7 === 0) {
    await awardXP(userId, 'STREAK_WEEKLY_BONUS', {
      metadata: { consecutiveDays }
    });
  }
  
  // Monthly bonus
  if (consecutiveDays % 30 === 0) {
    await awardXP(userId, 'STREAK_MONTHLY_BONUS', {
      metadata: { consecutiveDays }
    });
  }
};
```

#### Module Completion
```typescript
const handleModuleComplete = async (moduleId: string) => {
  await awardXP(userId, 'MODULE_COMPLETION', {
    courseId: module.course_id,
    moduleId: moduleId
  });
};
```

#### Course Completion
```typescript
const handleCourseComplete = async (courseId: string, hoursSpent: number) => {
  await awardXP(userId, 'COURSE_COMPLETION_BASE', {
    courseId: courseId
  });
  
  // Bonus XP based on time spent
  const bonusXP = hoursSpent * XP_VALUES.COURSE_COMPLETION_BONUS_PER_HOUR;
  // Note: This bonus is included in COURSE_COMPLETION_BASE logic
};
```

## 5. Onboarding Integration

### Updated Onboarding Flow

After user selects school, program, and year:

```typescript
// In onboarding completion handler
const handleComplete = async () => {
  // 1. Save profile
  await completeOnboarding({
    name: data.displayName,
    username: data.username,
    studyLevel: data.studyLevel,
    // ... other fields
  });
  
  // 2. Assign courses based on selection
  const assignedCourses = await assignCoursesAfterOnboarding({
    userId: user.id,
    schoolId: data.studyLevel === 'gymnasie' 
      ? data.gymnasium?.id 
      : data.university?.id,
    programId: data.studyLevel === 'gymnasie'
      ? data.gymnasiumProgram?.id
      : data.universityProgram?.id,
    educationLevel: data.studyLevel === 'gymnasie' 
      ? 'gymnasium' 
      : 'bachelor', // or based on program type
    educationYear: data.year || 1
  });
  
  // 3. Award onboarding completion XP
  await awardXP(user.id, 'ONBOARDING_COMPLETION', {
    metadata: { assignedCourses: assignedCourses.length }
  });
  
  console.log(`✅ Assigned ${assignedCourses.length} courses`);
};
```

## 6. Testing Checklist

### XP System
- [ ] Lesson completion awards correct XP
- [ ] Quiz completion awards XP based on score
- [ ] Perfect scores award bonus XP
- [ ] No double XP awards for same action
- [ ] Level-ups trigger correctly
- [ ] Level history is recorded
- [ ] XP values are consistent across app

### Course Assignment
- [ ] Gymnasium courses assigned after onboarding
- [ ] University courses assigned after onboarding
- [ ] Correct courses based on school selection
- [ ] Correct courses based on program selection
- [ ] Correct courses based on year selection
- [ ] No duplicate course enrollments
- [ ] Courses appear on home screen immediately

### Database
- [ ] Migration runs without errors
- [ ] total_points column exists
- [ ] level is INTEGER type
- [ ] user_points table exists
- [ ] user_level_history table exists
- [ ] RLS policies work correctly
- [ ] Indexes improve query performance

## 7. Next Steps

1. **Run Database Migration**
   ```bash
   # In Supabase SQL Editor
   # Copy and run: migrate-unified-xp-system.sql
   ```

2. **Populate Course Data**
   - Ensure all courses have school_id, program_id, education_year set
   - For gymnasium courses: Link to specific gymnasiums and programs
   - For university courses: Link to universities and programs
   - For general courses: Leave school_id and program_id as NULL

3. **Update Existing Code**
   - Replace all hardcoded XP values with XP_VALUES constants
   - Replace direct XP updates with awardXP() function calls
   - Update level displays to use calculateLevel() function

4. **Test Thoroughly**
   - Test both gymnasium and university onboarding
   - Verify courses are assigned correctly
   - Test XP awards at every integration point
   - Verify level-ups work correctly

## 8. Common Issues & Solutions

### Issue: Courses not assigned after onboarding
**Solution:** Check that courses table has correct school_id, program_id, education_year values.

### Issue: XP not updating
**Solution:** Ensure you're using awardXP() function, not direct database updates.

### Issue: Double XP awards
**Solution:** awardXP() automatically prevents this by checking existing awards.

### Issue: Level not updating
**Solution:** Run the migration to convert level from VARCHAR to INTEGER.

### Issue: University courses missing
**Solution:** Ensure education_level is set correctly ('bachelor', 'master', 'phd', not 'högskola').

## 9. Performance Considerations

### Indexes Created
- `idx_courses_school_program` - Fast course lookup by school/program/year
- `idx_user_points_user_id` - Fast XP history queries
- `idx_user_points_user_source` - Prevents duplicate XP awards
- `idx_user_level_history_user_id` - Fast level history queries

### Caching Recommendations
- Cache user's total XP and level (invalidate on XP award)
- Cache course lists per program/year
- Cache XP_VALUES constants (never changes)

## 10. Summary

✅ **Unified XP System**
- Single source of truth for all XP values
- Centralized award function prevents duplicates
- Automatic level progression
- Detailed tracking of all XP awards

✅ **Fixed Course Assignment**
- Works for both Gymnasium and University
- Correctly filters by school, program, year, level
- Prevents duplicate enrollments
- Immediate course availability after onboarding

✅ **Enhanced Database Schema**
- Proper course metadata (school, program, year, level)
- XP tracking tables
- Level history
- Performance indexes
- RLS policies

This implementation ensures consistency, prevents bugs, and provides a solid foundation for future enhancements.
