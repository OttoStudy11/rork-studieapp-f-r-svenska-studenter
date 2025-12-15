import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { GraduationCap, BookOpen, MapPin, Flame } from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS } from '@/constants/gymnasiums';
import { AnimatedPressable, RippleButton, FadeInView } from '@/components/Animations';
import UniversityPicker from '@/components/UniversityPicker';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';
import { GYMNASIUM_PROGRAMS } from '@/constants/gymnasium-programs';
import { type University, type UniversityProgram, type UniversityProgramYear } from '@/constants/universities';

import type { AvatarConfig } from '@/constants/avatar-config';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';
import AvatarBuilder from '@/components/AvatarBuilder';

interface OnboardingData {
  username: string;
  displayName: string;
  studyLevel: 'gymnasie' | 'högskola' | '';
  gymnasium: Gymnasium | null;
  gymnasiumProgram: GymnasiumProgram | null;
  gymnasiumGrade: GymnasiumGrade | null;
  university: University | null;
  universityProgram: UniversityProgram | null;
  universityYear: UniversityProgramYear | null;
  program: string;
  goals: string[];
  purpose: string[];
  selectedCourses: Set<string>;
  year: 1 | 2 | 3 | null;
  avatarConfig: AvatarConfig;
  dailyGoalHours: number;
}

const goalOptions = [
  { id: 'better_grades', label: 'Få högre betyg', icon: '📈', color: '#10B981' },
  { id: 'focus', label: 'Förbättra fokus', icon: '🎯', color: '#3B82F6' },
  { id: 'planning', label: 'Bli bättre på planering', icon: '📅', color: '#8B5CF6' },
  { id: 'reduce_stress', label: 'Minska stress', icon: '🧘', color: '#EC4899' },
  { id: 'balance', label: 'Balansera studier & fritid', icon: '⚖️', color: '#F59E0B' },
  { id: 'motivation', label: 'Öka motivation', icon: '🔥', color: '#EF4444' },
  { id: 'friends', label: 'Studera med vänner', icon: '👥', color: '#06B6D4' },
  { id: 'techniques', label: 'Lära studietips', icon: '💡', color: '#22C55E' },
  { id: 'track_progress', label: 'Spåra mitt framsteg', icon: '📊', color: '#6366F1' },
  { id: 'organize', label: 'Organisera material', icon: '📚', color: '#14B8A6' },
];



