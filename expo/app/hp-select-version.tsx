import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ROUTES } from '@/utils/typedRoutes';
import {
  ChevronLeft,
  Target,
  Clock,
  Play,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { HP_SECTIONS, HPSectionConfig, HPQuestion } from '@/constants/hogskoleprovet';
import { useHPQuestionBank } from '@/lib/hp-content';
import { COLORS } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COUNT_OPTIONS = [10, 20, 40];

const DIFFICULTY_OPTIONS: Array<{ value: HPQuestion['difficulty'] | 'all'; label: string }> = [
  { value: 'all', label: 'Alla' },
  { value: 'easy', label: 'Lätt' },
  { value: 'medium', label: 'Medel' },
  { value: 'hard', label: 'Svår' },
];

export default function HPSelectVersionScreen() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  const { questions: questionBank, isLoading: isBankLoading } = useHPQuestionBank();
  const params = useLocalSearchParams<{ sectionCode: string }>();
  const [isReady, setIsReady] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<HPQuestion['difficulty'] | 'all'>('all');

  const sectionCode = useMemo(() => {
    const code = params.sectionCode || '';
    return decodeURIComponent(code);
  }, [params]);

  const section = useMemo((): HPSectionConfig | undefined => {
    if (!sectionCode) return undefined;
    return HP_SECTIONS.find(s => s.code === sectionCode);
  }, [sectionCode]);

  const bankCount = useMemo(
    () => questionBank.filter(q => q.sectionCode === sectionCode).length,
    [questionBank, sectionCode]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !isPremium) {
      router.replace(ROUTES.premium);
    }
  }, [isReady, isPremium]);

  const handleStart = () => {
    if (isBankLoading || bankCount === 0) return;
    router.push({
      pathname: `/hp-practice/${sectionCode}` as any,
      params: {
        count: String(selectedCount),
        difficulty: selectedDifficulty === 'all' ? '' : selectedDifficulty,
      },
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

  const canStart = !isBankLoading && bankCount > 0;

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
                <Text style={styles.headerSubtitle}>Övningspass</Text>
              </View>
            </View>

            <View style={styles.sectionInfo}>
              <View style={styles.sectionInfoItem}>
                <Clock size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sectionInfoText}>{section.timeMinutes} min</Text>
              </View>
              <View style={styles.sectionInfoItem}>
                <Target size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sectionInfoText}>
                  {isBankLoading ? '…' : bankCount} frågor i banken
                </Text>
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
        {isBankLoading ? (
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={section.color} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Hämtar frågebanken…
            </Text>
          </View>
        ) : (
          <>
            {/* Antal frågor */}
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Antal frågor</Text>
              <View style={styles.chipRow}>
                {COUNT_OPTIONS.map(count => {
                  const isSelected = selectedCount === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.chip,
                        { backgroundColor: isSelected ? section.color : theme.colors.surface },
                      ]}
                      onPress={() => setSelectedCount(count)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFF' : theme.colors.text },
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Nivå */}
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Nivå</Text>
              <View style={styles.chipRow}>
                {DIFFICULTY_OPTIONS.map(option => {
                  const isSelected = selectedDifficulty === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.chip,
                        { backgroundColor: isSelected ? section.color : theme.colors.surface },
                      ]}
                      onPress={() => setSelectedDifficulty(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFF' : theme.colors.text },
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Starta övning */}
            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: canStart ? section.color : theme.colors.surface },
                !canStart && styles.startButtonDisabled,
              ]}
              onPress={handleStart}
              disabled={!canStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={canStart ? section.gradientColors as [string, string] : [theme.colors.surface, theme.colors.surface]}
                style={styles.startButtonGradient}
              >
                <Play size={22} color={canStart ? '#FFF' : theme.colors.textSecondary} fill={canStart ? '#FFF' : theme.colors.textSecondary} />
                <Text
                  style={[styles.startButtonText, { color: canStart ? '#FFF' : theme.colors.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Starta övning
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {bankCount === 0 && (
              <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                Inga frågor i banken för detta delprov ännu.
              </Text>
            )}
          </>
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
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
  },
  optionGroup: {
    marginBottom: 28,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minWidth: (SCREEN_WIDTH - 40 - 30) / 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  startButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center' as const,
    marginBottom: 16,
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
