import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from '@/contexts/AuthContext';
import { 
  allCourseContent, 
  getCourseContentById,
  findLessonById,
  findModuleById,
  getCourseDuration,
  getTotalLessons,
  type CourseContent,
  type Module,
  type Lesson
} from '@/constants/course-content-data';

// Progress tracking interfaces
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
  lessonProgress: Record<string, LessonProgress>;
}

const STORAGE_KEY_PREFIX = '@course_content_progress_';

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;

export const [CourseContentProvider, useCourseContent] = createContextHook(() => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from storage
  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const storageKey = getStorageKey(user.id);
      const storedProgress = await AsyncStorage.getItem(storageKey);
      
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);
        console.log('Loaded course content progress:', Object.keys(parsed).length, 'courses');
        setProgress(parsed);
      } else {
        console.log('No existing course content progress found');
        setProgress({});
      }
    } catch (error) {
      console.error('Error loading course content progress:', error);
      setProgress({});
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Save progress to storage
  const saveProgress = useCallback(async (newProgress: Record<string, CourseProgress>) => {
    if (!user?.id) return;

    try {
      const storageKey = getStorageKey(user.id);
      await AsyncStorage.setItem(storageKey, JSON.stringify(newProgress));
      setProgress(newProgress);
      console.log('Saved course content progress');
    } catch (error) {
      console.error('Error saving course content progress:', error);
    }
  }, [user?.id]);

  // Initialize progress for a course if not exists
  const initializeCourseProgress = useCallback((courseId: string): CourseProgress => {
    const course = getCourseContentById(courseId);
    if (!course) {
      return {
        courseId,
        lessonsCompleted: 0,
        totalLessons: 0,
        percentComplete: 0,
        lessonProgress: {}
      };
    }

    const totalLessons = getTotalLessons(course);
    return {
      courseId,
      lessonsCompleted: 0,
      totalLessons,
      percentComplete: 0,
      lastAccessedAt: new Date().toISOString(),
      lessonProgress: {}
    };
  }, []);

  // Get progress for a specific course
  const getCourseProgress = useCallback((courseId: string): CourseProgress => {
    return progress[courseId] || initializeCourseProgress(courseId);
  }, [progress, initializeCourseProgress]);

  // Mark a lesson as completed
  const markLessonCompleted = useCallback(async (
    courseId: string, 
    lessonId: string, 
    timeSpentMinutes: number = 0
  ) => {
    const course = getCourseContentById(courseId);
    if (!course) {
      console.error('Course not found:', courseId);
      return;
    }

    const currentProgress = progress[courseId] || initializeCourseProgress(courseId);
    const totalLessons = getTotalLessons(course);
    
    // Check if already completed
    if (currentProgress.lessonProgress[lessonId]?.completed) {
      console.log('Lesson already completed:', lessonId);
      return;
    }

    const newLessonProgress: LessonProgress = {
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpentMinutes
    };

    const newLessonsCompleted = currentProgress.lessonsCompleted + 1;
    const newPercentComplete = Math.round((newLessonsCompleted / totalLessons) * 100);

    const updatedCourseProgress: CourseProgress = {
      ...currentProgress,
      lessonsCompleted: newLessonsCompleted,
      totalLessons,
      percentComplete: newPercentComplete,
      lastAccessedAt: new Date().toISOString(),
      lessonProgress: {
        ...currentProgress.lessonProgress,
        [lessonId]: newLessonProgress
      }
    };

    const newProgress = {
      ...progress,
      [courseId]: updatedCourseProgress
    };

    await saveProgress(newProgress);
    console.log('Marked lesson completed:', lessonId, 'Progress:', newPercentComplete, '%');
  }, [progress, initializeCourseProgress, saveProgress]);

  // Get lesson completion status
  const isLessonCompleted = useCallback((courseId: string, lessonId: string): boolean => {
    return progress[courseId]?.lessonProgress[lessonId]?.completed || false;
  }, [progress]);

  // Get module progress
  const getModuleProgress = useCallback((courseId: string, moduleId: string): ModuleProgress => {
    const result = findModuleById(moduleId);
    if (!result) {
      return { moduleId, lessonsCompleted: 0, totalLessons: 0, percentComplete: 0 };
    }

    const { module } = result;
    const courseProgress = progress[courseId];
    
    if (!courseProgress) {
      return { 
        moduleId, 
        lessonsCompleted: 0, 
        totalLessons: module.lessons.length, 
        percentComplete: 0 
      };
    }

    const lessonsCompleted = module.lessons.filter(
      lesson => courseProgress.lessonProgress[lesson.id]?.completed
    ).length;

    return {
      moduleId,
      lessonsCompleted,
      totalLessons: module.lessons.length,
      percentComplete: module.lessons.length > 0 
        ? Math.round((lessonsCompleted / module.lessons.length) * 100) 
        : 0
    };
  }, [progress]);

  // Update last accessed
  const updateLastAccessed = useCallback(async (courseId: string) => {
    const currentProgress = progress[courseId] || initializeCourseProgress(courseId);
    
    const updatedCourseProgress: CourseProgress = {
      ...currentProgress,
      lastAccessedAt: new Date().toISOString()
    };

    const newProgress = {
      ...progress,
      [courseId]: updatedCourseProgress
    };

    await saveProgress(newProgress);
  }, [progress, initializeCourseProgress, saveProgress]);

  // Reset course progress
  const resetCourseProgress = useCallback(async (courseId: string) => {
    const newProgress = { ...progress };
    delete newProgress[courseId];
    await saveProgress(newProgress);
    console.log('Reset progress for course:', courseId);
  }, [progress, saveProgress]);

  // Reset all progress
  const resetAllProgress = useCallback(async () => {
    await saveProgress({});
    console.log('Reset all course content progress');
  }, [saveProgress]);

  // Get all courses with their progress
  const coursesWithProgress = useMemo(() => {
    return allCourseContent.map(course => ({
      ...course,
      progress: getCourseProgress(course.id),
      duration: getCourseDuration(course),
      totalLessons: getTotalLessons(course)
    }));
  }, [getCourseProgress]);

  // Get recently accessed courses
  const recentCourses = useMemo(() => {
    return coursesWithProgress
      .filter(course => course.progress.lastAccessedAt)
      .sort((a, b) => {
        const dateA = a.progress.lastAccessedAt ? new Date(a.progress.lastAccessedAt).getTime() : 0;
        const dateB = b.progress.lastAccessedAt ? new Date(b.progress.lastAccessedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [coursesWithProgress]);

  // Get in-progress courses
  const inProgressCourses = useMemo(() => {
    return coursesWithProgress.filter(
      course => course.progress.percentComplete > 0 && course.progress.percentComplete < 100
    );
  }, [coursesWithProgress]);

  // Get completed courses
  const completedCourses = useMemo(() => {
    return coursesWithProgress.filter(course => course.progress.percentComplete === 100);
  }, [coursesWithProgress]);

  return useMemo(() => ({
    // Data
    allCourses: allCourseContent,
    coursesWithProgress,
    recentCourses,
    inProgressCourses,
    completedCourses,
    isLoading,

    // Getters
    getCourseById: getCourseContentById,
    findLessonById,
    findModuleById,
    getCourseProgress,
    getModuleProgress,
    isLessonCompleted,
    getCourseDuration,
    getTotalLessons,

    // Actions
    markLessonCompleted,
    updateLastAccessed,
    resetCourseProgress,
    resetAllProgress
  }), [
    coursesWithProgress,
    recentCourses,
    inProgressCourses,
    completedCourses,
    isLoading,
    getCourseProgress,
    getModuleProgress,
    isLessonCompleted,
    markLessonCompleted,
    updateLastAccessed,
    resetCourseProgress,
    resetAllProgress
  ]);
});

// Re-export types for convenience
export type { CourseContent, Module, Lesson };
