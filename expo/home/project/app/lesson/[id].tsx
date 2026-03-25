import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Clock, CheckCircle, ArrowLeft, Play, FileText, Target } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: string;
  estimated_minutes: number;
  learning_objectives: string[] | null;
  course_id: string;
}

interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progress_percentage: number;
  time_spent_minutes: number;
  notes?: string | null;
  started_at?: string | null;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  exercise_type: string;
  points: number;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  material_type: string;
  url?: string | null;
  content?: string | null;
  is_required: boolean;
}

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) {
      loadLessonData();
    }
  }, [id]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Load progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', id)
        .eq('user_id', user?.id || '')
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }
      
      setProgress(progressData || {
        status: 'not_started',
        progress_percentage: 0,
        time_spent_minutes: 0
      });

      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('course_exercises')
        .select('id, title, description, exercise_type, points')
        .eq('lesson_id', id)
        .eq('is_published', true);

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

      // Load materials - skip for now as table doesn't exist in types
      // const { data: materialsData, error: materialsError } = await supabase
      //   .from('lesson_materials')
      //   .select('*')
      //   .eq('lesson_id', id)
      //   .order('order_index');

      // if (materialsError) throw materialsError;
      setMaterials([]);

      // Mark as started if not already
      if (!progressData || progressData.status === 'not_started') {
        await updateProgress('in_progress', 10);
      }

    } catch (error) {
      console.error('Error loading lesson data:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Fel', 'Kunde inte ladda lektionsdata');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (status: string, percentage: number) => {
    if (!lesson || !user) return;

    const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          course_id: lesson.course_id,
          status: status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
          progress_percentage: percentage,
          time_spent_minutes: (progress?.time_spent_minutes || 0) + timeSpent,
          last_accessed_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() }),
          ...(status === 'in_progress' && !progress?.started_at && { started_at: new Date().toISOString() })
        });

      if (error) throw error;

      setProgress(prev => ({
        ...prev!,
        status: status as any,
        progress_percentage: percentage,
        time_spent_minutes: (prev?.time_spent_minutes || 0) + timeSpent
      }));

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleCompleteLesson = () => {
    updateProgress('completed', 100);
  };

  const handleMaterialPress = (material: Material) => {
    if (material.url) {
      // Open external URL
      console.log('Opening URL:', material.url);
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.contentH1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.contentH2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        return (
          <Text key={index} style={styles.contentBullet}>
            • {line.substring(2)}
          </Text>
        );
      } else if (line.trim()) {
        return (
          <Text key={index} style={styles.contentText}>
            {line}
          </Text>
        );
      } else {
        return <View key={index} style={styles.contentSpacing} />;
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar lektion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lektionen kunde inte hittas</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: lesson.title,
          headerStyle: { backgroundColor: '#4ECDC4' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Lesson Header */}
          <View style={styles.header}>
            <View style={styles.lessonIcon}>
              <BookOpen size={32} color="#fff" />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
              <View style={styles.lessonMeta}>
                <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.lessonDuration}>
                  {lesson.estimated_minutes} minuter
                </Text>
                <Text style={styles.lessonType}>
                  • {lesson.lesson_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Framsteg</Text>
              <Text style={styles.progressPercentage}>
                {progress?.progress_percentage || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress?.progress_percentage || 0}%` }
                ]} 
              />
            </View>
            <View style={styles.progressActions}>
              {progress?.status !== 'completed' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteLesson}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.completeButtonText}>Markera som slutförd</Text>
                </TouchableOpacity>
              )}
              {progress?.status === 'completed' && (
                <View style={styles.completedBadge}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.completedText}>Slutförd</Text>
                </View>
              )}
            </View>
          </View>

          {/* Learning Objectives */}
          {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
            <View style={styles.objectivesCard}>
              <View style={styles.objectivesHeader}>
                <Target size={20} color="#4ECDC4" />
                <Text style={styles.objectivesTitle}>Lärandemål</Text>
              </View>
              {lesson.learning_objectives.map((objective, index) => (
                <Text key={index} style={styles.objective}>
                  • {objective}
                </Text>
              ))}
            </View>
          )}

          {/* Lesson Content */}
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>Innehåll</Text>
            <View style={styles.content}>
              {renderContent(lesson.content || '')}
            </View>
          </View>

          {/* Materials */}
          {materials.length > 0 && (
            <View style={styles.materialsCard}>
              <Text style={styles.materialsTitle}>Material och resurser</Text>
              {materials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialItem}
                  onPress={() => handleMaterialPress(material)}
                >
                  <View style={styles.materialIcon}>
                    <FileText size={20} color="#4ECDC4" />
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{material.title}</Text>
                    <Text style={styles.materialDescription} numberOfLines={2}>
                      {material.description}
                    </Text>
                    <View style={styles.materialMeta}>
                      <Text style={styles.materialType}>{material.material_type}</Text>
                      {material.is_required && (
                        <Text style={styles.requiredBadge}>Obligatorisk</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Exercises */}
          {exercises.length > 0 && (
            <View style={styles.exercisesCard}>
              <Text style={styles.exercisesTitle}>Övningar</Text>
              {exercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseItem}
                >
                  <View style={styles.exerciseIcon}>
                    <Play size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseDescription} numberOfLines={2}>
                      {exercise.description}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseType}>{exercise.exercise_type}</Text>
                      <Text style={styles.exercisePoints}>• {exercise.points} poäng</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  lessonIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lessonType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  progressCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#4ECDC4',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressActions: {
    alignItems: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  objectivesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  objectivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  objective: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
    lineHeight: 20,
  },
  contentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
  contentH1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginVertical: 8,
  },
  contentH2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginVertical: 6,
  },
  contentText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  contentBullet: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginLeft: 16,
  },
  contentSpacing: {
    height: 8,
  },
  materialsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  materialsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  requiredBadge: {
    fontSize: 10,
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600' as const,
  },
  exercisesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  exercisePoints: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});