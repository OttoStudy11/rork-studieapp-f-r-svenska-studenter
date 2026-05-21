import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { usePremium } from '@/contexts/PremiumContext';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import {
  ChevronLeft,
  ArrowRight,
  Search,
  Check,
  Star,
  Crown,
  Shield,
  RefreshCw,
} from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS } from '@/constants/gymnasiums';
import { SWEDISH_UNIVERSITIES, UNIVERSITY_PROGRAMS } from '@/constants/universities';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';
import { KOMVUX_COURSES, KOMVUX_SUBJECT_CATEGORIES, getKomvuxCoursesBySubject, type KomvuxCourse } from '@/constants/komvux-courses';
import { MAX_COURSES } from '@/lib/course-assignment';
import type { University, UniversityProgram, UniversityProgramYear } from '@/constants/universities';
import type { AvatarConfig } from '@/constants/avatar-config';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';
import { PurchasesPackage } from 'react-native-purchases';

const { width: SW, height: SH } = Dimensions.get('window');

const BG = '#FFFFFF';
const BG2 = '#F2F2F7';
const TEXT1 = '#1C1C1E';
const TEXT2 = '#636366';
const TEXT3 = '#AEAEB2';
const ACCENT = '#10B981';
const DARK_BTN = '#1C1C1E';
const BORDER = '#E5E5EA';

const TOTAL_QUESTION_STEPS = 8;

const PROBLEMS = [
  { id: 'procrastination', label: 'Svårt att komma igång', emoji: '😰' },
  { id: 'memory', label: 'För mycket att komma ihåg', emoji: '📚' },
  { id: 'time', label: 'Dålig tidsplanering', emoji: '⏰' },
  { id: 'motivation', label: 'Låg motivation', emoji: '😴' },
  { id: 'focus', label: 'Svårt att fokusera', emoji: '📝' },
  { id: 'start', label: 'Vet inte var jag ska börja', emoji: '🎯' },
];

const GOALS = [
  { id: 'better_grades', label: 'Bättre betyg', emoji: '🎯' },
  { id: 'hp_score', label: 'Högre HP-poäng', emoji: '📈' },
  { id: 'less_stress', label: 'Mindre stress', emoji: '😌' },
  { id: 'routines', label: 'Bättre studierutiner', emoji: '💪' },
  { id: 'memory', label: 'Komma ihåg mer', emoji: '🧠' },
  { id: 'save_time', label: 'Spara tid', emoji: '⏰' },
  { id: 'dreams', label: 'Nå mina drömmar', emoji: '🏆' },
];

const DAILY_MINS = [
  { value: 15, label: '15 minuter', note: '' },
  { value: 30, label: '30 minuter', note: 'REKOMMENDERAD' },
  { value: 45, label: '45 minuter', note: '' },
  { value: 60, label: '60 minuter', note: '' },
  { value: 90, label: '90+ minuter', note: '' },
];

const TESTIMONIALS = [
  {
    text: 'StudieStugan hjälpte mig höja mitt HP-resultat från 1.0 till 1.6!',
    name: 'Emma',
    age: 19,
    city: 'Stockholm',
  },
  {
    text: 'Äntligen en app som förstår hur stressigt det är att plugga. AI-flashcards är magiska!',
    name: 'Viktor',
    age: 20,
    city: 'Göteborg',
  },
  {
    text: 'Quizzen sparade mig timmar inför tentan. 10/10 rekommenderar!',
    name: 'Erik',
    age: 18,
    city: 'Gävle',
  },
];

interface OnboardingData {
  username: string;
  displayName: string;
  studyLevel: 'gymnasie' | 'högskola' | 'komvux' | '';
  gymnasium: Gymnasium | null;
  gymnasiumProgram: GymnasiumProgram | null;
  gymnasiumGrade: GymnasiumGrade | null;
  university: University | null;
  universityProgram: UniversityProgram | null;
  universityProgramType: string | null;
  universityYear: UniversityProgramYear | null;
  program: string;
  goals: string[];
  problems: string[];
  selectedCourses: Set<string>;
  year: 1 | 2 | 3 | null;
  avatarConfig: AvatarConfig;
  dailyGoalMinutes: number;
  stressLevel: number;
  acceptedTerms: boolean;
}

const STEPS = [
  'welcome',
  'profile',
  'intro',
  'level',
  'school',
  'problems',
  'stress',
  'notalone',
  'dailygoal',
  'goals',
  'wow',
  'socialproof',
  'testimonials',
  'paywall',
] as const;

type StepName = typeof STEPS[number];

const QUESTION_STEPS: StepName[] = ['level', 'school', 'problems', 'stress', 'dailygoal', 'goals'];
const PROGRESS_LABEL: Partial<Record<StepName, string>> = {
  level: 'Utbildning',
  school: 'Skola',
  problems: 'Utmaningar',
  stress: 'Stress',
  dailygoal: 'Mål',
  goals: 'Önskemål',
};

function getStressEmoji(val: number): string {
  if (val <= 2) return '😌';
  if (val <= 4) return '🙂';
  if (val <= 6) return '😐';
  if (val <= 8) return '😟';
  return '😰';
}

function getStressLabel(val: number): string {
  if (val <= 2) return 'Jag är ganska lugn.';
  if (val <= 4) return 'Jag känner lite stress ibland.';
  if (val <= 6) return 'Jag känner mig stressad ibland.';
  if (val <= 8) return 'Jag känner mig ofta stressad.';
  return 'Jag är extremt stressad inför prov.';
}

