import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  FileText,
  Target,
  Award,
  Lock,
  AlertCircle,
  RefreshCw,
  Crown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ModuleWithLessons {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  estimated_hours: number;
  lessons: (CourseLesson & { progress?: UserLessonProgress })[];
}

interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  lesson_type: string;
  difficulty_level: string;
  estimated_minutes: number;
  order_index: number;
  is_published: boolean;
}

interface UserLessonProgress {
  id?: string;
  status?: string;
  user_id?: string;
  lesson_id?: string;
}

interface Props {
  modules: ModuleWithLessons[];
  userProgress: { completed: number; total: number; percentage: number };
  showContent: boolean;
  setShowContent: (v: boolean) => void;
  courseStyle: { primaryColor: string; lightColor: string };
  accentColor: string;
  theme: {
    colors: {
      text: string;
      textSecondary: string;
      textMuted: string;
      card: string;
      surface: string;
      border: string;
      borderLight: string;
      primary: string;
      warning: string;
      error: string;
      success: string;
    };
  };
  freemium: {
    checkCourseModule: (index: number) => { isAllowed: boolean };
  };
  onNavigateLesson: (lesson: CourseLesson) => void;
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case 'video': return Play;
    case 'reading': return BookOpen;
    case 'exercise': return Target;
    case 'quiz': return Award;
    case 'theory': return BookOpen;
    case 'practical': return Target;
    default: return FileText;
  }
}

function getDifficultyColor(level: string, colors: { success: string; warning: string; error: string; textMuted: string }) {
  switch (level) {
    case 'easy': return colors.success;
    case 'medium': return colors.warning;
    case 'hard': return colors.error;
    default: return colors.textMuted;
  }
}

