import React, { useRef, useEffect, useState } from 'react';
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
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/contexts/StudyContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { usePoints } from '@/contexts/PointsContext';
import { useGamification, TIER_COLORS } from '@/contexts/GamificationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams } from '@/contexts/ExamContext';
import { Image } from 'expo-image';
import { BookOpen, Clock, Target, Plus, Star, Crown, User, TrendingUp, Calendar, Flame, ArrowRight, AlertCircle, ChevronRight, ChevronDown, Zap, FileText, Sparkles, Brain, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import { FadeInView, SlideInView } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';
import { XpLevelRing } from '@/components/shared/XpLevelRing';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SkeletonBox = ({ width: w, height: h, style, borderRadius = 12, color }: { width: number | string; height: number; style?: any; borderRadius?: number; color?: string }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
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
          backgroundColor: color || '#E5E7EB',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

const HomeScreenSkeleton = ({ theme }: { theme: any; isDark: boolean }) => {
const skeletonColor = theme.colors.border;
return (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <StatusBar 
      barStyle="default" 
      backgroundColor={theme.colors.background}
    />
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Skeleton */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerLogo}>
          <SkeletonBox width={100} height={100} borderRadius={50} color={skeletonColor} />
        </View>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <SkeletonBox width={180} height={28} style={{ marginBottom: 8 }} color={skeletonColor} />
            <SkeletonBox width={140} height={18} color={skeletonColor} />
          </View>
          <SkeletonBox width={44} height={44} borderRadius={22} color={skeletonColor} />
        </View>
      </View>

      {/* Hero Card Skeleton */}
      <View style={[styles.heroCard, { backgroundColor: theme.colors.card, marginHorizontal: 24, marginBottom: 24 }]}>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} color={skeletonColor} />
            <SkeletonBox width={30} height={24} style={{ marginBottom: 4 }} color={skeletonColor} />
            <SkeletonBox width={60} height={14} color={skeletonColor} />
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} color={skeletonColor} />
            <SkeletonBox width={30} height={24} style={{ marginBottom: 4 }} color={skeletonColor} />
            <SkeletonBox width={40} height={14} color={skeletonColor} />
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} color={skeletonColor} />
            <SkeletonBox width={40} height={24} style={{ marginBottom: 4 }} color={skeletonColor} />
            <SkeletonBox width={50} height={14} color={skeletonColor} />
          </View>
        </View>
      </View>

      {/* Quick Action Skeleton */}
      <View style={styles.quickActions}>
        <SkeletonBox width="100%" height={56} borderRadius={16} color={skeletonColor} />
      </View>

      {/* Mini Stats Skeleton */}
      <View style={styles.miniStatsGrid}>
        <SkeletonBox width={(width - 72) / 3} height={90} color={skeletonColor} />
        <SkeletonBox width={(width - 72) / 3} height={90} color={skeletonColor} />
        <SkeletonBox width={(width - 72) / 3} height={90} color={skeletonColor} />
      </View>

      {/* Section Skeleton */}
      <View style={[styles.section, { marginBottom: 16 }]}>
        <SkeletonBox width={160} height={24} style={{ marginBottom: 16 }} color={skeletonColor} />
        <SkeletonBox width="100%" height={80} style={{ marginBottom: 12 }} color={skeletonColor} />
      </View>

      {/* Card Skeleton */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SkeletonBox width="100%" height={100} borderRadius={20} color={skeletonColor} />
      </View>
    </ScrollView>
  </View>
);
};

