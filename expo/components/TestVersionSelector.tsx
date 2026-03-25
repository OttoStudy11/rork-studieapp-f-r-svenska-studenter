import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Calendar, FileText, Clock, Target, Shuffle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HPTestVersion, HPFullTestVersion, HP_FULL_TEST_VERSIONS } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';

interface TestVersionSelectorProps {
  visible: boolean;
  onClose: () => void;
  testVersions: HPTestVersion[];
  fullTestVersions?: HPFullTestVersion[];
  selectedVersionId?: string;
  onSelectVersion: (versionId: string) => void;
  sectionName: string;
  sectionColor: string;
  isFullTest?: boolean;
}

export default function TestVersionSelector({
  visible,
  onClose,
  testVersions,
  fullTestVersions = [],
  selectedVersionId,
  onSelectVersion,
  sectionName,
  sectionColor,
  isFullTest = false,
}: TestVersionSelectorProps) {
  const { theme, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  // Ensure data is available - use direct constant access as fallback for iOS reliability
  const safeTestVersions = useMemo(() => {
    if (testVersions && testVersions.length > 0) {
      return testVersions;
    }
    // Fallback: try to extract section from sectionName and get from constant
    console.log('[TestVersionSelector] testVersions empty, using fallback');
    return [];
  }, [testVersions]);
  
  const safeFullTestVersions = useMemo(() => {
    if (fullTestVersions && fullTestVersions.length > 0) {
      return fullTestVersions;
    }
    // Fallback for full test versions
    if (isFullTest) {
      console.log('[TestVersionSelector] fullTestVersions empty, using HP_FULL_TEST_VERSIONS fallback');
      return HP_FULL_TEST_VERSIONS ?? [];
    }
    return [];
  }, [fullTestVersions, isFullTest]);

  useEffect(() => {
    if (visible) {
      console.log('[TestVersionSelector] Modal visible, checking data:', {
        isFullTest,
        sectionName,
        testVersionsCount: safeTestVersions.length,
        fullTestVersionsCount: safeFullTestVersions.length,
        rawTestVersionsCount: testVersions?.length ?? 0,
        rawFullTestVersionsCount: fullTestVersions?.length ?? 0,
        HP_FULL_TEST_VERSIONS_count: HP_FULL_TEST_VERSIONS?.length ?? 0,
      });
      
      // Shorter delay and immediate ready if we have data
      const hasData = isFullTest 
        ? safeFullTestVersions.length > 0 
        : true; // For sections, always show (mixed option is always available)
      
      if (hasData) {
        // Set ready immediately if we have data
        setIsReady(true);
        console.log('[TestVersionSelector] Data available, setting ready immediately');
      } else {
        // Short delay as fallback
        const timer = setTimeout(() => {
          setIsReady(true);
          console.log('[TestVersionSelector] Ready after delay');
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setIsReady(false);
    }
  }, [visible, isFullTest, sectionName, safeTestVersions.length, safeFullTestVersions.length, testVersions?.length, fullTestVersions?.length]);

  const handleSelectVersion = (versionId: string) => {
    onSelectVersion(versionId);
    onClose();
  };

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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <LinearGradient
                colors={isFullTest ? [COLORS.primary, '#8B5CF6'] : [sectionColor, sectionColor]}
                style={styles.headerIconBg}
              >
                <FileText size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Välj testversion
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {sectionName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!isReady && visible ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Laddar testversioner...
                </Text>
              </View>
            ) : isFullTest ? (
              <>
                {/* Always show mixed option first */}
                <TouchableOpacity
                  style={[
                    styles.mixedCard,
                    { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' },
                  ]}
                  onPress={() => handleSelectVersion('')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#8B5CF6']}
                    style={styles.mixedIconBg}
                  >
                    <Shuffle size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.mixedContent}>
                    <Text style={[styles.mixedTitle, { color: theme.colors.text }]}>
                      Blandade frågor
                    </Text>
                    <Text style={[styles.mixedDescription, { color: theme.colors.textSecondary }]}>
                      Slumpmässigt urval från alla tillgängliga frågor
                    </Text>
                    <View style={styles.mixedStats}>
                      <View style={styles.mixedStat}>
                        <Target size={12} color={COLORS.primary} />
                        <Text style={[styles.mixedStatText, { color: COLORS.primary }]}>120 frågor</Text>
                      </View>
                      <View style={styles.mixedStat}>
                        <Clock size={12} color={COLORS.primary} />
                        <Text style={[styles.mixedStatText, { color: COLORS.primary }]}>235 min</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {safeFullTestVersions.length > 0 && (
                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                      Specifika provtillfällen
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                  </View>
                )}

                {safeFullTestVersions.map((version) => {
                  const isSelected = selectedVersionId === version.id;

                  return (
                    <TouchableOpacity
                      key={version.id}
                      style={[
                        styles.versionCard,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: isSelected ? COLORS.primary : theme.colors.border,
                        },
                        isSelected && styles.selectedCard,
                      ]}
                      onPress={() => handleSelectVersion(version.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.versionCardContent}>
                        <View style={[styles.versionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                          <Text style={styles.seasonEmoji}>{getSeasonIcon(version.season)}</Text>
                        </View>
                        <View style={styles.versionInfo}>
                          <Text style={[styles.versionName, { color: theme.colors.text }]}>
                            {version.displayName}
                          </Text>
                          <View style={styles.versionMeta}>
                            <View style={styles.versionMetaItem}>
                              <Target size={12} color={theme.colors.textSecondary} />
                              <Text style={[styles.versionMetaText, { color: theme.colors.textSecondary }]}>
                                {version.questionCount} frågor
                              </Text>
                            </View>
                            <View style={styles.versionMetaItem}>
                              <Clock size={12} color={theme.colors.textSecondary} />
                              <Text style={[styles.versionMetaText, { color: theme.colors.textSecondary }]}>
                                {version.timeMinutes} min
                              </Text>
                            </View>
                          </View>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                            <Check size={18} color={COLORS.primary} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.mixedCard,
                    { backgroundColor: isDark ? `${sectionColor}20` : `${sectionColor}10` },
                  ]}
                  onPress={() => handleSelectVersion('')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[sectionColor, sectionColor]}
                    style={styles.mixedIconBg}
                  >
                    <Shuffle size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.mixedContent}>
                    <Text style={[styles.mixedTitle, { color: theme.colors.text }]}>
                      Blandade frågor
                    </Text>
                    <Text style={[styles.mixedDescription, { color: theme.colors.textSecondary }]}>
                      Slumpmässigt urval från alla tillgängliga frågor
                    </Text>
                  </View>
                </TouchableOpacity>

                {safeTestVersions.length > 0 && (
                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                      Eller välj specifikt test
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                  </View>
                )}

                {safeTestVersions.map((version) => {
                  const isSelected = selectedVersionId === version.id;

                  return (
                    <TouchableOpacity
                      key={version.id}
                      style={[
                        styles.versionCard,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: isSelected ? sectionColor : theme.colors.border,
                        },
                        isSelected && styles.selectedCard,
                      ]}
                      onPress={() => handleSelectVersion(version.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.versionCardContent}>
                        <View style={[styles.versionIcon, { backgroundColor: `${sectionColor}15` }]}>
                          <Calendar size={20} color={sectionColor} />
                        </View>
                        <View style={styles.versionInfo}>
                          <Text style={[styles.versionName, { color: theme.colors.text }]}>
                            {version.name}
                          </Text>
                          <Text style={[styles.versionDescription, { color: theme.colors.textSecondary }]}>
                            {version.questionCount} frågor
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkIcon, { backgroundColor: `${sectionColor}20` }]}>
                            <Check size={18} color={sectionColor} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              {isFullTest
                ? 'Välj ett specifikt provtillfälle för att öva med frågor från det provet, eller blandade frågor för variation.'
                : 'Välj en testversion för att öva på specifika frågor från tidigare tillfällen.'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mixedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    gap: 14,
  },
  mixedIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mixedContent: {
    flex: 1,
  },
  mixedTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  mixedDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  mixedStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  mixedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mixedStatText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  versionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
  },
  selectedCard: {
    borderWidth: 2,
  },
  versionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  versionDescription: {
    fontSize: 13,
  },
  versionMeta: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  versionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  versionMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  checkIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
