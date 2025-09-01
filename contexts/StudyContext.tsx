import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as db from '@/lib/database';
import { Database } from '@/lib/database.types';

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
  avatar?: string;
  onboardingCompleted: boolean;
  subscriptionType: 'free' | 'premium';
  subscriptionExpiresAt?: Date;
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
  avatar: dbUser.avatar_url || undefined,
  onboardingCompleted: true,
  subscriptionType: dbUser.subscription_type as 'free' | 'premium',
  subscriptionExpiresAt: dbUser.subscription_expires_at ? new Date(dbUser.subscription_expires_at) : undefined
});

const userToDbUser = (user: Partial<User> & { id: string }): Database['public']['Tables']['profiles']['Insert'] => ({
  id: user.id, // Use the demo auth UUID directly
  name: user.name!,
  level: user.studyLevel!,
  program: user.program!,
  purpose: user.purpose!,
  avatar_url: user.avatar || null,
  subscription_type: user.subscriptionType || 'free',
  subscription_expires_at: user.subscriptionExpiresAt?.toISOString() || null
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
  const { user: authUser, isAuthenticated, isLoading: authLoading, hasCompletedOnboarding, setOnboardingCompleted } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    try {
      setIsLoading(true);
      console.log('Loading user data for:', userId);
      
      // Try to get user from database
      const dbUser = await db.getUser(userId);
      
      if (!dbUser) {
        console.log('User not found in database, needs onboarding');
        setUser(null);
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        return;
      }
      
      console.log('User found in database:', dbUser.name);
      setUser(dbUserToUser(dbUser, userEmail));
      
      // Load user's courses, notes, and sessions
      const [userCourses, userNotes, userSessions] = await Promise.all([
        db.getUserCourses(userId),
        db.getUserNotes(userId),
        db.getUserPomodoroSessions(userId)
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
      console.error('Error details:', error);
      
      // Check if it's a "not found" error vs other database errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('PGRST116') || errorMessage.includes('not found')) {
        console.log('User not found in database, needs onboarding');
      } else {
        console.error('Database connection or other error occurred');
      }
      
      // User doesn't exist in database yet, they need to complete onboarding
      setUser(null);
      setCourses([]);
      setNotes([]);
      setPomodoroSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && authUser && hasCompletedOnboarding) {
        loadUserData(authUser.id, authUser.email);
      } else {
        setUser(null);
        setCourses([]);
        setNotes([]);
        setPomodoroSessions([]);
        setIsLoading(false);
      }
    }
  }, [authUser, isAuthenticated, authLoading, hasCompletedOnboarding, loadUserData]);

  const completeOnboarding = useCallback(async (userData: Omit<User, 'id' | 'onboardingCompleted'>) => {
    try {
      if (!authUser) throw new Error('No authenticated user');

      console.log('Starting onboarding for user:', authUser.id);
      
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
            related_courses: [],
            progress: 0
          },
          {
            title: 'Fysik 2',
            description: 'Mekanik, termodynamik, vågor och optik',
            subject: 'Fysik',
            level: 'gymnasie',
            resources: ['Lärobok Fysik 2', 'Laborationsrapporter'],
            tips: ['Förstå grundläggande formler', 'Rita diagram för problemlösning'],
            related_courses: [],
            progress: 0
          }
        ] : [
          {
            title: 'Linjär Algebra',
            description: 'Grundläggande linjär algebra för ingenjörer',
            subject: 'Matematik',
            level: 'högskola',
            resources: ['Kurslitteratur: Linear Algebra', 'MATLAB/Python'],
            tips: ['Öva på matrisoperationer dagligen', 'Förstå geometrisk tolkning'],
            related_courses: [],
            progress: 0
          },
          {
            title: 'Programmering Grundkurs',
            description: 'Introduktion till programmering med Python',
            subject: 'Datavetenskap',
            level: 'högskola',
            resources: ['Python dokumentation', 'Kodexempel'],
            tips: ['Öva dagligen - kod varje dag', 'Bygg egna projekt'],
            related_courses: [],
            progress: 0
          }
        ];
        
        // Create courses and add user to them
        for (const courseData of sampleCourses) {
          try {
            const course = await db.createCourse(courseData);
            await db.addUserToCourse(authUser.id, course.id, courseData === sampleCourses[0]);
            console.log('Created course:', course.title);
          } catch (courseError) {
            console.error('Error creating course:', courseData.title, courseError);
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
      
      // Mark onboarding as completed
      await setOnboardingCompleted();
      console.log('Onboarding marked as completed');
      
      // Load user data
      await loadUserData(authUser.id, authUser.email);
      console.log('User data loaded successfully');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
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
      if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar || null;
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
      
      // Create course in database
      const dbCourse = await db.createCourse({
        title: course.title,
        description: course.description,
        subject: course.subject,
        level: course.level,
        resources: course.resources,
        tips: course.tips,
        related_courses: course.relatedCourses,
        progress: 0
      });
      
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
      
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
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