export default function CourseModulesSection({
  modules,
  userProgress,
  showContent,
  setShowContent,
  courseStyle,
  accentColor,
  theme,
  freemium,
  onNavigateLesson,
}: Props) {
  const buttonPress = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  return (
    <View style={styles.contentSection}>
      <TouchableOpacity
        style={[styles.contentToggle, { backgroundColor: theme.colors.card }]}
        onPress={() => buttonPress(() => setShowContent(!showContent))}
        activeOpacity={0.7}
      >
        <View style={styles.contentToggleLeft}>
          <BookOpen size={20} color={theme.colors.textMuted} />
          <Text style={[styles.contentToggleTitle, { color: theme.colors.text }]}>
            Kursinnehåll & Lektioner
          </Text>
        </View>
        <View style={styles.contentToggleRight}>
          <Text style={[styles.contentToggleCount, { color: theme.colors.textSecondary }]}>
            {modules.length} moduler · {userProgress.total} lektioner
          </Text>
          {showContent ? (
            <ChevronUp size={20} color={theme.colors.textMuted} />
          ) : (
            <ChevronDown size={20} color={theme.colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {showContent && (
        <Animated.View style={styles.contentCollapse}>
          {modules.map((module, moduleIndex) => {
            const moduleLimit = freemium.checkCourseModule(moduleIndex);
            const isModuleLocked = !moduleLimit.isAllowed;

            return (
              <View
                key={module.id}
                style={[
                  styles.moduleCard,
                  { backgroundColor: theme.colors.card },
                  isModuleLocked && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.moduleHeader, { borderBottomColor: theme.colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.moduleTitle, { color: theme.colors.text, flex: 1 }]}>
                      {moduleIndex + 1}. {module.title}
                    </Text>
                    {isModuleLocked && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#FFD700' + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          gap: 4,
                        }}
                      >
                        <Crown size={12} color="#FFD700" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700' as const,
                            color: '#FFD700',
                          }}
                        >
                          Premium
                        </Text>
                      </View>
                    )}
                  </View>
                  {module.description && (
                    <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                      {module.description}
                    </Text>
                  )}
                  <Text style={[styles.moduleHours, { color: theme.colors.textMuted }]}>
                    {module.estimated_hours}h uppskattad tid
                  </Text>
                </View>

                {!isModuleLocked && (
                  <View style={styles.lessonsContainer}>
                    {module.lessons.map((lesson, lessonIndex) => {
                      const LessonIcon = getLessonTypeIcon(lesson.lesson_type);
                      const isCompleted = lesson.progress?.status === 'completed';
                      const isInProgress = lesson.progress?.status === 'in_progress';
                      const isLocked =
                        lessonIndex > 0 &&
                        !module.lessons[lessonIndex - 1].progress?.status;

                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          style={[
                            styles.lessonCard,
                            { backgroundColor: theme.colors.surface },
                            isCompleted && {
                              backgroundColor: courseStyle.lightColor,
                              borderColor: courseStyle.primaryColor,
                              borderLeftWidth: 4,
                            },
                            isInProgress && {
                              backgroundColor: theme.colors.warning + '15',
                              borderColor: theme.colors.warning,
                              borderLeftWidth: 4,
                            },
                            isLocked && {
                              backgroundColor: theme.colors.borderLight,
                              opacity: 0.6,
                            },
                          ]}
                          onPress={() => !isLocked && onNavigateLesson(lesson)}
                          activeOpacity={isLocked ? 1 : 0.7}
                        >
                          <View style={styles.lessonLeft}>
                            <View style={styles.lessonIconContainer}>
                              {isLocked ? (
                                <Lock size={20} color={theme.colors.textMuted} />
                              ) : isCompleted ? (
                                <CheckCircle size={20} color={accentColor} />
                              ) : isInProgress ? (
                                <Circle size={20} color={theme.colors.warning} />
                              ) : (
                                <LessonIcon size={20} color={theme.colors.textSecondary} />
                              )}
                            </View>
                            <View style={styles.lessonInfo}>
                              <View style={styles.lessonTitleRow}>
                                <Text
                                  style={[
                                    styles.lessonTitle,
                                    { color: theme.colors.text },
                                    isCompleted && { color: accentColor },
                                    isLocked && { color: theme.colors.textMuted },
                                  ]}
                                >
                                  {lessonIndex + 1}. {lesson.title}
                                </Text>
                                {isLocked && (
                                  <View
                                    style={[
                                      styles.lockedBadge,
                                      { backgroundColor: theme.colors.borderLight },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.lockedBadgeText,
                                        { color: theme.colors.textMuted },
                                      ]}
                                    >
                                      Låst
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.lessonDescription,
                                  { color: theme.colors.textSecondary },
                                ]}
                              >
                                {lesson.description}
                              </Text>
                              <View style={styles.lessonMetadata}>
                                <Text
                                  style={[
                                    styles.lessonDuration,
                                    { color: theme.colors.textMuted },
                                  ]}
                                >
                                  {lesson.estimated_minutes} min
                                </Text>
                                <View
                                  style={[
                                    styles.difficultyBadge,
                                    {
                                      backgroundColor: getDifficultyColor(
                                        lesson.difficulty_level,
                                        theme.colors
                                      ),
                                    },
                                  ]}
                                >
                                  <Text style={styles.difficultyText}>
                                    {lesson.difficulty_level === 'easy'
                                      ? 'Lätt'
                                      : lesson.difficulty_level === 'medium'
                                        ? 'Medel'
                                        : 'Svår'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          <ChevronRight size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {isModuleLocked && (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => router.push('/premium' as any)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#FFD700' + '15',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 10,
                      }}
                      activeOpacity={0.7}
                    >
                      <Lock size={14} color="#FFD700" />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600' as const,
                          color: '#FFD700',
                        }}
                      >
                        Lås upp med Premium
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  contentToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  contentToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentToggleTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  contentToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentToggleCount: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  contentCollapse: {
    gap: 16,
  },
  moduleCard: {
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  moduleHeader: {
    padding: 24,
    borderBottomWidth: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  moduleDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  moduleHours: {
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
  lessonsContainer: {
    padding: 20,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lessonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIconContainer: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  lockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  lessonDescription: {
    fontSize: 12,
    marginBottom: 6,
  },
  lessonMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
});