export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  const premiumContext = usePremium();
  const insets = useSafeAreaInsets();

  const [stepIdx, setStepIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const testimonialIdx = useRef(0);
  const [testimonialDisplay, setTestimonialDisplay] = useState(0);

  const [komvuxSubjectFilter, setKomvuxSubjectFilter] = useState<string>('all');

  const [data, setData] = useState<OnboardingData>({
    username: '',
    displayName: '',
    studyLevel: '',
    gymnasium: null,
    gymnasiumProgram: null,
    gymnasiumGrade: null,
    university: null,
    universityProgram: null,
    universityProgramType: null,
    universityYear: null,
    program: '',
    goals: [],
    problems: [],
    selectedCourses: new Set(),
    year: null,
    avatarConfig: DEFAULT_AVATAR_CONFIG,
    dailyGoalMinutes: 30,
    stressLevel: 5,
    acceptedTerms: false,
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);
  const [gymnasiumSearch, setGymnasiumSearch] = useState('');
  const [universitySearch, setUniversitySearch] = useState('');
  const [hasInitUsername, setHasInitUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<'annual' | 'monthly'>('annual');
  const [isRestoringPurchase, setIsRestoringPurchase] = useState(false);

  const currentStep: StepName = STEPS[stepIdx];

  useEffect(() => {
    if (authContext?.user?.email && !hasInitUsername) {
      const prefix = authContext.user.email.split('@')[0] || '';
      setData(prev => ({
        ...prev,
        displayName: prefix,
        username: prefix.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      }));
      setHasInitUsername(true);
    }
  }, [authContext, hasInitUsername]);

  useEffect(() => {
    if (data.gymnasiumProgram && data.year) {
      const gym: Gymnasium = data.gymnasium || {
        id: 'default', name: 'Gymnasie', type: 'kommunal', city: '', municipality: '',
      };
      const courses = getGymnasiumCourses(gym, data.gymnasiumProgram, data.year.toString() as '1' | '2' | '3');
      setAvailableCourses(courses);
      const mandatoryIds = courses.filter((c: GymnasiumCourse) => c.mandatory).map((c: GymnasiumCourse) => c.id);
      setData(prev => ({ ...prev, selectedCourses: new Set(mandatoryIds) }));
    }
  }, [data.gymnasiumProgram, data.year]);

  useEffect(() => {
    if (currentStep === 'paywall' && premiumContext) {
      premiumContext.getOfferings().then(off => {
        if (off?.availablePackages) setOfferings(off.availablePackages);
      }).catch(() => {});
    }
  }, [currentStep, premiumContext]);

  const questionStepIndex = QUESTION_STEPS.indexOf(currentStep);
  const isQuestionStep = questionStepIndex >= 0;
  const questionProgress = isQuestionStep ? (questionStepIndex + 1) / QUESTION_STEPS.length : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: questionProgress,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [questionProgress, progressAnim]);

  const animateTransition = useCallback((nextIdx: number) => {
    const dir = nextIdx > stepIdx ? -1 : 1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * 24, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setStepIdx(nextIdx);
      slideAnim.setValue(-dir * 24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    });
  }, [stepIdx, fadeAnim, slideAnim]);

  const goNext = useCallback(() => {
    if (stepIdx < STEPS.length - 1) {
      animateTransition(stepIdx + 1);
    } else {
      handleComplete();
    }
  }, [stepIdx, animateTransition]);

  const goBack = useCallback(() => {
    if (stepIdx > 0) animateTransition(stepIdx - 1);
  }, [stepIdx, animateTransition]);

  const handleComplete = async () => {
    if (isSubmitting || !authContext || !studyContext || !toastContext) return;
    setIsSubmitting(true);
    try {
      const programName =
        data.studyLevel === 'gymnasie'
          ? data.gymnasiumProgram?.name || data.program || 'Ej valt'
          : data.studyLevel === 'komvux'
          ? 'Komvux'
          : data.universityProgram?.name || data.program || 'Ej valt';

      const gym: Gymnasium = data.gymnasium || {
        id: 'default', name: 'Gymnasie', type: 'kommunal', city: '', municipality: '',
      };

      await studyContext.completeOnboarding({
        name: data.displayName,
        username: data.username,
        displayName: data.displayName,
        email: authContext.user?.email || '',
        studyLevel: data.studyLevel as 'gymnasie' | 'högskola' | 'komvux',
        program: programName,
        purpose: data.goals.join(', ') || 'Allmän studiehjälp',
        subscriptionType: 'free',
        gymnasium: gym,
        gymnasiumGrade: data.studyLevel === 'gymnasie' && data.year ? String(data.year) : null,
        universityYear: data.studyLevel === 'högskola' && data.universityYear ? String(data.universityYear) : null,
        komvuxYear: data.studyLevel === 'komvux' ? 'Komvux' : null,
        universityProgramId: data.studyLevel === 'högskola' && data.universityProgram ? data.universityProgram.id : undefined,
        komvuxCourses: data.studyLevel === 'komvux' ? Array.from(data.selectedCourses) : undefined,
        avatar: data.avatarConfig,
        selectedCourses: Array.from(data.selectedCourses),
        dailyGoalHours: data.dailyGoalMinutes / 60,
      });

      toastContext.showSuccess('Välkommen till StudieStugan! 🎉');
      router.replace('/(tabs)/home' as any);
    } catch (err) {
      console.error('Onboarding complete error:', err);
      toastContext?.showError('Något gick fel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchase = async () => {
    if (!premiumContext || isPurchasing) return;
    const pkg = offerings.find(p =>
      selectedPkg === 'annual' ? p.packageType === 'ANNUAL' || p.identifier.includes('annual') || p.identifier.includes('year')
        : p.packageType === 'MONTHLY' || p.identifier.includes('monthly') || p.identifier.includes('month')
    ) || offerings[0];
    if (!pkg) {
      handleComplete();
      return;
    }
    setIsPurchasing(true);
    try {
      const success = await premiumContext.purchasePackage(pkg);
      if (success) {
        toastContext?.showSuccess('Premium aktiverat! 🎉');
        router.replace('/(tabs)/home' as any);
      }
    } catch (err) {
      console.error('Purchase error:', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!premiumContext || isRestoringPurchase) return;
    setIsRestoringPurchase(true);
    try {
      await premiumContext.restorePurchases();
      toastContext?.showSuccess('Köp återställt!');
    } catch {
      toastContext?.showError('Kunde inte återställa köp');
    } finally {
      setIsRestoringPurchase(false);
    }
  };

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) { setUsernameAvailable(null); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) { setUsernameAvailable(false); return; }
    setCheckingUsername(true);
    try {
      const { data: result, error } = await supabase.rpc('check_username_available', { username_to_check: username });
      setUsernameAvailable(error ? null : result);
    } catch { setUsernameAvailable(null); }
    finally { setCheckingUsername(false); }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'welcome': return true;
      case 'profile':
        return data.username.length >= 3 && data.displayName.length > 0 && usernameAvailable === true && data.acceptedTerms;
      case 'intro': return true;
      case 'level': return data.studyLevel !== '';
      case 'school':
        if (data.studyLevel === 'gymnasie') return data.gymnasiumProgram !== null && data.year !== null;
        if (data.studyLevel === 'komvux') return data.selectedCourses.size > 0;
        return data.universityProgram !== null && data.universityYear !== null;
      case 'problems': return data.problems.length > 0;
      case 'stress': return true;
      case 'notalone': return true;
      case 'dailygoal': return true;
      case 'goals': return data.goals.length > 0;
      case 'wow': return true;
      case 'socialproof': return true;
      case 'testimonials': return true;
      case 'paywall': return true;
      default: return false;
    }
  };

  const showHeader = !['welcome', 'intro', 'notalone', 'wow', 'socialproof', 'testimonials', 'paywall'].includes(currentStep);
  const showProgress = isQuestionStep;

  if (!authContext || !studyContext || !toastContext) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={ACCENT} /></View>;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {showHeader && (
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronLeft size={24} color={TEXT1} />
          </TouchableOpacity>
          {showProgress && (
            <Text style={styles.stepLabel}>
              {questionStepIndex + 1} / {QUESTION_STEPS.length}{' '}
              <Text style={styles.stepLabelName}>{PROGRESS_LABEL[currentStep]}</Text>
            </Text>
          )}
          {!showProgress && <View style={{ flex: 1 }} />}
          {isQuestionStep && (
            <TouchableOpacity onPress={goNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.skipText}>Hoppa över</Text>
            </TouchableOpacity>
          )}
          {!isQuestionStep && <View style={{ width: 80 }} />}
        </View>
      )}

      {showProgress && (
        <View style={styles.progressContainer}>
          {QUESTION_STEPS.map((_, i) => (
            <View key={i} style={styles.progressSegmentWrap}>
              <View
                style={[
                  styles.progressSegment,
                  i <= questionStepIndex && styles.progressSegmentActive,
                ]}
              />
            </View>
          ))}
        </View>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <StepRenderer
          step={currentStep}
          data={data}
          setData={setData}
          usernameAvailable={usernameAvailable}
          checkingUsername={checkingUsername}
          checkUsername={checkUsername}
          availableCourses={availableCourses}
          gymnasiumSearch={gymnasiumSearch}
          setGymnasiumSearch={setGymnasiumSearch}
          universitySearch={universitySearch}
          setUniversitySearch={setUniversitySearch}
          komvuxSubjectFilter={komvuxSubjectFilter}
          setKomvuxSubjectFilter={setKomvuxSubjectFilter}
          testimonialDisplay={testimonialDisplay}
          setTestimonialDisplay={setTestimonialDisplay}
          offerings={offerings}
          selectedPkg={selectedPkg}
          setSelectedPkg={setSelectedPkg}
          isPurchasing={isPurchasing}
          isRestoringPurchase={isRestoringPurchase}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onSkip={handleComplete}
        />
      </Animated.View>

      {currentStep !== 'paywall' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !canProceed() && styles.ctaDisabled]}
            onPress={goNext}
            disabled={!canProceed() || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {currentStep === 'welcome' ? 'Kom igång' : currentStep === 'testimonials' ? 'Fortsätt' : 'Fortsätt'}
                </Text>
                <ArrowRight size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface StepProps {
  step: StepName;
  data: OnboardingData;
  setData: (d: OnboardingData) => void;
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
  checkUsername: (u: string) => void;
  availableCourses: GymnasiumCourse[];
  gymnasiumSearch: string;
  setGymnasiumSearch: (s: string) => void;
  universitySearch: string;
  setUniversitySearch: (s: string) => void;
  komvuxSubjectFilter: string;
  setKomvuxSubjectFilter: (s: string) => void;
  testimonialDisplay: number;
  setTestimonialDisplay: (n: number) => void;
  offerings: PurchasesPackage[];
  selectedPkg: 'annual' | 'monthly';
  setSelectedPkg: (t: 'annual' | 'monthly') => void;
  isPurchasing: boolean;
  isRestoringPurchase: boolean;
  onPurchase: () => void;
  onRestore: () => void;
  onSkip: () => void;
}

function StepRenderer(props: StepProps) {
  const { step } = props;
  switch (step) {
    case 'welcome': return <WelcomeStep {...props} />;
    case 'profile': return <ProfileStep {...props} />;
    case 'intro': return <IntroStep {...props} />;
    case 'level': return <LevelStep {...props} />;
    case 'school': return <SchoolStep {...props} />;
    case 'problems': return <ProblemsStep {...props} />;
    case 'stress': return <StressStep {...props} />;
    case 'notalone': return <NotAloneStep {...props} />;
    case 'dailygoal': return <DailyGoalStep {...props} />;
    case 'goals': return <GoalsStep {...props} />;
    case 'wow': return <WowStep {...props} />;
    case 'socialproof': return <SocialProofStep {...props} />;
    case 'testimonials': return <TestimonialsStep {...props} />;
    case 'paywall': return <PaywallStep {...props} />;
    default: return null;
  }
}

function WelcomeStep({ }: StepProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim, alignItems: 'center' }}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
            style={styles.logoImg}
            contentFit="contain"
          />
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.welcomeTitle}>
          Du behöver inte plugga hårdare.{'\n'}Du behöver plugga <Text style={{ color: ACCENT }}>smartare.</Text>
        </Text>
        <Text style={styles.welcomeBody}>
          Allt du behöver är <Text style={styles.bold}>rätt verktyg</Text> och{' '}
          <Text style={styles.bold}>en personlig plan</Text> som funkar för dig.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

function ProfileStep({ data, setData, usernameAvailable, checkingUsername, checkUsername }: StepProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Bra jobbat! 🎉</Text>
        <Text style={styles.pageSubtitle}>Tusentals studenter har förbättrat sina resultat. Låt oss skapa din profil.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vad heter du?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ditt namn"
            placeholderTextColor={TEXT3}
            value={data.displayName}
            onChangeText={t => setData({ ...data, displayName: t })}
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Välj användarnamn</Text>
          <View style={styles.usernameRow}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={[styles.input, { flex: 1, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
              placeholder="användarnamn"
              placeholderTextColor={TEXT3}
              value={data.username}
              onChangeText={t => {
                const clean = t.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setData({ ...data, username: clean });
                if (clean.length >= 3) checkUsername(clean);
                else { }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <View style={styles.usernameStatus}>
              {checkingUsername && <ActivityIndicator size="small" color={TEXT3} />}
              {usernameAvailable === true && <Check size={16} color={ACCENT} />}
              {usernameAvailable === false && <Text style={{ color: '#EF4444', fontSize: 12 }}>✕</Text>}
            </View>
          </View>
          {usernameAvailable === false && (
            <Text style={styles.errorTxt}>Användarnamnet är inte tillgängligt</Text>
          )}
          <Text style={styles.hintTxt}>3–20 tecken, bokstäver, siffror och _</Text>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setData({ ...data, acceptedTerms: !data.acceptedTerms })}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, data.acceptedTerms && styles.checkboxOn]}>
            {data.acceptedTerms && <Check size={12} color="#fff" />}
          </View>
          <Text style={styles.termsText}>Jag godkänner användarvillkoren och bekräftar att jag är minst 13 år</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function IntroStep({ }: StepProps) {
  return (
    <ScrollView contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 24 }}>🎓</Text>
      <Text style={styles.pageTitle}>För att hjälpa dig bäst behöver vi förstå din situation</Text>
      <Text style={styles.pageBody}>Några snabba frågor – tar bara 60 sekunder.</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardText}>✓ Dina svar används för att personalisera din studieplan</Text>
        <Text style={styles.infoCardText}>✓ Du kan hoppa över frågor du inte vill svara på</Text>
        <Text style={styles.infoCardText}>✓ Du kan ändra allt i inställningarna senare</Text>
      </View>
    </ScrollView>
  );
}

const EDUCATION_PATHS = [
  {
    id: 'gymnasie',
    label: 'Gymnasiet',
    sub: 'Naturvetenskap, Teknik, Samhäll...',
    emoji: '📚',
    color: '#10B981',
    bgColor: '#ECFDF5',
    description: 'Välj program, kurs och lägg upp din gymnasieskolgång steg för steg.',
  },
  {
    id: 'högskola',
    label: 'Högskola / Universitet',
    sub: 'Kandidat, Civilingenjör, Master...',
    emoji: '🎓',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Koppla ditt program, välj termin och hämta rekommenderade kurser automatiskt.',
  },
  {
    id: 'komvux',
    label: 'Komvux',
    sub: 'Komplettera betyg, läsa upp kurser...',
    emoji: '🏫',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    description: 'Välj exakt de kurser du ska läsa och get en personlig studieplan.',
  },
] as const;

function LevelStep({ data, setData }: StepProps) {
  const entryAnims = useRef(EDUCATION_PATHS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    EDUCATION_PATHS.forEach((_, i) => {
      Animated.timing(entryAnims[i], {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Var pluggar du?</Text>
      <Text style={styles.pageSubtitle}>Välj din utbildningsnivå så anpassar vi appen för dig.</Text>
      <View style={{ gap: 14, marginTop: 12 }}>
        {EDUCATION_PATHS.map((opt, i) => {
          const sel = data.studyLevel === opt.id;
          return (
            <Animated.View
              key={opt.id}
              style={{ opacity: entryAnims[i], transform: [{ translateY: entryAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}
            >
              <TouchableOpacity
                style={[
                  styles.eduCard,
                  sel && { borderColor: opt.color, borderWidth: 2.5, backgroundColor: opt.bgColor },
                  !sel && { borderColor: BORDER, borderWidth: 1.5 },
                ]}
                onPress={() => setData({ ...data, studyLevel: opt.id as any, selectedCourses: new Set() })}
                activeOpacity={0.8}
              >
                <View style={[styles.eduCardIconWrap, sel && { backgroundColor: opt.color }]}>
                  <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eduCardTitle, sel && { color: opt.color }]}>{opt.label}</Text>
                  <Text style={styles.eduCardSub}>{opt.description}</Text>
                </View>
                <View style={[styles.optionCheck, sel ? { backgroundColor: opt.color } : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: BORDER }]}>
                  {sel && <Check size={13} color="#fff" />}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.levelHintCard}>
        <Text style={styles.levelHintText}>💡 Du kan alltid byta utbildningstyp i inställningarna senare</Text>
      </View>
    </ScrollView>
  );
}

function SchoolStep({ data, setData, availableCourses, gymnasiumSearch, setGymnasiumSearch, universitySearch, setUniversitySearch, komvuxSubjectFilter, setKomvuxSubjectFilter }: StepProps) {
  if (data.studyLevel === 'komvux') {
    return <KomvuxSchoolStep data={data} setData={setData} komvuxSubjectFilter={komvuxSubjectFilter} setKomvuxSubjectFilter={setKomvuxSubjectFilter} />;
  }

  if (data.studyLevel === 'gymnasie') {
    return (
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionTitle}>Vilket program går du?</Text>

        <View style={{ gap: 10, marginTop: 8 }}>
          {[
            { id: 'na', name: 'Naturvetenskap', emoji: '🔬' },
            { id: 'te', name: 'Teknik', emoji: '⚙️' },
            { id: 'sa', name: 'Samhällsvetenskap', emoji: '🏛️' },
            { id: 'ek', name: 'Ekonomi', emoji: '💼' },
            { id: 'es', name: 'Estetiska', emoji: '🎨' },
            { id: 'hu', name: 'Humanistiska', emoji: '📚' },
          ].map(p => {
            const sel = data.gymnasiumProgram?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.optionCard, sel && styles.optionCardSel]}
                onPress={() => setData({ ...data, gymnasiumProgram: { id: p.id, name: p.name + 'programmet', abbreviation: p.id.toUpperCase(), category: 'högskoleförberedande' } })}
                activeOpacity={0.75}
              >
                <Text style={styles.optionEmoji}>{p.emoji}</Text>
                <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{p.name}</Text>
                {sel && <View style={styles.optionCheck}><Check size={13} color="#fff" /></View>}
              </TouchableOpacity>
            );
          })}
        </View>

        {data.gymnasiumProgram && (
          <>
            <Text style={[styles.questionTitle, { marginTop: 28 }]}>Vilken årskurs?</Text>
            <View style={styles.yearRow}>
              {[1, 2, 3].map(y => (
                <TouchableOpacity key={y} style={[styles.yearBtn, data.year === y && styles.yearBtnSel]} onPress={() => setData({ ...data, year: y as 1 | 2 | 3 })} activeOpacity={0.75}>
                  <Text style={[styles.yearBtnText, data.year === y && styles.yearBtnTextSel]}>År {y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {data.year && availableCourses.length > 0 && (
          <>
            <Text style={[styles.questionTitle, { marginTop: 28 }]}>Välj dina kurser</Text>
            <Text style={styles.pageSubtitle}>{data.selectedCourses.size}/{MAX_COURSES} valda</Text>
            {availableCourses.map((course: GymnasiumCourse) => {
              const sel = data.selectedCourses.has(course.id);
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[styles.courseRow, sel && styles.courseRowSel]}
                  onPress={() => {
                    const ns = new Set(data.selectedCourses);
                    if (ns.has(course.id)) { if (!course.mandatory) ns.delete(course.id); }
                    else if (ns.size < MAX_COURSES) ns.add(course.id);
                    setData({ ...data, selectedCourses: ns });
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.smallCheck, sel && styles.smallCheckOn]}>{sel && <Check size={11} color="#fff" />}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.courseTitle, sel && { color: ACCENT }]}>{course.name}</Text>
                    {course.mandatory && <Text style={styles.mandTag}>Obligatorisk</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Text style={[styles.questionTitle, { marginTop: 28 }]}>Gymnasium (valfritt)</Text>
        <View style={styles.searchRow}>
          <Search size={16} color={TEXT3} />
          <TextInput style={styles.searchInput} placeholder="Sök gymnasium..." placeholderTextColor={TEXT3} value={gymnasiumSearch} onChangeText={setGymnasiumSearch} />
        </View>
        {gymnasiumSearch.length > 0 && SWEDISH_GYMNASIUMS.filter(g => g.name.toLowerCase().includes(gymnasiumSearch.toLowerCase())).slice(0, 8).map(g => {
          const sel = data.gymnasium?.id === g.id;
          return (
            <TouchableOpacity key={g.id} style={[styles.listItem, sel && styles.listItemSel]} onPress={() => setData({ ...data, gymnasium: g })} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listItemTitle, sel && { color: ACCENT }]}>{g.name}</Text>
                <Text style={styles.listItemSub}>{g.city}</Text>
              </View>
              {sel && <Check size={15} color={ACCENT} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vilken programtyp?</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {[
          { type: 'civilingenjör', name: 'Civilingenjör', emoji: '⚙️' },
          { type: 'högskoleingenjör', name: 'Högskoleingenjör', emoji: '🔧' },
          { type: 'professionsprogram', name: 'Professionsprogram', emoji: '🎓' },
          { type: 'kandidat', name: 'Kandidatprogram', emoji: '📚' },
          { type: 'yrkeshögskola', name: 'Yrkeshögskola', emoji: '💼' },
        ].map(pt => {
          const sel = data.universityProgramType === pt.type;
          return (
            <TouchableOpacity key={pt.type} style={[styles.optionCard, sel && styles.optionCardSel]} onPress={() => setData({ ...data, universityProgramType: pt.type, universityProgram: null, universityYear: null })} activeOpacity={0.75}>
              <Text style={styles.optionEmoji}>{pt.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{pt.name}</Text>
              {sel && <View style={styles.optionCheck}><Check size={13} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {data.universityProgramType && (
        <>
          <Text style={[styles.questionTitle, { marginTop: 28 }]}>Välj program</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {UNIVERSITY_PROGRAMS.filter(p => p.degreeType === data.universityProgramType).map(prog => {
              const sel = data.universityProgram?.id === prog.id;
              return (
                <TouchableOpacity key={prog.id} style={[styles.hChip, sel && styles.hChipSel]} onPress={() => setData({ ...data, universityProgram: prog, universityYear: null })} activeOpacity={0.75}>
                  <Text style={[styles.hChipText, sel && styles.hChipTextSel]} numberOfLines={1}>
                    {prog.name.replace(/^(Civilingenjör|Högskoleingenjör|Kandidatprogram i) - ?/, '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {data.universityProgram && (
        <>
          <Text style={[styles.questionTitle, { marginTop: 28 }]}>Vilken termin?</Text>
          <View style={[styles.yearRow, { flexWrap: 'wrap', gap: 8 }]}>
            {Array.from({ length: Math.min(data.universityProgram.durationYears * 2, 10) }, (_, i) => i + 1).map(t => (
              <TouchableOpacity key={t} style={[styles.yearBtn, data.universityYear === t && styles.yearBtnSel]} onPress={() => setData({ ...data, universityYear: t as UniversityProgramYear })} activeOpacity={0.75}>
                <Text style={[styles.yearBtnText, data.universityYear === t && styles.yearBtnTextSel]}>T{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.questionTitle, { marginTop: 28 }]}>Högskola / Universitet (valfritt)</Text>
      <View style={styles.searchRow}>
        <Search size={16} color={TEXT3} />
        <TextInput style={styles.searchInput} placeholder="Sök högskola..." placeholderTextColor={TEXT3} value={universitySearch} onChangeText={setUniversitySearch} />
      </View>
      {universitySearch.length > 0 && SWEDISH_UNIVERSITIES.filter(u => u.name.toLowerCase().includes(universitySearch.toLowerCase()) || u.city.toLowerCase().includes(universitySearch.toLowerCase())).slice(0, 8).map(u => {
        const sel = data.university?.id === u.id;
        return (
          <TouchableOpacity key={u.id} style={[styles.listItem, sel && styles.listItemSel]} onPress={() => setData({ ...data, university: u })} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.listItemTitle, sel && { color: ACCENT }]}>{u.name}</Text>
              <Text style={styles.listItemSub}>{u.city}</Text>
            </View>
            {sel && <Check size={15} color={ACCENT} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function KomvuxSchoolStep({ data, setData, komvuxSubjectFilter, setKomvuxSubjectFilter }: Pick<StepProps, 'data' | 'setData' | 'komvuxSubjectFilter' | 'setKomvuxSubjectFilter'>) {
  const filteredCourses = getKomvuxCoursesBySubject(komvuxSubjectFilter);
  const selectedCount = data.selectedCourses.size;

  const toggleCourse = (courseId: string) => {
    const ns = new Set(data.selectedCourses);
    if (ns.has(courseId)) {
      ns.delete(courseId);
    } else if (ns.size < MAX_COURSES) {
      ns.add(courseId);
    }
    setData({ ...data, selectedCourses: ns });
  };

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vilka kurser läser du?</Text>
      <Text style={styles.pageSubtitle}>
        {selectedCount === 0
          ? 'Välj de kurser du vill läsa på Komvux'
          : `${selectedCount} kurs${selectedCount !== 1 ? 'er' : ''} valda (ögonsblicksbild)`}
      </Text>

      {/* Subject category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginBottom: 4 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {KOMVUX_SUBJECT_CATEGORIES.map(cat => {
          const active = komvuxSubjectFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.subjectChip,
                active && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}
              onPress={() => setKomvuxSubjectFilter(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.subjectChipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.subjectChipText, active && { color: '#fff', fontWeight: '700' as const }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recommended banner */}
      {komvuxSubjectFilter === 'all' && selectedCount === 0 && (
        <View style={styles.komvuxRecommendBanner}>
          <Text style={styles.komvuxRecommendText}>
            💡 Vanligast bland Komvux-elever: Svenska 1, Engelska 5, Matematik 1b, Historia 1b, Samhällskunskap 1b
          </Text>
        </View>
      )}

      {/* Course list */}
      <View style={{ gap: 8, marginTop: 12 }}>
        {filteredCourses.map((course: KomvuxCourse) => {
          const sel = data.selectedCourses.has(course.id);
          const atMax = selectedCount >= MAX_COURSES && !sel;
          return (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.komvuxCourseRow,
                sel && styles.komvuxCourseRowSel,
                atMax && { opacity: 0.45 },
              ]}
              onPress={() => !atMax && toggleCourse(course.id)}
              activeOpacity={atMax ? 1 : 0.75}
            >
              <View style={[styles.smallCheck, sel && styles.smallCheckOn]}>
                {sel && <Check size={11} color="#fff" />}
              </View>
              <Text style={styles.komvuxCourseEmoji}>{course.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.courseTitle, sel && { color: ACCENT }]}>{course.name}</Text>
                <Text style={styles.komvuxCourseMeta}>{course.points} p · {course.code}</Text>
              </View>
              {sel && (
                <View style={styles.komvuxSelBadge}>
                  <Check size={12} color={ACCENT} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedCount >= MAX_COURSES && (
        <Text style={[styles.hintTxt, { marginTop: 12, color: '#F59E0B' }]}>
          Max {MAX_COURSES} kurser valda
        </Text>
      )}
    </ScrollView>
  );
}

function ProblemsStep({ data, setData }: StepProps) {
  const toggle = (id: string) => {
    const np = data.problems.includes(id) ? data.problems.filter(x => x !== id) : [...data.problems, id];
    setData({ ...data, problems: np });
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vad är ditt största problem med studierna?</Text>
      <Text style={styles.pageSubtitle}>Du kan välja flera</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {PROBLEMS.map(p => {
          const sel = data.problems.includes(p.id);
          return (
            <TouchableOpacity key={p.id} style={[styles.optionCard, sel && styles.optionCardSel]} onPress={() => toggle(p.id)} activeOpacity={0.75}>
              <Text style={styles.optionEmoji}>{p.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{p.label}</Text>
              {sel && <View style={styles.optionCheck}><Check size={13} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StressStep({ data, setData }: StepProps) {
  const sliderWidth = SW - 48;
  const thumbSize = 28;
  const trackWidth = sliderWidth - thumbSize;
  const thumbX = useRef(new Animated.Value((data.stressLevel / 10) * trackWidth)).current;
  const currentVal = useRef(data.stressLevel);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gs) => {
        const currentThumbX = (currentVal.current / 10) * trackWidth;
        const newX = Math.max(0, Math.min(trackWidth, currentThumbX + gs.dx));
        thumbX.setValue(newX);
        const newVal = Math.round((newX / trackWidth) * 10);
        if (newVal !== currentVal.current) {
          currentVal.current = newVal;
          setData({ ...data, stressLevel: newVal });
        }
      },
      onPanResponderRelease: (_, gs) => {
        const currentThumbX = (currentVal.current / 10) * trackWidth;
        const newX = Math.max(0, Math.min(trackWidth, currentThumbX + gs.dx));
        const snappedVal = Math.round((newX / trackWidth) * 10);
        const snappedX = (snappedVal / 10) * trackWidth;
        Animated.spring(thumbX, { toValue: snappedX, tension: 80, friction: 8, useNativeDriver: false }).start();
        currentVal.current = snappedVal;
        setData({ ...data, stressLevel: snappedVal });
      },
    })
  ).current;

  const fillWidth = thumbX.interpolate({ inputRange: [0, trackWidth], outputRange: [thumbSize / 2, trackWidth + thumbSize / 2], extrapolate: 'clamp' });

  return (
    <View style={styles.page}>
      <Text style={styles.questionTitle}>Hur stressad brukar du vara inför prov?</Text>

      <View style={styles.stressCenter}>
        <Text style={styles.stressEmoji}>{getStressEmoji(data.stressLevel)}</Text>
        <Text style={styles.stressLabel}>{getStressLabel(data.stressLevel)}</Text>

        <View style={[styles.sliderTrack, { width: sliderWidth }]} {...panResponder.panHandlers}>
          <Animated.View style={[styles.sliderFill, { width: fillWidth }]} />
          <Animated.View style={[styles.sliderThumb, { transform: [{ translateX: thumbX }] }]} />
        </View>

        <View style={[styles.sliderLabels, { width: sliderWidth }]}>
          <Text style={styles.sliderLabelText}>😌 Lugn</Text>
          <Text style={styles.sliderLabelText}>😰 Extremt stressad</Text>
        </View>
      </View>
    </View>
  );
}

function NotAloneStep({ data }: StepProps) {
  const pct = Math.max(10, Math.min(90, data.stressLevel * 10));
  const totalDots = 100;
  const stressedDots = Math.round((pct / 100) * totalDots);

  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <View style={styles.dotGrid}>
        {Array.from({ length: totalDots }).map((_, i) => (
          <Text key={i} style={[styles.dot, i < stressedDots ? styles.dotStressed : styles.dotGrey]}>
            {i < stressedDots ? '●' : '○'}
          </Text>
        ))}
      </View>
      <Text style={styles.bigTitle}>Du är inte ensam 💙</Text>
      <Text style={styles.bigBody}>
        <Text style={styles.bold}>{pct}%</Text> av svenska studenter känner samma stress inför prov.
      </Text>
      <Text style={[styles.bigBody, { marginTop: 12 }]}>
        68% kämpar med <Text style={styles.bold}>motivationen</Text>.{'\n'}
        81% vill ha bättre <Text style={styles.bold}>studierutiner</Text>.{'\n\n'}
        Vi är här för att hjälpa 🙏
      </Text>
    </ScrollView>
  );
}

function DailyGoalStep({ data, setData }: StepProps) {
  const problem = data.problems[0];
  const motivText = problem === 'motivation'
    ? 'Det känns som att du ibland saknar motivation. Låt oss ändra på det!'
    : problem === 'time'
      ? 'Med en daglig plan blir tidshanteringen mycket enklare.'
      : 'Konsistens är nyckeln – välj en tid du kan hålla varje dag.';

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Hur många minuter vill du plugga per dag?</Text>
      <Text style={styles.pageSubtitle}>{motivText}</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {DAILY_MINS.map(opt => {
          const sel = data.dailyGoalMinutes === opt.value;
          return (
            <TouchableOpacity key={opt.value} style={[styles.optionCard, sel && styles.optionCardSel]} onPress={() => setData({ ...data, dailyGoalMinutes: opt.value })} activeOpacity={0.75}>
              <Text style={styles.optionEmoji}>⏱️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{opt.label}</Text>
                {opt.note ? <Text style={styles.recommendedTag}>{opt.note}</Text> : null}
              </View>
              {sel && <View style={styles.optionCheck}><Check size={13} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hintTxt}>Vi rekommenderar att börja med 30 minuter</Text>
    </ScrollView>
  );
}

function GoalsStep({ data, setData }: StepProps) {
  const toggle = (id: string) => {
    const ng = data.goals.includes(id) ? data.goals.filter(x => x !== id) : [...data.goals, id];
    setData({ ...data, goals: ng });
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vad vill du uppnå med StudieStugan?</Text>
      <Text style={styles.pageSubtitle}>Välj allt som stämmer</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {GOALS.map(g => {
          const sel = data.goals.includes(g.id);
          return (
            <TouchableOpacity key={g.id} style={[styles.optionCard, sel && styles.optionCardSel]} onPress={() => toggle(g.id)} activeOpacity={0.75}>
              <Text style={styles.optionEmoji}>{g.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{g.label}</Text>
              {sel && <View style={styles.optionCheck}><Check size={13} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function WowStep({ data }: StepProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Animated.Text style={[styles.wowEmoji, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>✨</Animated.Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.bigTitle}>Från och med nu blir allt kristallklart</Text>
        <Text style={styles.bigBody}>Vi har skapat din personliga studieplan baserat på:</Text>
        <View style={styles.checkList}>
          {[
            `Din stressnivå (${data.stressLevel}/10)`,
            `Dina ${data.goals.length || 1} studiemål`,
            `${data.dailyGoalMinutes} minuter per dag`,
            `Dina utmaningar`,
          ].map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <View style={styles.checkBubble}><Check size={14} color="#fff" /></View>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function SocialProofStep({ }: StepProps) {
  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigTitle}>Betrodd av tusentals svenska studenter</Text>

      <View style={styles.statsRow}>
        {[
          { value: '4.8 ⭐', label: 'Betyg' },
          { value: 'Tusentals', label: 'Studenter' },
          { value: '92%', label: 'Nöjda' },
        ].map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bigBody}>StudieStugan har hjälpt tusentals svenska studenter nå sina mål – från gymnasiet till universitetet.</Text>

      <View style={styles.featureList}>
        {[
          '🤖 Personlig AI-studiecoach',
          '🎴 Smart flashcard-system',
          '📊 Djupgående statistik',
          '⚔️ Plugga mot kompisar',
          '🎯 Högskoleprovet-träning',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function TestimonialsStep({ testimonialDisplay, setTestimonialDisplay }: StepProps) {
  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigTitle}>Vad andra studenter säger</Text>

      <View style={styles.testimonialCard}>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} color="#F59E0B" fill="#F59E0B" />
          ))}
        </View>
        <Text style={styles.testimonialText}>"{TESTIMONIALS[testimonialDisplay].text}"</Text>
        <Text style={styles.testimonialAuthor}>
          — {TESTIMONIALS[testimonialDisplay].name}, {TESTIMONIALS[testimonialDisplay].age}, {TESTIMONIALS[testimonialDisplay].city}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {TESTIMONIALS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setTestimonialDisplay(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={[styles.testimonialDot, i === testimonialDisplay && styles.testimonialDotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Shield size={16} color={ACCENT} />
          <Text style={styles.trustText}>Säkra betalningar</Text>
        </View>
        <View style={styles.trustItem}>
          <RefreshCw size={16} color={ACCENT} />
          <Text style={styles.trustText}>Avsluta när du vill</Text>
        </View>
        <View style={styles.trustItem}>
          <Crown size={16} color={ACCENT} />
          <Text style={styles.trustText}>7 dagars gratis</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PaywallStep({ offerings, selectedPkg, setSelectedPkg, isPurchasing, isRestoringPurchase, onPurchase, onRestore, onSkip }: StepProps) {
  const insets = useSafeAreaInsets();
  const annualPkg = offerings.find(p => p.packageType === 'ANNUAL' || p.identifier.includes('annual') || p.identifier.includes('year'));
  const monthlyPkg = offerings.find(p => p.packageType === 'MONTHLY' || p.identifier.includes('monthly') || p.identifier.includes('month'));

  const annualPrice = annualPkg?.product?.priceString || '249 kr/år';
  const monthlyPrice = monthlyPkg?.product?.priceString || '49 kr/mån';
  const annualMonthly = annualPkg ? `Endast ${((annualPkg.product?.price || 249) / 12).toFixed(0)} kr/månad` : 'Endast 21 kr/månad';

  const FEATURES = [
    'Personlig AI-studieplan',
    'Obegränsade AI-flashcards',
    'Högskoleprovet-träning',
    'Svenska kurser & lektioner',
    'Plugga med vänner – Battle',
    'Obegränsade quiz & tester',
    'Avancerad statistik & insikter',
    'Ingen reklam',
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.paywallPage, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paywallHeader}>
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
          style={styles.paywallLogo}
          contentFit="contain"
        />
        <TouchableOpacity onPress={onSkip} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.paywallTitle}>{'Få full tillgång till\nStudieStugan Premium.'}</Text>
      <Text style={styles.paywallSub}>Avsluta när du vill.</Text>

      <Text style={[styles.bigBody, { textAlign: 'left', marginTop: 12, marginBottom: 20 }]}>
        Vi vill att du ska använda StudieStugan om det <Text style={styles.bold}>verkligen förändrar dina studieresultat</Text>. Välj en plan och kom igång direkt.
      </Text>

      <Text style={styles.featuresSectionTitle}>Allt ingår i Premium:</Text>
      {FEATURES.map((f, i) => (
        <View key={i} style={styles.paywallFeatureRow}>
          <View style={styles.paywallCheck}><Check size={13} color="#fff" /></View>
          <Text style={styles.paywallFeatureText}>{f}</Text>
        </View>
      ))}

      <View style={{ gap: 12, marginTop: 28 }}>
        <TouchableOpacity
          style={[styles.pkgCard, selectedPkg === 'annual' && styles.pkgCardSel]}
          onPress={() => setSelectedPkg('annual')}
          activeOpacity={0.85}
        >
          <View style={styles.pkgPopular}>
            <Text style={styles.pkgPopularText}>MEST POPULÄR</Text>
          </View>
          <View style={styles.pkgRow}>
            <View>
              <Text style={styles.pkgTitle}>📦 Årsplan</Text>
              <Text style={styles.pkgSub}>{annualMonthly}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pkgPrice}>{annualPrice}</Text>
              <View style={[styles.pkgRadio, selectedPkg === 'annual' && styles.pkgRadioSel]}>
                {selectedPkg === 'annual' && <View style={styles.pkgRadioInner} />}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pkgCard, selectedPkg === 'monthly' && styles.pkgCardSel]}
          onPress={() => setSelectedPkg('monthly')}
          activeOpacity={0.85}
        >
          <View style={styles.pkgRow}>
            <View>
              <Text style={styles.pkgTitle}>📦 Månadsplan</Text>
              <Text style={styles.pkgSub}>Förnyas månadsvis</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pkgPrice}>{monthlyPrice}</Text>
              <View style={[styles.pkgRadio, selectedPkg === 'monthly' && styles.pkgRadioSel]}>
                {selectedPkg === 'monthly' && <View style={styles.pkgRadioInner} />}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.cta, { marginTop: 24 }]} onPress={onPurchase} disabled={isPurchasing} activeOpacity={0.88}>
        {isPurchasing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Kom igång med Premium</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipPaywallBtn} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipPaywallText}>Fortsätt utan premium</Text>
      </TouchableOpacity>

      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Shield size={14} color={TEXT3} />
          <Text style={styles.trustBadgeText}>Säkra betalningar</Text>
        </View>
        <View style={styles.trustBadge}>
          <RefreshCw size={14} color={TEXT3} />
          <Text style={styles.trustBadgeText}>Avsluta när du vill</Text>
        </View>
      </View>

      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={isRestoringPurchase ? undefined : onRestore}>
          <Text style={styles.legalLink}>{isRestoringPurchase ? 'Återställer...' : 'Återställ köp'}</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/terms' as any)}>
          <Text style={styles.legalLink}>Villkor</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/privacy-policy' as any)}>
          <Text style={styles.legalLink}>Integritetspolicy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Education path cards
  eduCard: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eduCardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: BG2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  eduCardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: TEXT1,
    marginBottom: 3,
  },
  eduCardSub: {
    fontSize: 13,
    color: TEXT2,
    lineHeight: 18,
  },
  levelHintCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  levelHintText: {
    fontSize: 13,
    color: TEXT2,
    lineHeight: 18,
  },
  // Komvux styles
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BG2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  subjectChipEmoji: {
    fontSize: 14,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT2,
  },
  komvuxRecommendBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  komvuxRecommendText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  komvuxCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BG2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  komvuxCourseRowSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  komvuxCourseEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  komvuxCourseMeta: {
    fontSize: 12,
    color: TEXT3,
    marginTop: 2,
  },
  komvuxSelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: TEXT2,
    textAlign: 'center',
  },
  stepLabelName: {
    color: TEXT1,
  },
  skipText: {
    fontSize: 14,
    color: TEXT2,
    fontWeight: '500' as const,
    width: 80,
    textAlign: 'right',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 4,
    marginBottom: 4,
  },
  progressSegmentWrap: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: BG2,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    backgroundColor: BG2,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: ACCENT,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cta: {
    backgroundColor: DARK_BTN,
    borderRadius: 32,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaDisabled: {
    backgroundColor: '#C7C7CC',
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  centered: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  page: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bigPage: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  logoImg: {
    width: 68,
    height: 68,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT1,
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  welcomeBody: {
    fontSize: 18,
    color: TEXT2,
    lineHeight: 28,
  },
  bold: {
    fontWeight: '700' as const,
    color: TEXT1,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: TEXT1,
    lineHeight: 38,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: TEXT2,
    lineHeight: 24,
    marginBottom: 4,
  },
  pageBody: {
    fontSize: 17,
    color: TEXT2,
    lineHeight: 26,
    marginTop: 8,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    width: '100%',
  },
  infoCardText: {
    fontSize: 15,
    color: '#065F46',
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  questionTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: TEXT1,
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT2,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: BG2,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 17,
    color: TEXT1,
    borderWidth: 0,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  atSign: {
    paddingLeft: 16,
    fontSize: 17,
    color: TEXT2,
    fontWeight: '600' as const,
  },
  usernameStatus: {
    paddingRight: 14,
    paddingLeft: 8,
  },
  errorTxt: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
  },
  hintTxt: {
    color: TEXT3,
    fontSize: 13,
    marginTop: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: TEXT2,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG2,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: TEXT1,
    flex: 1,
  },
  optionLabelSel: {
    color: ACCENT,
  },
  optionSub: {
    fontSize: 13,
    color: TEXT3,
    marginTop: 2,
  },
  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  yearBtn: {
    flex: 1,
    backgroundColor: BG2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yearBtnSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  yearBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT2,
  },
  yearBtnTextSel: {
    color: ACCENT,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG2,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  courseRowSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  smallCheck: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCheckOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT1,
  },
  mandTag: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  listItemSel: {
    backgroundColor: '#ECFDF5',
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT1,
  },
  listItemSub: {
    fontSize: 12,
    color: TEXT3,
    marginTop: 1,
  },
  hChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BG2,
    borderRadius: 22,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hChipSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  hChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT2,
    maxWidth: 160,
  },
  hChipTextSel: {
    color: ACCENT,
  },
  stressCenter: {
    alignItems: 'center',
    marginTop: 40,
  },
  stressEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  stressLabel: {
    fontSize: 17,
    color: TEXT2,
    fontWeight: '500' as const,
    marginBottom: 40,
    textAlign: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: BG2,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 6,
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    top: -11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  sliderLabelText: {
    fontSize: 13,
    color: TEXT3,
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SW - 48,
    marginBottom: 28,
  },
  dot: {
    fontSize: 14,
    lineHeight: 20,
    width: (SW - 48) / 10,
    textAlign: 'center',
  },
  dotStressed: {
    color: '#EF4444',
  },
  dotGrey: {
    color: '#E5E5EA',
  },
  bigTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: TEXT1,
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  bigBody: {
    fontSize: 17,
    color: TEXT2,
    lineHeight: 28,
  },
  wowEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  checkList: {
    gap: 14,
    marginTop: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 16,
    color: TEXT1,
    fontWeight: '500' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: BG2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: TEXT1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT2,
    fontWeight: '500' as const,
  },
  featureList: {
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  featureRow: {
    backgroundColor: BG2,
    borderRadius: 12,
    padding: 14,
  },
  featureText: {
    fontSize: 15,
    color: TEXT1,
    fontWeight: '500' as const,
  },
  testimonialCard: {
    backgroundColor: BG2,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 14,
  },
  testimonialText: {
    fontSize: 18,
    color: TEXT1,
    lineHeight: 28,
    fontWeight: '500' as const,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: TEXT2,
    fontWeight: '600' as const,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  testimonialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BG2,
  },
  testimonialDotActive: {
    backgroundColor: DARK_BTN,
    width: 20,
    borderRadius: 4,
  },
  trustRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trustText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600' as const,
  },
  recommendedTag: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: ACCENT,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  paywallPage: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  paywallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paywallLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: TEXT2,
    fontWeight: '700' as const,
  },
  paywallTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT1,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  paywallSub: {
    fontSize: 22,
    fontWeight: '400' as const,
    color: TEXT3,
    marginTop: 2,
    marginBottom: 4,
  },
  featuresSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT2,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  paywallCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  paywallFeatureText: {
    fontSize: 16,
    color: TEXT1,
    fontWeight: '500' as const,
  },
  pkgCard: {
    backgroundColor: BG2,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  pkgCardSel: {
    backgroundColor: '#ECFDF5',
    borderColor: ACCENT,
  },
  pkgPopular: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  pkgPopularText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  pkgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pkgTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: TEXT1,
  },
  pkgSub: {
    fontSize: 13,
    color: TEXT2,
    marginTop: 3,
  },
  pkgPrice: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: TEXT1,
    marginBottom: 6,
  },
  pkgRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pkgRadioSel: {
    borderColor: ACCENT,
  },
  pkgRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  skipPaywallBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  skipPaywallText: {
    fontSize: 15,
    color: TEXT2,
    fontWeight: '500' as const,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustBadgeText: {
    fontSize: 12,
    color: TEXT3,
    fontWeight: '500' as const,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    paddingBottom: 8,
  },
  legalLink: {
    fontSize: 12,
    color: TEXT3,
    textDecorationLine: 'underline',
  },
  legalSep: {
    fontSize: 12,
    color: TEXT3,
  },
});
