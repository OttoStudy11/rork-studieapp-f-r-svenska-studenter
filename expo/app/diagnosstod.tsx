import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  Search,
  Heart,
  Brain,
  Eye,
  Zap,
  Wind,
  Hash,
  Focus,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

const { width } = Dimensions.get('window');

export interface DiagnosisInfo {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  tagline: string;
  color: string;
  gradientColors: [string, string];
  category: 'neuropsykiatri' | 'inlärning' | 'psykisk-halsa';
  categoryLabel: string;
  tags: string[];
  featured?: boolean;
}

export const DIAGNOSES: DiagnosisInfo[] = [
  {
    id: 'adhd',
    name: 'ADHD',
    shortName: 'ADHD',
    emoji: '⚡',
    tagline: 'Hyperaktivitet, impulsivitet & koncentrationssvårigheter',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#EF4444'],
    category: 'neuropsykiatri',
    categoryLabel: 'Neuropsykiatri',
    tags: ['Fokus', 'Struktur', 'Rörelse'],
    featured: true,
  },
  {
    id: 'autism',
    name: 'Autism / ASD',
    shortName: 'Autism',
    emoji: '🌈',
    tagline: 'Autismspektrumsyndrom — styrkor & utmaningar',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#6366F1'],
    category: 'neuropsykiatri',
    categoryLabel: 'Neuropsykiatri',
    tags: ['Rutiner', 'Tydlighet', 'Sensitivitet'],
    featured: true,
  },
  {
    id: 'dyslexia',
    name: 'Dyslexi',
    shortName: 'Dyslexi',
    emoji: '📖',
    tagline: 'Läs- och skrivsvårigheter — alternativa inlärningsvägar',
    color: '#3B82F6',
    gradientColors: ['#3B82F6', '#06B6D4'],
    category: 'inlärning',
    categoryLabel: 'Inlärningssvårigheter',
    tags: ['Ljud', 'Bilder', 'Tid'],
    featured: true,
  },
  {
    id: 'add',
    name: 'ADD',
    shortName: 'ADD',
    emoji: '🌊',
    tagline: 'Uppmärksamhetsstörning utan hyperaktivitet',
    color: '#06B6D4',
    gradientColors: ['#06B6D4', '#3B82F6'],
    category: 'neuropsykiatri',
    categoryLabel: 'Neuropsykiatri',
    tags: ['Fokus', 'Dagdrömmar', 'Minne'],
  },
  {
    id: 'anxiety',
    name: 'Ångest & Stress',
    shortName: 'Ångest',
    emoji: '🌿',
    tagline: 'Oro, prestationsångest och studiestressprovhantering',
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'],
    category: 'psykisk-halsa',
    categoryLabel: 'Psykisk hälsa',
    tags: ['Andning', 'Mindfulness', 'Pauser'],
  },
  {
    id: 'dyscalculia',
    name: 'Dyskalkyli',
    shortName: 'Dyskalkyli',
    emoji: '🔢',
    tagline: 'Matematiksvårigheter — visuella & konkreta strategier',
    color: '#EC4899',
    gradientColors: ['#EC4899', '#F97316'],
    category: 'inlärning',
    categoryLabel: 'Inlärningssvårigheter',
    tags: ['Visuellt', 'Konkret', 'Mönster'],
  },
  {
    id: 'concentration',
    name: 'Koncentrationssvårigheter',
    shortName: 'Koncentration',
    emoji: '🎯',
    tagline: 'Generella svårigheter att hålla fokus och upprätthålla uppmärksamhet',
    color: '#6366F1',
    gradientColors: ['#6366F1', '#8B5CF6'],
    category: 'neuropsykiatri',
    categoryLabel: 'Neuropsykiatri',
    tags: ['Miljö', 'Timer', 'Energi'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Alla' },
  { id: 'neuropsykiatri', label: 'Neuropsykiatri' },
  { id: 'inlärning', label: 'Inlärning' },
  { id: 'psykisk-halsa', label: 'Psykisk hälsa' },
];

function DiagnosisCard({
  diagnosis,
  onPress,
  delay,
}: {
  diagnosis: DiagnosisInfo;
  onPress: () => void;
  delay: number;
}) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 400,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 8,
    }).start();
  };

  return (
    <FadeInView delay={delay}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[styles.diagnosisCard, { backgroundColor: theme.colors.card }]}
        >
          <LinearGradient
            colors={[diagnosis.gradientColors[0] + '18', diagnosis.gradientColors[1] + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.diagnosisCardGradient}
          >
            {/* Left accent bar */}
            <LinearGradient
              colors={diagnosis.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.diagnosisAccentBar}
            />

            <View style={styles.diagnosisCardContent}>
              {/* Top row */}
              <View style={styles.diagnosisCardTop}>
                <View style={[styles.diagnosisEmojiWrap, { backgroundColor: diagnosis.color + '20' }]}>
                  <Text style={styles.diagnosisEmoji}>{diagnosis.emoji}</Text>
                </View>

                <View style={styles.diagnosisCardInfo}>
                  <Text style={[styles.diagnosisName, { color: theme.colors.text }]}>
                    {diagnosis.name}
                  </Text>
                  <Text
                    style={[styles.diagnosisTagline, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {diagnosis.tagline}
                  </Text>
                </View>

                <ChevronRight size={20} color={theme.colors.textMuted} />
              </View>

              {/* Tags row */}
              <View style={styles.tagRow}>
                {diagnosis.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: diagnosis.color + '15' }]}
                  >
                    <Text style={[styles.tagText, { color: diagnosis.color }]}>{tag}</Text>
                  </View>
                ))}
                <View style={[styles.tag, { backgroundColor: theme.colors.border }]}>
                  <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                    {diagnosis.categoryLabel}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </FadeInView>
  );
}

