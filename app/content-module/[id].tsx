import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { 
  BookOpen, 
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Clock,
  ChevronLeft
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import * as Haptics from 'expo-haptics';

export default function ContentModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { 
    findModuleById, 
    getModuleProgress,
    isLessonCompleted,
    isLoading 
  } = useCourseContent();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const moduleData = id ? findModuleById(id) : undefined;
  const course = moduleData?.course;
  const module = moduleData?.module;
  
  const courseStyle = course ? getCourseStyle(course.title.split(' ')[0]) : getCourseStyle('default');
  const moduleProgress = course && module ? getModuleProgress(course.id, module.id) : undefined;

  useFocusEffect(
    useCallback(() => {
      console.log('Module screen focused');
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  const navigateToLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-lesson/${lessonId}` as never);
  };

  const navigateToCourse = () => {
    if (course) {
      router.push(`/content-course/${course.id}` as never);
    }
  };

  const getNextIncompleteLesson = () => {
    if (!course || !module) return null;
    for (const lesson of module.lessons) {
      if (!isLessonCompleted(course.id, lesson.id)) {
        return lesson;
      }
    }
    return null;
  };

  const handleContinueModule = () => {
    const nextLesson = getNextIncompleteLesson();
    if (nextLesson) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigateToLesson(nextLesson.id);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar modul...
          </Text>
        </View>
      </View>
    );
  }

  if (!course || !module) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <BookOpen size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Modulen hittades inte
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den modul du söker finns inte längre eller har flyttats.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
  const isFirstModule = currentModuleIndex === 0;
  const isLastModule = currentModuleIndex === course.modules.length - 1;
  const prevModule = !isFirstModule ? course.modules[currentModuleIndex - 1] : null;
  const nextModule = !isLastModule ? course.modules[currentModuleIndex + 1] : null;

  const totalDuration = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const isModuleCompleted = moduleProgress?.percentComplete === 100;
  const completedLessons = moduleProgress?.lessonsCompleted || 0;
  const nextIncompleteLesson = getNextIncompleteLesson();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <CourseHeader
          title={module.title}
          subtitle={module.description}
          courseStyle={courseStyle}
          breadcrumb={{
            label: course.title,
            onPress: navigateToCourse
          }}
          badge={`Modul ${currentModuleIndex + 1} av ${course.modules.length}`}
          isCompleted={isModuleCompleted}
          stats={[
            { label: 'lektioner', value: module.lessons.length, icon: 'lessons' },
            { label: 'min', value: totalDuration, icon: 'time' }
          ]}
          progress={moduleProgress && moduleProgress.percentComplete > 0 ? {
            completed: completedLessons,
            total: module.lessons.length,
            percentage: moduleProgress.percentComplete
          } : undefined}
        />

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {!isModuleCompleted && nextIncompleteLesson && (
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: theme.colors.card }]}
              onPress={handleContinueModule}
              activeOpacity={0.7}
            >
              <View style={[styles.continueIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <Play size={22} color={courseStyle.primaryColor} />
              </View>
              <View style={styles.continueInfo}>
                <Text style={[styles.continueLabel, { color: theme.colors.textSecondary }]}>
                  Fortsätt där du slutade
                </Text>
                <Text style={[styles.continueTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {nextIncompleteLesson.title}
                </Text>
              </View>
              <View style={[styles.continueButton, { backgroundColor: courseStyle.primaryColor }]}>
                <Text style={styles.continueButtonText}>Fortsätt</Text>
                <ChevronRight size={16} color="white" />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.lessonsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Lektioner
            </Text>

            {module.lessons.map((lesson, lessonIndex) => {
              const LessonIcon = getLessonTypeIcon(lesson.type);
              const completed = course ? isLessonCompleted(course.id, lesson.id) : false;
              const isCurrentLesson = nextIncompleteLesson?.id === lesson.id;
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    { backgroundColor: theme.colors.card },
                    completed && { borderLeftWidth: 3, borderLeftColor: theme.colors.success },
                    isCurrentLesson && !completed && { borderLeftWidth: 3, borderLeftColor: courseStyle.primaryColor }
                  ]}
                  onPress={() => navigateToLesson(lesson.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.lessonIconContainer,
                    { 
                      backgroundColor: completed 
                        ? theme.colors.success + '15' 
                        : isCurrentLesson
                        ? courseStyle.primaryColor + '15'
                        : theme.colors.borderLight
                    }
                  ]}>
                    {completed ? (
                      <CheckCircle size={20} color={theme.colors.success} />
                    ) : (
                      <LessonIcon size={20} color={isCurrentLesson ? courseStyle.primaryColor : theme.colors.textSecondary} />
                    )}
                  </View>
                  
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={[styles.lessonNumber, { color: theme.colors.textMuted }]}>
                        Lektion {lessonIndex + 1}
                      </Text>
                      {completed && (
                        <View style={[styles.statusTag, { backgroundColor: theme.colors.success + '15' }]}>
                          <Text style={[styles.statusTagText, { color: theme.colors.success }]}>Klar</Text>
                        </View>
                      )}
                      {isCurrentLesson && !completed && (
                        <View style={[styles.statusTag, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                          <Text style={[styles.statusTagText, { color: courseStyle.primaryColor }]}>Nästa</Text>
                        </View>
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.lessonTitle, 
                        { color: theme.colors.text },
                        completed && { color: theme.colors.success }
                      ]}
                      numberOfLines={2}
                    >
                      {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      {lesson.durationMinutes && (
                        <View style={styles.lessonMetaItem}>
                          <Clock size={12} color={theme.colors.textMuted} />
                          <Text style={[styles.lessonMetaText, { color: theme.colors.textMuted }]}>
                            {lesson.durationMinutes} min
                          </Text>
                        </View>
                      )}
                      <View style={[styles.lessonTypeBadge, { backgroundColor: theme.colors.borderLight }]}>
                        <Text style={[styles.lessonTypeText, { color: theme.colors.textMuted }]}>
                          {lesson.type === 'text' ? 'Läsning' : lesson.type === 'video' ? 'Video' : 'Quiz'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <ChevronRight size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.navigationSection}>
            <View style={styles.moduleNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: theme.colors.card },
                  !prevModule && styles.navButtonDisabled
                ]}
                onPress={() => prevModule && router.replace(`/content-module/${prevModule.id}` as never)}
                disabled={!prevModule}
              >
                <ChevronLeft size={18} color={prevModule ? theme.colors.text : theme.colors.textMuted} />
                <Text style={[
                  styles.navButtonText,
                  { color: prevModule ? theme.colors.text : theme.colors.textMuted }
                ]}>
                  Föregående
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: theme.colors.card },
                  !nextModule && styles.navButtonDisabled
                ]}
                onPress={() => nextModule && router.replace(`/content-module/${nextModule.id}` as never)}
                disabled={!nextModule}
              >
                <Text style={[
                  styles.navButtonText,
                  { color: nextModule ? theme.colors.text : theme.colors.textMuted }
                ]}>
                  Nästa
                </Text>
                <ChevronRight size={18} color={nextModule ? theme.colors.text : theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  lessonsSection: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lessonNumber: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 6,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lessonMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  lessonTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lessonTypeText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  navigationSection: {
    marginTop: 28,
  },
  moduleNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
