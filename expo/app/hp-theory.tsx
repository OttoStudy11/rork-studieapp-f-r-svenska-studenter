import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHPTheory } from '@/contexts/HPTheoryContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import {
  HP_THEORY_CATEGORIES,
  HPTheoryArticle,
  HPTheoryCategoryId,
} from '@/constants/hogskoleprovet-theory';
import { buildHPRecommendations, HPRecommendation } from '@/lib/hp-recommendations';
import { ROUTES } from '@/utils/typedRoutes';

export default function HPTheoryScreen() {
  const { theme, isDark } = useTheme();
  const { articles, getProgress, completedCount, readArticleIds } = useHPTheory();
  const { getUserStats } = useHogskoleprovet();
  const stats = getUserStats();

  const totalMinutes = useMemo(
    () => articles.reduce((sum, a) => sum + a.readingMinutes, 0),
    [articles]
  );

  const recommendations = useMemo<HPRecommendation[]>(
    () =>
      buildHPRecommendations(
        {
          totalAttempts: stats.totalAttempts,
          currentStreak: stats.currentStreak,
          sectionStats: stats.sectionStats,
          readArticleIds,
        },
        2
      ).filter(r => r.type === 'theory' && r.articleId),
    [stats.totalAttempts, stats.currentStreak, stats.sectionStats, readArticleIds]
  );

  const articlesByCategory = useMemo(() => {
    const map: Record<HPTheoryCategoryId, HPTheoryArticle[]> = {
      'intro': [],
      'high-score': [],
      'section-guide': [],
      'study-technique': [],
      'exam-strategy': [],
    };
    for (const a of articles) {
      map[a.category]?.push(a);
    }
    (Object.keys(map) as HPTheoryCategoryId[]).forEach(k => map[k].sort((a, b) => a.order - b.order));
    return map;
  }, [articles]);

  const openArticle = (articleId: string) => {
    router.push({ pathname: '/hp-theory/[articleId]', params: { articleId } });
  };

  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const progressPct = articles.length > 0 ? Math.round((completedCount / articles.length) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
            testID="hp-theory-back"
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Teori & guider</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={isDark ? ['#1E1B4B', '#312E81', '#4338CA'] : ['#4F46E5', '#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconRow}>
            <View style={styles.heroIconCircle}>
              <BookOpen size={22} color="#FFF" strokeWidth={2.2} />
            </View>
            <View style={styles.heroMetaPill}>
              <Clock size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText}>{totalMinutes} min läsning totalt</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Bli expert på provet</Text>
          <Text style={styles.heroSubtitle}>
            Allt om provets delar, poängsystem, studietekniker och strategier — som en minikurs i appen.
          </Text>
          <View style={styles.heroProgressRow}>
            <View style={styles.heroProgressBg}>
              <View style={[styles.heroProgressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.heroProgressText}>
              {completedCount}/{articles.length} lästa
            </Text>
          </View>
        </LinearGradient>

        {/* Personalized recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Sparkles size={14} color="#F59E0B" />
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>REKOMMENDERAT FÖR DIG</Text>
            </View>
            {recommendations.map(rec => (
              <TouchableOpacity
                key={rec.id}
                style={[styles.recCard, { backgroundColor: theme.colors.surface, borderColor }]}
                onPress={() => rec.articleId && openArticle(rec.articleId)}
                activeOpacity={0.85}
              >
                <View style={[styles.recEmojiCircle, { backgroundColor: rec.color + '18' }]}>
                  <Text style={styles.recEmoji}>{rec.emoji}</Text>
                </View>
                <View style={styles.recBody}>
                  <Text style={[styles.recTitle, { color: theme.colors.text }]} numberOfLines={1}>{rec.title}</Text>
                  <Text style={[styles.recMessage, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {rec.message}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Categories */}
        {HP_THEORY_CATEGORIES.map(category => {
          const items = articlesByCategory[category.id];
          if (!items || items.length === 0) return null;
          return (
            <View key={category.id} style={styles.section}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryEmojiCircle, { backgroundColor: category.color + '18' }]}>
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                </View>
                <View style={styles.categoryTitleBlock}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{category.title}</Text>
                  <Text style={[styles.categorySubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {category.subtitle}
                  </Text>
                </View>
              </View>

              {items.map(article => {
                const progress = getProgress(article.id);
                const done = progress >= 95;
                return (
                  <TouchableOpacity
                    key={article.id}
                    style={[styles.articleCard, { backgroundColor: theme.colors.surface, borderColor }]}
                    onPress={() => openArticle(article.id)}
                    activeOpacity={0.85}
                    testID={`theory-card-${article.id}`}
                  >
                    <View style={[styles.articleEmojiBox, { backgroundColor: article.color + '15' }]}>
                      <Text style={styles.articleEmoji}>{article.emoji}</Text>
                    </View>
                    <View style={styles.articleBody}>
                      <Text style={[styles.articleTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {article.title}
                      </Text>
                      <Text style={[styles.articleSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {article.subtitle}
                      </Text>
                      <View style={styles.articleMetaRow}>
                        <Clock size={11} color={theme.colors.textSecondary} />
                        <Text style={[styles.articleMetaText, { color: theme.colors.textSecondary }]}>
                          {article.readingMinutes} min
                        </Text>
                        {progress > 0 && !done && (
                          <View style={styles.articleProgressWrap}>
                            <View style={[styles.articleProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                              <View style={[styles.articleProgressFill, { width: `${progress}%`, backgroundColor: article.color }]} />
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                    {done ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : (
                      <ChevronRight size={18} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Practice CTA */}
        <TouchableOpacity
          style={styles.practiceCta}
          onPress={() => router.push(ROUTES.hogskoleprovet)}
          activeOpacity={0.9}
        >
          <Text style={styles.practiceCtaText}>Redo att öva? Gå till delproven</Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  hero: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 24,
    padding: 22,
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroMetaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 16,
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  heroProgressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  recEmojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recEmoji: { fontSize: 20 },
  recBody: { flex: 1 },
  recTitle: {
    fontSize: 14.5,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  recMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  categoryEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 19 },
  categoryTitleBlock: { flex: 1 },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
  categorySubtitle: {
    fontSize: 12.5,
    marginTop: 1,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  articleEmojiBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleEmoji: { fontSize: 22 },
  articleBody: { flex: 1 },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  articleSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  articleMetaText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  articleProgressWrap: {
    flex: 1,
    marginLeft: 8,
  },
  articleProgressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  articleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  practiceCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 30,
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 16,
  },
  practiceCtaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
