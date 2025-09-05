import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as db from '@/lib/database';
import { Database } from '@/lib/database.types';
import type { Gymnasium } from '@/constants/gymnasiums';
import type { AvatarConfig } from '@/components/AvatarCustomizer';

type DbUser = Database['public']['Tables']['profiles']['Row'];

type DbNote = Database['public']['Tables']['notes']['Row'];
type DbPomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row'];

export interface User {
  id: string;
  name: string;
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
  completeOnboarding: (userData: Omit<User, 'id' | 'onboardingCompleted'>) => Promise<void>;
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
  email: email,
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
  id: user.id, // Use the demo auth UUID directly
  name: user.name!,
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
  const { user: authUser, isAuthenticated, isLoading: authLoading, setOnboardingCompleted } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    try {
      setIsLoading(true);
      console.log('Loading user data for:', userId);
      
      // Add timeout to prevent hanging on network issues - reduced to 8 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database request timeout')), 8000);
      });
      
      // Try to get user from database with timeout
      const getUserPromise = db.getUser(userId);
      const dbUser = await Promise.race([getUserPromise, timeoutPromise]).catch(error => {
        console.warn('Failed to get user from database:', error.message);
        if (error.message.includes('Failed to fetch') || error.message.includes('timeout') || error.name === 'TypeError') {
          console.log('Network connectivity issue - working in offline mode');
          return null;
        }
        throw error;
      });
      
      console.log('getUser result:', dbUser ? 'User found' : 'User not found or offline');
      
      if (!dbUser) {
        console.log('User not found in database or offline mode, setting up local user...');
        
        // Create a local user profile for offline mode
        const localUser: User = {
          id: userId,
          name: userEmail.split('@')[0] || 'Student',
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
      
      console.log('User found in database:', dbUser.name);
      setUser(dbUserToUser(dbUser, userEmail));
      
      // Load user's courses, notes, and sessions with individual timeouts
      const loadUserCourses = async () => {
        try {
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
          });
          return await Promise.race([db.getUserCourses(userId), timeout]);
        } catch (err: any) {
          console.warn('Failed to load user courses:', err.message);
          return [];
        }
      };
      
      const loadUserNotes = async () => {
        try {
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
          });
          return await Promise.race([db.getUserNotes(userId), timeout]);
        } catch (err: any) {
          console.warn('Failed to load user notes:', err.message);
          return [];
        }
      };
      
      const loadUserSessions = async () => {
        try {
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
          });
          return await Promise.race([db.getUserPomodoroSessions(userId), timeout]);
        } catch (err: any) {
          console.warn('Failed to load user sessions:', err.message);
          return [];
        }
      };
      
      const [userCourses, userNotes, userSessions] = await Promise.all([
        loadUserCourses(),
        loadUserNotes(),
        loadUserSessions()
      ]);
      
      console.log('Loaded user data:', {
        courses: userCourses.length,
        notes: userNotes.length,
        sessions: userSessions.length
      });
      
      setCourses(userCourses.map(dbCourseToUserCourse));
      setNotes(userNotes.map(dbNoteToNote));
      setPomodoroSessions(userSessions.map(dbSessionToSession));
      
    } catch (error) {
      console.error('Error loading user data:', error instanceof Error ? error.message : String(error));
      
      // Check if it's a network error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('timeout') || errorMessage.includes('Network connection failed')) {
        console.log('Network connectivity issue - working in offline mode');
        
        // Create a basic offline user
        const offlineUser: User = {
          id: userId,
          name: userEmail.split('@')[0] || 'Student',
          email: userEmail,
          studyLevel: 'gymnasie',
          program: 'Naturvetenskapsprogrammet',
          purpose: 'Förbättra mina studieresultat',
          onboardingCompleted: false,
          subscriptionType: 'free'
        };
        
        setUser(offlineUser);
      } else if (errorMessage.includes('PGRST116') || errorMessage.includes('not found')) {
        console.log('User not found in database, needs onboarding');
        setUser(null);
      } else {
        console.error('Database connection or other error occurred');
        setUser(null);
      }
      
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

  const completeOnboarding = useCallback(async (userData: Omit<User, 'id' | 'onboardingCompleted'>) => {
    try {
      if (!authUser) throw new Error('No authenticated user');

      console.log('Starting onboarding for user:', authUser.id);
      
      // Add timeout for database operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Onboarding timeout')), 30000);
      });
      
      const onboardingPromise = async () => {
        try {
          // Create user in database (this will check if user already exists)
          const dbUser = await db.createUser(
            userToDbUser({ ...userData, id: authUser.id })
          );
          
          console.log('User created/found in database:', dbUser.id);
          
          // Check if user already has courses (to avoid duplicates)
          const existingCourses = await db.getUserCourses(authUser.id);
          
          if (existingCourses.length === 0) {
            console.log('Creating sample courses for new user');
            
            // Create sample courses
            const sampleCourses = userData.studyLevel === 'gymnasie' ? [
              {
                title: 'Matematik 3c',
                description: 'Avancerad matematik för naturvetenskapsprogrammet',
                subject: 'Matematik',
                level: 'gymnasie',
                resources: ['Kursbok kapitel 1-5', 'Övningsuppgifter online'],
                tips: ['Öva på gamla prov regelbundet', 'Använd grafräknare effektivt'],
                related_courses: []
              },
              {
                title: 'Fysik 2',
                description: 'Mekanik, termodynamik, vågor och optik',
                subject: 'Fysik',
                level: 'gymnasie',
                resources: ['Lärobok Fysik 2', 'Laborationsrapporter'],
                tips: ['Förstå grundläggande formler', 'Rita diagram för problemlösning'],
                related_courses: []
              }
            ] : [
              {
                title: 'Linjär Algebra',
                description: 'Grundläggande linjär algebra för ingenjörer',
                subject: 'Matematik',
                level: 'högskola',
                resources: ['Kurslitteratur: Linear Algebra', 'MATLAB/Python'],
                tips: ['Öva på matrisoperationer dagligen', 'Förstå geometrisk tolkning'],
                related_courses: []
              },
              {
                title: 'Programmering Grundkurs',
                description: 'Introduktion till programmering med Python',
                subject: 'Datavetenskap',
                level: 'högskola',
                resources: ['Python dokumentation', 'Kodexempel'],
                tips: ['Öva dagligen - kod varje dag', 'Bygg egna projekt'],
                related_courses: []
              }
            ];
            
            // Create courses and add user to them
            for (let i = 0; i < sampleCourses.length; i++) {
              const courseData = sampleCourses[i];
              try {
                console.log('Creating course:', courseData.title);
                const course = await db.createCourse(courseData);
                await db.addUserToCourse(authUser.id, course.id, i === 0); // First course is active
                console.log('Created course successfully:', course.title);
              } catch (courseError: any) {
                console.error('Error creating course:', courseData.title);
                console.error('Course error details:', courseError?.message || courseError?.toString() || 'Unknown error');
                if (courseError?.code) {
                  console.error('Course error code:', courseError.code);
                }
                if (courseError?.details) {
                  console.error('Course error details:', courseError.details);
                }
                if (courseError?.hint) {
                  console.error('Course error hint:', courseError.hint);
                }
                console.error('Full course error object:', JSON.stringify(courseError, null, 2));
                // Continue with other courses even if one fails
              }
            }
            
            // Initialize user achievements
            try {
              await db.initializeUserAchievements(authUser.id);
              console.log('User achievements initialized');
            } catch (achievementError) {
              console.error('Error initializing achievements:', achievementError);
            }
          } else {
            console.log('User already has courses, skipping course creation');
          }
        } catch (dbError: any) {
          // If database operations fail, continue with local setup
          if (dbError?.message?.includes('Failed to fetch') || dbError?.message?.includes('timeout') || dbError?.name === 'TypeError') {
            console.log('Database unavailable during onboarding - setting up local user');
            
            // Set up local user data
            const localUser: User = {
              ...userData,
              id: authUser.id,
              onboardingCompleted: true
            };
            
            setUser(localUser);
            
            // Create local sample courses
            const localCourses: Course[] = userData.studyLevel === 'gymnasie' ? [
              {
                id: 'local-math-3c',
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
                id: 'local-physics-2',
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
                id: 'local-linear-algebra',
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
                id: 'local-programming',
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
            
            setCourses(localCourses);
            setNotes([]);
            setPomodoroSessions([]);
            
            // Mark onboarding as completed locally
            await setOnboardingCompleted();
            console.log('Local onboarding completed');
            return;
          }
          
          throw dbError;
        }
      };
      
      await Promise.race([onboardingPromise(), timeoutPromise]);
      
      // Mark onboarding as completed
      await setOnboardingCompleted();
      console.log('Onboarding marked as completed');
      
      // Try to create remember me session if user had requested it during login
      try {
        const { createRememberMeSession } = await import('@/lib/supabase');
        const { error: rememberError } = await createRememberMeSession(authUser.id);
        if (!rememberError) {
          console.log('Remember me session created after onboarding');
        }
      } catch (rememberError) {
        console.log('Could not create remember me session after onboarding:', rememberError);
      }
      
      // Load user data
      await loadUserData(authUser.id, authUser.email);
      console.log('User data loaded successfully');
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error?.message || error?.toString() || 'Unknown error');
      
      // If it's a network error, still complete onboarding locally
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
        console.log('Network error during onboarding - completing locally');
        await setOnboardingCompleted();
        return;
      }
      
      throw error;
    }
  }, [authUser, setOnboardingCompleted, loadUserData]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      if (!authUser || !user) return;
      
      // Create a separate function for updates that doesn't require id
      const updateData: Database['public']['Tables']['profiles']['Update'] = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.studyLevel) updateData.level = updates.studyLevel;
      if (updates.program) updateData.program = updates.program;
      if (updates.purpose) updateData.purpose = updates.purpose;
      if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar ? JSON.stringify(updates.avatar) : null;
      if (updates.subscriptionType) updateData.subscription_type = updates.subscriptionType;
      if (updates.subscriptionExpiresAt !== undefined) {
        updateData.subscription_expires_at = updates.subscriptionExpiresAt?.toISOString() || null;
      }
      
      const updatedDbUser = await db.updateUser(authUser.id, updateData);
      setUser(dbUserToUser(updatedDbUser, authUser.email));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [user, authUser]);

  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    try {
      if (!authUser) return;
      
      console.log('Creating course:', course.title);
      console.log('Creating course with data:', {
        title: course.title,
        subject: course.subject,
        level: course.level,
        hasResources: course.resources?.length > 0,
        hasTips: course.tips?.length > 0
      });
      
      // Create course in database
      const dbCourse = await db.createCourse({
        title: course.title,
        description: course.description,
        subject: course.subject,
        level: course.level,
        resources: course.resources,
        tips: course.tips,
        related_courses: course.relatedCourses
      });
      
      console.log('Course created successfully:', dbCourse.title);
      
      // Add user to course
      await db.addUserToCourse(authUser.id, dbCourse.id, course.isActive);
      
      // Reload courses
      const userCourses = await db.getUserCourses(authUser.id);
      setCourses(userCourses.map(dbCourseToUserCourse));
      
      // Check for achievements after adding a course
      try {
        await db.checkAndUpdateAchievements(authUser.id);
      } catch (achievementError) {
        console.error('Error checking achievements after adding course:', achievementError);
      }
      
    } catch (error: any) {
      console.error('Error adding course:', course.title);
      console.error('Course error details:', error?.message || error?.toString() || 'Unknown error');
      console.error('Course error code:', error?.code);
      console.error('Full course error object:', JSON.stringify(error, null, 2));
      
      // Re-throw with more context
      if (error?.message?.includes('Row Level Security')) {
        throw new Error(`Database security error: ${error.message}. Please contact support to fix the database configuration.`);
      } else if (error?.code === '42501') {
        throw new Error('Database permission error. Please contact support to fix the database configuration.');
      } else {
        throw new Error(`Failed to create course "${course.title}": ${error?.message || 'Unknown database error'}`);
      }
    }
  }, [authUser]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    try {
      if (!authUser) return;
      
      // Update user-course relationship
      if (updates.progress !== undefined) {
        await db.updateUserCourseProgress(authUser.id, id, updates.progress);
      }
      
      if (updates.isActive !== undefined) {
        await db.setActiveCourse(authUser.id, id, updates.isActive);
      }
      
      // Reload courses
      const userCourses = await db.getUserCourses(authUser.id);
      setCourses(userCourses.map(dbCourseToUserCourse));
      
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }, [authUser]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!authUser) return;
      
      // Try to save to database, but fallback to local storage if it fails
      try {
        const dbNote = await db.createNote({
          user_id: authUser.id,
          course_id: note.courseId || null,
          content: note.content
        });
        
        setNotes(prev => [dbNoteToNote(dbNote), ...prev]);
        
        // Check for achievements after adding a note
        try {
          await db.checkAndUpdateAchievements(authUser.id);
        } catch (achievementError) {
          console.error('Error checking achievements after adding note:', achievementError);
        }
      } catch (dbError: any) {
        // If database fails, create local note
        if (dbError?.message?.includes('Failed to fetch') || dbError?.message?.includes('timeout') || dbError?.name === 'TypeError') {
          console.log('Database unavailable - creating local note');
          
          const localNote: Note = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            courseId: note.courseId,
            content: note.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setNotes(prev => [localNote, ...prev]);
        } else {
          throw dbError;
        }
      }
      
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }, [authUser]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const dbNote = await db.updateNote(id, {
        content: updates.content,
        course_id: updates.courseId || null
      });
      
      setNotes(prev => prev.map(note => 
        note.id === id ? dbNoteToNote(dbNote) : note
      ));
      
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await db.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, []);

  const addPomodoroSession = useCallback(async (session: Omit<PomodoroSession, 'id'>) => {
    try {
      if (!authUser) return;
      
      // Try to save to database, but fallback to local storage if it fails
      try {
        const dbSession = await db.createPomodoroSession({
          user_id: authUser.id,
          course_id: session.courseId || null,
          start_time: session.startTime,
          end_time: session.endTime,
          duration: session.duration
        });
        
        setPomodoroSessions(prev => [dbSessionToSession(dbSession), ...prev]);
        
        // Check for achievements after completing a pomodoro session
        try {
          await db.checkAndUpdateAchievements(authUser.id);
        } catch (achievementError) {
          console.error('Error checking achievements after pomodoro session:', achievementError);
        }
      } catch (dbError: any) {
        // If database fails, create local session
        if (dbError?.message?.includes('Failed to fetch') || dbError?.message?.includes('timeout') || dbError?.name === 'TypeError') {
          console.log('Database unavailable - creating local pomodoro session');
          
          const localSession: PomodoroSession = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            courseId: session.courseId,
            duration: session.duration,
            startTime: session.startTime,
            endTime: session.endTime
          };
          
          setPomodoroSessions(prev => [localSession, ...prev]);
        } else {
          throw dbError;
        }
      }
      
    } catch (error) {
      console.error('Error adding pomodoro session:', error);
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