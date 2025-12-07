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
  BookOpen, 
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Lock,
  Clock,
  Award,
  Sparkles
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHero, getCourseStyle } from '@/components/CourseHero';
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
  const slideAnim = useRef(new Animated.Value(30)).current;
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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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
    router.push(`/content-lesson/${lessonId}` as any);
  };

  const navigateToModule = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-module/${moduleId}` as any);
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
        <Stack.Screen 
          options={{ 
            title: 'Laddar...',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text
          }} 
        />
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
        <Stack.Screen 
          options={{ 
            title: 'Kurs ej hittad',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text
          }} 
        />
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: 'white'
        }} 
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <CourseHero
          title={course.title}
          description={course.description}
          courseStyle={courseStyle}
          progress={progress ? {
            completed: progress.lessonsCompleted,
            total: progress.totalLessons || totalLessons,
            percentage: progress.percentComplete
          } : undefined}
          modulesCount={course.modules.length}
          lessonsCount={totalLessons}
          estimatedHours={estimatedHours}
          showEditButton={false}
          onStartPress={handleStartCourse}
          imageUrl={course.image}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          variant="compact"
          badgeText="Studiekurs"
        />

        {progress && progress.percentComplete > 0 && (
          <Animated.View 
            style={[
              styles.progressCard,
              { 
                backgroundColor: theme.colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.progressHeader}>
              <Award size={22} color={courseStyle.primaryColor} />
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                  Din framgång
                </Text>
                <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
                  {progress.lessonsCompleted} av {progress.totalLessons || totalLessons} lektioner
                </Text>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: courseStyle.primaryColor }]}>
                <Text style={styles.progressBadgeText}>{progress.percentComplete}%</Text>
              </View>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.percentComplete}%`,
                    backgroundColor: courseStyle.primaryColor 
                  }
                ]} 
              />
            </View>
            {progress.percentComplete === 100 && (
              <View style={styles.completedBanner}>
                <CheckCircle size={18} color={theme.colors.success} />
                <Text style={[styles.completedBannerText, { color: theme.colors.success }]}>
                  Kurs slutförd! Bra jobbat! 🎉
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📚 Kursinnehåll
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              {course.modules.length} moduler • {totalLessons} lektioner
            </Text>
          </View>

          {course.modules.map((module, moduleIndex) => {
            const moduleProgress = id ? getModuleProgress(id, module.id) : undefined;
            const isModuleCompleted = moduleProgress?.percentComplete === 100;
            const isModuleLocked = course.premiumRequired && moduleIndex > 0;
            const moduleDuration = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

            return (
              <Animated.View 
                key={module.id}
                style={[
                  styles.moduleCard,
                  { 
                    backgroundColor: theme.colors.card,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    borderLeftWidth: 4,
                    borderLeftColor: isModuleCompleted 
                      ? theme.colors.success 
                      : moduleProgress && moduleProgress.percentComplete > 0 
                      ? theme.colors.warning 
                      : theme.colors.border
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => !isModuleLocked && navigateToModule(module.id)}
                  disabled={isModuleLocked}
                  activeOpacity={0.7}
                >
                  <View style={styles.moduleHeaderLeft}>
                    <View style={[
                      styles.moduleNumber,
                      { 
                        backgroundColor: isModuleCompleted 
                          ? theme.colors.success + '20' 
                          : isModuleLocked 
                          ? theme.colors.borderLight
                          : courseStyle.primaryColor + '20' 
                      }
                    ]}>
                      {isModuleCompleted ? (
                        <CheckCircle size={20} color={theme.colors.success} />
                      ) : isModuleLocked ? (
                        <Lock size={18} color={theme.colors.textMuted} />
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
                      {module.description && (
                        <Text 
                          style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {module.description}
                        </Text>
                      )}
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
                        {moduleProgress && moduleProgress.percentComplete > 0 && (
                          <View style={[
                            styles.moduleProgressBadge,
                            { 
                              backgroundColor: isModuleCompleted 
                                ? theme.colors.success + '20' 
                                : theme.colors.warning + '20' 
                            }
                          ]}>
                            <Text style={[
                              styles.moduleProgressText,
                              { 
                                color: isModuleCompleted 
                                  ? theme.colors.success 
                                  : theme.colors.warning 
                              }
                            ]}>
                              {moduleProgress.percentComplete}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {!isModuleLocked && (
                    <ChevronRight size={20} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>

                <View style={styles.lessonsContainer}>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const LessonIcon = getLessonTypeIcon(lesson.type);
                    const completed = id ? isLessonCompleted(id, lesson.id) : false;
                    const isLessonLocked = isModuleLocked;
                    
                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonCard,
                          { backgroundColor: theme.colors.surface },
                          completed && { 
                            backgroundColor: theme.colors.success + '08',
                            borderLeftWidth: 3,
                            borderLeftColor: theme.colors.success
                          },
                          isLessonLocked && {
                            opacity: 0.5
                          }
                        ]}
                        onPress={() => !isLessonLocked && navigateToLesson(lesson.id)}
                        disabled={isLessonLocked}
                        activeOpacity={0.7}
                      >
                        <View style={styles.lessonLeft}>
                          <View style={[
                            styles.lessonIconContainer,
                            { 
                              backgroundColor: completed 
                                ? theme.colors.success + '20' 
                                : isLessonLocked
                                ? theme.colors.borderLight
                                : courseStyle.primaryColor + '15' 
                            }
                          ]}>
                            {completed ? (
                              <CheckCircle size={18} color={theme.colors.success} />
                            ) : isLessonLocked ? (
                              <Lock size={16} color={theme.colors.textMuted} />
                            ) : (
                              <LessonIcon size={18} color={courseStyle.primaryColor} />
                            )}
                          </View>
                          <View style={styles.lessonInfo}>
                            <Text 
                              style={[
                                styles.lessonTitle, 
                                { color: theme.colors.text },
                                completed && { color: theme.colors.success },
                                isLessonLocked && { color: theme.colors.textMuted }
                              ]}
                              numberOfLines={2}
                            >
                              {lessonIndex + 1}. {lesson.title}
                            </Text>
                            <View style={styles.lessonMeta}>
                              {lesson.durationMinutes && (
                                <Text style={[styles.lessonDuration, { color: theme.colors.textMuted }]}>
                                  {lesson.durationMinutes} min
                                </Text>
                              )}
                              <View style={[
                                styles.lessonTypeBadge,
                                { backgroundColor: theme.colors.borderLight }
                              ]}>
                                <Text style={[styles.lessonTypeText, { color: theme.colors.textMuted }]}>
                                  {lesson.type === 'text' ? 'Läsning' : 
                                   lesson.type === 'video' ? 'Video' : 'Quiz'}
                                </Text>
                              </View>
                              {completed && (
                                <View style={[styles.completedTag, { backgroundColor: theme.colors.success + '20' }]}>
                                  <Text style={[styles.completedTagText, { color: theme.colors.success }]}>
                                    Klar
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        <ChevronRight size={18} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {progress && progress.percentComplete === 0 && (
          <View style={styles.startPromptSection}>
            <TouchableOpacity
              style={[styles.startCourseButton, { backgroundColor: courseStyle.primaryColor }]}
              onPress={handleStartCourse}
            >
              <Sparkles size={22} color="white" />
              <Text style={styles.startCourseButtonText}>Börja kursen nu</Text>
            </TouchableOpacity>
            <Text style={[styles.startPromptHint, { color: theme.colors.textSecondary }]}>
              Starta med den första lektionen för att börja din inlärningsresa
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
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
  progressCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  progressBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800' as const,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  completedBannerText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modulesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  moduleCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
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
    fontSize: 18,
    fontWeight: '800' as const,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 4,
    lineHeight: 22,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  moduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
  },
  moduleProgressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  moduleProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  lessonsContainer: {
    padding: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  lessonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginBottom: 4,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  lessonDuration: {
    fontSize: 12,
  },
  lessonTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lessonTypeText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  completedTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  startPromptSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  startCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startCourseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  startPromptHint: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
