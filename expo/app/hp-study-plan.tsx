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
import {
  ChevronLeft,
  Calendar,
  Flame,
  CheckCircle2,
  Bell,
  Trophy,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  Sparkles,
  Target,
  Crown,
  BarChart3,
  Zap,
  BookOpen,
  Edit3,
  Hash,
  Play,
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

function AnimatedPressable({
  onPress,
  style,
  children,
  scaleValue = 0.96,
}: {
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
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: scaleValue,
            useNativeDriver: true,
            speed: 40,
            bounciness: 3,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 5,
          }).start()
        }
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM UPSELL — Free users
// ════════════════════════════════════════════════════════════════════════════════

function PremiumUpsellView({ theme, isDark }: { theme: any; isDark: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bumpAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(bumpAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(bumpAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim, bumpAnim]);

  const features = [
    { icon: Target, color: '#10B981', title: 'Personlig intensitetsnivå', desc: 'Anpassad efter hur lång tid du har till provet' },
    { icon: Flame, color: '#F97316', title: 'Streak-tracking', desc: 'Bygg starka studievanor och håll koll på din streak' },
    { icon: Bell, color: '#6366F1', title: 'Smarta påminnelser', desc: 'Få notiser vid rätt tidpunkt varje dag' },
    { icon: BarChart3, color: '#EC4899', title: 'Detaljerad statistik', desc: 'Se din utveckling med vecko- och månadsstatistik' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <TouchableOpacity
          style={[styles.backCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
          {/* Crown icon */}
          <View style={{ position: 'relative', marginBottom: 28, alignItems: 'center' }}>
            <LinearGradient
              colors={['#FFD700', '#F59E0B', '#EA580C']}
              style={upStyles.crownCircle}
            >
              <Crown size={44} color="#FFF" fill="#FFF" />
            </LinearGradient>
            <View style={{ position: 'absolute', top: -6, left: -20 }}>
              <Sparkles size={18} color="#FFD700" />
            </View>
            <View style={{ position: 'absolute', bottom: 6, right: -14 }}>
              <Sparkles size={14} color="#FFD700" />
            </View>
          </View>

          <Text style={[upStyles.title, { color: theme.colors.text }]}>
            Studieplan är Premium
          </Text>
          <Text style={[upStyles.subtitle, { color: theme.colors.textSecondary }]}>
            Få en personlig studieplan med dagliga mål, streak-tracking och smarta påminnelser inför högskoleprovet
          </Text>

          {/* Feature list */}
          <View style={[upStyles.featureCard, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
            {features.map((f, i) => (
              <View key={i} style={upStyles.featureRow}>
                <View style={[upStyles.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <f.icon size={20} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[upStyles.featureTitle, { color: theme.colors.text }]}>{f.title}</Text>
                  <Text style={[upStyles.featureDesc, { color: theme.colors.textSecondary }]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: bumpAnim }], width: '100%' }}>
            <TouchableOpacity
              style={upStyles.ctaBtn}
              onPress={() => router.push(ROUTES.premium)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFD700', '#F59E0B', '#EA580C']}
                style={upStyles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={20} color="#000" />
                <Text style={upStyles.ctaText}>Lås upp Studieplan</Text>
                <ArrowRight size={18} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={[upStyles.trust, { color: theme.colors.textSecondary }]}>
            Ingår i Premium · Avbryt när du vill
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PLAN SELECTION — Premium users without a plan
// ════════════════════════════════════════════════════════════════════════════════

function PlanSelectionView({
  selectedDate,
  setSelectedDate,
  daysUntil,
  countdownMsg,
  suggestedPlan,
  onSelectPlan,
  theme,
  isDark,
}: {
  selectedDate: HPDateKey;
  setSelectedDate: (k: HPDateKey) => void;
  daysUntil: number;
  countdownMsg: string;
  suggestedPlan: HPPlanType;
  onSelectPlan: (type: HPPlanType) => void;
  theme: any;
  isDark: boolean;
}) {
  const urgencyColor = daysUntil >= 60 ? '#10B981' : daysUntil >= 30 ? '#F97316' : '#EF4444';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero */}
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
            <Text style={selStyles.heroLabel}>HÖGSKOLEPROV 2026</Text>
            <View style={selStyles.heroCountRow}>
              <Text style={[selStyles.heroNum, { color: urgencyColor }]}>{daysUntil}</Text>
              <View style={selStyles.heroNumRight}>
                <Text style={selStyles.heroNumUnit}>dagar</Text>
                <Text style={selStyles.heroNumUnit}>kvar</Text>
              </View>
            </View>
            <View style={[selStyles.msgPill, { backgroundColor: urgencyColor + '20', borderColor: urgencyColor + '40', borderWidth: 1 }]}>
              <Text style={[selStyles.msgText, { color: urgencyColor }]}>{countdownMsg}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={selStyles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[selStyles.sectionTitle, { color: theme.colors.text }]}>Välj provtillfälle</Text>
        <View style={selStyles.dateRow}>
          <TouchableOpacity
            style={[selStyles.dateCard, {
              backgroundColor: '#6366F1',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 10,
            }]}
            activeOpacity={1}
          >
            <Text style={{ fontSize: 28, marginBottom: 10 }}>🍂</Text>
            <Text style={selStyles.dateCardTitle}>Höst 2026</Text>
            <Text style={selStyles.dateCardSub}>18 oktober</Text>
            <View style={selStyles.dateCheck}>
              <CheckCircle2 size={18} color="#FFF" fill="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[selStyles.sectionTitle, { color: theme.colors.text }]}>Välj intensitet</Text>

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
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isSuggested, pulseAnim]);

  return (
    <AnimatedPressable onPress={onSelect} style={{ marginBottom: 18 }} scaleValue={0.975}>
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
        <View style={[pcStyles.card, isSuggested && pcStyles.cardSuggested]}>
          <LinearGradient
            colors={[config.gradientColors[0], config.gradientColors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={pcStyles.top}
          >
            {isSuggested && (
              <View style={pcStyles.recBadge}>
                <Sparkles size={11} color="#FFF" />
                <Text style={pcStyles.recText}>Rekommenderad</Text>
              </View>
            )}
            <View style={pcStyles.topRow}>
              <View style={pcStyles.emojiWrap}>
                <Text style={{ fontSize: 36 }}>{config.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={pcStyles.name}>{config.name}</Text>
                <Text style={pcStyles.subtitle}>{config.subtitle}</Text>
              </View>
              <View style={pcStyles.arrowCircle}>
                <ArrowRight size={16} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>

          <View style={[pcStyles.bottom, { backgroundColor: isDark ? '#1E293B' : '#FAFBFF' }]}>
            <View style={pcStyles.pillRow}>
              <PlanPill emoji="📖" label={`${config.wordsPerDay} ORD`} color={config.color} />
              <PlanPill emoji="✍️" label={`${config.mekPerDay} MEK`} color={config.color} />
              <PlanPill emoji="🔢" label={`${config.quantPerDay} KVA`} color={config.color} />
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

function PlanPill({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <View style={[pillStyles.wrap, { backgroundColor: color + '14' }]}>
      <Text style={{ fontSize: 12 }}>{emoji}</Text>
      <Text style={[pillStyles.text, { color }]}>{label}</Text>
    </View>
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
      speed: 16,
      bounciness: 2,
    }).start();
  }, [tab, tabAnim]);

  const now = new Date();
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const allDone = todayPct >= 100;
  const tabWidth = (SCREEN_WIDTH - 64) / 2;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient background behind header */}
      <LinearGradient
        colors={isDark
          ? [planConfig.color + '44', planConfig.color + '15', 'transparent']
          : [planConfig.color + '66', planConfig.color + '33', 'transparent']}
        style={styles.headerBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView edges={['top']}>
        {/* Back + title */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Studieplan</Text>
            <Text style={[styles.headerSub, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
              {planConfig.emoji} {planConfig.name} · {HP_DATE_LABELS[plan.hpDateKey as HPDateKey]}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.backCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
            onPress={() =>
              Alert.alert('Inställningar', 'Vill du ändra inställningar eller ta bort planen?', [
                { text: 'Avbryt', style: 'cancel' },
                { text: 'Ta bort plan', style: 'destructive', onPress: onDeletePlan },
                {
                  text: 'Notiser',
                  onPress: () =>
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
                    ),
                },
              ])
            }
            activeOpacity={0.7}
          >
            <Bell size={18} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{daysUntil}</Text>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>dagar kvar</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={styles.statItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Flame size={16} color="#F97316" />
              <Text style={[styles.statNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{progress.streak}</Text>
            </View>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>streak</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
              {currentDay}
              <Text style={{ fontSize: 14, fontWeight: '500' as const, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>/{totalDays}</Text>
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>plan dag</Text>
          </View>
        </View>

        {/* Countdown message */}
        <View style={styles.msgRow}>
          <View style={[styles.msgPill, { backgroundColor: planConfig.color + '18', borderColor: planConfig.color + '35', borderWidth: 1 }]}>
            <Text style={[styles.msgText, { color: planConfig.color }]}>{countdownMsg}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? theme.colors.surface : '#F8F9FB', borderBottomColor: theme.colors.border }]}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: planConfig.color,
              width: tabWidth - 20,
              transform: [
                {
                  translateX: tabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, tabWidth + 28],
                  }),
                },
              ],
            },
          ]}
        />
        <TouchableOpacity style={styles.tabItem} onPress={() => setTab('today')} activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: tab === 'today' ? planConfig.color : theme.colors.textSecondary, fontWeight: tab === 'today' ? '700' as const : '500' as const }]}>
            Idag
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setTab('progress')} activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: tab === 'progress' ? planConfig.color : theme.colors.textSecondary, fontWeight: tab === 'progress' ? '700' as const : '500' as const }]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
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
      desc: `${ordTarget} nya ord idag`,
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
      desc: `${mekTarget} meningskompletteringar`,
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
      desc: `${quantTarget} kvantitativa uppgifter`,
      completed: todayQuant,
      target: quantTarget,
      color: '#F97316',
      sectionCode: 'KVA',
    },
  ];

  return (
    <View>
      {/* Date + day badge */}
      <View style={tStyles.dateRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Calendar size={14} color={theme.colors.textSecondary} />
          <Text style={[tStyles.dateText, { color: theme.colors.textSecondary }]}>{dayLabel}</Text>
        </View>
        <View style={[tStyles.dayBadge, { backgroundColor: planConfig.color + '14' }]}>
          <Text style={[tStyles.dayBadgeText, { color: planConfig.color }]}>Dag {currentDay}/{totalDays}</Text>
        </View>
      </View>

      {/* Overall progress card */}
      <View
        style={[
          tStyles.overallCard,
          {
            backgroundColor: allDone
              ? isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.06)'
              : isDark ? theme.colors.surface : '#FAFBFF',
            borderColor: allDone ? '#10B98160' : theme.colors.border,
          },
        ]}
      >
        {allDone ? (
          <LinearGradient colors={['#10B981', '#059669']} style={tStyles.celebration} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={{ fontSize: 28 }}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={tStyles.celebrationTitle}>Allt klart idag!</Text>
              <Text style={tStyles.celebrationSub}>Fantastiskt jobbat – streaken håller!</Text>
            </View>
            <Sparkles size={20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        ) : (
          <>
            <View style={tStyles.overallTop}>
              <View style={{ flex: 1 }}>
                <Text style={[tStyles.overallTitle, { color: theme.colors.text }]}>Dagens framsteg</Text>
                <Text style={[tStyles.overallSub, { color: theme.colors.textSecondary }]}>{todayPct}% slutfört</Text>
              </View>
              <View style={[tStyles.pctCircle, { backgroundColor: planConfig.color }]}>
                <Text style={tStyles.pctText}>{todayPct}%</Text>
              </View>
            </View>
            <View style={[tStyles.barBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[tStyles.barFill, { width: `${Math.min((todayOrd / ordTarget) * 33.3, 33.3)}%`, backgroundColor: '#10B981' }]} />
              <View style={[tStyles.barFill, { width: `${Math.min((todayMek / mekTarget) * 33.3, 33.3)}%`, backgroundColor: '#6366F1', marginLeft: 2 }]} />
              <View style={[tStyles.barFill, { width: `${Math.min((todayQuant / quantTarget) * 33.3, 33.3)}%`, backgroundColor: '#F97316', marginLeft: 2 }]} />
            </View>
          </>
        )}
      </View>

      {/* Section header + "Alla klara" */}
      <View style={tStyles.sectionRow}>
        <Text style={[tStyles.sectionTitle, { color: theme.colors.text }]}>Dagens uppgifter</Text>
        {!allDone && (
          <AnimatedPressable onPress={onMarkAllDone} scaleValue={0.94}>
            <View style={[tStyles.markAllBtn, { backgroundColor: planConfig.color + '12', borderColor: planConfig.color + '30' }]}>
              <CheckCheck size={14} color={planConfig.color} />
              <Text style={[tStyles.markAllText, { color: planConfig.color }]}>Alla klara</Text>
            </View>
          </AnimatedPressable>
        )}
      </View>

      {/* Task cards */}
      {tasks.map((task) => {
        const done = task.completed >= task.target;
        const progressPct = Math.min(task.completed / task.target, 1);

        return (
          <View
            key={task.type}
            style={[
              taskStyles.card,
              {
                backgroundColor: isDark ? theme.colors.surface : '#FFF',
                borderColor: done ? task.color + '50' : isDark ? theme.colors.border : 'rgba(0,0,0,0.06)',
                borderWidth: done ? 1.5 : 1,
              },
            ]}
          >
            {/* Left icon area */}
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

            {/* Body */}
            <View style={taskStyles.body}>
              <View style={taskStyles.topRow}>
                <Text style={[taskStyles.name, { color: theme.colors.text }]}>{task.label}</Text>
                {done ? (
                  <CheckCircle2 size={22} color={task.color} fill={task.color} />
                ) : (
                  <View style={[taskStyles.countBadge, { backgroundColor: task.color + '14' }]}>
                    <Text style={[taskStyles.countText, { color: task.color }]}>{task.completed}/{task.target}</Text>
                  </View>
                )}
              </View>
              <Text style={[taskStyles.desc, { color: theme.colors.textSecondary }]}>{task.desc}</Text>

              {/* Progress bar */}
              <View style={taskStyles.barBg}>
                <View style={[taskStyles.barFill, { width: `${progressPct * 100}%`, backgroundColor: task.color }]} />
              </View>

              {/* Bottom row: meta + actions */}
              <View style={taskStyles.bottomRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} color={theme.colors.textSecondary} />
                  <Text style={[taskStyles.metaText, { color: theme.colors.textSecondary }]}>~10 min</Text>
                  {done && <Text style={[taskStyles.tapHint, { color: task.color }]}>Klart 🎉</Text>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {!done && (
                    <AnimatedPressable onPress={() => onCheckTask(task.type)} scaleValue={0.88}>
                      <View style={[taskStyles.checkBtn, { backgroundColor: task.color + '12', borderColor: task.color + '30' }]}>
                        <CheckCircle2 size={13} color={task.color} />
                        <Text style={[taskStyles.checkBtnText, { color: task.color }]}>+1</Text>
                      </View>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable
                    onPress={() => {
                      router.push(ROUTES.hpPractice(task.sectionCode));
                    }}
                    scaleValue={0.93}
                  >
                    <View style={[taskStyles.goBtn, { backgroundColor: task.color, shadowColor: task.color }]}>
                      <Play size={12} color="#FFF" fill="#FFF" />
                      <Text style={taskStyles.goBtnText}>Träna</Text>
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
  const planProgress = Math.min(currentDay / totalDays, 1);

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'][d.getDay()];
  };

  const isToday = (dateStr: string) => dateStr === getTodayString();

  return (
    <View>
      {/* Stat cards */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Totalt</Text>
      <View style={pStyles.statsGrid}>
        <StatTile label="Ord inlärda" value={progress.totalWordsLearned} emoji="📖" color="#10B981" theme={theme} isDark={isDark} />
        <StatTile label="MEK gjorda" value={progress.totalMekCompleted} emoji="✍️" color="#6366F1" theme={theme} isDark={isDark} />
        <StatTile label="KVA lösta" value={progress.totalQuantCompleted} emoji="🔢" color="#F97316" theme={theme} isDark={isDark} />
      </View>

      {/* Streak card */}
      <View style={[pStyles.streakCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
        <LinearGradient
          colors={['rgba(239,68,68,0.1)', 'rgba(249,115,22,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={pStyles.streakGradient}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
            <View style={[pStyles.streakIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Flame size={28} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[pStyles.streakNum, { color: theme.colors.text }]}>{progress.streak} dagars streak</Text>
              <Text style={[pStyles.streakSub, { color: theme.colors.textSecondary }]}>
                Längst: {progress.longestStreak} dagar · {progress.totalMinutes} min totalt
              </Text>
            </View>
          </View>
          <Trophy size={24} color="#F59E0B" />
        </LinearGradient>
      </View>

      {/* Week activity */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Veckans aktivitet</Text>
      <View style={[pStyles.weekCard, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
        {weekStats.map((day: any) => {
          const todayMark = isToday(day.date);
          const barH = day.minutesSpent > 0 ? Math.max(12, (day.minutesSpent / Math.max(...weekStats.map((d: any) => d.minutesSpent), 1)) * 64) : 6;
          return (
            <View key={day.date} style={pStyles.weekCol}>
              {day.fullyCompleted && (
                <View style={[pStyles.weekCheck, { backgroundColor: planConfig.color }]}>
                  <CheckCircle2 size={8} color="#FFF" fill="#FFF" />
                </View>
              )}
              <View
                style={[
                  pStyles.weekBar,
                  {
                    height: barH,
                    backgroundColor: day.fullyCompleted
                      ? planConfig.color
                      : day.minutesSpent > 0
                        ? planConfig.color + '50'
                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              />
              <Text
                style={[
                  pStyles.weekLabel,
                  {
                    color: todayMark ? planConfig.color : theme.colors.textSecondary,
                    fontWeight: todayMark ? '700' as const : '500' as const,
                  },
                ]}
              >
                {getDayLabel(day.date)}
              </Text>
              {todayMark && <View style={[pStyles.weekDot, { backgroundColor: planConfig.color }]} />}
            </View>
          );
        })}
      </View>
      <Text style={[pStyles.weekNote, { color: theme.colors.textSecondary }]}>
        {completedDays}/7 dagar slutförda denna vecka
      </Text>

      {/* Plan progress */}
      <Text style={[pStyles.sectionTitle, { color: theme.colors.text }]}>Planens framsteg</Text>
      <View style={[pStyles.planCard, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
        <View style={pStyles.planHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[pStyles.planDay, { color: theme.colors.text }]}>Dag {currentDay} av {totalDays}</Text>
            <Text style={[pStyles.planNote, { color: theme.colors.textSecondary }]}>
              {totalDays - currentDay} dagar kvar på planen
            </Text>
          </View>
          <View style={[pStyles.planPct, { backgroundColor: planConfig.color + '14' }]}>
            <Text style={[pStyles.planPctText, { color: planConfig.color }]}>{Math.round(planProgress * 100)}%</Text>
          </View>
        </View>
        <View style={[pStyles.planBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={[pStyles.planBarFill, { width: `${planProgress * 100}%`, backgroundColor: planConfig.color }]} />
        </View>
        <View style={pStyles.planMarkers}>
          <View style={[pStyles.markerDot, { left: '25%', backgroundColor: planConfig.color + '30' }]} />
          <View style={[pStyles.markerDot, { left: '50%', backgroundColor: planConfig.color + '30' }]} />
          <View style={[pStyles.markerDot, { left: '75%', backgroundColor: planConfig.color + '30' }]} />
          <View style={{ position: 'absolute', left: '100%', marginLeft: -8 }}>
            <Target size={14} color={planConfig.color} />
          </View>
        </View>
      </View>
    </View>
  );
}

function StatTile({
  label,
  value,
  emoji,
  color,
  theme,
  isDark,
}: {
  label: string;
  value: number;
  emoji: string;
  color: string;
  theme: any;
  isDark: boolean;
}) {
  return (
    <View style={[stStyles.card, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
      <LinearGradient
        colors={[color + '18', color + '06']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={stStyles.gradient}
      >
        <Text style={{ fontSize: 26, marginBottom: 8 }}>{emoji}</Text>
        <Text style={[stStyles.val, { color }]}>{value}</Text>
        <Text style={[stStyles.lbl, { color: theme.colors.textSecondary }]}>{label}</Text>
      </LinearGradient>
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
    updateDailyProgress,
    getTodayProgress,
    getDaysUntilHP,
    getCountdownMessage,
    getCurrentDayNumber,
    getTotalPlanDays,
    getSuggestedPlan,
    getWeekStats,
  } = useHPStudyPlan();

  const [selectedDate, setSelectedDate] = useState<HPDateKey>('fall2026');

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

  const ordTarget = planConfig?.wordsPerDay ?? 30;
  const mekTarget = planConfig?.mekPerDay ?? 3;
  const quantTarget = planConfig?.quantPerDay ?? 12;

  const todayPct = planConfig
    ? Math.min(100, Math.round(((todayOrd / ordTarget + todayMek / mekTarget + todayQuant / quantTarget) / 3) * 100))
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
      if (current[type] >= targets[type]) return;
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateDailyProgress(type, 1);
    },
    [planConfig, ordTarget, mekTarget, quantTarget, todayOrd, todayMek, todayQuant, updateDailyProgress],
  );

  const handleMarkAllDone = useCallback(async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const remOrd = Math.max(0, ordTarget - todayOrd);
    const remMek = Math.max(0, mekTarget - todayMek);
    const remQuant = Math.max(0, quantTarget - todayQuant);
    for (let i = 0; i < remOrd; i++) await updateDailyProgress('ord', 1);
    for (let i = 0; i < remMek; i++) await updateDailyProgress('mek', 1);
    for (let i = 0; i < remQuant; i++) await updateDailyProgress('quant', 1);
  }, [ordTarget, mekTarget, quantTarget, todayOrd, todayMek, todayQuant, updateDailyProgress]);

  const handleDeletePlan = useCallback(() => {
    Alert.alert('Ta bort studieplan', 'Är du säker? All din progress sparas men planen raderas.', [
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
    return <PremiumUpsellView theme={theme} isDark={isDark} />;
  }

  // Premium without plan → selection
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
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    marginBottom: 20,
  },
  backCircle: {
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
    marginBottom: 14,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500' as const,
  },
  statDiv: {
    width: 1,
    height: 40,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  msgPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  msgText: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 32,
    position: 'relative',
    marginBottom: 0,
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
  },
  tabLabel: {
    fontSize: 15,
  },
});

// ─── Premium Upsell Styles ─────────────────────────────────────────────────────

const upStyles = StyleSheet.create({
  crownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900' as const,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
    paddingHorizontal: 8,
    fontWeight: '500' as const,
  },
  featureCard: {
    width: '100%',
    borderRadius: 22,
    padding: 20,
    gap: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureTitle: { fontSize: 15, fontWeight: '700' as const, marginBottom: 2 },
  featureDesc: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  ctaBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  ctaText: { fontSize: 17, fontWeight: '800' as const, color: '#000' },
  trust: { fontSize: 13, textAlign: 'center', fontWeight: '500' as const },
});

// ─── Plan Selection Styles ────────────────────────────────────────────────────

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
  heroNum: {
    fontSize: 78,
    fontWeight: '900' as const,
    lineHeight: 82,
    letterSpacing: -4,
  },
  heroNumRight: { marginBottom: 12 },
  heroNumUnit: {
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
  msgText: { fontSize: 14, fontWeight: '700' as const },
  scroll: { padding: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
    marginTop: 8,
    letterSpacing: -0.4,
  },
  dateRow: { flexDirection: 'row', gap: 14, marginBottom: 30 },
  dateCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  dateCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 3,
  },
  dateCardSub: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.75)',
  },
  dateCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

// ─── Plan Card Styles ─────────────────────────────────────────────────────────

const pcStyles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardSuggested: {
    shadowColor: '#6366F1',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  top: { padding: 22, paddingBottom: 18 },
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
  recText: { fontSize: 12, fontWeight: '700' as const, color: '#FFF' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  emojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 21,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 19 },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: { padding: 18, paddingTop: 16 },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, fontWeight: '500' as const },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  goalText: { fontSize: 13, fontWeight: '700' as const },
});

const pillStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.2 },
});

// ─── Today Tab Styles ─────────────────────────────────────────────────────────

const tStyles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateText: { fontSize: 14, fontWeight: '500' as const },
  dayBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  dayBadgeText: { fontSize: 12, fontWeight: '700' as const },
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
  celebration: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
    margin: -20,
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
  overallTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.3 },
  overallSub: { fontSize: 13, marginTop: 3, fontWeight: '500' as const },
  pctCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pctText: { fontSize: 15, fontWeight: '800' as const, color: '#FFF' },
  barBg: { height: 12, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.4 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  markAllText: { fontSize: 13, fontWeight: '700' as const },
});

// ─── Task Card Styles ─────────────────────────────────────────────────────────

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
  codeChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  codeText: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 0.6 },
  body: { flex: 1, padding: 16, paddingLeft: 14 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: { fontSize: 15, fontWeight: '700' as const, flex: 1, marginRight: 10, letterSpacing: -0.3 },
  desc: { fontSize: 13, marginBottom: 10, lineHeight: 18, fontWeight: '400' as const },
  barBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  barFill: { height: '100%', borderRadius: 4 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: { fontSize: 12, fontWeight: '500' as const },
  tapHint: { fontSize: 12, fontWeight: '600' as const, marginLeft: 4 },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkBtnText: { fontSize: 13, fontWeight: '700' as const },
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
  goBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#FFF' },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '800' as const },
});

// ─── Progress Tab Styles ──────────────────────────────────────────────────────

const pStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  streakCard: {
    borderRadius: 22,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  streakIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNum: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.3 },
  streakSub: { fontSize: 12, marginTop: 3, fontWeight: '500' as const, lineHeight: 17 },
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
  weekCol: { alignItems: 'center', gap: 7, flex: 1 },
  weekBar: { width: 28, minHeight: 6, borderRadius: 6 },
  weekCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel: { fontSize: 12 },
  weekDot: { width: 6, height: 6, borderRadius: 3 },
  weekNote: { fontSize: 13, textAlign: 'center', marginBottom: 24, fontWeight: '500' as const },
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
  planDay: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.3 },
  planNote: { fontSize: 13, marginTop: 3, fontWeight: '500' as const },
  planPct: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  planPctText: { fontSize: 18, fontWeight: '800' as const },
  planBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  planBarFill: { height: '100%', borderRadius: 6 },
  planMarkers: {
    position: 'relative',
    height: 16,
  },
  markerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 6,
    marginLeft: -2,
  },
});

// ─── Stat Tile Styles ─────────────────────────────────────────────────────────

const stStyles = StyleSheet.create({
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
  val: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  lbl: { fontSize: 11, marginTop: 4, textAlign: 'center', fontWeight: '600' as const },
});
