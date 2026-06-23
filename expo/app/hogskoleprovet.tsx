import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import {
  GraduationCap,
  Clock,
  Target,
  Trophy,
  ChevronRight,
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
import { COLORS } from '@/constants/design-system';
import { useHPStudyPlan, PLAN_CONFIGS } from '@/contexts/HPStudyPlanContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, maxScore, color, size = 64 }: {
  score: number;
  maxScore: number;
  color: string;
  size?: number;
}) {
  const pct = Math.min(1, score / maxScore);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;
  // Simple drawn ring using View overlays (no SVG dep needed)
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 5,
        borderColor: color + '22',
      }} />
      {/* Progress ring approximation with gradient arc */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 5,
        borderColor: 'transparent',
        borderTopColor: pct > 0.05 ? color : 'transparent',
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={{ fontSize: size === 64 ? 13 : 10, fontWeight: '800' as const, color, letterSpacing: -0.5 }}>
        {score.toFixed(1)}
      </Text>
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
        borderColor: urgencyColor + '28',
      }]}
      onPress={() => router.push(ROUTES.hpStudyPlan)}
      activeOpacity={0.82}
    >
      <View style={countdownStyles.inner}>
        {/* Big day counter */}
        <View style={[countdownStyles.daysBlock, {
          backgroundColor: urgencyColor + '15',
          borderColor: urgencyColor + '40',
          borderWidth: 1,
        }]}>
          <Text style={[countdownStyles.daysNum, { color: urgencyColor }]}>{daysUntil}</Text>
          <Text style={[countdownStyles.daysSub, { color: urgencyColor + 'BB' }]}>dagar</Text>
        </View>

        <View style={countdownStyles.infoBlock}>
          {/* Exam pill */}
          <View style={[countdownStyles.examPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }]}>
            <Calendar size={11} color={theme.colors.textSecondary} />
            <Text style={[countdownStyles.examLabel, { color: theme.colors.textSecondary }]}>{nextHP.icon} {nextHP.label}</Text>
          </View>
          <Text style={[countdownStyles.msg, { color: theme.colors.text }]} numberOfLines={2}>{countdownMsg}</Text>
          {planConfig ? (
            <View style={[countdownStyles.planBadge, {
              backgroundColor: planConfig.color + '18',
              borderColor: planConfig.color + '38',
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

        <View style={[countdownStyles.arrowBtn, { backgroundColor: COLORS.primary + '15' }]}>
          <ChevronRight size={15} color={COLORS.primary} />
        </View>
      </View>

      {plan && planConfig && (
        <View style={countdownStyles.progressRow}>
          <View style={[countdownStyles.progressBg, { backgroundColor: theme.colors.border }]}>
            <LinearGradient
              colors={[urgencyColor, urgencyColor + 'AA']}
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

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function HPStatsStrip({ stats, isDark, theme }: { stats: any; isDark: boolean; theme: any }) {
  const items = [
    {
      icon: <CheckCircle2 size={16} color="#10B981" />,
      value: stats.totalAttempts > 0 ? `${Math.round(stats.averageScore)}%` : '—',
      label: 'Snitträtt',
      color: '#10B981',
    },
    {
      icon: <Flame size={16} color="#F97316" />,
      value: stats.currentStreak > 0 ? `${stats.currentStreak}` : '0',
      label: 'Dagars streak',
      color: '#F97316',
    },
    {
      icon: <Clock size={16} color="#6366F1" />,
      value: stats.totalStudyTime > 0 ? `${stats.totalStudyTime}h` : '—',
      label: 'Studietid',
      color: '#6366F1',
    },
    {
      icon: <TrendingUp size={16} color="#EC4899" />,
      value: stats.totalAttempts > 0 ? `${stats.totalAttempts}` : '0',
      label: 'Pass gjorda',
      color: '#EC4899',
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={statsStyles.strip}
    >
      {items.map((item, i) => (
        <View
          key={i}
          style={[statsStyles.statCard, {
            backgroundColor: isDark ? '#1A2235' : '#F8F9FF',
            borderColor: item.color + '25',
            borderWidth: 1,
          }]}
        >
          <View style={[statsStyles.iconBg, { backgroundColor: item.color + '18' }]}>
            {item.icon}
          </View>
          <Text style={[statsStyles.value, { color: theme.colors.text }]}>{item.value}</Text>
          <Text style={[statsStyles.label, { color: theme.colors.textSecondary }]}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const statsStyles = StyleSheet.create({
  strip: {
    paddingRight: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: 90,
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    gap: 6,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 13,
  },
});

// ─── Section Detail Card ──────────────────────────────────────────────────────
function SectionDetailCard({
  section,
  progress,
  isLocked,
  onPress,
  isDark,
  theme,
}: {
  section: HPSectionConfig;
  progress: { attempts: number; averageScore: number; bestScore: number };
  isLocked: boolean;
  onPress: () => void;
  isDark: boolean;
  theme: any;
}) {
  const hasData = progress.attempts > 0;
  const accuracyPct = hasData ? Math.round(progress.averageScore) : 0;
  const estimatedScore = hasData ? ((progress.averageScore / 100) * section.maxScore).toFixed(1) : null;
  const progressPct = hasData ? Math.min(100, (progress.attempts / 5) * 100) : 0; // 5 sessions = full bar

  // Determine badge color tier
  const accuracyColor = accuracyPct >= 70 ? '#10B981' : accuracyPct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity
      style={[sectionCardStyles.card, {
        backgroundColor: theme.colors.surface,
        opacity: isLocked ? 0.72 : 1,
      }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left accent stripe */}
      <View style={[sectionCardStyles.stripe, { backgroundColor: section.color }]} />

      <View style={sectionCardStyles.body}>
        {/* Top row */}
        <View style={sectionCardStyles.topRow}>
          <LinearGradient
            colors={isLocked ? ['#4B5563', '#374151'] : section.gradientColors as any}
            style={sectionCardStyles.iconBg}
          >
            {isLocked
              ? <Lock size={18} color="rgba(255,255,255,0.6)" />
              : <Text style={sectionCardStyles.iconEmoji}>{section.icon}</Text>
            }
          </LinearGradient>

          <View style={sectionCardStyles.titleBlock}>
            <View style={sectionCardStyles.nameRow}>
              <Text style={[sectionCardStyles.sectionCode, { color: section.color }]}>
                {section.name}
              </Text>
              <Text style={[sectionCardStyles.fullName, { color: theme.colors.text }]}>
                {section.fullName}
              </Text>
            </View>
            <View style={sectionCardStyles.metaRow}>
              <Clock size={10} color={theme.colors.textSecondary} />
              <Text style={[sectionCardStyles.meta, { color: theme.colors.textSecondary }]}>
                {section.timeMinutes} min · {section.questionCount} frågor
              </Text>
            </View>
          </View>

          {/* Right side: score or lock */}
          {!isLocked && hasData ? (
            <View style={sectionCardStyles.scoreBlock}>
              <Text style={[sectionCardStyles.scoreNum, { color: section.color }]}>
                {estimatedScore}
              </Text>
              <Text style={[sectionCardStyles.scoreMax, { color: theme.colors.textSecondary }]}>
                /{section.maxScore}p
              </Text>
            </View>
          ) : isLocked ? (
            <View style={[sectionCardStyles.lockBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <Lock size={12} color={theme.colors.textSecondary} />
            </View>
          ) : null}
        </View>

        {/* Progress + accuracy row */}
        {!isLocked && (
          <View style={sectionCardStyles.progressSection}>
            <View style={sectionCardStyles.progressRow}>
              <View style={[sectionCardStyles.progressBg, { backgroundColor: theme.colors.border }]}>
                <LinearGradient
                  colors={hasData ? section.gradientColors as any : [theme.colors.border, theme.colors.border]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[sectionCardStyles.progressFill, { width: `${progressPct}%` as any }]}
                />
              </View>
              {hasData ? (
                <View style={[sectionCardStyles.accuracyBadge, { backgroundColor: accuracyColor + '18' }]}>
                  <Text style={[sectionCardStyles.accuracyText, { color: accuracyColor }]}>
                    {accuracyPct}% rätt
                  </Text>
                </View>
              ) : (
                <Text style={[sectionCardStyles.notStarted, { color: theme.colors.textSecondary }]}>
                  Ej påbörjad
                </Text>
              )}
            </View>
          </View>
        )}

        {/* CTA button */}
        <TouchableOpacity
          style={[sectionCardStyles.ctaBtn, {
            backgroundColor: isLocked ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : section.color + '15',
          }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {isLocked ? (
            <>
              <Crown size={13} color={theme.colors.textSecondary} />
              <Text style={[sectionCardStyles.ctaText, { color: theme.colors.textSecondary }]}>
                Kräver Premium
              </Text>
            </>
          ) : (
            <>
              <Play size={13} color={section.color} fill={section.color} />
              <Text style={[sectionCardStyles.ctaText, { color: section.color }]}>
                {hasData ? 'Öva igen' : 'Öva nu'}
              </Text>
            </>
          )}
          <ChevronRight size={13} color={isLocked ? theme.colors.textSecondary : section.color} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const sectionCardStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  stripe: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionCode: {
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  scoreBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  scoreMax: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  accuracyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  notStarted: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center',
  },
});

// ─── Full Test Version Modal ──────────────────────────────────────────────────
interface FullTestVersionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVersion: (versionId?: string) => void;
}

function FullTestVersionModal({ visible, onClose, onSelectVersion }: FullTestVersionModalProps) {
  const { theme, isDark } = useTheme();

  const getSeasonIcon = (season: 'spring' | 'fall') => {
    return season === 'spring' ? '🌸' : '🍂';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: theme.colors.background }]}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <LinearGradient colors={[COLORS.primary, '#8B5CF6']} style={modalStyles.headerIcon}>
                <GraduationCap size={20} color="#FFF" />
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
              style={[modalStyles.mixedCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}
              onPress={() => onSelectVersion('')}
              activeOpacity={0.7}
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
                <Text style={[modalStyles.dividerText, { color: theme.colors.textSecondary }]}>Provtillfällen</Text>
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
                <View style={[modalStyles.versionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
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
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
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

// ─── VERBAL / KVANT section groups ───────────────────────────────────────────
const VERBAL_CODES = ['ORD', 'LÄS', 'MEK', 'ELF'];
const KVANT_CODES = ['XYZ', 'KVA', 'NOG', 'DTK'];

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
    isLoading,
  } = useHogskoleprovet();
  const {
    trialStatus,
    isTrialAvailable,
    canAccessContent,
    setShowTrialModal,
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
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
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

  const handleStartSection = async (sectionCode: string) => {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Hero ── */}
      <LinearGradient
        colors={isDark
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#4F46E5', '#7C3AED', '#EC4899']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronRight size={24} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <View style={styles.headerTitleRow}>
                  <GraduationCap size={24} color="#FFF" strokeWidth={2.5} />
                  <Text style={styles.headerTitle}>Högskoleprov</Text>
                  {isPremium && (
                    <View style={styles.premiumBadge}>
                      <Crown size={12} color="#FFD700" />
                      <Text style={{ fontSize: 11, fontWeight: '700' as const, color: '#FFD700' }}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.headerSubtitle}>
                  Träna inför hösten 2026 · 18 oktober
                </Text>
              </View>

              {/* Score ring in header if has data */}
              {isPremium && stats.totalAttempts > 0 && (
                <ScoreRing score={estimatedScore} maxScore={2.0} color="#FFD700" size={60} />
              )}
            </View>

            {!isPremium && (
              <TouchableOpacity
                style={styles.premiumCTA}
                onPress={() => router.push(ROUTES.premium)}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.premiumCTAGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Lock size={16} color="#000" />
                  <Text style={styles.premiumCTAText}>Lås upp med Premium</Text>
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
        <HPCountdownCard
          daysUntil={daysUntilHP}
          countdownMsg={countdownMsg}
          plan={plan}
          todayProgress={todayHPProgress}
          isDark={isDark}
          theme={theme}
        />

        {/* ── Stats strip (premium only) ── */}
        {isPremium && (
          <HPStatsStrip stats={stats} isDark={isDark} theme={theme} />
        )}

        {!isPremium && (
          <FreemiumBanner
            feature="hp_section"
            status={hpLimit}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* ── Score card ── */}
        {isPremium && stats.totalAttempts > 0 && (
          <Animated.View style={[styles.scoreCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={isDark
                ? ['rgba(79, 70, 229, 0.3)', 'rgba(124, 58, 237, 0.2)']
                : ['rgba(79, 70, 229, 0.15)', 'rgba(124, 58, 237, 0.1)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreCardGradient}
            >
              <View style={styles.scoreHeader}>
                <View style={styles.scoreIconContainer}>
                  <Trophy size={24} color={scoreInfo.color} />
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                    Uppskattat HP-resultat
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreValue, { color: scoreInfo.color }]}>
                      {estimatedScore.toFixed(2)}
                    </Text>
                    <Text style={[styles.scoreMax, { color: theme.colors.textSecondary }]}>/ 2.0</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.statsButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => router.push(ROUTES.hpStats)}
                >
                  <BarChart3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.scoreProgressContainer}>
                <View style={[styles.scoreProgressBg, { backgroundColor: theme.colors.border }]}>
                  <LinearGradient
                    colors={[scoreInfo.color, scoreInfo.color + 'AA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.scoreProgressFill, { width: `${(estimatedScore / 2) * 100}%` as any }]}
                  />
                </View>
                <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
                  {scoreInfo.label} · {scoreInfo.description}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── Full Test Card ── */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 24 }}>
          <TouchableOpacity
            style={[styles.fullTestCard, !isPremium && styles.lockedCard]}
            onPress={handleStartFullTest}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isPremium
                ? isDark ? ['#4F46E5', '#7C3AED', '#EC4899'] : ['#6366F1', '#8B5CF6', '#EC4899']
                : ['#374151', '#1F2937']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fullTestGradient}
            >
              {!isPremium && (
                <View style={styles.lockOverlay}>
                  <Lock size={32} color="rgba(255,255,255,0.5)" />
                </View>
              )}

              <View style={styles.fullTestContent}>
                <View style={styles.fullTestIcon}>
                  <Play size={32} color="#FFF" fill="#FFF" />
                </View>
                <View style={styles.fullTestInfo}>
                  <Text style={styles.fullTestTitle}>Komplett Högskoleprov</Text>
                  <Text style={styles.fullTestSubtitle}>
                    Alla 8 delprov · Realistisk provupplevelse
                  </Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
              </View>

              {/* 4 provpass mini-grid */}
              <View style={styles.passGrid}>
                {['Verbal 1 · ORD/LÄS', 'Verbal 2 · MEK/ELF', 'Kvant 1 · XYZ/KVA', 'Kvant 2 · NOG/DTK'].map((label, i) => (
                  <View key={i} style={styles.passItem}>
                    <View style={[styles.passIndicator, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <Text style={styles.passLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.fullTestStats}>
                <View style={styles.fullTestStat}>
                  <Clock size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.fullTestStatText}>260 min</Text>
                </View>
                <View style={styles.fullTestStat}>
                  <Target size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.fullTestStatText}>160 frågor</Text>
                </View>
                <View style={styles.fullTestStat}>
                  <Trophy size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.fullTestStatText}>Max 2.0</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── AI Generator ── */}
        {isPremium && (
          <TouchableOpacity
            style={styles.aiGeneratorCard}
            onPress={() => router.push(ROUTES.hpAiGenerator)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isDark ? ['#7C3AED', '#6366F1', '#EC4899'] : ['#8B5CF6', '#6366F1', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiGeneratorGradient}
            >
              <View style={styles.aiGeneratorContent}>
                <View style={styles.aiGeneratorIcon}>
                  <Sparkles size={28} color="#FFF" />
                </View>
                <View style={styles.aiGeneratorInfo}>
                  <View style={styles.aiGeneratorTitleRow}>
                    <Text style={styles.aiGeneratorTitle}>AI-generator</Text>
                    <View style={styles.aiBadge}>
                      <Zap size={12} color="#FFD700" />
                    </View>
                  </View>
                  <Text style={styles.aiGeneratorSubtitle}>
                    Skapa anpassade prov med AI baserat på Skolverkets HP
                  </Text>
                </View>
                <ChevronRight size={22} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Verbal Sections ── */}
        <View style={styles.sectionGroupHeader}>
          <View style={[styles.groupPill, { backgroundColor: '#6366F120' }]}>
            <Text style={[styles.groupPillText, { color: '#6366F1' }]}>📖 Verbal del</Text>
          </View>
          <Text style={[styles.groupDesc, { color: theme.colors.textSecondary }]}>
            ORD · LÄS · MEK · ELF
          </Text>
        </View>

        {verbalSections.map((section) => (
          <SectionDetailCard
            key={section.code}
            section={section}
            progress={getSectionProgress(section.code)}
            isLocked={!isPremium}
            onPress={() => handleStartSection(section.code)}
            isDark={isDark}
            theme={theme}
          />
        ))}

        {/* ── Kvantitative Sections ── */}
        <View style={[styles.sectionGroupHeader, { marginTop: 8 }]}>
          <View style={[styles.groupPill, { backgroundColor: '#EC489920' }]}>
            <Text style={[styles.groupPillText, { color: '#EC4899' }]}>🔢 Kvantitativ del</Text>
          </View>
          <Text style={[styles.groupDesc, { color: theme.colors.textSecondary }]}>
            XYZ · KVA · NOG · DTK
          </Text>
        </View>

        {kvantSections.map((section) => (
          <SectionDetailCard
            key={section.code}
            section={section}
            progress={getSectionProgress(section.code)}
            isLocked={!isPremium}
            onPress={() => handleStartSection(section.code)}
            isDark={isDark}
            theme={theme}
          />
        ))}

        {/* ── Milestones ── */}
        {isPremium && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Milstolpar</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Samla prestationer och XP</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.milestonesContainer}
            >
              {HP_MILESTONES.slice(0, 5).map((milestone) => {
                const isUnlocked = unlockedMilestones.includes(milestone.id);
                return (
                  <View
                    key={milestone.id}
                    style={[
                      styles.milestoneCard,
                      { backgroundColor: theme.colors.surface },
                      isUnlocked && { borderWidth: 1, borderColor: `${COLORS.primary}40` },
                    ]}
                  >
                    <View style={[
                      styles.milestoneIconBg,
                      isUnlocked ? { backgroundColor: `${COLORS.primary}20` } : { backgroundColor: theme.colors.border },
                    ]}>
                      <Text style={[styles.milestoneIcon, !isUnlocked && { opacity: 0.4 }]}>
                        {milestone.icon}
                      </Text>
                    </View>
                    <Text style={[styles.milestoneName, { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary }]}>
                      {milestone.name}
                    </Text>
                    <Text style={[styles.milestoneXP, { color: COLORS.primary }]}>+{milestone.xp} XP</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Study Tips ── */}
        <View style={styles.tipsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Expertråd för att maximera ditt resultat
            </Text>
          </View>

          {studyTips.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIconBg, { backgroundColor: `${tip.color}20` }]}>
                  <Text style={styles.tipEmoji}>{tip.icon}</Text>
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                  <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>{tip.description}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(ROUTES.studyTips)}
          >
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>Visa alla studietips</Text>
            <ChevronRight size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {fullTestModalVisible && (
        <FullTestVersionModal
          visible={fullTestModalVisible}
          onClose={() => setFullTestModalVisible(false)}
          onSelectVersion={handleStartFullTestWithVersion}
        />
      )}

      <HPTrialSelectionModal
        visible={trialSelectionVisible}
        onClose={() => setTrialSelectionVisible(false)}
        onSelectFullTest={() => {
          setTrialSelectionVisible(false);
          setFullTestModalVisible(true);
        }}
        onSelectSection={(sectionCode) => {
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingBottom: 24, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden' },
  header: { paddingHorizontal: 20, paddingTop: 0 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  headerContent: { flex: 1, marginRight: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: '800' as const, color: '#FFF', flex: 1, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 19, letterSpacing: -0.2 },
  premiumBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,215,0,0.25)', flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumCTA: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  premiumCTAGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  premiumCTAText: { fontSize: 16, fontWeight: '700' as const, color: '#000', letterSpacing: -0.2 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  // Score card
  scoreCard: { marginBottom: 24, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  scoreCardGradient: { padding: 24 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  scoreIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  scoreInfo: { flex: 1 },
  scoreLabel: { fontSize: 13, fontWeight: '500' as const, marginBottom: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 32, fontWeight: '800' as const },
  scoreMax: { fontSize: 18, fontWeight: '600' as const, marginLeft: 4 },
  statsButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreProgressContainer: { marginTop: 4 },
  scoreProgressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  scoreProgressFill: { height: '100%', borderRadius: 4 },
  scoreDescription: { fontSize: 13, fontWeight: '500' as const },

  // Full test card
  fullTestCard: { borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 },
  lockedCard: { opacity: 0.9 },
  fullTestGradient: { padding: 24 },
  lockOverlay: { position: 'absolute', top: 20, right: 20, zIndex: 1 },
  fullTestContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  fullTestIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  fullTestInfo: { flex: 1 },
  fullTestTitle: { fontSize: 20, fontWeight: '700' as const, color: '#FFF', marginBottom: 4 },
  fullTestSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  passGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  passItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  passIndicator: { width: 8, height: 8, borderRadius: 4 },
  passLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' as const },
  fullTestStats: { flexDirection: 'row', gap: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  fullTestStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fullTestStatText: { fontSize: 13, fontWeight: '600' as const, color: 'rgba(255,255,255,0.9)' },

  // Section group headers
  sectionGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  groupPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  groupPillText: { fontSize: 13, fontWeight: '700' as const },
  groupDesc: { fontSize: 12, fontWeight: '500' as const },

  // Section header (reusable)
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14 },

  // AI generator
  aiGeneratorCard: { marginBottom: 28, borderRadius: 20, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  aiGeneratorGradient: { padding: 20 },
  aiGeneratorContent: { flexDirection: 'row', alignItems: 'center' },
  aiGeneratorIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  aiGeneratorInfo: { flex: 1 },
  aiGeneratorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiGeneratorTitle: { fontSize: 18, fontWeight: '700' as const, color: '#FFF' },
  aiBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,215,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  aiGeneratorSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },

  // Milestones
  milestonesContainer: { paddingRight: 20, gap: 12, marginBottom: 28 },
  milestoneCard: { width: 120, padding: 16, borderRadius: 16, alignItems: 'center' },
  milestoneIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  milestoneIcon: { fontSize: 24 },
  milestoneName: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center', marginBottom: 4 },
  milestoneXP: { fontSize: 11, fontWeight: '700' as const },

  // Tips
  tipsSection: { marginBottom: 20 },
  tipCard: { padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tipHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tipEmoji: { fontSize: 22 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700' as const, marginBottom: 4 },
  tipDescription: { fontSize: 13, lineHeight: 20 },
  viewMoreTips: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 6, marginTop: 4 },
  viewMoreText: { fontSize: 15, fontWeight: '600' as const },
});

// ─── Countdown Styles ─────────────────────────────────────────────────────────
const countdownStyles = StyleSheet.create({
  card: { borderRadius: 22, marginBottom: 20, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 6 },
  inner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  daysBlock: { alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderRadius: 20, flexShrink: 0 },
  daysNum: { fontSize: 34, fontWeight: '900' as const, lineHeight: 38, letterSpacing: -1 },
  daysSub: { fontSize: 10, fontWeight: '700' as const, textAlign: 'center', marginTop: 1, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  infoBlock: { flex: 1, gap: 5 },
  examPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  examLabel: { fontSize: 11, fontWeight: '500' as const },
  msg: { fontSize: 13, fontWeight: '700' as const, lineHeight: 19 },
  planBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  planBadgeText: { fontSize: 11, fontWeight: '700' as const },
  arrowBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  progressBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, fontWeight: '600' as const, minWidth: 28, textAlign: 'right' },
  ctaText: { fontSize: 13, fontWeight: '700' as const },
});
