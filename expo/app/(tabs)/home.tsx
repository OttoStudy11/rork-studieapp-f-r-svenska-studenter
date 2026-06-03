import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
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
import {
  BookOpen,
  Clock,
  Target,
  Plus,
  Star,
  Crown,
  User,
  TrendingUp,
  Calendar,
  Flame,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Zap,
  FileText,
  Sparkles,
  Brain,
  Heart,
  GraduationCap,
  Timer,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { FadeInView, SlideInView, AnimatedPressable } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 14;
const HORIZONTAL_PADDING = 20;

/* ── Skeleton ─────────────────────────────────────────────── */
const SkeletonBox = ({
  w,
  h,
  style,
  br = 12,
  color,
}: {
  w: number | string;
  h: number;
  style?: any;
  br?: number;
  color?: string;
}) => {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={[{ width: w as any, height: h, borderRadius: br, backgroundColor: color || '#E5E7EB', opacity: pulse }, style]}
    />
  );
};

const HomeSkeleton = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
  const c = theme.colors.border;
  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.headerWrap}>
          <SkeletonBox w={180} h={32} style={{ marginBottom: 6 }} color={c} />
          <SkeletonBox w={140} h={18} color={c} />
        </View>
        <View style={{ paddingHorizontal: HORIZONTAL_PADDING, marginBottom: 28 }}>
          <SkeletonBox w="100%" h={180} br={24} color={c} />
        </View>
        <View style={s.navGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} w={(SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2} h={140} br={20} color={c} />
          ))}
        </View>
        <View style={{ paddingHorizontal: HORIZONTAL_PADDING, marginBottom: 24 }}>
          <SkeletonBox w="100%" h={72} br={16} color={c} />
        </View>
        <View style={{ paddingHorizontal: HORIZONTAL_PADDING, marginBottom: 24 }}>
          <SkeletonBox w="100%" h={64} br={14} color={c} />
        </View>
      </ScrollView>
    </View>
  );
};

