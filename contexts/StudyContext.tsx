import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, testDatabaseConnection } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import type { Gymnasium } from '@/constants/gymnasiums';
import type { AvatarConfig } from '@/constants/avatar-config';
import { getSelectedCoursesData } from '@/constants/gymnasium-courses';

type DbUser = Database['public']['Tables']['profiles']['Row'];

type DbNote = Database['public']['Tables']['notes']['Row'];
type DbPomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row'];

export interface User {
  id: string;
  name: string;
  username: string;
  displayName: string;
  email: string;
  studyLevel: 'gymnasie' | 'högskola';
  program: string;
  purpose: string;
  avatar?: AvatarConfig;
  onboardingCompleted: boolean;
  subscriptionType: 'free' | 'premium';
  subscriptionExpiresAt?: Date;
  gymnasium?: Gymnasium | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: 'gymnasie' | 'högskola';
  progress: number;
  isActive: boolean;
  resources: string[];
  tips: string[];
  relatedCourses: string[];
}

export interface Note {
  id: string;
  courseId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  courseId?: string;
  duration: number;
  startTime: string;
  endTime: string;
}

export interface StudyContextType {
  user: User | null;
  courses: Course[];
  notes: Note[];
  pomodoroSessions: PomodoroSession[];
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User actions
  completeOnboarding: (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[] }) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Pomodoro actions
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => Promise<void>;
}

// Helper functions to convert between database and app types
const dbUserToUser = (dbUser: DbUser, email: string): User => ({
  id: dbUser.id,
  name: dbUser.name,
  username: dbUser.username,
  displayName: dbUser.display_name,
  email: dbUser.email ?? email,
  studyLevel: dbUser.level as 'gymnasie' | 'högskola',
  program: dbUser.program,
  purpose: dbUser.purpose,
  avatar: dbUser.avatar_url ? JSON.parse(dbUser.avatar_url) : undefined,
  onboardingCompleted: true,
  subscriptionType: dbUser.subscription_type as 'free' | 'premium',
  subscriptionExpiresAt: dbUser.subscription_expires_at ? new Date(dbUser.subscription_expires_at) : undefined,
  gymnasium: dbUser.gymnasium_id && dbUser.gymnasium_name ? {
    id: dbUser.gymnasium_id,
    name: dbUser.gymnasium_name,
    city: '',
    municipality: '',
    type: 'kommunal'
  } : null
});

const userToDbUser = (user: Partial<User> & { id: string }): Database['public']['Tables']['profiles']['Insert'] => ({
  id: user.id,
  name: user.name!,
  username: user.username!,
  display_name: user.displayName!,
  email: user.email ?? null,
  level: user.studyLevel!,
  program: user.program!,
  purpose: user.purpose!,
  avatar_url: user.avatar ? JSON.stringify(user.avatar) : null,
  subscription_type: user.subscriptionType || 'free',
  subscription_expires_at: user.subscriptionExpiresAt?.toISOString() || null,
  gymnasium_id: user.gymnasium?.id || null,
  gymnasium_name: user.gymnasium?.name || null
});

const dbCourseToUserCourse = (dbCourse: any): Course => ({
  id: dbCourse.courses.id,
  title: dbCourse.courses.title,
  description: dbCourse.courses.description,
  subject: dbCourse.courses.subject,
  level: dbCourse.courses.level as 'gymnasie' | 'högskola',
  progress: dbCourse.progress,
  isActive: dbCourse.is_active,
  resources: Array.isArray(dbCourse.courses.resources) ? dbCourse.courses.resources : [],
  tips: Array.isArray(dbCourse.courses.tips) ? dbCourse.courses.tips : [],
  relatedCourses: Array.isArray(dbCourse.courses.related_courses) ? dbCourse.courses.related_courses : []
});

const dbNoteToNote = (dbNote: DbNote): Note => ({
  id: dbNote.id,
  courseId: dbNote.course_id || undefined,
  content: dbNote.content,
  createdAt: dbNote.created_at,
  updatedAt: dbNote.updated_at
});

const dbSessionToSession = (dbSession: DbPomodoroSession): PomodoroSession => ({
  id: dbSession.id,
  courseId: dbSession.course_id || undefined,
  duration: dbSession.duration,
  startTime: dbSession.start_time,
  endTime: dbSession.end_time
});

