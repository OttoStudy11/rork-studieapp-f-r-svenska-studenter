import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  Flame, 
  FileText, 
  Shield, 
  Check, 
  Target,
  Bell,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react-native';
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
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedGDPR: boolean;
  acceptedAge: boolean;
  learningPace: 'casual' | 'regular' | 'intensive' | 'own' | '';
  notificationPreferences: {
    dailyReminders: boolean;
    dailyReminderTime: string;
    courseCompletion: boolean;
    achievements: boolean;
    dailyChallenges: boolean;
    streakReminders: boolean;
    socialUpdates: boolean;
  };
  selectedStartingCourse: string | null;
}

const TERMS_OF_SERVICE = `ANVÄNDARVILLKOR FÖR STUDIESTUGAN

Senast uppdaterad: ${new Date().toLocaleDateString('sv-SE')}

1. GODKÄNNANDE AV VILLKOR

Genom att använda Studiestugan-appen ("Tjänsten") godkänner du dessa användarvillkor. Om du inte godkänner villkoren, vänligen använd inte Tjänsten.

2. BESKRIVNING AV TJÄNSTEN

Studiestugan är en studieapp utformad för att hjälpa studenter att:
- Organisera och planera sina studier
- Följa sin studieframgång
- Använda studietekniker och verktyg
- Interagera med andra studenter

3. ANVÄNDARKONTO

3.1 Du måste skapa ett konto för att använda Tjänsten.
3.2 Du ansvarar för att hålla dina inloggningsuppgifter säkra.
3.3 Du måste vara minst 13 år för att använda Tjänsten.
3.4 All information du anger måste vara korrekt och aktuell.

4. ANVÄNDARENS ANSVAR

4.1 Du får inte använda Tjänsten för olagliga ändamål.
4.2 Du får inte dela innehåll som är stötande, hotfullt eller kränkande.
4.3 Du får inte försöka få obehörig åtkomst till Tjänsten.
4.4 Du ansvarar för allt innehåll du delar via Tjänsten.

5. IMMATERIELLA RÄTTIGHETER

5.1 Allt innehåll i Tjänsten tillhör Studiestugan eller dess licensgivare.
5.2 Du får inte kopiera, modifiera eller distribuera innehåll utan tillstånd.
5.3 Innehåll du skapar förblir din egendom, men du ger oss rätt att använda det inom Tjänsten.

6. PREMIUM-FUNKTIONER

6.1 Vissa funktioner kräver en premiumprenonumeration.
6.2 Betalning hanteras via App Store eller Google Play.
6.3 Prenumerationer förnyas automatiskt om de inte avbryts.
6.4 Återbetalningar hanteras enligt respektive butiks policyer.

7. UPPSÄGNING

7.1 Du kan avsluta ditt konto när som helst.
7.2 Vi förbehåller oss rätten att stänga av eller avsluta konton som bryter mot dessa villkor.

8. ANSVARSBEGRÄNSNING

8.1 Tjänsten tillhandahålls "som den är" utan garantier.
8.2 Vi ansvarar inte för eventuella förluster eller skador som uppstår genom användning av Tjänsten.
8.3 Studiestugan är ett studieverktyg och ersätter inte professionell utbildning.

9. ÄNDRINGAR

Vi förbehåller oss rätten att ändra dessa villkor. Fortsatt användning efter ändringar innebär godkännande av de nya villkoren.

10. KONTAKT

Frågor om dessa villkor kan skickas till: support@studiestugan.se`;

