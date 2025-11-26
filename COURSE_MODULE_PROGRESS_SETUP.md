# Separate Course and Module Progress Setup

This guide will help you implement separate progress tracking for courses and modules in your app.

## What This Changes

### Before:
- Course progress was based only on completed lessons
- No way to manually adjust course completion percentage
- Modules had no completion status

### After:
- **Course Progress**: Manually tracked with +/- 10% buttons for easy adjustment
- **Module Progress**: Automatically tracked as completed/not completed based on lessons
- Both types of progress are independent and serve different purposes

## Setup Instructions

### Step 1: Run the SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `separate-course-module-progress.sql` 
4. Copy all the SQL code
5. Paste it into the SQL Editor in Supabase
6. Click "Run" to execute the migration

This will:
- Add `manual_progress` column to `user_courses` table
- Create `user_module_progress` table
- Set up automatic triggers for module progress tracking
- Create helper functions for updating progress
- Initialize module progress from existing lesson data

### Step 2: Verify the Migration

After running the SQL, you should see these changes in your Supabase database:

1. **user_courses** table:
   - New column: `manual_progress` (INTEGER, 0-100)
   
2. **user_module_progress** table (new):
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to profiles)
   - `module_id` (UUID, foreign key to course_modules)
   - `course_id` (TEXT, foreign key to courses)
   - `is_completed` (BOOLEAN)
   - `completed_at` (TIMESTAMPTZ)
   - `completed_lessons` (INTEGER)
   - `total_lessons` (INTEGER)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

### Step 3: The App Code is Already Updated

The following files have been created/updated:
- ✅ `contexts/CourseProgressContext.tsx` - New context for managing progress
- ✅ `app/_layout.tsx` - Provider added
- ✅ `separate-course-module-progress.sql` - Migration file

## How to Use in Your App

### 1. Course Progress (Manual +/- 10%)

To add course progress adjustment buttons to your course page:

\`\`\`typescript
import { useCourseProgress } from '@/contexts/CourseProgressContext';

function CoursePage({ courseId }: { courseId: string }) {
  const { adjustCourseProgress, getCourseProgressData, loadCourseProgress } = useCourseProgress();
  const progressData = getCourseProgressData(courseId);

  useEffect(() => {
    loadCourseProgress(courseId);
  }, [courseId]);

  const handleIncreaseProgress = async () => {
    const newProgress = await adjustCourseProgress(courseId, 10);
    if (newProgress !== null) {
      console.log('Progress increased to:', newProgress);
    }
  };

  const handleDecreaseProgress = async () => {
    const newProgress = await adjustCourseProgress(courseId, -10);
    if (newProgress !== null) {
      console.log('Progress decreased to:', newProgress);
    }
  };

  return (
    <View>
      <Text>Kursframsteg: {progressData?.manual_progress}%</Text>
      <Button title="-10%" onPress={handleDecreaseProgress} />
      <Button title="+10%" onPress={handleIncreaseProgress} />
    </View>
  );
}
\`\`\`

### 2. Module Progress (Automatic)

Module progress is automatically updated when lessons are completed. You can also manually toggle module completion:

\`\`\`typescript
import { useCourseProgress } from '@/contexts/CourseProgressContext';

function ModuleItem({ moduleId, courseId }: { moduleId: string; courseId: string }) {
  const { getModuleProgress, toggleModuleCompletion } = useCourseProgress();
  const moduleProgress = getModuleProgress(moduleId, courseId);

  const handleToggle = async () => {
    const success = await toggleModuleCompletion(
      moduleId, 
      courseId, 
      !moduleProgress?.is_completed
    );
    if (success) {
      console.log('Module completion toggled');
    }
  };

  return (
    <View>
      <Text>Module: {moduleProgress?.is_completed ? 'Completed' : 'Not Completed'}</Text>
      <Text>Lessons: {moduleProgress?.completed_lessons}/{moduleProgress?.total_lessons}</Text>
      <Button 
        title={moduleProgress?.is_completed ? 'Mark Incomplete' : 'Mark Complete'} 
        onPress={handleToggle} 
      />
    </View>
  );
}
\`\`\`

### 3. Display Both Types of Progress

\`\`\`typescript
import { useCourseProgress } from '@/contexts/CourseProgressContext';

function CourseOverview({ courseId }: { courseId: string }) {
  const { getCourseProgressData, loadCourseProgress } = useCourseProgress();
  const progressData = getCourseProgressData(courseId);

  useEffect(() => {
    loadCourseProgress(courseId);
  }, [courseId]);

  return (
    <View>
      <Text>📊 Manuellt kursframsteg: {progressData?.manual_progress}%</Text>
      <Text>📚 Moduler slutförda: {progressData?.modules_completed}/{progressData?.modules_total}</Text>
      <Text>📖 Lektioner slutförda: {progressData?.lessons_completed}/{progressData?.lessons_total}</Text>
    </View>
  );
}
\`\`\`

## API Reference

### CourseProgressContext

#### Methods:

- **`loadCourseProgress(courseId: string)`**
  - Loads both course and module progress for a course
  
- **`loadModuleProgress(courseId: string)`**
  - Loads module progress for a course
  
- **`adjustCourseProgress(courseId: string, adjustment: number)`**
  - Adjusts course progress by +/- amount (typically 10 or -10)
  - Returns the new progress value or null on error
  
- **`toggleModuleCompletion(moduleId: string, courseId: string, isCompleted: boolean)`**
  - Manually marks a module as completed or incomplete
  - Returns true on success, false on error
  
- **`getCourseProgressData(courseId: string)`**
  - Returns CourseProgressData object with all progress info
  
- **`getModuleProgressForCourse(courseId: string)`**
  - Returns array of ModuleProgress for all modules in a course
  
- **`getModuleProgress(moduleId: string, courseId: string)`**
  - Returns ModuleProgress for a specific module

## Database Functions

Two SQL functions are available:

### `update_course_manual_progress(p_user_id, p_course_id, p_adjustment)`
- Used internally by the context
- Adjusts manual progress with proper bounds checking (0-100)

### `get_course_progress(p_user_id, p_course_id)`
- Returns complete progress data for a course
- Includes manual progress, module counts, and lesson counts

## Automatic Features

1. **Module Progress Auto-Update**: When a lesson is marked as completed, the module progress is automatically recalculated
2. **Completion Detection**: A module is automatically marked complete when all its lessons are completed
3. **Realtime Sync**: Changes are synced across devices via Supabase realtime

## Testing

To test the implementation:

1. Run the SQL migration in Supabase
2. Restart your app
3. Navigate to any course page
4. Use the +10%/-10% buttons to adjust course progress
5. Complete lessons and watch module progress update automatically
6. Check that both progress types work independently

## Troubleshooting

### TypeScript errors about `manual_progress`
- Make sure you've run the SQL migration in Supabase
- Supabase will automatically update types after the migration

### Module progress not updating
- Check that the trigger `trigger_update_module_progress` exists in your database
- Verify that lesson progress is being saved to `user_lesson_progress` table

### Progress not persisting
- Check RLS (Row Level Security) policies
- Verify user is authenticated
- Check browser console for Supabase errors

## Need Help?

If you encounter issues:
1. Check Supabase logs for SQL errors
2. Verify all migrations ran successfully
3. Check that the context provider is added to your app layout
4. Ensure user is properly authenticated
