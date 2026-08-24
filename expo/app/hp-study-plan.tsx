import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  Flame,
  CheckCircle2,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  Sparkles,
  Crown,
  Zap,
  BookOpen,
  Lock,
  Calculator,
  Play,
  Settings,
  Trash2,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import {
  useHPStudyPlan,
  PLAN_CONFIGS,
  HP_DATE_LABELS,
  PlanConfig,
  HPDateKey,
  HPPlanType,
} from '@/contexts/HPStudyPlanContext';
import { ROUTES } from '@/utils/typedRoutes';
import { COLORS } from '@/constants/design-system';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ════════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════════

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function ScaleOnPress({ onPress, style, children, scaleTo = 0.97 }: {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  scaleTo?: number;
}) {
  const anim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(anim, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 2 }).start()
        }
        onPressOut={() =>
          Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start()
        }
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM UPSELL — Free users
// ════════════════════════════════════════════════════════════════════════════════

function PremiumUpsellView({ theme, isDark, daysUntil }: { theme: any; isDark: boolean; daysUntil: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Preview rows mirroring the real Premium plan's daily tasks (BALANSERAD intensity)
  const dailyTasks = [
    { icon: BookOpen, color: '#6366F1', title: 'Lär dig 30 nya ord', tag: 'Ordträning' },
    { icon: Zap, color: '#EC4899', title: 'Öva menackomplettering', tag: 'Delprov' },
    { icon: Calculator, color: '#10B981', title: 'Lös matematikuppgifter', tag: 'Delprov' },
  ];

  const benefits = [
    'Välj intensitet — Lugn, Balanserad eller Intensiv',
    'Följ streak, statistik och daglig progress',
    'Smarta påminnelser så du håller takten',
  ];

  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']}>
        <View style={upStyles.navRow}>
          <TouchableOpacity
            style={upStyles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Gå tillbaka"
            accessibilityRole="button"
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={upStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={upStyles.headerRow}>
            <View style={upStyles.headerIcon}>
              <Calendar size={22} color="#6366F1" />
            </View>
            <View style={upStyles.headerText}>
              <Text style={[upStyles.overline, { color: theme.colors.textSecondary }]}>
                HÖGSKOLEPROVET · STUDIEPLAN
              </Text>
              <Text style={[upStyles.title, { color: theme.colors.text }]} numberOfLines={2}>
                Din personliga studieplan
              </Text>
            </View>
          </View>
          <Text style={[upStyles.subtitle, { color: theme.colors.textSecondary }]}>
            Få en strukturerad plan anpassad efter dina kurser, mål och prov.
          </Text>

          {/* Countdown — real days until the exam */}
          <View style={upStyles.countdownCard}>
            <View style={upStyles.countdownLeft}>
              <Text style={upStyles.countdownNum}>{daysUntil}</Text>
              <Text style={upStyles.countdownUnit}>dagar kvar</Text>
            </View>
            <View style={upStyles.countdownDiv} />
            <View style={upStyles.countdownRight}>
              <Calendar size={20} color="rgba(255,255,255,0.6)" />
              <View>
                <Text style={upStyles.countdownLabel}>Höst 2026</Text>
                <Text style={upStyles.countdownDate}>18 oktober</Text>
              </View>
            </View>
          </View>

          {/* Locked daily tasks preview */}
          <View style={upStyles.sectionHeader}>
            <Text style={[upStyles.sectionLabel, { color: theme.colors.textSecondary }]}>DAGENS MÅL</Text>
            <View style={upStyles.lockChip}>
              <Lock size={12} color="#6366F1" />
              <Text style={upStyles.lockChipText}>Låst</Text>
            </View>
          </View>
          <View style={upStyles.taskList}>
            {dailyTasks.map((task, i) => (
              <View
                key={i}
                style={[upStyles.taskRow, { backgroundColor: theme.colors.surface, borderColor: cardBorder }]}
              >
                <View style={[upStyles.taskIcon, { backgroundColor: task.color + '15' }]}>
                  <task.icon size={20} color={task.color} />
                </View>
                <View style={upStyles.taskBody}>
                  <Text style={[upStyles.taskTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={[upStyles.taskTag, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {task.tag}
                  </Text>
                </View>
                <View style={[upStyles.taskLock, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                  <Lock size={14} color={theme.colors.textSecondary} />
                </View>
              </View>
            ))}
          </View>

          {/* Locked progress preview */}
          <View style={[upStyles.progressStrip, { backgroundColor: theme.colors.surface, borderColor: cardBorder }]}>
            <Flame size={20} color="#F97316" />
            <View style={upStyles.progressBody}>
              <View style={upStyles.progressRow}>
                <Text style={[upStyles.progressTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  Dag 14 · 12 dagars streak
                </Text>
                <Lock size={13} color={theme.colors.textSecondary} />
              </View>
              <View style={[upStyles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={upStyles.progressFill} />
              </View>
            </View>
          </View>

          {/* Conversion */}
          <View style={[upStyles.conversionCard, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
            <View style={upStyles.conversionHeader}>
              <Crown size={18} color="#6366F1" />
              <Text style={[upStyles.conversionTitle, { color: theme.colors.text }]}>Lås upp Premium</Text>
            </View>
            <View style={upStyles.benefitList}>
              {benefits.map((benefit, i) => (
                <View key={i} style={upStyles.benefitRow}>
                  <CheckCircle2 size={16} color="#6366F1" />
                  <Text style={[upStyles.benefitText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
            <ScaleOnPress onPress={() => router.push(ROUTES.premium)} style={upStyles.ctaWrap} scaleTo={0.96}>
              <View style={upStyles.cta}>
                <Crown size={18} color="#FFF" />
                <Text style={upStyles.ctaText}>Lås upp Premium</Text>
                <ArrowRight size={18} color="#FFF" />
              </View>
            </ScaleOnPress>
            <Text style={[upStyles.trustText, { color: theme.colors.textSecondary }]}>
              Ingår i Premium · Ingen bindningstid
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PLAN SELECTION — Premium users without a plan
// ════════════════════════════════════════════════════════════════════════════════

function PlanSelectionView({
  daysUntil,
  countdownMsg,
  suggestedPlan,
  onSelectPlan,
  theme,
  isDark,
}: {
  daysUntil: number;
  countdownMsg: string;
  suggestedPlan: HPPlanType;
  onSelectPlan: (type: HPPlanType) => void;
  theme: any;
  isDark: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const urgencyColor = daysUntil >= 60 ? '#10B981' : daysUntil >= 30 ? '#F97316' : '#EF4444';

  useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 2 }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={selStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          <View style={selStyles.navRow}>
            <TouchableOpacity
              style={selStyles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityLabel="Gå tillbaka"
              accessibilityRole="button"
            >
              <ChevronLeft size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Title area */}
          <View style={selStyles.titleArea}>
            <Text style={selStyles.overline}>HÖGSKOLEPROVET 2026</Text>
            <Text style={selStyles.mainTitle}>Skapa din studieplan</Text>
            <Text style={selStyles.mainSub}>
              Välj intensitet och få ett dagligt schema fram till provdagen
            </Text>
          </View>

          {/* Countdown card */}
          <View style={selStyles.countdownCard}>
            <View style={selStyles.countdownInner}>
              <View style={selStyles.countdownLeft}>
                <Text style={[selStyles.countdownNum, { color: urgencyColor }]}>{daysUntil}</Text>
                <Text style={selStyles.countdownUnit}>dagar kvar</Text>
              </View>
              <View style={selStyles.countdownRight}>
                <Calendar size={36} color="rgba(255,255,255,0.6)" />
                <Text style={selStyles.countdownLabel}>Höst 2026</Text>
                <Text style={selStyles.countdownDate}>18 oktober</Text>
              </View>
            </View>
            <View style={[selStyles.countdownMsg, { backgroundColor: urgencyColor + '15' }]}>
              <Text style={[selStyles.countdownMsgText, { color: urgencyColor }]}>{countdownMsg}</Text>
            </View>
          </View>

          {/* Plan cards */}
          <Text style={selStyles.sectionLabel}>Välj intensitetsnivå</Text>

          {PLAN_CONFIGS.map((config) => {
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
        </Animated.View>
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isSuggested) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.015, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isSuggested, pulseAnim]);

  return (
    <ScaleOnPress onPress={onSelect} scaleTo={0.978}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={[pcStyles.card, isSuggested && pcStyles.cardSuggested]}>
          {/* Gradient top */}
          <LinearGradient
            colors={config.gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={pcStyles.cardTop}
          >
            {isSuggested && (
              <View style={pcStyles.recBadge}>
                <Sparkles size={12} color="#FFF" />
                <Text style={pcStyles.recText}>Rekommenderas</Text>
              </View>
            )}

            <View style={pcStyles.cardTopRow}>
              <View style={pcStyles.emojiBox}>
                <Text style={pcStyles.emoji}>{config.emoji}</Text>
              </View>
              <View style={pcStyles.cardTopInfo}>
                <Text style={pcStyles.cardName}>{config.name}</Text>
                <Text style={pcStyles.cardSub}>{config.subtitle}</Text>
              </View>
              <View style={pcStyles.arrowWrap}>
                <ArrowRight size={18} color="#FFF" />
              </View>
            </View>
          </LinearGradient>

          {/* Info bottom */}
          <View style={[pcStyles.cardBottom, { backgroundColor: isDark ? '#1E293B' : '#FAFBFF' }]}>
            {/* Daily stats */}
            <View style={pcStyles.pillRow}>
              <View style={[pcStyles.pill, { backgroundColor: config.color + '14' }]}>
                <Text style={pcStyles.pillEmoji}>📖</Text>
                <Text style={[pcStyles.pillLabel, { color: config.color }]}>{config.wordsPerDay} ORD</Text>
              </View>
              <View style={[pcStyles.pill, { backgroundColor: config.color + '14' }]}>
                <Text style={pcStyles.pillEmoji}>✍️</Text>
                <Text style={[pcStyles.pillLabel, { color: config.color }]}>{config.mekPerDay} MEK</Text>
              </View>
              <View style={[pcStyles.pill, { backgroundColor: config.color + '14' }]}>
                <Text style={pcStyles.pillEmoji}>🔢</Text>
                <Text style={[pcStyles.pillLabel, { color: config.color }]}>{config.quantPerDay} KVA</Text>
              </View>
            </View>

            {/* Meta row */}
            <View style={pcStyles.metaRow}>
              <View style={pcStyles.metaItem}>
                <Clock size={14} color={theme.colors.textSecondary} />
                <Text style={[pcStyles.metaText, { color: theme.colors.textSecondary }]}>
                  {config.minutesPerDay}
                </Text>
              </View>
              <View style={[pcStyles.goalBadge, { backgroundColor: config.color + '15' }]}>
                <TrendingUp size={13} color={config.color} />
                <Text style={[pcStyles.goalText, { color: config.color }]}>{config.goalIncrease}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScaleOnPress>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ACTIVE PLAN VIEW — Premium users with an active plan
// ════════════════════════════════════════════════════════════════════════════════

type PlanTab = 'today' | 'progress';

function ActivePlanView({
  plan,
  planConfig,
  progress,
  daysUntil,
  countdownMsg,
  currentDay,
  totalDays,
  todayOrd,
  todayMek,
  todayQuant,
  ordTarget,
  mekTarget,
  quantTarget,
  todayPct,
  onCheckTask,
  onMarkAllDone,
  onUpdateSettings,
  onDeletePlan,
  weekStats,
  theme,
  isDark,
}: {
  plan: any;
  planConfig: PlanConfig;
  progress: any;
  daysUntil: number;
  countdownMsg: string;
  currentDay: number;
  totalDays: number;
  todayOrd: number;
  todayMek: number;
  todayQuant: number;
  ordTarget: number;
  mekTarget: number;
  quantTarget: number;
  todayPct: number;
  onCheckTask: (type: 'ord' | 'mek' | 'quant') => void;
  onMarkAllDone: () => void;
  onUpdateSettings: (updates: any) => void;
  onDeletePlan: () => void;
  weekStats: any[];
  theme: any;
  isDark: boolean;
}) {
  const [tab, setTab] = useState<PlanTab>('today');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.spring(tabAnim, {
      toValue: tab === 'today' ? 0 : 1,
      useNativeDriver: false,
      speed: 14,
      bounciness: 2,
    }).start();
  }, [tab, tabAnim]);

  const now = new Date();
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const allDone = todayPct >= 100;
  const tabWidth = (SCREEN_WIDTH - 40 - 8) / 2;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient header background */}
      <LinearGradient
        colors={isDark
          ? [planConfig.color + '33', planConfig.color + '0D', 'transparent']
          : [planConfig.color + '55', planConfig.color + '1A', 'transparent']}
        style={apStyles.headerBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView edges={['top']}>
        {/* Nav row */}
        <View style={apStyles.navRow}>
          <TouchableOpacity
            style={apStyles.navBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Gå tillbaka"
            accessibilityRole="button"
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={apStyles.navCenter}>
            <Text style={[apStyles.navTitle, { color: theme.colors.text }]}>Studieplan</Text>
            <Text style={apStyles.navSub}>
              {planConfig.emoji} {planConfig.name}
            </Text>
          </View>

          <TouchableOpacity
            style={apStyles.navBtn}
            onPress={() => {
              Alert.alert('Studieplan', 'Vad vill du göra?', [
                { text: 'Avbryt', style: 'cancel' },
                {
                  text: 'Ta bort plan',
                  style: 'destructive',
                  onPress: onDeletePlan,
                },
                {
                  text: 'Notiser',
                  onPress: () => {
                    Alert.alert(
                      'Påminnelser',
                      `Daglig påminnelse: ${plan.dailyReminderHour}:00`,
                      [
                        { text: 'Stäng', style: 'cancel' },
                        {
                          text: plan.notificationsEnabled ? 'Stäng av' : 'Sätt på',
                          onPress: () => onUpdateSettings({ notificationsEnabled: !plan.notificationsEnabled }),
                        },
                      ],
                    );
                  },
                },
              ]);
            }}
            activeOpacity={0.7}
            accessibilityLabel="Inställningar"
            accessibilityRole="button"
          >
            <Settings size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={apStyles.statsRow}>
          <View style={apStyles.statItem}>
            <Text style={[apStyles.statNum, { color: theme.colors.text }]}>{daysUntil}</Text>
            <Text style={apStyles.statLabel}>dagar kvar</Text>
          </View>
          <View style={apStyles.statDiv} />
          <View style={apStyles.statItem}>
            <View style={apStyles.statInline}>
              <Flame size={18} color="#F97316" />
              <Text style={[apStyles.statNum, { color: theme.colors.text }]}>{progress.streak}</Text>
            </View>
            <Text style={apStyles.statLabel}>streak</Text>
          </View>
          <View style={apStyles.statDiv} />
          <View style={apStyles.statItem}>
            <Text style={[apStyles.statNum, { color: theme.colors.text }]}>
              {currentDay}
              <Text style={apStyles.statNumFaded}>/{totalDays}</Text>
            </Text>
            <Text style={apStyles.statLabel}>plan dag</Text>
          </View>
        </View>

        {/* Countdown message */}
        <View style={[apStyles.msgPill, { backgroundColor: planConfig.color + '15' }]}>
          <Text style={[apStyles.msgText, { color: planConfig.color }]}>{countdownMsg}</Text>
        </View>
      </SafeAreaView>

      {/* Tab bar */}
      <View style={[apStyles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <Animated.View
          style={[
            apStyles.tabIndicator,
            {
              backgroundColor: planConfig.color,
              width: tabWidth - 24,
              transform: [{
                translateX: tabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20 + 12, 20 + 12 + tabWidth],
                }),
              }],
            },
          ]}
        />
        <Pressable
          style={apStyles.tab}
          onPress={() => setTab('today')}
          accessibilityLabel="Dagens uppgifter"
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'today' }}
        >
          <Text style={[apStyles.tabLabel, {
            color: tab === 'today' ? planConfig.color : theme.colors.textSecondary,
            fontWeight: tab === 'today' ? '700' as const : '500' as const,
          }]}>
            Idag
          </Text>
        </Pressable>
        <Pressable
          style={apStyles.tab}
          onPress={() => setTab('progress')}
          accessibilityLabel="Progress"
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'progress' }}
        >
          <Text style={[apStyles.tabLabel, {
            color: tab === 'progress' ? planConfig.color : theme.colors.textSecondary,
            fontWeight: tab === 'progress' ? '700' as const : '500' as const,
          }]}>
            Progress
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={apStyles.contentScroll}
        contentContainerStyle={apStyles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {tab === 'today' && (
            <TodayTab
              planConfig={planConfig}
              dayLabel={dayLabel}
              currentDay={currentDay}
              totalDays={totalDays}
              allDone={allDone}
              todayPct={todayPct}
              todayOrd={todayOrd}
              todayMek={todayMek}
              todayQuant={todayQuant}
              ordTarget={ordTarget}
              mekTarget={mekTarget}
              quantTarget={quantTarget}
              onCheckTask={onCheckTask}
              onMarkAllDone={onMarkAllDone}
              theme={theme}
              isDark={isDark}
            />
          )}
          {tab === 'progress' && (
            <ProgressTab
              progress={progress}
              planConfig={planConfig}
              weekStats={weekStats}
              currentDay={currentDay}
              totalDays={totalDays}
              theme={theme}
              isDark={isDark}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Today Tab ─────────────────────────────────────────────────────────────────

function TodayTab({
  planConfig,
  dayLabel,
  currentDay,
  totalDays,
  allDone,
  todayPct,
  todayOrd,
  todayMek,
  todayQuant,
  ordTarget,
  mekTarget,
  quantTarget,
  onCheckTask,
  onMarkAllDone,
  theme,
  isDark,
}: {
  planConfig: PlanConfig;
  dayLabel: string;
  currentDay: number;
  totalDays: number;
  allDone: boolean;
  todayPct: number;
  todayOrd: number;
  todayMek: number;
  todayQuant: number;
  ordTarget: number;
  mekTarget: number;
  quantTarget: number;
  onCheckTask: (type: 'ord' | 'mek' | 'quant') => void;
  onMarkAllDone: () => void;
  theme: any;
  isDark: boolean;
}) {
  const tasks = [
    {
      type: 'ord' as const,
      emoji: '📖',
      label: 'Ordkunskap',
      code: 'ORD',
      desc: ordTarget > 0 ? `${ordTarget} nya ord idag` : 'Inga ord idag',
      completed: todayOrd,
      target: ordTarget,
      color: '#10B981',
      sectionCode: 'ORD',
    },
    {
      type: 'mek' as const,
      emoji: '✍️',
      label: 'Meningskomplettering',
      code: 'MEK',
      desc: mekTarget > 0 ? `${mekTarget} meningskompletteringar` : 'Inga MEK idag',
      completed: todayMek,
      target: mekTarget,
      color: '#6366F1',
      sectionCode: 'MEK',
    },
    {
      type: 'quant' as const,
      emoji: '🔢',
      label: 'Kvantitativt',
      code: 'KVA',
      desc: quantTarget > 0 ? `${quantTarget} kvantitativa uppgifter` : 'Inga kvantitativa idag',
      completed: todayQuant,
      target: quantTarget,
      color: '#F97316',
      sectionCode: 'KVA',
    },
  ];

  return (
    <View>
      {/* Date + day badge */}
      <View style={tStyles.headerRow}>
        <View style={tStyles.headerLeft}>
          <Calendar size={15} color={theme.colors.textSecondary} />
          <Text style={[tStyles.dateText, { color: theme.colors.textSecondary }]}>{dayLabel}</Text>
        </View>
        <View style={[tStyles.dayBadge, { backgroundColor: planConfig.color + '15' }]}>
          <Text style={[tStyles.dayBadgeText, { color: planConfig.color }]}>
            Dag {currentDay} av {totalDays}
          </Text>
        </View>
      </View>

      {/* Overall progress */}
      <View style={[tStyles.overallCard, {
        backgroundColor: allDone
          ? isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)'
          : theme.colors.surface,
        borderColor: allDone ? '#10B98140' : theme.colors.border,
      }]}>
        {allDone ? (
          <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={tStyles.celebration}>
            <Text style={tStyles.celebEmoji}>🎉</Text>
            <View style={tStyles.celebBody}>
              <Text style={tStyles.celebTitle}>Allt klart idag!</Text>
              <Text style={tStyles.celebSub}>Fantastiskt jobbat – streaken håller!</Text>
            </View>
            <Sparkles size={22} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        ) : (
          <>
            <View style={tStyles.overallTop}>
              <View style={tStyles.overallTopLeft}>
                <Text style={[tStyles.overallTitle, { color: theme.colors.text }]}>Dagens framsteg</Text>
                <Text style={[tStyles.overallSub, { color: theme.colors.textSecondary }]}>{todayPct}% slutfört</Text>
              </View>
              <View style={[tStyles.pctCircle, { backgroundColor: planConfig.color }]}>
                <Text style={tStyles.pctText}>{todayPct}%</Text>
              </View>
            </View>

            {/* Segmented progress bar */}
            <View style={tStyles.barRow}>
              <View style={[tStyles.barBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' }]}>
                <View style={[tStyles.barSeg, {
                  width: `${ordTarget > 0 ? Math.min((todayOrd / ordTarget) * 33.3, 33.3) : 0}%`,
                  backgroundColor: '#10B981',
                }]} />
                <View style={[tStyles.barSeg, {
                  width: `${mekTarget > 0 ? Math.min((todayMek / mekTarget) * 33.3, 33.3) : 0}%`,
                  backgroundColor: '#6366F1',
                  marginLeft: 3,
                }]} />
                <View style={[tStyles.barSeg, {
                  width: `${quantTarget > 0 ? Math.min((todayQuant / quantTarget) * 33.3, 33.3) : 0}%`,
                  backgroundColor: '#F97316',
                  marginLeft: 3,
                }]} />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Section header */}
      <View style={tStyles.sectionRow}>
        <Text style={[tStyles.sectionTitle, { color: theme.colors.text }]}>Dagens uppgifter</Text>
        {!allDone && (todayOrd > 0 || todayMek > 0 || todayQuant > 0) && (
          <ScaleOnPress onPress={onMarkAllDone} scaleTo={0.94}>
            <View style={[tStyles.markAllBtn, { backgroundColor: planConfig.color + '12', borderColor: planConfig.color + '25' }]}>
              <CheckCheck size={15} color={planConfig.color} />
              <Text style={[tStyles.markAllText, { color: planConfig.color }]}>Alla klara</Text>
            </View>
          </ScaleOnPress>
        )}
      </View>

      {/* Task cards */}
      {tasks.map((task) => {
        const done = task.completed >= task.target;
        const progressPct = task.target > 0 ? Math.min(task.completed / task.target, 1) : 0;

        return (
          <View key={task.type} style={[taskStyles.card, {
            backgroundColor: theme.colors.surface,
            borderColor: done ? task.color + '40' : theme.colors.border,
          }]}>
            {/* Left icon */}
            <View style={[taskStyles.iconCol, { backgroundColor: task.color + '10' }]}>
              <Text style={taskStyles.emojiText}>{task.emoji}</Text>
              <View style={[taskStyles.codeChip, { backgroundColor: task.color + '20' }]}>
                <Text style={[taskStyles.codeText, { color: task.color }]}>{task.code}</Text>
              </View>
            </View>

            {/* Body */}
            <View style={taskStyles.body}>
              <Text style={[taskStyles.taskName, { color: theme.colors.text }]}>{task.label}</Text>
              <Text style={[taskStyles.taskDesc, { color: theme.colors.textSecondary }]}>{task.desc}</Text>

              {/* Progress bar */}
              <View style={[taskStyles.taskBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[taskStyles.taskBarFill, { width: `${progressPct * 100}%`, backgroundColor: task.color }]} />
              </View>

              {/* Bottom actions */}
              <View style={taskStyles.bottomRow}>
                <View style={taskStyles.metaGroup}>
                  <Clock size={13} color={theme.colors.textSecondary} />
                  <Text style={[taskStyles.metaText, { color: theme.colors.textSecondary }]}>~10 min</Text>
                  <View style={[taskStyles.countBadge, { backgroundColor: task.color + '14' }]}>
                    <Text style={[taskStyles.countText, { color: task.color }]}>
                      {task.completed}/{task.target}
                    </Text>
                  </View>
                  {done && (
                    <View style={taskStyles.doneMark}>
                      <CheckCircle2 size={14} color={task.color} fill={task.color} />
                      <Text style={[taskStyles.doneText, { color: task.color }]}>Klart</Text>
                    </View>
                  )}
                </View>

                <View style={taskStyles.actionGroup}>
                  {!done && task.target > 0 && (
                    <ScaleOnPress onPress={() => onCheckTask(task.type)} scaleTo={0.9}>
                      <View style={[taskStyles.plusBtn, { backgroundColor: task.color + '15', borderColor: task.color + '30' }]}>
                        <Text style={[taskStyles.plusBtnText, { color: task.color }]}>+1</Text>
                      </View>
                    </ScaleOnPress>
                  )}
                  <ScaleOnPress
                    onPress={() => router.push(ROUTES.hpPractice(task.sectionCode))}
                    scaleTo={0.93}
                  >
                    <View style={[taskStyles.goBtn, { backgroundColor: task.color }]}>
                      <Play size={13} color="#FFF" fill="#FFF" />
                      <Text style={taskStyles.goBtnText}>Träna</Text>
                    </View>
                  </ScaleOnPress>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Progress Tab ──────────────────────────────────────────────────────────────

function ProgressTab({
  progress,
  planConfig,
  weekStats,
  currentDay,
  totalDays,
  theme,
  isDark,
}: {
  progress: any;
  planConfig: PlanConfig;
  weekStats: any[];
  currentDay: number;
  totalDays: number;
  theme: any;
  isDark: boolean;
}) {
  const completedDays = weekStats.filter((d: any) => d.fullyCompleted).length;
  const planProgress = totalDays > 0 ? Math.min(currentDay / totalDays, 1) : 0;

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'][d.getDay()];
  };

  const isToday = (dateStr: string) => dateStr === getTodayString();

  const maxMinutes = Math.max(...weekStats.map((d: any) => d.minutesSpent), 1);

  return (
    <View>
      {/* Totals grid */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Totalt</Text>
      <View style={pStyles.totalsGrid}>
        <StatTile label="Ord inlärda" value={progress.totalWordsLearned} emoji="📖" color="#10B981" />
        <StatTile label="MEK gjorda" value={progress.totalMekCompleted} emoji="✍️" color="#6366F1" />
        <StatTile label="KVA lösta" value={progress.totalQuantCompleted} emoji="🔢" color="#F97316" />
      </View>

      {/* Streak card */}
      <View style={pStyles.streakCard}>
        <View style={pStyles.streakRow}>
          <View style={pStyles.streakIconWrap}>
            <Flame size={32} color="#EF4444" />
          </View>
          <View style={pStyles.streakInfo}>
            <Text style={[pStyles.streakNum, { color: theme.colors.text }]}>{progress.streak} dagar</Text>
            <Text style={[pStyles.streakSub, { color: theme.colors.textSecondary }]}>
              Längsta streak: {progress.longestStreak} dagar · {progress.totalMinutes} min totalt
            </Text>
          </View>
          <Trophy size={28} color="#F59E0B" />
        </View>
      </View>

      {/* Week activity */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Veckans aktivitet</Text>
      <View style={pStyles.weekCard}>
        {weekStats.map((day: any) => {
          const todayMark = isToday(day.date);
          const barH = day.minutesSpent > 0 ? Math.max(10, (day.minutesSpent / maxMinutes) * 72) : 4;
          return (
            <View key={day.date} style={pStyles.weekCol}>
              {day.fullyCompleted && (
                <View style={[pStyles.weekCheck, { backgroundColor: planConfig.color }]}>
                  <CheckCircle2 size={9} color="#FFF" fill="#FFF" />
                </View>
              )}
              <View style={[pStyles.weekBar, {
                height: barH,
                backgroundColor: day.fullyCompleted
                  ? planConfig.color
                  : day.minutesSpent > 0
                    ? planConfig.color + '55'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              }]} />
              <Text style={[pStyles.weekLabel, {
                color: todayMark ? planConfig.color : theme.colors.textSecondary,
                fontWeight: todayMark ? '700' as const : '500' as const,
              }]}>
                {getDayLabel(day.date)}
              </Text>
              {todayMark && <View style={[pStyles.weekDot, { backgroundColor: planConfig.color }]} />}
            </View>
          );
        })}
      </View>
      <Text style={pStyles.weekSummary}>
        {completedDays}/7 dagar slutförda denna vecka
      </Text>

      {/* Plan progress */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Planens framsteg</Text>
      <View style={pStyles.planCard}>
        <View style={pStyles.planHeader}>
          <View>
            <Text style={[pStyles.planDay, { color: theme.colors.text }]}>Dag {currentDay} av {totalDays}</Text>
            <Text style={pStyles.planSub}>{totalDays - currentDay} dagar kvar på planen</Text>
          </View>
          <View style={[pStyles.planPctBadge, { backgroundColor: planConfig.color + '15' }]}>
            <Text style={[pStyles.planPctText, { color: planConfig.color }]}>{Math.round(planProgress * 100)}%</Text>
          </View>
        </View>
        <View style={pStyles.planBarBg}>
          <View style={[pStyles.planBarFill, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color }]} />
        </View>
        <View style={pStyles.planMarkers}>
          {[0.25, 0.5, 0.75].map((mark, i) => (
            <View key={i} style={[pStyles.marker, { left: `${mark * 100}%` }]}>
              <View style={[pStyles.markerDot, { backgroundColor: planConfig.color + '35' }]} />
              <Text style={pStyles.markerLabel}>{Math.round(mark * 100)}%</Text>
            </View>
          ))}
          <View style={[pStyles.marker, { left: '100%' }]}>
            <Target size={16} color={planConfig.color} />
            <Text style={[pStyles.markerLabel, { color: planConfig.color }]}>Mål</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 60 }} />
    </View>
  );
}

function StatTile({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  return (
    <View style={stStyles.tile}>
      <Text style={stStyles.tileEmoji}>{emoji}</Text>
      <Text style={[stStyles.tileNum, { color }]}>{value}</Text>
      <Text style={stStyles.tileLabel}>{label}</Text>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════════

export default function HPStudyPlanScreen() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  const {
    plan,
    progress,
    isLoaded,
    selectPlan,
    deletePlan,
    updateSettings,
    markAllComplete,
    updateDailyProgress,
    getTodayProgress,
    getDaysUntilHP,
    getCountdownMessage,
    getCurrentDayNumber,
    getTotalPlanDays,
    getSuggestedPlan,
    getWeekStats,
  } = useHPStudyPlan();

  const [selectedDate] = useState<HPDateKey>('fall2026');

  const daysUntil = getDaysUntilHP();
  const countdownMsg = getCountdownMessage(daysUntil);
  const suggestedPlan = getSuggestedPlan(daysUntil);
  const todayProgress = getTodayProgress();
  const weekStats = getWeekStats();
  const currentDay = getCurrentDayNumber();
  const totalDays = getTotalPlanDays();

  const planConfig = plan ? PLAN_CONFIGS.find((c) => c.type === plan.planType)! : null;

  const todayOrd = todayProgress?.ordCompleted ?? 0;
  const todayMek = todayProgress?.mekCompleted ?? 0;
  const todayQuant = todayProgress?.quantCompleted ?? 0;

  const ordTarget = planConfig?.wordsPerDay ?? 0;
  const mekTarget = planConfig?.mekPerDay ?? 0;
  const quantTarget = planConfig?.quantPerDay ?? 0;

  const todayPct = planConfig && (ordTarget + mekTarget + quantTarget) > 0
    ? Math.min(100, Math.round(((todayOrd / Math.max(1, ordTarget) + todayMek / Math.max(1, mekTarget) + todayQuant / Math.max(1, quantTarget)) / 3) * 100))
    : 0;

  const handleSelectPlan = useCallback(
    async (type: HPPlanType) => {
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await selectPlan(type, selectedDate);
    },
    [selectPlan, selectedDate],
  );

  const handleCheckTask = useCallback(
    async (type: 'ord' | 'mek' | 'quant') => {
      if (!planConfig) return;
      const targets: Record<string, number> = { ord: ordTarget, mek: mekTarget, quant: quantTarget };
      const current: Record<string, number> = { ord: todayOrd, mek: todayMek, quant: todayQuant };
      if (current[type] >= (targets[type] || 1)) return;
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateDailyProgress(type, 1);
    },
    [planConfig, ordTarget, mekTarget, quantTarget, todayOrd, todayMek, todayQuant, updateDailyProgress],
  );

  const handleMarkAllDone = useCallback(async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllComplete();
  }, [markAllComplete]);

  const handleDeletePlan = useCallback(() => {
    Alert.alert('Ta bort studieplan', 'Är du säker? Din progress sparas men planen raderas.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Ta bort', style: 'destructive', onPress: async () => { await deletePlan(); } },
    ]);
  }, [deletePlan]);

  // Loading
  if (!isLoaded) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  // Free user → upsell
  if (!isPremium) {
    return <PremiumUpsellView theme={theme} isDark={isDark} daysUntil={daysUntil} />;
  }

  // Premium without plan → selection
  if (!plan) {
    return (
      <PlanSelectionView
        daysUntil={daysUntil}
        countdownMsg={countdownMsg}
        suggestedPlan={suggestedPlan}
        onSelectPlan={handleSelectPlan}
        theme={theme}
        isDark={isDark}
      />
    );
  }

  // Premium with active plan → main view
  return (
    <ActivePlanView
      plan={plan}
      planConfig={planConfig!}
      progress={progress}
      daysUntil={daysUntil}
      countdownMsg={countdownMsg}
      currentDay={currentDay}
      totalDays={totalDays}
      todayOrd={todayOrd}
      todayMek={todayMek}
      todayQuant={todayQuant}
      ordTarget={ordTarget}
      mekTarget={mekTarget}
      quantTarget={quantTarget}
      todayPct={todayPct}
      onCheckTask={handleCheckTask}
      onMarkAllDone={handleMarkAllDone}
      onUpdateSettings={updateSettings}
      onDeletePlan={handleDeletePlan}
      weekStats={weekStats}
      theme={theme}
      isDark={isDark}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root: { flex: 1 },
});

// ─── PREMIUM UPSELL STYLES ─────────────────────────────────────────────────────

const upStyles = StyleSheet.create({
  navRow: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 80 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  headerIcon: {
    width: 52, height: 52, borderRadius: 17,
    backgroundColor: 'rgba(99,102,241,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  overline: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },

  // Countdown card
  countdownCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1B4B', borderRadius: 20, padding: 20,
    marginBottom: 28,
  },
  countdownLeft: { alignItems: 'flex-start', marginRight: 20 },
  countdownNum: { fontSize: 36, fontWeight: '900' as const, color: '#FFF', letterSpacing: -1.2, lineHeight: 40 },
  countdownUnit: {
    fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 2,
  },
  countdownDiv: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 20 },
  countdownRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  countdownLabel: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },
  countdownDate: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' as const, marginTop: 1 },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1 },
  lockChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.10)',
  },
  lockChipText: { fontSize: 11, fontWeight: '700' as const, color: '#6366F1' },

  // Task rows
  taskList: { gap: 10, marginBottom: 28 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 18, borderWidth: 1, gap: 14,
  },
  taskIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  taskBody: { flex: 1, gap: 3 },
  taskTitle: { fontSize: 15, fontWeight: '700' as const },
  taskTag: { fontSize: 12, fontWeight: '500' as const },
  taskLock: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Progress strip
  progressStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 28,
  },
  progressBody: { flex: 1, gap: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  progressTitle: { fontSize: 14, fontWeight: '700' as const, flex: 1 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#6366F1', width: '40%' },

  // Conversion card
  conversionCard: { borderRadius: 22, padding: 22 },
  conversionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  conversionTitle: { fontSize: 19, fontWeight: '800' as const, letterSpacing: -0.3 },
  benefitList: { gap: 11, marginBottom: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { fontSize: 14, flex: 1, lineHeight: 20, fontWeight: '500' as const },
  ctaWrap: { marginBottom: 14 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, paddingHorizontal: 24,
    borderRadius: 17, gap: 10, backgroundColor: '#4F46E5',
  },
  ctaText: { fontSize: 16, fontWeight: '800' as const, color: '#FFF', flexShrink: 1 },
  trustText: { fontSize: 13, textAlign: 'center' },
});

// ─── PLAN SELECTION STYLES ─────────────────────────────────────────────────────

const selStyles = StyleSheet.create({
  scrollContainer: { paddingBottom: 80 },
  navRow: { paddingHorizontal: 20, paddingTop: 16 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  titleArea: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 24,
  },
  overline: {
    fontSize: 12, fontWeight: '700' as const,
    letterSpacing: 1.5, color: '#94A3B8',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 32, fontWeight: '900' as const,
    letterSpacing: -0.8, color: '#1A1A2E',
    marginBottom: 8,
  },
  mainSub: {
    fontSize: 16, lineHeight: 23,
    color: '#64748B',
  },
  countdownCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  countdownInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1A1A2E',
  },
  countdownLeft: { alignItems: 'flex-start' },
  countdownNum: {
    fontSize: 64, fontWeight: '900' as const,
    letterSpacing: -3, lineHeight: 68,
  },
  countdownUnit: {
    fontSize: 16, fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  countdownRight: { alignItems: 'center', gap: 4 },
  countdownLabel: {
    fontSize: 16, fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
  },
  countdownDate: {
    fontSize: 13, fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  countdownMsg: {
    paddingHorizontal: 24, paddingVertical: 12,
  },
  countdownMsgText: {
    fontSize: 14, fontWeight: '700' as const,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 17, fontWeight: '700' as const,
    color: '#1A1A2E',
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 4,
  },
});

// ─── PLAN CARD STYLES ──────────────────────────────────────────────────────────

const pcStyles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardSuggested: {
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  cardTop: { padding: 22 },
  recBadge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, gap: 5,
    marginBottom: 16,
  },
  recText: { fontSize: 12, fontWeight: '700' as const, color: '#FFF' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiBox: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 28 },
  cardTopInfo: { flex: 1 },
  cardName: {
    fontSize: 20, fontWeight: '800' as const,
    color: '#FFF', letterSpacing: -0.4,
    marginBottom: 3,
  },
  cardSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 19 },
  arrowWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  cardBottom: { padding: 20 },
  pillRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 16, flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 12,
  },
  pillEmoji: { fontSize: 13 },
  pillLabel: { fontSize: 12, fontWeight: '700' as const },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontWeight: '500' as const },
  goalBadge: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 12,
  },
  goalText: { fontSize: 13, fontWeight: '700' as const },
});

// ─── ACTIVE PLAN STYLES ────────────────────────────────────────────────────────

const apStyles = StyleSheet.create({
  headerBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 220,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16,
    marginBottom: 18,
  },
  navBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  navCenter: {
    flex: 1, alignItems: 'center',
  },
  navTitle: {
    fontSize: 18, fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  navSub: {
    fontSize: 12, fontWeight: '500' as const,
    color: '#94A3B8', marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 12,
  },
  statItem: { alignItems: 'center', paddingVertical: 4 },
  statNum: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.6, lineHeight: 30 },
  statNumFaded: { fontSize: 14, fontWeight: '500' as const, color: '#94A3B8' },
  statLabel: { fontSize: 11, fontWeight: '600' as const, color: '#94A3B8', marginTop: 3 },
  statInline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statDiv: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.08)' },
  msgPill: {
    alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, marginBottom: 8,
  },
  msgText: { fontSize: 14, fontWeight: '700' as const },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 0,
    minHeight: 50,
  },
  tabIndicator: {
    position: 'absolute', bottom: 0,
    height: 3, borderRadius: 1.5,
  },
  tab: {
    flex: 1, alignItems: 'center',
    paddingVertical: 14,
    minHeight: 50,
  },
  tabLabel: { fontSize: 15 },
  contentScroll: { flex: 1 },
  contentPadding: { padding: 20, paddingBottom: 100 },
});

// ─── TODAY TAB STYLES ──────────────────────────────────────────────────────────

const tStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, fontWeight: '500' as const },
  dayBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  dayBadgeText: { fontSize: 13, fontWeight: '700' as const },
  overallCard: {
    padding: 20, borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  celebration: {
    flexDirection: 'row', alignItems: 'center',
    padding: 22, gap: 14,
    margin: -20,
  },
  celebEmoji: { fontSize: 32 },
  celebBody: { flex: 1 },
  celebTitle: { fontSize: 18, fontWeight: '800' as const, color: '#FFF' },
  celebSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  overallTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  overallTopLeft: { flex: 1 },
  overallTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.3 },
  overallSub: { fontSize: 13, marginTop: 4, fontWeight: '500' as const },
  pctCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  pctText: { fontSize: 16, fontWeight: '800' as const, color: '#FFF' },
  barRow: { marginTop: 4 },
  barBg: {
    height: 14, borderRadius: 7,
    flexDirection: 'row', overflow: 'hidden',
  },
  barSeg: { height: '100%', borderRadius: 5 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.4 },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 14, borderWidth: 1,
  },
  markAllText: { fontSize: 13, fontWeight: '700' as const },
});

// ─── TASK CARD STYLES ──────────────────────────────────────────────────────────

const taskStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    minHeight: 110,
  },
  iconCol: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  emojiText: { fontSize: 30 },
  codeChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.6 },
  body: { flex: 1, padding: 18, paddingLeft: 12, justifyContent: 'center' },
  taskName: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.3, marginBottom: 3 },
  taskDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  taskBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  taskBarFill: { height: '100%', borderRadius: 4 },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  metaGroup: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, flexShrink: 1,
  },
  metaText: { fontSize: 12, fontWeight: '500' as const },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  countText: { fontSize: 13, fontWeight: '800' as const },
  doneMark: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { fontSize: 12, fontWeight: '700' as const },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  plusBtn: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  plusBtnText: { fontSize: 14, fontWeight: '800' as const },
  goBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  goBtnText: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },
});

// ─── PROGRESS TAB STYLES ───────────────────────────────────────────────────────

const pStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18, fontWeight: '700' as const,
    letterSpacing: -0.4, marginBottom: 14, marginTop: 4,
  },
  totalsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  streakCard: {
    padding: 22, borderRadius: 22,
    backgroundColor: '#FFF',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  streakRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  streakInfo: { flex: 1, marginLeft: 16 },
  streakNum: { fontSize: 20, fontWeight: '700' as const },
  streakSub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  weekCard: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: 20, paddingBottom: 14,
    borderRadius: 22,
    backgroundColor: '#FFF',
    marginBottom: 10,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekCol: { alignItems: 'center', gap: 7, flex: 1 },
  weekBar: { width: 30, minHeight: 4, borderRadius: 6 },
  weekCheck: {
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  weekLabel: { fontSize: 12 },
  weekDot: { width: 6, height: 6, borderRadius: 3 },
  weekSummary: {
    fontSize: 14, textAlign: 'center',
    color: '#64748B', marginBottom: 24,
    fontWeight: '500' as const,
  },
  planCard: {
    padding: 22, borderRadius: 22,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  planDay: { fontSize: 17, fontWeight: '700' as const },
  planSub: { fontSize: 13, color: '#94A3B8', marginTop: 3 },
  planPctBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  planPctText: { fontSize: 20, fontWeight: '800' as const },
  planBarBg: {
    height: 12, borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  planBarFill: { height: '100%', borderRadius: 6 },
  planMarkers: {
    position: 'relative',
    height: 32,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -14 }],
  },
  markerDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  markerLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' as const },
});

// ─── STAT TILE STYLES ──────────────────────────────────────────────────────────

const stStyles = StyleSheet.create({
  tile: {
    flex: 1, borderRadius: 18,
    backgroundColor: '#FFF',
    padding: 16, alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tileEmoji: { fontSize: 28, marginBottom: 8 },
  tileNum: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  tileLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'center', fontWeight: '600' as const },
});