const PRIVACY_POLICY = `INTEGRITETSPOLICY FÖR STUDIESTUGAN

Senast uppdaterad: ${new Date().toLocaleDateString('sv-SE')}

1. INTRODUKTION

Denna integritetspolicy beskriver hur Studiestugan ("vi", "oss", "vår") samlar in, använder och skyddar dina personuppgifter när du använder vår app.

2. VILKA UPPGIFTER VI SAMLAR IN

2.1 Kontoinformation:
- E-postadress
- Användarnamn och visningsnamn
- Lösenord (krypterat)

2.2 Profilinformation:
- Studienivå (gymnasium/högskola)
- Skola och program
- Årskurs
- Avatar-inställningar

2.3 Användningsdata:
- Studietid och sessioner
- Kursframsteg
- Poäng och prestationer
- Appinteraktioner

2.4 Teknisk information:
- Enhetstyp och operativsystem
- App-version
- Kraschloggar (anonymiserade)

3. HUR VI ANVÄNDER DINA UPPGIFTER

Vi använder dina uppgifter för att:
- Tillhandahålla och förbättra Tjänsten
- Spåra din studieframgång
- Möjliggöra sociala funktioner (vänner, topplistor)
- Skicka viktiga meddelanden om Tjänsten
- Analysera och förbättra användarupplevelsen

4. DELNING AV INFORMATION

4.1 Vi säljer aldrig dina personuppgifter.
4.2 Vi kan dela anonymiserad, aggregerad data för analysändamål.
4.3 Vi delar information med tjänsteleverantörer som hjälper oss att driva Tjänsten (t.ex. Supabase för datalagring).
4.4 Vi kan dela information om det krävs enligt lag.

5. DATALAGRING OCH SÄKERHET

5.1 Dina data lagras säkert hos Supabase med kryptering.
5.2 Vi behåller dina uppgifter så länge ditt konto är aktivt.
5.3 Du kan begära radering av dina uppgifter när som helst.

6. DINA RÄTTIGHETER (GDPR)

Du har rätt att:
- Få tillgång till dina personuppgifter
- Rätta felaktiga uppgifter
- Radera dina uppgifter
- Begränsa behandlingen av dina uppgifter
- Invända mot behandling
- Dataportabilitet
- Återkalla samtycke

7. BARN OCH MINDERÅRIGA

7.1 Tjänsten är avsedd för användare som är minst 13 år.
7.2 Vi samlar inte medvetet in uppgifter från barn under 13 år.
7.3 För användare under 16 år rekommenderar vi föräldrarnas godkännande.

8. COOKIES OCH LIKNANDE TEKNIKER

Vi använder lokal lagring för att:
- Hålla dig inloggad
- Spara dina preferenser
- Förbättra prestanda

9. TREDJEPARTSTJÄNSTER

Vi använder följande tredjepartstjänster:
- Supabase (autentisering och datalagring)
- Expo (app-plattform)
- App Store/Google Play (betalningar)

10. INTERNATIONELLA ÖVERFÖRINGAR

Dina uppgifter kan överföras till och behandlas i länder utanför EES. Vi säkerställer att lämpliga skyddsåtgärder finns på plats.

11. ÄNDRINGAR I POLICYN

Vi kan uppdatera denna policy. Vi meddelar dig om väsentliga ändringar via appen eller e-post.

12. KONTAKT

För frågor om integritet eller för att utöva dina rättigheter:
E-post: privacy@studiestugan.se

Dataskyddsombud:
privacy@studiestugan.se`;

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

const learningPaceOptions = [
  { 
    id: 'casual', 
    title: 'Avslappnat', 
    subtitle: '15-30 min/dag', 
    description: 'Perfekt för att balansera studier med andra aktiviteter',
    icon: '🌱',
    color: '#10B981'
  },
  { 
    id: 'regular', 
    title: 'Regelbundet', 
    subtitle: '30-60 min/dag', 
    description: 'Stadig framgång med konsekvent studietid',
    icon: '📚',
    color: '#3B82F6'
  },
  { 
    id: 'intensive', 
    title: 'Intensivt', 
    subtitle: '60+ min/dag', 
    description: 'Maximal fokus för bästa resultat',
    icon: '🔥',
    color: '#EF4444'
  },
  { 
    id: 'own', 
    title: 'Egen takt', 
    subtitle: 'Flexibelt schema', 
    description: 'Studera helt efter ditt eget schema',
    icon: '🎯',
    color: '#8B5CF6'
  },
];

