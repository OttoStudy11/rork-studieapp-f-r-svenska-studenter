import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check, Eye, EyeOff, Mail } from 'lucide-react-native';
import { ROUTES } from '@/utils/typedRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { supabase } from '@/lib/supabase';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';
import { UNIVERSITY_PROGRAMS } from '@/constants/universities';
import {
  assignUniversityCoursesToUser,
  assignCoursesAfterOnboarding,
  MAX_COURSES,
  type AssignedCourse,
} from '@/lib/course-assignment';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';
import type { OnboardingData, StepProps, StepName } from '@/components/onboarding/shared';
import PremiumScreen from '@/app/premium';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Design tokens (same palette as the premium gate / premium screen) ──
const BG_TOP = '#FAFAF8';
const BG_MID = '#E8F6F0';
const BG_BOT = '#F7F7F5';
const GREEN = '#10B981';
const TEAL = '#14B8A6';
const GREEN_DARK = '#059669';
const GREEN_SOFT = 'rgba(16,185,129,0.45)';
const ON_GREEN = '#FFFFFF';
const CARD = '#FFFFFF';
const CARD_BORDER = 'rgba(26,46,37,0.08)';
const TITLE = '#1A2E25';
const SUB = '#6A7A72';
const DOT_IDLE = 'rgba(26,46,37,0.14)';
const ERROR = '#DC2626';

const STORAGE_KEY = 'studiestugan_onboarding_v2';

type StudyLevel = 'gymnasie' | 'högskola' | 'komvux' | 'högskoleprovet';

interface RowOption {
  emoji: string;
  title: string;
  subtitle?: string;
  value: string;
}

type StepId =
  | 'level' | 'year' | 'program' | 'focus' | 'methods' | 'time' | 'goal'
  | 'account' | 'paywall'
  | 'summary';

interface StepDef {
  id: StepId;
  title: string;
  subtitle?: string;
  kind: 'rows' | 'grid' | 'program' | 'summary' | 'convert';
  multi?: boolean;
  options: RowOption[];
}

// ── Step configuration ────────────────────────────────────────────────

const LEVEL_OPTIONS: RowOption[] = [
  { emoji: '🎓', title: 'Gymnasiet', subtitle: 'Årskurs 1–3, nationella program', value: 'gymnasie' },
  { emoji: '🏫', title: 'Högskola', subtitle: 'Universitet eller högskola', value: 'högskola' },
  { emoji: '📘', title: 'Komvux', subtitle: 'Vuxenutbildning', value: 'komvux' },
  { emoji: '📝', title: 'Högskoleprovet', subtitle: 'Plugga inför provet', value: 'högskoleprovet' },
];

const YEAR_OPTIONS: Record<StudyLevel, RowOption[]> = {
  gymnasie: [
    { emoji: '🌱', title: 'År 1', value: 'År 1' },
    { emoji: '🌿', title: 'År 2', value: 'År 2' },
    { emoji: '🌳', title: 'År 3', value: 'År 3' },
  ],
  högskola: Array.from({ length: 10 }, (_, i): RowOption => ({
    emoji: '📘',
    title: `T${i + 1}`,
    value: `T${i + 1}`,
  })),
  högskoleprovet: [],
  komvux: [
    { emoji: '📗', title: 'Grundläggande nivå', subtitle: 'Bygger upp grunden', value: 'Grundläggande nivå' },
    { emoji: '📕', title: 'Påbyggnadsnivå', subtitle: 'Behörighet vidare', value: 'Påbyggnadsnivå' },
  ],
};

interface SelectedProgram {
  id: string;
  name: string;
}

// Titles must match PROGRAM_NAME_MAPPING in constants/gymnasium-courses so the
// course lookup finds the right program.
const GYMNASIE_PROGRAM_OPTIONS: RowOption[] = [
  { emoji: '🔬', title: 'Naturvetenskapsprogrammet', value: 'na' },
  { emoji: '⚙️', title: 'Teknikprogrammet', value: 'te' },
  { emoji: '🏛️', title: 'Samhällsvetenskapsprogrammet', value: 'sa' },
  { emoji: '💼', title: 'Ekonomiprogrammet', value: 'ek' },
  { emoji: '🎨', title: 'Estetiska programmet', value: 'es' },
  { emoji: '📚', title: 'Humanistiska programmet', value: 'hu' },
];

// Six tiles → three symmetric rows of two.
const FOCUS_OPTIONS: RowOption[] = [
  { emoji: '📚', title: 'Struktur', value: 'Struktur' },
  { emoji: '🧠', title: 'Förstå saker bättre', value: 'Förstå saker bättre' },
  { emoji: '🎯', title: 'Högskoleprovet', value: 'Högskoleprovet' },
  { emoji: '⏱️', title: 'Fokus', value: 'Fokus' },
  { emoji: '📈', title: 'Höja mina betyg', value: 'Höja mina betyg' },
  { emoji: '🧘', title: 'Mindre stress', value: 'Mindre stress' },
];

const METHOD_OPTIONS: RowOption[] = [
  { emoji: '📖', title: 'Läser & antecknar', value: 'Läser & antecknar' },
  { emoji: '🧠', title: 'Flashcards', value: 'Flashcards' },
  { emoji: '✍️', title: 'Övar på uppgifter', value: 'Övar på uppgifter' },
  { emoji: '🎯', title: 'Gör quiz', value: 'Gör quiz' },
  { emoji: '🤷', title: 'Lite av varje', value: 'Lite av varje' },
  { emoji: '😴', title: 'Jag pluggar inte alls', value: 'Jag pluggar inte alls' },
];

