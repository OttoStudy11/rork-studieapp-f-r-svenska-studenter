import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, testDatabaseConnection } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import type { Gymnasium } from '@/constants/gymnasiums';
import type { AvatarConfig } from '@/constants/avatar-config';
import { getSelectedCoursesData } from '@/constants/gymnasium-courses';

interface UniversityCourseTemplate {
  id: string;
  title: string;
  description: string;
  subject: string;
  resources: string[];
  tips: string[];
}

// Map program names to program_id used in database
const PROGRAM_NAME_TO_ID: Record<string, string> = {
  'Civilingenjör - Datateknik': 'civ_datateknik',
  'Civilingenjör - Elektroteknik': 'civ_elektroteknik',
  'Civilingenjör - Maskinteknik': 'civ_maskinteknik',
  'Civilingenjör - Teknisk fysik': 'civ_teknisk_fysik',
  'Civilingenjör - Kemiteknik': 'civ_kemiteknik',
  'Civilingenjör - Industriell ekonomi': 'civ_industriell_ekonomi',
  'Civilingenjör - Samhällsbyggnad': 'civ_samhallsbyggnad',
  'Civilingenjör - Bioteknik': 'civ_bioteknik',
  'Högskoleingenjör - Datateknik': 'hsk_datateknik',
  'Högskoleingenjör - Elektroteknik': 'hsk_elektroteknik',
  'Högskoleingenjör - Maskinteknik': 'hsk_maskinteknik',
  'Högskoleingenjör - Byggteknik': 'hsk_byggteknik',
  'Läkarprogrammet': 'lakarprogrammet',
  'Tandläkarprogrammet': 'tandlakarprogrammet',
  'Sjuksköterskeprogrammet': 'sjukskoterskeprogrammet',
  'Fysioterapeutprogrammet': 'fysioterapeutprogrammet',
  'Psykologprogrammet': 'psykologprogrammet',
  'Kandidatprogram i biologi': 'kand_biologi',
  'Kandidatprogram i kemi': 'kand_kemi',
  'Kandidatprogram i fysik': 'kand_fysik',
  'Kandidatprogram i matematik': 'kand_matematik',
  'Kandidatprogram i datavetenskap': 'kand_datavetenskap',
  'Juristprogrammet': 'juristprogrammet',
  'Ekonomprogrammet': 'ekonomprogrammet',
  'Civilekonomprogrammet': 'civilekonomprogrammet',
  'Socionomprogrammet': 'socionomprogrammet',
  'Politices kandidatprogram': 'politices_kandidat',
  'Kandidatprogram i statsvetenskap': 'kand_statsvetenskap',
  'Kandidatprogram i sociologi': 'kand_sociologi',
  'Kandidatprogram i historia': 'kand_historia',
  'Kandidatprogram i filosofi': 'kand_filosofi',
  'Kandidatprogram i litteraturvetenskap': 'kand_litteraturvetenskap',
  'Kandidatprogram i språkvetenskap': 'kand_sprakvetenskap',
  'Förskollärarprogrammet': 'forskollararprogrammet',
  'Grundlärarprogrammet F-3': 'grundlararprogrammet_f3',
  'Grundlärarprogrammet 4-6': 'grundlararprogrammet_46',
  'Ämneslärarprogrammet 7-9': 'amneslararprogrammet_79',
  'Ämneslärarprogrammet gymnasiet': 'amneslararprogrammet_gym',
  'Journalistprogrammet': 'journalistprogrammet',
  'Medie- och kommunikationsvetenskap': 'medie_kommunikation',
  'Systemvetenskap': 'systemvetenskap',
  'Business and Economics': 'business_economics',
  'International Business': 'international_business',
  'Företagsekonomi': 'foretagsekonomi',
  'Veterinärprogrammet': 'veterinarprogrammet',
  'Agronomprogram': 'agronomprogram',
  'Jägmästarprogrammet': 'jagmastarprogrammet',
};

