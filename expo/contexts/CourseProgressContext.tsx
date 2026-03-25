import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  course_id: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_lessons: number;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

export interface CourseProgressData {
  manual_progress: number;
  modules_completed: number;
  modules_total: number;
  lessons_completed: number;
  lessons_total: number;
}

export const [CourseProgressProvider, useCourseProgress] = createContextHook(() => {
  const { user } = useAuth();
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress[]>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgressData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadCourseProgress = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('user_courses')
        .select('manual_progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading course progress:', error);
        return;
      }

      const { data: modulesData, error: modulesError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (modulesError) {
        console.error('Error loading modules progress:', modulesError);
      }

      const modules = modulesData || [];
      const modulesCompleted = modules.filter(m => m.is_completed).length;
      const lessonsCompleted = modules.reduce((sum, m) => sum + (m.completed_lessons || 0), 0);
      const lessonsTotal = modules.reduce((sum, m) => sum + (m.total_lessons || 0), 0);

      setCourseProgress(prev => ({
        ...prev,
        [courseId]: {
          manual_progress: data?.manual_progress || 0,
          modules_completed: modulesCompleted,
          modules_total: modules.length,
          lessons_completed: lessonsCompleted,
          lessons_total: lessonsTotal
        }
      }));
    } catch (error) {
      console.error('Error in loadCourseProgress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadModuleProgress = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        console.error('Error loading module progress:', error);
        return;
      }

      const typedData = (data || []) as ModuleProgress[];
      setModuleProgress(prev => ({
        ...prev,
        [courseId]: typedData
      }));
    } catch (error) {
      console.error('Error in loadModuleProgress:', error);
    }
  }, [user?.id]);

  const adjustCourseProgress = useCallback(async (
    courseId: string,
    adjustment: number
  ): Promise<number | null> => {
    if (!user?.id) return null;

    try {
      const { data: current, error: fetchError } = await supabase
        .from('user_courses')
        .select('manual_progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current progress:', fetchError);
        return null;
      }

      const currentProgress = current?.manual_progress || 0;
      const newProgress = Math.max(0, Math.min(100, currentProgress + adjustment));

      if (!current) {
        const { error: insertError } = await supabase
          .from('user_courses')
          .insert({
            id: `${user.id}-${courseId}`,
            user_id: user.id,
            course_id: courseId,
            manual_progress: newProgress,
            is_active: true
          });

        if (insertError) {
          console.error('Error inserting course progress:', insertError);
          return null;
        }
      } else {
        const { error: updateError } = await supabase
          .from('user_courses')
          .update({ manual_progress: newProgress })
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (updateError) {
          console.error('Error updating course progress:', updateError);
          return null;
        }
      }

      await loadCourseProgress(courseId);
      
      return newProgress;
    } catch (error) {
      console.error('Error in adjustCourseProgress:', error);
      return null;
    }
  }, [user?.id, loadCourseProgress]);

  const toggleModuleCompletion = useCallback(async (
    moduleId: string,
    courseId: string,
    isCompleted: boolean
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          course_id: courseId,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) {
        console.error('Error toggling module completion:', error);
        return false;
      }

      await loadModuleProgress(courseId);
      await loadCourseProgress(courseId);

      return true;
    } catch (error) {
      console.error('Error in toggleModuleCompletion:', error);
      return false;
    }
  }, [user?.id, loadModuleProgress, loadCourseProgress]);

  const getModuleProgressForCourse = useCallback((courseId: string): ModuleProgress[] => {
    return moduleProgress[courseId] || [];
  }, [moduleProgress]);

  const getCourseProgressData = useCallback((courseId: string): CourseProgressData | null => {
    return courseProgress[courseId] || null;
  }, [courseProgress]);

  const getModuleProgress = useCallback((moduleId: string, courseId: string): ModuleProgress | undefined => {
    const modules = moduleProgress[courseId] || [];
    return modules.find(m => m.module_id === moduleId);
  }, [moduleProgress]);

  useEffect(() => {
    if (!user?.id) {
      setModuleProgress({});
      setCourseProgress({});
    }
  }, [user?.id]);

  return {
    isLoading,
    loadCourseProgress,
    loadModuleProgress,
    adjustCourseProgress,
    toggleModuleCompletion,
    getModuleProgressForCourse,
    getCourseProgressData,
    getModuleProgress
  };
});
