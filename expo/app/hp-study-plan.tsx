import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import {
  ChevronLeft,
  Calendar,
  Flame,
  CheckCircle2,
  Bell,
  Settings,
  Trophy,
  Clock,
  Trash2,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  Sparkles,
  Target,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useHPStudyPlan,
  PLAN_CONFIGS,
  HP_DATE_LABELS,
  PlanConfig,
  HPDateKey,
  HPPlanType,
} from '@/contexts/HPStudyPlanContext';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewTab = 'today' | 'progress' | 'settings';

function AnimatedPressable({ onPress, style, children, scaleValue = 0.97 }: {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  scaleValue?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: scaleValue, useNativeDriver: true, speed: 30, bounciness: 4 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start()}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HPStudyPlanScreen() {
  const { theme, isDark } = useTheme();
  const {
    plan,
    progress,
    isLoaded,
    selectPlan,
    deletePlan,
    updateSettings,
    updateDailyProgress,
    getTodayProgress,
    getDaysUntilHP,
    getCountdownMessage,
    getCurrentDayNumber,
    getTotalPlanDays,
    getSuggestedPlan,
    getWeekStats,
  } = useHPStudyPlan();

  const [tab, setTab] = useState<ViewTab>('today');
  const [selectedDate, setSelectedDate] = useState<HPDateKey>('fall2026');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progressAnims] = useState({
    ord: new Animated.Value(0),
    mek: new Animated.Value(0),
    quant: new Animated.Value(0),
  });
  const weekAnim = useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  const daysUntil = getDaysUntilHP();
  const countdownMsg = getCountdownMessage(daysUntil);
  const suggestedPlan = getSuggestedPlan(daysUntil);
  const todayProgress = getTodayProgress();
  const weekStats = getWeekStats();
  const currentDay = getCurrentDayNumber();
  const totalDays = getTotalPlanDays();

  const planConfig = plan ? PLAN_CONFIGS.find(c => c.type === plan.planType)! : null;

  const todayOrd = todayProgress?.ordCompleted ?? 0;
  const todayMek = todayProgress?.mekCompleted ?? 0;
  const todayQuant = todayProgress?.quantCompleted ?? 0;

  const ordTarget = planConfig?.wordsPerDay ?? 30;
  const mekTarget = planConfig?.mekPerDay ?? 3;
  const quantTarget = planConfig?.quantPerDay ?? 12;

  const todayPct = planConfig
    ? Math.min(
        100,
        Math.round(
          (((todayOrd / ordTarget) + (todayMek / mekTarget) + (todayQuant / quantTarget)) / 3) * 100
        )
      )
    : 0;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!planConfig) return;
    Animated.parallel([
      Animated.timing(progressAnims.ord, { toValue: Math.min(todayOrd / ordTarget, 1), duration: 900, useNativeDriver: false }),
      Animated.timing(progressAnims.mek, { toValue: Math.min(todayMek / mekTarget, 1), duration: 1000, useNativeDriver: false }),
      Animated.timing(progressAnims.quant, { toValue: Math.min(todayQuant / quantTarget, 1), duration: 1100, useNativeDriver: false }),
    ]).start();
  }, [todayOrd, todayMek, todayQuant, planConfig, progressAnims.ord, progressAnims.mek, progressAnims.quant, ordTarget, mekTarget, quantTarget]);

  useEffect(() => {
    const tabIndex = ['today', 'progress', 'settings'].indexOf(tab);
    Animated.spring(tabIndicatorAnim, { toValue: tabIndex, useNativeDriver: false, speed: 16, bounciness: 2 }).start();
    Animated.timing(weekAnim, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [tab, tabIndicatorAnim, weekAnim]);

  const handleSelectPlan = useCallback(async (type: HPPlanType) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await selectPlan(type, selectedDate);
    setTab('today');
  }, [selectPlan, selectedDate]);

  const handleCheckTask = useCallback(async (type: 'ord' | 'mek' | 'quant') => {
    if (!planConfig) return;
    const targets: Record<string, number> = { ord: ordTarget, mek: mekTarget, quant: quantTarget };
    const current: Record<string, number> = { ord: todayOrd, mek: todayMek, quant: todayQuant };
    if (current[type] >= targets[type]) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateDailyProgress(type, 1);
  }, [planConfig, ordTarget, mekTarget, quantTarget, todayOrd, todayMek, todayQuant, updateDailyProgress]);

  const handleDeletePlan = () => {
    Alert.alert(
      'Ta bort studieplan',
      'Är du säker? All din progress sparas men planen raderas.',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Ta bort', style: 'destructive', onPress: async () => { await deletePlan(); } },
      ]
    );
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'][d.getDay()];
  };

  const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  if (!plan) {
    return (
      <PlanSelectionView
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        daysUntil={daysUntil}
        countdownMsg={countdownMsg}
        suggestedPlan={suggestedPlan}
        onSelectPlan={handleSelectPlan}
        theme={theme}
        isDark={isDark}
        fadeAnim={fadeAnim}
      />
    );
  }

  const planColor = planConfig?.color ?? '#6366F1';
  const tabWidth = (SCREEN_WIDTH - 48) / 3;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark
          ? [planColor + '44', planColor + '18', 'transparent']
          : [planColor + '88', planColor + '44', 'transparent']}
        style={styles.headerBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.circleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Studieplan HP</Text>
            <Text style={[styles.headerSub, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>
              {HP_DATE_LABELS[plan.hpDateKey]}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.circleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
            onPress={() => setTab('settings')}
            activeOpacity={0.7}
          >
            <Settings size={18} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statStripItem}>
            <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{daysUntil}</Text>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>dagar kvar</Text>
          </View>
          <View style={[styles.statStripDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={styles.statStripItem}>
            <View style={styles.streakRow}>
              <Flame size={16} color="#F97316" />
              <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{progress.streak}</Text>
            </View>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>dagars streak</Text>
          </View>
          <View style={[styles.statStripDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={styles.statStripItem}>
            <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
              {currentDay}
              <Text style={[styles.statStripNumSub, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }]}>/{totalDays}</Text>
            </Text>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>plan dag</Text>
          </View>
        </View>

        <View style={styles.planChipRow}>
          <View style={[styles.planChip, { backgroundColor: planColor + '20', borderColor: planColor + '45', borderWidth: 1 }]}>
            <Text style={[styles.planChipText, { color: planColor }]}>{planConfig?.emoji} {planConfig?.name}</Text>
          </View>
          <Text style={[styles.countdownMsg, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>{countdownMsg}</Text>
        </View>
      </SafeAreaView>

      <View style={[styles.tabBar, { backgroundColor: isDark ? theme.colors.surface : '#F8F9FB', borderBottomColor: theme.colors.border }]}>
        <Animated.View
          style={[styles.tabIndicator, {
            backgroundColor: planColor,
            width: tabWidth - 16,
            transform: [{
              translateX: tabIndicatorAnim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [32, tabWidth + 32, tabWidth * 2 + 32],
              }),
            }],
          }]}
        />
        {(['today', 'progress', 'settings'] as ViewTab[]).map(t => {
          const labels: Record<ViewTab, string> = { today: 'Idag', progress: 'Progress', settings: 'Inställningar' };
          const active = tab === t;
          return (
            <TouchableOpacity key={t} style={styles.tabItem} onPress={() => setTab(t)} activeOpacity={0.7}>
              <Text style={[styles.tabLabel, {
                color: active ? planColor : theme.colors.textSecondary,
                fontWeight: active ? '700' as const : '500' as const,
              }]}>
                {labels[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'today' && (
          <TodayView
            planConfig={planConfig!}
            todayOrd={todayOrd}
            todayMek={todayMek}
            todayQuant={todayQuant}
            ordTarget={ordTarget}
            mekTarget={mekTarget}
            quantTarget={quantTarget}
            todayPct={todayPct}
            progressAnims={progressAnims}
            onCheckTask={handleCheckTask}
            onMarkAllDone={async () => {
              if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const remOrd = Math.max(0, ordTarget - todayOrd);
              const remMek = Math.max(0, mekTarget - todayMek);
              const remQuant = Math.max(0, quantTarget - todayQuant);
              for (let i = 0; i < remOrd; i++) await updateDailyProgress('ord', 1);
              for (let i = 0; i < remMek; i++) await updateDailyProgress('mek', 1);
              for (let i = 0; i < remQuant; i++) await updateDailyProgress('quant', 1);
            }}
            theme={theme}
            isDark={isDark}
            currentDay={currentDay}
            totalDays={totalDays}
          />
        )}
        {tab === 'progress' && (
          <ProgressView
            progress={progress}
            planConfig={planConfig!}
            weekStats={weekStats}
            getDayLabel={getDayLabel}
            isToday={isToday}
            totalDays={totalDays}
            currentDay={currentDay}
            theme={theme}
            isDark={isDark}
            weekAnim={weekAnim}
          />
        )}
        {tab === 'settings' && (
          <SettingsView
            plan={plan}
            onUpdateSettings={updateSettings}
            onDeletePlan={handleDeletePlan}
            theme={theme}
            isDark={isDark}
            planColor={planColor}
          />
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function PlanSelectionView({
  selectedDate, setSelectedDate, daysUntil, countdownMsg, suggestedPlan,
  onSelectPlan, theme, isDark, fadeAnim,
}: {
  selectedDate: HPDateKey; setSelectedDate: (k: HPDateKey) => void;
  daysUntil: number; countdownMsg: string; suggestedPlan: HPPlanType;
  onSelectPlan: (type: HPPlanType) => void; theme: any; isDark: boolean;
  fadeAnim: Animated.Value;
}) {
  const urgencyColor = daysUntil >= 60 ? '#10B981' : daysUntil >= 30 ? '#F97316' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#0F172A', '#1A1F3A', '#1E1B4B'] : ['#1A1A2E', '#16213E', '#0F3460']}
        style={selStyles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <TouchableOpacity style={selStyles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 28 }}>
            <Text style={selStyles.heroLabel}>Högskoleprov 2026</Text>
            <View style={selStyles.heroCountRow}>
              <Text style={[selStyles.heroBigNum, { color: urgencyColor }]}>{daysUntil}</Text>
              <View style={selStyles.heroNumRight}>
                <Text style={selStyles.heroNumLabel}>dagar</Text>
                <Text style={selStyles.heroNumLabel}>kvar</Text>
              </View>
            </View>
            <View style={[selStyles.msgPill, { backgroundColor: urgencyColor + '20', borderColor: urgencyColor + '45', borderWidth: 1 }]}>
              <Text style={[selStyles.msgPillText, { color: urgencyColor }]}>{countdownMsg}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={selStyles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[selStyles.sectionLabel, { color: theme.colors.text }]}>Nästa provtillfälle</Text>
        <View style={selStyles.dateRow}>
          {(['fall2026'] as HPDateKey[]).map(key => {
            const active = selectedDate === key;
            return (
              <AnimatedPressable
                key={key}
                onPress={() => setSelectedDate(key)}
                scaleValue={0.96}
              >
                <View style={[
                  selStyles.datePill,
                  {
                    backgroundColor: active ? '#6366F1' : theme.colors.surface,
                    borderColor: active ? '#6366F1' : theme.colors.border,
                  },
                  active && {
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 8,
                  },
                ]}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>🍂</Text>
                  <Text style={[selStyles.datePillTitle, { color: active ? '#FFF' : theme.colors.text }]}>
                    Höst 2026
                  </Text>
                  <Text style={[selStyles.datePillSub, { color: active ? 'rgba(255,255,255,0.75)' : theme.colors.textSecondary }]}>
                    18 oktober
                  </Text>
                  {active && (
                    <View style={selStyles.dateActiveCheck}>
                      <CheckCircle2 size={16} color="#FFF" fill="#FFF" />
                    </View>
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>

        <Text style={[selStyles.sectionLabel, { color: theme.colors.text }]}>Välj intensitet</Text>

        {PLAN_CONFIGS.map(config => (
          <PlanCard
            key={config.type}
            config={config}
            isSuggested={config.type === suggestedPlan}
            onSelect={() => onSelectPlan(config.type)}
            theme={theme}
            isDark={isDark}
          />
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function PlanCard({ config, isSuggested, onSelect, theme, isDark }: {
  config: PlanConfig; isSuggested: boolean; onSelect: () => void; theme: any; isDark: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isSuggested) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.015, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isSuggested, pulseAnim]);

  return (
    <AnimatedPressable onPress={onSelect} style={{ marginBottom: 18 }} scaleValue={0.975}>
      <Animated.View style={[
        { transform: [{ scale: isSuggested ? pulseAnim : 1 }] },
      ]}>
        <View style={[pcStyles.wrapper, isSuggested && {
          shadowColor: config.color,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
        }]}>
          <LinearGradient
            colors={[config.gradientColors[0], config.gradientColors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={pcStyles.top}
          >
            {isSuggested && (
              <View style={pcStyles.recBadge}>
                <Sparkles size={11} color="#FFF" />
                <Text style={pcStyles.recText}>Rekommenderad för dig</Text>
              </View>
            )}
            <View style={pcStyles.topRow}>
              <View style={pcStyles.emojiWrap}>
                <Text style={{ fontSize: 36 }}>{config.emoji}</Text>
              </View>
              <View style={pcStyles.topInfo}>
                <Text style={pcStyles.planName}>{config.name}</Text>
                <Text style={pcStyles.planSub}>{config.subtitle}</Text>
              </View>
              <View style={pcStyles.arrowCircle}>
                <ArrowRight size={16} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>

          <View style={[pcStyles.bottom, { backgroundColor: isDark ? '#1E293B' : '#FAFBFF' }]}>
            <View style={pcStyles.pillRow}>
              <TaskChip emoji="📖" label={`${config.wordsPerDay} ORD`} color={config.color} />
              <TaskChip emoji="✍️" label={`${config.mekPerDay} MEK`} color={config.color} />
              <TaskChip emoji="🔢" label={`${config.quantPerDay} KVA`} color={config.color} />
            </View>
            <View style={pcStyles.metaRow}>
              <View style={pcStyles.metaItem}>
                <Clock size={13} color={theme.colors.textSecondary} />
                <Text style={[pcStyles.metaText, { color: theme.colors.textSecondary }]}>{config.minutesPerDay}</Text>
              </View>
              <View style={[pcStyles.goalBadge, { backgroundColor: config.color + '15' }]}>
                <TrendingUp size={12} color={config.color} />
                <Text style={[pcStyles.goalText, { color: config.color }]}>{config.goalIncrease}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
}

function TaskChip({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <View style={[chipStyles.wrap, { backgroundColor: color + '14' }]}>
      <Text style={{ fontSize: 12 }}>{emoji}</Text>
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

function TodayView({
  planConfig, todayOrd, todayMek, todayQuant, ordTarget, mekTarget, quantTarget,
  todayPct, progressAnims, onCheckTask, onMarkAllDone, theme, isDark, currentDay, totalDays,
}: {
  planConfig: PlanConfig; todayOrd: number; todayMek: number; todayQuant: number;
  ordTarget: number; mekTarget: number; quantTarget: number;
  todayPct: number; progressAnims: { ord: Animated.Value; mek: Animated.Value; quant: Animated.Value };
  onCheckTask: (type: 'ord' | 'mek' | 'quant') => void;
  onMarkAllDone: () => void;
  theme: any; isDark: boolean; currentDay: number; totalDays: number;
}) {
  const now = new Date();
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const allDone = todayPct >= 100;

  const celebrationAnim = useRef(new Animated.Value(allDone ? 1 : 0)).current;

  useEffect(() => {
    if (allDone) {
      Animated.spring(celebrationAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 12 }).start();
    }
  }, [allDone, celebrationAnim]);

  const tasks = [
    {
      type: 'ord' as const,
      emoji: '📖',
      label: 'Ordkunskap',
      code: 'ORD',
      desc: `Lär dig ${ordTarget} nya ord idag`,
      completed: todayOrd,
      target: ordTarget,
      color: '#10B981',
      animVal: progressAnims.ord,
      duration: 10,
      sectionCode: 'ORD',
    },
    {
      type: 'mek' as const,
      emoji: '✍️',
      label: 'Meningskomplettering',
      code: 'MEK',
      desc: `${mekTarget} meningskompletteringar`,
      completed: todayMek,
      target: mekTarget,
      color: '#6366F1',
      animVal: progressAnims.mek,
      duration: 15,
      sectionCode: 'MEK',
    },
    {
      type: 'quant' as const,
      emoji: '🔢',
      label: 'Kvantitativt',
      code: 'KVA',
      desc: `${quantTarget} kvantitativa uppgifter`,
      completed: todayQuant,
      target: quantTarget,
      color: '#F97316',
      animVal: progressAnims.quant,
      duration: 10,
      sectionCode: 'KVA',
    },
  ];

  return (
    <View>
      <View style={todayStyles.dateRow}>
        <View style={todayStyles.dateLeft}>
          <Calendar size={14} color={theme.colors.textSecondary} />
          <Text style={[todayStyles.dateText, { color: theme.colors.textSecondary }]}>{dayLabel}</Text>
        </View>
        <View style={[todayStyles.dayBadge, { backgroundColor: planConfig.color + '14' }]}>
          <Text style={[todayStyles.dayBadgeText, { color: planConfig.color }]}>Dag {currentDay}/{totalDays}</Text>
        </View>
      </View>

      <View style={[todayStyles.overallCard, {
        backgroundColor: allDone
          ? isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.06)'
          : isDark ? theme.colors.surface : '#FAFBFF',
        borderColor: allDone ? '#10B981' + '60' : theme.colors.border,
      }]}>
        {allDone && (
          <Animated.View style={[todayStyles.celebrationBanner, {
            transform: [{ scale: celebrationAnim }],
            opacity: celebrationAnim,
          }]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={todayStyles.celebrationGradient}
            >
              <Text style={todayStyles.celebrationEmoji}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={todayStyles.celebrationTitle}>Allt klart idag!</Text>
                <Text style={todayStyles.celebrationSub}>Fantastiskt jobbat – streaken håller!</Text>
              </View>
              <Sparkles size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </Animated.View>
        )}

        {!allDone && (
          <>
            <View style={todayStyles.overallTop}>
              <View style={{ flex: 1 }}>
                <Text style={[todayStyles.overallTitle, { color: theme.colors.text }]}>Dagens framsteg</Text>
                <Text style={[todayStyles.overallSub, { color: theme.colors.textSecondary }]}>{todayPct}% slutfört</Text>
              </View>
              <View style={[todayStyles.pctCircle, { backgroundColor: planConfig.color }]}>
                <Text style={todayStyles.pctText}>{todayPct}%</Text>
              </View>
            </View>
            <View style={[todayStyles.overallBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <Animated.View
                style={[todayStyles.overallBarFill, {
                  width: progressAnims.ord.interpolate({ inputRange: [0, 1], outputRange: ['0%', '33.3%'] }),
                  backgroundColor: '#10B981',
                }]}
              />
              <Animated.View
                style={[todayStyles.overallBarFill, {
                  marginLeft: 2,
                  width: progressAnims.mek.interpolate({ inputRange: [0, 1], outputRange: ['0%', '33.3%'] }),
                  backgroundColor: '#6366F1',
                }]}
              />
              <Animated.View
                style={[todayStyles.overallBarFill, {
                  marginLeft: 2,
                  width: progressAnims.quant.interpolate({ inputRange: [0, 1], outputRange: ['0%', '33.3%'] }),
                  backgroundColor: '#F97316',
                }]}
              />
            </View>
          </>
        )}
      </View>

      <View style={todayStyles.sectionHeaderRow}>
        <Text style={[todayStyles.sectionTitle, { color: theme.colors.text }]}>Dagens uppgifter</Text>
        {!allDone && (
          <AnimatedPressable
            onPress={onMarkAllDone}
            scaleValue={0.94}
          >
            <View style={[todayStyles.markAllBtn, { backgroundColor: planConfig.color + '12', borderColor: planConfig.color + '30' }]}>
              <CheckCheck size={14} color={planConfig.color} />
              <Text style={[todayStyles.markAllText, { color: planConfig.color }]}>Alla klara</Text>
            </View>
          </AnimatedPressable>
        )}
      </View>

      {tasks.map(task => {
        const done = task.completed >= task.target;
        return (
          <View
            key={task.type}
            style={[taskStyles.card, {
              backgroundColor: isDark ? theme.colors.surface : '#FFF',
              borderColor: done ? task.color + '50' : isDark ? theme.colors.border : 'rgba(0,0,0,0.06)',
              borderWidth: done ? 1.5 : 1,
            }]}
          >
            <LinearGradient
              colors={[task.color + '18', task.color + '06']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={taskStyles.iconArea}
            >
              <Text style={{ fontSize: 28 }}>{task.emoji}</Text>
              <View style={[taskStyles.codeChip, { backgroundColor: task.color + '20' }]}>
                <Text style={[taskStyles.codeText, { color: task.color }]}>{task.code}</Text>
              </View>
            </LinearGradient>

            <View style={taskStyles.body}>
              <View style={taskStyles.topRow}>
                <Text style={[taskStyles.name, { color: theme.colors.text }]}>{task.label}</Text>
                {done
                  ? <CheckCircle2 size={22} color={task.color} fill={task.color} />
                  : (
                    <View style={[taskStyles.countBadge, { backgroundColor: task.color + '14' }]}>
                      <Text style={[taskStyles.countText, { color: task.color }]}>{task.completed}/{task.target}</Text>
                    </View>
                  )}
              </View>
              <Text style={[taskStyles.desc, { color: theme.colors.textSecondary }]}>{task.desc}</Text>

              <View style={taskStyles.barRow}>
                <View style={[taskStyles.barBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <Animated.View style={[taskStyles.barFill, {
                    width: task.animVal.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: task.color,
                  }]} />
                </View>
              </View>

              <View style={taskStyles.bottomRow}>
                <View style={taskStyles.metaRow}>
                  <Clock size={12} color={theme.colors.textSecondary} />
                  <Text style={[taskStyles.metaText, { color: theme.colors.textSecondary }]}>~{task.duration} min</Text>
                  {done && <Text style={[taskStyles.tapHint, { color: task.color }]}>Klart 🎉</Text>}
                </View>
                <View style={taskStyles.actionRow}>
                  {!done && (
                    <AnimatedPressable onPress={() => onCheckTask(task.type)} scaleValue={0.9}>
                      <View style={[taskStyles.checkBtn, { backgroundColor: task.color + '12', borderColor: task.color + '30' }]}>
                        <CheckCircle2 size={13} color={task.color} />
                        <Text style={[taskStyles.checkBtnText, { color: task.color }]}>+1</Text>
                      </View>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable
                    onPress={() => router.push({ pathname: ROUTES.hpSelectVersion, params: { sectionCode: task.sectionCode } })}
                    scaleValue={0.93}
                  >
                    <View style={[taskStyles.goBtn, { backgroundColor: task.color, shadowColor: task.color }]}>
                      <Text style={taskStyles.goBtnText}>Träna</Text>
                      <ArrowRight size={12} color="#FFF" />
                    </View>
                  </AnimatedPressable>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ProgressView({
  progress, planConfig, weekStats, getDayLabel, isToday, totalDays, currentDay, theme, isDark, weekAnim,
}: {
  progress: any; planConfig: PlanConfig; weekStats: any[];
  getDayLabel: (d: string) => string; isToday: (d: string) => boolean;
  totalDays: number; currentDay: number; theme: any; isDark: boolean; weekAnim: Animated.Value;
}) {
  const completedDays = weekStats.filter((d: any) => d.fullyCompleted).length;
  const planProgress = Math.min(currentDay / totalDays, 1);
  const maxMinutes = Math.max(...weekStats.map((d: any) => d.minutesSpent), 1);

  return (
    <View>
      <Text style={[progStyles.sectionTitle, { color: theme.colors.text }]}>Totalt</Text>
      <View style={progStyles.statsGrid}>
        <StatCard label="Ord inlärda" value={progress.totalWordsLearned} emoji="📖" color="#10B981" theme={theme} isDark={isDark} />
        <StatCard label="MEK gjorda" value={progress.totalMekCompleted} emoji="✍️" color="#6366F1" theme={theme} isDark={isDark} />
        <StatCard label="KVA lösta" value={progress.totalQuantCompleted} emoji="🔢" color="#F97316" theme={theme} isDark={isDark} />
      </View>

      <View style={[progStyles.streakCard, {
        backgroundColor: isDark ? '#1E293B' : '#FFF',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 5,
      }]}>
        <LinearGradient
          colors={['rgba(239,68,68,0.1)', 'rgba(249,115,22,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={progStyles.streakGradient}
        >
          <View style={progStyles.streakLeft}>
            <View style={[progStyles.streakIconBg, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Flame size={28} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[progStyles.streakNum, { color: theme.colors.text }]}>{progress.streak} dagars streak</Text>
              <Text style={[progStyles.streakSub, { color: theme.colors.textSecondary }]}>
                Längst: {progress.longestStreak} dagar · {progress.totalMinutes} min totalt
              </Text>
            </View>
          </View>
          <Trophy size={24} color="#F59E0B" />
        </LinearGradient>
      </View>

      <Text style={[progStyles.sectionTitle, { color: theme.colors.text, marginTop: 8 }]}>Veckans aktivitet</Text>
      <View style={[progStyles.weekCard, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
        {weekStats.map((day: any) => {
          const todayMark = isToday(day.date);
          const barH = day.minutesSpent > 0 ? Math.max(12, (day.minutesSpent / maxMinutes) * 64) : 6;
          return (
            <View key={day.date} style={progStyles.weekCol}>
              {day.fullyCompleted && (
                <View style={[progStyles.weekCheckDot, { backgroundColor: planConfig.color }]}>
                  <CheckCircle2 size={8} color="#FFF" fill="#FFF" />
                </View>
              )}
              <Animated.View
                style={[progStyles.weekBar, {
                  height: weekAnim.interpolate({ inputRange: [0, 1], outputRange: [3, barH] }),
                  backgroundColor: day.fullyCompleted ? planConfig.color : day.minutesSpent > 0 ? planConfig.color + '50' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  borderRadius: 6,
                }]}
              />
              <Text style={[progStyles.weekLabel, {
                color: todayMark ? planConfig.color : theme.colors.textSecondary,
                fontWeight: todayMark ? '700' as const : '500' as const,
              }]}>
                {getDayLabel(day.date)}
              </Text>
              {todayMark && <View style={[progStyles.weekTodayDot, { backgroundColor: planConfig.color }]} />}
            </View>
          );
        })}
      </View>
      <Text style={[progStyles.weekNote, { color: theme.colors.textSecondary }]}>
        {completedDays}/7 dagar slutförda denna vecka
      </Text>

      <Text style={[progStyles.sectionTitle, { color: theme.colors.text, marginTop: 8 }]}>Planens framsteg</Text>
      <View style={[progStyles.planCard, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
        <View style={progStyles.planHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[progStyles.planDayText, { color: theme.colors.text }]}>Dag {currentDay} av {totalDays}</Text>
            <Text style={[progStyles.planNote, { color: theme.colors.textSecondary }]}>
              {totalDays - currentDay} dagar kvar på planen
            </Text>
          </View>
          <View style={[progStyles.planPctBadge, { backgroundColor: planConfig.color + '14' }]}>
            <Text style={[progStyles.planPct, { color: planConfig.color }]}>{Math.round(planProgress * 100)}%</Text>
          </View>
        </View>
        <View style={[progStyles.planBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={[progStyles.planBarFill, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color }]} />
        </View>
        <View style={progStyles.planMarkers}>
          <View style={[progStyles.planMarkerDot, { left: '25%', backgroundColor: planConfig.color + '30' }]} />
          <View style={[progStyles.planMarkerDot, { left: '50%', backgroundColor: planConfig.color + '30' }]} />
          <View style={[progStyles.planMarkerDot, { left: '75%', backgroundColor: planConfig.color + '30' }]} />
          <View style={[progStyles.planEndFlag, { left: '100%' }]}>
            <Target size={14} color={planConfig.color} />
          </View>
        </View>
      </View>
    </View>
  );
}

function StatCard({ label, value, emoji, color, theme, isDark }: {
  label: string; value: number; emoji: string; color: string; theme: any; isDark: boolean;
}) {
  return (
    <View style={[scStyles.card, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
      <LinearGradient
        colors={[color + '18', color + '06']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={scStyles.gradient}
      >
        <Text style={{ fontSize: 26, marginBottom: 8 }}>{emoji}</Text>
        <Text style={[scStyles.val, { color }]}>{value}</Text>
        <Text style={[scStyles.lbl, { color: theme.colors.textSecondary }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

function SettingsView({ plan, onUpdateSettings, onDeletePlan, theme, isDark, planColor }: {
  plan: any; onUpdateSettings: (updates: any) => void; onDeletePlan: () => void;
  theme: any; isDark: boolean; planColor: string;
}) {
  return (
    <View>
      <Text style={[setStyles.sectionTitle, { color: theme.colors.text }]}>Notifikationer</Text>
      <View style={[setStyles.card, { backgroundColor: isDark ? theme.colors.surface : '#FFF', borderColor: isDark ? theme.colors.border : 'rgba(0,0,0,0.06)' }]}>
        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#6366F115' }]}>
              <Bell size={18} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Daglig påminnelse</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Påminnelse varje dag</Text>
            </View>
          </View>
          <Switch
            value={plan.notificationsEnabled}
            onValueChange={val => onUpdateSettings({ notificationsEnabled: val })}
            trackColor={{ false: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', true: planColor }}
            thumbColor="#FFF"
          />
        </View>

        {plan.notificationsEnabled && (
          <View style={setStyles.timePicker}>
            <Text style={[setStyles.timeLabel, { color: theme.colors.textSecondary }]}>Välj tid</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={setStyles.timeScrollContent}>
              {[15, 16, 17, 18, 19, 20, 21, 22].map(h => {
                const active = plan.dailyReminderHour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[setStyles.timeBtn, {
                      backgroundColor: active ? planColor : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: active ? planColor : 'transparent',
                    }]}
                    onPress={() => onUpdateSettings({ dailyReminderHour: h, dailyReminderMinute: 0 })}
                    activeOpacity={0.7}
                  >
                    <Text style={[setStyles.timeBtnText, { color: active ? '#FFF' : theme.colors.textSecondary }]}>{h}:00</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={[setStyles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#EF444415' }]}>
              <Flame size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Streak-varningar</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Varning vid risk för att tappa streak</Text>
            </View>
          </View>
          <Switch
            value={plan.streakWarnings}
            onValueChange={val => onUpdateSettings({ streakWarnings: val })}
            trackColor={{ false: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', true: '#EF4444' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[setStyles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#F59E0B15' }]}>
              <Trophy size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Milstolpar</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Fira när du når mål</Text>
            </View>
          </View>
          <Switch
            value={plan.milestonesEnabled}
            onValueChange={val => onUpdateSettings({ milestonesEnabled: val })}
            trackColor={{ false: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', true: '#F59E0B' }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <Text style={[setStyles.sectionTitle, { color: theme.colors.text, marginTop: 12 }]}>Hantera plan</Text>
      <AnimatedPressable onPress={onDeletePlan} scaleValue={0.97}>
        <View style={[setStyles.dangerBtn, {
          backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
          borderColor: 'rgba(239,68,68,0.2)',
        }]}>
          <Trash2 size={18} color="#EF4444" />
          <Text style={setStyles.dangerText}>Ta bort studieplan</Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  headerSafe: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    marginBottom: 24,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  statStripItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  statStripNum: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  statStripNumSub: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  statStripLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500' as const,
  },
  statStripDivider: {
    width: 1,
    height: 40,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 10,
  },
  planChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planChipText: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  countdownMsg: {
    fontSize: 12,
    flex: 1,
    flexWrap: 'wrap' as const,
    fontWeight: '500' as const,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 1.5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },
});

const selStyles = StyleSheet.create({
  hero: {
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  heroCountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 18,
  },
  heroBigNum: {
    fontSize: 78,
    fontWeight: '900' as const,
    lineHeight: 82,
    letterSpacing: -4,
  },
  heroNumRight: {
    marginBottom: 12,
  },
  heroNumLabel: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  msgPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  msgPillText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scroll: {
    padding: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
    marginTop: 8,
    letterSpacing: -0.4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 30,
  },
  datePill: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  datePillTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 3,
  },
  datePillSub: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  dateActiveCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.8,
  },
});

const pcStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  top: {
    padding: 22,
    paddingBottom: 18,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 16,
  },
  recText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 21,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  planSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 19,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    padding: 18,
    paddingTop: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
});

const chipStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
});

const todayStyles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dayBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  overallCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  celebrationBanner: {
    margin: -20,
    overflow: 'hidden',
  },
  celebrationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  celebrationEmoji: {
    fontSize: 32,
  },
  celebrationTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  celebrationSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  overallTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overallTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  overallSub: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500' as const,
  },
  pctCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pctText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  overallBarBg: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  overallBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

const taskStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconArea: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  codeChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
  },
  body: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700' as const,
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  barRow: {
    marginBottom: 10,
  },
  barBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  goBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  goBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
});

const progStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  streakCard: {
    borderRadius: 22,
    marginBottom: 24,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  streakIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNum: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  streakSub: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
  weekCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 14,
    borderRadius: 22,
    marginBottom: 8,
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekCol: {
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  weekBar: {
    width: 28,
    minHeight: 6,
    borderRadius: 6,
  },
  weekCheckDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 12,
  },
  weekTodayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekNote: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500' as const,
  },
  planCard: {
    padding: 22,
    borderRadius: 22,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planDayText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  planPctBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  planPct: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  planBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  planBarFill: {
    height: '100%',
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  planMarkers: {
    position: 'relative',
    height: 16,
  },
  planMarkerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 6,
    marginLeft: -2,
  },
  planEndFlag: {
    position: 'absolute',
    top: 0,
    marginLeft: -7,
  },
  planNote: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500' as const,
  },
});

const scStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  val: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  lbl: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
});

const setStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  card: {
    borderRadius: 22,
    marginBottom: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400' as const,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  timePicker: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  timeLabel: {
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '500' as const,
  },
  timeScrollContent: {
    gap: 8,
  },
  timeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  timeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
