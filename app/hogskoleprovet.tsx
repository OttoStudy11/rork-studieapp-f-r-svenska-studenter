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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
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
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { useHPTrial } from '@/contexts/HPTrialContext';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import { FreemiumBanner } from '@/components/FreemiumBanner';
import { HPTrialSelectionModal } from '@/components/hogskoleprovet/HPTrialSelectionModal';
import { HPPaywallModal } from '@/components/hogskoleprovet/HPPaywallModal';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel, HP_FULL_TEST_VERSIONS } from '@/constants/hogskoleprovet';
import { getRandomTips } from '@/constants/hogskoleprovet-study-tips';
import { COLORS } from '@/constants/design-system';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: theme.colors.background }]}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <LinearGradient
                colors={[COLORS.primary, '#8B5CF6']}
                style={modalStyles.headerIcon}
              >
                <GraduationCap size={20} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[modalStyles.title, { color: theme.colors.text }]}>
                  Välj provversion
                </Text>
                <Text style={[modalStyles.subtitle, { color: theme.colors.textSecondary }]}>
                  Komplett högskoleprov
                </Text>
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
            {/* Mixed option */}
            <TouchableOpacity
              style={[modalStyles.mixedCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}
              onPress={() => onSelectVersion('')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, '#8B5CF6']}
                style={modalStyles.mixedIcon}
              >
                <Shuffle size={24} color="#FFF" />
              </LinearGradient>
              <View style={modalStyles.mixedText}>
                <Text style={[modalStyles.mixedTitle, { color: theme.colors.text }]}>
                  Blandade frågor
                </Text>
                <Text style={[modalStyles.mixedDesc, { color: theme.colors.textSecondary }]}>
                  Slumpmässigt urval • 120 frågor • 235 min
                </Text>
              </View>
              <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
            </TouchableOpacity>

            {HP_FULL_TEST_VERSIONS.length > 0 && (
              <View style={modalStyles.divider}>
                <View style={[modalStyles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[modalStyles.dividerText, { color: theme.colors.textSecondary }]}>
                  Provtillfällen
                </Text>
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
                  <Text style={[modalStyles.versionName, { color: theme.colors.text }]}>
                    {version.displayName}
                  </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 44,
    height: 44,
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
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
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

export default function HogskoleprovetScreen() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  const freemium = useFreemiumLimits();
  const hpLimit = freemium.checkHPSection();
  const { 
    getUserStats, 
    getEstimatedHPScore,
    getUnlockedMilestones,
    isLoading,
    startPracticeSession: startSession,
    startFullTest: startTest,
  } = useHogskoleprovet();
  const { 
    trialStatus, 
    isTrialAvailable,
    canAccessContent,
    setShowTrialModal,
  } = useHPTrial();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [fullTestModalVisible, setFullTestModalVisible] = useState(false);
  const [studyTips] = useState(() => getRandomTips(5));
  const [trialSelectionVisible, setTrialSelectionVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<'before_trial' | 'after_trial'>('before_trial');
  
  const stats = getUserStats();
  const estimatedScore = getEstimatedHPScore();
  const unlockedMilestones = getUnlockedMilestones();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    console.log('[HP Screen] Render state:', { 
      isLoading, 
      sectionsCount: HP_SECTIONS.length,
      fullTestVersionsCount: HP_FULL_TEST_VERSIONS.length,
    });
  }, [isLoading]);

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
    router.push({
      pathname: '/hp-test' as any,
      params: { testVersionId: testVersionId || '' },
    });
  };

  const handleStartSection = async (sectionCode: string) => {
    if (!isPremium) {
      if (hpLimit.isAllowed || canAccessContent('delprov', sectionCode)) {
        freemium.trackUsage('hp_section', { sectionCode });
        router.push({
          pathname: '/hp-select-version' as any,
          params: { sectionCode },
        });
      } else if (isTrialAvailable) {
        setPaywallType('before_trial');
        setPaywallVisible(true);
      } else {
        setPaywallType('after_trial');
        setPaywallVisible(true);
      }
      return;
    }
    console.log('[HP Screen] Navigating to version selection for:', sectionCode);
    router.push({
      pathname: '/hp-select-version' as any,
      params: { sectionCode },
    });
  };

  const handleViewStats = () => {
    router.push('/hp-stats' as any);
  };

  const scoreInfo = getScoreLabel(estimatedScore);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
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
            
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <GraduationCap size={24} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.headerTitle}>Högskoleprov</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={12} color="#FFD700" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFD700' }}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerSubtitle}>
                Träna inför högskoleprovet med autentiska uppgifter
              </Text>
            </View>

            {!isPremium && (
              <TouchableOpacity 
                style={styles.premiumCTA}
                onPress={() => router.push('/premium' as any)}
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
        {!isPremium && (
          <FreemiumBanner
            feature="hp_section"
            status={hpLimit}
            style={{ marginHorizontal: 20, marginBottom: 16 }}
          />
        )}
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
                    <Text style={[styles.scoreMax, { color: theme.colors.textSecondary }]}>
                      / 2.0
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.statsButton, { backgroundColor: theme.colors.surface }]}
                  onPress={handleViewStats}
                >
                  <BarChart3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreProgressContainer}>
                <View style={[styles.scoreProgressBg, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[
                      styles.scoreProgressFill, 
                      { 
                        width: `${(estimatedScore / 2) * 100}%`,
                        backgroundColor: scoreInfo.color,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
                  {scoreInfo.label} - {scoreInfo.description}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={[
              styles.fullTestCard,
              !isPremium && styles.lockedCard,
            ]}
            onPress={handleStartFullTest}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isPremium 
                ? isDark
                  ? ['#4F46E5', '#7C3AED', '#EC4899']
                  : ['#6366F1', '#8B5CF6', '#EC4899']
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
                  Alla 8 delprov • 4h 20min • Realistisk provupplevelse
                </Text>
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
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

        {isPremium && (
          <TouchableOpacity 
            style={styles.aiGeneratorCard}
            onPress={() => router.push('/hp-ai-generator' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isDark 
                ? ['#7C3AED', '#6366F1', '#EC4899'] 
                : ['#8B5CF6', '#6366F1', '#EC4899']
              }
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Träna per delprov
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Fokusera på dina svaga områden
          </Text>
        </View>

        <View style={styles.sectionsGrid}>
          {HP_SECTIONS.map((section, index) => {
            const isLocked = !isPremium;
            
            return (
              <TouchableOpacity
                key={section.code}
                style={[
                  styles.sectionCard,
                  { backgroundColor: theme.colors.surface },
                  isLocked && styles.lockedSectionCard,
                ]}
                onPress={() => handleStartSection(section.code)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={isLocked 
                    ? ['rgba(75,85,99,0.3)', 'rgba(55,65,81,0.2)']
                    : [...section.gradientColors, `${section.gradientColors[1]}80`] as any
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionIconBg}
                >
                  {isLocked ? (
                    <Lock size={20} color="rgba(255,255,255,0.5)" />
                  ) : (
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                  )}
                </LinearGradient>
                
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionName, { color: theme.colors.text }]}>
                    {section.name}
                  </Text>
                  <Text 
                    style={[styles.sectionFullName, { color: theme.colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {section.fullName}
                  </Text>
                </View>
                
                {!isLocked && (
                  <View style={styles.sectionMeta}>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.sectionMetaText, { color: theme.colors.textSecondary }]}>
                      {section.timeMinutes} min
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isPremium && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Milstolpar
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Samla prestationer och XP
              </Text>
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
                      isUnlocked && styles.unlockedMilestone,
                    ]}
                  >
                    <View style={[
                      styles.milestoneIconBg,
                      isUnlocked 
                        ? { backgroundColor: `${COLORS.primary}20` }
                        : { backgroundColor: theme.colors.border }
                    ]}>
                      <Text style={[
                        styles.milestoneIcon,
                        !isUnlocked && styles.lockedMilestoneIcon,
                      ]}>
                        {milestone.icon}
                      </Text>
                    </View>
                    <Text style={[
                      styles.milestoneName,
                      { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary },
                    ]}>
                      {milestone.name}
                    </Text>
                    <Text style={[styles.milestoneXP, { color: COLORS.primary }]}>
                      +{milestone.xp} XP
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={styles.tipsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Studietips & Insikter
            </Text>
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
                  <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                    {tip.title}
                  </Text>
                  <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>
                    {tip.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.viewMoreTips, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/study-tips' as any)}
          >
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>
              Visa alla studietips
            </Text>
            <ChevronRight size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
          router.push({
            pathname: '/hp-select-version' as any,
            params: { sectionCode },
          });
        }}
      />

      <HPPaywallModal
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          if (paywallType === 'before_trial') {
            setTrialSelectionVisible(true);
          }
        }}
        onUpgrade={() => {
          setPaywallVisible(false);
          router.push('/premium' as any);
        }}
        type={paywallType}
      />
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerContent: {
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFF',
    flex: 1,
    letterSpacing: -0.5,
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  premiumCTA: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  premiumCTAText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreCardGradient: {
    padding: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreProgressContainer: {
    marginTop: 4,
  },
  scoreProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  fullTestCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  lockedCard: {
    opacity: 0.9,
  },
  fullTestGradient: {
    padding: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  fullTestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullTestIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fullTestInfo: {
    flex: 1,
  },
  fullTestTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  fullTestSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  fullTestStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  fullTestStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullTestStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  sectionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lockedSectionCard: {
    opacity: 0.6,
  },
  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionInfo: {
    marginBottom: 8,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  sectionFullName: {
    fontSize: 12,
  },
  sectionProgress: {
    marginBottom: 8,
  },
  sectionProgressText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  milestonesContainer: {
    paddingRight: 20,
    gap: 12,
    marginBottom: 28,
  },
  milestoneCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  unlockedMilestone: {
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  milestoneIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneIcon: {
    fontSize: 24,
  },
  lockedMilestoneIcon: {
    opacity: 0.4,
  },
  milestoneName: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  milestoneXP: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 22,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  viewMoreTips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 100,
  },
  aiGeneratorCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  aiGeneratorGradient: {
    padding: 20,
  },
  aiGeneratorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiGeneratorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiGeneratorInfo: {
    flex: 1,
  },
  aiGeneratorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiGeneratorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  aiBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,215,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiGeneratorSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
});
