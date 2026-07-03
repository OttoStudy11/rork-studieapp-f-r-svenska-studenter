import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useStudy } from '@/contexts/StudyContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { usePoints } from '@/contexts/PointsContext';
import { useGamification, TIER_COLORS } from '@/contexts/GamificationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams } from '@/contexts/ExamContext';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { Image } from 'expo-image';
import {
  BookOpen,
  Clock,
  Target,
  Plus,
  Star,
  Crown,
  User,
  TrendingUp,
  TrendingDown,
  Calendar,
  Flame,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Zap,
  FileText,
  Sparkles,
  Brain,
  Layers,
  Lightbulb,
  Check,
  GraduationCap,
  PenTool,
  BarChart3,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import { FadeInView, SlideInView } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// CONFIGURATION — Warm Scandinavian light palette (matches profile + premium)
// ============================================================================
const PALETTE = {
  bgWarm: '#FAFAF8',
  bgSoft: '#F7F7F5',
  white: '#FFFFFF',
  green: '#10B981',
  greenDark: '#059669',
  greenLight: '#34D399',
  teal: '#14B8A6',
  emerald: '#10B981',
  emeraldDark: '#059669',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  rose: '#F43F5E',
  cyan: '#06B6D4',
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
// SKELETON
// ============================================================================
const SkeletonBox = ({
  width: w,
  height: h,
  style,
  borderRadius = 12,
  color,
}: {
  width: number | string;
  height: number;
  style?: any;
  borderRadius?: number;
  color?: string;
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.55,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: w as any,
          height: h,
          borderRadius,
          backgroundColor: color || PALETTE.borderLight,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

const HomeScreenSkeleton = () => {
  return (
    <View style={[styles.container, { backgroundColor: PALETTE.bgWarm }]}>
      <StatusBar barStyle="dark-content" backgroundColor={PALETTE.bgWarm} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Skeleton */}
        <View style={styles.heroSection}>
          <View style={styles.skeletonHeroTop}>
            <View style={{ flex: 1 }}>
              <SkeletonBox width={180} height={28} style={{ marginBottom: 8 }} />
              <SkeletonBox width={140} height={18} />
            </View>
            <SkeletonBox width={48} height={48} borderRadius={24} />
          </View>
          <SkeletonBox width="100%" height={180} borderRadius={24} style={{ marginTop: 20 }} />
        </View>

        {/* Stats Skeleton */}
        <View style={styles.statsRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox
              key={i}
              width={(width - 72) / 3}
              height={100}
              borderRadius={20}
              style={{ flex: 1 }}
            />
          ))}
        </View>

        {/* Section Skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={160} height={24} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={120} borderRadius={24} style={{ marginBottom: 12 }} />
          <SkeletonBox width="100%" height={120} borderRadius={24} />
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomeScreen() {
  const { user, courses, pomodoroSessions, isLoading } = useStudy();
  const { currentStreak } = useAchievements();
  const { totalPoints } = usePoints();
  const { currentLevel, xpProgress, totalXp } = useGamification();
  const { isPremium, isDemoMode, canAddCourse, showPremiumModal } = usePremium();
  const { theme, isDark } = useTheme();
  const { upcomingExams } = useExams();
  const { userProgress } = useFlashcards();
  const hpContext = useHogskoleprovet();

  const [examsExpanded, setExamsExpanded] = useState(false);

  const handleAddCourse = () => {
    if (!canAddCourse(courses.length)) {
      showPremiumModal('Obegränsat antal kurser');
      return;
    }
    router.push(ROUTES.courses);
  };

  // --- Animations ---
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const orb1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    const orb2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    );
    orb1Loop.start();
    orb2Loop.start();
    pulseLoop.start();
    return () => {
      orb1Loop.stop();
      orb2Loop.stop();
      pulseLoop.stop();
    };
  }, [orb1Anim, orb2Anim, pulseAnim]);

  // --- Derived data ---
  const activeCourses = courses.filter((c) => c.isActive);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return pomodoroSessions.filter((s) => new Date(s.endTime).toDateString() === today);
  }, [pomodoroSessions]);

  const weekSessions = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return pomodoroSessions.filter((s) => new Date(s.endTime).getTime() > weekAgo);
  }, [pomodoroSessions]);

  const weekStudyMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyMinutes = pomodoroSessions.reduce((sum, s) => sum + s.duration, 0);

  const averageProgress =
    courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

  // Flashcards mastered (repetitions >= 3)
  const flashcardsMastered = useMemo(() => {
    let count = 0;
    userProgress.forEach((p) => {
      if (p.repetitions >= 3) count++;
    });
    return count;
  }, [userProgress]);

  // HP stats
  const hpStats = hpContext?.getUserStats();
  const hpReadiness = hpStats?.estimatedHPScore ?? 0;
  const hpTotalAttempts = hpStats?.totalAttempts ?? 0;
  const hpSectionStats = hpStats?.sectionStats ?? {};

  // Accuracy from HP attempts
  const accuracy = hpTotalAttempts > 0
    ? Math.round(hpStats?.averageScore ?? 0)
    : Math.round(averageProgress);

  // Daily goal
  const dailyGoal = 3;
  const dailyProgress = Math.min(100, (todaySessions.length / dailyGoal) * 100);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: dailyProgress / 100,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [dailyProgress, progressAnim]);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return 'God natt';
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God dag';
    return 'God kväll';
  }, []);

  // Trend (compare this week vs last week — simplified)
  const trendUp = weekSessions.length >= pomodoroSessions.length - weekSessions.length;

  // Study tips (rotating daily)
  const dailyTipIndex = new Date().getDate() % 5;
  const studyTips: { title: string; text: string; icon: string }[] = [
    {
      title: 'Pomodoro-tekniken',
      text: 'Studera i 25-minuters fokuspass med 5 minuters pauser för maximal koncentration.',
      icon: '🍅',
    },
    {
      title: 'Aktiv repetition',
      text: 'Testa dig själv istället för att bara läsa om materialet — det förstärker minnet.',
      icon: '🧠',
    },
    {
      title: 'Spaced repetition',
      text: 'Repetera material med ökande intervaller för att minnet ska fästa långsiktigt.',
      icon: '📅',
    },
    {
      title: 'Feynman-tekniken',
      text: 'Förklara komplexa koncept med enkla ord — om du kan, förstår du dem.',
      icon: '👨‍🏫',
    },
    {
      title: 'Chunking',
      text: 'Dela upp stor mängd information i mindre, hanterbara delar för effektiv inlärning.',
      icon: '🧩',
    },
  ];

  // --- Loading ---
  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: PALETTE.bgWarm, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: PALETTE.textMid }}>Ingen användardata tillgänglig</Text>
      </View>
    );
  }

  // --- HP section progress helpers ---
  const getHPSectionProgress = (sectionCodes: string[]) => {
    const relevant = sectionCodes
      .map((code) => hpSectionStats[code])
      .filter(Boolean);
    if (relevant.length === 0) return 0;
    return Math.round(relevant.reduce((sum, s) => sum + s.averageScore, 0) / relevant.length);
  };

  const verbalProgress = getHPSectionProgress(['ORD', 'LAS', 'ELF', 'MEK']);
  const quantProgress = getHPSectionProgress(['XYZ', 'KVA', 'NOG', 'DTK']);

  // Course data — merge real courses with the four premium paths
  const premiumCourseCards = [
    {
      id: 'hp',
      title: 'Högskoleprovet',
      subtitle: 'Full HP-preparation',
      progress: hpTotalAttempts > 0 ? Math.round((hpStats?.averageScore ?? 0)) : 0,
      route: ROUTES.hogskoleprovetMain,
      icon: FileText,
      gradient: [PALETTE.green, PALETTE.greenDark] as readonly [string, string],
      lastStudied: hpTotalAttempts > 0 ? `${hpTotalAttempts} försök` : 'Ej påbörjad',
    },
    {
      id: 'vocab',
      title: 'Ordförråd',
      subtitle: 'Flashcards & vokabulär',
      progress: flashcardsMastered > 0 ? Math.min(100, Math.round((flashcardsMastered / 50) * 100)) : 0,
      route: '/smart-flashcards' as never,
      icon: BookOpen,
      gradient: [PALETTE.teal, PALETTE.green] as readonly [string, string],
      lastStudied: flashcardsMastered > 0 ? `${flashcardsMastered} kort` : 'Ej påbörjad',
    },
    {
      id: 'math',
      title: 'Matematik',
      subtitle: 'AI mattehjälp',
      progress: 0,
      route: ROUTES.mathChat,
      icon: Brain,
      gradient: [PALETTE.cyan, PALETTE.teal] as readonly [string, string],
      lastStudied: 'AI-tutor',
    },
    {
      id: 'ai',
      title: 'AI Studievägledning',
      subtitle: 'Personlig AI-coach',
      progress: 0,
      route: ROUTES.generalChat,
      icon: Sparkles,
      gradient: [PALETTE.greenLight, PALETTE.teal] as readonly [string, string],
      lastStudied: 'Alltid tillgänglig',
    },
  ];

  const orb1Y = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const orb2Y = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.bgWarm }]}>
      <StatusBar barStyle="dark-content" backgroundColor={PALETTE.bgWarm} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* ================================================================ */}
        {/* 1. HERO DASHBOARD                                                */}
        {/* ================================================================ */}
        <View style={styles.heroSection}>
          {/* Floating gradient orbs */}
          <Animated.View
            style={[
              styles.orb1,
              {
                transform: [{ translateY: orb1Y }, { scale: orb1Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.orb2,
              {
                transform: [{ translateY: orb2Y }, { scale: orb2Scale }],
              },
            ]}
          />

          {/* Top bar */}
          <View style={styles.heroTopBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]}</Text>
              <Text style={styles.greetingSub}>Redo att studera smartare idag?</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => router.push(ROUTES.profile)}
              activeOpacity={0.85}
            >
              {user.avatar ? (
                <CharacterAvatar config={user.avatar} size={48} />
              ) : (
                <View style={styles.avatarFallback}>
                  <User size={22} color={PALETTE.green} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Hero glass card */}
          <SlideInView direction="up" delay={50} duration={400}>
            <View style={styles.heroCard}>
              <BlurView intensity={60} tint="light" style={styles.heroBlur}>
                <View style={styles.heroCardContent}>
                  {/* Badges row */}
                  <View style={styles.heroBadges}>
                    <View style={styles.heroBadge}>
                      <Flame size={14} color={PALETTE.green} />
                      <Text style={styles.heroBadgeText}>{currentStreak} dagar</Text>
                    </View>
                    <View style={styles.heroBadge}>
                      <Zap size={14} color={PALETTE.amber} />
                      <Text style={styles.heroBadgeText}>Nivå {currentLevel?.level ?? 1}</Text>
                    </View>
                    {isPremium && (
                      <View style={[styles.heroBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                        <Crown size={14} color={PALETTE.amber} />
                        <Text style={[styles.heroBadgeText, { color: PALETTE.amber }]}>Premium</Text>
                      </View>
                    )}
                  </View>

                  {/* Daily goal */}
                  <Text style={styles.heroGoalTitle}>Dagens studiemål</Text>
                  <View style={styles.heroGoalRow}>
                    <Text style={styles.heroGoalNumber}>{todaySessions.length}</Text>
                    <Text style={styles.heroGoalDivider}>/ {dailyGoal} sessioner</Text>
                  </View>
                  <View style={styles.heroProgressBar}>
                    <Animated.View
                      style={[
                        styles.heroProgressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>

                  {/* Motivational insight */}
                  <Text style={styles.heroInsight}>
                    {dailyProgress >= 100
                      ? '🎯 Dagens mål klart! Du är på väg att nå din veckomålsstämpel.'
                      : `Du är ${Math.round(dailyProgress)}% närmare dagens mål. Fortsätt!`}
                  </Text>

                  {/* CTA */}
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                    <TouchableOpacity
                      style={styles.heroCta}
                      onPress={() => router.push(ROUTES.timer)}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[PALETTE.green, PALETTE.greenDark] as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCtaGradient}
                      >
                        <Clock size={20} color="white" />
                        <Text style={styles.heroCtaText}>Fortsätt studera</Text>
                        <ArrowRight size={20} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </BlurView>
            </View>
          </SlideInView>

          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Text style={styles.demoText}>🎯 Demo-läge aktivt</Text>
            </View>
          )}
        </View>

        {/* ================================================================ */}
        {/* 2. QUICK STATS                                                    */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={100} duration={400}>
          <View style={styles.statsRow}>
            <StatMiniCard
              icon={Clock}
              value={`${(weekStudyMinutes / 60).toFixed(1)}h`}
              label="Denna vecka"
              color={PALETTE.green}
            />
            <StatMiniCard
              icon={Target}
              value={`${accuracy}%`}
              label="Precision"
              color={PALETTE.teal}
              trend={trendUp ? 'up' : 'down'}
            />
            <StatMiniCard
              icon={Check}
              value={`${pomodoroSessions.length}`}
              label="Sessioner"
              color={PALETTE.cyan}
            />
          </View>
        </SlideInView>

        <SlideInView direction="up" delay={150} duration={400}>
          <View style={styles.statsRow}>
            <StatMiniCard
              icon={BookOpen}
              value={`${flashcardsMastered}`}
              label="Flashcards"
              color={PALETTE.greenDark}
            />
            <StatMiniCard
              icon={GraduationCap}
              value={hpReadiness > 0 ? `${hpReadiness}` : '—'}
              label="HP-poäng"
              color={PALETTE.amber}
            />
            <StatMiniCard
              icon={trendUp ? TrendingUp : TrendingDown}
              value={trendUp ? '↑' : '↓'}
              label="Trend"
              color={trendUp ? PALETTE.green : PALETTE.rose}
            />
          </View>
        </SlideInView>

        {/* ================================================================ */}
        {/* 3. COURSES                                                        */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={200} duration={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <GraduationCap size={22} color={PALETTE.green} />
                <Text style={styles.sectionTitle}>Dina kurser</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(ROUTES.courses)}>
                <Text style={styles.seeAllText}>Se alla →</Text>
              </TouchableOpacity>
            </View>

            {/* Premium course cards */}
            {premiumCourseCards.map((course, index) => (
              <FadeInView key={course.id} delay={250 + index * 60} duration={300}>
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={() => router.push(course.route as never)}
                  activeOpacity={0.85}
                >
                  <View style={styles.courseCardLeft}>
                    <LinearGradient
                      colors={course.gradient as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.courseIcon}
                    >
                      <course.icon size={22} color="white" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                      <Text style={styles.courseSubtitle} numberOfLines={1}>{course.subtitle}</Text>
                      <Text style={styles.courseLastStudied}>{course.lastStudied}</Text>
                    </View>
                  </View>
                  <View style={styles.courseRight}>
                    <Text style={styles.courseProgressText}>{course.progress}%</Text>
                    <View style={styles.courseProgressBar}>
                      <View
                        style={[
                          styles.courseProgressFill,
                          { width: `${course.progress}%`, backgroundColor: PALETTE.green },
                        ]}
                      />
                    </View>
                    <View style={styles.courseContinueBtn}>
                      <Text style={styles.courseContinueText}>Fortsätt</Text>
                      <ArrowRight size={12} color={PALETTE.green} />
                    </View>
                  </View>
                </TouchableOpacity>
              </FadeInView>
            ))}

            {/* Custom user courses */}
            {activeCourses.length > 0 && (
              <View style={styles.customCoursesContainer}>
                <Text style={styles.customCoursesLabel}>Egna kurser</Text>
                {activeCourses.slice(0, 3).map((course, index) => (
                  <FadeInView key={course.id} delay={500 + index * 50} duration={250}>
                    <TouchableOpacity
                      style={styles.courseCard}
                      onPress={() => router.push(ROUTES.courseDetail(course.id))}
                      activeOpacity={0.85}
                    >
                      <View style={styles.courseCardLeft}>
                        <View style={[styles.courseIcon, { backgroundColor: PALETTE.borderLight }]}>
                          <BookOpen size={22} color={PALETTE.green} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                          <Text style={styles.courseSubtitle} numberOfLines={1}>{course.subject}</Text>
                          <Text style={styles.courseLastStudied}>{course.progress}% klart</Text>
                        </View>
                      </View>
                      <View style={styles.courseRight}>
                        <Text style={styles.courseProgressText}>{course.progress}%</Text>
                        <View style={styles.courseProgressBar}>
                          <View
                            style={[
                              styles.courseProgressFill,
                              { width: `${course.progress}%`, backgroundColor: PALETTE.green },
                            ]}
                          />
                        </View>
                        <View style={styles.courseContinueBtn}>
                          <Text style={styles.courseContinueText}>Fortsätt</Text>
                          <ArrowRight size={12} color={PALETTE.green} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </FadeInView>
                ))}
              </View>
            )}

            {/* Add course */}
            <TouchableOpacity
              style={styles.addCourseCard}
              onPress={handleAddCourse}
              activeOpacity={0.85}
            >
              <Plus size={20} color={PALETTE.green} />
              <Text style={styles.addCourseText}>Lägg till egen kurs</Text>
            </TouchableOpacity>

            {/* Empty state for exams */}
            {upcomingExams.length > 0 && (
              <View style={styles.examsContainer}>
                <Text style={styles.customCoursesLabel}>Kommande prov</Text>
                {upcomingExams.slice(0, examsExpanded ? upcomingExams.length : 2).map((exam, index) => {
                  const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  return (
                    <TouchableOpacity
                      key={exam.id}
                      style={styles.examCard}
                      onPress={() => router.push(`/study-plan/${exam.id}?courseTitle=${encodeURIComponent(exam.title)}` as never)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.examDateBadge, { backgroundColor: isUrgent ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                        <Text style={[styles.examDateDay, { color: isUrgent ? PALETTE.rose : PALETTE.amber }]}>
                          {exam.examDate.getDate()}
                        </Text>
                        <Text style={[styles.examDateMonth, { color: isUrgent ? PALETTE.rose : PALETTE.amber }]}>
                          {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.examTitle} numberOfLines={1}>{exam.title}</Text>
                        <Text style={styles.examMeta}>
                          {daysUntil === 0 ? 'Idag' : daysUntil === 1 ? 'Imorgon' : `Om ${daysUntil} dagar`}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={PALETTE.textMuted} />
                    </TouchableOpacity>
                  );
                })}
                {upcomingExams.length > 2 && !examsExpanded && (
                  <TouchableOpacity
                    style={styles.showMoreBtn}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setExamsExpanded(true);
                    }}
                  >
                    <Text style={styles.showMoreText}>Visa alla {upcomingExams.length} prov</Text>
                    <ChevronDown size={14} color={PALETTE.green} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </SlideInView>

        {/* ================================================================ */}
        {/* 4. STUDY TIPS (AI)                                               */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={250} duration={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Sparkles size={22} color={PALETTE.green} />
                <Text style={styles.sectionTitle}>Studietips</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(ROUTES.studyTips)}>
                <Text style={styles.seeAllText}>Se alla →</Text>
              </TouchableOpacity>
            </View>

            {/* Featured tip card */}
            <View style={styles.tipFeaturedCard}>
              <BlurView intensity={40} tint="light" style={styles.tipBlur}>
                <View style={styles.tipFeaturedContent}>
                  <Text style={styles.tipFeaturedEmoji}>{studyTips[dailyTipIndex].icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipFeaturedLabel}>DAGENS TIPS</Text>
                    <Text style={styles.tipFeaturedTitle}>{studyTips[dailyTipIndex].title}</Text>
                    <Text style={styles.tipFeaturedText}>{studyTips[dailyTipIndex].text}</Text>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Two smaller tips */}
            <View style={styles.tipSmallRow}>
              <View style={styles.tipSmallCard}>
                <Lightbulb size={18} color={PALETTE.amber} />
                <Text style={styles.tipSmallTitle}>Fokusområde</Text>
                <Text style={styles.tipSmallText}>
                  {hpStats?.weakSections?.length
                    ? `Fokusera på ${hpStats.weakSections[0]} denna vecka`
                    : 'Öva på svagheter för snabbast förbättring'}
                </Text>
              </View>
              <View style={styles.tipSmallCard}>
                <Brain size={18} color={PALETTE.green} />
                <Text style={styles.tipSmallTitle}>Minnesteknik</Text>
                <Text style={styles.tipSmallText}>Repetera glosor med 1, 3 och 7 dagars mellanrum.</Text>
              </View>
            </View>
          </View>
        </SlideInView>

        {/* ================================================================ */}
        {/* 5. HÖGSKOLEPROVET HUB                                            */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={300} duration={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <FileText size={22} color={PALETTE.green} />
                <Text style={styles.sectionTitle}>Högskoleprovet</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(ROUTES.hogskoleprovetMain)}>
                <Text style={styles.seeAllText}>Alla →</Text>
              </TouchableOpacity>
            </View>

            {/* Full HP Simulation — mini-hero */}
            <TouchableOpacity
              style={styles.hpHeroCard}
              onPress={() => router.push(ROUTES.hogskoleprovetMain)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[PALETTE.green, PALETTE.greenDark] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hpHeroGradient}
              >
                <View style={styles.hpHeroDeco1} />
                <View style={styles.hpHeroDeco2} />
                <View style={styles.hpHeroTop}>
                  <View style={styles.hpHeroIcon}>
                    <FileText size={24} color="white" />
                  </View>
                  {hpTotalAttempts > 0 && (
                    <View style={styles.hpHeroBadge}>
                      <Text style={styles.hpHeroBadgeText}>{hpTotalAttempts} försök</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hpHeroTitle}>Full HP-simulering</Text>
                <Text style={styles.hpHeroSubtitle}>Träna en hel provdag — 160 frågor, 5 timmar</Text>
                {hpReadiness > 0 && (
                  <View style={styles.hpHeroScoreRow}>
                    <Text style={styles.hpHeroScoreLabel}>Beräknad poäng</Text>
                    <Text style={styles.hpHeroScoreValue}>{hpReadiness}</Text>
                  </View>
                )}
                <View style={styles.hpHeroFooter}>
                  <Text style={styles.hpHeroCta}>Starta simulering</Text>
                  <ArrowRight size={16} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Verbal + Quantitative cards */}
            <View style={styles.hpSectionRow}>
              <TouchableOpacity
                style={styles.hpSectionCard}
                onPress={() => router.push(ROUTES.hpPractice('ORD') as never)}
                activeOpacity={0.85}
              >
                <View style={styles.hpSectionHeader}>
                  <Text style={styles.hpSectionTitle}>Verbal</Text>
                  <View style={[styles.hpDifficulty, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Text style={[styles.hpDifficultyText, { color: PALETTE.green }]}>ORD · LÄS · ELF</Text>
                  </View>
                </View>
                <View style={styles.hpMiniProgress}>
                  <View
                    style={[styles.hpMiniProgressFill, { width: `${verbalProgress}%` }]}
                  />
                </View>
                <Text style={styles.hpMiniProgressText}>{verbalProgress}% snitt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hpSectionCard}
                onPress={() => router.push(ROUTES.hpPractice('XYZ') as never)}
                activeOpacity={0.85}
              >
                <View style={styles.hpSectionHeader}>
                  <Text style={styles.hpSectionTitle}>Kvantitativ</Text>
                  <View style={[styles.hpDifficulty, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                    <Text style={[styles.hpDifficultyText, { color: PALETTE.teal }]}>XYZ · KVA · DTK</Text>
                  </View>
                </View>
                <View style={styles.hpMiniProgress}>
                  <View
                    style={[styles.hpMiniProgressFill, { width: `${quantProgress}%`, backgroundColor: PALETTE.teal }]}
                  />
                </View>
                <Text style={styles.hpMiniProgressText}>{quantProgress}% snitt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SlideInView>

        {/* ================================================================ */}
        {/* 6. QUICK ACTIONS                                                 */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={350} duration={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitleSmall}>Snabbåtkomst</Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionTile
                icon={Layers}
                label="Flashcards"
                color={PALETTE.green}
                onPress={() => router.push('/smart-flashcards' as never)}
              />
              <QuickActionTile
                icon={PenTool}
                label="Quiz-generator"
                color={PALETTE.teal}
                onPress={() => router.push(ROUTES.generalChat)}
              />
              <QuickActionTile
                icon={Brain}
                label="AI Tutor"
                color={PALETTE.cyan}
                onPress={() => router.push(ROUTES.generalChat)}
              />
              <QuickActionTile
                icon={Calendar}
                label="Studieplan"
                color={PALETTE.amber}
                onPress={() => router.push(ROUTES.planning)}
              />
            </View>
          </View>
        </SlideInView>

        {/* ================================================================ */}
        {/* 7. PREMIUM UPGRADE                                               */}
        {/* ================================================================ */}
        <SlideInView direction="up" delay={400} duration={400}>
          <View style={styles.section}>
            {!isPremium ? (
              <View style={styles.premiumCard}>
                <LinearGradient
                  colors={[PALETTE.green, PALETTE.greenDark] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumGradient}
                >
                  <View style={styles.premiumDeco1} />
                  <View style={styles.premiumDeco2} />
                  <View style={styles.premiumContent}>
                    <View style={styles.premiumHeaderRow}>
                      <Crown size={24} color="white" />
                      <Text style={styles.premiumTitle}>Premium</Text>
                    </View>
                    <Text style={styles.premiumSubtitle}>
                      Lås upp allt i Studiestugan
                    </Text>
                    <View style={styles.premiumBullets}>
                      <PremiumBullet text="AI Studievägledare" />
                      <PremiumBullet text="Obegränsad HP-praktik" />
                      <PremiumBullet text="Full statistik & insikter" />
                      <PremiumBullet text="Full kursåtkomst" />
                    </View>
                    <TouchableOpacity
                      style={styles.premiumCtaBtn}
                      onPress={() => router.push(ROUTES.premium)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.premiumCtaText}>Uppgradera till Premium</Text>
                      <ArrowRight size={18} color={PALETTE.greenDark} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.premiumActiveCard}>
                <BlurView intensity={40} tint="light" style={styles.premiumActiveBlur}>
                  <View style={styles.premiumActiveContent}>
                    <View style={styles.premiumActiveIcon}>
                      <Crown size={20} color={PALETTE.amber} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.premiumActiveTitle}>Premium aktiv</Text>
                      <Text style={styles.premiumActiveSub}>Du har full åtkomst till alla funktioner</Text>
                    </View>
                    <ChevronRight size={20} color={PALETTE.textMuted} />
                  </View>
                </BlurView>
              </View>
            )}
          </View>
        </SlideInView>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
const StatMiniCard = ({
  icon: Icon,
  value,
  label,
  color,
  trend,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  value: string;
  label: string;
  color: string;
  trend?: 'up' | 'down';
}) => (
  <View style={styles.statMiniCard}>
    <View style={[styles.statMiniIcon, { backgroundColor: color + '15' }]}>
      <Icon size={16} color={color} />
    </View>
    <Text style={styles.statMiniValue}>{value}</Text>
    <Text style={styles.statMiniLabel}>{label}</Text>
    {trend && (
      <View style={[styles.statTrend, { backgroundColor: trend === 'up' ? PALETTE.green + '15' : PALETTE.rose + '15' }]}>
        {trend === 'up' ? (
          <TrendingUp size={10} color={PALETTE.green} />
        ) : (
          <TrendingDown size={10} color={PALETTE.rose} />
        )}
      </View>
    )}
  </View>
);

const QuickActionTile = ({
  icon: Icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.quickActionTile}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
      <Icon size={22} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const PremiumBullet = ({ text }: { text: string }) => (
  <View style={styles.premiumBulletRow}>
    <View style={styles.premiumBulletCheck}>
      <Check size={12} color="white" />
    </View>
    <Text style={styles.premiumBulletText}>{text}</Text>
  </View>
);

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgWarm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // --- Hero ---
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: 10,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: PALETTE.green,
    opacity: 0.08,
  },
  orb2: {
    position: 'absolute',
    top: 120,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: PALETTE.teal,
    opacity: 0.07,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    zIndex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  greetingSub: {
    fontSize: 15,
    color: PALETTE.textLight,
    fontWeight: '500' as const,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: PALETTE.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PALETTE.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Hero card ---
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  heroBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroCardContent: {
    padding: 24,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: PALETTE.borderLight,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PALETTE.greenDark,
  },
  heroGoalTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.textLight,
    marginBottom: 6,
  },
  heroGoalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  heroGoalNumber: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -1,
  },
  heroGoalDivider: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: PALETTE.textLight,
    marginLeft: 8,
  },
  heroProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden' as const,
    marginBottom: 14,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: PALETTE.green,
  },
  heroInsight: {
    fontSize: 14,
    color: PALETTE.textMid,
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500' as const,
  },
  heroCta: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: PALETTE.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  heroCtaText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },

  // --- Demo banner ---
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    marginTop: 12,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.cyan,
  },

  // --- Stats ---
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statMiniIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statMiniValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.3,
  },
  statMiniLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: PALETTE.textLight,
    marginTop: 2,
  },
  statTrend: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Section ---
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.5,
  },
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.green,
  },

  // --- Courses ---
  courseCard: {
    flexDirection: 'row',
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  courseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 2,
  },
  courseSubtitle: {
    fontSize: 13,
    color: PALETTE.textLight,
    marginBottom: 2,
  },
  courseLastStudied: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500' as const,
  },
  courseRight: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 70,
  },
  courseProgressText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: PALETTE.green,
  },
  courseProgressBar: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden' as const,
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: PALETTE.borderLight,
  },
  courseContinueText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: PALETTE.green,
  },
  customCoursesContainer: {
    marginTop: 20,
  },
  customCoursesLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PALETTE.textLight,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  addCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: PALETTE.borderLight,
    borderStyle: 'dashed' as const,
    marginTop: 8,
  },
  addCourseText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: PALETTE.green,
  },

  // --- Exams ---
  examsContainer: {
    marginTop: 24,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  examDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examDateDay: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  examDateMonth: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 2,
  },
  examMeta: {
    fontSize: 12,
    color: PALETTE.textLight,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.green,
  },

  // --- Study tips ---
  tipFeaturedCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  tipBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  tipFeaturedContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 14,
    alignItems: 'flex-start',
  },
  tipFeaturedEmoji: {
    fontSize: 32,
  },
  tipFeaturedLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: PALETTE.green,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tipFeaturedTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 6,
  },
  tipFeaturedText: {
    fontSize: 13,
    color: PALETTE.textMid,
    lineHeight: 19,
  },
  tipSmallRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tipSmallCard: {
    flex: 1,
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tipSmallTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  tipSmallText: {
    fontSize: 12,
    color: PALETTE.textLight,
    lineHeight: 17,
  },

  // --- HP Hub ---
  hpHeroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: PALETTE.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  hpHeroGradient: {
    padding: 24,
    borderRadius: 28,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  hpHeroDeco1: {
    position: 'absolute' as const,
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  hpHeroDeco2: {
    position: 'absolute' as const,
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  hpHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 1,
  },
  hpHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hpHeroBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hpHeroBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  hpHeroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  hpHeroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 16,
    zIndex: 1,
  },
  hpHeroScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
    zIndex: 1,
  },
  hpHeroScoreLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  hpHeroScoreValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    letterSpacing: -0.5,
  },
  hpHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
    zIndex: 1,
  },
  hpHeroCta: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'white',
  },

  hpSectionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hpSectionCard: {
    flex: 1,
    backgroundColor: PALETTE.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  hpSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hpSectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
  },
  hpDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hpDifficultyText: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  hpMiniProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.borderLight,
    overflow: 'hidden' as const,
    marginBottom: 6,
  },
  hpMiniProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: PALETTE.green,
  },
  hpMiniProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: PALETTE.textLight,
  },

  // --- Quick Actions ---
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: PALETTE.textMid,
    textAlign: 'center',
  },

  // --- Premium ---
  premiumCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: PALETTE.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  premiumGradient: {
    borderRadius: 28,
    overflow: 'hidden' as const,
    padding: 24,
    position: 'relative' as const,
  },
  premiumDeco1: {
    position: 'absolute' as const,
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  premiumDeco2: {
    position: 'absolute' as const,
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  premiumContent: {
    zIndex: 1,
  },
  premiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: 'white',
    letterSpacing: -0.5,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
  },
  premiumBullets: {
    gap: 10,
    marginBottom: 24,
  },
  premiumBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumBulletCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBulletText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
  },
  premiumCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumCtaText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: PALETTE.greenDark,
  },

  // --- Premium Active ---
  premiumActiveCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  premiumActiveBlur: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  premiumActiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  premiumActiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumActiveTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 2,
  },
  premiumActiveSub: {
    fontSize: 13,
    color: PALETTE.textLight,
  },

  // --- Skeleton ---
  skeletonHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
