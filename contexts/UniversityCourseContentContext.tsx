import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface UniversityLesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_index: number;
  duration_minutes: number | null;
  lesson_type: string;
  resources: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UniversityModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lessons?: UniversityLesson[];
}

export interface UniversityExercise {
  id: string;
  lesson_id: string;
  question: string;
  question_type: string;
  options: any | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
  order_index: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface UniversityCourseWithModules {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  credits: number;
  level: string;
  subject_area: string;
  modules?: UniversityModule[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpentMinutes: number;
}

export interface ModuleProgress {
  moduleId: string;
  lessonsCompleted: number;
  totalLessons: number;
  percentComplete: number;
}

export interface CourseProgress {
  courseId: string;
  lessonsCompleted: number;
  totalLessons: number;
  percentComplete: number;
  lastAccessedAt?: string;
}

export const [UniversityCourseContentProvider, useUniversityCourseContent] = createContextHook(() => {
  const { user } = useAuth();
  const [isLoading] = useState(false);

  const fetchCourseContent = useCallback(async (courseId: string): Promise<UniversityCourseWithModules | null> => {
    try {
      console.log('Fetching university course content:', courseId);

      const { data: course, error: courseError } = await supabase
        .from('university_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error fetching university course:', courseError);
        return null;
      }

      const { data: modules, error: modulesError } = await supabase
        .from('university_course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) {
        console.error('Error fetching university modules:', modulesError);
        return { ...course, modules: [] };
      }

      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module) => {
          const { data: lessons, error: lessonsError } = await supabase
            .from('university_course_lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (lessonsError) {
            console.error('Error fetching lessons for module:', module.id, lessonsError);
            return { ...module, lessons: [] };
          }

          return { ...module, lessons: lessons || [] };
        })
      );

      return {
        ...course,
        modules: modulesWithLessons
      };
    } catch (error) {
      console.error('Exception fetching university course content:', error);
      return null;
    }
  }, []);

  const fetchLessonExercises = useCallback(async (lessonId: string): Promise<UniversityExercise[]> => {
    try {
      const { data, error } = await supabase
        .from('university_course_exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching exercises:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching exercises:', error);
      return [];
    }
  }, []);

  const markLessonCompleted = useCallback(async (
    lessonId: string,
    timeSpentMinutes: number = 0
  ) => {
    if (!user?.id) return;

    try {
      const id = `${user.id}-${lessonId}`;
      
      const { error } = await supabase
        .from('user_university_lesson_progress')
        .upsert({
          id,
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          time_spent_minutes: timeSpentMinutes,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error marking lesson completed:', error);
        throw error;
      }

      console.log('Marked university lesson completed:', lessonId);
    } catch (error) {
      console.error('Exception marking lesson completed:', error);
      throw error;
    }
  }, [user?.id]);

  const isLessonCompleted = useCallback(async (lessonId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('user_university_lesson_progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking lesson completion:', error);
        return false;
      }

      return data?.completed || false;
    } catch (error) {
      console.error('Exception checking lesson completion:', error);
      return false;
    }
  }, [user?.id]);

  const getModuleProgress = useCallback(async (moduleId: string): Promise<ModuleProgress> => {
    if (!user?.id) {
      return { moduleId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('user_university_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching module progress:', error);
        return { moduleId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
      }

      if (!data) {
        return { moduleId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
      }

      return {
        moduleId,
        lessonsCompleted: data.completed_lessons,
        totalLessons: data.total_lessons,
        percentComplete: data.progress
      };
    } catch (error) {
      console.error('Exception fetching module progress:', error);
      return { moduleId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
    }
  }, [user?.id]);

  const getCourseProgress = useCallback(async (courseId: string): Promise<CourseProgress> => {
    if (!user?.id) {
      return { courseId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
    }

    try {
      const course = await fetchCourseContent(courseId);
      if (!course || !course.modules) {
        return { courseId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
      }

      const totalLessons = course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
      
      const { data: lessonProgress, error } = await supabase
        .from('user_university_lesson_progress')
        .select('completed')
        .eq('user_id', user.id)
        .in('lesson_id', course.modules.flatMap(m => m.lessons?.map(l => l.id) || []));

      if (error) {
        console.error('Error fetching course progress:', error);
        return { courseId, lessonsCompleted: 0, totalLessons, percentComplete: 0 };
      }

      const lessonsCompleted = lessonProgress?.filter(lp => lp.completed).length || 0;
      const percentComplete = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

      return {
        courseId,
        lessonsCompleted,
        totalLessons,
        percentComplete
      };
    } catch (error) {
      console.error('Exception fetching course progress:', error);
      return { courseId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
    }
  }, [user?.id, fetchCourseContent]);

  const submitExerciseAttempt = useCallback(async (
    exerciseId: string,
    userAnswer: string,
    isCorrect: boolean,
    pointsEarned: number = 0,
    timeSpentSeconds: number = 0
  ) => {
    if (!user?.id) return;

    try {
      const id = `${user.id}-${exerciseId}-${Date.now()}`;

      const { error } = await supabase
        .from('user_university_exercise_attempts')
        .insert({
          id,
          user_id: user.id,
          exercise_id: exerciseId,
          user_answer: userAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_spent_seconds: timeSpentSeconds
        });

      if (error) {
        console.error('Error submitting exercise attempt:', error);
        throw error;
      }

      console.log('Submitted exercise attempt:', exerciseId);
    } catch (error) {
      console.error('Exception submitting exercise attempt:', error);
      throw error;
    }
  }, [user?.id]);

  return useMemo(() => ({
    isLoading,
    
    fetchCourseContent,
    fetchLessonExercises,
    markLessonCompleted,
    isLessonCompleted,
    getModuleProgress,
    getCourseProgress,
    submitExerciseAttempt
  }), [
    isLoading,
    fetchCourseContent,
    fetchLessonExercises,
    markLessonCompleted,
    isLessonCompleted,
    getModuleProgress,
    getCourseProgress,
    submitExerciseAttempt
  ]);
});
