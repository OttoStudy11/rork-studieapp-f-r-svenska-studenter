import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Play,
  CheckCircle,
  Circle,
  FileText,
  Target,
  TrendingUp,
  Star,
  Lock,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Database } from '@/lib/database.types';



type Course = Database['public']['Tables']['courses']['Row'];
type CourseModule = Database['public']['Tables']['course_modules']['Row'];
type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
type StudyGuide = Database['public']['Tables']['study_guides']['Row'];

interface ModuleWithLessons extends Omit<CourseModule, 'description'> {
  description: string;
  lessons: (CourseLesson & { progress?: UserLessonProgress })[];
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (id && user?.id) {
      loadCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading course data for ID:', id);

      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('Error loading course:', courseError);
        Alert.alert('Fel', 'Kunde inte ladda kursen');
        return;
      }

      setCourse(courseData);

      // Load modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (
            *,
            user_lesson_progress (
              *
            )
          )
        `)
        .eq('course_id', id || '')
        .eq('is_published', true)
        .order('order_index');

      if (modulesError) {
        console.error('Error loading modules:', modulesError);
      } else {
        const processedModules = modulesData?.map(module => ({
          ...module,
          description: module.description || '',
          lessons: (module.course_lessons || [])
            .filter((lesson: any) => lesson.is_published)
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((lesson: any) => ({
              ...lesson,
              progress: lesson.user_lesson_progress?.find(
                (p: any) => p.user_id === user?.id
              )
            }))
        })) || [];
        
        setModules(processedModules);
        
        // Calculate progress
        const totalLessons = processedModules.reduce((sum, module) => sum + module.lessons.length, 0);
        const completedLessons = processedModules.reduce(
          (sum, module) => sum + module.lessons.filter(lesson => lesson.progress?.status === 'completed').length, 
          0
        );
        
        setUserProgress({
          completed: completedLessons,
          total: totalLessons,
          percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        });
        
        // Animate entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Load study guides
      const { data: guidesData, error: guidesError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('course_id', id || '')
        .eq('is_published', true);

      if (guidesError) {
        console.error('Error loading study guides:', guidesError);
      } else {
        setStudyGuides(guidesData || []);
      }

    } catch (error) {
      console.error('Error in loadCourseData:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLesson = (lesson: CourseLesson) => {
    router.push(`/lesson/${lesson.id}`);
  };

  const navigateToStudyGuide = (guide: StudyGuide) => {
    router.push(`/study-guide/${guide.id}`);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'reading': return BookOpen;
      case 'exercise': return Target;
      case 'quiz': return Award;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Laddar...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Laddar kursinnehåll...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Kurs ej hittad', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kursen kunde inte hittas</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: course.title,
          headerShown: true,
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: 'white'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.courseHeader}
        >
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseSubject}>{course.subject}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          
          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Framsteg</Text>
              <Text style={styles.progressPercent}>{userProgress.percentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${userProgress.percentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {userProgress.completed} av {userProgress.total} lektioner slutförda
            </Text>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.quickStatText}>
                {userProgress.percentage}% klar
              </Text>
            </View>
            {userProgress.completed > 0 && (
              <View style={styles.quickStatItem}>
                <Star size={16} color="#FCD34D" />
                <Text style={styles.quickStatText}>
                  {userProgress.completed} slutförda
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
        </Animated.View>

        {/* Course Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 25]
                })
              }]
            }
          ]}
        >
          <View style={styles.statItem}>
            <BookOpen size={20} color="#4F46E5" />
            <Text style={styles.statNumber}>{modules.length}</Text>
            <Text style={styles.statLabel}>Moduler</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color="#4F46E5" />
            <Text style={styles.statNumber}>
              {modules.reduce((sum, m) => sum + m.estimated_hours, 0)}h
            </Text>
            <Text style={styles.statLabel}>Uppskattad tid</Text>
          </View>
          <View style={styles.statItem}>
            <FileText size={20} color="#4F46E5" />
            <Text style={styles.statNumber}>{studyGuides.length}</Text>
            <Text style={styles.statLabel}>Studiehjälpmedel</Text>
          </View>
        </Animated.View>

        {/* Study Guides */}
        {studyGuides.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Studiehjälpmedel</Text>
            {studyGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={styles.guideCard}
                onPress={() => navigateToStudyGuide(guide)}
              >
                <View style={styles.guideInfo}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <Text style={styles.guideDescription}>{guide.description}</Text>
                  <View style={styles.guideMetadata}>
                    <View style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(guide.difficulty_level) }
                    ]}>
                      <Text style={styles.difficultyText}>
                        {guide.difficulty_level === 'easy' ? 'Lätt' : 
                         guide.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
                      </Text>
                    </View>
                    <Text style={styles.readTime}>{guide.estimated_read_time} min</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Course Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Kursinnehåll</Text>
          {modules.map((module, moduleIndex) => (
            <View key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>
                  {moduleIndex + 1}. {module.title}
                </Text>
                {module.description && <Text style={styles.moduleDescription}>{module.description}</Text>}
                <Text style={styles.moduleHours}>{module.estimated_hours}h uppskattad tid</Text>
              </View>
              
              {/* Lessons */}
              <View style={styles.lessonsContainer}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const LessonIcon = getLessonTypeIcon(lesson.lesson_type);
                  const isCompleted = lesson.progress?.status === 'completed';
                  const isInProgress = lesson.progress?.status === 'in_progress';
                  const isLocked = lessonIndex > 0 && !module.lessons[lessonIndex - 1].progress?.status;
                  
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonCard,
                        isCompleted && styles.lessonCompleted,
                        isInProgress && styles.lessonInProgress,
                        isLocked && styles.lessonLocked
                      ]}
                      onPress={() => !isLocked && navigateToLesson(lesson)}
                      activeOpacity={isLocked ? 1 : 0.7}
                    >
                      <View style={styles.lessonLeft}>
                        <View style={styles.lessonIconContainer}>
                          {isLocked ? (
                            <Lock size={20} color="#9CA3AF" />
                          ) : isCompleted ? (
                            <CheckCircle size={20} color="#10B981" />
                          ) : isInProgress ? (
                            <Circle size={20} color="#F59E0B" />
                          ) : (
                            <LessonIcon size={20} color="#6B7280" />
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <View style={styles.lessonTitleRow}>
                            <Text style={[
                              styles.lessonTitle,
                              isCompleted && styles.lessonTitleCompleted,
                              isLocked && styles.lessonTitleLocked
                            ]}>
                              {lessonIndex + 1}. {lesson.title}
                            </Text>
                            {isLocked && (
                              <View style={styles.lockedBadge}>
                                <Text style={styles.lockedBadgeText}>Låst</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.lessonDescription}>
                            {lesson.description}
                          </Text>
                          <View style={styles.lessonMetadata}>
                            <Text style={styles.lessonDuration}>
                              {lesson.estimated_minutes} min
                            </Text>
                            <View style={[
                              styles.difficultyBadge,
                              { backgroundColor: getDifficultyColor(lesson.difficulty_level) }
                            ]}>
                              <Text style={styles.difficultyText}>
                                {lesson.difficulty_level === 'easy' ? 'Lätt' : 
                                 lesson.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {modules.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Inget innehåll tillgängligt</Text>
            <Text style={styles.emptyText}>
              Det finns inget kursinnehåll tillgängligt för denna kurs än.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  courseHeader: {
    padding: 24,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  guideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  guideMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  moduleHours: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  lessonsContainer: {
    padding: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lessonCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderLeftWidth: 4,
  },
  lessonInProgress: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderLeftWidth: 4,
  },
  lessonLocked: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
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
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  lessonTitleCompleted: {
    color: '#059669',
  },
  lessonTitleLocked: {
    color: '#9CA3AF',
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  lockedBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lessonDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  lessonMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});