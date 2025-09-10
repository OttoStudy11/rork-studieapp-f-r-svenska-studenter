import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  selectedCourses?: string[];
}

const getStorageKeys = (userId: string) => ({
  COURSES: `@courses_${userId}`,
  USER_PROFILE: `@user_profile_${userId}`,
  ONBOARDING_COMPLETED: `@onboarding_completed_${userId}`,
});

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
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const STORAGE_KEYS = getStorageKeys(user.id);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Course data loading timeout')), 8000);
      });
      
      const loadPromise = (async () => {
        // First try to load from database
        let profileFromDb = null;
        try {
          const { data: dbProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && dbProfile) {
            profileFromDb = {
              id: dbProfile.id,
              email: dbProfile.email || undefined,
              name: dbProfile.name || undefined,
              gymnasium: (dbProfile as any).gymnasium || undefined,
              program: (dbProfile as any).program || undefined,
              year: (dbProfile as any).year as (1 | 2 | 3) || undefined,
              selectedCourses: (dbProfile as any).selected_courses ? JSON.parse((dbProfile as any).selected_courses as string) : undefined
            };
            console.log('Loaded profile from database for user:', user.id, profileFromDb);
          }
        } catch (dbError) {
          console.log('Could not load profile from database:', dbError);
        }
        
        // Load onboarding status from AsyncStorage (since it's not in database)
        const localOnboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        const onboardingStatus = localOnboardingStatus === 'true';
        console.log('Loading onboarding status from AsyncStorage:', onboardingStatus);
        
        // If we have a complete profile from database, consider onboarding completed
        const hasCompleteProfile = profileFromDb && profileFromDb.name && profileFromDb.gymnasium && profileFromDb.program && profileFromDb.year;
        const finalOnboardingStatus = onboardingStatus || hasCompleteProfile;
        
        setOnboardingCompleted(finalOnboardingStatus);
        
        // Update AsyncStorage if database profile indicates completion but local storage doesn't
        if (hasCompleteProfile && !onboardingStatus) {
          await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
          console.log('Updated onboarding status to completed based on complete database profile');
        }
        
        // Use database profile if available, otherwise load from AsyncStorage
        if (profileFromDb) {
          setUserProfile(profileFromDb);
          // Also save to AsyncStorage for offline access
          await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileFromDb));
        } else {
          // Fallback to AsyncStorage
          const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          console.log('Loading profile from AsyncStorage for user:', user.id, 'Has profile:', !!profileData);
          if (profileData) {
            const profile = JSON.parse(profileData);
            setUserProfile(profile);
          }
        }
        
        // Load courses from AsyncStorage first
        const coursesData = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
        if (coursesData) {
          const savedCourses = JSON.parse(coursesData);
          setCourses(savedCourses.map((c: any) => ({
            ...c,
            lastStudied: c.lastStudied ? new Date(c.lastStudied) : undefined,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })));
          console.log('Loaded', savedCourses.length, 'courses from AsyncStorage for user:', user.id);
        }
      })();
      
      await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setOnboardingCompleted(false);
      setUserProfile(null);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load data from AsyncStorage when user changes
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      // Clear data if no user
      setCourses([]);
      setUserProfile(null);
      setOnboardingCompleted(false);
      setIsLoading(false);
    }
    
    // Fallback timeout to ensure loading doesn't get stuck
    const fallbackTimeout = setTimeout(() => {
      console.log('Course context loading timeout - forcing loading to false');
      setIsLoading(false);
    }, 6000); // 6 second timeout
    
    return () => clearTimeout(fallbackTimeout);
  }, [user?.id, loadData]);

  // Generate courses if profile exists but no courses are loaded
  useEffect(() => {
    const generateCoursesIfNeeded = async () => {
      if (
        !isLoading && 
        userProfile && 
        userProfile.program && 
        userProfile.year && 
        courses.length === 0 &&
        user?.id
      ) {
        console.log('Profile exists but no courses found, generating courses:', {
          program: userProfile.program,
          year: userProfile.year,
          selectedCourses: userProfile.selectedCourses?.length || 0
        });
        
        try {
          // Generate courses directly here to avoid circular dependency
          const programCourses = getCoursesForProgramAndYear(userProfile.program, userProfile.year);
          
          // Filter courses based on selection if provided
          const coursesToAssign = userProfile.selectedCourses 
            ? programCourses.filter(course => 
                course.mandatory || userProfile.selectedCourses!.includes(course.code)
              )
            : programCourses;
          
          const newCourses: Course[] = coursesToAssign.map((course: ProgramCourse, index: number) => ({
            id: `${course.code}-${Date.now()}-${index}`,
            name: course.name,
            code: course.code,
            color: courseColors[index % courseColors.length],
            icon: courseIcons[index % courseIcons.length],
            totalHours: Math.ceil(course.points / 10),
            studiedHours: 0,
            year: course.year,
            points: course.points,
            mandatory: course.mandatory,
            category: course.category,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          
          // Save courses locally
          const STORAGE_KEYS = getStorageKeys(user.id);
          await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(newCourses));
          setCourses(newCourses);
          console.log('Generated and saved', newCourses.length, 'courses from profile data');
          
          // Sync to Supabase in background
          try {
            // First, ensure all courses exist in the courses table
            for (const course of newCourses) {
              if (course.code) {
                const { data: existingCourse } = await supabase
                  .from('courses')
                  .select('id')
                  .eq('id', course.code)
                  .single();
                
                if (!existingCourse) {
                  await supabase
                    .from('courses')
                    .insert({
                      id: course.code,
                      title: course.name,
                      description: `${course.name} - ${course.points || 0} poäng`,
                      subject: extractSubjectFromName(course.name),
                      level: 'gymnasie',
                      resources: ['Kursmaterial', 'Övningsuppgifter'],
                      tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                      related_courses: [],
                      progress: 0
                    });
                }
              }
            }
            
            // Create user_courses entries
            const userCourses = newCourses
              .filter(course => course.code)
              .map(course => ({
                user_id: user.id,
                course_id: course.code!,
                progress: 0,
                is_active: true
              }));
            
            if (userCourses.length > 0) {
              // Deactivate existing courses
              await supabase
                .from('user_courses')
                .update({ is_active: false })
                .eq('user_id', user.id);
              
              // Insert new courses
              for (const userCourse of userCourses) {
                await supabase
                  .from('user_courses')
                  .upsert({
                    ...userCourse,
                    id: `${userCourse.user_id}-${userCourse.course_id}`
                  }, {
                    onConflict: 'id'
                  });
              }
              
              console.log('Successfully synced', userCourses.length, 'courses to Supabase');
            }
          } catch (syncError) {
            console.error('Error syncing courses to Supabase:', syncError);
          }
        } catch (error) {
          console.error('Error generating courses from profile:', error);
        }
      }
    };
    
    generateCoursesIfNeeded();
  }, [isLoading, userProfile, courses.length, user?.id]);

  const saveCourses = useCallback(async (newCourses: Course[]) => {
    if (!user?.id) return;
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(newCourses));
      setCourses(newCourses);
      console.log('Saved', newCourses.length, 'courses for user:', user.id);
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  }, [user?.id]);

  const saveProfile = useCallback(async (profile: UserProfile) => {
    if (!user?.id) {
      console.error('No user ID available for profile save');
      return;
    }
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      // Ensure profile has the correct user ID
      const profileWithUserId = { ...profile, id: user.id };
      
      console.log('Saving profile for user:', user.id, profileWithUserId);
      
      // Save to AsyncStorage first for immediate UI update
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileWithUserId));
      setUserProfile(profileWithUserId);
      console.log('✅ Profile saved locally for user:', user.id);
      
      // Sync with Supabase database - this is critical for persistence
      try {
        console.log('🔄 Syncing profile to database for user:', user.id);
        
        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        const updateData: any = {
          name: profileWithUserId.name || null,
          email: profileWithUserId.email || user.email || null,
          updated_at: new Date().toISOString()
        };
        
        // Add optional columns if they exist in the profile
        if (profileWithUserId.gymnasium !== undefined) {
          updateData.gymnasium = profileWithUserId.gymnasium;
        }
        if (profileWithUserId.program !== undefined) {
          updateData.program = profileWithUserId.program;
        }
        if (profileWithUserId.year !== undefined) {
          updateData.year = profileWithUserId.year;
        }
        if (profileWithUserId.selectedCourses !== undefined) {
          updateData.selected_courses = JSON.stringify(profileWithUserId.selectedCourses);
        }
        
        let dbError;
        
        if (existingProfile) {
          // Update existing profile
          console.log('📝 Updating existing profile with data:', updateData);
          const result = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
          dbError = result.error;
        } else {
          // Insert new profile
          console.log('➕ Creating new profile with data:', { id: user.id, ...updateData });
          const result = await supabase
            .from('profiles')
            .insert({ id: user.id, ...updateData });
          dbError = result.error;
        }
        
        if (dbError) {
          console.error('❌ Error syncing profile to database:', {
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint,
            code: dbError.code
          });
        } else {
          console.log('✅ Profile successfully synced to database');
          
          // Verify the save by reading it back
          const { data: verifyProfile, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!verifyError && verifyProfile) {
            console.log('✅ Profile verification successful:', {
              name: verifyProfile.name,
              gymnasium: (verifyProfile as any).gymnasium,
              program: (verifyProfile as any).program,
              year: (verifyProfile as any).year,
              selectedCourses: (verifyProfile as any).selected_courses ? 'present' : 'null'
            });
          } else {
            console.error('❌ Profile verification failed:', verifyError);
          }
        }
      } catch (syncError) {
        console.error('❌ Exception syncing profile to database:', syncError);
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
    }
  }, [user?.id, user?.email]);

  // Helper function to extract subject from course name
  const extractSubjectFromName = (name: string): string => {
    const subjectKeywords: Record<string, string> = {
      'Engelska': 'Engelska',
      'Historia': 'Historia',
      'Idrott': 'Idrott och hälsa',
      'Matematik': 'Matematik',
      'Naturkunskap': 'Naturkunskap',
      'Religionskunskap': 'Religionskunskap',
      'Samhällskunskap': 'Samhällskunskap',
      'Svenska': 'Svenska',
      'Biologi': 'Biologi',
      'Fysik': 'Fysik',
      'Kemi': 'Kemi',
      'Teknik': 'Teknik',
      'Filosofi': 'Filosofi',
      'Psykologi': 'Psykologi',
      'Företagsekonomi': 'Företagsekonomi',
      'Juridik': 'Juridik',
      'Programmering': 'Teknik',
      'Webbutveckling': 'Teknik',
      'Spanska': 'Moderna språk',
      'Franska': 'Moderna språk',
      'Tyska': 'Moderna språk',
    };
    
    for (const [keyword, subject] of Object.entries(subjectKeywords)) {
      if (name.includes(keyword)) {
        return subject;
      }
    }
    
    return 'Övrigt';
  };

  // Sync courses to Supabase
  const syncCoursesToSupabase = useCallback(async (coursesToSync: Course[]) => {
    if (!user?.id) return;
    
    try {
      console.log('Syncing courses to Supabase for user:', user.id);
      
      // First, ensure all courses exist in the courses table
      for (const course of coursesToSync) {
        if (course.code) {
          // Check if course exists in database
          const { data: existingCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('id', course.code)
            .single();
          
          if (!existingCourse) {
            // Insert course if it doesn't exist
            const { error: insertError } = await supabase
              .from('courses')
              .insert({
                id: course.code,
                title: course.name,
                description: `${course.name} - ${course.points || 0} poäng`,
                subject: extractSubjectFromName(course.name),
                level: 'gymnasie',
                resources: ['Kursmaterial', 'Övningsuppgifter'],
                tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                related_courses: [],
                progress: 0
              });
            
            if (insertError) {
              console.error('Error inserting course:', insertError);
            }
          }
        }
      }
      
      // Then, create user_courses entries
      const userCourses = coursesToSync
        .filter(course => course.code)
        .map(course => ({
          user_id: user.id,
          course_id: course.code!,
          progress: Math.round((course.studiedHours / course.totalHours) * 100) || 0,
          is_active: true
        }));
      
      if (userCourses.length > 0) {
        // First, deactivate all existing courses for this user
        await supabase
          .from('user_courses')
          .update({ is_active: false })
          .eq('user_id', user.id);
        
        // Then insert or update the new courses
        for (const userCourse of userCourses) {
          const { error } = await supabase
            .from('user_courses')
            .upsert({
              ...userCourse,
              id: `${userCourse.user_id}-${userCourse.course_id}`
            }, {
              onConflict: 'id'
            });
          
          if (error) {
            console.error('Error syncing user course:', error);
          }
        }
        
        console.log('Successfully synced', userCourses.length, 'courses to Supabase');
      }
    } catch (error) {
      console.error('Error syncing courses to Supabase:', error);
    }
  }, [user?.id]);

  const assignCoursesForYear = useCallback(async (program: string, year: 1 | 2 | 3, selectedCourseCodes?: string[]) => {
    try {
      const programCourses = getCoursesForProgramAndYear(program, year);
      
      // Filter courses based on selection if provided
      const coursesToAssign = selectedCourseCodes 
        ? programCourses.filter(course => 
            course.mandatory || selectedCourseCodes.includes(course.code)
          )
        : programCourses;
      
      const newCourses: Course[] = coursesToAssign.map((course: ProgramCourse, index: number) => ({
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
      
      // Sync selected courses with Supabase
      if (user?.id) {
        await syncCoursesToSupabase(newCourses);
      }
      
      console.log('Assigned', newCourses.length, 'courses for', program, 'year', year);
      return newCourses;
    } catch (error) {
      console.error('Error assigning courses:', error);
      return [];
    }
  }, [saveCourses, user?.id, syncCoursesToSupabase]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      console.error('No user ID available for profile update');
      return;
    }
    
    console.log('Updating user profile with:', updates);
    
    const updatedProfile = userProfile 
      ? { ...userProfile, ...updates, id: user.id }
      : { id: user.id, ...updates } as UserProfile;
    
    console.log('Complete updated profile:', updatedProfile);
    
    // Save profile to both AsyncStorage and database
    await saveProfile(updatedProfile);
    
    // If program, year, or selectedCourses changed, update courses
    if ((updates.program || updates.year || updates.selectedCourses) && updatedProfile.program && updatedProfile.year) {
      console.log('Updating courses based on profile changes:', {
        program: updatedProfile.program,
        year: updatedProfile.year,
        selectedCourses: updatedProfile.selectedCourses?.length || 0
      });
      await assignCoursesForYear(updatedProfile.program, updatedProfile.year, updatedProfile.selectedCourses);
    }
    
    console.log('Profile update completed successfully');
  }, [user?.id, userProfile, saveProfile, assignCoursesForYear]);

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) {
      console.error('No user ID available for onboarding completion');
      return;
    }
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      
      console.log('🎯 Completing onboarding for user:', user.id);
      console.log('📋 Current profile state:', userProfile);
      
      // Save to AsyncStorage for onboarding completion
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      setOnboardingCompleted(true);
      console.log('✅ Onboarding marked as completed locally');
      
      // Ensure the profile is properly saved to database one more time
      if (userProfile) {
        console.log('🔄 Final profile sync to database during onboarding completion');
        await saveProfile(userProfile);
        
        // Also sync courses if they exist
        if (courses.length > 0) {
          console.log('🔄 Syncing courses to database during onboarding completion');
          await syncCoursesToSupabase(courses);
        }
      } else {
        console.warn('⚠️ No profile data available during onboarding completion');
      }
      
      console.log('🎉 Onboarding completion process finished');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }
  }, [user?.id, userProfile, saveProfile, courses, syncCoursesToSupabase]);

  const resetOnboarding = useCallback(async () => {
    if (!user?.id) return;
    
    const STORAGE_KEYS = getStorageKeys(user.id);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.COURSES
    ]);
    setOnboardingCompleted(false);
    setUserProfile(null);
    setCourses([]);
    console.log('Reset onboarding for user:', user.id);
  }, [user?.id]);

  const addCourse = useCallback(async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'studiedHours'>) => {
    const newCourse: Course = {
      ...course,
      id: `custom-${Date.now()}`,
      studiedHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedCourses = [...courses, newCourse];
    await saveCourses(updatedCourses);
  }, [courses, saveCourses]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(course =>
      course.id === id
        ? { ...course, ...updates, updatedAt: new Date() }
        : course
    );
    await saveCourses(updatedCourses);
  }, [courses, saveCourses]);

  const deleteCourse = useCallback(async (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    await saveCourses(updatedCourses);
  }, [courses, saveCourses]);

  const logStudyTime = useCallback(async (courseId: string, hours: number) => {
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
  }, [courses, saveCourses]);

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

  return useMemo(() => ({
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
  }), [
    courses,
    userProfile,
    isLoading,
    onboardingCompleted,
    updateUserProfile,
    assignCoursesForYear,
    addCourse,
    updateCourse,
    deleteCourse,
    logStudyTime,
    completeOnboarding,
    resetOnboarding,
    coursesByYear,
    mandatoryCourses,
    electiveCourses,
    totalStudyHours,
    totalRequiredHours,
    completionPercentage,
  ]);
});