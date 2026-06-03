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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  Calculator,
  MessageCircle,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, maxScore, color, size = 80 }: { score: number; maxScore: number; color: string; size?: number }) {
  const pct = Math.min(1, score / maxScore);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: 6, borderColor: color + '22',
      }} />
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: 6, borderColor: 'transparent',
        borderTopColor: pct > 0.05 ? color : 'transparent',
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={{ fontSize: size === 80 ? 22 : 13, fontWeight: '900' as const, color, letterSpacing: -0.8 }}>
        {score.toFixed(1)}
      </Text>
      <Text style={{ fontSize: 10, fontWeight: '600' as const, color: color + '99', marginTop: 1 }}>
        /{maxScore.toFixed(1)}
      </Text>
    </View>
  );
}

// ─── Full Test Modal (same as before, compacted) ──────────────────────────────
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

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function StatsStrip({ stats, isDark, theme }: { stats: any; isDark: boolean; theme: any }) {
  const items = [
    { icon: <CheckCircle2 size={16} color="#10B981" />, value: stats.totalAttempts > 0 ? `${Math.round(stats.averageScore)}%` : '—', label: 'Snitträtt', color: '#10B981' },
    { icon: <Flame size={16} color="#F97316" />, value: stats.currentStreak > 0 ? `${stats.currentStreak}` : '0', label: 'Dagars streak', color: '#F97316' },
    { icon: <Clock size={16} color="#6366F1" />, value: stats.totalStudyTime > 0 ? `${stats.totalStudyTime}h` : '—', label: 'Studietid', color: '#6366F1' },
    { icon: <TrendingUp size={16} color="#EC4899" />, value: stats.totalAttempts > 0 ? `${stats.totalAttempts}` : '0', label: 'Pass gjorda', color: '#EC4899' },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ss.strip}>
      {items.map((item, i) => (
        <View key={i} style={[ss.statCard, { backgroundColor: isDark ? '#1A2235' : '#F8F9FF', borderColor: item.color + '25', borderWidth: 1 }]}>
          <View style={[ss.iconBg, { backgroundColor: item.color + '18' }]}>{item.icon}</View>
          <Text style={[ss.value, { color: theme.colors.text }]}>{item.value}</Text>
          <Text style={[ss.label, { color: theme.colors.textSecondary }]}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ section, progress, isLocked, onPress, isDark, theme }: {
  section: HPSectionConfig; progress: any; isLocked: boolean; onPress: () => void; isDark: boolean; theme: any;
}) {
  const hasData = progress.attempts > 0;
  const accuracyPct = hasData ? Math.round(progress.averageScore) : 0;
  const est = hasData ? ((progress.averageScore / 100) * section.maxScore).toFixed(1) : null;
  const accuracyColor = accuracyPct >= 70 ? '#10B981' : accuracyPct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity style={[sc.card, { backgroundColor: theme.colors.surface, opacity: isLocked ? 0.72 : 1 }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[sc.stripe, { backgroundColor: section.color }]} />
      <View style={sc.body}>
        <View style={sc.topRow}>
          <LinearGradient colors={isLocked ? ['#4B5563', '#374151'] : section.gradientColors as any} style={sc.iconBg}>
            {isLocked ? <Lock size={18} color="rgba(255,255,255,0.6)" /> : <Text style={sc.iconEmoji}>{section.icon}</Text>}
          </LinearGradient>
          <View style={sc.titleBlock}>
            <View style={sc.nameRow}>
              <Text style={[sc.sectionCode, { color: section.color }]}>{section.name}</Text>
              <Text style={[sc.fullName, { color: theme.colors.text }]}>{section.fullName}</Text>
            </View>
            <View style={sc.metaRow}>
              <Clock size={10} color={theme.colors.textSecondary} />
              <Text style={[sc.meta, { color: theme.colors.textSecondary }]}>{section.timeMinutes} min · {section.questionCount} frågor</Text>
            </View>
          </View>
          {!isLocked && hasData ? (
            <View style={sc.scoreBlock}>
              <Text style={[sc.scoreNum, { color: section.color }]}>{est}</Text>
              <Text style={[sc.scoreMax, { color: theme.colors.textSecondary }]}>/{section.maxScore}p</Text>
            </View>
          ) : isLocked ? (
            <View style={[sc.lockBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <Lock size={12} color={theme.colors.textSecondary} />
            </View>
          ) : null}
        </View>
        {!isLocked && (
          <View style={sc.progressSection}>
            <View style={sc.progressRow}>
              {hasData ? (
                <View style={[sc.accuracyBadge, { backgroundColor: accuracyColor + '18' }]}>
                  <Text style={[sc.accuracyText, { color: accuracyColor }]}>{accuracyPct}% rätt</Text>
                </View>
              ) : (
                <Text style={[sc.notStarted, { color: theme.colors.textSecondary }]}>Ej påbörjad</Text>
              )}
            </View>
          </View>
        )}
        <TouchableOpacity style={[sc.ctaBtn, { backgroundColor: isLocked ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : section.color + '15' }]} onPress={onPress} activeOpacity={0.7}>
          {isLocked ? (
            <><Crown size={13} color={theme.colors.textSecondary} /><Text style={[sc.ctaText, { color: theme.colors.textSecondary }]}>Kräver Premium</Text></>
          ) : (
            <><Play size={13} color={section.color} fill={section.color} /><Text style={[sc.ctaText, { color: section.color }]}>{hasData ? 'Öva igen' : 'Öva nu'}</Text></>
          )}
          <ChevronRight size={13} color={isLocked ? theme.colors.textSecondary : section.color} />
        </TouchableOpacity>
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
  const [studyTips] = useState(() => getRandomTips(3));
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<'before_trial' | 'after_trial'>('before_trial');

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
    router.push({ pathname: '/hp-test' as any, params: { testVersionId: testVersionId || '' } });
  };

  const handleStartSection = (sectionCode: string) => {
    if (!isPremium) {
      if (hpLimit.isAllowed || canAccessContent('delprov', sectionCode)) {
        freemium.trackUsage('hp_section', { sectionCode });
        router.push({ pathname: '/hp-select-version' as any, params: { sectionCode } });
      } else {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      }
      return;
    }
    router.push({ pathname: '/hp-select-version' as any, params: { sectionCode } });
  };

  const verbalSections = HP_SECTIONS.filter(s => VERBAL_CODES.includes(s.code));
  const kvantSections = HP_SECTIONS.filter(s => KVANT_CODES.includes(s.code));

  const urgencyColor = daysUntilHP >= 60 ? '#10B981' : daysUntilHP >= 30 ? '#F97316' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Immersive Hero ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81', '#4338CA'] : ['#4F46E5', '#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Decorative background circles */}
            <View style={[styles.heroDeco1, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
            <View style={[styles.heroDeco2, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

            <View style={styles.heroTop}>
              <View style={styles.heroTitleRow}>
                <GraduationCap size={26} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.heroTitle}>Högskoleprovet</Text>
                {isPremium && (
                  <View style={styles.heroProBadge}>
                    <Crown size={12} color="#FFD700" />
                    <Text style={styles.heroProText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.heroSubtitle}>Höst 2026 · 18 oktober</Text>
            </View>

            <View style={styles.heroBottom}>
              {/* Countdown block */}
              <View style={styles.heroCountdown}>
                <View style={[styles.heroCountdownBlock, { backgroundColor: urgencyColor + '20', borderColor: urgencyColor + '40', borderWidth: 1 }]}>
                  <Text style={[styles.heroCountdownNum, { color: urgencyColor }]}>{daysUntilHP}</Text>
                  <Text style={[styles.heroCountdownLabel, { color: urgencyColor + 'BB' }]}>dagar kvar</Text>
                </View>
                <Text style={styles.heroCountdownMsg} numberOfLines={2}>{countdownMsg}</Text>
              </View>

              {/* Score ring for premium users */}
              {isPremium && stats.totalAttempts > 0 && (
                <View style={styles.heroScore}>
                  <ScoreRing score={estimatedScore} maxScore={2.0} color="#FFD700" size={80} />
                  <Text style={styles.heroScoreLabel}>Uppskattat resultat</Text>
                </View>
              )}

              {!isPremium && (
                <TouchableOpacity style={styles.heroUnlockBtn} onPress={() => router.push('/premium' as any)} activeOpacity={0.85}>
                  <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.heroUnlockGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Crown size={16} color="#000" />
                    <Text style={styles.heroUnlockText}>Lås upp Högskoleprovet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Strip ── */}
        {isPremium && <StatsStrip stats={stats} isDark={isDark} theme={theme} />}

        {!isPremium && <FreemiumBanner feature="hp_section" status={hpLimit} style={{ marginBottom: 20 }} />}

        {/* ── Quick Access Row (AI + Study Plan + Full Test) ── */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 24 }}>
          <View style={styles.quickRow}>
            {/* AI Bar */}
            <TouchableOpacity style={[styles.quickAiBar, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}
              onPress={() => router.push('/math-chat?course=H%C3%B6gskoleprovet' as any)} activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.quickAiIcon}>
                <Calculator size={18} color="#FFF" />
              </LinearGradient>
              <View style={styles.quickAiTextWrap}>
                <Text style={[styles.quickAiTitle, { color: theme.colors.text }]}>Math AI</Text>
                <Text style={[styles.quickAiSub, { color: theme.colors.textSecondary }]}>HP-hjälp</Text>
              </View>
              <ChevronRight size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAiBar, { backgroundColor: isDark ? '#1A2E1A' : '#ECFDF5' }]}
              onPress={() => router.push('/general-chat?course=H%C3%B6gskoleprovet' as any)} activeOpacity={0.8}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.quickAiIcon}>
                <MessageCircle size={18} color="#FFF" />
              </LinearGradient>
              <View style={styles.quickAiTextWrap}>
                <Text style={[styles.quickAiTitle, { color: theme.colors.text }]}>Generell AI</Text>
                <Text style={[styles.quickAiSub, { color: theme.colors.textSecondary }]}>Studietips</Text>
              </View>
              <ChevronRight size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Study Plan + AI Generator buttons */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1A2235' : '#F4F6FF', borderColor: COLORS.primary + '30' }]}
              onPress={() => router.push('/hp-study-plan' as any)} activeOpacity={0.8}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Studieplan</Text>
              {plan && <View style={[styles.quickActionDot, { backgroundColor: '#10B981' }]} />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1A2235' : '#F4F6FF', borderColor: '#8B5CF630' }]}
              onPress={() => router.push('/hp-ai-generator' as any)} activeOpacity={0.8}>
              <Sparkles size={20} color="#8B5CF6" />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>AI-generator</Text>
              <View style={[styles.quickActionAiBadge, { backgroundColor: '#8B5CF620' }]}>
                <Zap size={10} color="#8B5CF6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1A2235' : '#F4F6FF', borderColor: '#EC489930' }]}
              onPress={() => router.push('/hp-stats' as any)} activeOpacity={0.8}>
              <BarChart3 size={20} color="#EC4899" />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Statistik</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Full Test Mega Card ── */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 24 }}>
          <TouchableOpacity style={[styles.fullTestCard, !isPremium && styles.fullTestLocked]} onPress={handleStartFullTest} activeOpacity={0.85}>
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
                  <Lock size={28} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.fullTestLockText}>Lås upp med Premium</Text>
                </View>
              )}
              <View style={styles.fullTestTop}>
                <View style={styles.fullTestIconCircle}>
                  <Play size={28} color="#FFF" fill="#FFF" />
                </View>
                <View style={styles.fullTestInfo}>
                  <Text style={styles.fullTestTitle}>Komplett Högskoleprov</Text>
                  <Text style={styles.fullTestSubtitle}>Alla 8 delprov · 260 min · 160 frågor</Text>
                </View>
                {isPremium && <ChevronRight size={22} color="rgba(255,255,255,0.6)" />}
              </View>
              <View style={styles.fullTestPassGrid}>
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

        {/* ── Verbal Sections ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupPill, { backgroundColor: '#6366F120' }]}>
              <Text style={[styles.groupPillText, { color: '#6366F1' }]}>📖 Verbal del</Text>
            </View>
          </View>
          {verbalSections.map((section) => (
            <SectionCard key={section.code} section={section} progress={getSectionProgress(section.code)}
              isLocked={!isPremium} onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
          ))}
        </Animated.View>

        {/* ── Kvantitative Sections ── */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 4 }}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupPill, { backgroundColor: '#EC489920' }]}>
              <Text style={[styles.groupPillText, { color: '#EC4899' }]}>🔢 Kvantitativ del</Text>
            </View>
          </View>
          {kvantSections.map((section) => (
            <SectionCard key={section.code} section={section} progress={getSectionProgress(section.code)}
              isLocked={!isPremium} onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
          ))}
        </Animated.View>

        {/* ── Premium upsell between sections ── */}
        {!isPremium && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity style={[styles.upsellCard, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF' }]}
              onPress={() => router.push('/premium' as any)} activeOpacity={0.85}>
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

        {/* ── Milestones ── */}
        {isPremium && (
          <Animated.View style={{ opacity: fadeAnim, marginTop: 8 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Milstolpar</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Samla prestationer och XP</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestonesRow}>
              {HP_MILESTONES.slice(0, 5).map((milestone) => {
                const isUnlocked = unlockedMilestones.includes(milestone.id);
                return (
                  <View key={milestone.id} style={[styles.milestoneCard, { backgroundColor: theme.colors.surface },
                    isUnlocked && { borderWidth: 1, borderColor: `${COLORS.primary}40` }]}>
                    <View style={[styles.milestoneIconBg, isUnlocked ? { backgroundColor: `${COLORS.primary}20` } : { backgroundColor: theme.colors.border }]}>
                      <Text style={[styles.milestoneIcon, !isUnlocked && { opacity: 0.4 }]}>{milestone.icon}</Text>
                    </View>
                    <Text style={[styles.milestoneName, { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary }]}>{milestone.name}</Text>
                    <Text style={[styles.milestoneXP, { color: COLORS.primary }]}>+{milestone.xp} XP</Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* ── Study Tips ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Expertråd för att maximera ditt resultat</Text>
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
          <TouchableOpacity style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/study-tips' as any)}>
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
        onUpgrade={() => { setPaywallVisible(false); router.push('/premium' as any); }}
        type={paywallType} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  // Hero
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  heroDeco1: {
    position: 'absolute', top: -60, right: -40,
    width: 180, height: 180, borderRadius: 90,
  },
  heroDeco2: {
    position: 'absolute', bottom: -50, left: -30,
    width: 140, height: 140, borderRadius: 70,
  },
  heroTop: { marginBottom: 20 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  heroTitle: { fontSize: 26, fontWeight: '900' as const, color: '#FFF', letterSpacing: -0.5 },
  heroProBadge: {
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.25)', flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  heroProText: { fontSize: 11, fontWeight: '800' as const, color: '#FFD700', letterSpacing: 0.5 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' as const, letterSpacing: -0.2 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCountdown: { flex: 1, marginRight: 16 },
  heroCountdownBlock: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
  heroCountdownNum: { fontSize: 34, fontWeight: '900' as const, letterSpacing: -1, lineHeight: 38 },
  heroCountdownLabel: { fontSize: 10, fontWeight: '700' as const, textTransform: 'uppercase' as const, marginTop: 2 },
  heroCountdownMsg: { fontSize: 12, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },
  heroScore: { alignItems: 'center', gap: 6 },
  heroScoreLabel: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  heroUnlockBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  heroUnlockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
  heroUnlockText: { fontSize: 15, fontWeight: '700' as const, color: '#000' },

  // Quick row
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickAiBar: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 10 },
  quickAiIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickAiTextWrap: { flex: 1 },
  quickAiTitle: { fontSize: 13, fontWeight: '700' as const, marginBottom: 1 },
  quickAiSub: { fontSize: 11, fontWeight: '500' as const },
  quickActionsRow: { flexDirection: 'row', gap: 10 },
  quickActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 14, borderWidth: 1, gap: 6,
  },
  quickActionText: { fontSize: 12, fontWeight: '700' as const },
  quickActionDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 6, right: 6 },
  quickActionAiBadge: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 4, right: 4 },

  // Full test card
  fullTestCard: { borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12 },
  fullTestLocked: { opacity: 0.9 },
  fullTestGradient: { padding: 22 },
  fullTestLockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1, borderRadius: 24 },
  fullTestLockText: { fontSize: 14, fontWeight: '700' as const, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  fullTestTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  fullTestIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  fullTestInfo: { flex: 1 },
  fullTestTitle: { fontSize: 19, fontWeight: '800' as const, color: '#FFF', marginBottom: 3 },
  fullTestSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  fullTestPassGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', gap: 8 },
  fullTestPassItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  fullTestPassIcon: { fontSize: 16 },
  fullTestPassLabel: { fontSize: 12, fontWeight: '700' as const, color: 'rgba(255,255,255,0.9)' },
  fullTestPassSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' as const },

  // Group headers
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 4 },
  groupPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  groupPillText: { fontSize: 14, fontWeight: '700' as const },

  // Section header
  sectionHeader: { marginBottom: 14, marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14 },

  // Upsell
  upsellCard: { borderRadius: 20, padding: 20, marginBottom: 20, marginTop: 8, alignItems: 'center' },
  upsellBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6, marginBottom: 12 },
  upsellBadgeText: { fontSize: 11, fontWeight: '800' as const, color: '#000', letterSpacing: 0.5 },
  upsellTitle: { fontSize: 18, fontWeight: '800' as const, textAlign: 'center', marginBottom: 6 },
  upsellSub: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  upsellCta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, gap: 6 },
  upsellCtaText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },

  // Milestones
  milestonesRow: { paddingRight: 20, gap: 12, marginBottom: 24 },
  milestoneCard: { width: 120, padding: 16, borderRadius: 16, alignItems: 'center' },
  milestoneIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  milestoneIcon: { fontSize: 24 },
  milestoneName: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center', marginBottom: 4 },
  milestoneXP: { fontSize: 11, fontWeight: '700' as const },

  // Tips
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

// ─── Section Card Styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
  card: { borderRadius: 20, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  stripe: { width: 4 },
  body: { flex: 1, padding: 16, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: 20 },
  titleBlock: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionCode: { fontSize: 15, fontWeight: '800' as const, letterSpacing: 0.3 },
  fullName: { fontSize: 14, fontWeight: '600' as const },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, fontWeight: '500' as const },
  scoreBlock: { alignItems: 'flex-end', flexShrink: 0 },
  scoreNum: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.5 },
  scoreMax: { fontSize: 10, fontWeight: '600' as const },
  lockBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  progressSection: { gap: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accuracyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  accuracyText: { fontSize: 11, fontWeight: '700' as const },
  notStarted: { fontSize: 11, fontWeight: '500' as const },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 12, gap: 6 },
  ctaText: { fontSize: 13, fontWeight: '700' as const, flex: 1, textAlign: 'center' },
});

// ─── Stats Strip Styles ───────────────────────────────────────────────────────
const ss = StyleSheet.create({
  strip: { paddingRight: 20, gap: 10, marginBottom: 24 },
  statCard: { width: 90, padding: 14, borderRadius: 18, alignItems: 'center', gap: 6 },
  iconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '600' as const, textAlign: 'center', lineHeight: 13 },
});

// ─── Full Test Modal Styles ───────────────────────────────────────────────────
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
