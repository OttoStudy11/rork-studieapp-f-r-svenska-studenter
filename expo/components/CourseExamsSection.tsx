import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertCircle,
  MoreVertical,
  Trash2,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams, Exam } from '@/contexts/ExamContext';
import AddExamModal from '@/components/AddExamModal';
import CompleteExamModal from '@/components/CompleteExamModal';
import * as Haptics from 'expo-haptics';

interface CourseExamsSectionProps {
  courseId: string;
  courseTitle: string;
  accentColor: string;
}

const EXAM_TYPE_ICONS: Record<string, string> = {
  written: '📝',
  oral: '🗣️',
  practical: '🔧',
  online: '💻',
  other: '📋',
};

export default function CourseExamsSection({
  courseId,
  courseTitle,
  accentColor,
}: CourseExamsSectionProps) {
  const { theme } = useTheme();
  const { getExamsForCourse, getUpcomingExamsForCourse, deleteExam, refreshExams } = useExams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  const allExams = useMemo(() => getExamsForCourse(courseId), [getExamsForCourse, courseId]);
  const upcomingExams = useMemo(() => getUpcomingExamsForCourse(courseId), [getUpcomingExamsForCourse, courseId]);
  const completedExams = useMemo(
    () => allExams.filter((e) => e.status === 'completed' || e.status === 'missed'),
    [allExams]
  );

  const handleDelete = useCallback(
    async (examId: string) => {
      Alert.alert('Ta bort prov', 'Är du säker på att du vill ta bort detta prov?', [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await deleteExam(examId);
              setExpandedExamId(null);
            } catch (error) {
              console.error('Error deleting exam:', error);
            }
          },
        },
      ]);
    },
    [deleteExam]
  );

  const handleComplete = useCallback((exam: Exam) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExam(exam);
    setShowCompleteModal(true);
    setExpandedExamId(null);
  }, []);

  const getDaysUntil = (date: Date): number => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil <= 3) return '#EF4444';
    if (daysUntil <= 7) return '#F59E0B';
    return '#10B981';
  };

  const formatCountdown = (daysUntil: number): string => {
    if (daysUntil <= 0) return 'Idag';
    if (daysUntil === 1) return 'Imorgon';
    return `${daysUntil} dagar kvar`;
  };

  const renderExamCard = (exam: Exam, isCompleted = false) => {
    const daysUntil = getDaysUntil(exam.examDate);
    const urgencyColor = isCompleted ? theme.colors.textMuted : getUrgencyColor(daysUntil);
    const isExpanded = expandedExamId === exam.id;

    return (
      <View key={exam.id} style={styles.examCardWrapper}>
        <TouchableOpacity
          style={[
            styles.examCard,
            {
              backgroundColor: theme.colors.card,
              borderLeftColor: isCompleted ? theme.colors.success : urgencyColor,
            },
          ]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedExamId(isExpanded ? null : exam.id);
          }}
          activeOpacity={0.75}
          testID={`course-exam-card-${exam.id}`}
        >
          <View style={styles.examCardTop}>
            <View style={styles.examCardLeft}>
              <View
                style={[
                  styles.examDateBadge,
                  {
                    backgroundColor: isCompleted
                      ? theme.colors.success + '12'
                      : urgencyColor + '12',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.examDateDay,
                    { color: isCompleted ? theme.colors.success : urgencyColor },
                  ]}
                >
                  {exam.examDate.getDate()}
                </Text>
                <Text
                  style={[
                    styles.examDateMonth,
                    { color: isCompleted ? theme.colors.success : urgencyColor },
                  ]}
                >
                  {exam.examDate
                    .toLocaleDateString('sv-SE', { month: 'short' })
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.examInfo}>
                <View style={styles.examTitleRow}>
                  <Text style={styles.examTypeEmoji}>
                    {EXAM_TYPE_ICONS[exam.examType] || '📋'}
                  </Text>
                  <Text
                    style={[styles.examTitle, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {exam.title}
                  </Text>
                </View>

                <View style={styles.examMetaRow}>
                  <Clock size={12} color={theme.colors.textMuted} />
                  <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                    {exam.examDate.toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {exam.durationMinutes && (
                    <>
                      <Text style={[styles.examMetaDot, { color: theme.colors.textMuted }]}>
                        ·
                      </Text>
                      <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                        {exam.durationMinutes} min
                      </Text>
                    </>
                  )}
                  {exam.location && (
                    <>
                      <Text style={[styles.examMetaDot, { color: theme.colors.textMuted }]}>
                        ·
                      </Text>
                      <MapPin size={12} color={theme.colors.textMuted} />
                      <Text
                        style={[styles.examMetaText, { color: theme.colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {exam.location}
                      </Text>
                    </>
                  )}
                </View>

                {!isCompleted && daysUntil <= 7 && (
                  <View
                    style={[styles.urgencyChip, { backgroundColor: urgencyColor + '15' }]}
                  >
                    <AlertCircle size={11} color={urgencyColor} />
                    <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                      {formatCountdown(daysUntil)}
                    </Text>
                  </View>
                )}

                {isCompleted && exam.grade && (
                  <View
                    style={[
                      styles.gradeChip,
                      { backgroundColor: theme.colors.success + '15' },
                    ]}
                  >
                    <CheckCircle size={11} color={theme.colors.success} />
                    <Text style={[styles.gradeChipText, { color: theme.colors.success }]}>
                      Betyg: {exam.grade}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedExamId(isExpanded ? null : exam.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View style={[styles.expandedActions, { borderTopColor: theme.colors.border }]}>
              {!isCompleted && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success + '12' }]}
                  onPress={() => handleComplete(exam)}
                >
                  <CheckCircle size={16} color={theme.colors.success} />
                  <Text style={[styles.actionBtnText, { color: theme.colors.success }]}>
                    Markera klar
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.colors.error + '12' }]}
                onPress={() => handleDelete(exam.id)}
              >
                <Trash2 size={16} color={theme.colors.error} />
                <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>
                  Ta bort
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconBg, { backgroundColor: accentColor + '15' }]}>
            <Calendar size={20} color={accentColor} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Prov & Tentor
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              {upcomingExams.length === 0
                ? 'Inga kommande prov'
                : `${upcomingExams.length} kommande prov`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: accentColor }]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
          testID="add-course-exam-btn"
        >
          <Plus size={18} color="white" />
          <Text style={styles.addBtnText}>Lägg till</Text>
        </TouchableOpacity>
      </View>

      {allExams.length === 0 ? (
        <TouchableOpacity
          style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.emptyIconBg, { backgroundColor: accentColor + '12' }]}>
            <Calendar size={32} color={accentColor} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Schemalägg ditt första prov
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Håll koll på provdatum och få påminnelser i tid
          </Text>
          <View style={[styles.emptyAction, { backgroundColor: accentColor + '12' }]}>
            <Plus size={16} color={accentColor} />
            <Text style={[styles.emptyActionText, { color: accentColor }]}>
              Lägg till prov
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.examsList}>
          {upcomingExams.length > 0 && (
            <View style={styles.examGroup}>
              <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>
                KOMMANDE
              </Text>
              {upcomingExams.map((exam) => renderExamCard(exam))}
            </View>
          )}

          {completedExams.length > 0 && (
            <View style={styles.examGroup}>
              <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>
                GENOMFÖRDA
              </Text>
              {completedExams.slice(0, 3).map((exam) => renderExamCard(exam, true))}
              {completedExams.length > 3 && (
                <TouchableOpacity
                  style={[styles.seeAllBtn, { backgroundColor: theme.colors.surface }]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/planning' as any);
                  }}
                >
                  <Text style={[styles.seeAllText, { color: accentColor }]}>
                    Se alla {completedExams.length} genomförda
                  </Text>
                  <ChevronRight size={16} color={accentColor} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.viewAllBtn, { borderColor: theme.colors.border }]}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/planning' as any);
        }}
        activeOpacity={0.7}
      >
        <Calendar size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
          Öppna fullständig planering
        </Text>
        <ChevronRight size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <AddExamModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          void refreshExams();
        }}
        courseId={courseId}
        courseTitle={courseTitle}
      />

      {selectedExam && (
        <CompleteExamModal
          visible={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  examsList: {
    gap: 16,
  },
  examGroup: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
    marginLeft: 4,
  },
  examCardWrapper: {
    marginBottom: 4,
  },
  examCard: {
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  examCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  examCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  examDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examDateDay: {
    fontSize: 20,
    fontWeight: '800' as const,
    lineHeight: 24,
  },
  examDateMonth: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  examInfo: {
    flex: 1,
    gap: 4,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examTypeEmoji: {
    fontSize: 15,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  examMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  examMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  examMetaDot: {
    fontSize: 12,
  },
  urgencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 2,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  gradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 2,
  },
  gradeChipText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  moreButton: {
    padding: 6,
    marginLeft: 4,
  },
  expandedActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
