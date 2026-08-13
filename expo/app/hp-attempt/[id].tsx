import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Layers,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HP_SECTIONS, getScoreLabel } from '@/constants/hogskoleprovet';

interface AttemptDetail {
  id: string;
  attempt_type: 'full_test' | 'section_practice' | 'question_practice';
  section_code: string | null;
  status: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number | null;
  normed_score: number | null;
  estimated_hp_score: number | null;
  time_spent_seconds: number | null;
  time_spent_minutes: number | null;
  completed_at: string | null;
  started_at: string;
  answers?: Array<{
    question_id: string;
    selected_answer: number | string | null;
    is_correct: boolean | null;
  }>;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (seconds: number | null, minutes: number | null): string => {
  const totalMinutes = minutes ?? Math.round((seconds ?? 0) / 60);
  if (totalMinutes < 1) return '<1 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return '#10B981';
  if (percentage >= 60) return '#06B6D4';
  if (percentage >= 40) return '#F59E0B';
  return '#EF4444';
};

const getAttemptTypeLabel = (type: string, sectionCode: string | null): { label: string; icon: typeof Layers } => {
  if (type === 'full_test') return { label: 'Hela provet', icon: Layers };
  if (type === 'section_practice') {
    const section = HP_SECTIONS.find((s) => s.code === sectionCode);
    return { label: section ? section.fullName : 'Delprov', icon: Target };
  }
  return { label: 'Frågeövning', icon: CheckCircle2 };
};

export default function HPAttemptDetailScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttempt = async () => {
      if (!id || !user?.id) {
        router.back();
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hp_user_exam_attempts')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          console.error('[HP Attempt] Error fetching attempt:', error);
          router.back();
          return;
        }

        setAttempt(data as unknown as AttemptDetail);
      } catch (err) {
        console.error('[HP Attempt] Unexpected error:', err);
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempt();
  }, [id, user?.id]);

  if (isLoading || !attempt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar resultat...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const typeInfo = getAttemptTypeLabel(attempt.attempt_type, attempt.section_code);
  const TypeIcon = typeInfo.icon;
  const section = attempt.section_code
    ? HP_SECTIONS.find((s) => s.code === attempt.section_code)
    : null;
  const sectionColor = section?.color ?? '#6366F1';

  const scorePct = attempt.score_percentage
    ?? (attempt.total_questions > 0
      ? (attempt.correct_answers / attempt.total_questions) * 100
      : 0);
  const scoreColor = getScoreColor(scorePct);
  const normedScore = attempt.normed_score ? attempt.normed_score * 50 : null;
  const scoreInfo = attempt.estimated_hp_score ? getScoreLabel(attempt.estimated_hp_score) : null;

  const correctCount = attempt.correct_answers;
  const incorrectCount = attempt.total_questions - attempt.correct_answers;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark
          ? [scoreColor + '40', theme.colors.background]
          : [scoreColor, scoreColor + 'DD']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerNav}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerNavTitle}>Resultat</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>

          <View style={styles.header}>
            <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <TypeIcon size={32} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>{typeInfo.label}</Text>
            {section && (
              <Text style={styles.headerSubtitle}>{section.fullName}</Text>
            )}
            <Text style={styles.headerDate}>
              {formatDate(attempt.completed_at || attempt.started_at)}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
            Ditt resultat
          </Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {scorePct.toFixed(0)}%
          </Text>
          <Text style={[styles.scoreSubtext, { color: theme.colors.textSecondary }]}>
            {correctCount} av {attempt.total_questions} rätt
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[styles.progressFill, { width: `${Math.min(100, scorePct)}%`, backgroundColor: scoreColor }]}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
              <CheckCircle2 size={22} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {correctCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Rätt
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#EF4444' + '20' }]}>
              <Target size={22} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {incorrectCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Fel
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#6366F1' + '20' }]}>
              <Clock size={22} color="#6366F1" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatDuration(attempt.time_spent_seconds, attempt.time_spent_minutes)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Tid
            </Text>
          </View>
        </View>

        {/* HP Score Card */}
        {attempt.estimated_hp_score !== null && (
          <View style={[styles.hpScoreCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.hpScoreHeader}>
              <Trophy size={20} color="#FFD700" />
              <Text style={[styles.hpScoreLabel, { color: theme.colors.textSecondary }]}>
                Uppskattat HP-resultat
              </Text>
            </View>
            <Text style={[styles.hpScoreValue, { color: '#FFD700' }]}>
              {attempt.estimated_hp_score.toFixed(2)}
            </Text>
            {scoreInfo && (
              <Text style={[styles.hpScoreInfo, { color: theme.colors.textSecondary }]}>
                {scoreInfo.label}
              </Text>
            )}
          </View>
        )}

        {/* Normed Score */}
        {normedScore !== null && (
          <View style={[styles.normedCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.normedHeader}>
              <TrendingUp size={18} color={sectionColor} />
              <Text style={[styles.normedLabel, { color: theme.colors.textSecondary }]}>
                Normerat resultat
              </Text>
            </View>
            <Text style={[styles.normedValue, { color: sectionColor }]}>
              {normedScore.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Section info */}
        {section && (
          <View style={[styles.sectionInfoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionInfoHeader}>
              <View style={[styles.sectionInfoIcon, { backgroundColor: sectionColor + '20' }]}>
                <Layers size={18} color={sectionColor} />
              </View>
              <View style={styles.sectionInfoText}>
                <Text style={[styles.sectionInfoTitle, { color: theme.colors.text }]}>
                  {section.fullName}
                </Text>
                <Text style={[styles.sectionInfoSub, { color: theme.colors.textSecondary }]}>
                  {section.description}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {section && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: sectionColor }]}
              onPress={() => router.replace(`/hp-practice/${section.code}` as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Öva igen</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtnSecondary, { borderColor: theme.colors.border }]}
            onPress={() => router.replace('/hp-stats' as any)}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionBtnSecondaryText, { color: theme.colors.text }]}>
              Se all statistik
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  headerGradient: {
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnPlaceholder: {
    width: 40,
  },
  headerNavTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scoreCard: {
    padding: 28,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 15,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  hpScoreCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  hpScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hpScoreLabel: {
    fontSize: 14,
  },
  hpScoreValue: {
    fontSize: 40,
    fontWeight: '800' as const,
  },
  hpScoreInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  normedCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  normedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  normedLabel: {
    fontSize: 14,
  },
  normedValue: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  sectionInfoCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  sectionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sectionInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionInfoText: {
    flex: 1,
  },
  sectionInfoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  sectionInfoSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