/* ── Main Screen ─────────────────────────────────────────── */
export default function HomeScreen() {
  const { user, courses, pomodoroSessions, isLoading } = useStudy();
  const { currentStreak } = useAchievements();
  const { totalPoints } = usePoints();
  const { currentLevel, xpProgress, totalXp } = useGamification();
  const { isPremium, isDemoMode, canAddCourse, showPremiumModal } = usePremium();
  const { theme, isDark } = useTheme();
  const { upcomingExams } = useExams();

  /* ── helpers ──────────────────────────────────────────── */
  const handleAddCourse = () => {
    if (!canAddCourse(courses.length)) {
      showPremiumModal('Obegränsat antal kurser');
      return;
    }
    router.push('/courses' as any);
  };

  if (isLoading) return <HomeSkeleton theme={theme} isDark={isDark} />;
  if (!user) {
    return (
      <View style={[s.center, { backgroundColor: theme.colors.background }]}>
        <Text style={[s.err, { color: theme.colors.text }]}>Ingen användardata tillgänglig</Text>
      </View>
    );
  }

  const activeCourses = courses.filter((c) => c.isActive);
  const todaySessions = pomodoroSessions.filter((s) => {
    const today = new Date().toDateString();
    return today === new Date(s.endTime).toDateString();
  });
  const totalStudyMin = Math.round(
    pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
  );
  const avgProgress =
    courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  /* ── UI ────────────────────────────────────────────────── */
  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        bounces
        scrollEventThrottle={16}
      >
        {/* ── Header ─────────────────────────────────── */}
        <View style={s.headerWrap}>
          <View style={s.headerRow}>
            <View style={s.headerText}>
              <Text style={[s.greeting, { color: theme.colors.text }]}>
                Hej, {user?.name?.split(' ')[0]} 👋
              </Text>
              <Text style={[s.dateText, { color: theme.colors.textSecondary }]}>{dateStr}</Text>
            </View>

            <View style={s.headerBadges}>
              {isPremium && (
                <View style={[s.premPill, { backgroundColor: theme.colors.warning + '18' }]}>
                  <Crown size={13} color={theme.colors.warning} />
                  <Text style={[s.premPillText, { color: theme.colors.warning }]}>Pro</Text>
                </View>
              )}
              <TouchableOpacity
                style={s.avatarBtn}
                onPress={() => router.push('/profile' as any)}
                activeOpacity={0.7}
              >
                {user.avatar ? (
                  <CharacterAvatar config={user.avatar} size={42} />
                ) : (
                  <View style={[s.avatarFallback, { backgroundColor: theme.colors.primary + '14' }]}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isDemoMode && (
            <View style={[s.demoBanner, { backgroundColor: theme.colors.info + '12' }]}>
              <Text style={[s.demoBannerText, { color: theme.colors.info }]}>🎯 Demo-läge aktivt</Text>
            </View>
          )}
        </View>

        {/* ── Today Hero Card ────────────────────────── */}
        <SlideInView direction="up" delay={40} duration={400}>
          <LinearGradient
            colors={
              isDark
                ? ['#1E1B4B', '#312E81', '#1E1B4B']
                : ['#4F46E5', '#6366F1', '#4F46E5']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroGradient}
          >
            {/* decorative blurs */}
            <View style={[s.heroBlob, { top: -40, right: -20, width: 140, height: 140 }]} />
            <View style={[s.heroBlob, { bottom: -30, left: -30, width: 100, height: 100 }]} />

            <View style={s.heroContent}>
              <View style={s.heroStatsRow}>
                <View style={s.heroStat}>
                  <View style={s.heroStatIconWrap}>
                    <Flame size={18} color="#FFB347" />
                  </View>
                  <Text style={s.heroStatVal}>{currentStreak}</Text>
                  <Text style={s.heroStatLbl}>dagars streak</Text>
                </View>

                <View style={s.heroStatDiv} />

                <View style={s.heroStat}>
                  <View style={s.heroStatIconWrap}>
                    <Timer size={18} color="#A5B4FC" />
                  </View>
                  <Text style={s.heroStatVal}>{todaySessions.length}</Text>
                  <Text style={s.heroStatLbl}>pass idag</Text>
                </View>

                <View style={s.heroStatDiv} />

                <View style={s.heroStat}>
                  <View style={s.heroStatIconWrap}>
                    <Star size={18} color="#FDE047" />
                  </View>
                  <Text style={s.heroStatVal}>{totalPoints}</Text>
                  <Text style={s.heroStatLbl}>poäng</Text>
                </View>
              </View>

              <TouchableOpacity
                style={s.heroCta}
                onPress={() => router.push('/timer' as any)}
                activeOpacity={0.85}
              >
                <View style={s.heroCtaInner}>
                  <View style={s.heroCtaIcon}>
                    <Clock size={22} color="#4F46E5" />
                  </View>
                  <Text style={s.heroCtaText}>Starta fokuspass</Text>
                  <ArrowRight size={18} color="#4F46E5" style={{ opacity: 0.5 }} />
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SlideInView>

        {/* ── Quick Navigation Grid ──────────────────── */}
        <SlideInView direction="up" delay={80} duration={400}>
          <View style={s.navGrid}>
            <AnimatedPressable
              style={[s.navCard, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/hogskoleprovet' as any)}
            >
              <View style={[s.navIcon, { backgroundColor: '#EEF2FF' }]}>
                <GraduationCap size={22} color="#4F46E5" />
              </View>
              <Text style={[s.navTitle, { color: theme.colors.text }]}>Högskole-{'\n'}provet</Text>
              <Text style={[s.navSub, { color: theme.colors.textSecondary }]}>
                {isPremium ? '8 delprov' : '2 gratis'}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[s.navCard, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/diagnosstod' as any)}
            >
              <View style={[s.navIcon, { backgroundColor: '#FDF2F8' }]}>
                <Heart size={22} color="#EC4899" />
              </View>
              <Text style={[s.navTitle, { color: theme.colors.text }]}>Diagnos-{'\n'}stöd</Text>
              <Text style={[s.navSub, { color: theme.colors.textSecondary }]}>Anpassat stöd</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[s.navCard, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/study-insights' as any)}
            >
              <View style={[s.navIcon, { backgroundColor: '#ECFDF5' }]}>
                <Brain size={22} color="#10B981" />
              </View>
              <Text style={[s.navTitle, { color: theme.colors.text }]}>Studie-{'\n'}insikter</Text>
              <Text style={[s.navSub, { color: theme.colors.textSecondary }]}>AI-driven analys</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[s.navCard, { backgroundColor: theme.colors.card }]}
              onPress={handleAddCourse}
            >
              <View style={[s.navIcon, { backgroundColor: '#FFF7ED' }]}>
                <BookOpen size={22} color="#F97316" />
              </View>
              <Text style={[s.navTitle, { color: theme.colors.text }]}>Mina{'\n'}kurser</Text>
              <Text style={[s.navSub, { color: theme.colors.textSecondary }]}>
                {activeCourses.length} aktiva
              </Text>
            </AnimatedPressable>
          </View>
        </SlideInView>

        {/* ── Stats Row ──────────────────────────────── */}
        <SlideInView direction="up" delay={120} duration={400}>
          <View style={s.statsRow}>
            <View style={[s.statPill, { backgroundColor: theme.colors.card }]}>
              <TrendingUp size={14} color={theme.colors.secondary} />
              <Text style={[s.statPillVal, { color: theme.colors.text }]}>{avgProgress}%</Text>
              <Text style={[s.statPillLbl, { color: theme.colors.textSecondary }]}>snitt</Text>
            </View>
            <View style={[s.statPill, { backgroundColor: theme.colors.card }]}>
              <Calendar size={14} color={theme.colors.warning} />
              <Text style={[s.statPillVal, { color: theme.colors.text }]}>{totalStudyMin}h</Text>
              <Text style={[s.statPillLbl, { color: theme.colors.textSecondary }]}>totalt</Text>
            </View>
            <View style={[s.statPill, { backgroundColor: theme.colors.card }]}>
              <Zap size={14} color={TIER_COLORS[currentLevel.tier]} />
              <Text style={[s.statPillVal, { color: theme.colors.text }]}>{totalXp}</Text>
              <Text style={[s.statPillLbl, { color: theme.colors.textSecondary }]}>XP</Text>
            </View>
          </View>
        </SlideInView>

        {/* ── Upcoming Exams ─────────────────────────── */}
        <SlideInView direction="up" delay={160} duration={400}>
          <View style={s.sectionWrap}>
            <View style={s.sectionHead}>
              <View style={s.sectionTitleRow}>
                <Calendar size={18} color={theme.colors.warning} />
                <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Kommande prov</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/planning' as any)}>
                <Text style={[s.seeAll, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>

            {upcomingExams.length > 0 ? (
              upcomingExams.slice(0, 3).map((exam, i) => {
                const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / 86400000);
                const isUrgent = daysUntil <= 3;
                return (
                  <FadeInView key={exam.id} delay={200 + i * 60} duration={300}>
                    <TouchableOpacity
                      style={[s.examCard, { backgroundColor: theme.colors.card }]}
                      onPress={() =>
                        router.push(
                          `/study-plan/${exam.id}?courseTitle=${encodeURIComponent(exam.title)}` as never,
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <View style={[s.examBadge, { backgroundColor: isUrgent ? theme.colors.error + '14' : theme.colors.warning + '14' }]}>
                        <Text style={[s.examBadgeDay, { color: isUrgent ? theme.colors.error : theme.colors.warning }]}>
                          {exam.examDate.getDate()}
                        </Text>
                        <Text style={[s.examBadgeMonth, { color: isUrgent ? theme.colors.error : theme.colors.warning }]}>
                          {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                        </Text>
                      </View>
                      <View style={s.examInfo}>
                        <Text style={[s.examName, { color: theme.colors.text }]} numberOfLines={1}>
                          {exam.title}
                        </Text>
                        <View style={s.examMeta}>
                          <Clock size={11} color={theme.colors.textMuted} />
                          <Text style={[s.examMetaText, { color: theme.colors.textMuted }]}>
                            {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          {exam.location && (
                            <>
                              <Text style={[s.examDot, { color: theme.colors.textMuted }]}>·</Text>
                              <Text style={[s.examMetaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                                {exam.location}
                              </Text>
                            </>
                          )}
                        </View>
                        {isUrgent && (
                          <View style={[s.urgentTag, { backgroundColor: theme.colors.error + '14' }]}>
                            <AlertCircle size={10} color={theme.colors.error} />
                            <Text style={[s.urgentTagText, { color: theme.colors.error }]}>
                              {daysUntil === 0 ? 'Idag' : daysUntil === 1 ? 'Imorgon' : `Om ${daysUntil} dagar`}
                            </Text>
                          </View>
                        )}
                      </View>
                      <FileText size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </FadeInView>
                );
              })
            ) : (
              <TouchableOpacity
                style={[s.emptyExam, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => router.push('/planning' as any)}
                activeOpacity={0.7}
              >
                <View style={[s.emptyExamIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                  <Calendar size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.emptyExamTitle, { color: theme.colors.text }]}>Inga planerade prov</Text>
                  <Text style={[s.emptyExamSub, { color: theme.colors.textSecondary }]}>
                    Lägg till prov för att få påminnelser
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SlideInView>

        {/* ── Active Courses ─────────────────────────── */}
        <SlideInView direction="up" delay={200} duration={400}>
          <View style={s.sectionWrap}>
            <View style={s.sectionHead}>
              <View style={s.sectionTitleRow}>
                <BookOpen size={18} color={theme.colors.primary} />
                <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Aktiva kurser</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/courses' as any)}>
                <Text style={[s.seeAll, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>

            {activeCourses.length > 0 ? (
              activeCourses.slice(0, 3).map((course, i) => (
                <FadeInView key={course.id} delay={250 + i * 50} duration={300}>
                  <TouchableOpacity
                    style={[s.courseCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/course/${course.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={s.courseTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.courseTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {course.title}
                        </Text>
                        <Text style={[s.courseSubject, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {course.subject}
                        </Text>
                      </View>
                      <Text style={[s.coursePct, { color: theme.colors.primary }]}>{course.progress}%</Text>
                    </View>
                    <View style={[s.progressTrack, { backgroundColor: theme.colors.borderLight }]}>
                      <View
                        style={[s.progressFill, { width: `${course.progress}%`, backgroundColor: theme.colors.primary }]}
                      />
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))
            ) : (
              <View style={s.emptyCourses}>
                <Target size={40} color={theme.colors.textMuted} />
                <Text style={[s.emptyTitle, { color: theme.colors.text }]}>Inga kurser än</Text>
                <Text style={[s.emptySub, { color: theme.colors.textSecondary }]}>
                  Lägg till kurser för att komma igång
                </Text>
                <TouchableOpacity style={[s.addBtn, { backgroundColor: theme.colors.primary }]} onPress={handleAddCourse}>
                  <Plus size={18} color="white" />
                  <Text style={s.addBtnText}>Lägg till kurs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SlideInView>

        {/* ── XP Card ────────────────────────────────── */}
        <SlideInView direction="up" delay={240} duration={400}>
          <TouchableOpacity
            style={[s.xpCard, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/achievements' as any)}
            activeOpacity={0.8}
          >
            <View style={[s.xpBadge, { backgroundColor: TIER_COLORS[currentLevel.tier] + '18' }]}>
              <Text style={s.xpBadgeEmoji}>{currentLevel.iconEmoji}</Text>
            </View>
            <View style={s.xpInfo}>
              <View style={s.xpRow}>
                <Text style={[s.xpLevel, { color: theme.colors.text }]}>Nivå {currentLevel.level}</Text>
                <View style={[s.xpTierPill, { backgroundColor: TIER_COLORS[currentLevel.tier] }]}>
                  <Text style={s.xpTierText}>{currentLevel.titleSv}</Text>
                </View>
              </View>
              <View style={[s.xpTrack, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    s.xpFill,
                    {
                      width: `${Math.min(100, xpProgress.percent)}%`,
                      backgroundColor: TIER_COLORS[currentLevel.tier],
                    },
                  ]}
                />
              </View>
              <Text style={[s.xpLabel, { color: theme.colors.textSecondary }]}>
                {xpProgress.current} / {xpProgress.required} XP till nästa nivå
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </SlideInView>

        {/* ── Premium Banner ─────────────────────────── */}
        {!isPremium && (
          <SlideInView direction="up" delay={280} duration={400}>
            <View style={s.sectionWrap}>
              <TouchableOpacity
                style={[s.premBanner, { backgroundColor: theme.colors.warning + '0C', borderColor: theme.colors.warning + '20' }]}
                onPress={() => router.push('/premium' as any)}
                activeOpacity={0.85}
              >
                <View style={s.premBannerInner}>
                  <View style={s.premBannerLeft}>
                    <Crown size={22} color={theme.colors.warning} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[s.premBannerTitle, { color: theme.colors.text }]}>Uppgradera till Premium</Text>
                      <Text style={[s.premBannerSub, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        Obegränsade kurser, avancerad statistik och mer
                      </Text>
                    </View>
                  </View>
                  <View style={[s.premBannerBtn, { backgroundColor: theme.colors.warning }]}>
                    <Text style={s.premBannerBtnText}>Prova</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </SlideInView>
        )}

        {/* ── Study Tips (compact) ───────────────────── */}
        <SlideInView direction="up" delay={300} duration={400}>
          <View style={s.sectionWrap}>
            <View style={s.sectionHead}>
              <View style={s.sectionTitleRow}>
                <Sparkles size={18} color={theme.colors.primary} />
                <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/study-tips' as any)}>
                <Text style={[s.seeAll, { color: theme.colors.primary }]}>Alla</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tipsScroll}>
              {[
                { icon: '🍅', title: 'Pomodoro', tag: 'Fokus' },
                { icon: '🧠', title: 'Aktiv rep.', tag: 'Minne' },
                { icon: '📅', title: 'Spaced rep.', tag: 'Minne' },
                { icon: '👨‍🏫', title: 'Feynman', tag: 'Förståelse' },
                { icon: '🗺️', title: 'Mind maps', tag: 'Organisation' },
              ].map((tip, i) => (
                <TouchableOpacity
                  key={tip.title}
                  style={[s.tipChip, { backgroundColor: theme.colors.card }]}
                  onPress={() => router.push(`/study-tip/${i + 1}` as any)}
                  activeOpacity={0.7}
                >
                  <Text style={s.tipChipIcon}>{tip.icon}</Text>
                  <Text style={[s.tipChipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                  <View style={[s.tipChipTag, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Text style={[s.tipChipTagText, { color: theme.colors.primary }]}>{tip.tag}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SlideInView>

        {/* bottom spacer for tab bar */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { fontSize: 16 },
  scroll: { flexGrow: 1, paddingBottom: 20 },

  /* header */
  headerWrap: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 60, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, marginRight: 16 },
  greeting: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5, marginBottom: 4 },
  dateText: { fontSize: 15, fontWeight: '500' as const, letterSpacing: 0.1 },
  headerBadges: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  premPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, gap: 4 },
  premPillText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.3 },
  avatarBtn: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  avatarFallback: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  demoBanner: { marginTop: 14, borderRadius: 12, padding: 12, alignItems: 'center' },
  demoBannerText: { fontSize: 14, fontWeight: '600' as const },

  /* hero */
  heroGradient: {
    marginHorizontal: HORIZONTAL_PADDING,
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    overflow: 'hidden' as const,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroBlob: {
    position: 'absolute' as const,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroContent: { zIndex: 1 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 24 },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroStatVal: { fontSize: 22, fontWeight: '800' as const, color: 'white', marginBottom: 2 },
  heroStatLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as const, textAlign: 'center' },
  heroStatDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroCta: { borderRadius: 16, overflow: 'hidden' },
  heroCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
  },
  heroCtaIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCtaText: { fontSize: 16, fontWeight: '700' as const, color: '#1E1B4B', flex: 1 },

  /* nav grid */
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    marginBottom: 28,
  },
  navCard: {
    width: (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  navTitle: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22, marginBottom: 4 },
  navSub: { fontSize: 12, fontWeight: '500' as const },

  /* stats row */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 10,
    marginBottom: 28,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statPillVal: { fontSize: 15, fontWeight: '700' as const },
  statPillLbl: { fontSize: 12, fontWeight: '500' as const },

  /* sections */
  sectionWrap: { paddingHorizontal: HORIZONTAL_PADDING, marginBottom: 28 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.3 },
  seeAll: { fontSize: 15, fontWeight: '600' as const },

  /* exams */
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  examBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examBadgeDay: { fontSize: 18, fontWeight: '700' as const, lineHeight: 22 },
  examBadgeMonth: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5, marginTop: 1 },
  examInfo: { flex: 1 },
  examName: { fontSize: 15, fontWeight: '600' as const, marginBottom: 4 },
  examMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  examMetaText: { fontSize: 11, fontWeight: '500' as const },
  examDot: { fontSize: 11 },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  urgentTagText: { fontSize: 10, fontWeight: '700' as const },
  emptyExam: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed' as const,
  },
  emptyExamIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emptyExamTitle: { fontSize: 15, fontWeight: '600' as const, marginBottom: 2 },
  emptyExamSub: { fontSize: 13 },

  /* courses */
  courseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  courseTitle: { fontSize: 16, fontWeight: '600' as const, marginBottom: 2 },
  courseSubject: { fontSize: 13, fontWeight: '500' as const },
  coursePct: { fontSize: 16, fontWeight: '700' as const },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyCourses: { alignItems: 'center', paddingVertical: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 8,
  },
  addBtnText: { color: 'white', fontSize: 15, fontWeight: '600' as const },

  /* xp card */
  xpCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 28,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  xpBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  xpBadgeEmoji: { fontSize: 22 },
  xpInfo: { flex: 1 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  xpLevel: { fontSize: 15, fontWeight: '700' as const },
  xpTierPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  xpTierText: { fontSize: 10, fontWeight: '700' as const, color: 'white', letterSpacing: 0.3 },
  xpTrack: { height: 6, borderRadius: 3, overflow: 'hidden' as const, marginBottom: 5 },
  xpFill: { height: '100%', borderRadius: 3 },
  xpLabel: { fontSize: 11, fontWeight: '500' as const },

  /* premium banner */
  premBanner: { borderRadius: 18, borderWidth: 1, padding: 18 },
  premBannerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  premBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  premBannerTitle: { fontSize: 15, fontWeight: '700' as const, marginBottom: 2 },
  premBannerSub: { fontSize: 12, lineHeight: 17 },
  premBannerBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  premBannerBtnText: { color: 'white', fontSize: 14, fontWeight: '700' as const },

  /* tips */
  tipsScroll: { paddingRight: HORIZONTAL_PADDING, gap: 10 },
  tipChip: {
    width: 110,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tipChipIcon: { fontSize: 22, marginBottom: 8 },
  tipChipTitle: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center', marginBottom: 8 },
  tipChipTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tipChipTagText: { fontSize: 9, fontWeight: '600' as const },
});
