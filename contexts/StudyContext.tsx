import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, testDatabaseConnection } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import type { Gymnasium } from '@/constants/gymnasiums';
import type { AvatarConfig } from '@/constants/avatar-config';
import { getSelectedCoursesData } from '@/constants/gymnasium-courses';
import { assignCoursesAfterOnboarding, assignUniversityCoursesToUser } from '@/lib/course-assignment';

// Old functions removed - now using assignCoursesAfterOnboarding from lib/course-assignment.ts

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
  gymnasiumGrade?: string | null;
  universityYear?: string | null;
  dailyGoalHours?: number;
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
  completeOnboarding: (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[]; dailyGoalHours?: number; gymnasiumGrade?: string | null; universityYear?: string | null; universityProgramId?: string }) => Promise<void>;
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
  } : null,
  gymnasiumGrade: dbUser.gymnasium_grade,
  universityYear: null
});

// Helper to convert user to database format (kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userToDbUser = (user: Partial<User> & { id: string }): Database['public']['Tables']['profiles']['Insert'] => ({
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
        
        setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(localUser)) return prev;
        return localUser;
      });
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
        
        setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(localUser)) return prev;
        return localUser;
      });
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        return;
      }
      
      // Convert database profile to user
      const user = dbUserToUser(profile, userEmail);
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(user)) return prev;
        return user;
      });
      
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
      
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(localUser)) return prev;
        return localUser;
      });
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

  const completeOnboarding = useCallback(async (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[]; dailyGoalHours?: number; gymnasiumGrade?: string | null; universityYear?: string | null; universityProgramId?: string }) => {
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
            gymnasium_grade: userData.gymnasiumGrade || null,
            daily_goal_hours: userData.dailyGoalHours || 2
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
      
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(completedUser)) return prev;
        return completedUser;
      });
      
      // Create courses based on selection or defaults
      let courses: Course[];
      
      if (userData.studyLevel === 'gymnasie' && userData.selectedCourses && userData.selectedCourses.length > 0 && userData.gymnasium) {
        console.log('Creating gymnasium courses from selected courses:', userData.selectedCourses);
        // Use selected courses for gymnasium
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
      } else if (userData.studyLevel === 'högskola') {
        // Use the new course assignment system for university
        console.log('Assigning university courses using new system');
        console.log('University program ID:', userData.universityProgramId);
        console.log('University term:', userData.universityYear);
        
        if (userData.universityProgramId && userData.universityYear) {
          try {
            const term = parseInt(userData.universityYear, 10);
            
            // Try the dedicated university course assignment first
            let assignedCourses = await assignUniversityCoursesToUser(
              authUser.id,
              userData.universityProgramId,
              term
            );
            
            // Fallback to generic assignment if no courses were assigned
            if (assignedCourses.length === 0) {
              console.log('Falling back to generic course assignment');
              assignedCourses = await assignCoursesAfterOnboarding({
                userId: authUser.id,
                educationLevel: 'hogskola',
                educationYear: term,
                universityProgramId: userData.universityProgramId,
              });
            }
            
            console.log(`✅ Successfully assigned ${assignedCourses.length} university courses`);
            
            // Convert assigned courses to Course format for local state
            courses = assignedCourses.map((course, index) => ({
              id: course.courseId,
              title: course.title,
              description: course.description,
              subject: course.subject,
              level: 'högskola',
              progress: 0,
              isActive: index < 4, // First 4 courses are active
              resources: ['Kursmaterial', 'Övningsuppgifter'],
              tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
              relatedCourses: []
            }));
          } catch (error) {
            console.error('Error assigning university courses:', error);
            // Fall back to empty courses
            courses = [];
          }
        } else {
          console.warn('Missing universityProgramId or universityYear, cannot assign courses');
          courses = [];
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
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(updatedUser)) return prev;
        return updatedUser;
      });
      console.log('User updated locally:', updatedUser.name);
      
      // Sync to database
      const dbConnected = await testDatabaseConnection();
      if (dbConnected) {
        console.log('Syncing user updates to database...');
        
        const dbUpdates: Record<string, any> = {};
        
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.username !== undefined) dbUpdates.username = updates.username;
        if (updates.program !== undefined) dbUpdates.program = updates.program;
        if (updates.purpose !== undefined) dbUpdates.purpose = updates.purpose;
        if (updates.studyLevel !== undefined) dbUpdates.level = updates.studyLevel;
        if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar ? JSON.stringify(updates.avatar) : null;
        if (updates.gymnasium !== undefined) {
          dbUpdates.gymnasium_id = updates.gymnasium?.id || null;
          dbUpdates.gymnasium_name = updates.gymnasium?.name || null;
        }
        if (updates.gymnasiumGrade !== undefined) dbUpdates.gymnasium_grade = updates.gymnasiumGrade;
        if (updates.dailyGoalHours !== undefined) dbUpdates.daily_goal_hours = updates.dailyGoalHours;
        
        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', authUser.id);
          
          if (error) {
            console.error('Error syncing user to database:', error);
          } else {
            console.log('✅ User synced to database successfully');
          }
        }
      }
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
          
          // Note: user_progress is automatically updated by the database trigger
          // 'sync_points_on_session_insert' after pomodoro_sessions insert
          // So we don't need to manually update it here to avoid duplication
          try {
            console.log('✅ Pomodoro session saved - user_progress will be updated by database trigger');
            
            // Just log the points earned for user feedback
            const pointsEarned = session.duration;
            console.log(`🎯 Points earned: +${pointsEarned} pts (${session.duration} min of study)`);
            
            // Wait a moment for the trigger to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check for achievements using RPC directly
            try {
              console.log('🏆 Checking for new achievements...');
              const { checkAndUpdateAchievements } = await import('@/lib/database');
              const newAchievements = await checkAndUpdateAchievements(authUser.id);
              
              if (newAchievements && newAchievements.length > 0) {
                console.log(`✅ Unlocked ${newAchievements.length} new achievement(s)!`);
              } else {
                console.log('ℹ️ No new achievements unlocked');
              }
            } catch (achievementError) {
              console.warn('⚠️ Could not check achievements:', achievementError);
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
