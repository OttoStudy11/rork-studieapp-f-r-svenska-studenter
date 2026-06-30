import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import {
  GraduationCap,
  Clock,
  Target,
  Trophy,
  ChevronRight,
  ChevronDown,
  Play,
  BarChart3,
  Lock,
  Crown,
  Sparkles,
  Zap,
  X,
  Shuffle,
  Calendar,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calculator,
  MessageCircle,
  BookOpen,
  BrainCircuit,
  LineChart,
  Star,
  ArrowUpRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { useHPTrial } from '@/contexts/HPTrialContext';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import { FreemiumBanner } from '@/components/FreemiumBanner';
import { HPPaywallModal } from '@/components/hogskoleprovet/HPPaywallModal';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel, HP_FULL_TEST_VERSIONS, HPSectionConfig } from '@/constants/hogskoleprovet';
import { getRandomTips } from '@/constants/hogskoleprovet-study-tips';
import { COLORS } from '@/constants/design-system';
import { useHPStudyPlan, PLAN_CONFIGS } from '@/contexts/HPStudyPlanContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VERBAL_CODES = ['ORD', 'LÄS', 'MEK', 'ELF'];
const KVANT_CODES = ['XYZ', 'KVA', 'NOG', 'DTK'];

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, maxScore, color, size = 80, strokeWidth = 6 }: {
  score: number; maxScore: number; color: string; size?: number; strokeWidth?: number;
}) {
  const pct = Math.min(1, score / maxScore);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: color + '22',
      }} />
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'transparent',
        borderTopColor: pct > 0.05 ? color : 'transparent',
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={{ fontSize: size >= 80 ? 22 : 13, fontWeight: '900' as const, color, letterSpacing: -0.8 }}>
        {score.toFixed(1)}
      </Text>
      <Text style={{ fontSize: 10, fontWeight: '600' as const, color: color + '99', marginTop: 1 }}>
        /{maxScore.toFixed(1)}
      </Text>
    </View>
  );
}

// ─── Full Test Modal ───────────────────────────────────────────────────────────

