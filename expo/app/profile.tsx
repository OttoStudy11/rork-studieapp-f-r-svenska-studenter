import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  StatusBar,
  Alert as RNAlert,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import {
  Edit3,
  Settings,
  BookOpen,
  Clock,
  Award,
  Star,
  Flame,
  X,
  ChevronRight,
  User,
  Mail,
  Zap,
  Sparkles,
  ArrowLeft,
  Crown,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Layers,
  Lightbulb,
  Bell,
  Palette,
  HelpCircle,
  MessageCircle,
  RefreshCw,
  LogOut,
  Check,
  Calendar,
  ChevronDown,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FadeInView, SlideInView, AnimatedPressable, PulseView } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';
import type { AvatarConfig } from '@/constants/avatar-config';
import AvatarBuilder from '@/components/AvatarBuilder';
import { TIER_COLORS, RARITY_COLORS, formatXp } from '@/constants/gamification';


// ============================================================================
// CONFIGURATION
// ============================================================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_RADIUS = 24;

// Warm Scandinavian light palette — green primary (matches app + premium page)
const PALETTE = {
  bgWarm: '#FAFAF8',
  bgSoft: '#F7F7F5',
  white: '#FFFFFF',
  green: '#10B981',
  greenDark: '#059669',
  greenLight: '#34D399',
  teal: '#14B8A6',
  tealLight: '#5EEAD4',
  emerald: '#10B981',
  emeraldDark: '#059669',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  rose: '#F43F5E',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  textDark: '#1A2E25',
  textMid: '#3A4A42',
  textLight: '#6A7A72',
  textMuted: '#9AAAA2',
  borderLight: 'rgba(16, 185, 129, 0.10)',
  borderGlass: 'rgba(255, 255, 255, 0.6)',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBgLight: 'rgba(255, 255, 255, 0.55)',
} as const;

// ============================================================================
// TYPES
// ============================================================================
interface StatCardData {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  value: string;
  label: string;
  gradient: readonly [string, string];
  progress?: number;
}

interface QuickActionData {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  gradient: readonly [string, string];
  route: string;
}

interface InsightData {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  text: string;
  accent: string;
}

interface AccountAction {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  iconBg: string;
  iconColor: string;
  action: () => void;
  destructive?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function ProfileScreen() {
  const { user, courses, pomodoroSessions, updateUser } = useStudy();
  const { user: authUser, signOut } = useAuth();
  const { showSuccess } = useToast();
  const gamificationData = useGamification();
  const { isPremium, subscriptionExpiresAt, restorePurchases } = usePremium();
  const { userProgress } = useFlashcards();
  const hpContext = useHogskoleprovet();

  const {
    totalXp = 0,
    currentLevel,
    xpProgress,
    streak = 0,
    achievements = [],
    unclaimedAchievements = 0,
  } = gamificationData || {};

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    program: user?.program || '',
    purpose: user?.purpose || '',
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Floating orb animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, [orb1Anim, orb2Anim, pulseAnim]);



  const totalStudyMinutes = useMemo(
    () => pomodoroSessions.reduce((sum, s) => sum + s.duration, 0),
    [pomodoroSessions]
  );
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const sessionsCompleted = pomodoroSessions.length;

  // Flashcard stats
  const flashcardStats = useMemo(() => {
    let mastered = 0;
    let totalReviews = 0;
    let correctReviews = 0;
    userProgress.forEach((p) => {
      if (p.repetitions >= 3) mastered++;
      totalReviews += p.total_reviews;
      correctReviews += p.correct_reviews;
    });
    const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
    return { mastered, totalReviews, correctReviews, accuracy };
  }, [userProgress]);

  // HP stats
  const hpStats = useMemo(() => {
    if (!hpContext) return null;
    try {
      return hpContext.getUserStats();
    } catch {
      return null;
    }
  }, [hpContext]);

  // Longest streak: use current streak + HP longestStreak as approximation (no direct DB column)
  const longestStreak = Math.max(streak, hpStats?.longestStreak ?? 0);

