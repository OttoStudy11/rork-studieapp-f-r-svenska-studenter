import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  BookOpen,
  Calculator,
  Star,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { useHPTrial } from '@/contexts/HPTrialContext';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import { FreemiumBanner } from '@/components/FreemiumBanner';
import { HPTrialSelectionModal } from '@/components/hogskoleprovet/HPTrialSelectionModal';
import { HPPaywallModal } from '@/components/hogskoleprovet/HPPaywallModal';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel, HP_FULL_TEST_VERSIONS, HPSectionConfig } from '@/constants/hogskoleprovet';
import { getRandomTips } from '@/constants/hogskoleprovet-study-tips';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/design-system';
import { useHPStudyPlan, PLAN_CONFIGS } from '@/contexts/HPStudyPlanContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Group constants ──────────────────────────────────────────────────────────
const VERBAL_CODES = ['ORD', 'LÄS', 'MEK', 'ELF'];
const KVANT_CODES = ['XYZ', 'KVA', 'NOG', 'DTK'];

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, maxScore, color, size = 72 }: {
  score: number;
  maxScore: number;
  color: string;
  size?: number;
}) {
  const pct = Math.min(1, Math.max(0, score / maxScore));
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color + '18',
      }} />
      {/* Progress ring */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: 'transparent',
        borderTopColor: pct > 0.02 ? color : 'transparent',
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{
          fontSize: size >= 72 ? 20 : 14,
          fontWeight: '800' as const,
          color,
          letterSpacing: -0.5,
        }}>
          {score.toFixed(1)}
        </Text>
        <Text style={{
          fontSize: 10,
          fontWeight: '600' as const,
          color: color + '99',
          marginTop: -1,
        }}>
          /{maxScore.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

// ─── Countdown Card ───────────────────────────────────────────────────────────
function HPCountdownCard({
  daysUntil,
  countdownMsg,
  plan,
  todayProgress,
  isDark,
  theme,
}: {
  daysUntil: number;
  countdownMsg: string;
  plan: any;
  todayProgress: any;
  isDark: boolean;
  theme: any;
}) {
  const planConfig = plan ? PLAN_CONFIGS.find((c: any) => c.type === plan.planType) : null;
  const nextHP = { label: 'Höst 2026 · 18 oktober', icon: '🍂' };
  const urgencyColor = daysUntil >= 60 ? '#10B981' : daysUntil >= 30 ? '#F97316' : '#EF4444';
  const todayPct = plan && todayProgress && planConfig ? Math.min(100, Math.round(
    (((todayProgress.ordCompleted / (planConfig?.wordsPerDay ?? 30)) +
      (todayProgress.mekCompleted / (planConfig?.mekPerDay ?? 3)) +
      (todayProgress.quantCompleted / (planConfig?.quantPerDay ?? 12))) / 3) * 100
  )) : 0;

  return (
    <TouchableOpacity
      style={[countdownStyles.card, {
        backgroundColor: isDark ? '#1A2235' : '#F4F6FF',
        shadowColor: urgencyColor,
        borderWidth: 1,
        borderColor: urgencyColor + '20',
      }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(ROUTES.hpStudyPlan); }}
      activeOpacity={0.85}
    >
      <View style={countdownStyles.inner}>
        <View style={[countdownStyles.daysBlock, {
          backgroundColor: urgencyColor + '12',
          borderColor: urgencyColor + '30',
          borderWidth: 1.5,
        }]}>
          <Text style={[countdownStyles.daysNum, { color: urgencyColor }]}>{daysUntil}</Text>
          <Text style={[countdownStyles.daysSub, { color: urgencyColor + 'BB' }]}>dagar</Text>
        </View>

        <View style={countdownStyles.infoBlock}>
          <View style={[countdownStyles.examPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Calendar size={11} color={theme.colors.textSecondary} />
            <Text style={[countdownStyles.examLabel, { color: theme.colors.textSecondary }]}>{nextHP.icon} {nextHP.label}</Text>
          </View>
          <Text style={[countdownStyles.msg, { color: theme.colors.text }]} numberOfLines={2}>{countdownMsg}</Text>
          {planConfig ? (
            <View style={[countdownStyles.planBadge, {
              backgroundColor: planConfig.color + '14',
              borderColor: planConfig.color + '30',
              borderWidth: 1,
            }]}>
              <Text style={[countdownStyles.planBadgeText, { color: planConfig.color }]}>
                {planConfig.emoji} {planConfig.name}
              </Text>
            </View>
          ) : (
            <Text style={[countdownStyles.ctaText, { color: COLORS.primary }]}>Starta studieplan →</Text>
          )}
        </View>

        <View style={[countdownStyles.arrowBtn, { backgroundColor: COLORS.primary + '12' }]}>
          <ChevronRight size={16} color={COLORS.primary} />
        </View>
      </View>

      {plan && planConfig && (
        <View style={countdownStyles.progressRow}>
          <View style={[countdownStyles.progressBg, { backgroundColor: theme.colors.border }]}>
            <LinearGradient
              colors={[urgencyColor, urgencyColor + '88']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[countdownStyles.progressFill, { width: `${todayPct}%` as any }]}
            />
          </View>
          <Text style={[countdownStyles.progressLabel, { color: theme.colors.textSecondary }]}>{todayPct}% idag</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Collapsible Section Group ────────────────────────────────────────────────
function CollapsibleSectionGroup({
  title,
  subtitle,
  color,
  icon,
  sections,
  getSectionProgress,
  isPremium,
  isDark,
  theme,
  onPressSection,
  defaultExpanded,
}: {
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  sections: HPSectionConfig[];
  getSectionProgress: (code: string) => { attempts: number; averageScore: number; bestScore: number };
  isPremium: boolean;
  isDark: boolean;
  theme: any;
  onPressSection: (code: string) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const expandAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        damping: 14,
        stiffness: 150,
      }),
      Animated.timing(expandAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const completedCount = sections.filter(s => getSectionProgress(s.code).attempts > 0).length;
  const totalAvg = sections.reduce((sum, s) => {
    const p = getSectionProgress(s.code);
    return sum + (p.attempts > 0 ? p.averageScore : 0);
  }, 0) / Math.max(1, completedCount);

  return (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        style={[groupStyles.trigger, {
          backgroundColor: isDark ? '#1A2235' : '#F8FAFF',
          borderColor: color + '25',
          borderWidth: 1,
        }]}
        onPress={toggleExpand}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[color + '18', color + '06']}
          style={groupStyles.triggerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={groupStyles.triggerLeft}>
            <View style={[groupStyles.triggerIcon, { backgroundColor: color + '18' }]}>
              {icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[groupStyles.triggerTitle, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[groupStyles.triggerSubtitle, { color: theme.colors.textSecondary }]}>
                {sections.map(s => s.code).join(' · ')} · {subtitle}
              </Text>
            </View>
          </View>
          <View style={groupStyles.triggerRight}>
            {completedCount > 0 && isPremium && (
              <View style={[groupStyles.triggerBadge, { backgroundColor: color + '14' }]}>
                <Text style={[groupStyles.triggerBadgeText, { color }]}>
                  {completedCount}/{sections.length}
                </Text>
              </View>
            )}
            <Animated.View style={{
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              }],
            }}>
              <ChevronDown size={18} color={theme.colors.textSecondary} />
            </Animated.View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {expanded && (
        <Animated.View style={{ opacity: expandAnim }}>
          <View style={groupStyles.expandedContent}>
            {sections.map((section) => {
              const progress = getSectionProgress(section.code);
              const hasData = progress.attempts > 0;
              const accuracyPct = hasData ? Math.round(progress.averageScore) : 0;
              const accuracyColor = accuracyPct >= 70 ? '#10B981' : accuracyPct >= 50 ? '#F59E0B' : '#EF4444';

              return (
                <TouchableOpacity
                  key={section.code}
                  style={[groupStyles.sectionItem, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: theme.colors.border,
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPressSection(section.code);
                  }}
                  activeOpacity={0.7}
                >
                  {/* Color dot */}
                  <View style={[groupStyles.sectionDot, { backgroundColor: section.color }]} />

                  <View style={{ flex: 1 }}>
                    <View style={groupStyles.sectionNameRow}>
                      <Text style={[groupStyles.sectionCode, { color: section.color }]}>{section.code}</Text>
                      <Text style={[groupStyles.sectionFullName, { color: theme.colors.text }]}>{section.fullName}</Text>
                    </View>
                    <View style={groupStyles.sectionMetaRow}>
                      <Clock size={9} color={theme.colors.textSecondary} />
                      <Text style={[groupStyles.sectionMeta, { color: theme.colors.textSecondary }]}>
                        {section.timeMinutes} min · {section.questionCount} frågor
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    {isPremium && hasData ? (
                      <>
                        <Text style={[groupStyles.sectionScore, { color: section.color }]}>
                          {((progress.averageScore / 100) * section.maxScore).toFixed(1)}
                        </Text>
                        <View style={[groupStyles.accuracyChip, { backgroundColor: accuracyColor + '16' }]}>
                          <Text style={[groupStyles.accuracyChipText, { color: accuracyColor }]}>
                            {accuracyPct}%
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={[groupStyles.playBtn, { backgroundColor: section.color + '14' }]}>
                        <Play size={12} color={section.color} fill={section.color} />
                      </View>
                    )}
                  </View>

                  <ChevronRight size={12} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Premium Dashboard ────────────────────────────────────────────────────────
function PremiumDashboard({
  stats,
  estimatedScore,
  isDark,
  theme,
}: {
  stats: any;
  estimatedScore: number;
  isDark: boolean;
  theme: any;
}) {
  const scoreInfo = getScoreLabel(estimatedScore);

  const statItems = [
    { icon: <CheckCircle2 size={15} color="#10B981" />, value: stats.totalAttempts > 0 ? `${Math.round(stats.averageScore)}%` : '—', label: 'Snitträtt', color: '#10B981' },
    { icon: <Flame size={15} color="#F97316" />, value: stats.currentStreak > 0 ? `${stats.currentStreak}` : '0', label: 'Streak', color: '#F97316' },
    { icon: <Clock size={15} color="#6366F1" />, value: stats.totalStudyTime > 0 ? `${stats.totalStudyTime}h` : '—', label: 'Studietid', color: '#6366F1' },
    { icon: <TrendingUp size={15} color="#EC4899" />, value: stats.totalAttempts > 0 ? `${stats.totalAttempts}` : '0', label: 'Pass', color: '#EC4899' },
  ];

  return (
    <View style={dashboardStyles.wrapper}>
      {/* Main score card */}
      <LinearGradient
        colors={isDark
          ? ['rgba(79,70,229,0.25)', 'rgba(124,58,237,0.15)', 'rgba(79,70,229,0.08)']
          : ['rgba(79,70,229,0.12)', 'rgba(124,58,237,0.06)', 'rgba(236,72,153,0.04)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dashboardStyles.mainCard}
      >
        <View style={dashboardStyles.scoreSection}>
          <View style={dashboardStyles.scoreLeft}>
            <View style={dashboardStyles.trophyBg}>
              <Trophy size={22} color={scoreInfo.color} />
            </View>
            <View>
              <Text style={[dashboardStyles.scoreLabel, { color: theme.colors.textSecondary }]}>
                Uppskattat HP-resultat
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={[dashboardStyles.scoreValue, { color: scoreInfo.color }]}>
                  {estimatedScore.toFixed(2)}
                </Text>
                <Text style={[dashboardStyles.scoreMax, { color: theme.colors.textSecondary }]}>/ 2.0</Text>
              </View>
              <Text style={[dashboardStyles.scoreDesc, { color: theme.colors.textSecondary }]}>
                {scoreInfo.label}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[dashboardStyles.statsBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(ROUTES.hpStats); }}
          >
            <BarChart3 size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={dashboardStyles.progressBg}>
          <LinearGradient
            colors={[scoreInfo.color, scoreInfo.color + '66']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[dashboardStyles.progressFill, { width: `${Math.min(100, (estimatedScore / 2) * 100)}%` as any }]}
          />
        </View>

        {/* Stat pill row */}
        <View style={dashboardStyles.statsRow}>
          {statItems.map((item, i) => (
            <View key={i} style={[dashboardStyles.statPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={[dashboardStyles.statIconBg, { backgroundColor: item.color + '18' }]}>
                {item.icon}
              </View>
              <Text style={[dashboardStyles.statValue, { color: theme.colors.text }]}>{item.value}</Text>
              <Text style={[dashboardStyles.statLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* AI Generator card — nested inside dashboard */}
      <TouchableOpacity
        style={dashboardStyles.aiCard}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(ROUTES.hpAiGenerator); }}
        activeOpacity={0.82}
      >
        <LinearGradient
          colors={isDark ? ['#7C3AED', '#6366F1'] : ['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dashboardStyles.aiGradient}
        >
          <View style={dashboardStyles.aiLeft}>
            <Sparkles size={20} color="#FFF" />
            <View>
              <Text style={dashboardStyles.aiTitle}>AI-generator</Text>
              <Text style={dashboardStyles.aiSubtitle}>Skapa anpassade prov med AI</Text>
            </View>
          </View>
          <View style={dashboardStyles.aiRight}>
            <View style={dashboardStyles.aiBadge}>
              <Zap size={11} color="#FFD700" />
            </View>
            <ArrowRight size={18} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Full Test Version Modal ──────────────────────────────────────────────────
function FullTestVersionModal({
  visible,
  onClose,
  onSelectVersion,
  isPremium,
  isDark,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectVersion: (versionId?: string) => void;
  isPremium: boolean;
  isDark: boolean;
  theme: any;
}) {
  const getSeasonIcon = (season: 'spring' | 'fall') => season === 'spring' ? '🌸' : '🍂';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: theme.colors.background }]}>
          <View style={modalStyles.handle}>
            <View style={[modalStyles.handleBar, { backgroundColor: theme.colors.border }]} />
          </View>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <LinearGradient colors={[COLORS.primary, '#8B5CF6']} style={modalStyles.headerIcon}>
                <GraduationCap size={22} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[modalStyles.title, { color: theme.colors.text }]}>Välj provversion</Text>
                <Text style={[modalStyles.subtitle, { color: theme.colors.textSecondary }]}>Komplett högskoleprov</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[modalStyles.closeBtn, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[modalStyles.mixedCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }]}
              onPress={() => onSelectVersion('')}
              activeOpacity={0.75}
            >
              <LinearGradient colors={[COLORS.primary, '#8B5CF6']} style={modalStyles.mixedIcon}>
                <Shuffle size={24} color="#FFF" />
              </LinearGradient>
              <View style={modalStyles.mixedText}>
                <Text style={[modalStyles.mixedTitle, { color: theme.colors.text }]}>Blandade frågor</Text>
                <Text style={[modalStyles.mixedDesc, { color: theme.colors.textSecondary }]}>
                  Slumpmässigt urval · 120 frågor · 235 min
                </Text>
              </View>
              <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
            </TouchableOpacity>

            {HP_FULL_TEST_VERSIONS.length > 0 && (
              <View style={modalStyles.divider}>
                <View style={[modalStyles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[modalStyles.dividerText, { color: theme.colors.textSecondary }]}>PROVTILLFÄLLEN</Text>
                <View style={[modalStyles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>
            )}

            {HP_FULL_TEST_VERSIONS.map((version) => (
              <TouchableOpacity
                key={version.id}
                style={[modalStyles.versionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => onSelectVersion(version.id)}
                activeOpacity={0.7}
              >
                <View style={[modalStyles.versionIcon, { backgroundColor: `${COLORS.primary}12` }]}>
                  <Text style={modalStyles.seasonEmoji}>{getSeasonIcon(version.season)}</Text>
                </View>
                <View style={modalStyles.versionInfo}>
                  <Text style={[modalStyles.versionName, { color: theme.colors.text }]}>{version.displayName}</Text>
                  <View style={modalStyles.versionMeta}>
                    <Target size={12} color={theme.colors.textSecondary} />
                    <Text style={[modalStyles.versionMetaText, { color: theme.colors.textSecondary }]}>
                      {version.questionCount} frågor
                    </Text>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text style={[modalStyles.versionMetaText, { color: theme.colors.textSecondary }]}>
                      {version.timeMinutes} min
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HogskoleprovetScreen() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  const freemium = useFreemiumLimits();
  const hpLimit = freemium.checkHPSection();
  const {
    getUserStats,
    getEstimatedHPScore,
    getUnlockedMilestones,
    getSectionProgress,
  } = useHogskoleprovet();
  const {
    trialStatus,
    isTrialAvailable,
    canAccessContent,
  } = useHPTrial();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [fullTestModalVisible, setFullTestModalVisible] = useState(false);
  const [studyTips] = useState(() => getRandomTips(3));
  const [trialSelectionVisible, setTrialSelectionVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<'before_trial' | 'after_trial'>('before_trial');
  const { plan, getDaysUntilHP, getCountdownMessage, getTodayProgress } = useHPStudyPlan();

  const daysUntilHP = getDaysUntilHP();
  const countdownMsg = getCountdownMessage(daysUntilHP);
  const todayHPProgress = getTodayProgress();
  const stats = getUserStats();
  const estimatedScore = getEstimatedHPScore();
  const unlockedMilestones = getUnlockedMilestones();
  const scoreInfo = getScoreLabel(estimatedScore);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleStartFullTest = async () => {
    if (!isPremium) {
      if (canAccessContent('full_test')) {
        setFullTestModalVisible(true);
      } else if (isTrialAvailable) {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      } else {
        setPaywallType('after_trial');
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
      } else if (isTrialAvailable) {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      } else {
        setPaywallType('after_trial');
        setPaywallVisible(true);
      }
      return;
    }
    router.push({ pathname: ROUTES.hpSelectVersion, params: { sectionCode } });
  };

  const verbalSections = HP_SECTIONS.filter(s => VERBAL_CODES.includes(s.code));
  const kvantSections = HP_SECTIONS.filter(s => KVANT_CODES.includes(s.code));

  const headerGradient: readonly [string, string, string] = isDark
    ? ['#0F172A', '#1E293B', '#1E293B'] as const
    : ['#4F46E5', '#6D28D9', '#7C3AED'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Hero Header ── */}
      <LinearGradient
        colors={[...headerGradient] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            {/* Title area */}
            <View style={styles.headerTitleArea}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerCapIcon}>
                  <GraduationCap size={28} color="#FFF" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.headerTitle}>Högskoleprovet</Text>
                    {isPremium && (
                      <View style={styles.proBadge}>
                        <Crown size={12} color="#FFD700" />
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Träna inför hösten 2026 · 18 oktober
                  </Text>
                </View>
              </View>

              {/* Score ring — visible for premium users with data */}
              {isPremium && stats.totalAttempts > 0 && (
                <View style={styles.headerScoreRing}>
                  <ScoreRing score={estimatedScore} maxScore={2.0} color="#FFD700" size={78} />
                </View>
              )}
            </View>

            {/* Premium CTA for free users */}
            {!isPremium && (
              <TouchableOpacity
                style={styles.premiumCTA}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(ROUTES.premium); }}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#FFD700', '#F59E0B']}
                  style={styles.premiumCTAGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Lock size={15} color="#1a1a2e" />
                  <Text style={styles.premiumCTAText}>Lås upp alla delprov med Premium</Text>
                  <ChevronRight size={16} color="#1a1a2e" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Countdown ── */}
        <View style={{ marginBottom: 32 }}>
          <HPCountdownCard
            daysUntil={daysUntilHP}
            countdownMsg={countdownMsg}
            plan={plan}
            todayProgress={todayHPProgress}
            isDark={isDark}
            theme={theme}
          />
        </View>

        {/* ── Premium Dashboard (stats + AI) ── */}
        {isPremium && stats.totalAttempts > 0 && (
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 36 }}>
            <PremiumDashboard
              stats={stats}
              estimatedScore={estimatedScore}
              isDark={isDark}
              theme={theme}
            />
          </Animated.View>
        )}

        {/* ── Freemium Banner ── */}
        {!isPremium && (
          <FreemiumBanner
            feature="hp_section"
            status={hpLimit}
            style={{ marginBottom: 32 }}
          />
        )}

        {/* ── Full Test Card ── */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 36 }}>
          <TouchableOpacity
            style={[fullTestStyles.card, !isPremium && { opacity: 0.9 }]}
            onPress={handleStartFullTest}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isPremium
                ? (isDark ? ['#4F46E5', '#7C3AED', '#A855F7'] : ['#6366F1', '#8B5CF6', '#A855F7']) as readonly [string, string, string]
                : ['#374151', '#1F2937', '#111827'] as readonly [string, string, string]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={fullTestStyles.gradient}
            >
              {!isPremium && (
                <View style={fullTestStyles.lockBadge}>
                  <Lock size={28} color="rgba(255,255,255,0.5)" />
                </View>
              )}

              <View style={fullTestStyles.topRow}>
                <View style={fullTestStyles.playIcon}>
                  <Play size={28} color="#FFF" fill="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={fullTestStyles.title}>Komplett högskoleprov</Text>
                  <Text style={fullTestStyles.subtitle}>
                    Alla 8 delprov · Realistisk provupplevelse
                  </Text>
                </View>
                <ChevronRight size={22} color="rgba(255,255,255,0.65)" />
              </View>

              {/* Pass grid */}
              <View style={fullTestStyles.passGrid}>
                {[
                  { label: 'Verbal 1', detail: 'ORD + LÄS', color: '#818CF8' },
                  { label: 'Verbal 2', detail: 'MEK + ELF', color: '#A78BFA' },
                  { label: 'Kvant 1', detail: 'XYZ + KVA', color: '#F472B6' },
                  { label: 'Kvant 2', detail: 'NOG + DTK', color: '#FB923C' },
                ].map((pass, i) => (
                  <View key={i} style={fullTestStyles.passTile}>
                    <View style={[fullTestStyles.passDot, { backgroundColor: pass.color }]} />
                    <View>
                      <Text style={fullTestStyles.passLabel}>{pass.label}</Text>
                      <Text style={fullTestStyles.passDetail}>{pass.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Stats row */}
              <View style={fullTestStyles.statsRow}>
                <View style={fullTestStyles.statItem}>
                  <Clock size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={fullTestStyles.statText}>260 min</Text>
                </View>
                <View style={fullTestStyles.statItem}>
                  <Target size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={fullTestStyles.statText}>160 frågor</Text>
                </View>
                <View style={fullTestStyles.statItem}>
                  <Trophy size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={fullTestStyles.statText}>Max 2.0</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Verbal Section Group (collapsible) ── */}
        <View style={styles.sectionLabel}>
          <View style={[styles.sectionLabelLine, { backgroundColor: '#6366F1' + '30' }]} />
          <View style={[styles.sectionLabelPill, { backgroundColor: '#6366F1' + '14' }]}>
            <BookOpen size={13} color="#6366F1" />
            <Text style={[styles.sectionLabelText, { color: '#6366F1' }]}>DELPROV</Text>
          </View>
          <View style={[styles.sectionLabelLine, { backgroundColor: '#6366F1' + '30' }]} />
        </View>

        <CollapsibleSectionGroup
          title="Verbal del"
          subtitle="4 delprov"
          color="#6366F1"
          icon={<BookOpen size={16} color="#6366F1" />}
          sections={verbalSections}
          getSectionProgress={getSectionProgress}
          isPremium={isPremium}
          isDark={isDark}
          theme={theme}
          onPressSection={handleStartSection}
          defaultExpanded={false}
        />

        {/* ── Kvantitative Section Group (collapsible) ── */}
        <CollapsibleSectionGroup
          title="Kvantitativ del"
          subtitle="4 delprov"
          color="#EC4899"
          icon={<Calculator size={16} color="#EC4899" />}
          sections={kvantSections}
          getSectionProgress={getSectionProgress}
          isPremium={isPremium}
          isDark={isDark}
          theme={theme}
          onPressSection={handleStartSection}
          defaultExpanded={false}
        />

        {/* ── Milestones ── */}
        {isPremium && (
          <Animated.View style={{ opacity: fadeAnim, marginTop: 8 }}>
            <View style={styles.milestonesHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Star size={20} color={COLORS.primary} />
                <View>
                  <Text style={[styles.milestonesTitle, { color: theme.colors.text }]}>Milstolpar</Text>
                  <Text style={[styles.milestonesSubtitle, { color: theme.colors.textSecondary }]}>Samla prestationer och XP</Text>
                </View>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.milestonesScroll}
            >
              {HP_MILESTONES.slice(0, 5).map((milestone) => {
                const isUnlocked = unlockedMilestones.includes(milestone.id);
                return (
                  <View
                    key={milestone.id}
                    style={[
                      styles.milestoneCard,
                      { backgroundColor: theme.colors.surface },
                      isUnlocked && { borderWidth: 1.5, borderColor: COLORS.primary + '35' },
                    ]}
                  >
                    <View style={[
                      styles.milestoneIconBg,
                      isUnlocked ? { backgroundColor: COLORS.primary + '18' } : { backgroundColor: theme.colors.border },
                    ]}>
                      <Text style={[styles.milestoneIcon, !isUnlocked && { opacity: 0.35 }]}>
                        {milestone.icon}
                      </Text>
                    </View>
                    <Text
                      style={[styles.milestoneName, { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {milestone.name}
                    </Text>
                    <Text style={[styles.milestoneXP, { color: COLORS.primary }]}>+{milestone.xp} XP</Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* ── Study Tips ── */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>Studietips</Text>
            <Text style={[styles.tipsSubtitle, { color: theme.colors.textSecondary }]}>
              Expertråd för att maximera ditt resultat
            </Text>
          </View>

          {studyTips.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.tipInner}>
                <View style={[styles.tipIconBg, { backgroundColor: `${tip.color}18` }]}>
                  <Text style={styles.tipEmoji}>{tip.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                  <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>{tip.description}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(ROUTES.studyTips); }}
          >
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>Visa alla studietips</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Modals ── */}
      {fullTestModalVisible && (
        <FullTestVersionModal
          visible={fullTestModalVisible}
          onClose={() => setFullTestModalVisible(false)}
          onSelectVersion={handleStartFullTestWithVersion}
          isPremium={isPremium}
          isDark={isDark}
          theme={theme}
        />
      )}

      <HPTrialSelectionModal
        visible={trialSelectionVisible}
        onClose={() => setTrialSelectionVisible(false)}
        onSelectFullTest={() => {
          setTrialSelectionVisible(false);
          setFullTestModalVisible(true);
        }}
        onSelectSection={(sectionCode: string) => {
          setTrialSelectionVisible(false);
          router.push({ pathname: ROUTES.hpSelectVersion, params: { sectionCode } });
        }}
      />

      <HPPaywallModal
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          if (paywallType === 'before_trial') setTrialSelectionVisible(true);
        }}
        onUpgrade={() => {
          setPaywallVisible(false);
          router.push(ROUTES.premium);
        }}
        type={paywallType}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header — dramatically larger and more prominent
  headerGradient: {
    paddingBottom: 40,
    paddingTop: 8,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
    marginRight: 20,
  },
  headerCapIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  headerScoreRing: {
    flexShrink: 0,
    alignItems: 'center',
  },
  premiumCTA: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    gap: 10,
  },
  premiumCTAText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1a1a2e',
    letterSpacing: -0.2,
    flex: 1,
  },

  // Scroll — generous spacing
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 48 },

  // Section labels — more breathing room
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  sectionLabelLine: {
    flex: 1,
    height: 1,
  },
  sectionLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },

  // Milestones
  milestonesHeader: {
    marginBottom: 18,
  },
  milestonesTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  milestonesSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  milestonesScroll: {
    paddingRight: 20,
    gap: 14,
    marginBottom: 34,
  },
  milestoneCard: {
    width: 130,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
  },
  milestoneIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 26,
  },
  milestoneName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 17,
  },
  milestoneXP: {
    fontSize: 12,
    fontWeight: '700' as const,
  },

  // Tips
  tipsSection: {
    marginBottom: 20,
  },
  tipsHeader: {
    marginBottom: 18,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  tipsSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  tipCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tipInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  tipIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 22,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  viewMoreTips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    borderWidth: 1,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});

// ─── Collapsible Group Styles ─────────────────────────────────────────────────
const groupStyles = StyleSheet.create({
  trigger: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  triggerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  triggerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  triggerSubtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  triggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  triggerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  expandedContent: {
    paddingTop: 8,
    gap: 4,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionCode: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  sectionFullName: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  sectionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sectionMeta: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  sectionScore: {
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  accuracyChip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    marginTop: 2,
  },
  accuracyChipText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  playBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Premium Dashboard Styles ─────────────────────────────────────────────────
const dashboardStyles = StyleSheet.create({
  wrapper: {
    gap: 16,
    marginBottom: 4,
  },
  mainCard: {
    borderRadius: 26,
    padding: 24,
    overflow: 'hidden',
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  scoreLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trophyBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scoreDesc: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  statsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  aiCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  aiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  aiSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  aiRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Full Test Card Styles ────────────────────────────────────────────────────
const fullTestStyles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: 24,
  },
  lockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  playIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 21,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  passGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  passTile: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
  },
  passDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  passLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  passDetail: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 22,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
  },
});

// ─── Countdown Styles ─────────────────────────────────────────────────────────
const countdownStyles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  daysBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 82,
    height: 82,
    borderRadius: 22,
    flexShrink: 0,
  },
  daysNum: {
    fontSize: 36,
    fontWeight: '900' as const,
    lineHeight: 40,
    letterSpacing: -1.5,
  },
  daysSub: {
    fontSize: 11,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginTop: 1,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  infoBlock: {
    flex: 1,
    gap: 6,
  },
  examPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  msg: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    minWidth: 28,
    textAlign: 'right',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  handle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  mixedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 14,
    marginBottom: 18,
  },
  mixedIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mixedText: {
    flex: 1,
  },
  mixedTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  mixedDesc: {
    fontSize: 13,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    gap: 14,
  },
  versionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonEmoji: {
    fontSize: 24,
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  versionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionMetaText: {
    fontSize: 12,
    marginRight: 8,
  },
});