export default function DiagnosstodScreen() {
  const { theme, isDark } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useCallback(() => {
    let list = DIAGNOSES;
    if (activeCategory !== 'all') {
      list = list.filter((d) => d.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query, activeCategory]);

  const featured = DIAGNOSES.filter((d) => d.featured);
  const results = filtered();
  const showFeatured = query.trim() === '' && activeCategory === 'all';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#312E81', theme.colors.background] : ['#EEF2FF', '#F5F3FF', theme.colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)' }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={isDark ? '#A5B4FC' : '#6366F1'} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerBadge}>
              <Heart size={14} color="#EC4899" fill="#EC4899" />
              <Text style={styles.headerBadgeText}>Studiestöd</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Diagnosstöd</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Personaliserade strategier för just dig
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF' }]}>
          <Search size={18} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Sök diagnos eller strategi…"
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                activeCategory === cat.id
                  ? { backgroundColor: '#6366F1' }
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.card },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: activeCategory === cat.id ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured "Recommended for you" */}
        {showFeatured && (
          <SlideInView direction="up" delay={50}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Vanligast bland studenter
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredRow}
              >
                {featured.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={styles.featuredCard}
                    onPress={() => router.push(`/diagnos/${d.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={d.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featuredCardGradient}
                    >
                      <Text style={styles.featuredEmoji}>{d.emoji}</Text>
                      <Text style={styles.featuredName}>{d.shortName}</Text>
                      <Text style={styles.featuredTagline} numberOfLines={2}>
                        {d.tagline}
                      </Text>
                      <View style={styles.featuredArrow}>
                        <Text style={styles.featuredArrowText}>Utforska →</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </SlideInView>
        )}

        {/* Info banner */}
        {showFeatured && (
          <SlideInView direction="up" delay={80}>
            <View style={[styles.infoBanner, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF' }]}>
              <Sparkles size={18} color="#6366F1" />
              <Text style={[styles.infoBannerText, { color: isDark ? '#A5B4FC' : '#4338CA' }]}>
                Välj din diagnos för att få skräddarsydda studiestrategier, tips och Studiestugan-specifika rekommendationer.
              </Text>
            </View>
          </SlideInView>
        )}

        {/* All diagnoses list */}
        <View style={styles.section}>
          {showFeatured && (
            <View style={styles.sectionHeader}>
              <Brain size={16} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Alla diagnoser ({results.length})
              </Text>
            </View>
          )}

          {results.length === 0 ? (
            <FadeInView delay={100}>
              <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inga träffar</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Prova ett annat sökord
                </Text>
              </View>
            </FadeInView>
          ) : (
            <View style={styles.cardList}>
              {results.map((d, i) => (
                <DiagnosisCard
                  key={d.id}
                  diagnosis={d}
                  delay={100 + i * 40}
                  onPress={() => router.push(`/diagnos/${d.id}` as any)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <FadeInView delay={300}>
          <View style={[styles.disclaimer, { borderColor: theme.colors.border }]}>
            <Text style={[styles.disclaimerText, { color: theme.colors.textMuted }]}>
              🌿 Informationen i Diagnosstöd är avsedd som studievägledning och ersätter inte professionell medicinsk bedömning. Kontakta din skola eller elevhälsa för personlig hjälp.
            </Text>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(236,72,153,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryPills: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featuredRow: {
    paddingRight: 20,
    gap: 12,
  },
  featuredCard: {
    width: (width - 64) / 2.2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredCardGradient: {
    padding: 18,
    minHeight: 150,
  },
  featuredEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
    flex: 1,
  },
  featuredArrow: {
    marginTop: 12,
  },
  featuredArrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  cardList: {
    gap: 12,
  },
  diagnosisCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  diagnosisCardGradient: {
    flexDirection: 'row',
  },
  diagnosisAccentBar: {
    width: 4,
    borderRadius: 2,
  },
  diagnosisCardContent: {
    flex: 1,
    padding: 16,
  },
  diagnosisCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  diagnosisEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagnosisEmoji: {
    fontSize: 22,
  },
  diagnosisCardInfo: {
    flex: 1,
  },
  diagnosisName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  diagnosisTagline: {
    fontSize: 13,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },
  disclaimer: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
