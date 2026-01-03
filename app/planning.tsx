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
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit3,
  CheckCircle,
  Target,
  History
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams, Exam } from '@/contexts/ExamContext';
import { FadeInView, SlideInView } from '@/components/Animations';
import AddExamModal from '@/components/AddExamModal';
import * as Haptics from 'expo-haptics';



const IMPORTANCE_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const EXAM_TYPE_ICONS: Record<string, string> = {
  written: '📝',
  oral: '🗣️',
  practical: '🔧',
  online: '💻',
  other: '📋',
};

export default function PlanningScreen() {
  const { theme, isDark } = useTheme();
  const { upcomingExams, refreshExams, deleteExam, updateExam } = useExams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setSelectedExam] = useState<Exam | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshExams();
    setRefreshing(false);
  }, [refreshExams]);

  const handleDeleteExam = useCallback(async (examId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteExam(examId);
    setShowOptions(null);
  }, [deleteExam]);

  const handleCompleteExam = useCallback(async (examId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateExam(examId, { status: 'completed' });
    setShowOptions(null);
  }, [updateExam]);

  const groupedExams = useMemo(() => {
    const thisWeek: Exam[] = [];
    const thisMonth: Exam[] = [];
    const later: Exam[] = [];
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    upcomingExams.forEach(exam => {
      if (exam.examDate <= weekFromNow) {
        thisWeek.push(exam);
      } else if (exam.examDate <= monthFromNow) {
        thisMonth.push(exam);
      } else {
        later.push(exam);
      }
    });

    return { thisWeek, thisMonth, later };
  }, [upcomingExams]);

  const getImportanceFromDays = (daysUntil: number): 'high' | 'medium' | 'low' => {
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  };

  const formatCountdown = (examDate: Date): string => {
    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days === 0) {
      if (hours === 0) return 'Nu';
      return `${hours}h`;
    }
    if (days === 1) return 'Imorgon';
    return `${days} dagar`;
  };

  const renderExamCard = (exam: Exam, index: number) => {
    const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const importance = getImportanceFromDays(daysUntil);
    const isUrgent = daysUntil <= 3;

    return (
      <FadeInView key={exam.id} delay={100 + index * 50}>
        <TouchableOpacity
          style={[
            styles.examCard,
            { 
              backgroundColor: theme.colors.card,
              borderLeftColor: IMPORTANCE_COLORS[importance],
            }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedExam(exam);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.examCardInner}>
            <View style={[
              styles.examDateBadge,
              { backgroundColor: IMPORTANCE_COLORS[importance] + '15' }
            ]}>
              <Text style={[styles.examDateDay, { color: IMPORTANCE_COLORS[importance] }]}>
                {exam.examDate.getDate()}
              </Text>
              <Text style={[styles.examDateMonth, { color: IMPORTANCE_COLORS[importance] }]}>
                {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
              </Text>
            </View>

            <View style={styles.examContent}>
              <View style={styles.examHeader}>
                <Text style={styles.examTypeIcon}>
                  {EXAM_TYPE_ICONS[exam.examType] || '📋'}
                </Text>
                <View style={styles.examTitleContainer}>
                  <Text style={[styles.examTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {exam.title}
                  </Text>
                  {exam.courseId && (
                    <Text style={[styles.examCourse, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      Kurs: {exam.courseId}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.examMeta}>
                <View style={styles.examMetaRow}>
                  <Clock size={14} color={theme.colors.textMuted} />
                  <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                    {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {exam.durationMinutes && (
                    <>
                      <Text style={[styles.examMetaDot, { color: theme.colors.textMuted }]}>•</Text>
                      <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                        {exam.durationMinutes} min
                      </Text>
                    </>
                  )}
                </View>
                {exam.location && (
                  <View style={styles.examMetaRow}>
                    <MapPin size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                      {exam.location}
                    </Text>
                  </View>
                )}
              </View>

              {isUrgent && (
                <View style={[styles.urgentBadge, { backgroundColor: IMPORTANCE_COLORS.high + '15' }]}>
                  <AlertCircle size={12} color={IMPORTANCE_COLORS.high} />
                  <Text style={[styles.urgentText, { color: IMPORTANCE_COLORS.high }]}>
                    {formatCountdown(exam.examDate)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowOptions(showOptions === exam.id ? null : exam.id);
              }}
            >
              <MoreVertical size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {showOptions === exam.id && (
            <View style={[styles.optionsMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleCompleteExam(exam.id)}
              >
                <CheckCircle size={18} color={theme.colors.success} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>Markera som klar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setShowOptions(null);
                  setSelectedExam(exam);
                }}
              >
                <Edit3 size={18} color={theme.colors.primary} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>Redigera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleDeleteExam(exam.id)}
              >
                <Trash2 size={18} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>Ta bort</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </FadeInView>
    );
  };

  const renderExamSection = (title: string, exams: Exam[], startIndex: number) => {
    if (exams.length === 0) return null;

    return (
      <View style={styles.examSection}>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        {exams.map((exam, index) => renderExamCard(exam, startIndex + index))}
      </View>
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
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Planering</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Kommande och schemalagda prov
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/history' as any)}
          >
            <History size={20} color={theme.colors.primary} />
          </TouchableOpacity>
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
            <LinearGradient
              colors={theme.colors.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Calendar size={20} color="white" />
                  </View>
                  <Text style={styles.statNumber}>{upcomingExams.length}</Text>
                  <Text style={styles.statLabel}>Kommande prov</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <AlertCircle size={20} color="white" />
                  </View>
                  <Text style={styles.statNumber}>{groupedExams.thisWeek.length}</Text>
                  <Text style={styles.statLabel}>Denna vecka</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Target size={20} color="white" />
                  </View>
                  <Text style={styles.statNumber}>{groupedExams.thisMonth.length}</Text>
                  <Text style={styles.statLabel}>Denna månad</Text>
                </View>
              </View>
            </LinearGradient>
          </SlideInView>

          {upcomingExams.length === 0 ? (
            <SlideInView direction="up" delay={200}>
              <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Calendar size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Inga planerade prov
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Lägg till dina prov för att hålla koll på viktiga datum och få påminnelser.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.emptyButtonText}>Lägg till prov</Text>
                </TouchableOpacity>
              </View>
            </SlideInView>
          ) : (
            <>
              {renderExamSection('Denna vecka', groupedExams.thisWeek, 0)}
              {renderExamSection('Denna månad', groupedExams.thisMonth, groupedExams.thisWeek.length)}
              {renderExamSection('Senare', groupedExams.later, groupedExams.thisWeek.length + groupedExams.thisMonth.length)}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <AddExamModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  statsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  examSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  examCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  examCardInner: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  examDateBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  examDateDay: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  examDateMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  examContent: {
    flex: 1,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  examTypeIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  examTitleContainer: {
    flex: 1,
  },
  examTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  examCourse: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  examMeta: {
    gap: 6,
  },
  examMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examMetaText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  examMetaDot: {
    fontSize: 13,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  optionsButton: {
    padding: 8,
    marginLeft: 8,
  },
  optionsMenu: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500' as const,
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
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
