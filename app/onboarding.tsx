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
  Flame,
  Target,
  Sparkles,
  Trophy,
  Users,
  Timer,
  BarChart3,
  ChevronLeft,
  ArrowRight,
  Search,
  Check,
  Zap,
  Brain,
  Rocket,
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

const goalOptions = [
  { id: 'better_grades', label: 'Högre betyg', icon: '📈', color: '#34D399' },
  { id: 'focus', label: 'Bättre fokus', icon: '🎯', color: '#60A5FA' },
  { id: 'planning', label: 'Bättre planering', icon: '📅', color: '#A78BFA' },
  { id: 'reduce_stress', label: 'Mindre stress', icon: '🧘', color: '#F472B6' },
  { id: 'balance', label: 'Balans i livet', icon: '⚖️', color: '#FBBF24' },
  { id: 'motivation', label: 'Mer motivation', icon: '🔥', color: '#FB923C' },
  { id: 'friends', label: 'Studera med vänner', icon: '👥', color: '#38BDF8' },
  { id: 'techniques', label: 'Studietips', icon: '💡', color: '#4ADE80' },
];

const learningPaceOptions = [
  { id: 'casual', title: 'Avslappnat', subtitle: '15-30 min/dag', icon: '🌱', color: '#34D399', hours: 0.5 },
  { id: 'regular', title: 'Regelbundet', subtitle: '30-60 min/dag', icon: '📚', color: '#60A5FA', hours: 1 },
  { id: 'intensive', title: 'Intensivt', subtitle: '60+ min/dag', icon: '🔥', color: '#FB923C', hours: 2 },
  { id: 'own', title: 'Egen takt', subtitle: 'Flexibelt', icon: '🎯', color: '#A78BFA', hours: 1 },
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

const ACCENT = '#10B981';
const ACCENT_LIGHT = '#D1FAE5';
const BG = '#FFFFFF';
const BG_SECONDARY = '#F8FAFB';
const TEXT_PRIMARY = '#0F172A';
const TEXT_SECONDARY = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER = '#E8ECF0';
const CARD_BG = '#FFFFFF';

export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={ACCENT} />
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
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * 20, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(-direction * 20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
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

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeTop}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#059669', '#10B981', '#34D399']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
              style={styles.logo}
              contentFit="contain"
            />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.welcomeTitle}>StudieStugan</Text>
        <Text style={styles.welcomeSubtitle}>
          Din personliga studieassistent för gymnasiet & högskolan
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {[
          { icon: <BookOpen size={20} color="#059669" />, title: 'Kurser & Lektioner', bg: '#ECFDF5' },
          { icon: <Timer size={20} color="#0369A1" />, title: 'Pomodoro Timer', bg: '#E0F2FE' },
          { icon: <BarChart3 size={20} color="#B45309" />, title: 'Spåra framsteg', bg: '#FEF3C7' },
          { icon: <Trophy size={20} color="#7C3AED" />, title: 'Achievements', bg: '#EDE9FE' },
        ].map((feat, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: feat.bg }]}>
              {feat.icon}
            </View>
            <Text style={styles.featureTitle}>{feat.title}</Text>
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#E0F2FE' }]}>
            <Users size={24} color="#0369A1" />
          </View>
          <Text style={styles.sectionTitle}>Skapa din profil</Text>
          <Text style={styles.sectionDesc}>Välj ett namn och användarnamn</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Visningsnamn</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ditt för- och efternamn"
              placeholderTextColor={TEXT_MUTED}
              value={data.displayName}
              onChangeText={text => setData({ ...data, displayName: text })}
              maxLength={50}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Användarnamn</Text>
          <View style={[styles.inputWrapper, styles.usernameWrapper]}>
            <Text style={styles.atPrefix}>@</Text>
            <TextInput
              style={[styles.textInput, { flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }]}
              placeholder="användarnamn"
              placeholderTextColor={TEXT_MUTED}
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
            {checkingUsername && <ActivityIndicator size="small" color={TEXT_MUTED} />}
            {usernameAvailable === true && (
              <View style={styles.checkBadge}>
                <Check size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          {usernameAvailable === false && (
            <Text style={styles.errorText}>Användarnamnet är inte tillgängligt</Text>
          )}
          <Text style={styles.hintText}>3-20 tecken, bokstäver, siffror och _</Text>
        </View>

        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setData({ ...data, acceptedTerms: !data.acceptedTerms })}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, data.acceptedTerms && styles.checkboxChecked]}>
            {data.acceptedTerms && <Check size={13} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsLabel}>
            Jag godkänner användarvillkoren och bekräftar att jag är minst 13 år
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStudyLevel = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: '#EDE9FE' }]}>
          <GraduationCap size={24} color="#7C3AED" />
        </View>
        <Text style={styles.sectionTitle}>Var studerar du?</Text>
        <Text style={styles.sectionDesc}>Välj din utbildningsnivå</Text>
      </View>

      <View style={styles.levelRow}>
        <TouchableOpacity
          style={[styles.levelCard, data.studyLevel === 'gymnasie' && styles.levelCardActive]}
          onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={data.studyLevel === 'gymnasie' ? ['#059669', '#10B981'] : ['#F1F5F9', '#F8FAFC']}
            style={styles.levelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <GraduationCap size={40} color={data.studyLevel === 'gymnasie' ? '#FFFFFF' : '#94A3B8'} />
          </LinearGradient>
          <Text style={[styles.levelTitle, data.studyLevel === 'gymnasie' && styles.levelTitleActive]}>
            Gymnasiet
          </Text>
          <Text style={styles.levelSub}>Program & årskurs</Text>
          {data.studyLevel === 'gymnasie' && (
            <View style={styles.levelCheck}>
              <Check size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.levelCard, data.studyLevel === 'högskola' && styles.levelCardActive]}
          onPress={() => setData({ ...data, studyLevel: 'högskola' })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={data.studyLevel === 'högskola' ? ['#0369A1', '#0EA5E9'] : ['#F1F5F9', '#F8FAFC']}
            style={styles.levelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BookOpen size={40} color={data.studyLevel === 'högskola' ? '#FFFFFF' : '#94A3B8'} />
          </LinearGradient>
          <Text style={[styles.levelTitle, data.studyLevel === 'högskola' && styles.levelTitleActive]}>
            Högskola
          </Text>
          <Text style={styles.levelSub}>Program & termin</Text>
          {data.studyLevel === 'högskola' && (
            <View style={[styles.levelCheck, { backgroundColor: '#0EA5E9' }]}>
              <Check size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProgramSelection = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
          <BookOpen size={24} color="#B45309" />
        </View>
        <Text style={styles.sectionTitle}>
          {data.studyLevel === 'gymnasie' ? 'Program & Årskurs' : 'Program & Termin'}
        </Text>
      </View>

      {data.studyLevel === 'gymnasie' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Välj program</Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'na', name: 'Naturvetenskap', emoji: '🔬', color: '#059669' },
                { id: 'te', name: 'Teknik', emoji: '⚙️', color: '#B45309' },
                { id: 'sa', name: 'Samhällsvetenskap', emoji: '🏛️', color: '#0369A1' },
                { id: 'ek', name: 'Ekonomi', emoji: '💼', color: '#7C3AED' },
                { id: 'es', name: 'Estetiska', emoji: '🎨', color: '#DB2777' },
                { id: 'hu', name: 'Humanistiska', emoji: '📚', color: '#0891B2' },
              ].map(p => {
                const selected = data.gymnasiumProgram?.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.chip,
                      selected && { backgroundColor: p.color + '12', borderColor: p.color },
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
                    <Text style={styles.chipEmoji}>{p.emoji}</Text>
                    <Text style={[styles.chipLabel, selected && { color: p.color, fontWeight: '700' as const }]}>
                      {p.name}
                    </Text>
                    {selected && (
                      <View style={[styles.chipCheck, { backgroundColor: p.color }]}>
                        <Check size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {data.gymnasiumProgram && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Välj årskurs</Text>
              <View style={styles.yearButtons}>
                {[1, 2, 3].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearBtn, data.year === y && styles.yearBtnActive]}
                    onPress={() => setData({ ...data, year: y as 1 | 2 | 3 })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yearBtnNum, data.year === y && styles.yearBtnNumActive]}>
                      {y}
                    </Text>
                    <Text style={[styles.yearBtnLabel, data.year === y && styles.yearBtnLabelActive]}>
                      År {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gymnasium (valfritt)</Text>
            <View style={styles.searchBox}>
              <Search size={16} color={TEXT_MUTED} />
              <TextInput
                style={styles.searchInput}
                placeholder="Sök gymnasium..."
                placeholderTextColor={TEXT_MUTED}
                value={gymnasiumSearchQuery}
                onChangeText={setGymnasiumSearchQuery}
              />
            </View>
            <ScrollView style={styles.listContainer} nestedScrollEnabled>
              {SWEDISH_GYMNASIUMS.filter(g =>
                g.name.toLowerCase().includes(gymnasiumSearchQuery.toLowerCase())
              )
                .slice(0, 10)
                .map(g => {
                  const selected = data.gymnasium?.id === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.listItem, selected && styles.listItemActive]}
                      onPress={() => setData({ ...data, gymnasium: g })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listItemTitle, selected && { color: '#059669' }]}>
                          {g.name}
                        </Text>
                        <Text style={styles.listItemSub}>{g.city}</Text>
                      </View>
                      {selected && <Check size={16} color="#059669" />}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </>
      )}

      {data.studyLevel === 'högskola' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Programtyp</Text>
            <View style={styles.chipGrid}>
              {[
                { type: 'civilingenjör', name: 'Civilingenjör', emoji: '⚙️', color: '#B45309' },
                { type: 'högskoleingenjör', name: 'Högskoleingenjör', emoji: '🔧', color: '#059669' },
                { type: 'professionsprogram', name: 'Profession', emoji: '🎓', color: '#0369A1' },
                { type: 'kandidat', name: 'Kandidat', emoji: '📚', color: '#7C3AED' },
                { type: 'yrkeshögskola', name: 'YH', emoji: '💼', color: '#DB2777' },
              ].map(pt => {
                const selected = data.universityProgramType === pt.type;
                return (
                  <TouchableOpacity
                    key={pt.type}
                    style={[
                      styles.chip,
                      selected && { backgroundColor: pt.color + '12', borderColor: pt.color },
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
                    <Text style={styles.chipEmoji}>{pt.emoji}</Text>
                    <Text style={[styles.chipLabel, selected && { color: pt.color, fontWeight: '700' as const }]}>
                      {pt.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {data.universityProgramType && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Välj program</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {UNIVERSITY_PROGRAMS.filter(p => p.degreeType === data.universityProgramType).map(prog => {
                  const isSelected = data.universityProgram?.id === prog.id;
                  return (
                    <TouchableOpacity
                      key={prog.id}
                      style={[styles.hChip, isSelected && styles.hChipActive]}
                      onPress={() => setData({ ...data, universityProgram: prog, universityYear: null })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.hChipText, isSelected && styles.hChipTextActive]} numberOfLines={1}>
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
              <Text style={styles.cardTitle}>Termin</Text>
              <View style={styles.yearButtons}>
                {Array.from(
                  { length: Math.min(data.universityProgram.durationYears * 2, 10) },
                  (_, i) => i + 1
                ).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.yearBtn, data.universityYear === t && styles.yearBtnActive]}
                    onPress={() => setData({ ...data, universityYear: t as UniversityProgramYear })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yearBtnNum, data.universityYear === t && styles.yearBtnNumActive]}>
                      {t}
                    </Text>
                    <Text style={[styles.yearBtnLabel, data.universityYear === t && styles.yearBtnLabelActive]}>
                      T{t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Högskola (valfritt)</Text>
            <View style={styles.searchBox}>
              <Search size={16} color={TEXT_MUTED} />
              <TextInput
                style={styles.searchInput}
                placeholder="Sök högskola..."
                placeholderTextColor={TEXT_MUTED}
                value={universitySearchQuery}
                onChangeText={setUniversitySearchQuery}
              />
            </View>
            <ScrollView style={styles.listContainer} nestedScrollEnabled>
              {SWEDISH_UNIVERSITIES.filter(
                u =>
                  u.name.toLowerCase().includes(universitySearchQuery.toLowerCase()) ||
                  u.city.toLowerCase().includes(universitySearchQuery.toLowerCase())
              )
                .slice(0, 10)
                .map(u => {
                  const selected = data.university?.id === u.id;
                  return (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.listItem, selected && styles.listItemActive]}
                      onPress={() => setData({ ...data, university: u })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listItemTitle, selected && { color: '#059669' }]}>
                          {u.name}
                        </Text>
                        <Text style={styles.listItemSub}>{u.city}</Text>
                      </View>
                      {selected && <Check size={16} color="#059669" />}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderCourses = () => {
    if (data.studyLevel === 'gymnasie') {
      return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#ECFDF5' }]}>
              <BookOpen size={24} color="#059669" />
            </View>
            <Text style={styles.sectionTitle}>Välj dina kurser</Text>
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>
                {data.selectedCourses.size} / {MAX_COURSES}
              </Text>
            </View>
          </View>

          {availableCourses.map(course => {
            const selected = data.selectedCourses.has(course.id);
            return (
              <TouchableOpacity
                key={course.id}
                style={[styles.courseRow, selected && styles.courseRowActive]}
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
                <View style={[styles.courseCheck, selected && styles.courseCheckActive]}>
                  {selected && <Check size={13} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.courseTitle, selected && { color: '#059669' }]}>
                    {course.name}
                  </Text>
                  {course.mandatory && (
                    <Text style={styles.mandatoryTag}>Obligatorisk</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    }

    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#FCE7F3' }]}>
            <Target size={24} color="#DB2777" />
          </View>
          <Text style={styles.sectionTitle}>Dina studiemål</Text>
          <Text style={styles.sectionDesc}>Välj minst ett mål</Text>
        </View>

        <View style={styles.goalsWrap}>
          {goalOptions.map(goal => {
            const selected = data.goals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalCard, selected && { borderColor: goal.color, backgroundColor: goal.color + '08' }]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={[styles.goalText, selected && { color: goal.color, fontWeight: '700' as const }]}>
                  {goal.label}
                </Text>
                {selected && (
                  <View style={[styles.goalCheck, { backgroundColor: goal.color }]}>
                    <Check size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderGoalsAndPace = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {data.studyLevel === 'gymnasie' && (
        <>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FCE7F3' }]}>
              <Target size={24} color="#DB2777" />
            </View>
            <Text style={styles.sectionTitle}>Mål & Tempo</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Studiemål</Text>
            <View style={styles.goalsWrap}>
              {goalOptions.map(goal => {
                const selected = data.goals.includes(goal.id);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.goalCard, selected && { borderColor: goal.color, backgroundColor: goal.color + '08' }]}
                    onPress={() => toggleGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text style={[styles.goalText, selected && { color: goal.color, fontWeight: '700' as const }]}>
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      )}

      {data.studyLevel !== 'gymnasie' && (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Flame size={24} color="#B45309" />
          </View>
          <Text style={styles.sectionTitle}>Studietempo</Text>
          <Text style={styles.sectionDesc}>Hur mycket vill du studera per dag?</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Välj tempo</Text>
        {learningPaceOptions.map(pace => {
          const selected = data.learningPace === pace.id;
          return (
            <TouchableOpacity
              key={pace.id}
              style={[styles.paceRow, selected && { borderColor: pace.color, backgroundColor: pace.color + '08' }]}
              onPress={() =>
                setData({ ...data, learningPace: pace.id as any, dailyGoalHours: pace.hours })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.paceIcon}>{pace.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paceName, selected && { color: pace.color }]}>
                  {pace.title}
                </Text>
                <Text style={styles.paceDetail}>{pace.subtitle}</Text>
              </View>
              {selected && (
                <View style={[styles.paceCheck, { backgroundColor: pace.color }]}>
                  <Check size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderFinish = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: '#ECFDF5' }]}>
          <Sparkles size={24} color="#059669" />
        </View>
        <Text style={styles.sectionTitle}>Nästan klart!</Text>
        <Text style={styles.sectionDesc}>Anpassa din avatar och inställningar</Text>
      </View>

      <View style={styles.card}>
        <AvatarBuilder
          config={data.avatarConfig}
          onConfigChange={config => setData({ ...data, avatarConfig: config })}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifikationer</Text>
        {[
          { key: 'dailyReminders' as const, label: 'Dagliga påminnelser', desc: 'Påminnelse att studera' },
          { key: 'achievements' as const, label: 'Achievements', desc: 'När du låser upp prestationer' },
          { key: 'streakReminders' as const, label: 'Streak-påminnelser', desc: 'Behåll din streak' },
        ].map((n, i) => (
          <View key={n.key} style={[styles.notifItem, i === 2 && { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifLabel}>{n.label}</Text>
              <Text style={styles.notifSub}>{n.desc}</Text>
            </View>
            <Switch
              value={data.notificationPreferences[n.key]}
              onValueChange={val =>
                setData({
                  ...data,
                  notificationPreferences: { ...data.notificationPreferences, [n.key]: val },
                })
              }
              trackColor={{ false: '#E2E8F0', true: '#34D399' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Sammanfattning</Text>
        {[
          { label: 'Nivå', value: data.studyLevel === 'gymnasie' ? 'Gymnasiet' : 'Högskola' },
          { label: 'Program', value: data.gymnasiumProgram?.name || data.universityProgram?.name || '-' },
          { label: 'Tempo', value: learningPaceOptions.find(p => p.id === data.learningPace)?.title || '-' },
        ].map((row, i) => (
          <View key={i} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{row.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderProfile();
      case 2: return renderStudyLevel();
      case 3: return renderProgramSelection();
      case 4: return renderCourses();
      case 5: return renderGoalsAndPace();
      case 6: return renderFinish();
      default: return null;
    }
  };

  const isLastStep = step === getTotalSteps() - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {step + 1}/{getTotalSteps()}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {renderStep()}
      </Animated.View>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ChevronLeft size={20} color={TEXT_SECONDARY} />
            <Text style={styles.backText}>Tillbaka</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ minWidth: 100 }} />
        )}

        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextText}>
                {isLastStep ? 'Slutför' : step === 0 ? 'Kom igång' : 'Nästa'}
              </Text>
              {!isLastStep && <ArrowRight size={18} color="#FFFFFF" />}
              {isLastStep && <Rocket size={18} color="#FFFFFF" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_MUTED,
    minWidth: 32,
    textAlign: 'right' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 4,
    minWidth: 100,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
    flex: 1,
    maxWidth: 220,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },

  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeTop: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: 280,
  },
  featuresContainer: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 20,
    padding: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },

  sectionHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    textAlign: 'center' as const,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center' as const,
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  textInput: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  usernameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  atPrefix: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_MUTED,
    marginRight: 4,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BG_SECONDARY,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  termsLabel: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  levelRow: {
    flexDirection: 'row',
    gap: 14,
  },
  levelCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BORDER,
    position: 'relative' as const,
  },
  levelCardActive: {
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  levelGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  levelTitleActive: {
    color: '#059669',
  },
  levelSub: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  levelCheck: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
    marginBottom: 14,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: BORDER,
    gap: 8,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
  },
  chipCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  yearBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: BG_SECONDARY,
    borderWidth: 1.5,
    borderColor: BORDER,
    minWidth: 68,
  },
  yearBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  yearBtnNum: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },
  yearBtnNumActive: {
    color: '#FFFFFF',
  },
  yearBtnLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  yearBtnLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    padding: 0,
  },
  listContainer: {
    maxHeight: 180,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listItemActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  listItemSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 1,
  },

  hChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: BG_SECONDARY,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  hChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  hChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
  },
  hChipTextActive: {
    color: '#FFFFFF',
  },

  courseBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  courseBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#059669',
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  courseRowActive: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  courseCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCheckActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  mandatoryTag: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#B45309',
    marginTop: 3,
  },

  goalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  goalIcon: {
    fontSize: 18,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
  },
  goalCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  paceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: BG_SECONDARY,
  },
  paceIcon: {
    fontSize: 24,
  },
  paceName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },
  paceDetail: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  paceCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  notifSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  summaryContainer: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    maxWidth: 180,
  },
});
