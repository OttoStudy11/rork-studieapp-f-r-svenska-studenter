import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Users,
  Timer,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Search,
  Star,
  Zap,
} from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS } from '@/constants/gymnasiums';
import { SWEDISH_UNIVERSITIES, UNIVERSITY_PROGRAMS } from '@/constants/universities';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';
import { MAX_COURSES } from '@/lib/course-assignment';
import type { University, UniversityProgram, UniversityProgramYear } from '@/constants/universities';
import type { AvatarConfig } from '@/constants/avatar-config';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';
import AvatarBuilder from '@/components/AvatarBuilder';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TERMS_OF_SERVICE_SHORT = `Genom att använda StudieStugan godkänner du våra användarvillkor och integritetspolicy. Vi samlar in profilinformation och studiedata för att förbättra din upplevelse. Du måste vara minst 13 år. Fullständiga villkor finns på studiestugan.se.`;

const goalOptions = [
  { id: 'better_grades', label: 'Högre betyg', icon: '📈', color: '#10B981' },
  { id: 'focus', label: 'Bättre fokus', icon: '🎯', color: '#3B82F6' },
  { id: 'planning', label: 'Bättre planering', icon: '📅', color: '#8B5CF6' },
  { id: 'reduce_stress', label: 'Mindre stress', icon: '🧘', color: '#EC4899' },
  { id: 'balance', label: 'Balans i livet', icon: '⚖️', color: '#F59E0B' },
  { id: 'motivation', label: 'Mer motivation', icon: '🔥', color: '#EF4444' },
  { id: 'friends', label: 'Studera med vänner', icon: '👥', color: '#06B6D4' },
  { id: 'techniques', label: 'Studietips', icon: '💡', color: '#22C55E' },
];

const learningPaceOptions = [
  { id: 'casual', title: 'Avslappnat', subtitle: '15-30 min/dag', icon: '🌱', color: '#10B981', hours: 0.5 },
  { id: 'regular', title: 'Regelbundet', subtitle: '30-60 min/dag', icon: '📚', color: '#3B82F6', hours: 1 },
  { id: 'intensive', title: 'Intensivt', subtitle: '60+ min/dag', icon: '🔥', color: '#EF4444', hours: 2 },
  { id: 'own', title: 'Egen takt', subtitle: 'Flexibelt', icon: '🎯', color: '#8B5CF6', hours: 1 },
];

interface OnboardingData {
  username: string;
  displayName: string;
  studyLevel: 'gymnasie' | 'högskola' | '';
  gymnasium: Gymnasium | null;
  gymnasiumProgram: GymnasiumProgram | null;
  gymnasiumGrade: GymnasiumGrade | null;
  university: University | null;
  universityProgram: UniversityProgram | null;
  universityProgramType: string | null;
  universityYear: UniversityProgramYear | null;
  program: string;
  goals: string[];
  selectedCourses: Set<string>;
  year: 1 | 2 | 3 | null;
  avatarConfig: AvatarConfig;
  dailyGoalHours: number;
  learningPace: 'casual' | 'regular' | 'intensive' | 'own' | '';
  acceptedTerms: boolean;
  notificationPreferences: {
    dailyReminders: boolean;
    achievements: boolean;
    streakReminders: boolean;
  };
}

