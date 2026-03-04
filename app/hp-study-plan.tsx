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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Flame,
  CheckCircle2,
  Circle,
  Bell,
  Settings,
  Trophy,
  Clock,
  Trash2,
  Star,
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



type ViewTab = 'today' | 'progress' | 'settings';

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
  const [selectedDate, setSelectedDate] = useState<HPDateKey>('spring2026');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progressAnims] = useState({
    ord: new Animated.Value(0),
    mek: new Animated.Value(0),
    quant: new Animated.Value(0),
  });
  const weekAnim = useRef(new Animated.Value(0)).current;

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
    ? Math.round(
        (((todayOrd / ordTarget) + (todayMek / mekTarget) + (todayQuant / quantTarget)) / 3) * 100
      )
    : 0;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!planConfig) return;
    Animated.parallel([
      Animated.timing(progressAnims.ord, {
        toValue: Math.min(todayOrd / ordTarget, 1),
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnims.mek, {
        toValue: Math.min(todayMek / mekTarget, 1),
        duration: 900,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnims.quant, {
        toValue: Math.min(todayQuant / quantTarget, 1),
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [todayOrd, todayMek, todayQuant, planConfig]);

  useEffect(() => {
    Animated.timing(weekAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [tab]);

  const handleSelectPlan = useCallback(async (type: HPPlanType) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await selectPlan(type, selectedDate);
    setTab('today');
  }, [selectPlan, selectedDate]);

  const handleCheckTask = useCallback(async (type: 'ord' | 'mek' | 'quant') => {
    if (!planConfig) return;
    const targets: Record<string, number> = {
      ord: ordTarget,
      mek: mekTarget,
      quant: quantTarget,
    };
    const current: Record<string, number> = {
      ord: todayOrd,
      mek: todayMek,
      quant: todayQuant,
    };
    if (current[type] >= targets[type]) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateDailyProgress(type, 1);
  }, [planConfig, ordTarget, mekTarget, quantTarget, todayOrd, todayMek, todayQuant, updateDailyProgress]);

  const handleDeletePlan = () => {
    Alert.alert(
      'Ta bort studieplan',
      'Är du säker? All din progress sparas men planen raderas.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            await deletePlan();
          },
        },
      ]
    );
  };

  const getDayLabel = (dateStr: string): string => {
    const d = new Date(dateStr);
    const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    return days[d.getDay()];
  };

  const isToday = (dateStr: string): boolean => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  if (!plan) {
    return <PlanSelectionView
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      daysUntil={daysUntil}
      countdownMsg={countdownMsg}
      suggestedPlan={suggestedPlan}
      onSelectPlan={handleSelectPlan}
      theme={theme}
      isDark={isDark}
      fadeAnim={fadeAnim}
    />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B'] : ['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ChevronLeft size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Studieplan HP</Text>
              <Text style={styles.headerSub}>{HP_DATE_LABELS[plan.hpDateKey]}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setTab('settings')}
            >
              <Settings size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.countdownRow}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{daysUntil}</Text>
              <Text style={styles.countdownLabel}>dagar kvar</Text>
            </View>
            <View style={styles.countdownDivider} />
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{progress.streak}</Text>
              <Text style={styles.countdownLabel}>dagars streak</Text>
            </View>
            <View style={styles.countdownDivider} />
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{currentDay}</Text>
              <Text style={styles.countdownLabel}>av {totalDays} dagar</Text>
            </View>
          </View>

          <Text style={styles.countdownMsg}>{countdownMsg}</Text>

          <View style={styles.planPill}>
            <Text style={styles.planPillText}>{planConfig?.emoji} {planConfig?.name}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {(['today', 'progress', 'settings'] as ViewTab[]).map(t => {
          const labels: Record<ViewTab, string> = { today: 'Idag', progress: 'Progress', settings: 'Inställningar' };
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabLabel, { color: active ? '#6366F1' : theme.colors.textSecondary }]}>
                {labels[t]}
              </Text>
              {active && <View style={styles.tabUnderline} />}
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
          />
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function PlanSelectionView({
  selectedDate,
  setSelectedDate,
  daysUntil,
  countdownMsg,
  suggestedPlan,
  onSelectPlan,
  theme,
  isDark,
  fadeAnim,
}: {
  selectedDate: HPDateKey;
  setSelectedDate: (k: HPDateKey) => void;
  daysUntil: number;
  countdownMsg: string;
  suggestedPlan: HPPlanType;
  onSelectPlan: (type: HPPlanType) => void;
  theme: any;
  isDark: boolean;
  fadeAnim: Animated.Value;
}) {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B', '#1E1B4B'] : ['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.selectionHeader}
      >
        <SafeAreaView edges={['top']}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.selectionTitle}>Välj studieplan</Text>
            <Text style={styles.selectionSub}>
              Anpassad förberedelse inför Högskoleprov 2026
            </Text>
          </Animated.View>

          <View style={styles.daysBox}>
            <Text style={styles.daysNumber}>{daysUntil}</Text>
            <Text style={styles.daysLabel}>dagar kvar till nästa HP</Text>
          </View>
          <Text style={styles.selectionCountdownMsg}>{countdownMsg}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.selectionScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.chooseDateLabel, { color: theme.colors.text }]}>Välj provtillfälle</Text>
        <View style={styles.dateRow}>
          {(['spring2026', 'fall2026'] as HPDateKey[]).map(key => {
            const active = selectedDate === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.datePill,
                  {
                    backgroundColor: active ? '#6366F1' : theme.colors.surface,
                    borderColor: active ? '#6366F1' : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedDate(key)}
              >
                <Text style={{ fontSize: 16, marginBottom: 2 }}>{key === 'spring2026' ? '🌸' : '🍂'}</Text>
                <Text style={[styles.datePillText, { color: active ? '#FFF' : theme.colors.text }]}>
                  {HP_DATE_LABELS[key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.choosePlanLabel, { color: theme.colors.text }]}>Välj intensitet</Text>

        {PLAN_CONFIGS.map(config => {
          const isSuggested = config.type === suggestedPlan;
          return (
            <PlanCard
              key={config.type}
              config={config}
              isSuggested={isSuggested}
              onSelect={() => onSelectPlan(config.type)}
              theme={theme}
              isDark={isDark}
            />
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function PlanCard({
  config,
  isSuggested,
  onSelect,
  theme,
  isDark,
}: {
  config: PlanConfig;
  isSuggested: boolean;
  onSelect: () => void;
  theme: any;
  isDark: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 14 }}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={[
            styles.planCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isSuggested ? config.color : theme.colors.border,
              borderWidth: isSuggested ? 2 : 1,
            },
          ]}
        >
          {isSuggested && (
            <View style={[styles.recommendedBadge, { backgroundColor: config.color }]}>
              <Star size={10} color="#FFF" fill="#FFF" />
              <Text style={styles.recommendedText}>Rekommenderad</Text>
            </View>
          )}

          <LinearGradient
            colors={config.gradientColors}
            style={styles.planCardIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={{ fontSize: 26 }}>{config.emoji}</Text>
          </LinearGradient>

          <View style={styles.planCardBody}>
            <Text style={[styles.planCardName, { color: theme.colors.text }]}>{config.name}</Text>
            <Text style={[styles.planCardSub, { color: theme.colors.textSecondary }]}>{config.subtitle}</Text>

            <View style={styles.planCardStats}>
              <View style={styles.planStat}>
                <Clock size={12} color={config.color} />
                <Text style={[styles.planStatText, { color: theme.colors.textSecondary }]}>{config.minutesPerDay}</Text>
              </View>
              <View style={styles.planStat}>
                <Trophy size={12} color={config.color} />
                <Text style={[styles.planStatText, { color: theme.colors.textSecondary }]}>{config.goalIncrease}</Text>
              </View>
            </View>

            <View style={styles.planCardTasks}>
              <TaskPill emoji="📖" label={`${config.wordsPerDay} ORD`} color={config.color} />
              <TaskPill emoji="✍️" label={`${config.mekPerDay} MEK`} color={config.color} />
              <TaskPill emoji="🔢" label={`${config.quantPerDay} KVA`} color={config.color} />
            </View>
          </View>

          <View style={[styles.planCardArrow, { backgroundColor: `${config.color}15` }]}>
            <ChevronRight size={18} color={config.color} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TaskPill({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <View style={[styles.taskPill, { backgroundColor: `${color}15` }]}>
      <Text style={{ fontSize: 11 }}>{emoji}</Text>
      <Text style={[styles.taskPillText, { color }]}>{label}</Text>
    </View>
  );
}

function TodayView({
  planConfig,
  todayOrd,
  todayMek,
  todayQuant,
  ordTarget,
  mekTarget,
  quantTarget,
  todayPct,
  progressAnims,
  onCheckTask,
  theme,
  isDark,
  currentDay,
  totalDays,
}: {
  planConfig: PlanConfig;
  todayOrd: number;
  todayMek: number;
  todayQuant: number;
  ordTarget: number;
  mekTarget: number;
  quantTarget: number;
  todayPct: number;
  progressAnims: { ord: Animated.Value; mek: Animated.Value; quant: Animated.Value };
  onCheckTask: (type: 'ord' | 'mek' | 'quant') => void;
  theme: any;
  isDark: boolean;
  currentDay: number;
  totalDays: number;
}) {
  const now = new Date();
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;

  const tasks = [
    {
      type: 'ord' as const,
      emoji: '📖',
      label: 'ORD – Ordkunskap',
      desc: `Lär dig ${ordTarget} nya ord`,
      duration: 10,
      completed: todayOrd,
      target: ordTarget,
      color: '#10B981',
      animVal: progressAnims.ord,
    },
    {
      type: 'mek' as const,
      emoji: '✍️',
      label: 'MEK – Meningskomplettering',
      desc: `${mekTarget} meningskompletteringar`,
      duration: 15,
      completed: todayMek,
      target: mekTarget,
      color: '#6366F1',
      animVal: progressAnims.mek,
    },
    {
      type: 'quant' as const,
      emoji: '🔢',
      label: 'KVA/NOG – Kvantitativt',
      desc: `${quantTarget} kvantitativa uppgifter`,
      duration: 10,
      completed: todayQuant,
      target: quantTarget,
      color: '#F59E0B',
      animVal: progressAnims.quant,
    },
  ];

  const allDone = todayPct >= 100;

  return (
    <View>
      <View style={[styles.dateRow2, { borderBottomColor: theme.colors.border }]}>
        <Calendar size={14} color={theme.colors.textSecondary} />
        <Text style={[styles.dateLabelText, { color: theme.colors.textSecondary }]}>{dayLabel}</Text>
        <Text style={[styles.dayBadge, { color: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)' }]}>
          Dag {currentDay}/{totalDays}
        </Text>
      </View>

      <View style={[styles.todayProgressCard, {
        backgroundColor: allDone
          ? isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'
          : theme.colors.surface,
        borderColor: allDone ? '#10B981' : theme.colors.border,
      }]}>
        <View style={styles.todayProgressHeader}>
          <Text style={[styles.todayProgressTitle, { color: theme.colors.text }]}>
            {allDone ? '🎉 Dagens mål klart!' : 'Dagens framsteg'}
          </Text>
          <Text style={[styles.todayProgressPct, { color: allDone ? '#10B981' : '#6366F1' }]}>
            {todayPct}%
          </Text>
        </View>
        <View style={[styles.bigProgressBg, { backgroundColor: theme.colors.border }]}>
          <Animated.View
            style={[
              styles.bigProgressFill,
              {
                width: progressAnims.ord.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${Math.round(100 / 3)}%`],
                }),
                backgroundColor: allDone ? '#10B981' : '#6366F1',
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bigProgressFill,
              {
                width: progressAnims.mek.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${Math.round(100 / 3)}%`],
                }),
                backgroundColor: allDone ? '#10B981' : '#8B5CF6',
                marginLeft: 2,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bigProgressFill,
              {
                width: progressAnims.quant.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${Math.round(100 / 3)}%`],
                }),
                backgroundColor: allDone ? '#10B981' : '#EC4899',
                marginLeft: 2,
              },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Dagens uppgifter</Text>

      {tasks.map(task => {
        const done = task.completed >= task.target;
        return (
          <TouchableOpacity
            key={task.type}
            style={[
              styles.taskCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: done ? task.color : theme.colors.border,
                borderWidth: done ? 1.5 : 1,
              },
            ]}
            onPress={() => onCheckTask(task.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.taskEmojiBg, { backgroundColor: `${task.color}15` }]}>
              <Text style={{ fontSize: 22 }}>{task.emoji}</Text>
            </View>
            <View style={styles.taskBody}>
              <View style={styles.taskTopRow}>
                <Text style={[styles.taskName, { color: theme.colors.text }]}>{task.label}</Text>
                {done
                  ? <CheckCircle2 size={20} color={task.color} fill={task.color} />
                  : <Circle size={20} color={theme.colors.border} />
                }
              </View>
              <Text style={[styles.taskDesc, { color: theme.colors.textSecondary }]}>{task.desc}</Text>
              <View style={styles.taskBottom}>
                <View style={[styles.taskProgressBg, { backgroundColor: theme.colors.border }]}>
                  <Animated.View
                    style={[
                      styles.taskProgressFill,
                      {
                        width: task.animVal.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: task.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.taskCount, { color: task.color }]}>
                  {task.completed}/{task.target}
                </Text>
              </View>
              <View style={styles.taskMeta}>
                <Clock size={11} color={theme.colors.textSecondary} />
                <Text style={[styles.taskMetaText, { color: theme.colors.textSecondary }]}>
                  ~{task.duration} min
                </Text>
                {!done && (
                  <Text style={[styles.tapHint, { color: task.color }]}>
                    Tryck för att markera
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ProgressView({
  progress,
  planConfig,
  weekStats,
  getDayLabel,
  isToday,
  totalDays,
  currentDay,
  theme,
  isDark,
  weekAnim,
}: {
  progress: any;
  planConfig: PlanConfig;
  weekStats: any[];
  getDayLabel: (d: string) => string;
  isToday: (d: string) => boolean;
  totalDays: number;
  currentDay: number;
  theme: any;
  isDark: boolean;
  weekAnim: Animated.Value;
}) {
  const completedDays = weekStats.filter(d => d.fullyCompleted).length;
  const planProgress = Math.min(currentDay / totalDays, 1);

  return (
    <View>
      <View style={styles.statsRow}>
        <StatBox label="Totalt ord" value={progress.totalWordsLearned.toString()} emoji="📖" color="#10B981" theme={theme} />
        <StatBox label="MEK gjorda" value={progress.totalMekCompleted.toString()} emoji="✍️" color="#6366F1" theme={theme} />
        <StatBox label="Kvant" value={progress.totalQuantCompleted.toString()} emoji="🔢" color="#F59E0B" theme={theme} />
      </View>

      <View style={[styles.streakCard, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)' }]}>
        <Flame size={28} color="#EF4444" />
        <View style={styles.streakInfo}>
          <Text style={[styles.streakNumber, { color: theme.colors.text }]}>{progress.streak} dagars streak</Text>
          <Text style={[styles.streakSub, { color: theme.colors.textSecondary }]}>
            Längst: {progress.longestStreak} dagar · {progress.totalMinutes} min totalt
          </Text>
        </View>
        <Trophy size={20} color="#F59E0B" />
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Veckans aktivitet</Text>
      <View style={[styles.weekCard, { backgroundColor: theme.colors.surface }]}>
        {weekStats.map((day, i) => {
          const active = day.fullyCompleted;
          const todayMark = isToday(day.date);
          return (
            <View key={day.date} style={styles.weekDayCol}>
              <Animated.View
                style={[
                  styles.weekBar,
                  {
                    height: weekAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, active ? 44 : (day.minutesSpent > 0 ? 20 : 4)],
                    }),
                    backgroundColor: active
                      ? planConfig.color
                      : day.minutesSpent > 0
                        ? `${planConfig.color}60`
                        : theme.colors.border,
                  },
                ]}
              />
              <Text style={[
                styles.weekDayLabel,
                { color: todayMark ? planConfig.color : theme.colors.textSecondary },
                todayMark && { fontWeight: '700' as const },
              ]}>
                {getDayLabel(day.date)}
              </Text>
              {todayMark && <View style={[styles.weekDot, { backgroundColor: planConfig.color }]} />}
            </View>
          );
        })}
      </View>
      <Text style={[styles.weekSub, { color: theme.colors.textSecondary }]}>
        {completedDays}/7 dagar slutförda denna vecka
      </Text>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Planens framsteg</Text>
      <View style={[styles.planProgressCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.planProgressHeader}>
          <Text style={[styles.planProgressLabel, { color: theme.colors.text }]}>Dag {currentDay} av {totalDays}</Text>
          <Text style={[styles.planProgressPct, { color: planConfig.color }]}>
            {Math.round(planProgress * 100)}%
          </Text>
        </View>
        <View style={[styles.planProgressBg, { backgroundColor: theme.colors.border }]}>
          <View style={[styles.planProgressFill, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color }]} />
        </View>
      </View>
    </View>
  );
}

function StatBox({ label, value, emoji, color, theme }: {
  label: string; value: string; emoji: string; color: string; theme: any;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function SettingsView({
  plan,
  onUpdateSettings,
  onDeletePlan,
  theme,
  isDark,
}: {
  plan: any;
  onUpdateSettings: (updates: any) => void;
  onDeletePlan: () => void;
  theme: any;
  isDark: boolean;
}) {
  return (
    <View>
      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Notifikationer</Text>
      <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.settingsRow}>
          <View style={styles.settingsLeft}>
            <Bell size={18} color="#6366F1" />
            <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>Daglig påminnelse</Text>
          </View>
          <Switch
            value={plan.notificationsEnabled}
            onValueChange={val => onUpdateSettings({ notificationsEnabled: val })}
            trackColor={{ false: theme.colors.border, true: '#6366F1' }}
            thumbColor="#FFF"
          />
        </View>

        {plan.notificationsEnabled && (
          <View style={styles.reminderTimeRow}>
            <Text style={[styles.reminderTimeLabel, { color: theme.colors.textSecondary }]}>Tid för påminnelse</Text>
            <View style={styles.timeSelector}>
              {[17, 18, 19, 20, 21].map(h => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.timeOption,
                    {
                      backgroundColor: plan.dailyReminderHour === h ? '#6366F1' : theme.colors.border,
                    },
                  ]}
                  onPress={() => onUpdateSettings({ dailyReminderHour: h, dailyReminderMinute: 0 })}
                >
                  <Text style={[
                    styles.timeOptionText,
                    { color: plan.dailyReminderHour === h ? '#FFF' : theme.colors.textSecondary },
                  ]}>
                    {h}:00
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.settingsDivider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.settingsRow}>
          <View style={styles.settingsLeft}>
            <Flame size={18} color="#EF4444" />
            <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>Streak-varningar</Text>
          </View>
          <Switch
            value={plan.streakWarnings}
            onValueChange={val => onUpdateSettings({ streakWarnings: val })}
            trackColor={{ false: theme.colors.border, true: '#EF4444' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.settingsDivider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.settingsRow}>
          <View style={styles.settingsLeft}>
            <Trophy size={18} color="#F59E0B" />
            <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>Milstolpsfirande</Text>
          </View>
          <Switch
            value={plan.milestonesEnabled}
            onValueChange={val => onUpdateSettings({ milestonesEnabled: val })}
            trackColor={{ false: theme.colors.border, true: '#F59E0B' }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Plan</Text>
      <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={styles.settingsRow} onPress={onDeletePlan}>
          <View style={styles.settingsLeft}>
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>Ta bort studieplan</Text>
          </View>
          <ChevronRight size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: '#FFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  countdownBox: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  countdownLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  countdownDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
  },
  countdownMsg: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  planPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  planPillText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#6366F1',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  dateRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  dateLabelText: {
    fontSize: 13,
    flex: 1,
  },
  dayBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayProgressCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  todayProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayProgressTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  todayProgressPct: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  bigProgressBg: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bigProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 14,
  },
  taskEmojiBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBody: {
    flex: 1,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '700' as const,
    flex: 1,
    marginRight: 8,
  },
  taskDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  taskBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  taskProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '700' as const,
    minWidth: 32,
    textAlign: 'right',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 11,
    flex: 1,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 14,
    marginBottom: 20,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  streakSub: {
    fontSize: 12,
    marginTop: 2,
  },
  weekCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: 16,
    borderRadius: 18,
    marginBottom: 6,
    minHeight: 80,
  },
  weekDayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  weekBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  weekDayLabel: {
    fontSize: 11,
  },
  weekDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  weekSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  planProgressCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 8,
  },
  planProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planProgressLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  planProgressPct: {
    fontSize: 17,
    fontWeight: '800' as const,
  },
  planProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  planProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  settingsCard: {
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  settingsDivider: {
    height: 1,
    marginHorizontal: 18,
  },
  reminderTimeRow: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  reminderTimeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  selectionHeader: {
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
    paddingHorizontal: 20,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  selectionSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  daysBox: {
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  daysNumber: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#FFF',
    lineHeight: 44,
  },
  daysLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  selectionCountdownMsg: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600' as const,
    paddingHorizontal: 20,
    marginTop: 2,
  },
  selectionScroll: {
    padding: 20,
  },
  chooseDateLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  datePill: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  datePillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  choosePlanLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  planCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
    overflow: 'visible',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  planCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  planCardBody: {
    flex: 1,
  },
  planCardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  planCardSub: {
    fontSize: 12,
    marginBottom: 8,
  },
  planCardStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planStatText: {
    fontSize: 12,
  },
  planCardTasks: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  taskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskPillText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  planCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
