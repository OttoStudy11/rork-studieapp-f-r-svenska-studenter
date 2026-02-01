import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Shuffle,
  Calendar,
  Target,
  Clock,
  FileText,
  Play,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HP_SECTIONS, HP_TEST_VERSIONS, HPTestVersion, HPSectionConfig } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');



export default function HPSelectVersionScreen() {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams<{ sectionCode: string }>();
  const [isReady, setIsReady] = useState(false);
  
  const sectionCode = useMemo(() => {
    const code = params.sectionCode || '';
    const decoded = decodeURIComponent(code);
    console.log('[HP Select Version] Raw params:', params);
    console.log('[HP Select Version] Decoded sectionCode:', decoded);
    return decoded;
  }, [params]);

  const section = useMemo((): HPSectionConfig | undefined => {
    if (!sectionCode) return undefined;
    const found = HP_SECTIONS.find(s => s.code === sectionCode);
    console.log('[HP Select Version] Found section:', found?.name);
    return found;
  }, [sectionCode]);

  const testVersions = useMemo((): HPTestVersion[] => {
    if (!sectionCode) {
      console.log('[HP Select Version] No sectionCode, returning empty');
      return [];
    }
    
    const filtered = HP_TEST_VERSIONS.filter(v => v.sectionCode === sectionCode);
    console.log('[HP Select Version] Found test versions:', filtered.length);
    return filtered;
  }, [sectionCode]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('[HP Select Version] State:', {
      sectionCode,
      sectionName: section?.name,
      testVersionsCount: testVersions.length,
      isReady,
    });
  }, [sectionCode, section, testVersions, isReady]);

  const handleSelectMixed = () => {
    console.log('[HP Select Version] Selected: Mixed questions for', sectionCode);
    router.push({
      pathname: `/hp-practice/${sectionCode}` as any,
      params: { testVersionId: '' },
    });
  };

  const handleSelectVersion = (version: HPTestVersion) => {
    console.log('[HP Select Version] Selected version:', version.id);
    router.push({
      pathname: `/hp-practice/${sectionCode}` as any,
      params: { testVersionId: version.id },
    });
  };

  if (!section) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Kunde inte hitta delprovet
          </Text>
          <TouchableOpacity
            style={[styles.backButtonLarge, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: COLORS.primary }]}>
              Gå tillbaka
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[...section.gradientColors, `${section.gradientColors[1]}CC`] as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Text style={styles.headerIcon}>{section.icon}</Text>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{section.fullName}</Text>
                <Text style={styles.headerSubtitle}>
                  Välj en testversion eller blandade frågor
                </Text>
              </View>
            </View>

            <View style={styles.sectionInfo}>
              <View style={styles.sectionInfoItem}>
                <Clock size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sectionInfoText}>{section.timeMinutes} min</Text>
              </View>
              <View style={styles.sectionInfoItem}>
                <Target size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sectionInfoText}>{section.questionCount} frågor</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mixed Questions - Primary Option */}
        <TouchableOpacity
          style={[styles.mixedCard, { backgroundColor: isDark ? `${section.color}25` : `${section.color}12` }]}
          onPress={handleSelectMixed}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={section.gradientColors as [string, string]}
            style={styles.mixedIconBg}
          >
            <Shuffle size={28} color="#FFF" />
          </LinearGradient>
          <View style={styles.mixedContent}>
            <Text style={[styles.mixedTitle, { color: theme.colors.text }]}>
              Blandade frågor
            </Text>
            <Text style={[styles.mixedDescription, { color: theme.colors.textSecondary }]}>
              Slumpmässigt urval från alla tillgängliga frågor. Perfekt för varierad träning.
            </Text>
            <View style={styles.mixedBadge}>
              <Text style={[styles.mixedBadgeText, { color: section.color }]}>
                Rekommenderat
              </Text>
            </View>
          </View>
          <View style={[styles.playButton, { backgroundColor: section.color }]}>
            <Play size={20} color="#FFF" fill="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.dividerTextBg, { backgroundColor: theme.colors.background }]}>
            <FileText size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              Specifika testversioner
            </Text>
          </View>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Test Version Cards */}
        <View style={styles.versionsGrid}>
          {testVersions.map((version) => (
            <TouchableOpacity
              key={version.id}
              style={[
                styles.versionCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => handleSelectVersion(version)}
              activeOpacity={0.7}
            >
              <View style={[styles.versionIconBg, { backgroundColor: `${section.color}15` }]}>
                <Calendar size={24} color={section.color} />
              </View>
              <Text style={[styles.versionName, { color: theme.colors.text }]}>
                {version.name}
              </Text>
              <View style={styles.versionDetails}>
                <Text style={[styles.versionQuestionCount, { color: theme.colors.textSecondary }]}>
                  {version.questionCount} frågor
                </Text>
                {version.year && (
                  <Text style={[styles.versionYear, { color: theme.colors.textSecondary }]}>
                    {version.season === 'spring' ? 'Vår' : 'Höst'} {version.year}
                  </Text>
                )}
              </View>
              <View style={[styles.versionStartButton, { backgroundColor: `${section.color}15` }]}>
                <Play size={14} color={section.color} fill={section.color} />
                <Text style={[styles.versionStartText, { color: section.color }]}>
                  Starta
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {testVersions.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Inga specifika testversioner tillgängliga för detta delprov ännu.
            </Text>
            <Text style={[styles.emptyStateHint, { color: theme.colors.textSecondary }]}>
              Använd Blandade frågor ovan för att börja träna!
            </Text>
          </View>
        )}

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            💡 Tips för {section.name}
          </Text>
          {section.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipBullet, { backgroundColor: section.color }]} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  sectionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionInfoText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mixedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 16,
    marginBottom: 24,
  },
  mixedIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mixedContent: {
    flex: 1,
  },
  mixedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  mixedDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  mixedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  mixedBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerTextBg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  versionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  versionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  versionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  versionDetails: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 2,
  },
  versionQuestionCount: {
    fontSize: 13,
  },
  versionYear: {
    fontSize: 11,
  },
  versionStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  versionStartText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  emptyState: {
    flex: 1,
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 13,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  backButtonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
