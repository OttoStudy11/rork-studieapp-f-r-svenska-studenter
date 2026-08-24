import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Target,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHPTheory } from '@/contexts/HPTheoryContext';
import { getTheoryCategoryById, HPTheoryArticle } from '@/constants/hogskoleprovet-theory';
import { HPTheoryBlock } from '@/constants/hp-theory-types';
import { ROUTES } from '@/utils/typedRoutes';

function BlockRenderer({ block, articleColor }: { block: HPTheoryBlock; articleColor: string }) {
  const { theme, isDark } = useTheme();

  switch (block.type) {
    case 'heading':
      return <Text style={[bs.heading, { color: theme.colors.text }]}>{block.text}</Text>;
    case 'paragraph':
      return <Text style={[bs.paragraph, { color: theme.colors.textSecondary }]}>{block.text}</Text>;
    case 'list':
      return (
        <View style={bs.list}>
          {block.items.map((item, i) => (
            <View key={`${i}-${item.slice(0, 12)}`} style={bs.listRow}>
              {block.ordered ? (
                <View style={[bs.listNum, { backgroundColor: articleColor + '18' }]}>
                  <Text style={[bs.listNumText, { color: articleColor }]}>{i + 1}</Text>
                </View>
              ) : (
                <View style={[bs.listDot, { backgroundColor: articleColor }]} />
              )}
              <Text style={[bs.listText, { color: theme.colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'tip':
      return (
        <View style={[bs.callout, { backgroundColor: isDark ? 'rgba(16,185,129,0.10)' : '#ECFDF5', borderColor: isDark ? 'rgba(16,185,129,0.25)' : '#A7F3D0' }]}>
          <Lightbulb size={16} color="#10B981" />
          <Text style={[bs.calloutText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>{block.text}</Text>
        </View>
      );
    case 'warning':
      return (
        <View style={[bs.callout, { backgroundColor: isDark ? 'rgba(245,158,11,0.10)' : '#FFFBEB', borderColor: isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A' }]}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={[bs.calloutText, { color: isDark ? '#FCD34D' : '#92400E' }]}>{block.text}</Text>
        </View>
      );
    case 'stat':
      return (
        <View style={[bs.statCard, { backgroundColor: articleColor + '12', borderColor: articleColor + '30' }]}>
          <Text style={[bs.statValue, { color: articleColor }]}>{block.value}</Text>
          <Text style={[bs.statLabel, { color: theme.colors.textSecondary }]}>{block.label}</Text>
        </View>
      );
    case 'example':
      return (
        <View style={[bs.example, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={bs.exampleHeader}>
            <Target size={14} color={articleColor} />
            <Text style={[bs.exampleTitle, { color: articleColor }]}>{block.title}</Text>
          </View>
          <Text style={[bs.exampleQuestion, { color: theme.colors.text }]}>{block.question}</Text>
          {block.options && block.options.map((opt, i) => {
            const isCorrect = opt === block.answer;
            return (
              <View
                key={`${i}-${opt.slice(0, 12)}`}
                style={[bs.exampleOption, {
                  backgroundColor: isCorrect ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : 'transparent',
                  borderColor: isCorrect ? '#10B981' : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'),
                }]}
              >
                <Text style={[bs.exampleOptionText, { color: isCorrect ? '#10B981' : theme.colors.textSecondary, fontWeight: isCorrect ? ('700' as const) : ('500' as const) }]}>
                  {opt}
                </Text>
                {isCorrect && <CheckCircle2 size={15} color="#10B981" />}
              </View>
            );
          })}
          {!block.options && (
            <View style={[bs.exampleAnswerPill, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', borderColor: '#10B981' }]}>
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={bs.exampleAnswerText}>{block.answer}</Text>
            </View>
          )}
          <Text style={[bs.exampleExplanation, { color: theme.colors.textSecondary }]}>{block.explanation}</Text>
        </View>
      );
    default:
      return null;
  }
}

export default function HPTheoryArticleScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const { theme, isDark } = useTheme();
  const { articles, getProgress, updateProgress, markCompleted } = useHPTheory();
  const hasMarkedEnd = useRef<boolean>(false);

  const article: HPTheoryArticle | undefined = useMemo(
    () => articles.find(a => a.id === articleId),
    [articles, articleId]
  );

  const nextArticle: HPTheoryArticle | undefined = useMemo(() => {
    if (!article) return undefined;
    const sameCategory = articles
      .filter(a => a.category === article.category)
      .sort((a, b) => a.order - b.order);
    const idx = sameCategory.findIndex(a => a.id === article.id);
    return idx >= 0 && idx < sameCategory.length - 1 ? sameCategory[idx + 1] : undefined;
  }, [articles, article]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!article) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    if (scrollable <= 0) return;
    const pct = Math.min(100, Math.max(0, (contentOffset.y / scrollable) * 100));
    updateProgress(article.id, pct);
    if (pct >= 92 && !hasMarkedEnd.current) {
      hasMarkedEnd.current = true;
      markCompleted(article.id);
    }
  }, [article, updateProgress, markCompleted]);

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => router.back()}>
              <ChevronLeft size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.notFound, { color: theme.colors.textSecondary }]}>Artikeln kunde inte hittas.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const category = getTheoryCategoryById(article.category);
  const progress = getProgress(article.id);
  const isDone = progress >= 95;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
            testID="theory-article-back"
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          {/* Reading progress bar */}
          <View style={[styles.headerProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={[styles.headerProgressFill, { width: `${progress}%`, backgroundColor: article.color }]} />
          </View>
          {isDone ? <CheckCircle2 size={22} color="#10B981" /> : <View style={styles.headerSpacer} />}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={120}
      >
        {/* Article hero */}
        <LinearGradient
          colors={article.gradient as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>{article.emoji}</Text>
          <View style={styles.heroCategoryPill}>
            <Text style={styles.heroCategoryText}>{category.title}</Text>
          </View>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <Text style={styles.heroSubtitle}>{article.subtitle}</Text>
          <View style={styles.heroMetaRow}>
            <Clock size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroMetaText}>{article.readingMinutes} min läsning</Text>
          </View>
        </LinearGradient>

        {/* Blocks */}
        <View style={styles.body}>
          {article.blocks.map((block, i) => (
            <BlockRenderer key={`block-${i}`} block={block} articleColor={article.color} />
          ))}
        </View>

        {/* Practice CTA for section guides */}
        {article.sectionCode && (
          <TouchableOpacity
            style={[styles.practiceCta, { backgroundColor: article.color }]}
            onPress={() => router.push(ROUTES.hpPractice(article.sectionCode ?? ''))}
            activeOpacity={0.9}
          >
            <Text style={styles.practiceCtaText}>Öva {article.sectionCode} nu</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Next article */}
        {nextArticle && (
          <TouchableOpacity
            style={[styles.nextCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
            onPress={() => router.replace({ pathname: '/hp-theory/[articleId]', params: { articleId: nextArticle.id } })}
            activeOpacity={0.85}
          >
            <View style={styles.nextBody}>
              <Text style={[styles.nextLabel, { color: theme.colors.textSecondary }]}>NÄSTA ARTIKEL</Text>
              <Text style={[styles.nextTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {nextArticle.emoji} {nextArticle.title}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProgressBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  headerSpacer: { width: 22 },
  notFound: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  hero: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 24,
    padding: 22,
  },
  heroEmoji: {
    fontSize: 38,
    marginBottom: 10,
  },
  heroCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroCategoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 23,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 14,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  practiceCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 26,
    borderRadius: 18,
    paddingVertical: 16,
  },
  practiceCtaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  nextBody: { flex: 1 },
  nextLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 3,
  },
  nextTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});

const bs = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  listNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  listNumText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  calloutText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500' as const,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginBottom: 14,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12.5,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  example: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    marginBottom: 14,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  exampleQuestion: {
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  exampleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  exampleOptionText: {
    flex: 1,
    fontSize: 13.5,
  },
  exampleAnswerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  exampleAnswerText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  exampleExplanation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontStyle: 'italic' as const,
  },
});
