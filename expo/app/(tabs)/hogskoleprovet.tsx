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
    <TouchableOpacity
      style={[sc.card, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderWidth: 1 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={sc.body}>
        <View style={sc.topRow}>
          <LinearGradient
            colors={isLocked ? ['#6B7280', '#4B5563'] : section.gradientColors as any}
            style={[sc.iconBg, { opacity: isLocked ? 0.6 : 1 }]}
          >
            {isLocked ? <Lock size={16} color="#FFF" /> : <Text style={sc.iconEmoji}>{section.icon}</Text>}
          </LinearGradient>
          <View style={sc.titleBlock}>
            <Text style={[sc.sectionCode, { color: isLocked ? theme.colors.textSecondary : section.color }]}>{section.name}</Text>
            <Text style={[sc.fullName, { color: isLocked ? theme.colors.textSecondary : theme.colors.text }]} numberOfLines={1}>{section.fullName}</Text>
          </View>
          <View style={sc.rightBlock}>
            {isLocked ? (
              <View style={sc.lockRow}>
                <Crown size={11} color="#F59E0B" />
                <Text style={sc.lockLabel}>Premium</Text>
              </View>
            ) : hasData ? (
              <View style={sc.scoreBadge}>
                <Text style={[sc.scoreNum, { color: section.color }]}>{est}</Text>
                <Text style={sc.scoreMax}>/{section.maxScore}</Text>
              </View>
            ) : (
              <Play size={16} color={section.color} fill={section.color + '30'} />
            )}
          </View>
        </View>
        <View style={sc.bottomRow}>
          <View style={sc.metaRow}>
            <Clock size={11} color={theme.colors.textSecondary} />
            <Text style={[sc.meta, { color: theme.colors.textSecondary }]}>{section.timeMinutes} min · {section.questionCount} fr</Text>
          </View>
          {!isLocked && hasData && (
            <View style={[sc.accuracyBadge, { backgroundColor: accuracyColor + '20' }]}>
              <Text style={[sc.accuracyText, { color: accuracyColor }]}>{accuracyPct}%</Text>
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
  const [studyTips] = useState(() => getRandomTips(3));
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<'before_trial' | 'after_trial'>('before_trial');
  const [expandedGroup, setExpandedGroup] = useState<'verbal' | 'kvant' | null>('verbal');

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
        {/* ── Immersive Hero ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81', '#312E81'] : ['#4F46E5', '#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Decorative elements */}
            <View style={styles.heroDeco1} />
            <View style={styles.heroDeco2} />

            <View style={styles.heroTop}>
              <View style={styles.heroTitleRow}>
                <View style={styles.heroIconCircle}>
                  <GraduationCap size={22} color="#FFF" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.heroTitle}>Högskoleprovet</Text>
                  <Text style={styles.heroSubtitle}>Höst 2026 · 18 oktober</Text>
                </View>
                {isPremium && (
                  <View style={styles.heroProBadge}>
                    <Crown size={11} color="#FFD700" />
                    <Text style={styles.heroProText}>PRO</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.heroBottom}>
              <View style={styles.heroCountdown}>
                <View style={styles.heroCountdownBlock}>
                  <Text style={[styles.heroCountdownNum, { color: isDark ? '#A5B4FC' : '#FFF' }]}>{daysUntilHP}</Text>
                  <Text style={styles.heroCountdownLabel}>dagar kvar</Text>
                </View>
              </View>

              {isPremium && stats.totalAttempts > 0 && (
                <View style={styles.heroScore}>
                  <ScoreRing score={estimatedScore} maxScore={2.0} color="#FFD700" size={74} />
                  <Text style={styles.heroScoreLabel}>Est. resultat</Text>
                </View>
              )}

              {!isPremium && (
                <TouchableOpacity style={styles.heroUnlockBtn} onPress={() => router.push(ROUTES.premium)} activeOpacity={0.85}>
                  <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.heroUnlockGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Crown size={15} color="#000" />
                    <Text style={styles.heroUnlockText}>Lås upp Högskoleprovet</Text>
                    <ChevronRight size={15} color="#000" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Strip ── */}
        {isPremium && <StatsStrip stats={stats} isDark={isDark} theme={theme} />}

        {!isPremium && <FreemiumBanner feature="hp_section" status={hpLimit} style={{ marginBottom: 20 }} />}

        {/* ── Quick Row (AI + Tools) ── */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 20 }}>
          <View style={styles.quickRow}>
            <TouchableOpacity style={[styles.aiChip, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: '#6366F130' }]}
              onPress={() => router.push((ROUTES.mathChat + '?course=H%C3%B6gskoleprovet') as any)} activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.aiChipIcon}>
                <Calculator size={14} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.aiChipText, { color: theme.colors.text }]}>Math AI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.aiChip, { backgroundColor: isDark ? '#1A2E1A' : '#ECFDF5', borderColor: '#10B98130' }]}
              onPress={() => router.push((ROUTES.generalChat + '?course=H%C3%B6gskoleprovet') as any)} activeOpacity={0.8}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.aiChipIcon}>
                <MessageCircle size={14} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.aiChipText, { color: theme.colors.text }]}>Generell AI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolChip, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              onPress={() => router.push(ROUTES.hpStudyPlan)} activeOpacity={0.8}>
              <Calendar size={14} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolChip, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              onPress={() => router.push(ROUTES.hpAiGenerator)} activeOpacity={0.8}>
              <Sparkles size={14} color="#8B5CF6" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolChip, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              onPress={() => router.push(ROUTES.hpStats)} activeOpacity={0.8}>
              <BarChart3 size={14} color="#EC4899" />
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

        {/* ── Collapsible Verbal Group ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
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
                <Text style={[styles.collapseTriggerTitle, { color: theme.colors.text }]}>Verbal del</Text>
                <Text style={[styles.collapseTriggerSub, { color: theme.colors.textSecondary }]}>ORD · LÄS · MEK · ELF — 4 delprov</Text>
              </View>
            </View>
            <ChevronDown
              size={18}
              color={theme.colors.textSecondary}
              style={{ transform: [{ rotate: expandedGroup === 'verbal' ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {expandedGroup === 'verbal' && (
            <View style={styles.collapseContent}>
              {verbalSections.map((section) => {
                const sectionProgress = getSectionProgress(section.code);
                const hasSectionData = sectionProgress.attempts > 0;
                return (
                  <SectionCard key={section.code} section={section} progress={sectionProgress}
                    isLocked={!isPremium && !canAccessContent('delprov', section.code)}
                    onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ── Collapsible Kvantitative Group ── */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 4 }}>
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
                <Text style={[styles.collapseTriggerTitle, { color: theme.colors.text }]}>Kvantitativ del</Text>
                <Text style={[styles.collapseTriggerSub, { color: theme.colors.textSecondary }]}>XYZ · KVA · NOG · DTK — 4 delprov</Text>
              </View>
            </View>
            <ChevronDown
              size={18}
              color={theme.colors.textSecondary}
              style={{ transform: [{ rotate: expandedGroup === 'kvant' ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {expandedGroup === 'kvant' && (
            <View style={styles.collapseContent}>
              {kvantSections.map((section) => {
                const sectionProgress = getSectionProgress(section.code);
                return (
                  <SectionCard key={section.code} section={section} progress={sectionProgress}
                    isLocked={!isPremium && !canAccessContent('delprov', section.code)}
                    onPress={() => handleStartSection(section.code)} isDark={isDark} theme={theme} />
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ── Premium upsell ── */}
        {!isPremium && (
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 24 }}>
            <TouchableOpacity style={[styles.upsellCard, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF', borderColor: '#C4B5FD30' }]}
              onPress={() => router.push(ROUTES.premium)} activeOpacity={0.85}>
              <View style={styles.upsellRow}>
                <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.upsellBadge}>
                  <Crown size={14} color="#000" />
                </LinearGradient>
                <View style={styles.upsellTextWrap}>
                  <Text style={[styles.upsellTitle, { color: theme.colors.text }]}>Lås upp alla delprov</Text>
                  <Text style={[styles.upsellSub, { color: theme.colors.textSecondary }]}>8 delprov · AI-generator · Studieplan · Obegränsat</Text>
                </View>
                <ChevronRight size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Milestones ── */}
        {isPremium && (
          <Animated.View style={{ opacity: fadeAnim, marginTop: 8 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Milstolpar</Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>Samla prestationer och XP</Text>
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
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 32 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
          </View>
          <View style={styles.tipsGrid}>
            {studyTips.map((tip) => (
              <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <View style={[styles.tipIconBg, { backgroundColor: `${tip.color}18` }]}>
                  <Text style={styles.tipEmoji}>{tip.icon}</Text>
                </View>
                <Text style={[styles.tipTitle, { color: theme.colors.text }]} numberOfLines={1}>{tip.title}</Text>
                <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>{tip.description}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            onPress={() => router.push(ROUTES.studyTips)} activeOpacity={0.8}>
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>Visa alla studietips</Text>
            <ChevronRight size={16} color={COLORS.primary} />
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },

  // Hero
  heroCard: {
    borderRadius: 24, padding: 22, marginBottom: 20,
    overflow: 'hidden', position: 'relative',
  },
  heroDeco1: {
    position: 'absolute', top: -40, right: -20,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroDeco2: {
    position: 'absolute', bottom: -30, left: -20,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroTop: { marginBottom: 18, zIndex: 1 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconCircle: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800' as const, color: '#FFF', letterSpacing: -0.3 },
  heroProBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.2)', flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  heroProText: { fontSize: 10, fontWeight: '800' as const, color: '#FFD700', letterSpacing: 0.3 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as const, letterSpacing: -0.1, marginTop: 2 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 },
  heroCountdown: { flex: 1, marginRight: 16 },
  heroCountdownBlock: {
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 16, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroCountdownNum: { fontSize: 36, fontWeight: '900' as const, letterSpacing: -1, lineHeight: 40 },
  heroCountdownLabel: { fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, marginTop: 2 },
  heroScore: { alignItems: 'center', gap: 5 },
  heroScoreLabel: { fontSize: 10, fontWeight: '600' as const, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  heroUnlockBtn: { borderRadius: 14, overflow: 'hidden' },
  heroUnlockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, gap: 6 },
  heroUnlockText: { fontSize: 14, fontWeight: '700' as const, color: '#000' },

  // Quick row — chips style
  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  aiChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, gap: 7,
  },
  aiChipIcon: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  aiChipText: { fontSize: 12, fontWeight: '700' as const },
  toolChip: {
    width: 38, height: 38, borderRadius: 12, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

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

  // Collapsible groups
  collapseTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 4,
  },
  collapseTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  collapseTriggerIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  collapseTriggerEmoji: { fontSize: 22 },
  collapseTriggerText: { flex: 1, gap: 3 },
  collapseTriggerTitle: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.2 },
  collapseTriggerSub: { fontSize: 12, fontWeight: '500' as const },
  collapseContent: { paddingTop: 6 },

  // Section header
  sectionHeader: { marginBottom: 14, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.2 },

  // Upsell
  upsellCard: { borderRadius: 18, padding: 18, borderWidth: 1, marginTop: 4 },
  upsellRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  upsellBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  upsellTextWrap: { flex: 1, gap: 3 },
  upsellTitle: { fontSize: 15, fontWeight: '700' as const },
  upsellSub: { fontSize: 12, lineHeight: 17 },

  // Milestones
  milestonesRow: { paddingRight: 20, gap: 12, marginBottom: 24 },
  milestoneCard: { width: 120, padding: 16, borderRadius: 16, alignItems: 'center' },
  milestoneIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  milestoneIcon: { fontSize: 24 },
  milestoneName: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center', marginBottom: 4 },
  milestoneXP: { fontSize: 11, fontWeight: '700' as const },

  // Tips — grid of cards
  tipsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tipCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  tipIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tipEmoji: { fontSize: 18 },
  tipTitle: { fontSize: 13, fontWeight: '700' as const },
  tipDescription: { fontSize: 11, lineHeight: 16 },
  viewMoreTips: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 13, borderRadius: 14, borderWidth: 1, gap: 6,
  },
  viewMoreText: { fontSize: 14, fontWeight: '600' as const },
});

// ─── Section Card Styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 6, overflow: 'hidden' },
  body: { padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  iconBg: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: 18 },
  titleBlock: { flex: 1, gap: 2 },
  sectionCode: { fontSize: 14, fontWeight: '800' as const, letterSpacing: 0.2 },
  fullName: { fontSize: 13, fontWeight: '600' as const },
  rightBlock: { flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockLabel: { fontSize: 10, fontWeight: '700' as const, color: '#F59E0B' },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  scoreNum: { fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.5 },
  scoreMax: { fontSize: 10, fontWeight: '600' as const, color: '#9CA3AF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, fontWeight: '500' as const },
  accuracyBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  accuracyText: { fontSize: 10, fontWeight: '700' as const },
});

// ─── Stats Strip Styles ───────────────────────────────────────────────────────
const ss = StyleSheet.create({
  strip: { paddingRight: 20, gap: 10, marginBottom: 24 },
  statCard: { width: 86, padding: 12, borderRadius: 16, alignItems: 'center', gap: 5 },
  iconBg: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 16, fontWeight: '800' as const, letterSpacing: -0.5 },
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
