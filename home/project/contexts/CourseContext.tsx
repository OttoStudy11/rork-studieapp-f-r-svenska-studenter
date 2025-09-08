import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';

import type { Course as ProgramCourse } from '@/constants/gymnasium-courses';

export interface Course {
  id: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  totalHours: number;
  studiedHours: number;
  lastStudied?: Date;
  createdAt: Date;
  updatedAt: Date;
  year?: 1 | 2 | 3;
  points?: number;
  mandatory?: boolean;
  category?: 'gymnasiegemensam' | 'programgemensam' | 'inriktning' | 'programfördjupning' | 'individuellt val';
}

export interface UserProfile {
  id: string;
  gymnasium?: string;
  program?: string;
  year?: 1 | 2 | 3;
  email?: string;
  name?: string;
  onboardingCompleted?: boolean;
}

const STORAGE_KEYS = {
  COURSES: '@courses',
  USER_PROFILE: '@user_profile',
  ONBOARDING_COMPLETED: '@onboarding_completed',
};

const courseColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B195', '#F67280', '#C06C84', '#6C5CE7', '#A29BFE',
];

const courseIcons = [
  'BookOpen', 'Calculator', 'Globe', 'Beaker', 'Palette',
  'Users', 'Heart', 'Briefcase', 'Code', 'Music',
  'Lightbulb', 'Cpu', 'Microscope', 'PenTool', 'Languages',
];

export const [CourseProvider, useCourses] = createContextHook(() => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load onboarding status
      const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setOnboardingCompleted(onboardingStatus === 'true');
      
      // Load user profile
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        // Load courses
        const coursesData = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
        if (coursesData) {
          const savedCourses = JSON.parse(coursesData);
          setCourses(savedCourses.map((c: any) => ({
            ...c,
            lastStudied: c.lastStudied ? new Date(c.lastStudied) : undefined,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCourses = async (newCourses: Course[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(newCourses));
      setCourses(newCourses);
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  };

  const saveProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const assignCoursesForYear = async (program: string, year: 1 | 2 | 3) => {
    try {
      const programCourses = getCoursesForProgramAndYear(program, year);
      
      const newCourses: Course[] = programCourses.map((course: ProgramCourse, index: number) => ({
        id: `${course.code}-${Date.now()}-${index}`,
        name: course.name,
        code: course.code,
        color: courseColors[index % courseColors.length],
        icon: courseIcons[index % courseIcons.length],
        totalHours: Math.ceil(course.points / 10), // Estimate hours based on points
        studiedHours: 0,
        year: course.year,
        points: course.points,
        mandatory: course.mandatory,
        category: course.category,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      await saveCourses(newCourses);
      return newCourses;
    } catch (error) {
      console.error('Error assigning courses:', error);
      return [];
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = userProfile 
      ? { ...userProfile, ...updates }
      : { id: `user-${Date.now()}`, ...updates } as UserProfile;
    
    await saveProfile(updatedProfile);
    
    // If program or year changed, update courses
    if ((updates.program || updates.year) && updatedProfile.program && updatedProfile.year) {
      await assignCoursesForYear(updatedProfile.program, updatedProfile.year);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setOnboardingCompleted(true);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.COURSES
    ]);
    setOnboardingCompleted(false);
    setUserProfile(null);
    setCourses([]);
  };

  const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'studiedHours'>) => {
    const newCourse: Course = {
      ...course,
      id: `custom-${Date.now()}`,
      studiedHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedCourses = [...courses, newCourse];
    await saveCourses(updatedCourses);
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(course =>
      course.id === id
        ? { ...course, ...updates, updatedAt: new Date() }
        : course
    );
    await saveCourses(updatedCourses);
  };

  const deleteCourse = async (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    await saveCourses(updatedCourses);
  };

  const logStudyTime = async (courseId: string, hours: number) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId
        ? {
            ...course,
            studiedHours: course.studiedHours + hours,
            lastStudied: new Date(),
            updatedAt: new Date(),
          }
        : course
    );
    await saveCourses(updatedCourses);
  };

  // Computed values
  const coursesByYear = useMemo(() => {
    const grouped: { [key: number]: Course[] } = { 1: [], 2: [], 3: [] };
    courses.forEach(course => {
      if (course.year) {
        grouped[course.year].push(course);
      }
    });
    return grouped;
  }, [courses]);

  const mandatoryCourses = useMemo(() => 
    courses.filter(c => c.mandatory),
    [courses]
  );

  const electiveCourses = useMemo(() => 
    courses.filter(c => !c.mandatory),
    [courses]
  );

  const totalStudyHours = useMemo(() => 
    courses.reduce((sum, c) => sum + c.studiedHours, 0),
    [courses]
  );

  const totalRequiredHours = useMemo(() => 
    courses.reduce((sum, c) => sum + c.totalHours, 0),
    [courses]
  );

  const completionPercentage = useMemo(() => 
    totalRequiredHours > 0 ? (totalStudyHours / totalRequiredHours) * 100 : 0,
    [totalStudyHours, totalRequiredHours]
  );

  return {
    // State
    courses,
    userProfile,
    isLoading,
    onboardingCompleted,
    
    // Actions
    updateUserProfile,
    assignCoursesForYear,
    addCourse,
    updateCourse,
    deleteCourse,
    logStudyTime,
    completeOnboarding,
    resetOnboarding,
    
    // Computed
    coursesByYear,
    mandatoryCourses,
    electiveCourses,
    totalStudyHours,
    totalRequiredHours,
    completionPercentage,
  };
});