const TIME_OPTIONS: RowOption[] = [
  { emoji: '☕', title: 'Under 30 min', subtitle: 'En snabb dukning per dag', value: 'Under 30 min' },
  { emoji: '📚', title: '30–60 min', subtitle: 'Ett riktigt pass om dagen', value: '30–60 min' },
  { emoji: '⚡', title: '1–2 timmar', subtitle: 'Stadigt pluggtempo', value: '1–2 timmar' },
  { emoji: '🔥', title: '2+ timmar', subtitle: 'Du pluggar på riktigt', value: '2+ timmar' },
];

const GOAL_OPTIONS: RowOption[] = [
  { emoji: '📈', title: 'Höja betygen', subtitle: 'Bättre resultat i kurserna', value: 'Höja betygen' },
  { emoji: '🎓', title: 'Klara skolan', subtitle: 'Ta examen och kom vidare', value: 'Klara skolan' },
  { emoji: '🎯', title: 'Nå mitt HP-mål', subtitle: 'Maxa högskoleprovet', value: 'Nå mitt HP-mål' },
  { emoji: '✅', title: 'Få bättre struktur', subtitle: 'Ordning på pluggen', value: 'Få bättre struktur' },
  { emoji: '🔥', title: 'Bli mer konsekvent', subtitle: 'Plugga regelbundet', value: 'Bli mer konsekvent' },
];

interface Answers {
  level: StudyLevel | null;
  year: string | null;
  program: SelectedProgram | null;
  focus: string[];
  methods: string[];
  time: string | null;
  goal: string | null;
}

// After the questions: account creation, then the premium gate.
const CONVERT_STEPS: StepDef[] = [
  {
    id: 'account',
    title: 'Skapa ditt konto',
    subtitle: 'Spara dina svar och lås upp allt direkt.',
    kind: 'convert',
    options: [],
  },
  { id: 'paywall', title: '', kind: 'convert', options: [] },
];

const buildSteps = (level: StudyLevel | null): StepDef[] => [
  {
    id: 'level',
    title: 'Vad pluggar du?',
    subtitle: 'Vi anpassar StudieStugan efter din utbildning.',
    kind: 'rows',
    options: LEVEL_OPTIONS,
  },
  ...(level !== 'högskoleprovet'
    ? [
        {
          id: 'year' as const,
          title: level === 'högskola' ? 'Vilken termin går du?' : 'Vilket år går du?',
          subtitle: level === 'högskola'
            ? 'T1–T10, så kurserna träffar rätt direkt.'
            : 'Så vi träffar rätt nivå direkt.',
          kind: 'rows' as const,
          options: YEAR_OPTIONS[level ?? 'gymnasie'],
        },
      ]
    : []),
  ...(level === 'gymnasie' || level === 'högskola'
    ? [
        {
          id: 'program' as const,
          title: 'Vilket program går du?',
          subtitle: 'Så vi kan tilldela rätt kurser automatiskt.',
          kind: 'program' as const,
          options: [],
        },
      ]
    : []),
  {
    id: 'focus',
    title: 'Vad vill du få bättre koll på?',
    subtitle: 'Välj så många du vill.',
    kind: 'grid',
    multi: true,
    options: FOCUS_OPTIONS,
  },
  {
    id: 'methods',
    title: 'Hur brukar du plugga?',
    subtitle: 'Välj allt som stämmer.',
    kind: 'grid',
    multi: true,
    options: METHOD_OPTIONS,
  },
  {
    id: 'time',
    title: 'Hur mycket brukar du plugga?',
    subtitle: 'Inget svar är fel — vi börjar där du är.',
    kind: 'rows',
    options: TIME_OPTIONS,
  },
  {
    id: 'goal',
    title: 'Vad är ditt viktigaste mål?',
    subtitle: 'Vi bygger din plan runt det.',
    kind: 'rows',
    options: GOAL_OPTIONS,
  },
  ...CONVERT_STEPS,
  {
    id: 'summary',
    title: 'Nu kör vi.',
    subtitle: 'Vi använder dina svar för att göra StudieStugan mer relevant för dig.',
    kind: 'summary',
    options: [],
  },
];

const TIME_TO_HOURS: Record<string, number> = {
  'Under 30 min': 0.5,
  '30–60 min': 1,
  '1–2 timmar': 1.5,
  '2+ timmar': 2,
};

const YEAR_TO_NUMBER: Record<string, number> = {
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`T${i + 1}`, i + 1])),
  'År 1': 1,
  'År 2': 2,
  'År 3': 3,
  'Grundläggande nivå': 1,
  'Påbyggnadsnivå': 2,
};

// ── Selection row (reference style: white card → green card) ──────────

interface OptionRowProps {
  option: RowOption;
  selected: boolean;
  index: number;
  onPress: () => void;
}