export const [StudyProvider, useStudy] = createContextHook(() => {
  const authContext = useAuth();
  
  // Add safety check for auth context
  if (!authContext) {
    console.error('StudyContext: AuthContext is not available');
    // Return a minimal context to prevent crashes
    return {
      user: null,
      courses: [],
      notes: [],
      pomodoroSessions: [],
      isLoading: false,
      isAuthenticated: false,
      completeOnboarding: async () => {},
      updateUser: async () => {},
      addCourse: async () => {},
      updateCourse: async () => {},
      addNote: async () => {},
      updateNote: async () => {},
      deleteNote: async () => {},
      addPomodoroSession: async () => {}
    };
  }
  
  const { user: authUser, isAuthenticated, isLoading: authLoading, setOnboardingCompleted } = authContext;
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    try {
      setIsLoading(true);
      console.log('Loading user data for:', userId);
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        console.warn('Database not available, working in offline mode');
        
        // Create a local user profile for offline mode
        const emailPrefix = userEmail.split('@')[0] || 'Student';
        const localUser: User = {
          id: userId,
          name: emailPrefix,
          username: emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          displayName: emailPrefix,
          email: userEmail,
          studyLevel: 'gymnasie',
          program: 'Naturvetenskapsprogrammet',
          purpose: 'Förbättra mina studieresultat',
          onboardingCompleted: false,
          subscriptionType: 'free'
        };
        
        setUser(localUser);
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        return;
      }
      
      // Try to load user data from database
      console.log('Loading user data from database');
      
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.warn('Could not load user profile from database, using local data');
        
        // Create a basic user profile
        const emailPrefix = userEmail.split('@')[0] || 'Student';
        const localUser: User = {
          id: userId,
          name: emailPrefix,
          username: emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          displayName: emailPrefix,
          email: userEmail,
          studyLevel: 'gymnasie',
          program: '',
          purpose: '',
          onboardingCompleted: false,
          subscriptionType: 'free'
        };
        
        setUser(localUser);
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        return;
      }
      
      // Convert database profile to user
      const user = dbUserToUser(profile, userEmail);
      setUser(user);
      
      // Load user courses
      const { data: userCourses, error: coursesError } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', userId);
      
      if (!coursesError && userCourses) {
        const courses = userCourses.map(dbCourseToUserCourse);
        setCourses(courses);
      } else {
        console.warn('Could not load courses:', coursesError?.message);
        setCourses([]);
      }
      
      // Load user notes
      const { data: userNotes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!notesError && userNotes) {
        const notes = userNotes.map(dbNoteToNote);
        setNotes(notes);
      } else {
        console.warn('Could not load notes:', notesError?.message);
        setNotes([]);
      }
      
      // Load pomodoro sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(50);
      
      if (!sessionsError && sessions) {
        const pomodoroSessions = sessions.map(dbSessionToSession);
        setPomodoroSessions(pomodoroSessions);
      } else {
        console.warn('Could not load pomodoro sessions:', sessionsError?.message);
        setPomodoroSessions([]);
      }
      
      console.log('User data loaded successfully from database');
      
    } catch (error) {
      console.error('Error loading user data:', error instanceof Error ? error.message : String(error));
      
      // Fallback to local user
      const emailPrefix = userEmail.split('@')[0] || 'Student';
      const localUser: User = {
        id: userId,
        name: emailPrefix,
        username: emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        displayName: emailPrefix,
        email: userEmail,
        studyLevel: 'gymnasie',
        program: '',
        purpose: '',
        onboardingCompleted: false,
        subscriptionType: 'free'
      };
      
      setUser(localUser);
      setCourses([]);
      setNotes([]);
      setPomodoroSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    if (!authLoading) {
      if (isAuthenticated && authUser) {
        // Load user data regardless of onboarding status
        // This ensures we have user data available
        loadUserData(authUser.id, authUser.email);
        
        // Fallback timeout to ensure loading doesn't get stuck
        timeoutId = setTimeout(() => {
          console.warn('StudyContext loading timeout - forcing loading to false');
          setIsLoading(false);
        }, 12000); // 12 second fallback timeout
      } else {
        setUser(null);
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        setIsLoading(false);
      }
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [authUser, isAuthenticated, authLoading, loadUserData]);

  const completeOnboarding = useCallback(async (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[] }) => {
    try {
      if (!authUser) throw new Error('No authenticated user');

      console.log('Starting onboarding for user:', authUser.id);
      
      // Test database connection
      const dbConnected = await testDatabaseConnection();
      
      if (dbConnected) {
        console.log('Saving onboarding data to database');
        
        // Update user profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            name: userData.name,
            username: userData.username,
            display_name: userData.displayName,
            email: userData.email,
            level: userData.studyLevel,
            program: userData.program,
            purpose: userData.purpose,
            avatar_url: userData.avatar ? JSON.stringify(userData.avatar) : null,
            subscription_type: userData.subscriptionType || 'free',
            gymnasium_id: userData.gymnasium?.id || null,
            gymnasium_name: userData.gymnasium?.name || null,
            gymnasium_grade: userData.gymnasium ? '1' : null // Default grade
          });
        
        if (profileError) {
          console.warn('Could not save profile to database:', profileError.message);
          // Continue with local storage
        } else {
          console.log('Profile saved to database successfully');
        }
      }
      
      // Set up user data locally
      const completedUser: User = {
        ...userData,
        id: authUser.id,
        onboardingCompleted: true
      };
      
      setUser(completedUser);
      
      // Create courses based on selection or defaults
      let courses: Course[];
      
      if (userData.selectedCourses && userData.selectedCourses.length > 0 && userData.gymnasium) {
        console.log('Creating courses from selected courses:', userData.selectedCourses);
        // Use selected courses
        const selectedCoursesData = getSelectedCoursesData(
          userData.selectedCourses, 
          userData.gymnasium
        );
        
        console.log('Selected courses data:', selectedCoursesData.length, 'courses');
        
        courses = selectedCoursesData.map((courseData, index) => ({
          id: courseData.code,
          title: courseData.title,
          description: courseData.description,
          subject: courseData.subject,
          level: 'gymnasie',
          progress: 0,
          isActive: true,
          resources: courseData.resources,
          tips: courseData.tips,
          relatedCourses: []
        }));
        
        // Sync courses to Supabase
        if (dbConnected) {
          console.log('Syncing courses to Supabase...');
          try {
            // First, ensure all courses exist in the courses table
            for (const courseData of selectedCoursesData) {
              const { data: existingCourse } = await supabase
                .from('courses')
                .select('id')
                .eq('id', courseData.code)
                .single();
              
              if (!existingCourse) {
                console.log('Creating course in database:', courseData.code);
                const { error: insertError } = await supabase
                  .from('courses')
                  .insert({
                    id: courseData.code,
                    course_code: courseData.code,
                    title: courseData.title,
                    description: courseData.description,
                    subject: courseData.subject,
                    level: 'gymnasie',
                    points: courseData.points,
                    resources: courseData.resources,
                    tips: courseData.tips,
                    related_courses: [],
                    progress: 0
                  });
                
                if (insertError) {
                  console.error('Error inserting course:', insertError);
                }
              }
            }
            
            // Then, create user_courses entries
            for (const courseData of selectedCoursesData) {
              const { error } = await supabase
                .from('user_courses')
                .upsert({
                  id: `${authUser.id}-${courseData.code}`,
                  user_id: authUser.id,
                  course_id: courseData.code,
                  progress: 0,
                  is_active: true
                }, {
                  onConflict: 'id'
                });
              
              if (error) {
                console.error('Error syncing user course:', error);
              }
            }
            
            console.log('Successfully synced', selectedCoursesData.length, 'courses to Supabase');
          } catch (error) {
            console.error('Error syncing courses to Supabase:', error);
          }
        }
      } else {
        // Use default sample courses
        courses = userData.studyLevel === 'gymnasie' ? [
        {
          id: 'course-math-3c',
          title: 'Matematik 3c',
          description: 'Avancerad matematik för naturvetenskapsprogrammet',
          subject: 'Matematik',
          level: 'gymnasie',
          progress: 0,
          isActive: true,
          resources: ['Kursbok kapitel 1-5', 'Övningsuppgifter online'],
          tips: ['Öva på gamla prov regelbundet', 'Använd grafräknare effektivt'],
          relatedCourses: []
        },
        {
          id: 'course-physics-2',
          title: 'Fysik 2',
          description: 'Mekanik, termodynamik, vågor och optik',
          subject: 'Fysik',
          level: 'gymnasie',
          progress: 0,
          isActive: false,
          resources: ['Lärobok Fysik 2', 'Laborationsrapporter'],
          tips: ['Förstå grundläggande formler', 'Rita diagram för problemlösning'],
          relatedCourses: []
        }
      ] : [
        {
          id: 'course-linear-algebra',
          title: 'Linjär Algebra',
          description: 'Grundläggande linjär algebra för ingenjörer',
          subject: 'Matematik',
          level: 'högskola',
          progress: 0,
          isActive: true,
          resources: ['Kurslitteratur: Linear Algebra', 'MATLAB/Python'],
          tips: ['Öva på matrisoperationer dagligen', 'Förstå geometrisk tolkning'],
          relatedCourses: []
        },
        {
          id: 'course-programming',
          title: 'Programmering Grundkurs',
          description: 'Introduktion till programmering med Python',
          subject: 'Datavetenskap',
          level: 'högskola',
          progress: 0,
          isActive: false,
          resources: ['Python dokumentation', 'Kodexempel'],
          tips: ['Öva dagligen - kod varje dag', 'Bygg egna projekt'],
          relatedCourses: []
        }
        ];
      }
      
      setCourses(courses);
      setNotes([]);
      setPomodoroSessions([]);
      
      // Mark onboarding as completed
      await setOnboardingCompleted();
      console.log('Onboarding completed successfully');
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error?.message || error?.toString() || 'Unknown error');
      throw error;
    }
  }, [authUser, setOnboardingCompleted]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      if (!authUser || !user) return;
      
      // Update user locally
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      console.log('User updated locally:', updatedUser.name);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [user, authUser]);

  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    try {
      if (!authUser) return;
      
      console.log('Creating local course:', course.title);
      
      // Create course locally
      const localCourse: Course = {
        ...course,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setCourses(prev => [...prev, localCourse]);
      console.log('Course created locally:', localCourse.title);
      
    } catch (error: any) {
      console.error('Error adding course:', course.title, error);
      throw error;
    }
  }, [authUser]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    try {
      if (!authUser) return;
      
      // Update course locally
      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, ...updates } : course
      ));
      
      console.log('Course updated locally:', id);
      
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }, [authUser]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!authUser) return;
      
      // Create local note
      const localNote: Note = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: note.courseId,
        content: note.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setNotes(prev => [localNote, ...prev]);
      console.log('Note created locally');
      
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }, [authUser]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      // Update note locally
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ));
      
      console.log('Note updated locally:', id);
      
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      // Delete note locally
      setNotes(prev => prev.filter(note => note.id !== id));
      console.log('Note deleted locally:', id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, []);

  const addPomodoroSession = useCallback(async (session: Omit<PomodoroSession, 'id'>) => {
    try {
      if (!authUser) {
        console.error('Cannot add pomodoro session: No authenticated user');
        return;
      }
      
      console.log('Adding pomodoro session for user:', authUser.id);
      console.log('Session details:', { duration: session.duration, courseId: session.courseId });
      
      // Test database connection
      const dbConnected = await testDatabaseConnection();
      
      if (dbConnected) {
        console.log('Database connected, saving pomodoro session');
        
        // Save to database
        const { data, error } = await supabase
          .from('pomodoro_sessions')
          .insert({
            user_id: authUser.id,
            course_id: session.courseId || null,
            duration: session.duration,
            start_time: session.startTime,
            end_time: session.endTime
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ Error saving pomodoro session to database:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        if (data) {
          console.log('✅ Pomodoro session saved to database with ID:', data.id);
          
          // Add to local state with database ID
          const dbSession: PomodoroSession = {
            id: data.id,
            courseId: data.course_id || undefined,
            duration: data.duration,
            startTime: data.start_time,
            endTime: data.end_time
          };
          
          setPomodoroSessions(prev => [dbSession, ...prev]);
          console.log('✅ Pomodoro session added to local state');
          
          // Also save to study_sessions table for progress tracking
          try {
            const { data: studySessionData, error: studySessionError } = await supabase
              .from('study_sessions')
              .insert({
                user_id: authUser.id,
                course_id: session.courseId || null,
                title: session.courseId ? 'Pomodoro Session' : 'Study Session',
                start_time: new Date(new Date(session.endTime).getTime() - session.duration * 60000).toISOString(),
                duration_minutes: session.duration,
                technique: 'pomodoro',
                completed: true,
                status: 'completed' as const,
                created_at: session.endTime
              })
              .select()
              .single();
            
            if (studySessionError) {
              console.warn('⚠️ Could not save to study_sessions:', studySessionError.message);
            } else {
              console.log('✅ Study session saved with ID:', studySessionData?.id);
            }
            
            // Update user_progress table
            console.log('Updating user_progress table...');
            const { data: existingProgress, error: progressFetchError } = await supabase
              .from('user_progress')
              .select('total_study_time, total_sessions, current_streak, last_study_date, longest_streak')
              .eq('user_id', authUser.id)
              .maybeSingle();
            
            if (progressFetchError) {
              console.warn('⚠️ Could not fetch existing progress:', progressFetchError.message);
            }
            
            console.log('Existing progress:', existingProgress);
            
            const today = new Date().toISOString().split('T')[0];
            const lastStudyDate = existingProgress?.last_study_date?.split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            let newStreak = 1;
            if (lastStudyDate === today) {
              newStreak = existingProgress?.current_streak || 1;
            } else if (lastStudyDate === yesterdayStr) {
              newStreak = (existingProgress?.current_streak || 0) + 1;
            }
            
            console.log('Calculated new streak:', newStreak);
            
            const progressUpdate = {
              user_id: authUser.id,
              total_study_time: (existingProgress?.total_study_time || 0) + session.duration,
              total_sessions: (existingProgress?.total_sessions || 0) + 1,
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, existingProgress?.longest_streak || 0),
              last_study_date: session.endTime,
              updated_at: new Date().toISOString()
            };
            
            console.log('Progress update data:', progressUpdate);
            
            const { data: updatedProgress, error: progressError } = await supabase
              .from('user_progress')
              .upsert(progressUpdate, {
                onConflict: 'user_id'
              })
              .select()
              .single();
            
            if (progressError) {
              console.error('❌ Could not update user_progress:', progressError.message);
              console.error('Progress error details:', JSON.stringify(progressError, null, 2));
            } else {
              console.log('✅ User progress updated successfully:', updatedProgress);
            }
            
            // Update course progress if a course was selected
            if (session.courseId) {
              console.log('Updating course progress for course:', session.courseId);
              const { data: userCourseData, error: userCourseError } = await supabase
                .from('user_courses')
                .select('progress')
                .eq('user_id', authUser.id)
                .eq('course_id', session.courseId)
                .maybeSingle();
              
              if (!userCourseError && userCourseData) {
                console.log('Current course progress:', userCourseData.progress);
              }
            }
          } catch (progressUpdateError) {
            console.error('❌ Exception updating progress:', progressUpdateError);
          }
          
          return;
        }
      }
      
      // Fallback: Create local pomodoro session if database is not available
      console.warn('⚠️ Database not available, creating local session');
      const localSession: PomodoroSession = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: session.courseId,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime
      };
      
      setPomodoroSessions(prev => [localSession, ...prev]);
      console.log('✅ Pomodoro session created locally');
      
    } catch (error) {
      console.error('❌ Error adding pomodoro session:', error);
      throw error;
    }
  }, [authUser]);

  const contextValue = useMemo(() => ({
    user,
    courses,
    notes,
    pomodoroSessions,
    isLoading: isLoading || authLoading,
    isAuthenticated,
    completeOnboarding,
    updateUser,
    addCourse,
    updateCourse,
    addNote,
    updateNote,
    deleteNote,
    addPomodoroSession
  }), [
    user,
    courses,
    notes,
    pomodoroSessions,
    isLoading,
    authLoading,
    isAuthenticated,
    completeOnboarding,
    updateUser,
    addCourse,
    updateCourse,
    addNote,
    updateNote,
    deleteNote,
    addPomodoroSession
  ]);

  return contextValue;
});
