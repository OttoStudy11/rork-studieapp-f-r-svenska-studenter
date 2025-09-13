import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getProgramId } from '../lib/program-utils';

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
  program_id?: string;
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
  const [error, setError] = useState<string | null>(null);

  // Load user data from database and AsyncStorage
  const loadCourses = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Loading courses for user:', userId);
      
      // Load from database first
      const { data: userCourses, error: coursesError } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses!inner(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (coursesError) {
        console.error('Error loading courses from database:', coursesError);
        throw coursesError;
      }
      
      if (userCourses && userCourses.length > 0) {
        console.log('📚 Found', userCourses.length, 'courses in database');
        
        const loadedCourses: Course[] = userCourses.map((uc: any, index: number) => ({
          id: uc.course_id,
          name: uc.courses.title,
          code: uc.course_id,
          color: courseColors[index % courseColors.length],
          icon: courseIcons[index % courseIcons.length],
          totalHours: Math.ceil((uc.courses.progress || 100) / 10),
          studiedHours: Math.round((uc.progress || 0) / 10),
          year: 1,
          points: 100,
          mandatory: true,
          category: 'programgemensam' as const,
          createdAt: new Date(uc.created_at),
          updatedAt: new Date(uc.updated_at),
        }));
        
        setCourses(loadedCourses);
        
        // Save to AsyncStorage for offline access
        const STORAGE_KEYS = getStorageKeys(userId);
        await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(loadedCourses));
        
        return loadedCourses;
      } else {
        console.log('📚 No courses found in database, checking AsyncStorage');
        
        // Fallback to AsyncStorage
        const STORAGE_KEYS = getStorageKeys(userId);
        const coursesData = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
        
        if (coursesData) {
          const savedCourses = JSON.parse(coursesData);
          const loadedCourses = savedCourses.map((c: any) => ({
            ...c,
            lastStudied: c.lastStudied ? new Date(c.lastStudied) : undefined,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }));
          
          setCourses(loadedCourses);
          console.log('📚 Loaded', loadedCourses.length, 'courses from AsyncStorage');
          return loadedCourses;
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setError('Failed to load courses');
      return [];
    }
  }, []);
  
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Loading profile for user:', userId);
      
      // Load from database first
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && dbProfile) {
        const profileFromDb: UserProfile = {
          id: dbProfile.id,
          email: dbProfile.email || undefined,
          name: dbProfile.name || undefined,
          gymnasium: (dbProfile as any).gymnasium || undefined,
          program: (dbProfile as any).program || undefined,
          program_id: (dbProfile as any).program_id || undefined,
          year: (dbProfile as any).year as (1 | 2 | 3) || undefined,
          selectedCourses: (dbProfile as any).selected_courses ? 
            JSON.parse((dbProfile as any).selected_courses as string) : undefined
        };
        
        console.log('👤 Loaded profile from database:', profileFromDb);
        setUserProfile(profileFromDb);
        
        // Save to AsyncStorage for offline access
        const STORAGE_KEYS = getStorageKeys(userId);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileFromDb));
        
        // Check if onboarding is completed
        const hasCompleteProfile = profileFromDb.name && profileFromDb.gymnasium && 
                                 profileFromDb.program && profileFromDb.year;
        
        if (hasCompleteProfile) {
          setOnboardingCompleted(true);
          await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        }
        
        return profileFromDb;
      } else {
        console.log('👤 No profile found in database, checking AsyncStorage');
        
        // Fallback to AsyncStorage
        const STORAGE_KEYS = getStorageKeys(userId);
        const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const onboardingData = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        
        if (profileData) {
          const profile = JSON.parse(profileData);
          setUserProfile(profile);
          console.log('👤 Loaded profile from AsyncStorage:', profile);
        }
        
        if (onboardingData === 'true') {
          setOnboardingCompleted(true);
        }
        
        return profileData ? JSON.parse(profileData) : null;
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setError('Failed to load profile');
      return null;
    }
  }, []);
  
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Starting data load for user:', user.id);
      
      // Load profile and courses in parallel
      const [profile, loadedCourses] = await Promise.all([
        loadUserProfile(user.id),
        loadCourses(user.id)
      ]);
      
      console.log('✅ Data loading completed:', {
        profile: !!profile,
        courses: loadedCourses.length,
        onboardingCompleted
      });
      
    } catch (error) {
      console.error('❌ Error in loadData:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadUserProfile, loadCourses, onboardingCompleted]);

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
                      resources: [],
                      tips: [],
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

  // Save courses to both AsyncStorage and Supabase
  const saveCourses = useCallback(async (userId: string, selectedCourses: string[]) => {
    try {
      console.log('💾 Saving courses for user:', userId, 'Courses:', selectedCourses.length);
      
      // Update profile with selected courses
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId);
      
      if (profileError) {
        console.error('❌ Error updating profile with courses:', profileError);
        throw profileError;
      }
      
      // Deactivate all existing user courses
      await supabase
        .from('user_courses')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      // Insert/activate selected courses
      for (const courseCode of selectedCourses) {
        // Ensure course exists in courses table
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('id', courseCode)
          .single();
        
        if (!existingCourse) {
          // Create course if it doesn't exist
          await supabase
            .from('courses')
            .insert({
              id: courseCode,
              title: courseCode, // Will be updated with proper name later
              description: `Course ${courseCode}`,
              subject: 'General',
              level: 'gymnasie'
            });
        }
        
        // Insert or update user_course
        await supabase
          .from('user_courses')
          .upsert({
            id: `${userId}-${courseCode}`,
            user_id: userId,
            course_id: courseCode,
            progress: 0,
            is_active: true
          }, {
            onConflict: 'id'
          });
      }
      
      console.log('✅ Successfully saved courses to database');
      
      // Reload courses to get updated data
      await loadCourses(userId);
      
    } catch (error) {
      console.error('❌ Error saving courses:', error);
      setError('Failed to save courses');
      throw error;
    }
  }, [loadCourses]);

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
          // Automatically set program_id when program is set
          const programId = getProgramId(profileWithUserId.program);
          if (programId) {
            updateData.program_id = programId;
            console.log('🔗 Setting program_id:', programId, 'for program:', profileWithUserId.program);
          } else {
            console.warn('⚠️ No program_id found for program:', profileWithUserId.program);
          }
        }
        if (profileWithUserId.program_id !== undefined) {
          updateData.program_id = profileWithUserId.program_id;
        }
        if (profileWithUserId.year !== undefined) {
          updateData.year = profileWithUserId.year;
        }
        if (profileWithUserId.selectedCourses !== undefined) {
          (updateData as any).selected_courses = JSON.stringify(profileWithUserId.selectedCourses);
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
              program_id: (verifyProfile as any).program_id,
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
                resources: [],
                tips: [],
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
      
      if (user?.id) {
        await saveCourses(user.id, newCourses.map(c => c.code!).filter(Boolean));
      }
      
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
      console.log('📚 Current courses count:', courses.length);
      
      // Save to AsyncStorage for onboarding completion
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      setOnboardingCompleted(true);
      console.log('✅ Onboarding marked as completed locally');
      
      // Ensure the profile is properly saved to database one more time
      if (userProfile) {
        console.log('🔄 Final profile sync to database during onboarding completion');
        await saveProfile(userProfile);
        
        // Generate and sync courses if profile has program/year but no courses exist
        if (userProfile.program && userProfile.year && courses.length === 0) {
          console.log('📚 Generating courses from profile during onboarding completion');
          const newCourses = await assignCoursesForYear(
            userProfile.program, 
            userProfile.year, 
            userProfile.selectedCourses
          );
          console.log('📚 Generated', newCourses.length, 'courses during onboarding completion');
        } else if (courses.length > 0) {
          console.log('🔄 Syncing existing courses to database during onboarding completion');
          await syncCoursesToSupabase(courses);
        }
        
        // Verify the data was saved correctly
        console.log('🔍 Verifying onboarding completion data...');
        const { data: verifyProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (verifyProfile) {
          console.log('✅ Profile verification successful:', {
            name: verifyProfile.name,
            gymnasium: (verifyProfile as any).gymnasium,
            program: (verifyProfile as any).program,
            program_id: (verifyProfile as any).program_id,
            year: (verifyProfile as any).year,
            selectedCourses: (verifyProfile as any).selected_courses ? 'saved' : 'missing'
          });
        }
        
        // Verify courses were saved
        const { data: userCourses } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        console.log('✅ User courses verification:', userCourses?.length || 0, 'active courses found');
      } else {
        console.warn('⚠️ No profile data available during onboarding completion');
      }
      
      console.log('🎉 Onboarding completion process finished successfully');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }
  }, [user?.id, userProfile, saveProfile, courses, syncCoursesToSupabase, assignCoursesForYear]);

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
    if (user?.id) {
      await saveCourses(user.id, updatedCourses.map(c => c.code!).filter(Boolean));
    }
  }, [courses, saveCourses, user?.id]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(course =>
      course.id === id
        ? { ...course, ...updates, updatedAt: new Date() }
        : course
    );
    if (user?.id) {
      await saveCourses(user.id, updatedCourses.map(c => c.code!).filter(Boolean));
    }
  }, [courses, saveCourses, user?.id]);

  const deleteCourse = useCallback(async (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    if (user?.id) {
      await saveCourses(user.id, updatedCourses.map(c => c.code!).filter(Boolean));
    }
  }, [courses, saveCourses, user?.id]);

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
    if (user?.id) {
      await saveCourses(user.id, updatedCourses.map(c => c.code!).filter(Boolean));
    }
  }, [courses, saveCourses, user?.id]);

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
    error,
    
    // Actions
    updateUserProfile,
    assignCoursesForYear,
    addCourse,
    updateCourse,
    deleteCourse,
    logStudyTime,
    completeOnboarding,
    resetOnboarding,
    saveCourses,
    loadCourses,
    
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
    error,
    updateUserProfile,
    assignCoursesForYear,
    addCourse,
    updateCourse,
    deleteCourse,
    logStudyTime,
    completeOnboarding,
    resetOnboarding,
    saveCourses,
    loadCourses,
    coursesByYear,
    mandatoryCourses,
    electiveCourses,
    totalStudyHours,
    totalRequiredHours,
    completionPercentage,
  ]);
});