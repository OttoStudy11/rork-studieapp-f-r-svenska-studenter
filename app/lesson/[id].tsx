import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { XP_VALUES } from '@/constants/xp-system';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  Play,
  Target,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { Database } from '@/lib/database.types';

type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
type CourseExercise = Database['public']['Tables']['course_exercises']['Row'];
type CourseModule = Database['public']['Tables']['course_modules']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

interface LessonWithRelations extends CourseLesson {
  module?: CourseModule;
  course?: Course;
}

const getCourseStyle = (subject: string) => {
  const styles: Record<string, { gradient: string[]; primaryColor: string }> = {
    'Matematik': { gradient: ['#3B82F6', '#2563EB'], primaryColor: '#3B82F6' },
    'Svenska': { gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899' },
    'Engelska': { gradient: ['#10B981', '#059669'], primaryColor: '#10B981' },
    'Biologi': { gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6' },
    'Fysik': { gradient: ['#F59E0B', '#D97706'], primaryColor: '#F59E0B' },
    'Kemi': { gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6' },
    'Historia': { gradient: ['#F97316', '#EA580C'], primaryColor: '#F97316' },
    'default': { gradient: ['#6366F1', '#4F46E5'], primaryColor: '#6366F1' }
  };
  return styles[subject] || styles.default;
};

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { addXp, isReady: gamificationReady } = useGamification();
  const [lesson, setLesson] = useState<LessonWithRelations | null>(null);
  const [progress, setProgress] = useState<UserLessonProgress | null>(null);
  const [exercises, setExercises] = useState<CourseExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startTime] = useState(new Date());
  const [readingProgress, setReadingProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const markLessonStarted = useCallback(async (lessonToMark: LessonWithRelations) => {
    if (!lessonToMark || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonToMark.id,
          course_id: lessonToMark.course_id,
          status: 'in_progress',
          progress_percentage: 0,
          time_spent_minutes: 0,
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking lesson as started:', error);
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error in markLessonStarted:', error);
    }
  }, [user?.id]);

  const loadLessonData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      console.log('Loading lesson data for ID:', id);

      const { data: lessonData, error: lessonError } = await supabase
        .from('course_lessons')
        .select(`
          *,
          course_modules!inner (
            id,
            title,
            description,
            course_id,
            order_index,
            estimated_hours
          )
        `)
        .eq('id', id)
        .single();

      if (lessonError) {
        console.error('Error loading lesson:', lessonError);
        Alert.alert('Fel', 'Kunde inte ladda lektionen');
        return;
      }

      const enrichedLesson: LessonWithRelations = {
        ...lessonData,
        module: Array.isArray(lessonData.course_modules) 
          ? lessonData.course_modules[0] 
          : lessonData.course_modules
      };

      if (enrichedLesson.module?.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', enrichedLesson.module.course_id)
          .single();
        
        if (courseData) {
          enrichedLesson.course = courseData;
        }
      }

      setLesson(enrichedLesson);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', id)
        .eq('user_id', user?.id || '')
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error loading progress:', progressError);
      } else if (progressData) {
        setProgress(progressData);
      }

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('course_exercises')
        .select('*')
        .eq('lesson_id', id)
        .eq('is_published', true);

      if (exercisesError) {
        console.error('Error loading exercises:', exercisesError);
      } else {
        setExercises(exercisesData || []);
      }

      if (enrichedLesson.module_id) {
        const { data: moduleLessons } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', enrichedLesson.module_id)
          .eq('is_published', true)
          .order('order_index');
        
        if (moduleLessons) {
          const currentIndex = moduleLessons.findIndex(l => l.id === id);
          if (currentIndex < moduleLessons.length - 1) {
            setNextLesson(moduleLessons[currentIndex + 1]);
          }
        }
      }

      if (!progressData) {
        await markLessonStarted(enrichedLesson);
      }

    } catch (error) {
      console.error('Error in loadLessonData:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, user?.id, markLessonStarted]);

  useEffect(() => {
    if (id && user?.id) {
      loadLessonData();
    }
  }, [id, user?.id, loadLessonData]);

  useFocusEffect(
    useCallback(() => {
      if (id && user?.id) {
        console.log('Lesson screen focused, reloading data');
        loadLessonData();
      }
    }, [id, user?.id, loadLessonData])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    loadLessonData(true);
  }, [loadLessonData]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    setReadingProgress(Math.min(100, Math.max(0, scrollPercentage)));
  };

  const markLessonCompleted = async () => {
    if (!lesson || !user?.id || isCompleting) return;

    setIsCompleting(true);
    
    try {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
      
      console.log('📝 Marking lesson as completed:', lesson.title);
      console.log('Time spent:', timeSpent, 'minutes');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          course_id: lesson.course_id,
          status: 'completed',
          progress_percentage: 100,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking lesson as completed:', error);
        Alert.alert('Fel', 'Kunde inte markera lektionen som slutförd');
        setIsCompleting(false);
        return;
      }
      
      console.log('✅ Lesson progress saved:', data);
      setProgress(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Update user_courses progress
      try {
        console.log('Updating course progress for course:', lesson.course_id);
        
        // Get all lessons in this course
        const { data: allLessons, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('id')
          .eq('course_id', lesson.course_id);
        
        if (lessonsError) {
          console.warn('Could not fetch all lessons:', lessonsError.message);
        } else {
          // Get user progress for all lessons
          const { data: allProgress, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, status')
            .eq('user_id', user.id)
            .eq('course_id', lesson.course_id);
          
          if (!progressError && allLessons && allProgress) {
            const totalLessons = allLessons.length;
            const completedLessons = allProgress.filter(p => p.status === 'completed').length;
            const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            
            console.log(`Course progress calculated: ${completedLessons}/${totalLessons} = ${courseProgress}%`);
            
            // Update user_courses
            const { error: updateError } = await supabase
              .from('user_courses')
              .update({ progress: courseProgress })
              .eq('user_id', user.id)
              .eq('course_id', lesson.course_id);
            
            if (updateError) {
              console.error('❌ Could not update course progress:', updateError.message);
            } else {
              console.log('✅ Course progress updated to', courseProgress, '%');
            }
          }
        }
      } catch (courseProgressError) {
        console.error('❌ Error updating course progress:', courseProgressError);
      }
      
      // Award XP for lesson completion
      if (gamificationReady) {
        try {
          const difficulty = lesson.difficulty_level || 'medium';
          let xpAmount: number = XP_VALUES.LESSON_MEDIUM_COMPLETE;
          if (difficulty === 'easy') xpAmount = XP_VALUES.LESSON_EASY_COMPLETE;
          else if (difficulty === 'hard') xpAmount = XP_VALUES.LESSON_HARD_COMPLETE;
          
          console.log(`🎯 Awarding ${xpAmount} XP for ${difficulty} lesson completion`);
          const levelUpResult = await addXp(xpAmount, 'lesson_complete', lesson.id, {
            lessonTitle: lesson.title,
            difficulty: difficulty,
            courseId: lesson.course_id,
          });
          
          if (levelUpResult) {
            console.log('🎉 Level up!', levelUpResult);
          }
        } catch (xpError) {
          console.error('Error awarding XP:', xpError);
        }
      }
      
      Alert.alert(
        'Bra jobbat! 🎉',
        `Du har slutfört lektionen! +${lesson.difficulty_level === 'easy' ? XP_VALUES.LESSON_EASY_COMPLETE : lesson.difficulty_level === 'hard' ? XP_VALUES.LESSON_HARD_COMPLETE : XP_VALUES.LESSON_MEDIUM_COMPLETE} XP`,
        [
          {
            text: nextLesson ? 'Fortsätt till nästa' : 'OK',
            onPress: () => {
              if (nextLesson) {
                router.replace(`/lesson/${nextLesson.id}` as never);
              }
            }
          },
          {
            text: 'Stanna kvar',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error in markLessonCompleted:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const navigateToExercise = (exercise: CourseExercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/quiz/${exercise.id}` as never);
  };

  const getLessonTypeIcon = () => {
    if (!lesson) return BookOpen;
    switch (lesson.lesson_type) {
      case 'video': return Play;
      case 'reading': return BookOpen;
      case 'exercise': return Target;
      case 'quiz': return Award;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Laddar...', headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar lektion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Lektion ej hittad', headerShown: false }} />
        <View style={styles.errorContainer}>
          <FileText size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Lektionen hittades inte</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den lektion du söker finns inte längre.
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const courseStyle = lesson.course ? getCourseStyle(lesson.course.subject) : getCourseStyle('default');
  const LessonIcon = getLessonTypeIcon();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.readingProgressContainer}>
        <View 
          style={[
            styles.readingProgressBar, 
            { 
              width: `${readingProgress}%`,
              backgroundColor: courseStyle.primaryColor 
            }
          ]} 
        />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
        <LinearGradient
          colors={courseStyle.gradient as any}
          style={styles.lessonHeader}
        >
          <View style={styles.lessonTypeContainer}>
            <LessonIcon size={24} color="white" />
            <Text style={styles.lessonType}>
              {lesson.lesson_type === 'theory' ? 'Teori' :
               lesson.lesson_type === 'practical' ? 'Praktisk' :
               lesson.lesson_type === 'exercise' ? 'Övning' :
               lesson.lesson_type === 'quiz' ? 'Quiz' :
               lesson.lesson_type === 'video' ? 'Video' :
               lesson.lesson_type === 'reading' ? 'Läsning' : 'Lektion'}
            </Text>
          </View>
          
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.description && (
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
          )}
          
          <View style={styles.lessonMetadata}>
            <View style={styles.metadataItem}>
              <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metadataText}>{lesson.estimated_minutes} min</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(lesson.difficulty_level) }
            ]}>
              <Text style={styles.difficultyText}>
                {lesson.difficulty_level === 'easy' ? 'Lätt' : 
                 lesson.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.completedText}>Slutförd</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Learning Objectives */}
        {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Lärandemål</Text>
            <View style={styles.objectivesContainer}>
              {lesson.learning_objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Text style={styles.objectiveBullet}>•</Text>
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lesson Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Innehåll</Text>
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.card }]}>
            {lesson.content ? (
              <Text style={[styles.contentText, { color: theme.colors.text }]}>{lesson.content}</Text>
            ) : (
              <Text style={[styles.noContentText, { color: theme.colors.textMuted }]}>
                Inget innehåll tillgängligt för denna lektion.
              </Text>
            )}
          </View>
        </View>

        {exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>✏️ Övningar</Text>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, { backgroundColor: theme.colors.card }]}
                onPress={() => navigateToExercise(exercise)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseTitle, { color: theme.colors.text }]}>{exercise.title}</Text>
                  <Text style={[styles.exerciseDescription, { color: theme.colors.textSecondary }]}>{exercise.description}</Text>
                  <View style={styles.exerciseMetadata}>
                    <Text style={[styles.exercisePoints, { color: courseStyle.primaryColor }]}>{exercise.points} poäng</Text>
                    {exercise.time_limit_minutes && (
                      <Text style={[styles.exerciseTime, { color: theme.colors.textMuted }]}>
                        {exercise.time_limit_minutes} min
                      </Text>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionContainer}>
          {!isCompleted ? (
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
              onPress={markLessonCompleted}
              disabled={isCompleting}
              activeOpacity={0.8}
            >
              <CheckCircle size={20} color="white" />
              <Text style={styles.completeButtonText}>
                {isCompleting ? 'Sparar...' : 'Markera som slutförd'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedContainer}>
              <CheckCircle size={24} color={theme.colors.success} />
              <Text style={[styles.completedMessage, { color: theme.colors.success }]}>Lektion slutförd!</Text>
            </View>
          )}

          {(nextLesson || lesson.module) && (
            <View style={styles.navigationButtons}>
              {lesson.module && (
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => router.back()}
                >
                  <ChevronLeft size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.navButtonText, { color: theme.colors.textSecondary }]}>
                    Tillbaka till modul
                  </Text>
                </TouchableOpacity>
              )}
              {nextLesson && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: courseStyle.primaryColor }]}
                  onPress={() => router.replace(`/lesson/${nextLesson.id}` as never)}
                >
                  <Text style={styles.navButtonTextWhite}>Nästa lektion</Text>
                  <ChevronRight size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readingProgressContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 100,
  },
  readingProgressBar: {
    height: '100%',
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
    textAlign: 'center' as const,
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  lessonHeader: {
    padding: 24,
    marginBottom: 20,
  },
  lessonTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 16,
  },
  lessonMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  objectivesContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  objectiveBullet: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '700' as const,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  contentContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noContentText: {
    fontSize: 16,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseMetadata: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  exercisePoints: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  exerciseTime: {
    fontSize: 12,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  completeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  completedContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    gap: 8,
  },
  completedMessage: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  navigationButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonPrimary: {
    shadowOpacity: 0.15,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  navButtonTextWhite: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
  },
});