import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as db from '@/lib/database';
import { Database } from '@/lib/database.types';
import type { Gymnasium } from '@/constants/gymnasiums';
import type { AvatarConfig } from '@/components/AvatarCustomizer';
import { getSelectedCoursesData } from '@/constants/gymnasium-courses';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';

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
      
      // Always work in offline mode for now to avoid database issues
      console.log('Working in offline mode');
      
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
      
    } catch (error) {
      console.error('Error loading user data:', error instanceof Error ? error.message : String(error));
      setUser(null);
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

      console.log('Starting offline onboarding for user:', authUser.id);
      
      // Always work in offline mode for now
      console.log('Setting up local user data');
      
      // Set up local user data
      const localUser: User = {
        ...userData,
        id: authUser.id,
        onboardingCompleted: true
      };
      
      setUser(localUser);
      
      // Create local courses based on selection or defaults
      let localCourses: Course[];
      
      if (userData.selectedCourses && userData.selectedCourses.length > 0 && userData.gymnasium) {
        // Use selected courses
        const selectedCoursesData = getSelectedCoursesData(
          userData.selectedCourses, 
          userData.gymnasium
        );
        
        localCourses = selectedCoursesData.map((courseData, index) => ({
          id: `local-selected-${index}`,
          title: courseData.title,
          description: courseData.description,
          subject: courseData.subject,
          level: 'gymnasie',
          progress: 0,
          isActive: index === 0,
          resources: courseData.resources,
          tips: courseData.tips,
          relatedCourses: []
        }));
      } else {
        // Use default sample courses
        localCourses = userData.studyLevel === 'gymnasie' ? [
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
      }
      
      setCourses(localCourses);
      setNotes([]);
      setPomodoroSessions([]);
      
      // Mark onboarding as completed locally
      await setOnboardingCompleted();
      console.log('Local onboarding completed successfully');
      
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
      if (!authUser) return;
      
      // Create local pomodoro session
      const localSession: PomodoroSession = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: session.courseId,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime
      };
      
      setPomodoroSessions(prev => [localSession, ...prev]);
      console.log('Pomodoro session created locally');
      
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