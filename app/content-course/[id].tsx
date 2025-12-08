import React, { useEffect, useRef, useCallback } from 'react';
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
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Lock,
  Clock,
  Sparkles,
  BookOpen,
  Zap
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import * as Haptics from 'expo-haptics';

export default function ContentCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { 
    getCourseById, 
    getCourseProgress, 
    getModuleProgress,
    isLessonCompleted,
    updateLastAccessed,
    isLoading 
  } = useCourseContent();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const course = id ? getCourseById(id) : undefined;
  const progress = id ? getCourseProgress(id) : undefined;
  const courseStyle = course ? getCourseStyle(course.title.split(' ')[0]) : getCourseStyle('default');

  useFocusEffect(
    useCallback(() => {
      if (id) {
        console.log('Course screen focused, updating last accessed');
        updateLastAccessed(id);
      }
    }, [id, updateLastAccessed])
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
    if (id) {
      await updateLastAccessed(id);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  }, [id, updateLastAccessed]);

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

  const navigateToModule = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-module/${moduleId}` as never);
  };

  const handleStartCourse = () => {
    if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigateToLesson(course.modules[0].lessons[0].id);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar kurs...
          </Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <BookOpen size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Kursen hittades inte
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den kurs du söker finns inte längre eller har flyttats.
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

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + (l.durationMinutes || 0), 0), 
    0
  );
  const estimatedHours = Math.ceil(totalDuration / 60);
  const isCompleted = progress?.percentComplete === 100;

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
          title={course.title}
          subtitle={course.description}
          courseStyle={courseStyle}
          badge="Studiekurs"
          isCompleted={isCompleted}
          stats={[
            { label: 'moduler', value: course.modules.length, icon: 'modules' },
            { label: 'lektioner', value: totalLessons, icon: 'lessons' },
            { label: estimatedHours > 0 ? 'timmar' : 'min', value: estimatedHours > 0 ? estimatedHours : totalDuration, icon: 'time' }
          ]}
          progress={progress ? {
            completed: progress.lessonsCompleted,
            total: progress.totalLessons || totalLessons,
            percentage: progress.percentComplete
          } : undefined}
        />

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {progress && progress.percentComplete === 0 && (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: courseStyle.primaryColor }]}
              onPress={handleStartCourse}
              activeOpacity={0.8}
            >
              <Sparkles size={22} color="white" />
              <Text style={styles.startButtonText}>Börja kursen</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.flashcardButton, { backgroundColor: theme.colors.card, borderColor: courseStyle.primaryColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/flashcards-v2/${id}` as never);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.flashcardIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
              <Zap size={20} color={courseStyle.primaryColor} />
            </View>
            <View style={styles.flashcardContent}>
              <Text style={[styles.flashcardTitle, { color: theme.colors.text }]}>AI Flashcards</Text>
              <Text style={[styles.flashcardSubtitle, { color: theme.colors.textSecondary }]}>Generera och öva med intelligenta flashcards</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.modulesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Kursinnehåll
            </Text>

            {course.modules.map((module, moduleIndex) => {
              const moduleProgress = id ? getModuleProgress(id, module.id) : undefined;
              const isModuleCompleted = moduleProgress?.percentComplete === 100;
              const isModuleLocked = course.premiumRequired && moduleIndex > 0;
              const moduleDuration = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

              return (
                <TouchableOpacity
                  key={module.id}
                  style={[
                    styles.moduleCard,
                    { backgroundColor: theme.colors.card },
                    isModuleCompleted && { borderLeftWidth: 3, borderLeftColor: theme.colors.success }
                  ]}
                  onPress={() => !isModuleLocked && navigateToModule(module.id)}
                  disabled={isModuleLocked}
                  activeOpacity={0.7}
                >
                  <View style={styles.moduleHeader}>
                    <View style={[
                      styles.moduleNumber,
                      { backgroundColor: isModuleCompleted ? theme.colors.success + '15' : courseStyle.primaryColor + '15' }
                    ]}>
                      {isModuleCompleted ? (
                        <CheckCircle size={18} color={theme.colors.success} />
                      ) : isModuleLocked ? (
                        <Lock size={16} color={theme.colors.textMuted} />
                      ) : (
                        <Text style={[styles.moduleNumberText, { color: courseStyle.primaryColor }]}>
                          {moduleIndex + 1}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.moduleInfo}>
                      <Text 
                        style={[
                          styles.moduleTitle, 
                          { color: isModuleLocked ? theme.colors.textMuted : theme.colors.text }
                        ]}
                        numberOfLines={2}
                      >
                        {module.title}
                      </Text>
                      <View style={styles.moduleMeta}>
                        <View style={styles.moduleMetaItem}>
                          <FileText size={12} color={theme.colors.textMuted} />
                          <Text style={[styles.moduleMetaText, { color: theme.colors.textMuted }]}>
                            {module.lessons.length} lektioner
                          </Text>
                        </View>
                        <View style={styles.moduleMetaItem}>
                          <Clock size={12} color={theme.colors.textMuted} />
                          <Text style={[styles.moduleMetaText, { color: theme.colors.textMuted }]}>
                            {moduleDuration} min
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.moduleRight}>
                      {moduleProgress && moduleProgress.percentComplete > 0 && !isModuleCompleted && (
                        <View style={[styles.progressPill, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                          <Text style={[styles.progressPillText, { color: courseStyle.primaryColor }]}>
                            {moduleProgress.percentComplete}%
                          </Text>
                        </View>
                      )}
                      {!isModuleLocked && <ChevronRight size={20} color={theme.colors.textMuted} />}
                    </View>
                  </View>

                  <View style={styles.lessonsPreview}>
                    {module.lessons.slice(0, 3).map((lesson, lessonIndex) => {
                      const LessonIcon = getLessonTypeIcon(lesson.type);
                      const completed = id ? isLessonCompleted(id, lesson.id) : false;
                      
                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          style={[
                            styles.lessonItem,
                            { backgroundColor: theme.colors.surface },
                            completed && { backgroundColor: theme.colors.success + '08' }
                          ]}
                          onPress={() => !isModuleLocked && navigateToLesson(lesson.id)}
                          disabled={isModuleLocked}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.lessonIcon,
                            { backgroundColor: completed ? theme.colors.success + '15' : theme.colors.borderLight }
                          ]}>
                            {completed ? (
                              <CheckCircle size={14} color={theme.colors.success} />
                            ) : (
                              <LessonIcon size={14} color={theme.colors.textMuted} />
                            )}
                          </View>
                          <Text 
                            style={[
                              styles.lessonTitle,
                              { color: completed ? theme.colors.success : theme.colors.text }
                            ]}
                            numberOfLines={1}
                          >
                            {lessonIndex + 1}. {lesson.title}
                          </Text>
                          {lesson.durationMinutes && (
                            <Text style={[styles.lessonDuration, { color: theme.colors.textMuted }]}>
                              {lesson.durationMinutes}m
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                    {module.lessons.length > 3 && (
                      <Text style={[styles.moreLessons, { color: theme.colors.textMuted }]}>
                        +{module.lessons.length - 3} fler lektioner
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  modulesSection: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  moduleCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
    lineHeight: 20,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  moduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  moduleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  lessonsPreview: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  lessonIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  lessonDuration: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  moreLessons: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    paddingVertical: 8,
  },
  flashcardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  flashcardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardContent: {
    flex: 1,
  },
  flashcardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  flashcardSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
});