export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
    selectedCourses: new Set(),
    year: null,
    avatarConfig: DEFAULT_AVATAR_CONFIG,
    dailyGoalHours: 1,
    learningPace: '',
    acceptedTerms: false,
    notificationPreferences: {
      dailyReminders: true,
      achievements: true,
      streakReminders: true,
    },
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);
  const [gymnasiumSearchQuery, setGymnasiumSearchQuery] = useState('');
  const [universitySearchQuery, setUniversitySearchQuery] = useState('');
  const [hasInitializedUsername, setHasInitializedUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authContext?.user?.email && !hasInitializedUsername) {
      const emailPrefix = authContext.user.email.split('@')[0] || '';
      const initialUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setData(prev => ({
        ...prev,
        displayName: emailPrefix,
        username: initialUsername,
      }));
      setHasInitializedUsername(true);
    }
  }, [authContext, hasInitializedUsername]);

  useEffect(() => {
    if (data.gymnasiumProgram && data.year) {
      const defaultGymnasium: Gymnasium = {
        id: 'default',
        name: 'Gymnasie',
        type: 'kommunal',
        city: '',
        municipality: '',
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
      setData(prev => ({
        ...prev,
        selectedCourses: new Set(mandatoryCourseIds),
      }));
    }
  }, [data.gymnasiumProgram, data.year]);

  const getTotalSteps = useCallback(() => {
    if (data.studyLevel === '') return 7;
    return data.studyLevel === 'gymnasie' ? 7 : 6;
  }, [data.studyLevel]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / getTotalSteps(),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim, getTotalSteps]);

  if (!authContext || !studyContext || !toastContext) {
    return (
      <View style={[styles.container, { backgroundColor: '#059669' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
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
        username_to_check: username,
      });
      if (error) {
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(result);
      }
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const animateTransition = (nextStep: number) => {
    const direction = nextStep > step ? -1 : 1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * 30, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(-direction * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < getTotalSteps() - 1) {
      animateTransition(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(step - 1);
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const programName =
        data.studyLevel === 'gymnasie'
          ? data.gymnasiumProgram
            ? data.gymnasiumProgram.name
            : data.program || 'Ej valt'
          : data.universityProgram
            ? data.universityProgram.name
            : data.program || 'Ej valt';

      const gymnasium: Gymnasium = data.gymnasium || {
        id: 'default',
        name: 'Gymnasie',
        type: 'kommunal',
        city: '',
        municipality: '',
      };

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
        gymnasium,
        gymnasiumGrade:
          data.studyLevel === 'gymnasie' && data.year ? String(data.year) : null,
        universityYear:
          data.studyLevel === 'högskola' && data.universityYear
            ? String(data.universityYear)
            : null,
        universityProgramId:
          data.studyLevel === 'högskola' && data.universityProgram
            ? data.universityProgram.id
            : undefined,
        avatar: data.avatarConfig,
        selectedCourses: Array.from(data.selectedCourses),
        dailyGoalHours: data.dailyGoalHours,
      });

      showSuccess('Välkommen! Din profil är klar.');
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      console.error('Onboarding error:', error);
      showError('Något gick fel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    const newGoals = data.goals.includes(goalId)
      ? data.goals.filter(id => id !== goalId)
      : [...data.goals, goalId];
    setData({ ...data, goals: newGoals });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return (
          data.username.trim().length >= 3 &&
          data.displayName.trim().length > 0 &&
          usernameAvailable === true &&
          data.acceptedTerms
        );
      case 2:
        return data.studyLevel !== '';
      case 3:
        if (data.studyLevel === 'gymnasie') {
          return data.gymnasiumProgram !== null && data.year !== null;
        }
        return data.universityProgram !== null && data.universityYear !== null;
      case 4:
        if (data.studyLevel === 'gymnasie') {
          return data.selectedCourses.size > 0 && data.selectedCourses.size <= MAX_COURSES;
        }
        return data.goals.length > 0;
      case 5:
        if (data.studyLevel === 'gymnasie') {
          return data.goals.length > 0 && data.learningPace !== '';
        }
        return data.learningPace !== '';
      case 6:
        return true;
      default:
        return false;
    }
  };

  const getStepGradient = (): readonly [string, string, string] => {
    const gradients: readonly (readonly [string, string, string])[] = [
      ['#059669', '#10B981', '#34D399'] as const,
      ['#0369A1', '#0EA5E9', '#38BDF8'] as const,
      ['#7C3AED', '#8B5CF6', '#A78BFA'] as const,
      ['#B45309', '#F59E0B', '#FBBF24'] as const,
      ['#059669', '#10B981', '#34D399'] as const,
      ['#DC2626', '#EF4444', '#F87171'] as const,
      ['#4338CA', '#6366F1', '#818CF8'] as const,
    ];
    return gradients[step % gradients.length];
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={styles.welcomeHero}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoGlow} />
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <Text style={styles.welcomeTitle}>StudieStugan</Text>
        <Text style={styles.welcomeTagline}>Din studieassistent för{'\n'}gymnasiet & högskolan</Text>
      </View>

      <View style={styles.featureGrid}>
        {[
          { icon: <BookOpen size={22} color="#10B981" />, label: 'Kurser & Lektioner' },
          { icon: <Timer size={22} color="#3B82F6" />, label: 'Pomodoro Timer' },
          { icon: <BarChart3 size={22} color="#F59E0B" />, label: 'Spåra framsteg' },
          { icon: <Trophy size={22} color="#8B5CF6" />, label: 'Achievements' },
        ].map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <View style={styles.featureIconWrap}>{f.icon}</View>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProfile = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconCircle}>
              <Users size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Din profil</Text>
            <Text style={styles.stepSubtitle}>Skapa ditt konto</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Visningsnamn</Text>
            <TextInput
              style={styles.cardInput}
              placeholder="Ditt för- och efternamn"
              placeholderTextColor="#94A3B8"
              value={data.displayName}
              onChangeText={text => setData({ ...data, displayName: text })}
              maxLength={50}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Användarnamn</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.usernameInput}
                placeholder="användarnamn"
                placeholderTextColor="#94A3B8"
                value={data.username}
                onChangeText={text => {
                  const clean = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setData({ ...data, username: clean });
                  if (clean.length >= 3) checkUsernameAvailability(clean);
                  else setUsernameAvailable(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              {checkingUsername && <ActivityIndicator size="small" color="#64748B" />}
              {usernameAvailable === true && <Check size={18} color="#10B981" />}
            </View>
            {usernameAvailable === false && (
              <Text style={styles.errorHint}>Användarnamnet är inte tillgängligt</Text>
            )}
            <Text style={styles.hint}>3-20 tecken, bokstäver, siffror och _</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[styles.termsCheckbox, data.acceptedTerms && styles.termsCheckboxChecked]}
                onPress={() => setData({ ...data, acceptedTerms: !data.acceptedTerms })}
                activeOpacity={0.7}
              >
                {data.acceptedTerms && <Check size={14} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Jag godkänner användarvillkoren, integritetspolicyn och bekräftar att jag är minst 13 år
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStudyLevel = () => (
    <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIconCircle}>
            <GraduationCap size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.stepTitle}>Studienivå</Text>
          <Text style={styles.stepSubtitle}>Var studerar du?</Text>
        </View>

        <View style={styles.levelCards}>
          <TouchableOpacity
            style={[styles.levelCard, data.studyLevel === 'gymnasie' && styles.levelCardSelected]}
            onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
            activeOpacity={0.8}
          >
            <View style={[styles.levelIconWrap, data.studyLevel === 'gymnasie' && styles.levelIconWrapSelected]}>
              <GraduationCap size={36} color={data.studyLevel === 'gymnasie' ? '#10B981' : '#94A3B8'} />
            </View>
            <Text style={[styles.levelTitle, data.studyLevel === 'gymnasie' && styles.levelTitleSelected]}>Gymnasiet</Text>
            <Text style={styles.levelDesc}>Program & årskurs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.levelCard, data.studyLevel === 'högskola' && styles.levelCardSelected]}
            onPress={() => setData({ ...data, studyLevel: 'högskola' })}
            activeOpacity={0.8}
          >
            <View style={[styles.levelIconWrap, data.studyLevel === 'högskola' && styles.levelIconWrapSelected]}>
              <BookOpen size={36} color={data.studyLevel === 'högskola' ? '#10B981' : '#94A3B8'} />
            </View>
            <Text style={[styles.levelTitle, data.studyLevel === 'högskola' && styles.levelTitleSelected]}>Högskola</Text>
            <Text style={styles.levelDesc}>Program & termin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProgramSelection = () => (
    <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIconCircle}>
            <BookOpen size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.stepTitle}>
            {data.studyLevel === 'gymnasie' ? 'Program & Årskurs' : 'Program & Termin'}
          </Text>
        </View>

        {data.studyLevel === 'gymnasie' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Välj program</Text>
              <View style={styles.programChips}>
                {[
                  { id: 'na', name: 'Naturvetenskap', emoji: '🔬', color: '#10B981' },
                  { id: 'te', name: 'Teknik', emoji: '⚙️', color: '#F59E0B' },
                  { id: 'sa', name: 'Samhällsvetenskap', emoji: '🏛️', color: '#3B82F6' },
                  { id: 'ek', name: 'Ekonomi', emoji: '💼', color: '#8B5CF6' },
                  { id: 'es', name: 'Estetiska', emoji: '🎨', color: '#EC4899' },
                  { id: 'hu', name: 'Humanistiska', emoji: '📚', color: '#06B6D4' },
                ].map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.programChip,
                      data.gymnasiumProgram?.id === p.id && { backgroundColor: p.color + '20', borderColor: p.color },
                    ]}
                    onPress={() =>
                      setData({
                        ...data,
                        gymnasiumProgram: {
                          id: p.id,
                          name: p.name + 'programmet',
                          abbreviation: p.id.toUpperCase(),
                          category: 'högskoleförberedande',
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.programChipEmoji}>{p.emoji}</Text>
                    <Text
                      style={[
                        styles.programChipText,
                        data.gymnasiumProgram?.id === p.id && { color: p.color, fontWeight: '700' as const },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {data.gymnasiumProgram && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Välj årskurs</Text>
                <View style={styles.yearRow}>
                  {[1, 2, 3].map(y => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearBtn, data.year === y && styles.yearBtnSelected]}
                      onPress={() => setData({ ...data, year: y as 1 | 2 | 3 })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.yearBtnText, data.year === y && styles.yearBtnTextSelected]}>
                        År {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Välj gymnasium (valfritt)</Text>
              <View style={styles.searchRow}>
                <Search size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök gymnasium..."
                  placeholderTextColor="#94A3B8"
                  value={gymnasiumSearchQuery}
                  onChangeText={setGymnasiumSearchQuery}
                />
              </View>
              <ScrollView style={styles.schoolList} nestedScrollEnabled>
                {SWEDISH_GYMNASIUMS.filter(g =>
                  g.name.toLowerCase().includes(gymnasiumSearchQuery.toLowerCase())
                )
                  .slice(0, 12)
                  .map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.schoolItem, data.gymnasium?.id === g.id && styles.schoolItemSelected]}
                      onPress={() => setData({ ...data, gymnasium: g })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.schoolName, data.gymnasium?.id === g.id && styles.schoolNameSelected]}>
                          {g.name}
                        </Text>
                        <Text style={styles.schoolCity}>{g.city}</Text>
                      </View>
                      {data.gymnasium?.id === g.id && <Check size={16} color="#10B981" />}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </>
        )}

        {data.studyLevel === 'högskola' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Välj programtyp</Text>
              <View style={styles.programChips}>
                {[
                  { type: 'civilingenjör', name: 'Civilingenjör', emoji: '⚙️', color: '#F59E0B' },
                  { type: 'högskoleingenjör', name: 'Högskoleingenjör', emoji: '🔧', color: '#10B981' },
                  { type: 'professionsprogram', name: 'Professionsprogram', emoji: '🎓', color: '#3B82F6' },
                  { type: 'kandidat', name: 'Kandidat', emoji: '📚', color: '#8B5CF6' },
                  { type: 'yrkeshögskola', name: 'YH', emoji: '💼', color: '#EC4899' },
                ].map(pt => (
                  <TouchableOpacity
                    key={pt.type}
                    style={[
                      styles.programChip,
                      data.universityProgramType === pt.type && { backgroundColor: pt.color + '20', borderColor: pt.color },
                    ]}
                    onPress={() =>
                      setData({
                        ...data,
                        universityProgramType: pt.type,
                        universityProgram: null,
                        universityYear: null,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.programChipEmoji}>{pt.emoji}</Text>
                    <Text
                      style={[
                        styles.programChipText,
                        data.universityProgramType === pt.type && { color: pt.color, fontWeight: '700' as const },
                      ]}
                    >
                      {pt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {data.universityProgramType && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Välj program</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {UNIVERSITY_PROGRAMS.filter(p => p.degreeType === data.universityProgramType).map(prog => {
                    const isSelected = data.universityProgram?.id === prog.id;
                    return (
                      <TouchableOpacity
                        key={prog.id}
                        style={[styles.horizChip, isSelected && styles.horizChipSelected]}
                        onPress={() => setData({ ...data, universityProgram: prog, universityYear: null })}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.horizChipText, isSelected && styles.horizChipTextSelected]} numberOfLines={1}>
                          {prog.name.replace(/^(Civilingenjör|Högskoleingenjör|Kandidatprogram i) - ?/, '')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {data.universityProgram && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Välj termin</Text>
                <View style={styles.yearRow}>
                  {Array.from(
                    { length: Math.min(data.universityProgram.durationYears * 2, 10) },
                    (_, i) => i + 1
                  ).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.yearBtn, data.universityYear === t && styles.yearBtnSelected]}
                      onPress={() => setData({ ...data, universityYear: t as UniversityProgramYear })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.yearBtnText, data.universityYear === t && styles.yearBtnTextSelected]}>
                        T{t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Välj högskola (valfritt)</Text>
              <View style={styles.searchRow}>
                <Search size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök högskola..."
                  placeholderTextColor="#94A3B8"
                  value={universitySearchQuery}
                  onChangeText={setUniversitySearchQuery}
                />
              </View>
              <ScrollView style={styles.schoolList} nestedScrollEnabled>
                {SWEDISH_UNIVERSITIES.filter(
                  u =>
                    u.name.toLowerCase().includes(universitySearchQuery.toLowerCase()) ||
                    u.city.toLowerCase().includes(universitySearchQuery.toLowerCase())
                )
                  .slice(0, 12)
                  .map(u => (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.schoolItem, data.university?.id === u.id && styles.schoolItemSelected]}
                      onPress={() => setData({ ...data, university: u })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.schoolName, data.university?.id === u.id && styles.schoolNameSelected]}>
                          {u.name}
                        </Text>
                        <Text style={styles.schoolCity}>{u.city}</Text>
                      </View>
                      {data.university?.id === u.id && <Check size={16} color="#10B981" />}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderCourses = () => {
    if (data.studyLevel === 'gymnasie') {
      return (
        <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconCircle}>
                <BookOpen size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>Välj kurser</Text>
              <Text style={styles.stepSubtitle}>
                {data.selectedCourses.size}/{MAX_COURSES} kurser valda
              </Text>
            </View>
            {availableCourses.map(course => (
              <TouchableOpacity
                key={course.id}
                style={[styles.courseItem, data.selectedCourses.has(course.id) && styles.courseItemSelected]}
                onPress={() => {
                  const newSelected = new Set(data.selectedCourses);
                  if (newSelected.has(course.id)) {
                    if (!course.mandatory) newSelected.delete(course.id);
                  } else if (newSelected.size < MAX_COURSES) {
                    newSelected.add(course.id);
                  }
                  setData({ ...data, selectedCourses: newSelected });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.courseEmoji}>📚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.courseName, data.selectedCourses.has(course.id) && styles.courseNameSelected]}>
                    {course.name}
                  </Text>
                  {course.mandatory && <Text style={styles.mandatoryBadge}>Obligatorisk</Text>}
                </View>
                {data.selectedCourses.has(course.id) && <Check size={18} color="#10B981" />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconCircle}>
              <Target size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Studiemål</Text>
            <Text style={styles.stepSubtitle}>Välj minst ett mål</Text>
          </View>
          <View style={styles.goalsGrid}>
            {goalOptions.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalChip,
                  data.goals.includes(goal.id) && { backgroundColor: goal.color + '18', borderColor: goal.color },
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalEmoji}>{goal.icon}</Text>
                <Text style={[styles.goalLabel, data.goals.includes(goal.id) && { color: goal.color, fontWeight: '700' as const }]}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderGoalsAndPace = () => (
    <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        {data.studyLevel === 'gymnasie' && (
          <>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconCircle}>
                <Target size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>Mål & Tempo</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Studiemål</Text>
              <View style={styles.goalsGrid}>
                {goalOptions.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalChip,
                      data.goals.includes(goal.id) && { backgroundColor: goal.color + '18', borderColor: goal.color },
                    ]}
                    onPress={() => toggleGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalEmoji}>{goal.icon}</Text>
                    <Text style={[styles.goalLabel, data.goals.includes(goal.id) && { color: goal.color, fontWeight: '700' as const }]}>
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {data.studyLevel !== 'gymnasie' && (
          <View style={styles.stepHeader}>
            <View style={styles.stepIconCircle}>
              <Flame size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Studietempo</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Välj tempo</Text>
          {learningPaceOptions.map(pace => (
            <TouchableOpacity
              key={pace.id}
              style={[
                styles.paceItem,
                data.learningPace === pace.id && { backgroundColor: pace.color + '12', borderColor: pace.color },
              ]}
              onPress={() =>
                setData({ ...data, learningPace: pace.id as any, dailyGoalHours: pace.hours })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.paceEmoji}>{pace.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paceTitle, data.learningPace === pace.id && { color: pace.color }]}>
                  {pace.title}
                </Text>
                <Text style={styles.paceSubtitle}>{pace.subtitle}</Text>
              </View>
              {data.learningPace === pace.id && <Check size={18} color={pace.color} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderFinish = () => (
    <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
            <Sparkles size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.stepTitle}>Allt klart! 🎉</Text>
          <Text style={styles.stepSubtitle}>Anpassa din avatar och börja studera</Text>
        </View>

        <View style={styles.avatarSection}>
          <AvatarBuilder
            config={data.avatarConfig}
            onConfigChange={config => setData({ ...data, avatarConfig: config })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Notifikationer</Text>
          {[
            { key: 'dailyReminders' as const, label: 'Dagliga påminnelser', desc: 'Påminnelse att studera' },
            { key: 'achievements' as const, label: 'Achievements', desc: 'När du låser upp prestationer' },
            { key: 'streakReminders' as const, label: 'Streak-påminnelser', desc: 'Behåll din streak' },
          ].map(n => (
            <View key={n.key} style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.label}</Text>
                <Text style={styles.notifDesc}>{n.desc}</Text>
              </View>
              <Switch
                value={data.notificationPreferences[n.key]}
                onValueChange={val =>
                  setData({
                    ...data,
                    notificationPreferences: { ...data.notificationPreferences, [n.key]: val },
                  })
                }
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nivå</Text>
            <Text style={styles.summaryValue}>
              {data.studyLevel === 'gymnasie' ? 'Gymnasiet' : 'Högskola'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Program</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {data.gymnasiumProgram?.name || data.universityProgram?.name || '-'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tempo</Text>
            <Text style={styles.summaryValue}>
              {learningPaceOptions.find(p => p.id === data.learningPace)?.title || '-'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderProfile();
      case 2:
        return renderStudyLevel();
      case 3:
        return renderProgramSelection();
      case 4:
        return renderCourses();
      case 5:
        return renderGoalsAndPace();
      case 6:
        return renderFinish();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={getStepGradient()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={[styles.safeArea, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.topBar}>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {step + 1}/{getTotalSteps()}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.animatedContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {renderStep()}
          </Animated.View>

          <View style={styles.bottomBar}>
            {step > 0 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                <ChevronLeft size={20} color="#FFFFFF" />
                <Text style={styles.backBtnText}>Tillbaka</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={!canProceed() || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#1E293B" />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>
                    {step === getTotalSteps() - 1 ? 'Slutför' : 'Nästa'}
                  </Text>
                  <ArrowRight size={18} color="#1E293B" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600' as const,
    minWidth: 30,
    textAlign: 'right',
  },
  animatedContent: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
    minWidth: 100,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
    flex: 1,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  stepScroll: {
    flex: 1,
  },
  stepContent: {
    paddingBottom: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  stepIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  welcomeHero: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative' as const,
  },
  logoGlow: {
    position: 'absolute' as const,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  welcomeTagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    width: (SCREEN_WIDTH - 64) / 2,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1E293B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#475569',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  cardInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  atSign: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    padding: 0,
  },
  hint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsCheckboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  levelCards: {
    flexDirection: 'row',
    gap: 16,
  },
  levelCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  levelCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  levelIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelIconWrapSelected: {
    backgroundColor: '#F0FDF4',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelTitleSelected: {
    color: '#1E293B',
  },
  levelDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  programChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  programChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  programChipEmoji: {
    fontSize: 20,
  },
  programChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#475569',
  },
  yearRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  yearBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  yearBtnSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  yearBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#475569',
  },
  yearBtnTextSelected: {
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
  },
  schoolList: {
    maxHeight: 180,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  schoolItemSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  schoolNameSelected: {
    color: '#059669',
  },
  schoolCity: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  horizontalScroll: {
    marginBottom: 4,
  },
  horizChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  horizChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  horizChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#475569',
  },
  horizChipTextSelected: {
    color: '#FFFFFF',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  courseItemSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  courseEmoji: {
    fontSize: 22,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  courseNameSelected: {
    color: '#059669',
  },
  mandatoryBadge: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  goalEmoji: {
    fontSize: 18,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#475569',
  },
  paceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  paceEmoji: {
    fontSize: 24,
  },
  paceTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  paceSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  avatarSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  notifDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    maxWidth: 180,
  },
});
