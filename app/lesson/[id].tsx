import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  Play,
  Target,
  ArrowLeft,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Database } from '@/lib/database.types';

type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
type CourseExercise = Database['public']['Tables']['course_exercises']['Row'];

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [progress, setProgress] = useState<UserLessonProgress | null>(null);
  const [exercises, setExercises] = useState<CourseExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (id && user?.id) {
      loadLessonData();
    }
  }, [id, user?.id]);

  const loadLessonData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading lesson data for ID:', id);

      // Load lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonError) {
        console.error('Error loading lesson:', lessonError);
        Alert.alert('Fel', 'Kunde inte ladda lektionen');
        return;
      }

      setLesson(lessonData);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', id)
        .eq('user_id', user?.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error loading progress:', progressError);
      } else if (progressData) {
        setProgress(progressData);
      }

      // Load exercises
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

      // Mark lesson as started if not already
      if (!progressData) {
        await markLessonStarted();
      }

    } catch (error) {
      console.error('Error in loadLessonData:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonStarted = async () => {
    if (!lesson || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          course_id: lesson.course_id,
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
  };

  const markLessonCompleted = async () => {
    if (!lesson || !user?.id) return;

    try {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
      
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
        console.error('Error marking lesson as completed:', error);
        Alert.alert('Fel', 'Kunde inte markera lektionen som slutförd');
      } else {
        setProgress(data);
        Alert.alert('Grattis!', 'Du har slutfört lektionen!');
      }
    } catch (error) {
      console.error('Error in markLessonCompleted:', error);
    }
  };

  const navigateToExercise = (exercise: CourseExercise) => {
    router.push(`/exercise/${exercise.id}` as any);
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
      default: return BookOpen;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Laddar...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Laddar lektion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Lektion ej hittad', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lektionen kunde inte hittas</Text>
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

  const LessonIcon = getLessonTypeIcon(lesson.lesson_type);
  const isCompleted = progress?.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: lesson.title,
          headerShown: true,
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: 'white'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
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
          <View style={styles.contentContainer}>
            {lesson.content ? (
              <Text style={styles.contentText}>{lesson.content}</Text>
            ) : (
              <Text style={styles.noContentText}>
                Inget innehåll tillgängligt för denna lektion.
              </Text>
            )}
          </View>
        </View>

        {/* Exercises */}
        {exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✏️ Övningar</Text>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => navigateToExercise(exercise)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <View style={styles.exerciseMetadata}>
                    <Text style={styles.exercisePoints}>{exercise.points} poäng</Text>
                    {exercise.time_limit_minutes && (
                      <Text style={styles.exerciseTime}>
                        {exercise.time_limit_minutes} min
                      </Text>
                    )}
                  </View>
                </View>
                <ArrowRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!isCompleted ? (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={markLessonCompleted}
            >
              <CheckCircle size={20} color="white" />
              <Text style={styles.completeButtonText}>Markera som slutförd</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedContainer}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.completedMessage}>Lektion slutförd!</Text>
            </View>
          )}
        </View>
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
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  objectivesContainer: {
    backgroundColor: 'white',
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
    color: '#4F46E5',
    marginRight: 8,
    fontWeight: 'bold',
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  contentContainer: {
    backgroundColor: 'white',
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
    color: '#374151',
    lineHeight: 24,
  },
  noContentText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  exerciseCard: {
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exercisePoints: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  exerciseTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completedMessage: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
});