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
  Bell,
  Settings,
  Trophy,
  Clock,
  Trash2,
  Star,
  TrendingUp,
  BookOpen,
  PenLine,
  Calculator,
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
    ? Math.min(
        100,
        Math.round(
          (((todayOrd / ordTarget) + (todayMek / mekTarget) + (todayQuant / quantTarget)) / 3) * 100
        )
      )
    : 0;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!planConfig) return;
    Animated.parallel([
      Animated.timing(progressAnims.ord, { toValue: Math.min(todayOrd / ordTarget, 1), duration: 800, useNativeDriver: false }),
      Animated.timing(progressAnims.mek, { toValue: Math.min(todayMek / mekTarget, 1), duration: 900, useNativeDriver: false }),
      Animated.timing(progressAnims.quant, { toValue: Math.min(todayQuant / quantTarget, 1), duration: 1000, useNativeDriver: false }),
    ]).start();
  }, [todayOrd, todayMek, todayQuant, planConfig]);

  useEffect(() => {
    Animated.timing(weekAnim, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [tab]);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark
          ? [planColor + '55', planColor + '22', 'transparent']
          : [planColor + 'AA', planColor + '55', 'transparent']}
        style={styles.headerBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={[styles.circleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} onPress={() => router.back()}>
            <ChevronLeft size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Studieplan HP</Text>
            <Text style={[styles.headerSub, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>{HP_DATE_LABELS[plan.hpDateKey]}</Text>
          </View>
          <TouchableOpacity style={[styles.circleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} onPress={() => setTab('settings')}>
            <Settings size={18} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statStripItem}>
            <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{daysUntil}</Text>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>dagar kvar</Text>
          </View>
          <View style={[styles.statStripDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
          <View style={styles.statStripItem}>
            <View style={styles.streakRow}>
              <Flame size={16} color="#F97316" />
              <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{progress.streak}</Text>
            </View>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>dagars streak</Text>
          </View>
          <View style={[styles.statStripDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
          <View style={styles.statStripItem}>
            <Text style={[styles.statStripNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{currentDay}<Text style={[styles.statStripNumSub, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>/{totalDays}</Text></Text>
            <Text style={[styles.statStripLabel, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>plan dag</Text>
          </View>
        </View>

        <View style={styles.planChipRow}>
          <View style={[styles.planChip, { backgroundColor: planColor + '25', borderColor: planColor + '50', borderWidth: 1 }]}>
            <Text style={[styles.planChipText, { color: planColor }]}>{planConfig?.emoji} {planConfig?.name}</Text>
          </View>
          <Text style={[styles.countdownMsg, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)' }]}>{countdownMsg}</Text>
        </View>
      </SafeAreaView>

      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {(['today', 'progress', 'settings'] as ViewTab[]).map(t => {
          const labels: Record<ViewTab, string> = { today: 'Idag', progress: 'Progress', settings: 'Inställningar' };
          const active = tab === t;
          return (
            <TouchableOpacity key={t} style={styles.tabItem} onPress={() => setTab(t)}>
              <Text style={[styles.tabLabel, { color: active ? planColor : theme.colors.textSecondary }]}>{labels[t]}</Text>
              {active && <View style={[styles.tabUnderline, { backgroundColor: planColor }]} />}
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
            planColor={planColor}
          />
        )}
        <View style={{ height: 100 }} />
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
        colors={isDark ? ['#0F172A', '#1E293B', '#1E1B4B'] : ['#1A1A2E', '#16213E', '#0F3460']}
        style={selStyles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <TouchableOpacity style={selStyles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 24 }}>
            <Text style={selStyles.heroLabel}>Högskoleprov 2026</Text>
            <View style={selStyles.heroCountRow}>
              <Text style={[selStyles.heroBigNum, { color: urgencyColor }]}>{daysUntil}</Text>
              <View style={selStyles.heroNumRight}>
                <Text style={selStyles.heroNumLabel}>dagar</Text>
                <Text style={selStyles.heroNumLabel}>kvar</Text>
              </View>
            </View>
            <View style={[selStyles.msgPill, { backgroundColor: urgencyColor + '25', borderColor: urgencyColor + '50', borderWidth: 1 }]}>
              <Text style={[selStyles.msgPillText, { color: urgencyColor }]}>{countdownMsg}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={selStyles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[selStyles.sectionLabel, { color: theme.colors.text }]}>Välj provtillfälle</Text>
        <View style={selStyles.dateRow}>
          {(['spring2026', 'fall2026'] as HPDateKey[]).map(key => {
            const active = selectedDate === key;
            return (
              <TouchableOpacity
                key={key}
                style={[selStyles.datePill, { backgroundColor: active ? '#6366F1' : theme.colors.surface, borderColor: active ? '#6366F1' : theme.colors.border }]}
                onPress={() => setSelectedDate(key)}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{key === 'spring2026' ? '🌸' : '🍂'}</Text>
                <Text style={[selStyles.datePillTitle, { color: active ? '#FFF' : theme.colors.text }]}>
                  {key === 'spring2026' ? 'Vår 2026' : 'Höst 2026'}
                </Text>
                <Text style={[selStyles.datePillSub, { color: active ? 'rgba(255,255,255,0.75)' : theme.colors.textSecondary }]}>
                  {key === 'spring2026' ? '18 april' : '18 oktober'}
                </Text>
              </TouchableOpacity>
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 16 }}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, speed: 25 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 25 }).start()}
        activeOpacity={1}
      >
        <View style={[pcStyles.wrapper, isSuggested && { shadowColor: config.color, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 }]}>
          <LinearGradient
            colors={[config.gradientColors[0], config.gradientColors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={pcStyles.top}
          >
            {isSuggested && (
              <View style={pcStyles.recBadge}>
                <Star size={9} color="#FFF" fill="#FFF" />
                <Text style={pcStyles.recText}>Rekommenderad för dig</Text>
              </View>
            )}
            <View style={pcStyles.topRow}>
              <View style={pcStyles.emojiWrap}>
                <Text style={{ fontSize: 38 }}>{config.emoji}</Text>
              </View>
              <View style={pcStyles.topInfo}>
                <Text style={pcStyles.planName}>{config.name}</Text>
                <Text style={pcStyles.planSub}>{config.subtitle}</Text>
              </View>
              <View style={pcStyles.arrowCircle}>
                <ChevronRight size={18} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>

          <View style={[pcStyles.bottom, { backgroundColor: isDark ? '#1E293B' : '#FAFAFA' }]}>
            <View style={pcStyles.pillRow}>
              <TaskChip emoji="📖" label={`${config.wordsPerDay} ORD`} color={config.color} />
              <TaskChip emoji="✍️" label={`${config.mekPerDay} MEK`} color={config.color} />
              <TaskChip emoji="🔢" label={`${config.quantPerDay} KVA`} color={config.color} />
            </View>
            <View style={pcStyles.metaRow}>
              <View style={pcStyles.metaItem}>
                <Clock size={12} color={theme.colors.textSecondary} />
                <Text style={[pcStyles.metaText, { color: theme.colors.textSecondary }]}>{config.minutesPerDay}</Text>
              </View>
              <View style={[pcStyles.goalBadge, { backgroundColor: config.color + '18' }]}>
                <TrendingUp size={11} color={config.color} />
                <Text style={[pcStyles.goalText, { color: config.color }]}>{config.goalIncrease}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TaskChip({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <View style={[chipStyles.wrap, { backgroundColor: color + '18' }]}>
      <Text style={{ fontSize: 11 }}>{emoji}</Text>
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

function TodayView({
  planConfig, todayOrd, todayMek, todayQuant, ordTarget, mekTarget, quantTarget,
  todayPct, progressAnims, onCheckTask, theme, isDark, currentDay, totalDays,
}: {
  planConfig: PlanConfig; todayOrd: number; todayMek: number; todayQuant: number;
  ordTarget: number; mekTarget: number; quantTarget: number;
  todayPct: number; progressAnims: { ord: Animated.Value; mek: Animated.Value; quant: Animated.Value };
  onCheckTask: (type: 'ord' | 'mek' | 'quant') => void;
  theme: any; isDark: boolean; currentDay: number; totalDays: number;
}) {
  const now = new Date();
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const allDone = todayPct >= 100;

  const tasks = [
    {
      type: 'ord' as const,
      icon: <BookOpen size={20} color="#10B981" />,
      emoji: '📖',
      label: 'Ordkunskap',
      code: 'ORD',
      desc: `Lär dig ${ordTarget} nya ord idag`,
      completed: todayOrd,
      target: ordTarget,
      color: '#10B981',
      animVal: progressAnims.ord,
      duration: 10,
    },
    {
      type: 'mek' as const,
      icon: <PenLine size={20} color="#6366F1" />,
      emoji: '✍️',
      label: 'Meningskomplettering',
      code: 'MEK',
      desc: `${mekTarget} meningskompletteringar`,
      completed: todayMek,
      target: mekTarget,
      color: '#6366F1',
      animVal: progressAnims.mek,
      duration: 15,
    },
    {
      type: 'quant' as const,
      icon: <Calculator size={20} color="#F97316" />,
      emoji: '🔢',
      label: 'Kvantitativt',
      code: 'KVA',
      desc: `${quantTarget} kvantitativa uppgifter`,
      completed: todayQuant,
      target: quantTarget,
      color: '#F97316',
      animVal: progressAnims.quant,
      duration: 10,
    },
  ];

  return (
    <View>
      <View style={todayStyles.dateRow}>
        <View style={todayStyles.dateLeft}>
          <Calendar size={13} color={theme.colors.textSecondary} />
          <Text style={[todayStyles.dateText, { color: theme.colors.textSecondary }]}>{dayLabel}</Text>
        </View>
        <View style={[todayStyles.dayBadge, { backgroundColor: planConfig.color + '18' }]}>
          <Text style={[todayStyles.dayBadgeText, { color: planConfig.color }]}>Dag {currentDay} / {totalDays}</Text>
        </View>
      </View>

      <View style={[todayStyles.overallCard, {
        backgroundColor: allDone
          ? isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)'
          : theme.colors.surface,
        borderColor: allDone ? '#10B981' : theme.colors.border,
      }]}>
        <View style={todayStyles.overallTop}>
          <View>
            <Text style={[todayStyles.overallTitle, { color: theme.colors.text }]}>
              {allDone ? '🎉 Allt klart idag!' : 'Dagens framsteg'}
            </Text>
            <Text style={[todayStyles.overallSub, { color: theme.colors.textSecondary }]}>
              {allDone ? 'Fantastiskt jobbat – streaken håller!' : `${todayPct}% slutfört`}
            </Text>
          </View>
          <View style={[todayStyles.pctCircle, { backgroundColor: allDone ? '#10B981' : planConfig.color }]}>
            <Text style={todayStyles.pctText}>{todayPct}%</Text>
          </View>
        </View>
        <View style={[todayStyles.overallBarBg, { backgroundColor: theme.colors.border }]}>
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
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Dagens uppgifter</Text>

      {tasks.map(task => {
        const done = task.completed >= task.target;
        return (
          <TouchableOpacity
            key={task.type}
            onPress={() => onCheckTask(task.type)}
            activeOpacity={0.75}
          >
            <View style={[taskStyles.card, {
              backgroundColor: theme.colors.surface,
              borderColor: done ? task.color + '60' : theme.colors.border,
              borderWidth: done ? 1.5 : 1,
              opacity: done ? 1 : 1,
            }]}>
              <LinearGradient
                colors={[task.color + '22', task.color + '08']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[taskStyles.iconArea]}
              >
                <Text style={{ fontSize: 26 }}>{task.emoji}</Text>
                <View style={[taskStyles.codeChip, { backgroundColor: task.color + '25' }]}>
                  <Text style={[taskStyles.codeText, { color: task.color }]}>{task.code}</Text>
                </View>
              </LinearGradient>

              <View style={taskStyles.body}>
                <View style={taskStyles.topRow}>
                  <Text style={[taskStyles.name, { color: theme.colors.text }]}>{task.label}</Text>
                  {done
                    ? <CheckCircle2 size={22} color={task.color} fill={task.color} />
                    : (
                      <View style={[taskStyles.countBadge, { backgroundColor: task.color + '18' }]}>
                        <Text style={[taskStyles.countText, { color: task.color }]}>{task.completed}/{task.target}</Text>
                      </View>
                    )}
                </View>
                <Text style={[taskStyles.desc, { color: theme.colors.textSecondary }]}>{task.desc}</Text>

                <View style={taskStyles.barRow}>
                  <View style={[taskStyles.barBg, { backgroundColor: theme.colors.border }]}>
                    <Animated.View style={[taskStyles.barFill, {
                      width: task.animVal.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      backgroundColor: done ? task.color : task.color,
                    }]} />
                  </View>
                </View>

                <View style={taskStyles.metaRow}>
                  <Clock size={11} color={theme.colors.textSecondary} />
                  <Text style={[taskStyles.metaText, { color: theme.colors.textSecondary }]}>~{task.duration} min</Text>
                  {!done && (
                    <Text style={[taskStyles.tapHint, { color: task.color }]}>• Tryck för att markera</Text>
                  )}
                  {done && (
                    <Text style={[taskStyles.tapHint, { color: task.color }]}>• Klart! 🎉</Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
  const completedDays = weekStats.filter(d => d.fullyCompleted).length;
  const planProgress = Math.min(currentDay / totalDays, 1);

  const maxMinutes = Math.max(...weekStats.map(d => d.minutesSpent), 1);

  return (
    <View>
      <View style={progStyles.statsGrid}>
        <StatCard label="Ord inlärda" value={progress.totalWordsLearned} emoji="📖" color="#10B981" theme={theme} isDark={isDark} />
        <StatCard label="MEK gjorda" value={progress.totalMekCompleted} emoji="✍️" color="#6366F1" theme={theme} isDark={isDark} />
        <StatCard label="KVA lösta" value={progress.totalQuantCompleted} emoji="🔢" color="#F97316" theme={theme} isDark={isDark} />
      </View>

      <View style={[progStyles.streakCard, {
        backgroundColor: isDark ? '#1E293B' : '#FFF',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
      }]}>
        <LinearGradient
          colors={['rgba(239,68,68,0.12)', 'rgba(249,115,22,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={progStyles.streakGradient}
        >
          <View style={progStyles.streakLeft}>
            <View style={[progStyles.streakIconBg, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Flame size={26} color="#EF4444" />
            </View>
            <View>
              <Text style={[progStyles.streakNum, { color: theme.colors.text }]}>{progress.streak} dagars streak</Text>
              <Text style={[progStyles.streakSub, { color: theme.colors.textSecondary }]}>
                Längst: {progress.longestStreak} dagar · {progress.totalMinutes} min totalt
              </Text>
            </View>
          </View>
          <Trophy size={22} color="#F59E0B" />
        </LinearGradient>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Veckans aktivitet</Text>
      <View style={[progStyles.weekCard, { backgroundColor: theme.colors.surface }]}>
        {weekStats.map((day) => {
          const todayMark = isToday(day.date);
          const barH = day.minutesSpent > 0 ? Math.max(8, (day.minutesSpent / maxMinutes) * 56) : 4;
          return (
            <View key={day.date} style={progStyles.weekCol}>
              {day.fullyCompleted && (
                <View style={[progStyles.weekCheckDot, { backgroundColor: planConfig.color }]} />
              )}
              <Animated.View
                style={[progStyles.weekBar, {
                  height: weekAnim.interpolate({ inputRange: [0, 1], outputRange: [2, barH] }),
                  backgroundColor: day.fullyCompleted ? planConfig.color : day.minutesSpent > 0 ? planConfig.color + '55' : theme.colors.border,
                  borderRadius: 5,
                }]}
              />
              <Text style={[progStyles.weekLabel, {
                color: todayMark ? planConfig.color : theme.colors.textSecondary,
                fontWeight: todayMark ? '700' : '400',
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

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Planens framsteg</Text>
      <View style={[progStyles.planCard, { backgroundColor: theme.colors.surface }]}>
        <View style={progStyles.planHeader}>
          <Text style={[progStyles.planDayText, { color: theme.colors.text }]}>Dag {currentDay} av {totalDays}</Text>
          <Text style={[progStyles.planPct, { color: planConfig.color }]}>{Math.round(planProgress * 100)}%</Text>
        </View>
        <View style={[progStyles.planBarBg, { backgroundColor: theme.colors.border }]}>
          <View style={[progStyles.planBarFill, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color }]} />
          <View style={[progStyles.planBarGlow, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color + '40' }]} />
        </View>
        <Text style={[progStyles.planNote, { color: theme.colors.textSecondary }]}>
          {totalDays - currentDay} dagar kvar på planen
        </Text>
      </View>
    </View>
  );
}

function StatCard({ label, value, emoji, color, theme, isDark }: {
  label: string; value: number; emoji: string; color: string; theme: any; isDark: boolean;
}) {
  return (
    <View style={[scStyles.card, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[color + '20', color + '08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={scStyles.gradient}
      >
        <Text style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</Text>
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
      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Notifikationer</Text>
      <View style={[setStyles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#6366F120' }]}>
              <Bell size={16} color="#6366F1" />
            </View>
            <View>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Daglig påminnelse</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Påminnelse varje dag</Text>
            </View>
          </View>
          <Switch
            value={plan.notificationsEnabled}
            onValueChange={val => onUpdateSettings({ notificationsEnabled: val })}
            trackColor={{ false: theme.colors.border, true: planColor }}
            thumbColor="#FFF"
          />
        </View>

        {plan.notificationsEnabled && (
          <View style={setStyles.timePicker}>
            <Text style={[setStyles.timeLabel, { color: theme.colors.textSecondary }]}>Välj tid</Text>
            <View style={setStyles.timeRow}>
              {[16, 17, 18, 19, 20, 21].map(h => (
                <TouchableOpacity
                  key={h}
                  style={[setStyles.timeBtn, { backgroundColor: plan.dailyReminderHour === h ? planColor : theme.colors.border }]}
                  onPress={() => onUpdateSettings({ dailyReminderHour: h, dailyReminderMinute: 0 })}
                >
                  <Text style={[setStyles.timeBtnText, { color: plan.dailyReminderHour === h ? '#FFF' : theme.colors.textSecondary }]}>{h}:00</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[setStyles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#EF444420' }]}>
              <Flame size={16} color="#EF4444" />
            </View>
            <View>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Streak-varningar</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Varning vid risk för att tappa streak</Text>
            </View>
          </View>
          <Switch
            value={plan.streakWarnings}
            onValueChange={val => onUpdateSettings({ streakWarnings: val })}
            trackColor={{ false: theme.colors.border, true: '#EF4444' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[setStyles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={setStyles.row}>
          <View style={setStyles.rowLeft}>
            <View style={[setStyles.iconBg, { backgroundColor: '#F59E0B20' }]}>
              <Trophy size={16} color="#F59E0B" />
            </View>
            <View>
              <Text style={[setStyles.rowLabel, { color: theme.colors.text }]}>Milstolpar</Text>
              <Text style={[setStyles.rowSub, { color: theme.colors.textSecondary }]}>Fira när du når mål</Text>
            </View>
          </View>
          <Switch
            value={plan.milestonesEnabled}
            onValueChange={val => onUpdateSettings({ milestonesEnabled: val })}
            trackColor={{ false: theme.colors.border, true: '#F59E0B' }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Hantera plan</Text>
      <TouchableOpacity
        style={[setStyles.dangerBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)' }]}
        onPress={onDeletePlan}
      >
        <Trash2 size={18} color="#EF4444" />
        <Text style={setStyles.dangerText}>Ta bort studieplan</Text>
      </TouchableOpacity>
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
    height: 260,
  },
  headerSafe: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 20,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  statStripItem: {
    alignItems: 'center',
  },
  statStripNum: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statStripNumSub: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  statStripLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statStripDivider: {
    width: 1,
    height: 36,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  planChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 6,
  },
  planChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
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
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
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
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
    marginTop: 6,
    letterSpacing: -0.3,
  },
});

const selStyles = StyleSheet.create({
  hero: {
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  heroCountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 14,
  },
  heroBigNum: {
    fontSize: 72,
    fontWeight: '900' as const,
    lineHeight: 76,
    letterSpacing: -3,
  },
  heroNumRight: {
    marginBottom: 8,
  },
  heroNumLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  msgPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  msgPillText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  datePill: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
  },
  datePillTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  datePillSub: {
    fontSize: 12,
  },
});

const pcStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  top: {
    padding: 20,
    paddingBottom: 16,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 14,
  },
  recText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  planSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    padding: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
});

const chipStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
});

const todayStyles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  overallCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  overallTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  overallSub: {
    fontSize: 12,
    marginTop: 2,
  },
  pctCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pctText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  overallBarBg: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  overallBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

const taskStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconArea: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  codeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700' as const,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  barRow: {
    marginBottom: 6,
  },
  barBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
});

const progStyles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  streakCard: {
    borderRadius: 20,
    marginBottom: 22,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  streakIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNum: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
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
    paddingBottom: 12,
    borderRadius: 20,
    marginBottom: 6,
    minHeight: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  weekCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  weekBar: {
    width: 22,
    minHeight: 4,
    borderRadius: 5,
  },
  weekCheckDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  weekTodayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  weekNote: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 22,
  },
  planCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planDayText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  planPct: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  planBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  planBarFill: {
    height: '100%',
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  planBarGlow: {
    height: '100%',
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  planNote: {
    fontSize: 12,
  },
});

const scStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  gradient: {
    padding: 14,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  val: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  lbl: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});

const setStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  rowSub: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  timePicker: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  timeBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