export default function HomeScreen() {
  const { user, courses, pomodoroSessions, isLoading } = useStudy();
  const { currentStreak } = useAchievements();
  const { totalPoints } = usePoints();
  const { currentLevel, xpProgress, totalXp } = useGamification();
  const { isPremium, isDemoMode, canAddCourse, showPremiumModal } = usePremium();
  const { theme, isDark } = useTheme();
  const { upcomingExams } = useExams();

  const [examsExpanded, setExamsExpanded] = useState(false);
  const [studyToolsTab, setStudyToolsTab] = useState<'tips' | 'tekniker'>('tips');

  const handleAddCourse = () => {
    if (!canAddCourse(courses.length)) {
      showPremiumModal('Obegränsat antal kurser');
      return;
    }
    router.push(ROUTES.courses);
  };

  // Pulse animation for "Starta fokus" button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseRef.current = pulse;
    pulse.start();
    return () => {
      pulse.stop();
      pulseRef.current = null;
    };
  }, [pulseAnim]);

  // XP level ring
  const levelRingAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(levelRingAnim, {
      toValue: Math.min(100, xpProgress.percent) / 100,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [xpProgress.percent, levelRingAnim]);

  // Handle loading with skeleton
  if (isLoading) {
    return <HomeScreenSkeleton theme={theme} isDark={isDark} />;
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Ingen användardata tillgänglig</Text>
      </View>
    );
  }

  const activeCourses = courses.filter(course => course.isActive);
  const todaySessions = pomodoroSessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.endTime).toDateString();
    return today === sessionDate;
  });

  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;

  const totalStudyTime = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);

  // Study tips and techniques data
  const studyTips = [
    {
      id: 1,
      title: 'Pomodoro-tekniken',
      description: 'Studera i 25-minuters intervaller med 5 minuters pauser',
      icon: '🍅',
      category: 'Tidshantering',
      difficulty: 'Nybörjare'
    },
    {
      id: 2,
      title: 'Aktiv repetition',
      description: 'Testa dig själv istället för att bara läsa om materialet',
      icon: '🧠',
      category: 'Minnestekniker',
      difficulty: 'Medel'
    },
    {
      id: 3,
      title: 'Spaced repetition',
      description: 'Repetera material med ökande intervaller för bättre minne',
      icon: '📅',
      category: 'Minnestekniker',
      difficulty: 'Avancerad'
    },
    {
      id: 4,
      title: 'Feynman-tekniken',
      description: 'Förklara komplexa koncept med enkla ord',
      icon: '👨‍🏫',
      category: 'Förståelse',
      difficulty: 'Medel'
    },
    {
      id: 5,
      title: 'Mind mapping',
      description: 'Skapa visuella kartor för att organisera information',
      icon: '🗺️',
      category: 'Organisation',
      difficulty: 'Nybörjare'
    },
    {
      id: 6,
      title: 'Miljöbyte',
      description: 'Byt studiemiljö för att förbättra inlärningen',
      icon: '🏠',
      category: 'Miljö',
      difficulty: 'Nybörjare'
    },
    {
      id: 7,
      title: 'Chunking',
      description: 'Dela upp information i mindre, hanterbara delar',
      icon: '🧩',
      category: 'Minnestekniker',
      difficulty: 'Nybörjare'
    },
    {
      id: 8,
      title: 'Interleaving',
      description: 'Variera mellan olika ämnen för effektivare inlärning',
      icon: '🔀',
      category: 'Inlärning',
      difficulty: 'Medel'
    },
    {
      id: 9,
      title: 'Sömn & vila',
      description: 'Optimera din sömn för bättre minneskonsolidering',
      icon: '😴',
      category: 'Hälsa',
      difficulty: 'Nybörjare'
    }
  ];

  const studyTechniques = [
    {
      id: 1,
      title: 'SQ3R-metoden',
      description: 'Survey, Question, Read, Recite, Review - systematisk läsning',
      steps: ['Överblicka', 'Fråga', 'Läs', 'Återge', 'Repetera'],
      icon: '📖',
      timeNeeded: '30-60 min'
    },
    {
      id: 2,
      title: 'Cornell-anteckningar',
      description: 'Strukturerad anteckningsmetod med tre sektioner',
      steps: ['Anteckningar', 'Ledtrådar', 'Sammanfattning'],
      icon: '📝',
      timeNeeded: '15-30 min'
    },
    {
      id: 3,
      title: 'Elaborativ förfrågan',
      description: 'Ställ "varför" och "hur" frågor för djupare förståelse',
      steps: ['Läs fakta', 'Fråga varför', 'Förklara samband', 'Koppla till tidigare kunskap'],
      icon: '❓',
      timeNeeded: '20-40 min'
    },
    {
      id: 4,
      title: 'Leitner-systemet',
      description: 'Flashcard-system med repetitionsintervaller baserat på prestation',
      steps: ['Skapa kort', 'Sortera i lådor', 'Repetera', 'Flytta kort'],
      icon: '📦',
      timeNeeded: '15-25 min'
    },
    {
      id: 5,
      title: 'Retrieval Practice',
      description: 'Träna på att hämta information från minnet aktivt',
      steps: ['Studera material', 'Stäng allt', 'Skriv ner allt', 'Kontrollera'],
      icon: '🔄',
      timeNeeded: '20-30 min'
    },
    {
      id: 6,
      title: 'Dual Coding',
      description: 'Kombinera text med visuella element för bättre inlärning',
      steps: ['Läs text', 'Skapa bilder', 'Koppla samman', 'Repetera båda'],
      icon: '🎨',
      timeNeeded: '25-45 min'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerLogo}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Hej, {user?.name}! 👋</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Redo att plugga idag?</Text>
            </View>
            <View style={styles.headerRight}>
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Crown size={16} color={theme.colors.warning} />
                  <Text style={[styles.premiumText, { color: theme.colors.warning }]}>Pro</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push(ROUTES.profile)}
              >
                {user.avatar ? (
                  <CharacterAvatar config={user.avatar} size={44} />
                ) : (
                  <View style={[styles.profileButtonFallback, { backgroundColor: theme.colors.primary + '15' }]}>
                    <User size={22} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {isDemoMode && (
            <View style={[styles.demoBanner, { backgroundColor: theme.colors.info + '15' }]}>
              <Text style={[styles.demoText, { color: theme.colors.info }]}>🎯 Demo-läge aktivt</Text>
            </View>
          )}
        </View>

        {/* Hero Stats Card */}
        <SlideInView direction="up" delay={0} duration={300}>
          <LinearGradient
            colors={theme.colors.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Flame size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{currentStreak}</Text>
                  <Text style={styles.heroStatLabel}>Dagars streak</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Clock size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{todaySessions.length}</Text>
                  <Text style={styles.heroStatLabel}>Idag</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Star size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{totalPoints}</Text>
                  <Text style={styles.heroStatLabel}>Poäng</Text>
                  <Text style={styles.heroStatSubtext}>1p per 5 min</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </SlideInView>



        {/* Quick Actions */}
        <SlideInView direction="up" delay={50} duration={300}>
          <View style={styles.quickActions}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonFull, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push(ROUTES.timer)}
              >
                <Clock size={24} color="white" />
                <Text style={styles.actionButtonText}>Starta fokus</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SlideInView>

        {/* Mini Stats Grid */}
        <SlideInView direction="up" delay={100} duration={300}>
          <View style={styles.miniStatsGrid}>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <BookOpen size={20} color={theme.colors.primary} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{activeCourses.length}</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Aktiva kurser</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <TrendingUp size={20} color={theme.colors.secondary} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{averageProgress}%</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Genomsnitt</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <Calendar size={20} color={theme.colors.warning} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{Math.round(totalStudyTime / 60)}h</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Total tid</Text>
            </View>
          </View>
        </SlideInView>



        {/* Upcoming Exams — collapsible */}
        <SlideInView direction="up" delay={150} duration={300}>
          <View style={[styles.section, { marginBottom: 44 }]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setExamsExpanded(!examsExpanded);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.sectionTitleContainer}>
                <Calendar size={20} color={theme.colors.warning} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kommande prov</Text>
                {upcomingExams.length > 0 && (
                  <View style={[styles.examCountBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Text style={[styles.examCountText, { color: theme.colors.warning }]}>{upcomingExams.length}</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => router.push(ROUTES.planning)}>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Planering →</Text>
                </TouchableOpacity>
                {upcomingExams.length > 1 && (
                  <ChevronDown
                    size={18}
                    color={theme.colors.textSecondary}
                    style={{ transform: [{ rotate: examsExpanded ? '180deg' : '0deg' }] }}
                  />
                )}
              </View>
            </TouchableOpacity>

            {upcomingExams.slice(0, examsExpanded ? upcomingExams.length : 1).map((exam, index) => {
              const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil <= 3;

              return (
                <FadeInView key={exam.id} delay={200 + index * 50} duration={300}>
                  <View style={[
                    styles.examCard,
                    { backgroundColor: theme.colors.card },
                    isUrgent && { borderLeftWidth: 4, borderLeftColor: theme.colors.error }
                  ]}>
                    <View style={styles.examCardContent}>
                      <View style={[
                        styles.examDateBadge,
                        { backgroundColor: isUrgent ? theme.colors.error + '15' : theme.colors.warning + '15' }
                      ]}>
                        <Text style={[
                          styles.examDateDay,
                          { color: isUrgent ? theme.colors.error : theme.colors.warning }
                        ]}>
                          {exam.examDate.getDate()}
                        </Text>
                        <Text style={[
                          styles.examDateMonth,
                          { color: isUrgent ? theme.colors.error : theme.colors.warning }
                        ]}>
                          {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.examInfo}>
                        <Text style={[styles.examTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {exam.title}
                        </Text>
                        <View style={styles.examMeta}>
                          <View style={styles.examMetaItem}>
                            <Clock size={12} color={theme.colors.textMuted} />
                            <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                              {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                          {exam.location && (
                            <>
                              <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>•</Text>
                              <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                                {exam.location}
                              </Text>
                            </>
                          )}
                        </View>
                        {isUrgent && (
                          <View style={[styles.urgentBadge, { backgroundColor: theme.colors.error + '15' }]}>
                            <AlertCircle size={12} color={theme.colors.error} />
                            <Text style={[styles.urgentText, { color: theme.colors.error }]}>
                              {daysUntil === 0 ? 'Idag' : daysUntil === 1 ? 'Imorgon' : `Om ${daysUntil} dagar`}
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.examStudyPlanIconBtn}
                        onPress={() => {
                          router.push(`/study-plan/${exam.id}?courseTitle=${encodeURIComponent(exam.title)}` as never);
                        }}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#818CF8']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.examStudyPlanIconGradient}
                        >
                          <FileText size={16} color="white" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </FadeInView>
              );
            })}

            {upcomingExams.length === 0 && (
              <TouchableOpacity
                style={[styles.addExamPrompt, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => router.push(ROUTES.planning)}
              >
                <View style={[styles.addExamIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Calendar size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.addExamContent}>
                  <Text style={[styles.addExamTitle, { color: theme.colors.text }]}>Inga planerade prov</Text>
                  <Text style={[styles.addExamSubtitle, { color: theme.colors.textSecondary }]}>Lägg till prov för att få påminnelser</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}

            {upcomingExams.length > 1 && !examsExpanded && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExamsExpanded(true);
                }}
              >
                <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                  Visa alla {upcomingExams.length} prov
                </Text>
                <ChevronDown size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </SlideInView>

        {/* HP + Diagnosstöd — two-column row */}
        <SlideInView direction="up" delay={200} duration={300}>
          <View style={[styles.twoColumnRow, { marginBottom: 48 }]}>
            {/* Högskoleprov — compact card */}
            <TouchableOpacity 
              style={styles.twoColCard}
              onPress={() => router.push(ROUTES.hogskoleprovetMain)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isDark ? ['#312E81', '#4338CA'] : ['#4338CA', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.twoColGradient}
              >
                <View style={styles.twoColIcon}>
                  <FileText size={22} color="white" />
                </View>
                <Text style={styles.twoColTitle}>Högskoleprov</Text>
                <View style={styles.twoColMiniChips}>
                  <Text style={styles.twoColMiniChipText}>ORD · LÄS · MEK</Text>
                  <Text style={styles.twoColMiniChipText}>XYZ · KVA · DTK</Text>
                </View>
                <View style={styles.twoColFooter}>
                  <Text style={styles.twoColCta}>Börja träna →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Diagnosstöd — compact card */}
            <TouchableOpacity
              style={styles.twoColCard}
              onPress={() => router.push(ROUTES.diagnosstod)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isDark ? ['#312E81', '#4C1D95'] : ['#6366F1', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.twoColGradient}
              >
                <View style={styles.twoColIcon}>
                  <Heart size={22} color="white" fill="rgba(255,255,255,0.3)" />
                </View>
                <Text style={styles.twoColTitle}>Diagnosstöd</Text>
                <Text style={styles.twoColDesc} numberOfLines={2}>
                  ADHD, dyslexi, autism & mer
                </Text>
                <View style={styles.twoColMiniPills}>
                  {['ADHD', 'Dyslexi', 'Autism'].map((d) => (
                    <Text key={d} style={styles.twoColMiniPillText}>{d}</Text>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SlideInView>

        {/* Compact XP Card */}
        <SlideInView direction="up" delay={275} duration={300}>
          <TouchableOpacity 
            style={[styles.compactXpCard, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push(ROUTES.achievements)}
            activeOpacity={0.8}
          >
            <XpLevelRing
              progress={xpProgress.percent}
              color={TIER_COLORS[currentLevel.tier]}
              size={72}
              strokeWidth={5}
              level={currentLevel.level}
              totalXp={totalXp}
              xpCurrent={xpProgress.current}
              xpRequired={xpProgress.required}
              tierName={currentLevel.titleSv}
              emoji={currentLevel.iconEmoji}
            />
            <View style={styles.compactXpInfo}>
              <View style={styles.compactXpRow}>
                <Text style={[styles.compactXpLevel, { color: theme.colors.text }]}>Nivå {currentLevel.level}</Text>
                <View style={[styles.compactXpTierBadge, { backgroundColor: TIER_COLORS[currentLevel.tier] }]}>
                  <Text style={styles.compactXpTierText}>{currentLevel.titleSv}</Text>
                </View>
              </View>
              <Text style={[styles.compactXpProgressText, { color: theme.colors.textSecondary }]}>
                {xpProgress.current} / {xpProgress.required} XP till nästa nivå
              </Text>
            </View>
            <View style={styles.compactXpRight}>
              <View style={styles.compactXpTotal}>
                <Zap size={14} color={TIER_COLORS[currentLevel.tier]} />
                <Text style={[styles.compactXpTotalNumber, { color: theme.colors.text }]}>{totalXp}</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </SlideInView>

        {/* Studieverktyg & Tips — tabbed section */}
        <SlideInView direction="up" delay={300} duration={300}>
          <View style={[styles.section, { marginBottom: 36 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Sparkles size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studieverktyg & Tips</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(ROUTES.studyTips)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla →</Text>
              </TouchableOpacity>
            </View>

            {/* Tab bar */}
            <View style={[styles.tabBar, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[styles.tabItem, studyToolsTab === 'tips' && { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setStudyToolsTab('tips');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabItemText, { color: studyToolsTab === 'tips' ? '#FFF' : theme.colors.textSecondary }]}>
                  Tips
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, studyToolsTab === 'tekniker' && { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setStudyToolsTab('tekniker');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabItemText, { color: studyToolsTab === 'tekniker' ? '#FFF' : theme.colors.textSecondary }]}>
                  Tekniker
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tips tab content */}
            {studyToolsTab === 'tips' && (
              <View style={styles.tipsGrid}>
                {studyTips.slice(0, 2).map((tip, index) => (
                  <FadeInView key={tip.id} delay={350 + index * 30} duration={250}>
                    <TouchableOpacity 
                      style={[styles.compactTipCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => router.push(ROUTES.studyTip(String(tip.id)))}
                    >
                      <Text style={styles.compactTipIcon}>{tip.icon}</Text>
                      <Text style={[styles.compactTipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                      <View style={[styles.compactTipDifficulty, { 
                        backgroundColor: tip.difficulty === 'Nybörjare' ? theme.colors.success + '20' :
                                       tip.difficulty === 'Medel' ? theme.colors.warning + '20' :
                                       theme.colors.error + '20'
                      }]}>
                        <Text style={[styles.compactTipDifficultyText, { 
                          color: tip.difficulty === 'Nybörjare' ? theme.colors.success :
                                tip.difficulty === 'Medel' ? theme.colors.warning :
                                theme.colors.error
                        }]}>{tip.difficulty}</Text>
                      </View>
                    </TouchableOpacity>
                  </FadeInView>
                ))}
              </View>
            )}

            {/* Tekniker tab content */}
            {studyToolsTab === 'tekniker' && (
              <View style={styles.tipsGrid}>
                {studyTechniques.slice(0, 2).map((technique, index) => (
                  <FadeInView key={technique.id} delay={350 + index * 30} duration={250}>
                    <TouchableOpacity 
                      style={[styles.compactTipCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => router.push(ROUTES.studyTechnique(String(technique.id)))}
                    >
                      <Text style={styles.compactTipIcon}>{technique.icon}</Text>
                      <Text style={[styles.compactTipTitle, { color: theme.colors.text }]}>{technique.title}</Text>
                      <View style={[styles.compactTimeTag, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Clock size={10} color={theme.colors.primary} />
                        <Text style={[styles.compactTimeText, { color: theme.colors.primary }]}>{technique.timeNeeded}</Text>
                      </View>
                    </TouchableOpacity>
                  </FadeInView>
                ))}
              </View>
            )}
          </View>
        </SlideInView>

        {/* Premium Upgrade Banner */}
        {!isPremium && (
          <SlideInView direction="up" delay={350} duration={300}>
            <View style={styles.section}>
              <TouchableOpacity 
                style={[styles.premiumBanner, { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning + '30' }]}
                onPress={() => router.push(ROUTES.premium)}
              >
                <View style={styles.premiumBannerContent}>
                  <View style={styles.premiumBannerLeft}>
                    <Crown size={24} color={theme.colors.warning} />
                    <View style={styles.premiumBannerText}>
                      <Text style={[styles.premiumBannerTitle, { color: theme.colors.text }]}>Uppgradera till Premium</Text>
                      <Text style={[styles.premiumBannerSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>Obegränsade kurser, avancerad statistik och mer</Text>
                    </View>
                  </View>
                  <View style={[styles.premiumBannerButton, { backgroundColor: theme.colors.warning }]}>
                    <Text style={styles.premiumBannerButtonText}>Uppgradera</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </SlideInView>
        )}

        {/* Active Courses */}
        <SlideInView direction="up" delay={400} duration={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktiva kurser</Text>
              <TouchableOpacity onPress={() => router.push(ROUTES.courses)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            {activeCourses.length > 0 ? (
              activeCourses.slice(0, 3).map((course, index) => (
                <FadeInView key={course.id} delay={450 + index * 50} duration={250}>
                  <TouchableOpacity 
                    style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => {
                      console.log('Navigating to course:', course.id, course.title);
                      router.push(ROUTES.courseDetail(course.id));
                    }}
                  >
                    <View style={styles.courseHeader}>
                      <View style={styles.courseInfo}>
                        <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={1}>{course.title}</Text>
                        <Text style={[styles.courseSubject, { color: theme.colors.textSecondary }]} numberOfLines={1}>{course.subject}</Text>
                      </View>
                      <View style={styles.courseProgressContainer}>
                        <Text style={[styles.courseProgress, { color: theme.colors.primary }]}>{course.progress}%</Text>
                      </View>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                      <View 
                        style={[styles.progressFill, { 
                          width: `${course.progress}%`,
                          backgroundColor: theme.colors.primary
                        }]} 
                      />
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Target size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inga aktiva kurser</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Lägg till kurser för att komma igång</Text>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddCourse}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addButtonText}>Lägg till kurs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SlideInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLogo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileButtonFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBanner: {
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  heroStatSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 44,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonFull: {
    flex: undefined,
    width: '100%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  miniStatsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 48,
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  miniStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 44,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hpCard: {
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden' as const,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  hpCardGradient: {
    padding: 24,
    paddingBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative' as const,
    minHeight: 220,
  },
  hpCardInnerShadow: {
    display: 'none' as const,
  },
  hpCardDecoCircle1: {
    position: 'absolute' as const,
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  hpCardDecoCircle2: {
    position: 'absolute' as const,
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  hpCard3dBottom: {
    display: 'none' as const,
  },
  hpCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 1,
  },
  hpIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  hpCardTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 6,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  hpCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 16,
    zIndex: 1,
  },
  hpCardChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    zIndex: 1,
  },
  hpChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hpChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  hpCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
    zIndex: 1,
  },
  hpFooterText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'white',
    letterSpacing: 0.3,
  },
  hpPremiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  hpPremiumText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  compactXpCard: {
    marginHorizontal: 24,
    marginBottom: 44,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  compactXpBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  compactXpEmoji: {
    fontSize: 24,
  },
  compactXpInfo: {
    flex: 1,
  },
  compactXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  compactXpLevel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  compactXpTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  compactXpTierText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'white',
  },
  compactXpProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden' as const,
    marginBottom: 6,
  },
  compactXpProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactXpProgressText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  compactXpRight: {
    alignItems: 'center' as const,
    gap: 4,
  },
  compactXpTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactXpTotalNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  levelCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  achievementsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentAchievements: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  recentAchievementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  courseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 14,
    fontWeight: '500',
  },
  courseProgressContainer: {
    alignItems: 'flex-end',
  },
  courseProgress: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compactTipCard: {
    width: (width - 72) / 2,
    height: 130,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactTipIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  compactTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
    height: 36,
  },
  compactTipDifficulty: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compactTipDifficultyText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  techniquesGrid: {
    gap: 12,
  },
  compactTechniqueCard: {
    borderRadius: 12,
    padding: 16,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactTechniqueIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactTechniqueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  compactTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginRight: 8,
  },
  compactTimeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compactArrow: {
    opacity: 0.6,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    gap: 8,
  },
  seeAllButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  premiumBanner: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  premiumBannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  premiumBannerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  premiumBannerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  techniqueCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  techniqueLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  techniqueIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  techniqueRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  examDateBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examDateDay: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  examDateMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  examMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  addExamPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addExamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addExamContent: {
    flex: 1,
  },
  addExamTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  addExamSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  xpLevelCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  xpLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpLevelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginRight: 14,
    position: 'relative' as const,
  },
  xpLevelEmoji: {
    fontSize: 24,
  },
  xpLevelNumberBadge: {
    position: 'absolute' as const,
    bottom: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  xpLevelNumber: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  xpLevelInfo: {
    flex: 1,
  },
  xpLevelTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  xpTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start' as const,
  },
  xpTierText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  xpTotalContainer: {
    alignItems: 'flex-end' as const,
  },
  xpTotalNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  xpTotalLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  xpProgressContainer: {
    marginTop: 4,
  },
  xpProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpProgressCurrent: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  xpProgressRequired: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  xpProgressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  xpNextLevelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  xpNextLevelText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  challengesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unclaimedBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unclaimedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  challengesRefreshText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  challengeEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  emptyChallenges: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyChallengesText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyChallengesSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  insightsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  insightsCardGradient: {
    padding: 20,
    position: 'relative' as const,
  },
  insightsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  insightsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsCardInfo: {
    flex: 1,
  },
  insightsCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 4,
  },
  insightsCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  insightsCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  insightsMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightsMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  aiToolsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  aiToolCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiToolIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiToolTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 2,
  },
  aiToolDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  diagnosCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  diagnosCardGradient: {
    padding: 20,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  diagnosDecoCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -30,
    right: -20,
  },
  diagnosDecoCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: 40,
  },
  diagnosCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  diagnosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  diagnosIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagnosTextBlock: {
    flex: 1,
  },
  diagnosTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 4,
  },
  diagnosSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 18,
  },
  diagnosPillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  diagnosPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  diagnosPillText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
  },
  examStudyPlanIconBtn: {
    alignSelf: 'center',
    marginLeft: 10,
  },
  examStudyPlanIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // AI Home Card
  aiHomeCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  aiHomeCardGradient: {
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.12)',
    borderRadius: 22,
  },
  aiHomeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiHomeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiHomeIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHomeCardText: {
    flex: 1,
  },
  aiHomeCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  aiHomeCardSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiHomeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  aiHomeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  aiHomeBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  hpMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
  },
  // ─── New styles for restructured home screen ───
  examCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  examCountText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  twoColumnRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  twoColCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  twoColGradient: {
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between' as const,
  },
  twoColIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  twoColTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  twoColDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 15,
    marginBottom: 10,
  },
  twoColMiniChips: {
    marginBottom: 12,
    gap: 4,
  },
  twoColMiniChipText: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  twoColFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 10,
  },
  twoColCta: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'white',
  },
  twoColMiniPills: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap' as const,
  },
  twoColMiniPillText: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  tabItemText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});