  // Weekly study data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { label: string; minutes: number }[] = [];
    const now = new Date();
    const dayLabels = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayMinutes = pomodoroSessions
        .filter((s) => new Date(s.endTime).toDateString() === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);
      days.push({
        label: dayLabels[date.getDay()],
        minutes: dayMinutes,
      });
    }
    return days;
  }, [pomodoroSessions]);

  const maxWeeklyMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  // Daily consistency (which days had activity)
  const dailyConsistency = useMemo(
    () => weeklyData.map((d) => d.minutes > 0),
    [weeklyData]
  );

  // Subject breakdown (top 4 courses by time)
  const subjectBreakdown = useMemo(() => {
    const courseTimeMap: Record<string, number> = {};
    pomodoroSessions.forEach((s) => {
      if (s.courseId) {
        courseTimeMap[s.courseId] = (courseTimeMap[s.courseId] || 0) + s.duration;
      }
    });
    const sorted = Object.entries(courseTimeMap)
      .map(([courseId, minutes]) => ({
        name: courses.find((c) => c.id === courseId)?.title || 'Okänd kurs',
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 4);
    const totalMinutes = sorted.reduce((sum, s) => sum + s.minutes, 0) || 1;
    return sorted.map((s) => ({ ...s, percent: Math.round((s.minutes / totalMinutes) * 100) }));
  }, [pomodoroSessions, courses]);

  // Best study time insight
  const bestStudyTime = useMemo(() => {
    if (pomodoroSessions.length === 0) return null;
    const hourCount: Record<number, number> = {};
    pomodoroSessions.forEach((s) => {
      const hour = new Date(s.endTime).getHours();
      const bucket = Math.floor(hour / 2) * 2;
      hourCount[bucket] = (hourCount[bucket] || 0) + 1;
    });
    const bestBucket = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];
    if (!bestBucket) return null;
    const startHour = parseInt(bestBucket[0]);
    return `${startHour}:00–${startHour + 2}:00`;
  }, [pomodoroSessions]);

  // Motivational quote
  const motivationalQuote = useMemo(() => {
    if (!xpProgress) return 'Fortsätt studera för att nå dina mål!';
    const pct = xpProgress.percent;
    if (streak >= 7) return `Du är på eld! ${streak} dagar i rad — håll igång!`;
    if (pct >= 75) return `Bara ${100 - pct}% kvar till nästa nivå. Du är så nära!`;
    if (pct >= 50) return `Halvvägs till nästa nivå. Bra jobbat!`;
    if (totalXp > 0) return `Varje studiesession tar dig närmare ditt mål.`;
    return `Börja din resa idag — varje steg räknas.`;
  }, [xpProgress, streak, totalXp]);

  // ========================================================================
  // STAT CARDS DATA
  // ========================================================================
  const statCards: StatCardData[] = useMemo(() => [
    {
      icon: Clock,
      value: `${totalStudyHours}h`,
      label: 'Studietid',
      gradient: [PALETTE.green, PALETTE.greenLight] as const,
      progress: Math.min(1, totalStudyMinutes / 600),
    },
    {
      icon: Target,
      value: `${sessionsCompleted}`,
      label: 'Sessioner',
      gradient: [PALETTE.teal, PALETTE.tealLight] as const,
      progress: Math.min(1, sessionsCompleted / 50),
    },
    {
      icon: Flame,
      value: `${streak}`,
      label: 'Dagar i rad',
      gradient: [PALETTE.amber, PALETTE.amberLight] as const,
      progress: Math.min(1, streak / 30),
    },
    {
      icon: Award,
      value: `${longestStreak}`,
      label: 'Längsta streak',
      gradient: [PALETTE.amberLight, PALETTE.amber] as const,
      progress: Math.min(1, longestStreak / 30),
    },
    {
      icon: BookOpen,
      value: `${courses.length}`,
      label: 'Kurser',
      gradient: [PALETTE.indigo, PALETTE.purple] as const,
      progress: Math.min(1, courses.length / 10),
    },
    {
      icon: Layers,
      value: `${flashcardStats.mastered}`,
      label: 'Flashcards mestrade',
      gradient: [PALETTE.cyan, PALETTE.teal] as const,
      progress: Math.min(1, flashcardStats.mastered / 100),
    },
    {
      icon: BarChart3,
      value: `${flashcardStats.accuracy}%`,
      label: 'Quiz-träff',
      gradient: [PALETTE.greenDark, PALETTE.green] as const,
      progress: flashcardStats.accuracy / 100,
    },
    {
      icon: TrendingUp,
      value: hpStats?.estimatedHPScore ? `${hpStats.estimatedHPScore.toFixed(1)}` : '—',
      label: 'Est. HP-poäng',
      gradient: [PALETTE.purple, PALETTE.indigo] as const,
      progress: hpStats?.estimatedHPScore ? Math.min(1, hpStats.estimatedHPScore / 2.0) : 0,
    },
  ], [totalStudyHours, totalStudyMinutes, sessionsCompleted, streak, longestStreak, courses.length, flashcardStats, hpStats]);

  // ========================================================================
  // DERIVED DATA
  // ========================================================================

  // ========================================================================
  // QUICK ACTIONS
  // ========================================================================
  const quickActions: QuickActionData[] = [
    {
      icon: BookOpen,
      label: 'Fortsätt plugga',
      gradient: [PALETTE.green, PALETTE.greenLight] as const,
      route: ROUTES.timer,
    },
    {
      icon: Brain,
      label: 'AI Studiecoach',
      gradient: [PALETTE.teal, PALETTE.tealLight] as const,
      route: '/general-chat',
    },
    {
      icon: Calendar,
      label: 'Min studieplan',
      gradient: [PALETTE.indigo, PALETTE.purple] as const,
      route: '/hp-study-plan',
    },
    {
      icon: Layers,
      label: 'Mina flashcards',
      gradient: [PALETTE.cyan, PALETTE.teal] as const,
      route: '/smart-flashcards',
    },
    {
      icon: Target,
      label: 'Mina quiz',
      gradient: [PALETTE.amber, PALETTE.amberLight] as const,
      route: ROUTES.courseLibrary,
    },
    {
      icon: TrendingUp,
      label: 'Högskoleprovet',
      gradient: [PALETTE.greenDark, PALETTE.green] as const,
      route: ROUTES.hogskoleprovet,
    },
  ];

  // ========================================================================
  // AI INSIGHTS
  // ========================================================================
  const insights: InsightData[] = useMemo(() => {
    const list: InsightData[] = [];

    if (bestStudyTime) {
      list.push({
        icon: Clock,
        title: 'Din bästa studietid',
        text: `Du presterar bäst mellan ${bestStudyTime}. Försök planera dina viktigaste sessioner då.`,
        accent: PALETTE.green,
      });
    }

    if (flashcardStats.totalReviews > 10) {
      const improvement = flashcardStats.accuracy > 70
        ? `Din flashcard-träff är ${flashcardStats.accuracy}% — utmärkt arbete!`
        : `Din flashcard-träff är ${flashcardStats.accuracy}%. Repetera svaga kort oftare för att förbättra.`;
      list.push({
        icon: TrendingUp,
        title: 'Flashcard-utveckling',
        text: improvement,
        accent: PALETTE.teal,
      });
    }

    if (hpStats && hpStats.weakSections.length > 0) {
      list.push({
        icon: Target,
        title: 'Fokus denna vecka',
        text: `Din svagaste delprov är ${hpStats.weakSections[0]}. Lägg extra tid där för att boosta ditt HP-resultat.`,
        accent: PALETTE.amber,
      });
    }

    if (streak > 0 && streak < 3) {
      list.push({
        icon: Flame,
        title: 'Håll din streak levande',
        text: `Du är på ${streak} ${streak === 1 ? 'dag' : 'dagar'} i rad. Studera idag för att inte bryta din streak!`,
        accent: PALETTE.rose,
      });
    }

    if (list.length === 0) {
      list.push({
        icon: Sparkles,
        title: 'Kom igång',
        text: 'Starta din första studiesession idag och låt AI ge dig personliga insikter när du har mer data.',
        accent: PALETTE.green,
      });
    }

    return list.slice(0, 3);
  }, [bestStudyTime, flashcardStats, hpStats, streak]);

  // ========================================================================
  // ACCOUNT ACTIONS
  // ========================================================================
  const handleRestorePurchases = useCallback(async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      await restorePurchases();
    } finally {
      setIsRestoring(false);
    }
  }, [isRestoring, restorePurchases]);

  const handleSignOut = useCallback(() => {
    RNAlert.alert(
      'Logga ut?',
      'Är du säker på att du vill logga ut från Studiestugan?',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Logga ut', style: 'destructive', onPress: () => signOut() },
      ]
    );
  }, [signOut]);

  const accountActions: AccountAction[] = [
    {
      icon: Bell,
      label: 'Notifikationer',
      iconBg: PALETTE.amber + '15',
      iconColor: PALETTE.amber,
      action: () => router.push(ROUTES.settings),
    },
    {
      icon: Palette,
      label: 'Utseende',
      iconBg: PALETTE.purple + '15',
      iconColor: PALETTE.purple,
      action: () => router.push(ROUTES.settings),
    },
    {
      icon: HelpCircle,
      label: 'Hjälp',
      iconBg: PALETTE.cyan + '15',
      iconColor: PALETTE.cyan,
      action: () => router.push(ROUTES.settings),
    },
    {
      icon: MessageCircle,
      label: 'Kontakt',
      iconBg: PALETTE.green + '15',
      iconColor: PALETTE.green,
      action: () => router.push(ROUTES.settings),
    },
    {
      icon: RefreshCw,
      label: isRestoring ? 'Återställer...' : 'Återställ köp',
      iconBg: PALETTE.indigo + '15',
      iconColor: PALETTE.indigo,
      action: handleRestorePurchases,
    },
    {
      icon: LogOut,
      label: 'Logga ut',
      iconBg: PALETTE.rose + '15',
      iconColor: PALETTE.rose,
      action: handleSignOut,
      destructive: true,
    },
  ];

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSaveProfile = async () => {
    try {
      await updateUser({
        name: editForm.name,
        program: editForm.program,
        purpose: editForm.purpose,
      });
      setShowEditModal(false);
      RNAlert.alert('Profil uppdaterad! ✅');
    } catch {
      RNAlert.alert('Fel', 'Kunde inte uppdatera profil');
    }
  };

  const handleSaveAvatar = async (config: AvatarConfig & { emoji?: string }) => {
    try {
      await updateUser({ avatar: config as AvatarConfig });
      setShowAvatarModal(false);
      showSuccess('Avatar uppdaterad! ✅');
    } catch {
      showSuccess('Kunde inte uppdatera avatar');
    }
  };

  // ========================================================================
  // PROGRESS RING COMPONENT
  // ========================================================================
  const ProgressRing = useCallback(({ progress, size, stroke, color }: { progress: number; size: number; stroke: number; color: string }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));
    return (
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <View style={[styles.ringTrack, { width: size, height: size, borderRadius: size / 2, borderWidth: stroke }]} />
        <View
          style={[
            styles.ringProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: color,
              borderTopColor: color,
              borderRightColor: color,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        <View style={styles.ringInner} />
      </View>
    );
  }, []);

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Profil', headerShown: false }} />
        <View style={styles.loadingContainer}>
          <PulseView pulseScale={1.1} duration={1200}>
            <View style={styles.loadingIconCircle}>
              <User size={40} color={PALETTE.green} />
            </View>
          </PulseView>
          <Text style={styles.loadingText}>Laddar din profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================================================
  // ORB ANIMATIONS
  // ========================================================================
  const orb1TranslateY = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
  const orb2TranslateY = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  // ========================================================================
  // RENEWAL DATE FORMAT
  // ========================================================================
  const renewalDate = useMemo(() => {
    if (!subscriptionExpiresAt) return null;
    return new Date(subscriptionExpiresAt).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [subscriptionExpiresAt]);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Min Profil',
          headerShown: false,
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor={PALETTE.bgWarm} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ================================================================
            SECTION 1: HERO
        ================================================================= */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[PALETTE.bgWarm, '#E8F6F0', PALETTE.bgSoft]}
            style={styles.heroBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Floating orbs */}
          <Animated.View
            style={[styles.heroOrb, styles.heroOrb1, { transform: [{ translateY: orb1TranslateY }] }]}
          />
          <Animated.View
            style={[styles.heroOrb, styles.heroOrb2, { transform: [{ translateY: orb2TranslateY }] }]}
          />

          {/* Back button */}
          <TouchableOpacity
            style={styles.heroBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <BlurView intensity={40} tint="light" style={styles.heroBackBlur}>
              <ArrowLeft size={20} color={PALETTE.textDark} />
            </BlurView>
          </TouchableOpacity>

          {/* Edit button */}
          <TouchableOpacity
            style={styles.heroEditBtn}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            <BlurView intensity={40} tint="light" style={styles.heroBackBlur}>
              <Edit3 size={18} color={PALETTE.textDark} />
            </BlurView>
          </TouchableOpacity>

          {/* Avatar */}
          <FadeInView delay={100}>
            <TouchableOpacity
              style={styles.heroAvatarWrap}
              onPress={() => setShowAvatarModal(true)}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.heroAvatarCircle}>
                  {user.avatar ? (
                    <CharacterAvatar config={user.avatar} size={110} showBorder />
                  ) : (
                    <View style={styles.heroAvatarPlaceholder}>
                      <User size={50} color={PALETTE.white} />
                    </View>
                  )}
                </View>
              </Animated.View>
              <View style={styles.heroAvatarBadge}>
                <Sparkles size={14} color={PALETTE.white} />
              </View>
            </TouchableOpacity>
          </FadeInView>

          {/* Name + level */}
          <FadeInView delay={200}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName} numberOfLines={1}>{user.name}</Text>
              {isPremium && (
                <View style={styles.heroPremiumBadge}>
                  <Crown size={14} color={PALETTE.white} />
                  <Text style={styles.heroPremiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
          </FadeInView>

          {/* Program tag */}
          {user.program && (
            <FadeInView delay={250}>
              <View style={styles.heroProgramTag}>
                <Text style={styles.heroProgramText} numberOfLines={1}>
                  {user.program}
                  {user.studyLevel === 'gymnasie' && user.gymnasiumGrade ? ` • År ${user.gymnasiumGrade}` : ''}
                  {user.studyLevel === 'högskola' && user.universityYear ? ` • Termin ${user.universityYear}` : ''}
                </Text>
              </View>
            </FadeInView>
          )}

          {/* XP + Streak pills */}
          <SlideInView direction="up" delay={300}>
            <View style={styles.heroPillsRow}>
              {currentLevel && (
                <View style={styles.heroPill}>
                  <View style={[styles.heroPillIcon, { backgroundColor: (currentLevel.tier ? TIER_COLORS[currentLevel.tier] : PALETTE.green) + '20' }]}>
                    <Zap size={14} color={currentLevel.tier ? TIER_COLORS[currentLevel.tier] : PALETTE.green} />
                  </View>
                  <Text style={styles.heroPillText}>Nivå {currentLevel.level}</Text>
                </View>
              )}
              <View style={styles.heroPill}>
                <View style={[styles.heroPillIcon, { backgroundColor: PALETTE.amber + '20' }]}>
                  <Flame size={14} color={PALETTE.amber} />
                </View>
                <Text style={styles.heroPillText}>{streak} dagar</Text>
              </View>
              <View style={styles.heroPill}>
                <View style={[styles.heroPillIcon, { backgroundColor: PALETTE.green + '20' }]}>
                  <Star size={14} color={PALETTE.green} />
                </View>
                <Text style={styles.heroPillText}>{formatXp(totalXp)} XP</Text>
              </View>
            </View>
          </SlideInView>

          {/* Motivational quote */}
          <SlideInView direction="up" delay={400}>
            <View style={styles.heroQuoteCard}>
              <BlurView intensity={30} tint="light" style={styles.heroQuoteBlur}>
                <Sparkles size={16} color={PALETTE.green} />
                <Text style={styles.heroQuoteText}>{motivationalQuote}</Text>
              </BlurView>
            </View>
          </SlideInView>

          {/* XP progress bar */}
          {xpProgress && (
            <SlideInView direction="up" delay={500}>
              <View style={styles.heroXpBarWrap}>
                <View style={styles.heroXpBarHeader}>
                  <Text style={styles.heroXpLabel}>XP till nästa nivå</Text>
                  <Text style={styles.heroXpValue}>{xpProgress.current}/{xpProgress.required}</Text>
                </View>
                <View style={styles.heroXpBarTrack}>
                  <LinearGradient
                    colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.heroXpBarFill, { width: `${Math.min(100, xpProgress.percent)}%` }]}
                  />
                </View>
              </View>
            </SlideInView>
          )}
        </View>

        {/* ================================================================
            SECTION 2: STUDY PROGRESS DASHBOARD
        ================================================================= */}
        <View style={styles.sectionWrap}>
          <SlideInView direction="up" delay={0}>
            <Text style={styles.sectionHeading}>Studieframsteg</Text>
            <Text style={styles.sectionSubheading}>Din resa i siffror</Text>
          </SlideInView>

          <View style={styles.statGrid}>
            {statCards.map((stat, index) => (
              <FadeInView key={index} delay={index * 50}>
                <View style={styles.statCardGlass}>
                  <View style={styles.statCardTop}>
                    <LinearGradient
                      colors={stat.gradient as [string, string]}
                      style={styles.statIconCircleSmall}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <stat.icon size={18} color="#FFFFFF" strokeWidth={2} />
                    </LinearGradient>
                    {stat.progress !== undefined && stat.progress > 0 && (
                      <View style={styles.statMiniBar}>
                        <View style={styles.statMiniBarTrack}>
                          <View style={[styles.statMiniBarFill, { width: `${stat.progress * 100}%` }]} />
                        </View>
                      </View>
                    )}
                  </View>
                  <Text style={styles.statValueText}>{stat.value}</Text>
                  <Text style={styles.statLabelText}>{stat.label}</Text>
                </View>
              </FadeInView>
            ))}
          </View>
        </View>

        {/* ================================================================
            SECTION 3: QUICK ACTIONS
        ================================================================= */}
        <View style={styles.sectionWrap}>
          <SlideInView direction="up" delay={0}>
            <Text style={styles.sectionHeading}>Snabbåtkomst</Text>
            <Text style={styles.sectionSubheading}>Fortsätt där du slutade</Text>
          </SlideInView>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <FadeInView key={index} delay={index * 50}>
                <AnimatedPressable
                  style={styles.quickActionCard}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={action.gradient as [string, string]}
                    style={styles.quickActionIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <action.icon size={22} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                  <ChevronRight size={16} color={PALETTE.textMuted} style={styles.quickActionArrow} />
                </AnimatedPressable>
              </FadeInView>
            ))}
          </View>
        </View>

        {/* ================================================================
            SECTION 4: ACHIEVEMENTS TROPHY CABINET
        ================================================================= */}
        {achievements && achievements.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <SlideInView direction="up" delay={0}>
                <View>
                  <Text style={styles.sectionHeading}>Prestationer</Text>
                  <Text style={styles.sectionSubheading}>
                    {achievements.filter((a) => a.isUnlocked).length} upplåsta
                    {unclaimedAchievements > 0 && (
                      <Text style={{ color: PALETTE.green }}> • {unclaimedAchievements} nya</Text>
                    )}
                  </Text>
                </View>
              </SlideInView>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.achievements)}
                activeOpacity={0.7}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>Se alla</Text>
                <ChevronRight size={16} color={PALETTE.green} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.achievementsScroll}
              contentContainerStyle={styles.achievementsScrollContent}
            >
              {achievements.slice(0, 10).map((achievement, index) => {
                const isUnlocked = achievement.isUnlocked;
                const rarityColor = RARITY_COLORS[achievement.rarity] || PALETTE.green;
                return (
                  <FadeInView key={achievement.id} delay={index * 40}>
                    <View style={[
                      styles.achievementBadge,
                      !isUnlocked && styles.achievementBadgeLocked,
                      { borderColor: isUnlocked ? rarityColor + '40' : PALETTE.borderLight },
                    ]}>
                      <View style={[
                        styles.achievementIconCircle,
                        { backgroundColor: isUnlocked ? rarityColor + '15' : PALETTE.bgSoft },
                      ]}>
                        <Text style={[
                          styles.achievementEmoji,
                          !isUnlocked && { opacity: 0.3 },
                        ]}>{achievement.icon}</Text>
                      </View>
                      <Text
                        style={[styles.achievementTitle, !isUnlocked && { opacity: 0.4 }]}
                        numberOfLines={1}
                      >
                        {achievement.title}
                      </Text>
                      {!isUnlocked && (
                        <View style={styles.achievementLockIcon}>
                          <X size={10} color={PALETTE.textMuted} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                  </FadeInView>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ================================================================
            SECTION 5: STUDY STATISTICS
        ================================================================= */}
        <View style={styles.sectionWrap}>
          <SlideInView direction="up" delay={0}>
            <Text style={styles.sectionHeading}>Statistik</Text>
            <Text style={styles.sectionSubheading}>Din studieaktivitet</Text>
          </SlideInView>

          {/* Weekly study graph */}
          <SlideInView direction="up" delay={100}>
            <View style={styles.glassCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardTitle}>Senaste 7 dagarna</Text>
                <Text style={styles.statCardSubtitle}>{totalStudyMinutes} min totalt</Text>
              </View>
              <View style={styles.weeklyGraph}>
                {weeklyData.map((day, index) => {
                  const barHeight = Math.max(4, (day.minutes / maxWeeklyMinutes) * 100);
                  return (
                    <View key={index} style={styles.weeklyBarWrap}>
                      <View style={styles.weeklyBarTrack}>
                        <Animated.View
                          style={[
                            styles.weeklyBarFill,
                            {
                              height: barHeight,
                              backgroundColor: day.minutes > 0 ? PALETTE.green : PALETTE.borderLight,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.weeklyBarLabel, day.minutes > 0 && { color: PALETTE.green, fontWeight: '600' }]}>
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Daily consistency dots */}
              <View style={styles.consistencyRow}>
                <Text style={styles.consistencyLabel}>Daglig konsistens:</Text>
                <View style={styles.consistencyDots}>
                  {dailyConsistency.map((active, index) => (
                    <View
                      key={index}
                      style={[
                        styles.consistencyDot,
                        { backgroundColor: active ? PALETTE.green : PALETTE.borderLight },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </SlideInView>

          {/* Subject breakdown */}
          {subjectBreakdown.length > 0 && (
            <SlideInView direction="up" delay={150}>
              <View style={styles.glassCard}>
                <Text style={styles.statCardTitle}>Ämnesfördelning</Text>
                {subjectBreakdown.map((subject, index) => (
                  <View key={index} style={styles.subjectRow}>
                    <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                    <View style={styles.subjectBarTrack}>
                      <LinearGradient
                        colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.subjectBarFill, { width: `${subject.percent}%` }]}
                      />
                    </View>
                    <Text style={styles.subjectMinutes}>{subject.minutes} min</Text>
                  </View>
                ))}
              </View>
            </SlideInView>
          )}

          {/* Strengths & Weaknesses (HP) */}
          {hpStats && (hpStats.strongSections.length > 0 || hpStats.weakSections.length > 0) && (
            <SlideInView direction="up" delay={200}>
              <View style={styles.glassCard}>
                <Text style={styles.statCardTitle}>Styrkor & svagheter</Text>
                {hpStats.strongSections.length > 0 && (
                  <View style={styles.strengthWeakRow}>
                    <View style={styles.strengthWeakLabel}>
                      <View style={[styles.strengthWeakDot, { backgroundColor: PALETTE.green }]} />
                      <Text style={styles.strengthWeakText}>Starkast:</Text>
                    </View>
                    <View style={styles.chipRow}>
                      {hpStats.strongSections.slice(0, 3).map((section, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: PALETTE.green + '12' }]}>
                          <Text style={[styles.chipText, { color: PALETTE.greenDark }]}>{section}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {hpStats.weakSections.length > 0 && (
                  <View style={styles.strengthWeakRow}>
                    <View style={styles.strengthWeakLabel}>
                      <View style={[styles.strengthWeakDot, { backgroundColor: PALETTE.rose }]} />
                      <Text style={styles.strengthWeakText}>Svagast:</Text>
                    </View>
                    <View style={styles.chipRow}>
                      {hpStats.weakSections.slice(0, 3).map((section, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: PALETTE.rose + '12' }]}>
                          <Text style={[styles.chipText, { color: PALETTE.rose }]}>{section}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </SlideInView>
          )}
        </View>

        {/* ================================================================
            SECTION 6: PERSONAL INSIGHTS
        ================================================================= */}
        <View style={styles.sectionWrap}>
          <SlideInView direction="up" delay={0}>
            <Text style={styles.sectionHeading}>Personliga insikter</Text>
            <Text style={styles.sectionSubheading}>AI-analys av din studiemönster</Text>
          </SlideInView>

          {insights.map((insight, index) => (
            <SlideInView key={index} direction="up" delay={index * 80}>
              <View style={styles.insightCard}>
                <View style={[styles.insightAccentBar, { backgroundColor: insight.accent }]} />
                <View style={styles.insightContent}>
                  <View style={[styles.insightIconCircle, { backgroundColor: insight.accent + '15' }]}>
                    <insight.icon size={20} color={insight.accent} />
                  </View>
                  <View style={styles.insightTextWrap}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightText}>{insight.text}</Text>
                  </View>
                </View>
              </View>
            </SlideInView>
          ))}
        </View>

        {/* ================================================================
            SECTION 7: PREMIUM SECTION
        ================================================================= */}
        <View style={styles.sectionWrap}>
          {isPremium ? (
            <SlideInView direction="up" delay={0}>
              <View style={styles.premiumActiveCard}>
                <LinearGradient
                  colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumActiveHeader}
                >
                  <View style={styles.premiumActiveCrownWrap}>
                    <PulseView pulseScale={1.1} duration={2000}>
                      <Crown size={28} color={PALETTE.white} />
                    </PulseView>
                  </View>
                  <View style={styles.premiumActiveHeaderText}>
                    <Text style={styles.premiumActiveTitle}>Premium Aktiv</Text>
                    <Text style={styles.premiumActiveSubtitle}>Tack för att du stödjer Studiestugan</Text>
                  </View>
                </LinearGradient>

                <View style={styles.premiumActiveBody}>
                  {renewalDate && (
                    <View style={styles.premiumActiveRow}>
                      <Text style={styles.premiumActiveRowLabel}>Förnyelsedatum</Text>
                      <Text style={styles.premiumActiveRowValue}>{renewalDate}</Text>
                    </View>
                  )}
                  <View style={styles.premiumBenefitsList}>
                    {[
                      'Obegränsad AI-generering',
                      'Komplett Högskoleprovet-övning',
                      'Obegränsade flashcards',
                      'Avancerad statistik & analys',
                    ].map((benefit, i) => (
                      <View key={i} style={styles.premiumBenefitRow}>
                        <View style={styles.premiumBenefitCheck}>
                          <Check size={12} color={PALETTE.green} strokeWidth={3} />
                        </View>
                        <Text style={styles.premiumBenefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </SlideInView>
          ) : (
            <SlideInView direction="up" delay={0}>
              <View style={styles.premiumUpgradeCard}>
                {/* Glow */}
                <View style={styles.premiumGlowOrb} />

                <View style={styles.premiumUpgradeContent}>
                  <View style={styles.premiumUpgradeHeader}>
                    <LinearGradient
                      colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                      style={styles.premiumUpgradeCrownCircle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Crown size={24} color={PALETTE.white} />
                    </LinearGradient>
                    <View style={styles.premiumUpgradeHeaderText}>
                      <Text style={styles.premiumUpgradeTitle}>Lås upp Premium</Text>
                      <Text style={styles.premiumUpgradeSubtitle}>Maximera dina studieresultat</Text>
                    </View>
                  </View>

                  <View style={styles.premiumUpgradeBenefits}>
                    {[
                      { icon: Sparkles, text: 'Obegränsad AI' },
                      { icon: Target, text: 'Komplett HP-övning' },
                      { icon: Layers, text: 'Obegränsade flashcards' },
                      { icon: BarChart3, text: 'Avancerad statistik' },
                    ].map((benefit, i) => (
                      <View key={i} style={styles.premiumUpgradeBenefit}>
                        <View style={styles.premiumUpgradeBenefitIcon}>
                          <benefit.icon size={14} color={PALETTE.green} />
                        </View>
                        <Text style={styles.premiumUpgradeBenefitText}>{benefit.text}</Text>
                      </View>
                    ))}
                  </View>

                  <AnimatedPressable
                    style={styles.premiumUpgradeBtn}
                    onPress={() => router.push(ROUTES.premium)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                      style={styles.premiumUpgradeBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Crown size={18} color={PALETTE.white} />
                      <Text style={styles.premiumUpgradeBtnText}>Uppgradera till Premium</Text>
                    </LinearGradient>
                  </AnimatedPressable>
                </View>
              </View>
            </SlideInView>
          )}
        </View>

        {/* ================================================================
            SECTION 8: ACCOUNT (minimal, bottom)
        ================================================================= */}
        <View style={styles.sectionWrap}>
          <SlideInView direction="up" delay={0}>
            <Text style={styles.sectionHeading}>Konto</Text>
          </SlideInView>

          <View style={styles.accountCard}>
            {accountActions.map((action, index) => (
              <View key={index}>
                <AnimatedPressable
                  style={styles.accountActionItem}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accountActionIcon, { backgroundColor: action.iconBg }]}>
                    <action.icon size={18} color={action.iconColor} />
                  </View>
                  <Text style={[
                    styles.accountActionLabel,
                    action.destructive && { color: PALETTE.rose },
                  ]}>
                    {action.label}
                  </Text>
                  <ChevronRight size={18} color={PALETTE.textMuted} />
                </AnimatedPressable>
                {index < accountActions.length - 1 && (
                  <View style={styles.accountDivider} />
                )}
              </View>
            ))}
          </View>

          {/* Full settings link */}
          <AnimatedPressable
            style={styles.fullSettingsBtn}
            onPress={() => router.push(ROUTES.settings)}
            activeOpacity={0.85}
          >
            <Settings size={18} color={PALETTE.textLight} />
            <Text style={styles.fullSettingsText}>Alla inställningar</Text>
            <ChevronRight size={16} color={PALETTE.textMuted} />
          </AnimatedPressable>

          {/* Footer */}
          <View style={styles.footerWrap}>
            <Text style={styles.footerText}>Studiestugan</Text>
            <Text style={styles.footerVersion}>v1.0.0</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ================================================================
          EDIT PROFILE MODAL
      ================================================================ */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera profil</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={PALETTE.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Namn</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Ditt namn"
                placeholderTextColor={PALETTE.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Program / Inriktning</Text>
              <TextInput
                style={styles.input}
                value={editForm.program}
                onChangeText={(text) => setEditForm({ ...editForm, program: text })}
                placeholder="T.ex. Naturvetenskapsprogrammet"
                placeholderTextColor={PALETTE.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mål och syfte</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.purpose}
                onChangeText={(text) => setEditForm({ ...editForm, purpose: text })}
                placeholder="Vad vill du uppnå med dina studier?"
                placeholderTextColor={PALETTE.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <LinearGradient
                colors={[PALETTE.green, PALETTE.teal] as [string, string]}
                style={styles.saveBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>Spara</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Avatar Builder Modal */}
      <Modal visible={showAvatarModal} animationType="slide" presentationStyle="fullScreen">
        <AvatarBuilder
          initialConfig={user?.avatar}
          onSave={handleSaveAvatar}
          onCancel={() => setShowAvatarModal(false)}
        />
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgWarm,
  },

  // --- Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.bgWarm,
  },
  loadingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: PALETTE.textLight,
    fontWeight: '500',
  },

  // --- Scroll ---
  scrollContent: {
    paddingBottom: 40,
  },

  // --- Hero ---
  heroSection: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOrb: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.12,
  },
  heroOrb1: {
    width: 200,
    height: 200,
    backgroundColor: PALETTE.green,
    top: -40,
    right: -60,
  },
  heroOrb2: {
    width: 180,
    height: 180,
    backgroundColor: PALETTE.teal,
    bottom: -20,
    left: -70,
  },
  heroBackBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  heroEditBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
  },
  heroBackBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroAvatarWrap: {
    marginBottom: 16,
  },
  heroAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: PALETTE.white,
  },
  heroAvatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: PALETTE.green + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: PALETTE.white,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: PALETTE.textDark,
    letterSpacing: -0.5,
  },
  heroPremiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroPremiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.white,
    letterSpacing: 0.5,
  },
  heroProgramTag: {
    backgroundColor: PALETTE.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroProgramText: {
    fontSize: 13,
    color: PALETTE.textMid,
    fontWeight: '600',
  },
  heroPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroPillIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.textDark,
  },
  heroQuoteCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroQuoteBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
  },
  heroQuoteText: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.textMid,
    fontWeight: '500',
    lineHeight: 21,
  },
  heroXpBarWrap: {
    width: '100%',
  },
  heroXpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroXpLabel: {
    fontSize: 13,
    color: PALETTE.textLight,
    fontWeight: '600',
  },
  heroXpValue: {
    fontSize: 13,
    color: PALETTE.green,
    fontWeight: '700',
  },
  heroXpBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden',
  },
  heroXpBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // --- Sections ---
  sectionWrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.textDark,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 14,
    color: PALETTE.textLight,
    fontWeight: '500',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.green,
  },

  // --- Stat Grid ---
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardGlass: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIconCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statMiniBar: {
    flex: 1,
    marginLeft: 12,
    marginTop: 16,
  },
  statMiniBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden',
  },
  statMiniBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PALETTE.green,
  },
  statValueText: {
    fontSize: 26,
    fontWeight: '800',
    color: PALETTE.textDark,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabelText: {
    fontSize: 13,
    color: PALETTE.textLight,
    fontWeight: '500',
  },

  // --- Quick Actions ---
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  quickActionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.textDark,
  },
  quickActionArrow: {
    marginLeft: 'auto',
  },

  // --- Achievements ---
  achievementsScroll: {
    marginHorizontal: -20,
  },
  achievementsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 90,
    backgroundColor: PALETTE.white,
    position: 'relative',
  },
  achievementBadgeLocked: {
    backgroundColor: PALETTE.bgSoft,
  },
  achievementIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: PALETTE.textMid,
    textAlign: 'center',
    maxWidth: 80,
  },
  achievementLockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
  },

  // --- Glass Card (generic) ---
  glassCard: {
    backgroundColor: PALETTE.white,
    borderRadius: CARD_RADIUS,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.textDark,
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 13,
    color: PALETTE.textLight,
    fontWeight: '500',
  },

  // --- Weekly Graph ---
  weeklyGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  weeklyBarWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  weeklyBarTrack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  weeklyBarFill: {
    width: 20,
    borderRadius: 6,
  },
  weeklyBarLabel: {
    fontSize: 11,
    color: PALETTE.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },

  // --- Consistency ---
  consistencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: PALETTE.borderLight,
  },
  consistencyLabel: {
    fontSize: 13,
    color: PALETTE.textLight,
    fontWeight: '600',
  },
  consistencyDots: {
    flexDirection: 'row',
    gap: 6,
  },
  consistencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // --- Subject Breakdown ---
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  subjectName: {
    fontSize: 13,
    color: PALETTE.textMid,
    fontWeight: '600',
    width: 90,
  },
  subjectBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden',
  },
  subjectBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  subjectMinutes: {
    fontSize: 12,
    color: PALETTE.textLight,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },

  // --- Strengths & Weaknesses ---
  strengthWeakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  strengthWeakLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  strengthWeakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthWeakText: {
    fontSize: 13,
    color: PALETTE.textMid,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // --- Insights ---
  insightCard: {
    flexDirection: 'row',
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  insightAccentBar: {
    width: 4,
  },
  insightContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  insightIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.textDark,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: PALETTE.textMid,
    lineHeight: 20,
  },

  // --- Premium Active ---
  premiumActiveCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    backgroundColor: PALETTE.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  premiumActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  premiumActiveCrownWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumActiveHeaderText: {
    flex: 1,
  },
  premiumActiveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.white,
    marginBottom: 2,
  },
  premiumActiveSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  premiumActiveBody: {
    padding: 20,
  },
  premiumActiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderLight,
  },
  premiumActiveRowLabel: {
    fontSize: 14,
    color: PALETTE.textLight,
    fontWeight: '600',
  },
  premiumActiveRowValue: {
    fontSize: 14,
    color: PALETTE.textDark,
    fontWeight: '700',
  },
  premiumBenefitsList: {
    gap: 10,
  },
  premiumBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumBenefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PALETTE.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBenefitText: {
    fontSize: 14,
    color: PALETTE.textMid,
    fontWeight: '500',
  },

  // --- Premium Upgrade ---
  premiumUpgradeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: PALETTE.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
  },
  premiumGlowOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: PALETTE.green,
    opacity: 0.08,
  },
  premiumUpgradeContent: {
    padding: 24,
  },
  premiumUpgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  premiumUpgradeCrownCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumUpgradeHeaderText: {
    flex: 1,
  },
  premiumUpgradeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.textDark,
    marginBottom: 2,
  },
  premiumUpgradeSubtitle: {
    fontSize: 14,
    color: PALETTE.textLight,
    fontWeight: '500',
  },
  premiumUpgradeBenefits: {
    gap: 10,
    marginBottom: 20,
  },
  premiumUpgradeBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumUpgradeBenefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumUpgradeBenefitText: {
    fontSize: 14,
    color: PALETTE.textMid,
    fontWeight: '600',
  },
  premiumUpgradeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumUpgradeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  premiumUpgradeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.white,
  },

  // --- Account ---
  accountCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  accountActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  accountActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountActionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: PALETTE.textDark,
  },
  accountDivider: {
    height: 1,
    marginLeft: 68,
    backgroundColor: PALETTE.borderLight,
  },
  fullSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
  },
  fullSettingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.textLight,
  },

  // --- Footer ---
  footerWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: PALETTE.textMuted,
    fontWeight: '600',
  },
  footerVersion: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontWeight: '400',
  },

  // --- Modal ---
  modalContainer: {
    flex: 1,
    backgroundColor: PALETTE.bgWarm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderLight,
    backgroundColor: PALETTE.white,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.textDark,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: PALETTE.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: PALETTE.textDark,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: PALETTE.white,
    borderTopWidth: 1,
    borderTopColor: PALETTE.borderLight,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: PALETTE.bgSoft,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.textLight,
  },
  saveButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.white,
  },

  // --- Progress Ring ---
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringTrack: {
    borderColor: PALETTE.borderLight,
    position: 'absolute',
  },
  ringProgress: {
    borderStyle: 'solid',
    position: 'absolute',
  },
  ringInner: {
    position: 'absolute',
  },
});

// Need to re-declare PALETTE for styles
// (styles are defined at module level, PALETTE is already in scope)