export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  
  // Initialize hooks first
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    username: '',
    displayName: '',
    studyLevel: '',
    gymnasium: null,
    gymnasiumProgram: null,
    gymnasiumGrade: null,
    university: null,
    universityProgram: null,
    universityYear: null,
    program: '',
    goals: [],
    purpose: [],
    selectedCourses: new Set(),
    year: null,
    avatarConfig: DEFAULT_AVATAR_CONFIG,
    dailyGoalHours: 2
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);
  const [gymnasiumSearchQuery, setGymnasiumSearchQuery] = useState('');
  const [hasInitializedUsername, setHasInitializedUsername] = useState(false);
  
  // Initialize username only once when component mounts
  useEffect(() => {
    if (authContext?.user?.email && !hasInitializedUsername) {
      const emailPrefix = authContext.user!.email.split('@')[0] || '';
      const initialUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setData(prev => ({
        ...prev,
        displayName: emailPrefix,
        username: initialUsername
      }));
      setHasInitializedUsername(true);
    }
  }, [authContext, hasInitializedUsername]);

  useEffect(() => {
    if (data.gymnasiumProgram && data.year && step === 3) {
      console.log('Loading courses for program:', data.gymnasiumProgram.name, 'Year:', data.year);
      const defaultGymnasium: Gymnasium = { 
        id: 'default', 
        name: 'Gymnasie', 
        type: 'kommunal', 
        city: '', 
        municipality: '' 
      };
      const courses = getGymnasiumCourses(
        defaultGymnasium,
        data.gymnasiumProgram,
        data.year.toString() as '1' | '2' | '3'
      );
      console.log('Available courses:', courses.length, courses.map(c => c.name));
      setAvailableCourses(courses);
      
      const mandatoryCourseIds = courses
        .filter((course: GymnasiumCourse) => course.mandatory)
        .map((course: GymnasiumCourse) => course.id);
      setData((prev: OnboardingData) => ({ 
        ...prev,
        selectedCourses: new Set(mandatoryCourseIds)
      }));
    }
  }, [data.gymnasiumProgram, data.year, step]);
  
  // Safety checks for contexts
  if (!authContext || !studyContext || !toastContext) {
    console.error('OnboardingScreen: Required contexts are not available');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const { user } = authContext;
  const { completeOnboarding } = studyContext;
  const { showError } = toastContext;
  
  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    // Validate format
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(false);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data: result, error } = await supabase.rpc('check_username_available', {
        username_to_check: username
      });
      
      if (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(result);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };
  
  // Username is checked directly in onChangeText to avoid delays

  const handleNext = () => {
    const maxSteps = data.studyLevel === 'gymnasie' ? 6 : 4;
    if (step < maxSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (data.studyLevel && data.displayName && data.username && usernameAvailable) {
      try {
        console.log('Completing onboarding with data:', data);
        console.log('Study level:', data.studyLevel);
        console.log('Selected courses:', Array.from(data.selectedCourses));
        
        const programName = data.studyLevel === 'gymnasie' 
          ? (data.gymnasiumProgram ? data.gymnasiumProgram.name : data.program || 'Ej valt')
          : (data.universityProgram ? data.universityProgram.name : data.program || 'Ej valt');
        
        // Get the gymnasium for selected courses data
        const gymnasium: Gymnasium = data.gymnasium || { 
          id: 'default', 
          name: 'Gymnasie', 
          type: 'kommunal', 
          city: '', 
          municipality: '' 
        };
        
        // Complete onboarding with user data
        const selectedGoalLabels = data.goals
          .map(id => goalOptions.find(g => g.id === id)?.label)
          .filter(Boolean)
          .join(', ');
        
        await completeOnboarding({
          name: data.displayName,
          username: data.username,
          displayName: data.displayName,
          email: user?.email || '',
          studyLevel: data.studyLevel as 'gymnasie' | 'högskola',
          program: programName,
          purpose: selectedGoalLabels || 'Allmän studiehjälp',
          subscriptionType: 'free',
          gymnasium: gymnasium,
          gymnasiumGrade: data.studyLevel === 'gymnasie' && data.year ? String(data.year) : null,
          universityYear: data.studyLevel === 'högskola' && data.universityYear ? String(data.universityYear) : null,
          avatar: data.avatarConfig,
          selectedCourses: Array.from(data.selectedCourses),
          dailyGoalHours: data.dailyGoalHours
        });
        
        // Sync courses to Supabase
        if (user?.id) {
          if (data.studyLevel === 'gymnasie' && data.selectedCourses.size > 0) {
            console.log('Syncing gymnasium courses to Supabase...');
            
            for (const courseId of Array.from(data.selectedCourses)) {
              const courseData = availableCourses.find(c => c.id === courseId);
              if (!courseData) continue;
              
              const subject = extractSubjectFromCourseName(courseData.name);
              
              const { data: existingCourse } = await supabase
                .from('courses')
                .select('id')
                .eq('id', courseData.code)
                .maybeSingle();
              
              if (!existingCourse) {
                console.log('Creating gymnasium course in database:', courseData.code);
                const { error: insertError } = await supabase
                  .from('courses')
                  .insert({
                    id: courseData.code,
                    course_code: courseData.code,
                    title: courseData.name,
                    description: `${courseData.name} - ${courseData.points} poäng`,
                    subject: subject,
                    level: 'gymnasie',
                    points: courseData.points,
                    resources: ['Kursmaterial', 'Övningsuppgifter'],
                    tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                    related_courses: [],
                    progress: 0
                  });
                
                if (insertError) {
                  console.error('Error inserting gymnasium course:', insertError);
                }
              }
              
              const { data: userCourseExists } = await supabase
                .from('user_courses')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', courseData.code)
                .maybeSingle();
              
              if (!userCourseExists) {
                console.log('Creating user gymnasium course record:', courseData.code);
                const userCourseId = `${user.id}-${courseData.code}`;
                const { error: userCourseError } = await supabase
                  .from('user_courses')
                  .insert({
                    id: userCourseId,
                    user_id: user.id,
                    course_id: courseData.code,
                    is_active: true,
                    progress: 0
                  });
                
                if (userCourseError) {
                  console.error('Error creating user gymnasium course:', userCourseError);
                }
              }
            }
            
            console.log('Successfully synced gymnasium courses to Supabase');
          } else if (data.studyLevel === 'högskola' && data.universityProgram) {
            console.log('Syncing university courses to Supabase...');
            console.log('University program:', data.universityProgram.name);
            console.log('University year:', data.universityYear);
            
            // Generate university courses based on program and year
            const universityCourses = getUniversityProgramCourses(
              data.universityProgram.name, 
              data.universityYear ? String(data.universityYear) : '1'
            );
            
            console.log('Generated university courses:', universityCourses.length);
            
            for (const course of universityCourses) {
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
                  console.error('Error inserting university course:', insertError);
                }
              }
              
              const { data: userCourseExists } = await supabase
                .from('user_courses')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', course.id)
                .maybeSingle();
              
              if (!userCourseExists) {
                console.log('Creating user university course record:', course.id);
                const userCourseId = `${user.id}-${course.id}`;
                const { error: userCourseError } = await supabase
                  .from('user_courses')
                  .insert({
                    id: userCourseId,
                    user_id: user.id,
                    course_id: course.id,
                    is_active: true,
                    progress: 0
                  });
                
                if (userCourseError) {
                  console.error('Error creating user university course:', userCourseError);
                }
              }
            }
            
            console.log('Successfully synced university courses to Supabase');
          }
        }
        
        console.log('Onboarding completed successfully');
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Onboarding error:', error);
        showError('Något gick fel. Försök igen.');
      }
    }
  };
  
  // Helper function to get university program courses
  const getUniversityProgramCourses = (programName: string, year: string | null | undefined): { id: string; title: string; description: string; subject: string; resources: string[]; tips: string[] }[] => {
    const yearNum = year ? parseInt(year, 10) : 1;
    
    const programCourseTemplates: Record<string, { id: string; title: string; description: string; subject: string; resources: string[]; tips: string[] }[][]> = {
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
        ]
      ]
    };
    
    const defaultCourses: { id: string; title: string; description: string; subject: string; resources: string[]; tips: string[] }[][] = [
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
  
  const extractSubjectFromCourseName = (name: string): string => {
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
      'Programmering': 'Teknik',
      'Webbutveckling': 'Teknik',
      'Filosofi': 'Filosofi',
      'Psykologi': 'Psykologi',
      'Företagsekonomi': 'Företagsekonomi',
      'Juridik': 'Juridik',
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

  const toggleGoal = (goalId: string) => {
    const newGoals = data.goals.includes(goalId)
      ? data.goals.filter(id => id !== goalId)
      : [...data.goals, goalId];
    setData({ ...data, goals: newGoals });
  };

  const canProceed = () => {
    switch (step) {
      case 0: 
        return data.username.trim().length >= 3 && 
               data.displayName.trim().length > 0 && 
               usernameAvailable === true;
      case 1: 
        if (data.studyLevel === 'gymnasie') {
          return data.gymnasiumProgram !== null && data.year !== null;
        }
        return data.studyLevel === 'högskola';
      case 2: 
        if (data.studyLevel === 'gymnasie') {
          return data.gymnasium !== null;
        }
        return data.university !== null && data.universityProgram !== null && data.universityYear !== null;
      case 3: 
        if (data.studyLevel === 'gymnasie') {
          return data.selectedCourses.size > 0;
        }
        return true;
      case 4: 
        if (data.studyLevel === 'gymnasie') {
          return true;
        }
        return data.goals.length > 0;
      case 5: 
        if (data.studyLevel === 'gymnasie') {
          return data.goals.length > 0;
        }
        return true;
      case 6: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.title}>Hej {user?.email?.split('@')[0] || 'där'}!</Text>
            <Text style={styles.subtitle}>Skapa ditt användarnamn och visningsnamn</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Användarnamn (för att lägga till vänner)</Text>
              <View style={styles.usernameInputContainer}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="användarnamn"
                  value={data.username}
                  onChangeText={(text) => {
                    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    // Always update the state, even if empty
                    setData({ ...data, username: cleanText });
                    
                    // Validate availability only when length is >= 3
                    if (cleanText.length >= 3) {
                      checkUsernameAvailability(cleanText);
                    } else {
                      setUsernameAvailable(null);
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>
              {checkingUsername && (
                <Text style={styles.inputHint}>Kontrollerar tillgänglighet...</Text>
              )}
              {usernameAvailable === false && (
                <Text style={[styles.inputHint, { color: '#EF4444' }]}>Användarnamnet är inte tillgängligt eller ogiltigt</Text>
              )}
              {usernameAvailable === true && (
                <Text style={[styles.inputHint, { color: '#10B981' }]}>✓ Användarnamnet är tillgängligt</Text>
              )}
              <Text style={styles.inputHint}>
                3-20 tecken, endast bokstäver, siffror och _
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Visningsnamn (för- och efternamn)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ditt för- och efternamn"
                value={data.displayName}
                onChangeText={(text) => setData({ ...data, displayName: text })}
                maxLength={50}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={60} color="#1F2937" style={styles.icon} />
            <Text style={styles.title}>Välj program och årskurs</Text>
            <Text style={styles.subtitle}>Vilken nivå studerar du på?</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedPressable
                style={[
                  styles.optionButton,
                  data.studyLevel === 'gymnasie' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'gymnasie' && styles.selectedOptionText
                ]}>
                  Gymnasie
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[
                  styles.optionButton,
                  data.studyLevel === 'högskola' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'högskola' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'högskola' && styles.selectedOptionText
                ]}>
                  Högskola/Universitet
                </Text>
              </AnimatedPressable>
            </View>
            
            {data.studyLevel === 'gymnasie' && (
              <>
                <Text style={[styles.subtitle, { marginTop: 20 }]}>Välj ditt program</Text>
                <ScrollView style={styles.programScrollView} showsVerticalScrollIndicator={false}>
                  <View style={styles.programGrid}>
                    {GYMNASIUM_PROGRAMS.map((program) => {
                      const isSelected = data.gymnasiumProgram?.id === program.id;
                      
                      return (
                        <AnimatedPressable
                          key={program.id}
                          style={[
                            styles.programCard,
                            isSelected && styles.selectedProgramCard
                          ]}
                          onPress={() => {
                            console.log('Selected program:', program.name);
                            setData({ ...data, gymnasiumProgram: program });
                          }}
                        >
                          <Text style={[
                            styles.programCardText,
                            isSelected && styles.selectedProgramCardText
                          ]} numberOfLines={1}>
                            {program.name}
                          </Text>
                        </AnimatedPressable>
                      );
                    })}
                  </View>
                </ScrollView>
                
                {data.gymnasiumProgram && (
                  <>
                    <Text style={[styles.subtitle, { marginTop: 20 }]}>Välj årskurs</Text>
                    <View style={styles.yearContainer}>
                      {[1, 2, 3].map((year) => (
                        <AnimatedPressable
                          key={year}
                          style={[
                            styles.yearButton,
                            data.year === year && styles.selectedYearButton
                          ]}
                          onPress={() => setData({ ...data, year: year as 1 | 2 | 3 })}
                        >
                          <Text style={[
                            styles.yearButtonText,
                            data.year === year && styles.selectedYearButtonText
                          ]}>
                            År {year}
                          </Text>
                        </AnimatedPressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        );

      case 2:
        if (data.studyLevel === 'högskola') {
          return (
            <View style={styles.stepContainer}>
              <GraduationCap size={60} color="#1F2937" style={styles.icon} />
              <Text style={styles.title}>Välj högskola och program</Text>
              <Text style={styles.subtitle}>Välj ditt program, skola och termin</Text>
              
              <UniversityPicker
                selectedUniversity={data.university}
                selectedProgram={data.universityProgram}
                selectedYear={data.universityYear}
                onSelect={(university, program, year) => {
                  console.log('Selected:', { university, program, year });
                  setData({ 
                    ...data, 
                    university, 
                    universityProgram: program, 
                    universityYear: year 
                  });
                }}
                placeholder="Välj högskola och program"
              />
            </View>
          );
        }
        
        const filteredGymnasiums = gymnasiumSearchQuery
          ? SWEDISH_GYMNASIUMS.filter(
              (gym) =>
                gym.name.toLowerCase().includes(gymnasiumSearchQuery.toLowerCase()) ||
                gym.city.toLowerCase().includes(gymnasiumSearchQuery.toLowerCase()) ||
                gym.municipality.toLowerCase().includes(gymnasiumSearchQuery.toLowerCase())
            )
          : SWEDISH_GYMNASIUMS;
        
        const groupedGymnasiums: Record<string, typeof SWEDISH_GYMNASIUMS> = {};
        filteredGymnasiums.forEach((gym) => {
          if (!groupedGymnasiums[gym.city]) {
            groupedGymnasiums[gym.city] = [];
          }
          groupedGymnasiums[gym.city].push(gym);
        });
        
        return (
          <View style={styles.stepContainer}>
            <MapPin size={60} color="#1F2937" style={styles.icon} />
            <Text style={styles.title}>Välj gymnasium</Text>
            <Text style={styles.subtitle}>Vilket gymnasium går du på?</Text>
            
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Sök gymnasium, stad eller kommun..."
                placeholderTextColor="#94A3B8"
                value={gymnasiumSearchQuery}
                onChangeText={setGymnasiumSearchQuery}
              />
            </View>
            
            <ScrollView style={styles.programScrollView} showsVerticalScrollIndicator={false}>
              {Object.keys(groupedGymnasiums).sort().map((city) => (
                <View key={city}>
                  <View style={styles.cityHeader}>
                    <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.cityHeaderText}>{city}</Text>
                  </View>
                  <View style={styles.programGrid}>
                    {groupedGymnasiums[city].map((gym) => {
                      const isSelected = data.gymnasium?.id === gym.id;
                      
                      return (
                        <AnimatedPressable
                          key={gym.id}
                          style={[
                            styles.programCard,
                            isSelected && styles.selectedProgramCard
                          ]}
                          onPress={() => {
                            console.log('Selected gymnasium:', gym.name);
                            setData({ ...data, gymnasium: gym });
                          }}
                        >
                          <Text style={[
                            styles.programCardText,
                            isSelected && styles.selectedProgramCardText
                          ]} numberOfLines={2}>
                            {gym.name}
                          </Text>
                          <Text style={[
                            styles.programCardCity,
                            isSelected && styles.selectedProgramCardText
                          ]} numberOfLines={1}>
                            {gym.city}
                          </Text>
                          <View style={styles.gymnasiumTypeBadge}>
                            <Text style={styles.gymnasiumTypeText}>
                              {gym.type === 'kommunal' ? 'Kommunal' : gym.type === 'friskola' ? 'Friskola' : 'Privat'}
                            </Text>
                          </View>
                        </AnimatedPressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 3:
        if (data.studyLevel === 'högskola') {
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Vad vill du uppnå?</Text>
              <Text style={styles.subtitle}>Välj ett eller flera mål som passar dig</Text>
              
              <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.goalsGrid}>
                  {goalOptions.map((goal) => {
                    const isSelected = data.goals.includes(goal.id);
                    
                    return (
                      <AnimatedPressable
                        key={goal.id}
                        style={[
                          styles.goalCard,
                          isSelected && [styles.selectedGoalCard, { borderColor: goal.color }]
                        ]}
                        onPress={() => toggleGoal(goal.id)}
                      >
                        <View style={[
                          styles.goalIconContainer,
                          { backgroundColor: goal.color + '20' }
                        ]}>
                          <Text style={styles.goalEmoji}>{goal.icon}</Text>
                        </View>
                        <Text style={[
                          styles.goalText,
                          isSelected && { color: goal.color }
                        ]} numberOfLines={2}>
                          {goal.label}
                        </Text>
                        {isSelected && (
                          <View style={[styles.checkMark, { backgroundColor: goal.color }]}>
                            <Text style={styles.checkMarkText}>✓</Text>
                          </View>
                        )}
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </ScrollView>
              
              <View style={styles.goalsSummary}>
                <Text style={styles.goalsSummaryText}>
                  {data.goals.length > 0 ? `${data.goals.length} mål valda` : 'Välj minst ett mål'}
                </Text>
              </View>
            </View>
          );
        }
        
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={60} color="#1F2937" style={styles.icon} />
            <Text style={styles.title}>Välj dina kurser</Text>
            <Text style={styles.subtitle}>
              {data.gymnasiumProgram?.name} - År {data.year}
            </Text>
            <ScrollView style={styles.coursesScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.coursesContainer}>
                {availableCourses.map((course) => {
                  const isSelected = data.selectedCourses.has(course.id);
                  const isMandatory = course.mandatory;
                  
                  return (
                    <AnimatedPressable
                      key={course.id}
                      style={[
                        styles.courseCardLarge,
                        isSelected && styles.selectedCourseCardLarge,
                        isMandatory && styles.mandatoryCourseCardLarge
                      ]}
                      onPress={() => {
                        if (isMandatory) return;
                        
                        const newSelectedCourses = new Set(data.selectedCourses);
                        if (isSelected) {
                          newSelectedCourses.delete(course.id);
                        } else {
                          newSelectedCourses.add(course.id);
                        }
                        setData({ ...data, selectedCourses: newSelectedCourses });
                      }}
                      disabled={isMandatory}
                    >
                      <Text style={[
                        styles.courseCardLargeText,
                        isSelected && styles.selectedCourseCardLargeText
                      ]} numberOfLines={1}>
                        {course.name}
                      </Text>
                      {isMandatory && (
                        <View style={styles.mandatoryBadgeLarge}>
                          <Text style={styles.mandatoryTextLarge}>Obligatorisk</Text>
                        </View>
                      )}
                    </AnimatedPressable>
                  );
                })}
                
                {availableCourses.length === 0 && (
                  <View style={styles.noCoursesContainer}>
                    <Text style={styles.noCoursesText}>
                      Välj program och årskurs för att se tillgängliga kurser
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.coursesSummary}>
              <Text style={styles.summaryText}>
                {data.selectedCourses.size} kurser valda
              </Text>
            </View>
          </View>
        );

      case 4:
        if (data.studyLevel === 'gymnasie') {
          return (
            <View style={styles.stepContainer}>
              <Flame size={60} color="#FFA500" style={styles.icon} />
              <Text style={styles.title}>Sätt ditt dagsmål</Text>
              <Text style={styles.subtitle}>Hur många timmar vill du studera per dag?</Text>
              
              <View style={styles.dailyGoalContainer}>
                <Text style={styles.dailyGoalValue}>{data.dailyGoalHours.toFixed(1)}</Text>
                <Text style={styles.dailyGoalLabel}>timmar per dag</Text>
              </View>
              
              <View style={styles.goalOptionsContainer}>
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((hours) => (
                  <AnimatedPressable
                    key={hours}
                    style={[
                      styles.goalOption,
                      data.dailyGoalHours === hours && styles.selectedGoalOption
                    ]}
                    onPress={() => setData({ ...data, dailyGoalHours: hours })}
                  >
                    <Text style={[
                      styles.goalOptionText,
                      data.dailyGoalHours === hours && styles.selectedGoalOptionText
                    ]}>
                      {hours}h
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
              
              <Text style={styles.goalHintText}>
                Du kan ändra detta när som helst i inställningarna
              </Text>
            </View>
          );
        }
        
        return (
          <View style={styles.stepContainer}>
            <Flame size={60} color="#FFA500" style={styles.icon} />
            <Text style={styles.title}>Sätt ditt dagsmål</Text>
            <Text style={styles.subtitle}>Hur många timmar vill du studera per dag?</Text>
            
            <View style={styles.dailyGoalContainer}>
              <Text style={styles.dailyGoalValue}>{data.dailyGoalHours.toFixed(1)}</Text>
              <Text style={styles.dailyGoalLabel}>timmar per dag</Text>
            </View>
            
            <View style={styles.goalOptionsContainer}>
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((hours) => (
                <AnimatedPressable
                  key={hours}
                  style={[
                    styles.goalOption,
                    data.dailyGoalHours === hours && styles.selectedGoalOption
                  ]}
                  onPress={() => setData({ ...data, dailyGoalHours: hours })}
                >
                  <Text style={[
                    styles.goalOptionText,
                    data.dailyGoalHours === hours && styles.selectedGoalOptionText
                  ]}>
                    {hours}h
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            
            <Text style={styles.goalHintText}>
              Du kan ändra detta när som helst i inställningarna
            </Text>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Vad vill du uppnå?</Text>
            <Text style={styles.subtitle}>Välj ett eller flera mål som passar dig</Text>
            
            <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.goalsGrid}>
                {goalOptions.map((goal) => {
                  const isSelected = data.goals.includes(goal.id);
                  
                  return (
                    <AnimatedPressable
                      key={goal.id}
                      style={[
                        styles.goalCard,
                        isSelected && [styles.selectedGoalCard, { borderColor: goal.color }]
                      ]}
                      onPress={() => toggleGoal(goal.id)}
                    >
                      <View style={[
                        styles.goalIconContainer,
                        { backgroundColor: goal.color + '20' }
                      ]}>
                        <Text style={styles.goalEmoji}>{goal.icon}</Text>
                      </View>
                      <Text style={[
                        styles.goalText,
                        isSelected && { color: goal.color }
                      ]} numberOfLines={2}>
                        {goal.label}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkMark, { backgroundColor: goal.color }]}>
                          <Text style={styles.checkMarkText}>✓</Text>
                        </View>
                      )}
                    </AnimatedPressable>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.goalsSummary}>
              <Text style={styles.goalsSummaryText}>
                {data.goals.length > 0 ? `${data.goals.length} mål valda` : 'Välj minst ett mål'}
              </Text>
            </View>
          </View>
        );
      
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Skapa din avatar</Text>
            <Text style={styles.subtitle}>Designa din personliga karaktär</Text>
            <View style={styles.avatarBuilderContainer}>
              <AvatarBuilder
                initialConfig={data.avatarConfig}
                onSave={(config) => {
                  setData({ ...data, avatarConfig: config });
                }}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#06B6D4', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((step + 1) / (data.studyLevel === 'gymnasie' ? 7 : 5)) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{step + 1} av {data.studyLevel === 'gymnasie' ? '7' : '5'}</Text>
          </View>

          <FadeInView key={step} duration={300}>
            {renderStep()}
          </FadeInView>

          <View style={styles.buttonContainer}>
            {step > 0 && (
              <AnimatedPressable
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Tillbaka</Text>
              </AnimatedPressable>
            )}
            
            <RippleButton
              style={[
                styles.nextButton,
                !canProceed() && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
              rippleColor="#1F2937"
              rippleOpacity={0.2}
            >
              <Text style={styles.nextButtonText}>
                {step === (data.studyLevel === 'gymnasie' ? 6 : 4) ? 'Slutför' : 'Nästa'}
              </Text>
            </RippleButton>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  progressContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  progressText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600' as const,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minHeight: 400,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400' as const,
    paddingHorizontal: 8,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: 'white',
    borderColor: 'white',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#1E293B',
  },
  multiSelectContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  multiSelectOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedMultiOption: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  multiSelectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMultiText: {
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
    paddingHorizontal: 4,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  nextButton: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'white',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  atSymbol: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#475569',
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },

  inputHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 8,
    lineHeight: 18,
  },
  disabledButton: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  gymnasiumPickerContainer: {
    width: '100%',
    marginTop: 20,
  },
  programScrollView: {
    maxHeight: 380,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '48%',
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  selectedProgramCard: {
    backgroundColor: 'white',
    borderColor: '#10B981',
    borderWidth: 2.5,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  programCardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 18,
  },
  programCardCity: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  searchInputContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginBottom: 14,
    marginTop: 16,
    gap: 8,
  },
  cityHeaderText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  gymnasiumTypeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gymnasiumTypeText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  selectedProgramCardText: {
    color: '#1E293B',
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 20,
    width: '100%',
  },
  yearButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedYearButton: {
    backgroundColor: 'white',
    borderColor: '#10B981',
    borderWidth: 2.5,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  yearButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
    textAlign: 'center',
  },
  selectedYearButtonText: {
    color: '#10B981',
  },
  coursesScrollView: {
    maxHeight: 350,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  coursesContainer: {
    gap: 12,
  },
  courseCardLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCourseCardLarge: {
    backgroundColor: 'white',
    borderColor: 'white',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  mandatoryCourseCardLarge: {
    opacity: 0.7,
  },
  courseCardLargeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#475569',
    textAlign: 'center',
  },
  selectedCourseCardLargeText: {
    color: '#1E293B',
  },
  mandatoryBadgeLarge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mandatoryTextLarge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },
  noCoursesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noCoursesText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  coursesSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  avatarBuilderContainer: {
    flex: 1,
    width: '100%',
    marginTop: 20,
  },
  dailyGoalContainer: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
  },
  dailyGoalValue: {
    fontSize: 64,
    fontWeight: '800' as const,
    color: 'white',
    letterSpacing: -2,
  },
  dailyGoalLabel: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    fontWeight: '500' as const,
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  goalOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedGoalOption: {
    backgroundColor: 'white',
    borderColor: 'white',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  goalOptionText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  selectedGoalOptionText: {
    color: '#1E293B',
  },
  goalHintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
  universityPickerWrapper: {
    width: '100%',
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  goalsScrollView: {
    maxHeight: 350,
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 10,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    minHeight: 120,
    maxHeight: 130,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  selectedGoalCard: {
    backgroundColor: 'white',
    borderWidth: 2.5,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  goalEmoji: {
    fontSize: 22,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 2,
    maxWidth: '100%',
  },
  checkMark: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  goalsSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  goalsSummaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});