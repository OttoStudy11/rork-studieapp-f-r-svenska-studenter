import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check } from 'lucide-react-native';
import { ROUTES } from '@/utils/typedRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Design tokens (reference language: dark green × lime) ─────────────
const BG_TOP = '#0E211A';
const BG_MID = '#10251C';
const BG_BOT = '#0B1913';
const LIME = '#C9F24F';
const LIME_SOFT = 'rgba(201,242,79,0.45)';
const ON_LIME = '#132016';
const CARD = 'rgba(255,255,255,0.055)';
const CARD_BORDER = 'rgba(255,255,255,0.09)';
const TITLE = '#F4FAF3';
const SUB = 'rgba(226,240,224,0.62)';
const DOT_IDLE = 'rgba(255,255,255,0.16)';

const STORAGE_KEY = 'studiestugan_onboarding_v2';

type StudyLevel = 'gymnasie' | 'högskola' | 'komvux';

interface RowOption {
  emoji: string;
  title: string;
  subtitle?: string;
  value: string;
}

interface StepDef {
  id: 'level' | 'year' | 'focus' | 'methods' | 'time' | 'goal' | 'summary';
  title: string;
  subtitle?: string;
  kind: 'rows' | 'grid' | 'summary';
  multi?: boolean;
  options: RowOption[];
}

// ── Step configuration ────────────────────────────────────────────────

const LEVEL_OPTIONS: RowOption[] = [
  { emoji: '🎓', title: 'Gymnasiet', subtitle: 'Årskurs 1–3, nationella program', value: 'gymnasie' },
  { emoji: '🏫', title: 'Högskola', subtitle: 'Universitet eller högskola', value: 'högskola' },
  { emoji: '📘', title: 'Komvux', subtitle: 'Vuxenutbildning', value: 'komvux' },
];

const YEAR_OPTIONS: Record<StudyLevel, RowOption[]> = {
  gymnasie: [
    { emoji: '🌱', title: 'År 1', value: 'År 1' },
    { emoji: '🌿', title: 'År 2', value: 'År 2' },
    { emoji: '🌳', title: 'År 3', value: 'År 3' },
  ],
  högskola: [
    { emoji: '🌱', title: 'År 1', value: 'År 1' },
    { emoji: '🌿', title: 'År 2', value: 'År 2' },
    { emoji: '🌳', title: 'År 3', value: 'År 3' },
    { emoji: '🏛️', title: 'År 4+', value: 'År 4+' },
  ],
  komvux: [
    { emoji: '📗', title: 'Grundläggande nivå', subtitle: 'Bygger upp grunden', value: 'Grundläggande nivå' },
    { emoji: '📕', title: 'Påbyggnadsnivå', subtitle: 'Behörighet vidare', value: 'Påbyggnadsnivå' },
  ],
};

const FOCUS_OPTIONS: RowOption[] = [
  { emoji: '📚', title: 'Struktur', value: 'Struktur' },
  { emoji: '🧠', title: 'Förstå saker bättre', value: 'Förstå saker bättre' },
  { emoji: '🎯', title: 'Högskoleprovet', value: 'Högskoleprovet' },
  { emoji: '⏱️', title: 'Fokus', value: 'Fokus' },
  { emoji: '📈', title: 'Höja mina betyg', value: 'Höja mina betyg' },
];

const METHOD_OPTIONS: RowOption[] = [
  { emoji: '📖', title: 'Läser & antecknar', value: 'Läser & antecknar' },
  { emoji: '🧠', title: 'Flashcards', value: 'Flashcards' },
  { emoji: '✍️', title: 'Övar på uppgifter', value: 'Övar på uppgifter' },
  { emoji: '🎯', title: 'Gör quiz', value: 'Gör quiz' },
  { emoji: '🤷', title: 'Lite av varje', value: 'Lite av varje' },
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
  focus: string[];
  methods: string[];
  time: string | null;
  goal: string | null;
}

const buildSteps = (level: StudyLevel | null): StepDef[] => [
  {
    id: 'level',
    title: 'Vad pluggar du?',
    subtitle: 'Vi anpassar StudieStugan efter din utbildning.',
    kind: 'rows',
    options: LEVEL_OPTIONS,
  },
  {
    id: 'year',
    title: 'Vilket år går du?',
    subtitle: 'Så vi träffar rätt nivå direkt.',
    kind: 'rows',
    options: YEAR_OPTIONS[level ?? 'gymnasie'],
  },
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

// ── Selection row (reference style: dark card → lime card) ────────────

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

  const limeOpacity = sel;
  const selScale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
  const checkScale = sel.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const titleColor = sel.interpolate({ inputRange: [0, 1], outputRange: [TITLE, ON_LIME] });
  const subColor = sel.interpolate({ inputRange: [0, 1], outputRange: [SUB, 'rgba(19,32,22,0.7)'] });
  const emojiBg = sel.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.07)', 'rgba(19,32,22,0.14)'],
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
            {/* Lime fill layer */}
            <Animated.View style={[rowStyles.limeFill, { opacity: limeOpacity }]} />
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
                <Check size={15} color={ON_LIME} strokeWidth={3} />
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

// ── Grid tile (reference diet-screen style) ───────────────────────────

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
  const limeOpacity = sel;
  const selScale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const labelColor = sel.interpolate({ inputRange: [0, 1], outputRange: [TITLE, ON_LIME] });

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
            <Animated.View style={[gridStyles.limeFill, { opacity: limeOpacity }]} />
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

