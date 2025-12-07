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
  ArrowLeft,
  ChevronLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { getCourseStyle } from '@/components/CourseHero';
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
  const slideAnim = useRef(new Animated.Value(30)).current;
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
    router.push(`/content-lesson/${lessonId}` as any);
  };

  const navigateToCourse = () => {
    if (course) {
      router.push(`/content-course/${course.id}` as any);
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
            Laddar modul...
          </Text>
        </View>
      </View>
    );
  }

  if (!course || !module) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{ 
            title: 'Modul ej hittad',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text
          }} 
        />
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
      <Stack.Screen 
        options={{ 
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          )
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
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={courseStyle.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={styles.heroContent}>
              <TouchableOpacity 
                style={styles.courseBreadcrumb}
                onPress={navigateToCourse}
              >
                <ChevronLeft size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.courseBreadcrumbText} numberOfLines={1}>
                  {course.title}
                </Text>
              </TouchableOpacity>

              <View style={styles.moduleBadge}>
                <Text style={styles.moduleBadgeText}>
                  Modul {currentModuleIndex + 1} av {course.modules.length}
                </Text>
              </View>

              <Text style={styles.moduleTitle}>{module.title}</Text>
              
              {module.description && (
                <Text style={styles.moduleDescription}>{module.description}</Text>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <FileText size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statText}>{module.lessons.length} lektioner</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statText}>{totalDuration} min</Text>
                </View>
              </View>

              {moduleProgress && moduleProgress.percentComplete > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Framsteg</Text>
                    <Text style={styles.progressPercent}>{moduleProgress.percentComplete}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${moduleProgress.percentComplete}%` }]} />
                  </View>
                  <Text style={styles.progressMeta}>
                    {completedLessons} av {module.lessons.length} lektioner klara
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {isModuleCompleted && (
            <View style={[styles.completedBadgeFloat, { backgroundColor: theme.colors.success }]}>
              <CheckCircle size={18} color="white" />
              <Text style={styles.completedBadgeFloatText}>Slutförd</Text>
            </View>
          )}
        </Animated.View>

        {!isModuleCompleted && nextIncompleteLesson && (
          <Animated.View
            style={[
              styles.continueCard,
              { 
                backgroundColor: theme.colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.continueCardContent}>
              <View style={[styles.continueIcon, { backgroundColor: courseStyle.primaryColor + '20' }]}>
                <Play size={24} color={courseStyle.primaryColor} />
              </View>
              <View style={styles.continueInfo}>
                <Text style={[styles.continueLabel, { color: theme.colors.textSecondary }]}>
                  Fortsätt där du slutade
                </Text>
                <Text style={[styles.continueTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {nextIncompleteLesson.title}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: courseStyle.primaryColor }]}
              onPress={handleContinueModule}
            >
              <Text style={styles.continueButtonText}>Fortsätt</Text>
              <ChevronRight size={18} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.lessonsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📚 Lektioner
          </Text>

          {module.lessons.map((lesson, lessonIndex) => {
            const LessonIcon = getLessonTypeIcon(lesson.type);
            const completed = isLessonCompleted(course.id, lesson.id);
            const isCurrentLesson = nextIncompleteLesson?.id === lesson.id;
            
            return (
              <Animated.View 
                key={lesson.id}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.lessonCard,
                    { backgroundColor: theme.colors.card },
                    completed && { 
                      borderLeftWidth: 4,
                      borderLeftColor: theme.colors.success
                    },
                    isCurrentLesson && !completed && {
                      borderLeftWidth: 4,
                      borderLeftColor: courseStyle.primaryColor
                    }
                  ]}
                  onPress={() => navigateToLesson(lesson.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonLeft}>
                      <View style={[
                        styles.lessonIconContainer,
                        { 
                          backgroundColor: completed 
                            ? theme.colors.success + '20' 
                            : isCurrentLesson
                            ? courseStyle.primaryColor + '20'
                            : theme.colors.borderLight
                        }
                      ]}>
                        {completed ? (
                          <CheckCircle size={22} color={theme.colors.success} />
                        ) : (
                          <LessonIcon size={22} color={isCurrentLesson ? courseStyle.primaryColor : theme.colors.textSecondary} />
                        )}
                      </View>
                      <View style={styles.lessonInfo}>
                        <View style={styles.lessonTitleRow}>
                          <Text style={[styles.lessonNumber, { color: theme.colors.textMuted }]}>
                            {lessonIndex + 1}
                          </Text>
                          {completed && (
                            <View style={[styles.completedTag, { backgroundColor: theme.colors.success + '20' }]}>
                              <Text style={[styles.completedTagText, { color: theme.colors.success }]}>
                                Klar
                              </Text>
                            </View>
                          )}
                          {isCurrentLesson && !completed && (
                            <View style={[styles.currentTag, { backgroundColor: courseStyle.primaryColor + '20' }]}>
                              <Text style={[styles.currentTagText, { color: courseStyle.primaryColor }]}>
                                Nästa
                              </Text>
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
                          <View style={[
                            styles.lessonTypeBadge,
                            { backgroundColor: theme.colors.borderLight }
                          ]}>
                            <Text style={[styles.lessonTypeText, { color: theme.colors.textMuted }]}>
                              {lesson.type === 'text' ? 'Läsning' : 
                               lesson.type === 'video' ? 'Video' : 'Quiz'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={20} color={theme.colors.textMuted} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
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
              onPress={() => prevModule && router.replace(`/content-module/${prevModule.id}` as any)}
              disabled={!prevModule}
            >
              <ChevronLeft size={20} color={prevModule ? theme.colors.text : theme.colors.textMuted} />
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
              onPress={() => nextModule && router.replace(`/content-module/${nextModule.id}` as any)}
              disabled={!nextModule}
            >
              <Text style={[
                styles.navButtonText,
                { color: nextModule ? theme.colors.text : theme.colors.textMuted }
              ]}>
                Nästa
              </Text>
              <ChevronRight size={20} color={nextModule ? theme.colors.text : theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

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
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
  heroSection: {
    position: 'relative',
    marginBottom: 24,
  },
  heroGradient: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 20,
    left: -40,
  },
  heroContent: {},
  courseBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseBreadcrumbText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  moduleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  moduleBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  moduleTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 8,
    lineHeight: 34,
  },
  moduleDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  progressSection: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressPercent: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  completedBadgeFloat: {
    position: 'absolute',
    top: 110,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completedBadgeFloatText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  continueCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  continueLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  lessonsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  lessonCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  lessonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  lessonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
    fontSize: 12,
    fontWeight: '600' as const,
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
  currentTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
    lineHeight: 22,
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
    paddingHorizontal: 20,
    marginTop: 24,
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
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