export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  
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
    dailyGoalHours: 2,
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedGDPR: false,
    acceptedAge: false,
    learningPace: '',
    notificationPreferences: {
      dailyReminders: true,
      dailyReminderTime: '18:00',
      courseCompletion: true,
      achievements: true,
      dailyChallenges: true,
      streakReminders: true,
      socialUpdates: true,
    },
    selectedStartingCourse: null,
  });
  const [expandedPolicy, setExpandedPolicy] = useState<'terms' | 'privacy' | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);
  const [gymnasiumSearchQuery, setGymnasiumSearchQuery] = useState('');
  const [hasInitializedUsername, setHasInitializedUsername] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  
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
    if (data.gymnasiumProgram && data.year && step === 4) {
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
  
  if (!authContext || !studyContext || !toastContext) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Laddar...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const { user } = authContext;
  const { completeOnboarding } = studyContext;
  const { showError, showSuccess } = toastContext;
  
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
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

  const getTotalSteps = () => {
    if (data.studyLevel === '') return 14;
    return data.studyLevel === 'gymnasie' ? 13 : 11;
  };

  const handleNext = () => {
    if (step < getTotalSteps() - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (data.studyLevel && data.displayName && data.username && usernameAvailable) {
      try {
        console.log('Completing onboarding with data:', data);
        
        const programName = data.studyLevel === 'gymnasie' 
          ? (data.gymnasiumProgram ? data.gymnasiumProgram.name : data.program || 'Ej valt')
          : (data.universityProgram ? data.universityProgram.name : data.program || 'Ej valt');
        
        const gymnasium: Gymnasium = data.gymnasium || { 
          id: 'default', 
          name: 'Gymnasie', 
          type: 'kommunal', 
          city: '', 
          municipality: '' 
        };
        
        const selectedGoalLabels = data.goals
          .map(id => goalOptions.find(g => g.id === id)?.label)
          .filter(Boolean)
          .join(', ');

        // Note: Policy acceptances and preferences will be saved in the completeOnboarding function
        // These database tables need to be created first: user_policy_acceptances, user_preferences
        console.log('Saving user preferences:', {
          learningPace: data.learningPace,
          notifications: data.notificationPreferences,
          policies: {
            terms: data.acceptedTerms,
            privacy: data.acceptedPrivacy,
            gdpr: data.acceptedGDPR,
            age: data.acceptedAge,
          }
        });
        
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
        
        console.log('Onboarding completed successfully');
        showSuccess('Välkommen! Din profil är nu klar.');
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Onboarding error:', error);
        showError('Något gick fel. Försök igen.');
      }
    }
  };

  const assignCoursesAutomatically = async () => {
    setIsLoadingCourses(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (data.studyLevel === 'gymnasie' && data.selectedCourses.size > 0) {
        const courses = availableCourses.filter(c => data.selectedCourses.has(c.id));
        setAssignedCourses(courses);
      }
      
      setIsLoadingCourses(false);
      setStep(step + 1);
    } catch (error) {
      console.error('Error assigning courses:', error);
      setIsLoadingCourses(false);
      showError('Kunde inte tilldela kurser. Försök igen.');
    }
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
        return true;
      case 1: 
        return data.acceptedTerms && data.acceptedPrivacy && data.acceptedGDPR && data.acceptedAge;
      case 2: 
        return data.username.trim().length >= 3 && 
               data.displayName.trim().length > 0 && 
               usernameAvailable === true;
      case 3: 
        if (data.studyLevel === 'gymnasie') {
          return data.gymnasiumProgram !== null && data.year !== null;
        }
        return data.studyLevel === 'högskola';
      case 4: 
        if (data.studyLevel === 'gymnasie') {
          return data.gymnasium !== null;
        }
        return data.university !== null && data.universityProgram !== null && data.universityYear !== null;
      case 5: 
        if (data.studyLevel === 'gymnasie') {
          return data.selectedCourses.size > 0;
        }
        return data.goals.length > 0;
      case 6: 
        if (data.studyLevel === 'gymnasie') {
          return data.goals.length > 0;
        }
        return data.learningPace !== '';
      case 7: 
        if (data.studyLevel === 'gymnasie') {
          return data.learningPace !== '';
        }
        return true;
      case 8:
        if (data.studyLevel === 'gymnasie') {
          return true;
        }
        return true;
      case 9:
        if (data.studyLevel === 'gymnasie') {
          return true;
        }
        return true;
      case 10:
        return true;
      case 11:
        return true;
      case 12:
        return true;
      default: 
        return false;
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
            <Sparkles size={60} color="white" style={styles.icon} />
            <Text style={styles.title}>Välkommen till Studiestugan!</Text>
            <Text style={styles.subtitle}>
              Din personliga studieassistent för gymnasiet och högskolan
            </Text>
            
            <View style={styles.welcomeFeatures}>
              <View style={styles.featureItem}>
                <BookOpen size={24} color="white" />
                <Text style={styles.featureText}>Strukturerat lärande</Text>
              </View>
              <View style={styles.featureItem}>
                <Target size={24} color="white" />
                <Text style={styles.featureText}>Spåra dina framsteg</Text>
              </View>
              <View style={styles.featureItem}>
                <Trophy size={24} color="white" />
                <Text style={styles.featureText}>Lås upp prestationer</Text>
              </View>
              <View style={styles.featureItem}>
                <Users size={24} color="white" />
                <Text style={styles.featureText}>Studera med vänner</Text>
              </View>
            </View>

            <Text style={styles.subtleText}>
              Låt oss sätta upp din profil på några minuter
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Shield size={60} color="white" style={styles.icon} />
            <Text style={styles.title}>Villkor & Integritet</Text>
            <Text style={styles.subtitle}>Läs och godkänn för att fortsätta</Text>
            
            <ScrollView style={styles.legalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.legalContainer}>
                <AnimatedPressable
                  style={styles.policyCard}
                  onPress={() => setExpandedPolicy(expandedPolicy === 'terms' ? null : 'terms')}
                >
                  <View style={styles.policyHeader}>
                    <View style={styles.policyIconContainer}>
                      <FileText size={24} color="#0EA5E9" />
                    </View>
                    <View style={styles.policyTitleContainer}>
                      <Text style={styles.policyTitle}>Användarvillkor</Text>
                      <Text style={styles.policySubtitle}>
                        Tryck för att {expandedPolicy === 'terms' ? 'dölja' : 'läsa'}
                      </Text>
                    </View>
                  </View>
                </AnimatedPressable>
                
                {expandedPolicy === 'terms' && (
                  <View style={styles.policyContent}>
                    <ScrollView style={styles.policyTextScroll} nestedScrollEnabled={true}>
                      <Text style={styles.policyText}>{TERMS_OF_SERVICE}</Text>
                    </ScrollView>
                  </View>
                )}
                
                <AnimatedPressable
                  style={styles.policyCard}
                  onPress={() => setExpandedPolicy(expandedPolicy === 'privacy' ? null : 'privacy')}
                >
                  <View style={styles.policyHeader}>
                    <View style={styles.policyIconContainer}>
                      <Shield size={24} color="#10B981" />
                    </View>
                    <View style={styles.policyTitleContainer}>
                      <Text style={styles.policyTitle}>Integritetspolicy</Text>
                      <Text style={styles.policySubtitle}>
                        Tryck för att {expandedPolicy === 'privacy' ? 'dölja' : 'läsa'}
                      </Text>
                    </View>
                  </View>
                </AnimatedPressable>
                
                {expandedPolicy === 'privacy' && (
                  <View style={styles.policyContent}>
                    <ScrollView style={styles.policyTextScroll} nestedScrollEnabled={true}>
                      <Text style={styles.policyText}>{PRIVACY_POLICY}</Text>
                    </ScrollView>
                  </View>
                )}
                
                <View style={styles.acceptanceContainer}>
                  <AnimatedPressable
                    style={[
                      styles.checkboxRow,
                      data.acceptedTerms && styles.checkboxRowChecked
                    ]}
                    onPress={() => setData({ ...data, acceptedTerms: !data.acceptedTerms })}
                  >
                    <View style={[
                      styles.checkbox,
                      data.acceptedTerms && styles.checkboxChecked
                    ]}>
                      {data.acceptedTerms && <Check size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Jag har läst och godkänner användarvillkoren
                    </Text>
                  </AnimatedPressable>
                  
                  <AnimatedPressable
                    style={[
                      styles.checkboxRow,
                      data.acceptedPrivacy && styles.checkboxRowChecked
                    ]}
                    onPress={() => setData({ ...data, acceptedPrivacy: !data.acceptedPrivacy })}
                  >
                    <View style={[
                      styles.checkbox,
                      data.acceptedPrivacy && styles.checkboxChecked
                    ]}>
                      {data.acceptedPrivacy && <Check size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Jag har läst och godkänner integritetspolicyn
                    </Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    style={[
                      styles.checkboxRow,
                      data.acceptedGDPR && styles.checkboxRowChecked
                    ]}
                    onPress={() => setData({ ...data, acceptedGDPR: !data.acceptedGDPR })}
                  >
                    <View style={[
                      styles.checkbox,
                      data.acceptedGDPR && styles.checkboxChecked
                    ]}>
                      {data.acceptedGDPR && <Check size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Jag godkänner behandling av personuppgifter enligt GDPR
                    </Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    style={[
                      styles.checkboxRow,
                      data.acceptedAge && styles.checkboxRowChecked
                    ]}
                    onPress={() => setData({ ...data, acceptedAge: !data.acceptedAge })}
                  >
                    <View style={[
                      styles.checkbox,
                      data.acceptedAge && styles.checkboxChecked
                    ]}>
                      {data.acceptedAge && <Check size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Jag bekräftar att jag är minst 13 år gammal
                    </Text>
                  </AnimatedPressable>
                </View>
              </View>
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Hej {user?.email?.split('@')[0] || 'där'}!</Text>
            <Text style={styles.subtitle}>Skapa ditt användarnamn och visningsnamn</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Användarnamn (för att lägga till vänner)</Text>
              <View style={styles.usernameInputContainer}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="användarnamn"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={data.username}
                  onChangeText={(text) => {
                    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setData({ ...data, username: cleanText });
                    
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
                <Text style={[styles.inputHint, { color: '#EF4444' }]}>
                  Användarnamnet är inte tillgängligt eller ogiltigt
                </Text>
              )}
              {usernameAvailable === true && (
                <Text style={[styles.inputHint, { color: '#10B981' }]}>
                  ✓ Användarnamnet är tillgängligt
                </Text>
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
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={data.displayName}
                onChangeText={(text) => setData({ ...data, displayName: text })}
                maxLength={50}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={60} color="white" style={styles.icon} />
            <Text style={styles.title}>Välj studienivå</Text>
            <Text style={styles.subtitle}>Studerar du på gymnasiet eller högskola?</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedPressable
                style={[
                  styles.optionCard,
                  data.studyLevel === 'gymnasie' && styles.selectedOptionCard
                ]}
                onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
              >
                <GraduationCap size={40} color={data.studyLevel === 'gymnasie' ? '#10B981' : 'white'} />
                <Text style={[
                  styles.optionTitle,
                  data.studyLevel === 'gymnasie' && styles.selectedOptionTitle
                ]}>
                  Gymnasiet
                </Text>
                <Text style={styles.optionDescription}>
                  Välj ditt program och årskurs
                </Text>
              </AnimatedPressable>
              
              <AnimatedPressable
                style={[
                  styles.optionCard,
                  data.studyLevel === 'högskola' && styles.selectedOptionCard
                ]}
                onPress={() => setData({ ...data, studyLevel: 'högskola' })}
              >
                <GraduationCap size={40} color={data.studyLevel === 'högskola' ? '#10B981' : 'white'} />
                <Text style={[
                  styles.optionTitle,
                  data.studyLevel === 'högskola' && styles.selectedOptionTitle
                ]}>
                  Högskola/Universitet
                </Text>
                <Text style={styles.optionDescription}>
                  Välj ditt program och termin
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        );

      default:
        return <Text style={styles.title}>Steg {step + 1} - Under utveckling</Text>;
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((step + 1) / getTotalSteps()) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {step + 1} av {getTotalSteps()}
            </Text>
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
              onPress={step === 9 && data.studyLevel === 'gymnasie' ? assignCoursesAutomatically : handleNext}
              disabled={!canProceed()}
              rippleColor="#1F2937"
              rippleOpacity={0.2}
            >
              <Text style={styles.nextButtonText}>
                {step === getTotalSteps() - 1 ? 'Slutför' : 'Nästa'}
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
  subtleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
  },
  welcomeFeatures: {
    width: '100%',
    gap: 16,
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
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
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1E293B',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
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
  },
  nextButtonText: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.4,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600' as const,
    marginTop: 16,
  },
  legalScrollView: {
    maxHeight: 450,
    width: '100%',
    marginTop: 16,
  },
  legalContainer: {
    gap: 16,
  },
  policyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  policyTitleContainer: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 4,
  },
  policySubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  policyContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 16,
    marginTop: -8,
  },
  policyTextScroll: {
    maxHeight: 200,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  acceptanceContainer: {
    gap: 12,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxRowChecked: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1E293B',
    lineHeight: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginTop: 24,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedOptionCard: {
    backgroundColor: 'white',
    borderColor: '#10B981',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  selectedOptionTitle: {
    color: '#1E293B',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
});