// ── Progress dots (reference: pill for active, dots for rest) ─────────

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
                outputRange: [DOT_IDLE, LIME_SOFT, LIME],
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
  const { isAuthenticated, user, setOnboardingCompleted } = useAuth();
  const { updateUser } = useStudy();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    level: null,
    year: null,
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

  const canContinue: boolean = isSummary
    ? true
    : current.multi
      ? (step === 2 ? answers.focus : answers.methods).length > 0
      : step === 0
        ? answers.level !== null
        : step === 1
          ? answers.year !== null
          : step === 4
            ? answers.time !== null
            : answers.goal !== null;

  const goBack = useCallback(() => {
    if (step === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => Math.max(0, s - 1));
  }, [step]);

  const selectSingle = useCallback((stepId: StepDef['id'], value: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((a) => {
      if (stepId === 'level') {
        // Changing level invalidates the previous year choice.
        const level = value as StudyLevel;
        return { ...a, level, year: a.level === level ? a.year : null };
      }
      if (stepId === 'year') return { ...a, year: value };
      if (stepId === 'time') return { ...a, time: value };
      if (stepId === 'goal') return { ...a, goal: value };
      return a;
    });
  }, []);

  const toggleMulti = useCallback((stepId: StepDef['id'], value: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((a) => {
      const list = stepId === 'focus' ? [...a.focus] : [...a.methods];
      const idx = list.indexOf(value);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(value);
      return stepId === 'focus' ? { ...a, focus: list } : { ...a, methods: list };
    });
  }, []);

  const handleCta = useCallback(async () => {
    if (!canContinue) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isSummary) {
      setStep((s) => Math.min(steps.length - 1, s + 1));
      return;
    }

    // Persist: local profile snapshot + merge into existing user profile.
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...answers, version: 2, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Storage failure should not block the flow.
    }
    if (user) {
      try {
        await updateUser({
          studyLevel: (answers.level ?? 'gymnasie') as StudyLevel,
          dailyGoalHours: TIME_TO_HOURS[answers.time ?? '30–60 min'] ?? 1,
          purpose: answers.goal ?? '',
        });
      } catch {
        // Profile sync is best-effort.
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
  }, [canContinue, isSummary, answers, steps.length, user, updateUser, isAuthenticated, setOnboardingCompleted]);

  const ctaLabel = isSummary ? 'Starta min StudieStuga' : 'Vidare';

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

        {/* ── Step content ── */}
        <Animated.View
          key={step}
          style={[styles.step, { opacity: fade, transform: [{ translateX: slide }] }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInner}
          >
            <Text style={styles.title}>{current.title}</Text>
            {current.subtitle ? (
              <Text style={styles.subtitle}>{current.subtitle}</Text>
            ) : null}

            {current.kind === 'rows' && (
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
            )}

            {current.kind === 'grid' && (
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
            )}

            {current.kind === 'summary' && (
              <SummaryView answers={answers} />
            )}
          </ScrollView>
        </Animated.View>

        {/* ── CTA (fixed bottom) ── */}
        <View style={[styles.ctaWrap, dir === 1 && step !== 0 && styles.ctaEnter]}>
          <Animated.View style={{ opacity: canContinue ? 1 : 0.45 }}>
            <TouchableOpacity
              style={[styles.cta, !canContinue && styles.ctaDisabled]}
              activeOpacity={0.9}
              disabled={!canContinue}
              onPress={() => {
                void handleCta();
              }}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ── Summary (final screen, reference "Your Goal" language) ────────────

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
    { label: 'År', value: answers.year ?? '—' },
    { label: 'Fokus', value: focusLabel },
    { label: 'Pluggstil', value: methodLabel },
    { label: 'Tid per dag', value: answers.time ?? '—' },
  ];

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {/* Lime highlight card */}
      <View style={sumStyles.goalCard}>
        <View style={sumStyles.goalHead}>
          <Text style={sumStyles.goalEmoji}>🎯</Text>
          <Text style={sumStyles.goalTitle}>Ditt mål</Text>
        </View>
        <Text style={sumStyles.goalValue}>{answers.goal ?? 'Komma vidare'}</Text>
        <Text style={sumStyles.goalSub}>
          Nu bygger vi en plan som tar dig dit — steg för steg.
        </Text>
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
    backgroundColor: 'rgba(201,242,79,0.13)',
  },
  glowBottom: {
    bottom: -SH * 0.22,
    right: -SH * 0.2,
    width: SH * 0.5,
    height: SH * 0.5,
    backgroundColor: 'rgba(201,242,79,0.05)',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: LIME,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: LIME,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.28,
    shadowRadius: 22,
    elevation: Platform.OS === 'android' ? 0 : 8,
  },
  ctaDisabled: {
    backgroundColor: 'rgba(201,242,79,0.55)',
  },
  ctaText: {
    color: ON_LIME,
    fontSize: 16.5,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
});

const rowStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD,
    overflow: 'hidden' as const,
  },
  limeFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: LIME,
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
    backgroundColor: 'rgba(19,32,22,0.85)',
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
  },
  limeFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: LIME,
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
  goalCard: {
    marginTop: 26,
    backgroundColor: LIME,
    borderRadius: 24,
    padding: 20,
    shadowColor: LIME,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
    elevation: Platform.OS === 'android' ? 0 : 8,
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
    color: ON_LIME,
  },
  goalValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: ON_LIME,
    letterSpacing: -0.4,
  },
  goalSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(19,32,22,0.72)',
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
    color: 'rgba(201,242,79,0.85)',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
