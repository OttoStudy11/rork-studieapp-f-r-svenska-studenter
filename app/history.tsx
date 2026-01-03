import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Clock, 
  MapPin, 
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  BarChart3,
  Star,
  ArrowLeft,
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams, Exam } from '@/contexts/ExamContext';
import { FadeInView, SlideInView } from '@/components/Animations';
import * as Haptics from 'expo-haptics';

const EXAM_TYPE_ICONS: Record<string, string> = {
  written: '📝',
  oral: '🗣️',
  practical: '🔧',
  online: '💻',
  other: '📋',
};

const GRADE_COLORS: Record<string, string> = {
  'A': '#10B981',
  'B': '#34D399',
  'C': '#F59E0B',
  'D': '#FB923C',
  'E': '#EF4444',
  'F': '#DC2626',
  'G': '#10B981',
  'VG': '#059669',
  'MVG': '#047857',
};

export default function HistoryScreen() {
  const { theme, isDark } = useTheme();
  const { completedExams, refreshExams } = useExams();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshExams();
    setRefreshing(false);
  }, [refreshExams]);

  const groupedByYear = useMemo(() => {
    const groups: Record<number, Exam[]> = {};
    completedExams.forEach(exam => {
      const year = exam.examDate.getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(exam);
    });
    return groups;
  }, [completedExams]);

  const years = useMemo(() => {
    return Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);
  }, [groupedByYear]);

  const displayedExams = useMemo(() => {
    if (selectedYear) {
      return groupedByYear[selectedYear] || [];
    }
    return completedExams;
  }, [selectedYear, groupedByYear, completedExams]);

  const statistics = useMemo(() => {
    if (completedExams.length === 0) {
      return { avgGrade: '-', totalExams: 0, bestGrade: '-', passRate: 0 };
    }

    const gradesWithValue = completedExams.filter(e => e.grade);
    const passed = completedExams.filter(e => 
      e.grade && !['F', 'IG'].includes(e.grade.toUpperCase())
    );

    return {
      avgGrade: gradesWithValue.length > 0 ? gradesWithValue[0]?.grade || '-' : '-',
      totalExams: completedExams.length,
      bestGrade: gradesWithValue.length > 0 ? 'A' : '-',
      passRate: completedExams.length > 0 ? Math.round((passed.length / completedExams.length) * 100) : 0,
    };
  }, [completedExams]);

  const getGradeColor = (grade?: string): string => {
    if (!grade) return theme.colors.textMuted;
    const upperGrade = grade.toUpperCase();
    return GRADE_COLORS[upperGrade] || theme.colors.primary;
  };

  const renderExamCard = (exam: Exam, index: number) => {
    const isExpanded = expandedExam === exam.id;
    const gradeColor = getGradeColor(exam.grade);

    return (
      <FadeInView key={exam.id} delay={100 + index * 50}>
        <TouchableOpacity
          style={[styles.examCard, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedExam(isExpanded ? null : exam.id);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.examCardHeader}>
            <View style={styles.examHeaderLeft}>
              <Text style={[styles.examDate, { color: theme.colors.textSecondary }]}>
                {exam.examDate.toLocaleDateString('sv-SE', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
              <View style={styles.examTitleRow}>
                <Text style={styles.examTypeIcon}>
                  {EXAM_TYPE_ICONS[exam.examType] || '📋'}
                </Text>
                <Text style={[styles.examTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {exam.title}
                </Text>
              </View>
            </View>
            
            <View style={styles.examHeaderRight}>
              {exam.grade && (
                <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
                  <Text style={[styles.gradeText, { color: gradeColor }]}>
                    {exam.grade}
                  </Text>
                </View>
              )}
              {isExpanded ? (
                <ChevronUp size={20} color={theme.colors.textMuted} />
              ) : (
                <ChevronDown size={20} color={theme.colors.textMuted} />
              )}
            </View>
          </View>

          {isExpanded && (
            <View style={[styles.expandedContent, { borderTopColor: theme.colors.border }]}>
              <View style={styles.examDetails}>
                <View style={styles.detailRow}>
                  <Clock size={16} color={theme.colors.textMuted} />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    {exam.durationMinutes && ` • ${exam.durationMinutes} min`}
                  </Text>
                </View>
                {exam.location && (
                  <View style={styles.detailRow}>
                    <MapPin size={16} color={theme.colors.textMuted} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                      {exam.location}
                    </Text>
                  </View>
                )}
              </View>

              {exam.notes && (
                <View style={[styles.notesSection, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.notesLabel, { color: theme.colors.textSecondary }]}>
                    Anteckningar
                  </Text>
                  <Text style={[styles.notesText, { color: theme.colors.text }]}>
                    {exam.notes}
                  </Text>
                </View>
              )}

              {exam.description && (
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                    {exam.description}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </FadeInView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Historik</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Dina tidigare prov
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <SlideInView direction="up" delay={100}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <BarChart3 size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {statistics.totalExams}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Totalt
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                  <TrendingUp size={20} color={theme.colors.success} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {statistics.passRate}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Godkänt
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning + '15' }]}>
                  <Star size={20} color={theme.colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {statistics.bestGrade}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Bäst
                </Text>
              </View>
            </View>
          </SlideInView>

          {years.length > 1 && (
            <SlideInView direction="up" delay={150}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.yearFilter}
                contentContainerStyle={styles.yearFilterContent}
              >
                <TouchableOpacity
                  style={[
                    styles.yearChip,
                    { 
                      backgroundColor: !selectedYear ? theme.colors.primary : theme.colors.card,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedYear(null);
                  }}
                >
                  <Text style={[
                    styles.yearChipText,
                    { color: !selectedYear ? 'white' : theme.colors.text }
                  ]}>
                    Alla
                  </Text>
                </TouchableOpacity>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearChip,
                      { 
                        backgroundColor: selectedYear === year ? theme.colors.primary : theme.colors.card,
                        borderColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedYear(year);
                    }}
                  >
                    <Text style={[
                      styles.yearChipText,
                      { color: selectedYear === year ? 'white' : theme.colors.text }
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SlideInView>
          )}

          {displayedExams.length === 0 ? (
            <SlideInView direction="up" delay={200}>
              <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Award size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Ingen historik ännu
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Genomförda prov visas här med betyg och anteckningar.
                </Text>
              </View>
            </SlideInView>
          ) : (
            <View style={styles.examsList}>
              {displayedExams.map((exam, index) => renderExamCard(exam, index))}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  yearFilter: {
    marginBottom: 20,
  },
  yearFilterContent: {
    gap: 10,
  },
  yearChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  examsList: {
    gap: 12,
  },
  examCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  examHeaderLeft: {
    flex: 1,
  },
  examDate: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examTypeIcon: {
    fontSize: 18,
  },
  examTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    flex: 1,
  },
  examHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  examDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  notesSection: {
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionSection: {
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});