const OptionRow: React.FC<OptionRowProps> = React.memo(({ option, selected, index, onPress }) => {
  const enter = useRef(new Animated.Value(0)).current;
  const sel = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = Animated.timing(enter, {
      toValue: 1,
      duration: 400,
      delay: 80 + index * 70,
      useNativeDriver: true,
    });
    t.start();
    return () => t.stop();
  }, [enter, index]);

  useEffect(() => {
    Animated.spring(sel, {
      toValue: selected ? 1 : 0,
      tension: 140,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [selected, sel]);

  const enterOpacity = enter;
  const enterTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  const greenOpacity = sel;
  const selScale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
  const checkScale = sel.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const titleColor = sel.interpolate({ inputRange: [0, 1], outputRange: [TITLE, ON_GREEN] });
  const subColor = sel.interpolate({ inputRange: [0, 1], outputRange: [SUB, 'rgba(255,255,255,0.85)'] });
  const emojiBg = sel.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(16,185,129,0.1)', 'rgba(255,255,255,0.2)'],
  });

  return (
    <Animated.View
      style={{ opacity: enterOpacity, transform: [{ translateY: enterTranslate }] }}
    >
      <Animated.View style={{ transform: [{ scale: pressScale }, { scale: selScale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() =>
            Animated.spring(pressScale, {
              toValue: 0.97,
              tension: 300,
              friction: 14,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(pressScale, {
              toValue: 1,
              tension: 300,
              friction: 14,
              useNativeDriver: true,
            }).start()
          }
          onPress={onPress}
        >
          <View style={rowStyles.card}>
            {/* Green fill layer */}
            <Animated.View style={[rowStyles.greenFill, { opacity: greenOpacity }]} />
            <View style={rowStyles.rowInner}>
              <Animated.View style={[rowStyles.emojiWrap, { backgroundColor: emojiBg }]}>
                <Text style={rowStyles.emoji}>{option.emoji}</Text>
              </Animated.View>
              <View style={rowStyles.textContent}>
                <Animated.Text style={[rowStyles.title, { color: titleColor }]} numberOfLines={1}>
                  {option.title}
                </Animated.Text>
                {option.subtitle ? (
                  <Animated.Text style={[rowStyles.subtitle, { color: subColor }]} numberOfLines={1}>
                    {option.subtitle}
                  </Animated.Text>
                ) : null}
              </View>
              <Animated.View style={[rowStyles.checkWrap, { transform: [{ scale: checkScale }] }]}>
                <Check size={15} color={ON_GREEN} strokeWidth={3} />
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

// ── Grid tile ─────────────────────────────────────────────────────────

interface GridTileProps {
  option: RowOption;
  selected: boolean;
  index: number;
  onPress: () => void;
}

const GridTile: React.FC<GridTileProps> = React.memo(({ option, selected, index, onPress }) => {
  const enter = useRef(new Animated.Value(0)).current;
  const sel = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = Animated.timing(enter, {
      toValue: 1,
      duration: 400,
      delay: 80 + index * 70,
      useNativeDriver: true,
    });
    t.start();
    return () => t.stop();
  }, [enter, index]);

  useEffect(() => {
    Animated.spring(sel, {
      toValue: selected ? 1 : 0,
      tension: 140,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [selected, sel]);

  const enterOpacity = enter;
  const enterTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const greenOpacity = sel;
  const selScale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const labelColor = sel.interpolate({ inputRange: [0, 1], outputRange: [TITLE, ON_GREEN] });

  return (
    <Animated.View style={{ opacity: enterOpacity, transform: [{ translateY: enterTranslate }] }}>
      <Animated.View style={{ transform: [{ scale: pressScale }, { scale: selScale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() =>
            Animated.spring(pressScale, {
              toValue: 0.95,
              tension: 300,
              friction: 14,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(pressScale, {
              toValue: 1,
              tension: 300,
              friction: 14,
              useNativeDriver: true,
            }).start()
          }
          onPress={onPress}
        >
          <View style={gridStyles.tile}>
            <Animated.View style={[gridStyles.greenFill, { opacity: greenOpacity }]} />
            <Text style={gridStyles.emoji}>{option.emoji}</Text>
            <Animated.Text style={[gridStyles.label, { color: labelColor }]} numberOfLines={2}>
              {option.title}
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

// ── Progress dots (pill for active, dots for rest) ────────────────────

const ProgressDots: React.FC<{ step: number; total: number }> = React.memo(({ step, total }) => {
  // 0 = idle, 1 = done, 2 = active
  const vals = useRef<Animated.Value[]>(Array.from({ length: total }, () => new Animated.Value(0))).current;

  useEffect(() => {
    vals.forEach((v, i) => {
      const target = i === step ? 2 : i < step ? 1 : 0;
      Animated.spring(v, { toValue: target, tension: 120, friction: 12, useNativeDriver: false }).start();
    });
  }, [step, vals]);

  return (
    <View style={dotStyles.row}>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            dotStyles.dot,
            {
              width: v.interpolate({ inputRange: [0, 2], outputRange: [8, 26] }),
              backgroundColor: v.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [DOT_IDLE, GREEN_SOFT, GREEN],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
});

// ── Main component ────────────────────────────────────────────────────

export default function OnboardingV2Screen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, setOnboardingCompleted, signUp, signIn, resendConfirmation } = useAuth();
  const { updateUser, addCourse } = useStudy();

  const [step, setStep] = useState(0);
  const [programSearch, setProgramSearch] = useState('');
  const finishingRef = useRef(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountUsername, setAccountUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAccountBusy, setIsAccountBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    level: null,
    year: null,
    program: null,
    focus: [],
    methods: [],
    time: null,
    goal: null,
  });

  const steps = buildSteps(answers.level);
  const current = steps[step];
  const isSummary = current.kind === 'summary';

  // Step transition (direction-aware fade + slide).
  const prevStepRef = useRef(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const backScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const prev = prevStepRef.current;
    const d: 1 | -1 = step >= prev ? 1 : -1;
    prevStepRef.current = step;
    setDir(d);
    fade.setValue(0);
    slide.setValue(24 * d);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 110, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [step, fade, slide]);

  // Hardware back = step back.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  });

  const handleUsernameChange = useCallback((text: string) => {
    setAccountUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20));
  }, []);

  // Debounced username availability check (same RPC as the old onboarding).
  useEffect(() => {
    const username = accountUsername.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('check_username_available', {
          username_to_check: username,
        });
        setUsernameAvailable(error ? null : Boolean(data));
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [accountUsername]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail.trim());
  const accountFormValid =
    emailValid && accountPassword.length >= 6 && usernameAvailable === true && acceptedTerms;

  const canContinue: boolean = isSummary
    ? true
    : current.kind === 'convert'
      ? current.id === 'account'
        ? pendingConfirmation || accountFormValid
        : true
      : current.multi
        ? (current.id === 'focus' ? answers.focus : answers.methods).length > 0
        : current.id === 'level'
          ? answers.level !== null
          : current.id === 'year'
            ? answers.year !== null
            : current.id === 'program'
              ? answers.program !== null
              : current.id === 'time'
                ? answers.time !== null
                : answers.goal !== null;

  const goBack = useCallback(() => {
    if (step === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => {
      let prev = s - 1;
      // Signed-in users never see the account step — skip over it.
      while (prev > 0 && steps[prev].id === 'account' && isAuthenticated) prev--;
      return Math.max(0, prev);
    });
  }, [step, steps, isAuthenticated]);

  const selectSingle = useCallback((stepId: StepId, value: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((a) => {
      if (stepId === 'level') {
        // Changing level invalidates the previous year choice.
        const level = value as StudyLevel;
        const sameLevel = a.level === level;
        return {
          ...a,
          level,
          year: sameLevel ? a.year : null,
          program: sameLevel ? a.program : null,
        };
      }
      if (stepId === 'year') return { ...a, year: value };
      if (stepId === 'time') return { ...a, time: value };
      if (stepId === 'goal') return { ...a, goal: value };
      return a;
    });
  }, []);

  const selectProgram = useCallback((program: SelectedProgram) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((a) => ({ ...a, program }));
  }, []);

  const toggleMulti = useCallback((stepId: StepId, value: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((a) => {
      const list = stepId === 'focus' ? [...a.focus] : [...a.methods];
      const idx = list.indexOf(value);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(value);
      return stepId === 'focus' ? { ...a, focus: list } : { ...a, methods: list };
    });
  }, []);

  // Data shaped like the legacy onboarding, so the reused conversion
  // steps (WowStep) can render the user's real answers.
  const legacyData: OnboardingData = useMemo(
    () => ({
      username: '',
      displayName: '',
      studyLevel: answers.level === 'högskoleprovet' ? '' : answers.level ?? 'gymnasie',
      gymnasium: null,
      gymnasiumProgram: null,
      gymnasiumGrade: null,
      university: null,
      universityProgram: null,
      universityProgramType: null,
      universityYear: null,
      program: '',
      goals: answers.focus,
      problems: [],
      selectedCourses: new Set(),
      year: null,
      avatarConfig: DEFAULT_AVATAR_CONFIG,
      dailyGoalMinutes: Math.round((TIME_TO_HOURS[answers.time ?? '30–60 min'] ?? 1) * 60),
      stressLevel: 5,
      acceptedTerms: true,
    }),
    [answers.level, answers.focus, answers.time],
  );

  const filteredUniPrograms: RowOption[] = useMemo(() => {
    const q = programSearch.trim().toLowerCase();
    return UNIVERSITY_PROGRAMS.filter(
      (p) => q.length === 0 || p.name.toLowerCase().includes(q) || p.field.toLowerCase().includes(q),
    )
      .slice(0, 8)
      .map((p) => ({ emoji: '🎓', title: p.name, subtitle: p.field, value: p.id }));
  }, [programSearch]);

  const finishOnboarding = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    // Persist: local profile snapshot + merge into existing user profile.
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...answers, version: 2, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Storage failure should not block the flow.
    }

    const level = (answers.level ?? 'gymnasie') as StudyLevel;
    const isHogskoleprovet = level === 'högskoleprovet';
    const yearNum = YEAR_TO_NUMBER[answers.year ?? (level === 'högskola' ? 'T1' : 'År 1')] ?? 1;
    if (user) {
      const profileUpdates: Parameters<typeof updateUser>[0] = {
        dailyGoalHours: TIME_TO_HOURS[answers.time ?? '30–60 min'] ?? 1,
        purpose: answers.goal ?? (isHogskoleprovet ? 'Högskoleprovet' : ''),
      };
      // User.studyLevel is a fixed union — Högskoleprovet keeps the profile level.
      if (!isHogskoleprovet) {
        profileUpdates.studyLevel = level as 'gymnasie' | 'högskola' | 'komvux';
      }
      if (accountUsername.trim().length >= 3) {
        const username = accountUsername.trim().toLowerCase();
        profileUpdates.username = username;
        profileUpdates.displayName = username;
      }
      if (answers.program) {
        profileUpdates.program = answers.program.name;
        if (level === 'högskola') {
          profileUpdates.universityYear = String(yearNum);
        } else if (level === 'gymnasie') {
          profileUpdates.gymnasiumGrade = String(Math.min(yearNum, 3));
        }
      }
      try {
        await updateUser(profileUpdates);
      } catch {
        // Profile sync is best-effort.
      }

      // Assign courses so the home screen isn't empty.
      try {
        if (level === 'gymnasie') {
          // Program-specific courses when a program was chosen; the lookup
          // falls back to the gymnasie-common set (Svenska, Engelska, Matematik).
          const programName = answers.program?.name ?? 'StudieStugan-standard';
          const gymCourses = [
            ...getCoursesForProgramAndYear(programName, Math.min(yearNum, 3) as 1 | 2 | 3),
          ]
            .sort((a, b) => Number(Boolean(b.mandatory)) - Number(Boolean(a.mandatory)))
            .slice(0, MAX_COURSES);
          for (const course of gymCourses) {
            await supabase.from('courses').upsert(
              {
                id: course.code,
                course_code: course.code,
                title: course.name,
                description: `${course.name} – ${course.points} poäng`,
                subject: 'Gymnasiegemensamt',
                level: 'gymnasie',
                points: course.points,
                resources: ['Kursmaterial', 'Övningsuppgifter'],
                tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                related_courses: [],
                progress: 0,
              },
              { onConflict: 'id' },
            );
            await supabase.from('user_courses').upsert(
              {
                id: `${user.id}-${course.code}`,
                user_id: user.id,
                course_id: course.code,
                progress: 0,
                is_active: true,
              },
              { onConflict: 'id' },
            );
            await addCourse({
              title: course.name,
              description: `${course.name} – ${course.points} poäng`,
              subject: 'Gymnasiegemensamt',
              level: 'gymnasie',
              progress: 0,
              isActive: true,
              resources: ['Kursmaterial', 'Övningsuppgifter'],
              tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
              relatedCourses: [],
            });
          }
        } else if (level === 'högskola') {
          let assigned: AssignedCourse[] = [];
          if (answers.program?.id) {
            // T-number is the semester (T1–T10); the helper maps it to a year.
            const term = Math.max(1, Math.min(yearNum, 10));
            assigned = await assignUniversityCoursesToUser(user.id, answers.program.id, term);
            if (assigned.length === 0) {
              assigned = await assignCoursesAfterOnboarding({
                userId: user.id,
                educationLevel: 'hogskola',
                educationYear: term,
                universityProgramId: answers.program.id,
              });
            }
          }
          if (assigned.length > 0) {
            // assignUniversityCoursesToUser has already synced to the database;
            // mirror the courses into local state for immediate display.
            for (let index = 0; index < assigned.length; index++) {
              const course = assigned[index];
              await addCourse({
                title: course.title,
                description: course.description,
                subject: course.subject,
                level: 'högskola',
                progress: 0,
                isActive: index < 4,
                resources: ['Kursmaterial', 'Övningsuppgifter'],
                tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                relatedCourses: [],
              });
            }
          } else {
            // No program match — assign a generic starter set instead.
            const uniStarters: { code: string; title: string; description: string }[] = [
              { code: 'ss_studieteknik', title: 'Studieteknik', description: 'Planera, läsa och plugga effektivt på högskolenivå' },
              { code: 'ss_akademiskt_skrivande', title: 'Akademiskt skrivande', description: 'Struktur, argumentation och källhantering' },
              { code: 'ss_vagen_till_examen', title: 'Vägen till examen', description: 'Kartlägg din utbildning och sätt upp delmål' },
            ];
            for (const starter of uniStarters) {
              await supabase.from('courses').upsert(
                {
                  id: starter.code,
                  course_code: starter.code,
                  title: starter.title,
                  description: starter.description,
                  subject: 'Allmänt',
                  level: 'hogskola',
                  resources: ['Kursmaterial', 'Övningsuppgifter'],
                  tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                  related_courses: [],
                  progress: 0,
                },
                { onConflict: 'id' },
              );
              await supabase.from('user_courses').upsert(
                {
                  id: `${user.id}-${starter.code}`,
                  user_id: user.id,
                  course_id: starter.code,
                  progress: 0,
                  is_active: true,
                },
                { onConflict: 'id' },
              );
              await addCourse({
                title: starter.title,
                description: starter.description,
                subject: 'Allmänt',
                level: 'högskola',
                progress: 0,
                isActive: true,
                resources: ['Kursmaterial', 'Övningsuppgifter'],
                tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
                relatedCourses: [],
              });
            }
          }
        }
      } catch {
        // Course assignment is best-effort; user can add courses manually.
      }
    }

    // Mark onboarding complete so a restart doesn't route back here.
    try {
      await setOnboardingCompleted();
    } catch {
      // Best-effort; storage failure would only re-prompt the flow.
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(isAuthenticated ? ROUTES.home : ROUTES.auth as never);
  }, [answers, user, updateUser, addCourse, setOnboardingCompleted, isAuthenticated, accountUsername]);

  const handleAccountCta = useCallback(async () => {
    if (isAccountBusy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAuthError(null);

    if (pendingConfirmation) {
      // The user confirmed via the email link — verify by signing in.
      setIsAccountBusy(true);
      try {
        const result = await signIn(accountEmail.trim(), accountPassword, false);
        if (result.error) {
          const code = (result.error as any)?.code ?? '';
          const message = (result.error as any)?.message ?? '';
          setAuthError(
            code === 'EMAIL_NOT_CONFIRMED' || message.toLowerCase().includes('confirm')
              ? 'Kontot är inte bekräftat ännu — kolla din inkorg.'
              : message || 'Inloggningen misslyckades. Försök igen.',
          );
          return;
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPendingConfirmation(false);
        setStep((s) => Math.min(steps.length - 1, s + 1));
      } finally {
        setIsAccountBusy(false);
      }
      return;
    }

    if (!accountFormValid) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    setIsAccountBusy(true);
    try {
      const result = await signUp(accountEmail.trim(), accountPassword);
      if (result.error) {
        setAuthError((result.error as any)?.message || 'Ett fel uppstod vid registrering.');
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.needsEmailConfirmation) {
        setPendingConfirmation(true);
        return;
      }
      setStep((s) => Math.min(steps.length - 1, s + 1));
    } finally {
      setIsAccountBusy(false);
    }
  }, [isAccountBusy, pendingConfirmation, accountFormValid, accountEmail, accountPassword, signUp, signIn, steps.length]);

  const handleCta = useCallback(async () => {
    if (!canContinue || isAccountBusy) {
      if (!isAccountBusy) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (current.id === 'account') {
      await handleAccountCta();
      return;
    }
    if (isSummary) {
      await finishOnboarding();
      return;
    }
    // Signed-in users never see the account step — skip over it.
    setStep((s) => {
      let next = s + 1;
      while (next < steps.length - 1 && steps[next].id === 'account' && isAuthenticated) next++;
      return Math.min(steps.length - 1, next);
    });
  }, [canContinue, isAccountBusy, current.id, handleAccountCta, isSummary, finishOnboarding, steps, isAuthenticated]);

  // The paywall step renders the full /premium screen (same experience as
  // the standalone route). Back and successful purchase both complete onboarding.
  if (current.kind === 'convert' && current.id === 'paywall') {
    return (
      <PremiumScreen
        forceGate
        onBack={() => {
          void finishOnboarding();
        }}
        onPurchased={() => {
          void finishOnboarding();
        }}
      />
    );
  }

  // Props bundle satisfying the shared legacy step interface.
  const stepProps: StepProps = {
    step: current.id as StepName,
    data: legacyData,
    setData: () => {},
    usernameAvailable: null,
    checkingUsername: false,
    checkUsername: () => {},
    availableCourses: [],
    gymnasiumSearch: '',
    setGymnasiumSearch: () => {},
    universitySearch: '',
    setUniversitySearch: () => {},
    komvuxSubjectFilter: 'all',
    setKomvuxSubjectFilter: () => {},
    testimonialDisplay: 0,
    setTestimonialDisplay: () => {},
    offerings: [],
    selectedPkg: 'annual',
    setSelectedPkg: () => {},
    isPurchasing: false,
    isRestoringPurchase: false,
    onPurchase: () => {
      void finishOnboarding();
    },
    onRestore: () => {},
    onSkip: () => {
      void finishOnboarding();
    },
  };

  const isConvert = current.kind === 'convert';
  const ctaLabel = isSummary
    ? 'Starta StudieStugan'
    : current.id === 'account'
      ? pendingConfirmation
        ? 'Jag har bekräftat – fortsätt'
        : 'Skapa konto'
      : isConvert
        ? 'Fortsätt'
        : 'Vidare';

  return (
    <View style={styles.root}>
      {/* Atmospheric background */}
      <LinearGradient
        colors={[BG_TOP, BG_MID, BG_BOT]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <View style={[styles.glowOrb, styles.glowTop]} pointerEvents="none" />
      <View style={[styles.glowOrb, styles.glowBottom]} pointerEvents="none" />

      <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 }]}>
        {/* ── Header: circular back + progress dots ── */}
        {!(isConvert && current.id !== 'account') && (
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: backScale }], width: 46 }}>
              {step > 0 && (
                <TouchableOpacity
                  style={styles.backBtn}
                  activeOpacity={0.85}
                  onPressIn={() =>
                    Animated.spring(backScale, {
                      toValue: 0.9,
                      tension: 300,
                      friction: 14,
                      useNativeDriver: true,
                    }).start()
                  }
                  onPressOut={() =>
                    Animated.spring(backScale, {
                      toValue: 1,
                      tension: 300,
                      friction: 14,
                      useNativeDriver: true,
                    }).start()
                  }
                  onPress={goBack}
                >
                  <ArrowLeft size={20} color={TITLE} strokeWidth={2.4} />
                </TouchableOpacity>
              )}
            </Animated.View>
            <View style={styles.dotsWrap}>
              <ProgressDots step={step} total={steps.length} />
            </View>
            <View style={{ width: 46 }} />
          </View>
        )}

        {/* ── Step content ── */}
        <Animated.View
          key={step}
          style={[styles.step, { opacity: fade, transform: [{ translateX: slide }] }]}
        >
          {current.id === 'account' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollInner}
            >
              <Text style={styles.title}>{current.title}</Text>
              {current.subtitle ? (
                <Text style={styles.subtitle}>{current.subtitle}</Text>
              ) : null}
              {pendingConfirmation ? (
                <View style={accStyles.pendingCard}>
                  <Mail size={30} color={GREEN_DARK} />
                  <Text style={accStyles.pendingTitle}>Kolla din inkorg!</Text>
                  <Text style={accStyles.pendingText}>
                    Vi har skickat en bekräftelselänk till {accountEmail.trim()}. Bekräfta
                    kontot och tryck sedan på knappen nedan.
                  </Text>
                  <TouchableOpacity
                    style={accStyles.resendBtn}
                    activeOpacity={0.8}
                    disabled={isAccountBusy}
                    onPress={() => {
                      void resendConfirmation(accountEmail.trim());
                    }}
                  >
                    <Text style={accStyles.resendText}>Skicka e-post igen</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={accStyles.form}>
                  <View>
                    <Text style={accStyles.label}>E-post</Text>
                    <TextInput
                      style={accStyles.input}
                      placeholder="din@epost.se"
                      placeholderTextColor={SUB}
                      value={accountEmail}
                      onChangeText={setAccountEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  </View>
                  <View>
                    <Text style={accStyles.label}>Lösenord</Text>
                    <View style={accStyles.inputRow}>
                      <TextInput
                        style={[accStyles.input, accStyles.inputFlex]}
                        placeholder="Minst 6 tecken"
                        placeholderTextColor={SUB}
                        value={accountPassword}
                        onChangeText={setAccountPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={accStyles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color={SUB} />
                        ) : (
                          <Eye size={18} color={SUB} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <Text style={accStyles.label}>Användarnamn</Text>
                    <TextInput
                      style={accStyles.input}
                      placeholder="t.ex. anna_lind"
                      placeholderTextColor={SUB}
                      value={accountUsername}
                      onChangeText={handleUsernameChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {accountUsername.trim().length > 0 && (
                      <Text
                        style={[
                          accStyles.hint,
                          usernameAvailable === true && accStyles.hintOk,
                          usernameAvailable === false && accStyles.hintError,
                        ]}
                      >
                        {checkingUsername
                          ? 'Kollar om namnet är ledigt…'
                          : usernameAvailable === true
                            ? 'Ledigt — det är ditt!'
                            : usernameAvailable === false
                              ? 'Tyvärr, det är upptaget.'
                              : '3–20 tecken: a–z, siffror och _'}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={accStyles.termsRow}
                    activeOpacity={0.8}
                    onPress={() => setAcceptedTerms((v) => !v)}
                  >
                    <View style={[accStyles.checkbox, acceptedTerms && accStyles.checkboxOn]}>
                      {acceptedTerms && <Check size={14} color={ON_GREEN} strokeWidth={3} />}
                    </View>
                    <Text style={accStyles.termsText}>
                      Jag godkänner{' '}
                      <Text
                        style={accStyles.termsLink}
                        onPress={() => router.push('/terms' as never)}
                      >
                        användarvillkoren
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {authError ? (
                    <View style={accStyles.errorCard}>
                      <Text style={accStyles.errorText}>{authError}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </ScrollView>
          )}

          {current.kind === 'program' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollInner}
            >
              <Text style={styles.title}>{current.title}</Text>
              {current.subtitle ? (
                <Text style={styles.subtitle}>{current.subtitle}</Text>
              ) : null}
              {answers.level === 'högskola' && (
                <View style={styles.searchWrap}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Sök program..."
                    placeholderTextColor={SUB}
                    value={programSearch}
                    onChangeText={setProgramSearch}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              )}
              <View style={styles.rowsList}>
                {(answers.level === 'högskola' ? filteredUniPrograms : GYMNASIE_PROGRAM_OPTIONS).map(
                  (opt, i) => (
                    <OptionRow
                      key={opt.value}
                      option={opt}
                      index={i}
                      selected={answers.program?.id === opt.value}
                      onPress={() => selectProgram({ id: opt.value, name: opt.title })}
                    />
                  ),
                )}
              </View>
            </ScrollView>
          )}

          {current.kind === 'rows' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollInner}
            >
              <Text style={styles.title}>{current.title}</Text>
              {current.subtitle ? (
                <Text style={styles.subtitle}>{current.subtitle}</Text>
              ) : null}
              <View style={styles.rowsList}>
                {current.options.map((opt, i) => (
                  <OptionRow
                    key={opt.value}
                    option={opt}
                    index={i}
                    selected={
                      current.id === 'level'
                        ? answers.level === opt.value
                        : current.id === 'year'
                          ? answers.year === opt.value
                          : current.id === 'time'
                            ? answers.time === opt.value
                            : answers.goal === opt.value
                    }
                    onPress={() => selectSingle(current.id, opt.value)}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          {current.kind === 'grid' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollInner}
            >
              <Text style={styles.title}>{current.title}</Text>
              {current.subtitle ? (
                <Text style={styles.subtitle}>{current.subtitle}</Text>
              ) : null}
              <View style={styles.grid}>
                {current.options.map((opt, i) => (
                  <View key={opt.value} style={styles.gridCell}>
                    <GridTile
                      option={opt}
                      index={i}
                      selected={
                        current.id === 'focus'
                          ? answers.focus.includes(opt.value)
                          : answers.methods.includes(opt.value)
                      }
                      onPress={() => toggleMulti(current.id, opt.value)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {current.kind === 'summary' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollInner}
            >
              <Text style={styles.title}>{current.title}</Text>
              {current.subtitle ? (
                <Text style={styles.subtitle}>{current.subtitle}</Text>
              ) : null}
              <SummaryView answers={answers} />
            </ScrollView>
          )}
        </Animated.View>

        {/* ── CTA (fixed bottom) ── */}
        <View style={[styles.ctaWrap, dir === 1 && step !== 0 && styles.ctaEnter]}>
          <Animated.View style={{ opacity: canContinue && !isAccountBusy ? 1 : 0.45 }}>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              disabled={!canContinue || isAccountBusy}
              onPress={() => {
                void handleCta();
              }}
            >
              <LinearGradient
                colors={[GREEN, TEAL]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaGradient}
              >
                {current.id === 'account' && isAccountBusy ? (
                  <ActivityIndicator size="small" color={ON_GREEN} />
                ) : (
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ── Summary (final screen) ────────────────────────────────────────────

const SummaryView: React.FC<{ answers: Answers }> = React.memo(({ answers }) => {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 450, delay: 120, useNativeDriver: true }).start();
  }, [enter]);

  const opacity = enter;
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const focusLabel = answers.focus.length > 0 ? answers.focus.join(' · ') : 'Allt';
  const methodLabel = answers.methods.length > 0 ? answers.methods.join(' · ') : 'Lite av varje';

  const profileRows: { label: string; value: string }[] = [
    { label: 'Nivå', value: answers.level ? answers.level.charAt(0).toUpperCase() + answers.level.slice(1) : '—' },
    ...(answers.program ? [{ label: 'Program', value: answers.program.name }] : []),
    ...(answers.level !== 'högskoleprovet' ? [{ label: 'År', value: answers.year ?? '—' }] : []),
    { label: 'Fokus', value: focusLabel },
    { label: 'Pluggstil', value: methodLabel },
    { label: 'Tid per dag', value: answers.time ?? '—' },
  ];

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {/* Green highlight card */}
      <View style={sumStyles.goalCardWrap}>
        <LinearGradient
          colors={[GREEN, TEAL]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={sumStyles.goalCard}
        >
          <View style={sumStyles.goalHead}>
            <Text style={sumStyles.goalEmoji}>🎯</Text>
            <Text style={sumStyles.goalTitle}>Ditt mål</Text>
          </View>
          <Text style={sumStyles.goalValue}>{answers.goal ?? 'Komma vidare'}</Text>
          <Text style={sumStyles.goalSub}>
            Nu bygger vi en plan som tar dig dit — steg för steg.
          </Text>
        </LinearGradient>
      </View>

      {/* Profile card */}
      <View style={sumStyles.profileCard}>
        <Text style={sumStyles.profileLabel}>DIN STUDIEPROFIL</Text>
        {profileRows.map((row) => (
          <View key={row.label} style={sumStyles.profileRow}>
            <Text style={sumStyles.profileKey}>{row.label}</Text>
            <Text style={sumStyles.profileVal} numberOfLines={2}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_BOT,
  },
  glowOrb: {
    position: 'absolute' as const,
    borderRadius: 999,
  },
  glowTop: {
    top: -SH * 0.18,
    left: SW * 0.5 - SH * 0.35,
    width: SH * 0.7,
    height: SH * 0.42,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  glowBottom: {
    bottom: -SH * 0.22,
    right: -SH * 0.2,
    width: SH * 0.5,
    height: SH * 0.5,
    backgroundColor: 'rgba(20,184,166,0.07)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(26,46,37,0.05)',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsWrap: {
    flex: 1,
    alignItems: 'center',
  },
  step: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: Math.min(SW * 0.066, 26),
    fontWeight: '800' as const,
    color: TITLE,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: Math.min(SW * 0.086, 33),
    marginTop: SH * 0.035,
  },
  subtitle: {
    fontSize: 13.5,
    color: SUB,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },
  rowsList: {
    marginTop: 26,
    gap: 12,
  },
  searchWrap: {
    marginTop: 22,
  },
  searchInput: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    paddingHorizontal: 18,
    fontSize: 14.5,
    color: TITLE,
  },
  grid: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  gridCell: {
    width: (SW - 24 * 2 - 12) / 2,
  },
  ctaWrap: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  ctaEnter: {},
  cta: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden' as const,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.28,
    shadowRadius: 22,
    elevation: Platform.OS === 'android' ? 0 : 8,
  },
  ctaGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: ON_GREEN,
    fontSize: 16.5,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
});

const accStyles = StyleSheet.create({
  form: {
    marginTop: 26,
    gap: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700' as const,
    color: TITLE,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TITLE,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: 14,
    top: 16,
  },
  hint: {
    fontSize: 12,
    color: SUB,
    marginTop: 6,
  },
  hintOk: {
    color: GREEN_DARK,
    fontWeight: '600' as const,
  },
  hintError: {
    color: ERROR,
  },
  termsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: SUB,
    lineHeight: 18,
  },
  termsLink: {
    color: GREEN_DARK,
    fontWeight: '700' as const,
  },
  errorCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12.5,
    color: ERROR,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  pendingCard: {
    marginTop: 26,
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 20,
    alignItems: 'center' as const,
    gap: 8,
  },
  pendingTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: TITLE,
  },
  pendingText: {
    fontSize: 13,
    color: SUB,
    textAlign: 'center' as const,
    lineHeight: 19,
  },
  resendBtn: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GREEN_DARK,
  },
});

const rowStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    overflow: 'hidden' as const,
    shadowColor: '#1A2E25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.05,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  greenFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GREEN,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 17,
    paddingHorizontal: 16,
  },
  emojiWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 21,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15.5,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const gridStyles = StyleSheet.create({
  tile: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    overflow: 'hidden' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 10,
    minHeight: 118,
    shadowColor: '#1A2E25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.05,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  greenFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GREEN,
  },
  emoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

const sumStyles = StyleSheet.create({
  goalCardWrap: {
    marginTop: 26,
    borderRadius: 24,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
    shadowRadius: 26,
    elevation: Platform.OS === 'android' ? 0 : 8,
  },
  goalCard: {
    borderRadius: 24,
    padding: 20,
  },
  goalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  goalEmoji: {
    fontSize: 22,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: ON_GREEN,
  },
  goalValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: ON_GREEN,
    letterSpacing: -0.4,
  },
  goalSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500' as const,
  },
  profileCard: {
    marginTop: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.6,
    color: GREEN_DARK,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,46,37,0.06)',
  },
  profileKey: {
    fontSize: 13,
    color: SUB,
    fontWeight: '500' as const,
  },
  profileVal: {
    fontSize: 13.5,
    color: TITLE,
    fontWeight: '700' as const,
    textAlign: 'right' as const,
    flex: 1,
    maxWidth: '62%' as const,
  },
});