function FullTestVersionModal({ visible, onClose, onSelectVersion }: {
  visible: boolean; onClose: () => void; onSelectVersion: (versionId?: string) => void;
}) {
  const { theme, isDark } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={fm.overlay}>
        <View style={[fm.content, { backgroundColor: theme.colors.background }]}>
          <View style={fm.header}>
            <View style={fm.headerLeft}>
              <LinearGradient colors={[COLORS.primary, '#8B5CF6']} style={fm.headerIcon}>
                <GraduationCap size={20} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[fm.title, { color: theme.colors.text }]}>Välj provversion</Text>
                <Text style={[fm.subtitle, { color: theme.colors.textSecondary }]}>Komplett högskoleprov</Text>
              </View>
            </View>
            <TouchableOpacity style={[fm.closeBtn, { backgroundColor: theme.colors.surface }]} onPress={onClose}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={fm.scroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={[fm.mixedCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}
              onPress={() => onSelectVersion('')} activeOpacity={0.7}>
              <LinearGradient colors={[COLORS.primary, '#8B5CF6']} style={fm.mixedIcon}>
                <Shuffle size={24} color="#FFF" />
              </LinearGradient>
              <View style={fm.mixedText}>
                <Text style={[fm.mixedTitle, { color: theme.colors.text }]}>Blandade frågor</Text>
                <Text style={[fm.mixedDesc, { color: theme.colors.textSecondary }]}>Slumpmässigt urval · 120 frågor · 235 min</Text>
              </View>
              <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
            </TouchableOpacity>
            {HP_FULL_TEST_VERSIONS.length > 0 && (
              <View style={fm.divider}>
                <View style={[fm.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[fm.dividerText, { color: theme.colors.textSecondary }]}>Provtillfällen</Text>
                <View style={[fm.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>
            )}
            {HP_FULL_TEST_VERSIONS.map((version) => (
              <TouchableOpacity key={version.id} style={[fm.versionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => onSelectVersion(version.id)} activeOpacity={0.7}>
                <View style={[fm.versionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Text style={fm.seasonEmoji}>{version.season === 'spring' ? '🌸' : '🍂'}</Text>
                </View>
                <View style={fm.versionInfo}>
                  <Text style={[fm.versionName, { color: theme.colors.text }]}>{version.displayName}</Text>
                  <View style={fm.versionMeta}>
                    <Target size={12} color={theme.colors.textSecondary} />
                    <Text style={[fm.versionMetaText, { color: theme.colors.textSecondary }]}>{version.questionCount} frågor</Text>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text style={[fm.versionMetaText, { color: theme.colors.textSecondary }]}>{version.timeMinutes} min</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Section Card (redesigned — larger, more premium) ──────────────────────────

function SectionCard({ section, progress, isLocked, onPress, isDark, theme }: {
  section: HPSectionConfig; progress: any; isLocked: boolean; onPress: () => void; isDark: boolean; theme: any;
}) {
  const hasData = progress.attempts > 0;
  const accuracyPct = hasData ? Math.round(progress.averageScore) : 0;
  const est = hasData ? ((progress.averageScore / 100) * section.maxScore).toFixed(1) : null;
  const accuracyColor = accuracyPct >= 70 ? '#10B981' : accuracyPct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity
      style={[sc.card, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={sc.topRow}>
        {/* Left color stripe + icon */}
        <View style={sc.leftBlock}>
          <View style={[sc.colorStripe, { backgroundColor: section.color }]} />
          <LinearGradient colors={isLocked ? ['#4B5563', '#374151'] : section.gradientColors as any} style={sc.iconBg}>
            {isLocked ? <Lock size={20} color="rgba(255,255,255,0.5)" /> : <Text style={sc.iconEmoji}>{section.icon}</Text>}
          </LinearGradient>
        </View>

        {/* Center info */}
        <View style={sc.infoBlock}>
          <Text style={[sc.sectionCode, { color: section.color }]}>{section.name}</Text>
          <Text style={[sc.fullName, { color: theme.colors.text }]}>{section.fullName}</Text>
          <View style={sc.metaRow}>
            <Clock size={11} color={theme.colors.textSecondary} />
            <Text style={[sc.meta, { color: theme.colors.textSecondary }]}>
              {section.timeMinutes} min · {section.questionCount} frågor
            </Text>
          </View>
          {!isLocked && hasData && (
            <View style={[sc.accuracyBadge, { backgroundColor: accuracyColor + '18' }]}>
              <Text style={[sc.accuracyText, { color: accuracyColor }]}>{accuracyPct}% rätt</Text>
            </View>
          )}
        </View>

        {/* Right: score or lock */}
        <View style={sc.rightBlock}>
          {!isLocked && hasData ? (
            <View style={sc.scoreGroup}>
              <Text style={[sc.scoreNum, { color: section.color }]}>{est}</Text>
              <Text style={[sc.scoreMax, { color: theme.colors.textSecondary }]}>/{section.maxScore}p</Text>
            </View>
          ) : isLocked ? (
            <View style={[sc.lockBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <Lock size={14} color={theme.colors.textSecondary} />
            </View>
          ) : (
            <View style={[sc.playBtn, { backgroundColor: section.color + '20' }]}>
              <Play size={16} color={section.color} fill={section.color} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Tab Screen ──────────────────────────────────────────────────────────

export default function HogskoleprovetTab() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  const freemium = useFreemiumLimits();
  const hpLimit = freemium.checkHPSection();
  const { getUserStats, getEstimatedHPScore, getUnlockedMilestones, getSectionProgress } = useHogskoleprovet();
  const { canAccessContent } = useHPTrial();
  const { plan, getDaysUntilHP, getCountdownMessage, getTodayProgress } = useHPStudyPlan();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [fullTestModalVisible, setFullTestModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<'before_trial' | 'after_trial'>('before_trial');
  const [expandedGroup, setExpandedGroup] = useState<'verbal' | 'kvant' | null>(null);

  const daysUntilHP = getDaysUntilHP();
  const countdownMsg = getCountdownMessage(daysUntilHP);
  const todayHPProgress = getTodayProgress();
  const stats = getUserStats();
  const estimatedScore = getEstimatedHPScore();
  const unlockedMilestones = getUnlockedMilestones();
  const scoreInfo = getScoreLabel(estimatedScore);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleStartFullTest = async () => {
    if (!isPremium) {
      if (canAccessContent('full_test')) {
        setFullTestModalVisible(true);
      } else {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      }
      return;
    }
    setFullTestModalVisible(true);
  };

  const handleStartFullTestWithVersion = (testVersionId?: string) => {
    setFullTestModalVisible(false);
    router.push({ pathname: ROUTES.hpTest, params: { testVersionId: testVersionId || '' } });
  };

  const handleStartSection = (sectionCode: string) => {
    if (!isPremium) {
      if (hpLimit.isAllowed || canAccessContent('delprov', sectionCode)) {
        freemium.trackUsage('hp_section', { sectionCode });
        router.push({ pathname: ROUTES.hpSelectVersion, params: { sectionCode } });
      } else {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      }
      return;
    }
    router.push({ pathname: ROUTES.hpSelectVersion, params: { sectionCode } });
  };

  const verbalSections = HP_SECTIONS.filter(s => VERBAL_CODES.includes(s.code));
  const kvantSections = HP_SECTIONS.filter(s => KVANT_CODES.includes(s.code));

  const urgencyColor = daysUntilHP >= 60 ? '#10B981' : daysUntilHP >= 30 ? '#F97316' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═══════════════════ HERO ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81', '#4338CA', '#1E1B4B'] : ['#4F46E5', '#7C3AED', '#A855F7', '#6366F1']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            {/* Decorative elements */}
            <View style={[styles.heroGlow1, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
            <View style={[styles.heroGlow2, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
            <View style={[styles.heroGlow3, { backgroundColor: 'rgba(255,215,0,0.08)' }]} />

            {/* Top row: Title + PRO badge */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroTitleGroup}>
                <View style={styles.heroIconCircle}>
                  <GraduationCap size={28} color="#FFF" strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.heroGreeting}>Högskoleprovet</Text>
                  <Text style={styles.heroDate}>Höst 2026 · 18 oktober</Text>
                </View>
              </View>
              {isPremium && (
                <View style={styles.heroProBadge}>
                  <Crown size={14} color="#FFD700" />
                  <Text style={styles.heroProText}>PRO</Text>
                </View>
              )}
            </View>

            {/* Center: Countdown + Score ring */}
            <View style={styles.heroCenter}>
              <View style={styles.heroCountdownBlock}>
                <View style={[styles.heroDaysPill, { backgroundColor: urgencyColor + '25', borderColor: urgencyColor + '50' }]}>
                  <Text style={[styles.heroDaysNum, { color: urgencyColor }]}>{daysUntilHP}</Text>
                  <Text style={[styles.heroDaysLabel, { color: urgencyColor + 'BB' }]}>dagar kvar</Text>
                </View>
                <Text style={styles.heroCountdownMsg} numberOfLines={2}>{countdownMsg}</Text>
                {/* Streak */}
                <View style={styles.heroStreakRow}>
                  <Flame size={16} color="#F97316" />
                  <Text style={styles.heroStreakText}>{stats.currentStreak} dagars streak</Text>
                </View>
              </View>

              {isPremium && stats.totalAttempts > 0 && (
                <View style={styles.heroScoreBlock}>
                  <ScoreRing score={estimatedScore} maxScore={2.0} color="#FFD700" size={88} strokeWidth={7} />
                  <Text style={styles.heroScoreLabel}>Uppskattat resultat</Text>
                </View>
              )}
            </View>

            {/* Bottom CTA row */}
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroStudyPlanBtn}
                onPress={() => router.push(ROUTES.hpStudyPlan)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#FFFFFF', 'rgba(255,255,255,0.85)']} style={styles.heroStudyPlanGradient}>
                  <Calendar size={18} color="#4F46E5" />
                  <Text style={styles.heroStudyPlanText}>Studieplan</Text>
                  <ArrowUpRight size={16} color="#4F46E5" />
                </LinearGradient>
              </TouchableOpacity>

              {!isPremium && (
                <TouchableOpacity style={styles.heroUnlockBtn} onPress={() => router.push(ROUTES.premium)} activeOpacity={0.85}>
                  <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.heroUnlockGradient}>
                    <Crown size={16} color="#000" />
                    <Text style={styles.heroUnlockText}>Lås upp PRO</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom stat pills */}
            {isPremium && (
              <View style={styles.heroStatPills}>
                <View style={styles.heroStatPill}>
                  <Target size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatPillValue}>{stats.totalAttempts}</Text>
                  <Text style={styles.heroStatPillLabel}>pass</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatPill}>
                  <Clock size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatPillValue}>{stats.totalStudyTime}h</Text>
                  <Text style={styles.heroStatPillLabel}>studietid</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatPill}>
                  <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatPillValue}>{scoreInfo.label}</Text>
                  <Text style={styles.heroStatPillLabel}>nivå</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ═══════════════════ QUICK OVERVIEW ═══════════════════ */}
        {isPremium && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.overviewSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>ÖVERSIKT</Text>
              <View style={styles.overviewCards}>
                {/* Progress card */}
                <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <View style={styles.overviewCardTop}>
                    <View style={[styles.overviewDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.overviewCardTitle, { color: theme.colors.text }]}>Dagens mål</Text>
                  </View>
                  <Text style={[styles.overviewCardValue, { color: theme.colors.text }]}>
                    {todayHPProgress ? (todayHPProgress.ordCompleted + todayHPProgress.mekCompleted + todayHPProgress.quantCompleted) : '—'}
                  </Text>
                  <Text style={[styles.overviewCardSub, { color: theme.colors.textSecondary }]}>uppgifter klara</Text>
                  {/* Mini progress bar */}
                  <View style={[styles.miniProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={[styles.miniProgressFill, {
                      backgroundColor: COLORS.primary,
                      width: `${todayHPProgress ? Math.min(100, ((todayHPProgress.ordCompleted + todayHPProgress.mekCompleted + todayHPProgress.quantCompleted) / 27) * 100) : 0}%`,
                    }]} />
                  </View>
                </View>

                {/* Target card */}
                <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <View style={styles.overviewCardTop}>
                    <View style={[styles.overviewDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={[styles.overviewCardTitle, { color: theme.colors.text }]}>Mål</Text>
                  </View>
                  <Text style={[styles.overviewCardValue, { color: '#FFD700' }]}>
                    ~{estimatedScore.toFixed(1)}
                  </Text>
                  <Text style={[styles.overviewCardSub, { color: theme.colors.textSecondary }]}>HP-poäng</Text>
                  <View style={[styles.miniProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={[styles.miniProgressFill, {
                      backgroundColor: '#FFD700',
                      width: `${Math.min(100, (estimatedScore / 2.0) * 100)}%`,
                    }]} />
                  </View>
                </View>

                {/* Streak card */}
                <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <View style={styles.overviewCardTop}>
                    <View style={[styles.overviewDot, { backgroundColor: '#F97316' }]} />
                    <Text style={[styles.overviewCardTitle, { color: theme.colors.text }]}>Streak</Text>
                  </View>
                  <View style={styles.overviewStreakRow}>
                    <Flame size={20} color="#F97316" />
                    <Text style={[styles.overviewCardValue, { color: '#F97316' }]}>{stats.currentStreak}</Text>
                  </View>
                  <Text style={[styles.overviewCardSub, { color: theme.colors.textSecondary }]}>dagar i rad</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════ QUICK TOOLS ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Snabbverktyg</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>AI-drivna hjälpmedel för dina studier</Text>
          </View>
          <View style={styles.toolsGrid}>
            {/* Math AI */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}
              onPress={() => router.push((ROUTES.mathChat + '?course=H%C3%B6gskoleprovet') as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.toolIconSmall}>
                <Calculator size={20} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.toolTitleSmall, { color: theme.colors.text }]}>Matte AI</Text>
            </TouchableOpacity>

            {/* Generell AI */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: isDark ? '#1A2E1A' : '#ECFDF5' }]}
              onPress={() => router.push((ROUTES.generalChat + '?course=H%C3%B6gskoleprovet') as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.toolIconSmall}>
                <MessageCircle size={20} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.toolTitleSmall, { color: theme.colors.text }]}>Generell AI</Text>
            </TouchableOpacity>

            {/* AI Generator */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: isDark ? '#2D1B2E' : '#FDF2F8' }]}
              onPress={() => router.push(ROUTES.hpAiGenerator)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.toolIconSmall}>
                <Sparkles size={20} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.toolTitleSmall, { color: theme.colors.text }]}>AI-generator</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ═══════════════════ COMPLETE HÖGSKOLEPROVET ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Komplett högskoleprov</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Öva på hela provet under verkliga förhållanden</Text>
          </View>

          {/* Main full test card */}
          <TouchableOpacity
            style={[styles.fullTestCard, !isPremium && styles.fullTestLocked]}
            onPress={handleStartFullTest}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isPremium
                ? isDark ? ['#4F46E5', '#7C3AED', '#BE185D'] : ['#6366F1', '#8B5CF6', '#EC4899']
                : ['#374151', '#1F2937']
              }
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.fullTestGradient}
            >
              {!isPremium && (
                <View style={styles.fullTestLockOverlay}>
                  <Lock size={32} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.fullTestLockText}>Lås upp med Premium</Text>
                </View>
              )}
              <View style={styles.fullTestInner}>
                <View style={styles.fullTestIconLarge}>
                  <Play size={32} color="#FFF" fill="#FFF" />
                </View>
                <View style={styles.fullTestTextBlock}>
                  <Text style={styles.fullTestTitle}>Hela provet</Text>
                  <Text style={styles.fullTestSubtitle}>Alla 8 delprov · 260 min · 160 frågor</Text>
                </View>
              </View>
              <View style={styles.fullTestPassRow}>
                {[
                  { label: 'Verbal 1', sub: 'ORD/LÄS', icon: '📖' },
                  { label: 'Verbal 2', sub: 'MEK/ELF', icon: '📝' },
                  { label: 'Kvant 1', sub: 'XYZ/KVA', icon: '🔢' },
                  { label: 'Kvant 2', sub: 'NOG/DTK', icon: '📊' },
                ].map((p, i) => (
                  <View key={i} style={styles.fullTestPassItem}>
                    <Text style={styles.fullTestPassIcon}>{p.icon}</Text>
                    <View>
                      <Text style={styles.fullTestPassLabel}>{p.label}</Text>
                      <Text style={styles.fullTestPassSub}>{p.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>


        </Animated.View>

        {!isPremium && <FreemiumBanner feature="hp_section" status={hpLimit} style={{ marginBottom: 36 }} />}

        {/* ═══════════════════ VERBAL SECTION ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#6366F115' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#6366F1' }]}>VERBAL</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Verbala delprov</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Ordförståelse, läsning och språklig analys</Text>
          </View>

          {/* Collapsible trigger */}
          <TouchableOpacity
            style={[styles.collapseTrigger, { backgroundColor: theme.colors.surface, borderColor: '#6366F120' }]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpandedGroup(expandedGroup === 'verbal' ? null : 'verbal');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.collapseTriggerLeft}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.collapseTriggerIcon}>
                <Text style={styles.collapseTriggerEmoji}>📖</Text>
              </LinearGradient>
              <View style={styles.collapseTriggerText}>
                <Text style={[styles.collapseTriggerTitle, { color: theme.colors.text }]}>Visa verbala delprov</Text>
                <Text style={[styles.collapseTriggerSub, { color: theme.colors.textSecondary }]}>ORD · LÄS · MEK · ELF</Text>
              </View>
            </View>
            <ChevronDown
              size={20}
              color={theme.colors.textSecondary}
              style={{ transform: [{ rotate: expandedGroup === 'verbal' ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {expandedGroup === 'verbal' && (
            <View style={styles.collapseContent}>
              {verbalSections.map((section) => (
                <SectionCard key={section.code} section={section} progress={getSectionProgress(section.code)}
                  isLocked={!isPremium} onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ═══════════════════ QUANTITATIVE SECTION ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 36 }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#EC489915' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#EC4899' }]}>KVANTITATIV</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kvantitativa delprov</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Matematik, logik och dataanalys</Text>
          </View>

          <TouchableOpacity
            style={[styles.collapseTrigger, { backgroundColor: theme.colors.surface, borderColor: '#EC489920' }]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpandedGroup(expandedGroup === 'kvant' ? null : 'kvant');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.collapseTriggerLeft}>
              <LinearGradient colors={['#EC4899', '#F97316']} style={styles.collapseTriggerIcon}>
                <Text style={styles.collapseTriggerEmoji}>🔢</Text>
              </LinearGradient>
              <View style={styles.collapseTriggerText}>
                <Text style={[styles.collapseTriggerTitle, { color: theme.colors.text }]}>Visa kvantitativa delprov</Text>
                <Text style={[styles.collapseTriggerSub, { color: theme.colors.textSecondary }]}>XYZ · KVA · NOG · DTK</Text>
              </View>
            </View>
            <ChevronDown
              size={20}
              color={theme.colors.textSecondary}
              style={{ transform: [{ rotate: expandedGroup === 'kvant' ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {expandedGroup === 'kvant' && (
            <View style={styles.collapseContent}>
              {kvantSections.map((section) => (
                <SectionCard key={section.code} section={section} progress={getSectionProgress(section.code)}
                  isLocked={!isPremium} onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ═══════════════════ PREMIUM UPSELL ═══════════════════ */}
        {!isPremium && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity style={[styles.upsellCard, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF' }]}
              onPress={() => router.push(ROUTES.premium)} activeOpacity={0.85}>
              <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.upsellBadge}>
                <Crown size={16} color="#000" />
                <Text style={styles.upsellBadgeText}>LÅS UPP ALLT</Text>
              </LinearGradient>
              <Text style={[styles.upsellTitle, { color: theme.colors.text }]}>Få tillgång till alla delprov</Text>
              <Text style={[styles.upsellSub, { color: theme.colors.textSecondary }]}>
                Full tillgång till 8 delprov · AI-generator · Studieplan · Obegränsat övande
              </Text>
              <View style={[styles.upsellCta, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.upsellCtaText}>Se Premium</Text>
                <ChevronRight size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ═══════════════════ STUDY TIPS ═══════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Expertråd för att maximera ditt resultat</Text>
          </View>
          <View style={styles.tipsGrid}>
            {(() => {
              const tips = getRandomTips(3);
              return tips.map((tip) => (
                <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.tipIconBg, { backgroundColor: `${tip.color}20` }]}>
                    <Text style={styles.tipEmoji}>{tip.icon}</Text>
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                    <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>{tip.description}</Text>
                  </View>
                </View>
              ));
            })()}
          </View>
          <TouchableOpacity style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(ROUTES.studyTips)}>
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>Visa alla studietips</Text>
            <ChevronRight size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {fullTestModalVisible && (
        <FullTestVersionModal visible={fullTestModalVisible} onClose={() => setFullTestModalVisible(false)}
          onSelectVersion={handleStartFullTestWithVersion} />
      )}

      <HPPaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)}
        onUpgrade={() => { setPaywallVisible(false); router.push(ROUTES.premium); }}
        type={paywallType} />
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // ═══ HERO ═══
  hero: {
    borderRadius: 32,
    padding: 28,
    marginBottom: 36,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 16,
    minHeight: 340,
  },
  heroGlow1: {
    position: 'absolute', top: -80, right: -50,
    width: 220, height: 220, borderRadius: 110,
  },
  heroGlow2: {
    position: 'absolute', bottom: -60, left: -40,
    width: 180, height: 180, borderRadius: 90,
  },
  heroGlow3: {
    position: 'absolute', top: '30%', right: '-20%',
    width: 160, height: 160, borderRadius: 80,
  },

  // Hero top row
  heroTopRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 28,
  },
  heroTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroGreeting: { fontSize: 28, fontWeight: '900' as const, color: '#FFF', letterSpacing: -0.6 },
  heroDate: { fontSize: 14, fontWeight: '500' as const, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroProBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.20)',
    gap: 5, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  heroProText: { fontSize: 12, fontWeight: '800' as const, color: '#FFD700', letterSpacing: 0.8 },

  // Hero center
  heroCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heroCountdownBlock: { flex: 1, marginRight: 20 },
  heroDaysPill: {
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 18, alignSelf: 'flex-start', marginBottom: 10, borderWidth: 1,
  },
  heroDaysNum: { fontSize: 38, fontWeight: '900' as const, letterSpacing: -1.5, lineHeight: 42 },
  heroDaysLabel: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const, marginTop: 2 },
  heroCountdownMsg: { fontSize: 13, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: 12 },
  heroStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStreakText: { fontSize: 13, fontWeight: '700' as const, color: 'rgba(255,255,255,0.9)' },
  heroScoreBlock: { alignItems: 'center', gap: 8 },
  heroScoreLabel: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },

  // Hero actions
  heroActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  heroStudyPlanBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  heroStudyPlanGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 16, gap: 8 },
  heroStudyPlanText: { fontSize: 15, fontWeight: '700' as const, color: '#4F46E5' },
  heroUnlockBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  heroUnlockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 16, gap: 8 },
  heroUnlockText: { fontSize: 15, fontWeight: '700' as const, color: '#000' },

  // Hero stat pills
  heroStatPills: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)',
  },
  heroStatPill: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatPillValue: { fontSize: 16, fontWeight: '800' as const, color: '#FFF' },
  heroStatPillLabel: { fontSize: 10, fontWeight: '600' as const, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' as const },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  // ═══ SECTION HEADERS ═══
  sectionHeader: { marginBottom: 18, marginTop: 0 },
  sectionBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 10 },
  sectionBadgeText: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 1 },
  sectionTitle: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.4, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, marginBottom: 12 },

  // ═══ QUICK OVERVIEW ═══
  overviewSection: { marginBottom: 36 },
  overviewCards: { flexDirection: 'row', gap: 10 },
  overviewCard: {
    flex: 1, borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  overviewCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  overviewDot: { width: 8, height: 8, borderRadius: 4 },
  overviewCardTitle: { fontSize: 12, fontWeight: '700' as const },
  overviewCardValue: { fontSize: 24, fontWeight: '900' as const, letterSpacing: -0.8, marginBottom: 2 },
  overviewCardSub: { fontSize: 10, fontWeight: '600' as const },
  overviewStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  miniProgressBg: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 2 },

  // ═══ QUICK TOOLS ═══
  toolsGrid: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  toolCard: {
    flex: 1, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  toolIconSmall: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolTitleSmall: { fontSize: 13, fontWeight: '700' as const, textAlign: 'center' },

  // ═══ COMPLETE HP ═══
  fullTestCard: {
    borderRadius: 26, overflow: 'hidden',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
    marginBottom: 36,
  },
  fullTestLocked: { opacity: 0.88 },
  fullTestGradient: { padding: 26 },
  fullTestLockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1, borderRadius: 26,
  },
  fullTestLockText: { fontSize: 15, fontWeight: '700' as const, color: 'rgba(255,255,255,0.7)', marginTop: 10 },
  fullTestInner: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 22 },
  fullTestIconLarge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  fullTestTextBlock: { flex: 1 },
  fullTestTitle: { fontSize: 22, fontWeight: '900' as const, color: '#FFF', marginBottom: 4 },
  fullTestSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' as const },
  fullTestPassRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)',
    gap: 10,
  },
  fullTestPassItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  fullTestPassIcon: { fontSize: 18 },
  fullTestPassLabel: { fontSize: 13, fontWeight: '700' as const, color: 'rgba(255,255,255,0.9)' },
  fullTestPassSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' as const },

  // ═══ COLLAPSIBLE GROUPS ═══
  collapseTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 18, borderRadius: 22, borderWidth: 1.5, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  collapseTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  collapseTriggerIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  collapseTriggerEmoji: { fontSize: 24 },
  collapseTriggerText: { flex: 1, gap: 3 },
  collapseTriggerTitle: { fontSize: 17, fontWeight: '700' as const },
  collapseTriggerSub: { fontSize: 12, fontWeight: '500' as const },
  collapseContent: { paddingTop: 8, gap: 10, marginBottom: 0 },

  // ═══ UPSELL ═══
  upsellCard: { borderRadius: 22, padding: 24, marginTop: 36, marginBottom: 36, alignItems: 'center' },
  upsellBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, gap: 6, marginBottom: 14 },
  upsellBadgeText: { fontSize: 12, fontWeight: '800' as const, color: '#000', letterSpacing: 0.8 },
  upsellTitle: { fontSize: 20, fontWeight: '800' as const, textAlign: 'center', marginBottom: 8 },
  upsellSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 18 },
  upsellCta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 8 },
  upsellCtaText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },

  // ═══ STUDY TIPS ═══
  tipsGrid: { gap: 12, marginBottom: 12 },
  tipCard: {
    padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  tipIconBg: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  tipEmoji: { fontSize: 24 },
  tipContent: { flex: 1, gap: 4 },
  tipTitle: { fontSize: 15, fontWeight: '700' as const },
  tipDescription: { fontSize: 13, lineHeight: 19 },
  viewMoreTips: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 16, gap: 8, marginTop: 8,
  },
  viewMoreText: { fontSize: 15, fontWeight: '600' as const },
});

// ─── SECTION CARD STYLES (redesigned — larger, more premium) ───────────────────

const sc = StyleSheet.create({
  card: {
    borderRadius: 20, marginBottom: 0, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  leftBlock: { flexDirection: 'row', alignItems: 'stretch', height: 56 },
  colorStripe: { width: 4, borderRadius: 2, marginRight: 14 },
  iconBg: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  iconEmoji: { fontSize: 22 },
  infoBlock: { flex: 1, gap: 3 },
  sectionCode: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 0.3, marginBottom: 1 },
  fullName: { fontSize: 14, fontWeight: '600' as const, marginBottom: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  meta: { fontSize: 12, fontWeight: '500' as const },
  accuracyBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  accuracyText: { fontSize: 12, fontWeight: '700' as const },
  rightBlock: { alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 },
  scoreGroup: { alignItems: 'flex-end' },
  scoreNum: { fontSize: 26, fontWeight: '900' as const, letterSpacing: -0.8 },
  scoreMax: { fontSize: 11, fontWeight: '600' as const, marginTop: -2 },
  lockBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

// ─── FULL TEST MODAL STYLES ────────────────────────────────────────────────────

const fm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', paddingBottom: 34 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 13, marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20 },
  mixedCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, gap: 14, marginBottom: 16 },
  mixedIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mixedText: { flex: 1 },
  mixedTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 4 },
  mixedDesc: { fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600' as const, textTransform: 'uppercase' as const },
  versionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, gap: 14 },
  versionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  seasonEmoji: { fontSize: 24 },
  versionInfo: { flex: 1 },
  versionName: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4 },
  versionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  versionMetaText: { fontSize: 12, marginRight: 8 },
});
