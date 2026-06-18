import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { usePremium } from '@/contexts/PremiumContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';
import type { University, UniversityProgram, UniversityProgramYear } from '@/constants/universities';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';
import { PurchasesPackage } from 'react-native-purchases';
import { ROUTES } from '@/utils/typedRoutes';

import {
  type OnboardingData,
  type StepProps,
  type StepName,
  ACCENT,
  TEXT1,
  TEXT2,
  TEXT3,
} from '@/components/onboarding/shared';
import { onboardingStyles as styles } from '@/components/onboarding/styles';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import IntroStep from '@/components/onboarding/IntroStep';
import LevelStep from '@/components/onboarding/LevelStep';
import SchoolStep from '@/components/onboarding/SchoolStep';
import ProblemsStep from '@/components/onboarding/ProblemsStep';
import StressStep from '@/components/onboarding/StressStep';
import NotAloneStep from '@/components/onboarding/NotAloneStep';
import DailyGoalStep from '@/components/onboarding/DailyGoalStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import WowStep from '@/components/onboarding/WowStep';
import SocialProofStep from '@/components/onboarding/SocialProofStep';
import TestimonialsStep from '@/components/onboarding/TestimonialsStep';
import PaywallStep from '@/components/onboarding/PaywallStep';

const { width: SW, height: SH } = Dimensions.get('window');

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

const QUESTION_STEPS: StepName[] = ['level', 'school', 'problems', 'stress', 'dailygoal', 'goals'];
const PROGRESS_LABEL: Partial<Record<StepName, string>> = {
  level: 'Utbildning',
  school: 'Skola',
  problems: 'Utmaningar',
  stress: 'Stress',
  dailygoal: 'Mål',
  goals: 'Önskemål',
};

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
      router.replace(ROUTES.home);
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
        router.replace(ROUTES.home);
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