// Fetch university courses from database
const fetchUniversityCoursesFromDatabase = async (programId: string, year: number): Promise<UniversityCourseTemplate[] | null> => {
  try {
    console.log('Fetching university courses from database for program:', programId, 'year:', year);
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('program_id', programId)
      .eq('education_level', 'högskola')
      .eq('education_year', year)
      .order('semester', { ascending: true });
    
    if (error) {
      console.error('Error fetching university courses:', error.message || error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      return null;
    }
    
    if (courses && courses.length > 0) {
      console.log('Found', courses.length, 'courses in database for program:', programId);
      return courses.map(course => {
        let resources: string[] = [];
        let tips: string[] = [];
        
        if (Array.isArray(course.resources)) {
          resources = course.resources as string[];
        } else if (typeof course.resources === 'string') {
          try {
            resources = JSON.parse(course.resources);
          } catch {
            resources = [];
          }
        }
        
        if (Array.isArray(course.tips)) {
          tips = course.tips as string[];
        } else if (typeof course.tips === 'string') {
          try {
            tips = JSON.parse(course.tips);
          } catch {
            tips = [];
          }
        }
        
        return {
          id: course.id,
          title: course.title,
          description: course.description || '',
          subject: course.subject,
          resources,
          tips,
        };
      });
    }
    
    console.log('No courses found in database for program:', programId);
    return null;
  } catch (error) {
    console.error('Exception fetching university courses:', error);
    return null;
  }
};

const getUniversityProgramCourses = (programName: string, year: string | null | undefined): UniversityCourseTemplate[] => {
  const yearNum = year ? parseInt(year, 10) : 1;
  
  const programCourseTemplates: Record<string, UniversityCourseTemplate[][]> = {
    'Civilingenjör - Datateknik': [
      [
        { id: 'LINALG-1', title: 'Linjär Algebra', description: 'Grundläggande linjär algebra med vektorer, matriser och linjära avbildningar', subject: 'Matematik', resources: ['Kurslitteratur', 'Övningsuppgifter'], tips: ['Öva matrisberäkningar dagligen', 'Visualisera geometriskt'] },
        { id: 'PROG-1', title: 'Programmering I', description: 'Introduktion till programmering med Python eller Java', subject: 'Datavetenskap', resources: ['Python dokumentation', 'Kodexempel'], tips: ['Programmera varje dag', 'Bygg egna projekt'] },
        { id: 'ANALYS-1', title: 'Analys I', description: 'Envariabelanalys: derivata, integraler och differentialekvationer', subject: 'Matematik', resources: ['Formelsamling', 'Övningsbok'], tips: ['Förstå teorin bakom formlerna', 'Öva på gamla tentor'] },
        { id: 'DISKMAT-1', title: 'Diskret Matematik', description: 'Logik, mängdlära, kombinatorik och grafteori', subject: 'Matematik', resources: ['Kurslitteratur', 'Problemsamling'], tips: ['Träna på bevis', 'Koppla till programmering'] }
      ],
      [
        { id: 'ANALYS-2', title: 'Analys II', description: 'Flervariabelanalys: partiella derivator och multipla integraler', subject: 'Matematik', resources: ['Kurslitteratur', 'Videoföreläsningar'], tips: ['Visualisera i 3D', 'Repetera från Analys I'] },
        { id: 'PROG-2', title: 'Programmering II', description: 'Objektorienterad programmering och datastrukturer', subject: 'Datavetenskap', resources: ['Java/C++ guide', 'Design patterns'], tips: ['Bygg större projekt', 'Lär dig debugging'] },
        { id: 'DATORSYS-1', title: 'Datorsystem', description: 'Datorarkitektur, operativsystem och nätverk', subject: 'Datavetenskap', resources: ['Referensmaterial', 'Labhandledningar'], tips: ['Experimentera med Linux', 'Förstå lågnivådetaljer'] },
        { id: 'ALGO-1', title: 'Algoritmer', description: 'Algoritmer och komplexitetsanalys', subject: 'Datavetenskap', resources: ['Algoritmbok', 'Leetcode'], tips: ['Implementera själv', 'Analysera tidskomplexitet'] }
      ]
    ],
    'Civilingenjör - Industriell ekonomi': [
      [
        { id: 'LINALG-IE', title: 'Linjär Algebra', description: 'Grundläggande linjär algebra för ingenjörer', subject: 'Matematik', resources: ['Kurslitteratur', 'Övningar'], tips: ['Förstå matriser', 'Koppla till ekonomiska modeller'] },
        { id: 'ANALYS-IE', title: 'Analys', description: 'Matematisk analys med tillämpningar', subject: 'Matematik', resources: ['Kurslitteratur', 'Formelsamling'], tips: ['Öva dagligen', 'Förstå koncepten'] },
        { id: 'EKON-1', title: 'Företagsekonomi', description: 'Grundläggande företagsekonomi och redovisning', subject: 'Ekonomi', resources: ['Lärobok', 'Case-studier'], tips: ['Läs affärstidningar', 'Följ företag'] },
        { id: 'PROG-IE', title: 'Programmering', description: 'Programmering för ingenjörer', subject: 'Datavetenskap', resources: ['Python guide', 'Övningar'], tips: ['Automatisera beräkningar', 'Bygg ekonomiska modeller'] }
      ],
      [
        { id: 'STAT-IE', title: 'Statistik', description: 'Statistik och sannolikhetslära', subject: 'Matematik', resources: ['Kurslitteratur', 'R/Excel'], tips: ['Förstå distributioner', 'Tillämpa på verkliga data'] },
        { id: 'MEKNAT-1', title: 'Mekanik', description: 'Teknisk mekanik och hållfasthetslära', subject: 'Teknik', resources: ['Lärobok', 'Labbhandledningar'], tips: ['Visualisera krafter', 'Öva på fri-kroppdiagram'] },
        { id: 'MKTG-1', title: 'Marknadsföring', description: 'Grundläggande marknadsföring', subject: 'Ekonomi', resources: ['Kotler bok', 'Case-studier'], tips: ['Analysera verkliga kampanjer', 'Följ trender'] },
        { id: 'ORG-1', title: 'Organisation', description: 'Organisationsteori och ledarskap', subject: 'Ekonomi', resources: ['Kurslitteratur', 'Case-studier'], tips: ['Reflektera över erfarenheter', 'Diskutera i grupp'] }
      ]
    ]
  };
  
  const defaultCourses: UniversityCourseTemplate[][] = [
    [
      { id: 'MATH-G1', title: 'Matematik Grundkurs', description: 'Grundläggande högskolematematik', subject: 'Matematik', resources: ['Kurslitteratur', 'Övningsbok'], tips: ['Öva regelbundet', 'Fråga om hjälp'] },
      { id: 'COMM-G1', title: 'Akademiskt skrivande', description: 'Vetenskapligt skrivande och kommunikation', subject: 'Kommunikation', resources: ['Skrivguide', 'Exempel'], tips: ['Skriv ofta', 'Få feedback'] },
      { id: 'INTRO-G1', title: 'Introduktionskurs', description: 'Introduktion till ämnesområdet', subject: 'Allmänt', resources: ['Kurslitteratur', 'Föreläsningar'], tips: ['Delta aktivt', 'Nätverka'] },
      { id: 'METH-G1', title: 'Vetenskaplig metod', description: 'Forskningsmetodik och källkritik', subject: 'Metod', resources: ['Metodbok', 'Databaser'], tips: ['Läs vetenskapliga artiklar', 'Träna källkritik'] }
    ],
    [
      { id: 'SPEC-G2', title: 'Fördjupningskurs I', description: 'Första fördjupningen inom valt område', subject: 'Specialisering', resources: ['Speciallitteratur', 'Seminarier'], tips: ['Välj intresseområde', 'Fördjupa dig'] },
      { id: 'PROJ-G2', title: 'Projektarbete', description: 'Grupprojekt inom ämnet', subject: 'Projekt', resources: ['Projektguide', 'Verktyg'], tips: ['Planera tidigt', 'Kommunicera med gruppen'] },
      { id: 'STAT-G2', title: 'Statistik', description: 'Grundläggande statistik och dataanalys', subject: 'Matematik', resources: ['Statistikbok', 'SPSS/R'], tips: ['Förstå teori', 'Tillämpa på data'] },
      { id: 'ELEC-G2', title: 'Valfri kurs', description: 'Valfri kurs inom programmet', subject: 'Valfritt', resources: ['Varierar'], tips: ['Välj efter intresse', 'Komplettera din profil'] }
    ]
  ];
  
  const programCourses = programCourseTemplates[programName];
  
  if (programCourses && programCourses[yearNum - 1]) {
    return programCourses[yearNum - 1];
  }
  
  if (defaultCourses[yearNum - 1]) {
    return defaultCourses[yearNum - 1];
  }
  
  return defaultCourses[0];
};

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
  completeOnboarding: (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[]; dailyGoalHours?: number; gymnasiumGrade?: string | null; universityYear?: string | null }) => Promise<void>;
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

  const completeOnboarding = useCallback(async (userData: Omit<User, 'id' | 'onboardingCompleted'> & { selectedCourses?: string[]; dailyGoalHours?: number; gymnasiumGrade?: string | null; universityYear?: string | null }) => {
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
        // Generate university courses based on selected program
        console.log('Creating university courses for program:', userData.program);
        
        // First try to get courses from database
        const programId = PROGRAM_NAME_TO_ID[userData.program] || userData.program.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const yearNum = userData.universityYear ? parseInt(userData.universityYear, 10) : 1;
        
        let universityCourses: UniversityCourseTemplate[] | null = null;
        
        if (dbConnected) {
          universityCourses = await fetchUniversityCoursesFromDatabase(programId, yearNum);
        }
        
        // Fall back to hardcoded courses if database didn't return any
        if (!universityCourses || universityCourses.length === 0) {
          console.log('No database courses found, using hardcoded courses');
          universityCourses = getUniversityProgramCourses(userData.program, userData.universityYear);
        }
        
        courses = universityCourses.map((courseData, index) => ({
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          subject: courseData.subject,
          level: 'högskola',
          progress: 0,
          isActive: index < 4, // First 4 courses are active
          resources: courseData.resources,
          tips: courseData.tips,
          relatedCourses: []
        }));
        
        // Sync university courses to Supabase
        if (dbConnected && courses.length > 0) {
          console.log('Syncing university courses to Supabase...');
          try {
            for (const course of courses) {
              const { data: existingCourse } = await supabase
                .from('courses')
                .select('id')
                .eq('id', course.id)
                .maybeSingle();
              
              if (!existingCourse) {
                console.log('Creating university course in database:', course.id);
                const { error: insertError } = await supabase
                  .from('courses')
                  .insert({
                    id: course.id,
                    course_code: course.id,
                    title: course.title,
                    description: course.description,
                    subject: course.subject,
                    level: 'högskola',
                    points: 7.5,
                    resources: course.resources,
                    tips: course.tips,
                    related_courses: [],
                    progress: 0
                  });
                
                if (insertError) {
                  console.error('Error inserting university course:', insertError.message || insertError);
                  console.error('Course data:', JSON.stringify({ id: course.id, title: course.title }));
                  console.error('Full error:', JSON.stringify(insertError, null, 2));
                }
              }
              
              const { error: userCourseError } = await supabase
                .from('user_courses')
                .upsert({
                  id: `${authUser.id}-${course.id}`,
                  user_id: authUser.id,
                  course_id: course.id,
                  progress: 0,
                  is_active: course.isActive
                }, {
                  onConflict: 'id'
                });
              
              if (userCourseError) {
                console.error('Error syncing user university course:', userCourseError.message || userCourseError);
                console.error('User course data:', JSON.stringify({ userId: authUser.id, courseId: course.id }));
                console.error('Full error:', JSON.stringify(userCourseError, null, 2));
              }
            }
            
            console.log('Successfully synced', courses.length, 'university courses to Supabase');
          } catch (error) {
            console.error('Error syncing university courses to Supabase:', error);
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
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(updatedUser)) return prev;
        return updatedUser;
      });
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
          
          // Update user_progress directly instead of saving duplicate study_sessions
          try {
            
            // Update user_progress table
            console.log('Updating user_progress table...');
            const { data: existingProgress, error: progressFetchError } = await supabase
              .from('user_progress')
              .select('total_study_time, total_sessions, current_streak, last_study_date, longest_streak, total_points')
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
            
            // Calculate points: 1 point per minute of studying
            const pointsEarned = session.duration;
            
            const currentTotalPoints = existingProgress?.total_points || 0;
            const newTotalPoints = currentTotalPoints + pointsEarned;
            
            const progressUpdate = {
              user_id: authUser.id,
              total_study_time: (existingProgress?.total_study_time || 0) + session.duration,
              total_sessions: (existingProgress?.total_sessions || 0) + 1,
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, existingProgress?.longest_streak || 0),
              last_study_date: session.endTime,
              total_points: newTotalPoints,
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
              console.log(`🎯 Points earned: +${pointsEarned} pts (${session.duration} min × 1)`);
              console.log(`💰 Total points: ${newTotalPoints} pts (was ${currentTotalPoints})`);
            }
            
            // Check for achievements using achievement context directly
            try {
              // Import achievements context dynamically to avoid circular dependency
              const { checkAchievements } = await import('@/contexts/AchievementContext').then(mod => ({
                checkAchievements: async () => {
                  const { checkAndUpdateAchievements } = await import('@/lib/database');
                  console.log('🏆 Checking for new achievements...');
                  const newAchievements = await checkAndUpdateAchievements(authUser.id);
                  return newAchievements;
                }
              }));
              
              const newAchievements = await checkAchievements();
              
              if (newAchievements && newAchievements.length > 0) {
                console.log(`✅ Unlocked ${newAchievements.length} new achievement(s)!`);
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
