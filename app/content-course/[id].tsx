import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';

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

  const course = id ? getCourseById(id) : undefined;
  const progress = id ? getCourseProgress(id) : undefined;

  useEffect(() => {
    if (id) {
      updateLastAccessed(id);
    }
    
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
  }, [id, fadeAnim, slideAnim, updateLastAccessed]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  const navigateToLesson = (lessonId: string) => {
    router.push(`/content-lesson/${lessonId}` as any);
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
          {course.image ? (
            <Image source={{ uri: course.image }} style={styles.heroImage} />
          ) : (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.heroGradient}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <View style={styles.courseBadge}>
              <Sparkles size={14} color="white" />
              <Text style={styles.badgeText}>Studiekurs</Text>
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <BookOpen size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{course.modules.length} moduler</Text>
              </View>
              <View style={styles.statItem}>
                <FileText size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{totalLessons} lektioner</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{formatDuration(totalDuration)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

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
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                Din framgång
              </Text>
              <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                {progress.percentComplete}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.percentComplete}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressMeta, { color: theme.colors.textSecondary }]}>
              {progress.lessonsCompleted} av {progress.totalLessons} lektioner genomförda
            </Text>
          </Animated.View>
        )}

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📚 Kursinnehåll
          </Text>

          {course.modules.map((module, moduleIndex) => {
            const moduleProgress = id ? getModuleProgress(id, module.id) : undefined;
            const isModuleCompleted = moduleProgress?.percentComplete === 100;

            return (
              <Animated.View 
                key={module.id}
                style={[
                  styles.moduleCard,
                  { 
                    backgroundColor: theme.colors.card,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleHeaderLeft}>
                    <View style={[
                      styles.moduleNumber,
                      { 
                        backgroundColor: isModuleCompleted 
                          ? theme.colors.success + '20' 
                          : theme.colors.primary + '20' 
                      }
                    ]}>
                      {isModuleCompleted ? (
                        <CheckCircle size={18} color={theme.colors.success} />
                      ) : (
                        <Text style={[styles.moduleNumberText, { color: theme.colors.primary }]}>
                          {moduleIndex + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
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
                        <Text style={[styles.moduleMetaText, { color: theme.colors.textMuted }]}>
                          {module.lessons.length} lektioner
                        </Text>
                        {moduleProgress && moduleProgress.percentComplete > 0 && (
                          <Text style={[styles.moduleMetaText, { color: theme.colors.primary }]}>
                            • {moduleProgress.percentComplete}% klart
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.lessonsContainer}>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const LessonIcon = getLessonTypeIcon(lesson.type);
                    const completed = id ? isLessonCompleted(id, lesson.id) : false;
                    
                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonCard,
                          { backgroundColor: theme.colors.surface },
                          completed && { 
                            backgroundColor: theme.colors.success + '10',
                            borderLeftWidth: 3,
                            borderLeftColor: theme.colors.success
                          }
                        ]}
                        onPress={() => navigateToLesson(lesson.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.lessonLeft}>
                          <View style={[
                            styles.lessonIconContainer,
                            { backgroundColor: completed ? theme.colors.success + '20' : theme.colors.primary + '15' }
                          ]}>
                            {completed ? (
                              <CheckCircle size={18} color={theme.colors.success} />
                            ) : (
                              <LessonIcon size={18} color={theme.colors.primary} />
                            )}
                          </View>
                          <View style={styles.lessonInfo}>
                            <Text 
                              style={[
                                styles.lessonTitle, 
                                { color: theme.colors.text },
                                completed && { color: theme.colors.success }
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
                            </View>
                          </View>
                        </View>
                        <ChevronRight size={20} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {progress && progress.percentComplete === 0 && (
          <View style={styles.startPrompt}>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                const firstLesson = course.modules[0]?.lessons[0];
                if (firstLesson) {
                  navigateToLesson(firstLesson.id);
                }
              }}
            >
              <Play size={20} color="white" />
              <Text style={styles.startButtonText}>Börja kursen</Text>
            </TouchableOpacity>
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
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 8,
    lineHeight: 34,
  },
  courseDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  progressCard: {
    marginHorizontal: 24,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    fontSize: 13,
  },
  modulesSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    letterSpacing: -0.5,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  moduleNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 4,
    lineHeight: 22,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 13,
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
    width: 36,
    height: 36,
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
  startPrompt: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
