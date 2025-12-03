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
  Animated,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Award,
  Edit3,
  X as CloseIcon,
  Brain,
  Sparkles,
  Zap,
  Trophy
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Database } from '@/lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];

interface ModuleWithLessons {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_hours: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lessons: (CourseLesson & { progress?: UserLessonProgress })[];
}

interface StudyGuide {
  id: string;
  course_id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_read_time: number;
  is_published: boolean;
}

interface CourseStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
  lightColor: string;
}

const courseStyles: Record<string, CourseStyle> = {
  'Matematik': { emoji: '📐', gradient: ['#3B82F6', '#2563EB'], primaryColor: '#3B82F6', lightColor: '#DBEAFE' },
  'Svenska': { emoji: '📚', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Engelska': { emoji: '🌍', gradient: ['#10B981', '#059669'], primaryColor: '#10B981', lightColor: '#D1FAE5' },
  'Biologi': { emoji: '🧬', gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Fysik': { emoji: '⚡', gradient: ['#F59E0B', '#D97706'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Kemi': { emoji: '🧪', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Historia': { emoji: '🏛️', gradient: ['#F97316', '#EA580C'], primaryColor: '#F97316', lightColor: '#FFEDD5' },
  'Samhällskunskap': { emoji: '🏛️', gradient: ['#06B6D4', '#0891B2'], primaryColor: '#06B6D4', lightColor: '#CFFAFE' },
  'Idrott och hälsa': { emoji: '⚽', gradient: ['#EF4444', '#DC2626'], primaryColor: '#EF4444', lightColor: '#FEE2E2' },
  'Religionskunskap': { emoji: '🕊️', gradient: ['#A855F7', '#9333EA'], primaryColor: '#A855F7', lightColor: '#F3E8FF' },
  'Naturkunskap': { emoji: '🌿', gradient: ['#22C55E', '#16A34A'], primaryColor: '#22C55E', lightColor: '#DCFCE7' },
  'Geografi': { emoji: '🗺️', gradient: ['#0EA5E9', '#0284C7'], primaryColor: '#0EA5E9', lightColor: '#E0F2FE' },
  'Filosofi': { emoji: '🤔', gradient: ['#64748B', '#475569'], primaryColor: '#64748B', lightColor: '#F1F5F9' },
  'Psykologi': { emoji: '🧠', gradient: ['#D946EF', '#C026D3'], primaryColor: '#D946EF', lightColor: '#FAE8FF' },
  'Företagsekonomi': { emoji: '💼', gradient: ['#84CC16', '#65A30D'], primaryColor: '#84CC16', lightColor: '#ECFCCB' },
  'Juridik': { emoji: '⚖️', gradient: ['#6366F1', '#4F46E5'], primaryColor: '#6366F1', lightColor: '#E0E7FF' },
  'Teknik': { emoji: '⚙️', gradient: ['#78716C', '#57534E'], primaryColor: '#78716C', lightColor: '#F5F5F4' },
  'Programmering': { emoji: '💻', gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Moderna språk': { emoji: '🗣️', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Estetisk kommunikation': { emoji: '🎨', gradient: ['#F43F5E', '#E11D48'], primaryColor: '#F43F5E', lightColor: '#FFE4E6' },
  'Musik': { emoji: '🎵', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Bild': { emoji: '🖼️', gradient: ['#F59E0B', '#D97706'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Dans': { emoji: '💃', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Teater': { emoji: '🎭', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'default': { emoji: '📖', gradient: ['#6366F1', '#4F46E5'], primaryColor: '#6366F1', lightColor: '#E0E7FF' }
};

function getCourseStyle(subject: string): CourseStyle {
  return courseStyles[subject] || courseStyles.default;
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [courseStyle, setCourseStyle] = useState<CourseStyle>(courseStyles.default);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [userCourseData, setUserCourseData] = useState<any>(null);

  useEffect(() => {
    if (id && user?.id) {
      loadCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);
  
  // Reload data when screen becomes focused (e.g., returning from a lesson)
  useFocusEffect(
    useCallback(() => {
      if (id && user?.id) {
        console.log('Screen focused, reloading course data');
        loadCourseData();
      }
    }, [id, user?.id])
  );

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading course data for ID:', id);

      const { data: courseData, error: courseError} = await supabase
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
      if (courseData && courseData.subject) {
        setCourseStyle(getCourseStyle(courseData.subject));
      }

      const { data: userCourse, error: userCourseError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', id || '')
        .single();

      if (userCourseError) {
        console.error('Error loading user course:', userCourseError);
      } else {
        setUserCourseData(userCourse);
        setEditProgress(userCourse?.progress?.toString() || '0');
        setEditTargetGrade(userCourse?.target_grade || '');
      }

      console.log('🔍 Fetching modules for course:', id);
      
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

      console.log('📦 Modules data:', modulesData);
      console.log('❌ Modules error:', modulesError);

      if (modulesError) {
        console.error('Error loading modules:', modulesError);
        Alert.alert('Fel vid laddning av moduler', modulesError.message);
      } else {
        const processedModules: ModuleWithLessons[] = (modulesData?.map(module => ({
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
        })) || []) as ModuleWithLessons[];
        
        console.log('✅ Processed modules:', processedModules.length);
        console.log('📝 Total lessons found:', processedModules.reduce((sum, m) => sum + m.lessons.length, 0));
        
        setModules(processedModules);
        
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

      const { data: guidesData, error: guidesError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('course_id', id || '')
        .eq('is_published', true);

      if (guidesError) {
        console.error('Error loading study guides:', guidesError);
      } else {
        const processedGuides = (guidesData || []).map(guide => ({
          ...guide,
          description: guide.description || ''
        }));
        setStudyGuides(processedGuides as StudyGuide[]);
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

  const handleSaveProgress = async () => {
    try {
      const progressValue = parseInt(editProgress, 10);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        Alert.alert('Fel', 'Progress måste vara ett tal mellan 0 och 100');
        return;
      }

      const { error } = await supabase
        .from('user_courses')
        .update({
          progress: progressValue,
          target_grade: editTargetGrade || null
        })
        .eq('user_id', user!.id)
        .eq('course_id', id || '');

      if (error) {
        console.error('Error updating course:', error);
        Alert.alert('Fel', 'Kunde inte uppdatera kursen');
        return;
      }

      Alert.alert('Framgång! ✅', 'Kursinformation har uppdaterats');
      setShowEditModal(false);
      await loadCourseData();
    } catch (error) {
      console.error('Error in handleSaveProgress:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
      default: return theme.colors.textMuted;
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'reading': return BookOpen;
      case 'exercise': return Target;
      case 'quiz': return Award;
      case 'theory': return BookOpen;
      case 'practical': return Target;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ title: 'Laddar...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar kursinnehåll...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ title: 'Kurs ej hittad', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Kursen kunde inte hittas</Text>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          title: course.title,
          headerShown: true,
          headerStyle: { backgroundColor: courseStyle.primaryColor },
          headerTintColor: 'white'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
        <View style={styles.heroContainer}>
        <LinearGradient
          colors={courseStyle.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.courseHeader}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          
          <View style={styles.courseHeaderContent}>
            {/* Emoji and Title Section */}
            <View style={styles.courseTitleSection}>
              <View style={[styles.emojiContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Text style={styles.courseEmojiLarge}>{courseStyle.emoji}</Text>
              </View>
              <View style={styles.courseTitleContainer}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.subjectBadge}>
                  <Sparkles size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.courseSubject}>{course.subject}</Text>
                </View>
              </View>
            </View>

            {/* Course Description */}
            <Text style={styles.courseDescription}>{course.description}</Text>
            
            {/* Progress Section with Enhanced Design */}
            {userCourseData && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressLabelContainer}>
                    <TrendingUp size={18} color="white" />
                    <Text style={styles.progressLabel}>Din framgång</Text>
                  </View>
                  <View style={styles.progressPercentBadge}>
                    <Text style={styles.progressPercent}>{userCourseData.progress}%</Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { width: `${userCourseData.progress}%` }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.progressTextContainer}>
                  <View style={styles.progressStat}>
                    <CheckCircle size={14} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={styles.progressText}>
                      {userProgress.completed} av {userProgress.total} lektioner
                    </Text>
                  </View>
                  {userCourseData?.target_grade && (
                    <View style={styles.progressStat}>
                      <Trophy size={14} color="#FCD34D" />
                      <Text style={styles.progressText}>
                        Mål: {userCourseData.target_grade}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Quick Stats with Enhanced Design */}
            <View style={styles.quickStatsContainer}>
              <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <BookOpen size={20} color="white" />
                <Text style={styles.quickStatNumber}>{modules.length}</Text>
                <Text style={styles.quickStatLabel}>Moduler</Text>
              </View>
              <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Clock size={20} color="white" />
                <Text style={styles.quickStatNumber}>{modules.reduce((sum, m) => sum + m.estimated_hours, 0)}h</Text>
                <Text style={styles.quickStatLabel}>Uppskattad tid</Text>
              </View>
              <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Zap size={20} color="#FCD34D" />
                <Text style={styles.quickStatNumber}>{userProgress.percentage}%</Text>
                <Text style={styles.quickStatLabel}>Genomfört</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
          onPress={() => setShowEditModal(true)}
        >
          <Edit3 size={20} color={courseStyle.primaryColor} />
        </TouchableOpacity>
        </View>
        </Animated.View>



        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🎯 Snabbåtkomst</Text>
          
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push(`/flashcards/${id}` as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: courseStyle.primaryColor + '20' }]}>
              <Brain size={24} color={courseStyle.primaryColor} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Flashcards</Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>Öva med AI-genererade flashcards</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {studyGuides.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📚 Studiehjälpmedel</Text>
            {studyGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={[styles.guideCard, { backgroundColor: theme.colors.card }]}
                onPress={() => navigateToStudyGuide(guide)}
              >
                <View style={styles.guideInfo}>
                  <Text style={[styles.guideTitle, { color: theme.colors.text }]}>{guide.title}</Text>
                  <Text style={[styles.guideDescription, { color: theme.colors.textSecondary }]}>{guide.description}</Text>
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
                    <Text style={[styles.readTime, { color: theme.colors.textSecondary }]}>{guide.estimated_read_time} min</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📖 Kursinnehåll</Text>
          {modules.map((module, moduleIndex) => (
            <View key={module.id} style={[styles.moduleCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.moduleHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
                  {moduleIndex + 1}. {module.title}
                </Text>
                {module.description && <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>{module.description}</Text>}
                <Text style={[styles.moduleHours, { color: theme.colors.textMuted }]}>{module.estimated_hours}h uppskattad tid</Text>
              </View>
              
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
                        { backgroundColor: theme.colors.surface },
                        isCompleted && { backgroundColor: courseStyle.lightColor, borderColor: courseStyle.primaryColor, borderLeftWidth: 4 },
                        isInProgress && { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning, borderLeftWidth: 4 },
                        isLocked && { backgroundColor: theme.colors.borderLight, opacity: 0.6 }
                      ]}
                      onPress={() => !isLocked && navigateToLesson(lesson)}
                      activeOpacity={isLocked ? 1 : 0.7}
                    >
                      <View style={styles.lessonLeft}>
                        <View style={styles.lessonIconContainer}>
                          {isLocked ? (
                            <Lock size={20} color={theme.colors.textMuted} />
                          ) : isCompleted ? (
                            <CheckCircle size={20} color={courseStyle.primaryColor} />
                          ) : isInProgress ? (
                            <Circle size={20} color={theme.colors.warning} />
                          ) : (
                            <LessonIcon size={20} color={theme.colors.textSecondary} />
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <View style={styles.lessonTitleRow}>
                            <Text style={[
                              styles.lessonTitle,
                              { color: theme.colors.text },
                              isCompleted && { color: courseStyle.primaryColor },
                              isLocked && { color: theme.colors.textMuted }
                            ]}>
                              {lessonIndex + 1}. {lesson.title}
                            </Text>
                            {isLocked && (
                              <View style={[styles.lockedBadge, { backgroundColor: theme.colors.borderLight }]}>
                                <Text style={[styles.lockedBadgeText, { color: theme.colors.textMuted }]}>Låst</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
                            {lesson.description}
                          </Text>
                          <View style={styles.lessonMetadata}>
                            <Text style={[styles.lessonDuration, { color: theme.colors.textMuted }]}>
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
                      <ChevronRight size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {modules.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inget innehåll tillgängligt</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Det finns inget kursinnehåll tillgängligt för denna kurs än.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera kursinformation</Text>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <CloseIcon size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Framståg (%)</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.surface, 
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }]}
                    value={editProgress}
                    onChangeText={setEditProgress}
                    keyboardType="numeric"
                    placeholder="0-100"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Målbetyg</Text>
                  <View style={styles.gradeButtons}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.gradeButton,
                          { borderColor: theme.colors.border },
                          editTargetGrade === grade && {
                            backgroundColor: courseStyle.primaryColor,
                            borderColor: courseStyle.primaryColor
                          }
                        ]}
                        onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}
                      >
                        <Text
                          style={[
                            styles.gradeButtonText,
                            { color: theme.colors.text },
                            editTargetGrade === grade && { color: 'white' }
                          ]}
                        >
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: courseStyle.primaryColor }]}
                  onPress={handleSaveProgress}
                >
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Spara</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    marginBottom: 24,
  },
  courseHeader: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -40,
    left: -50,
  },
  courseHeaderContent: {
    position: 'relative',
    zIndex: 1,
  },
  courseTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  courseEmojiLarge: {
    fontSize: 40,
  },
  courseTitleContainer: {
    flex: 1,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  courseTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 2,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  courseSubject: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
  },
  courseDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    marginBottom: 28,
  },
  progressSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700' as const,
  },
  progressPercentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressPercent: {
    fontSize: 20,
    color: 'white',
    fontWeight: '800' as const,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: 'white',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600' as const,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  guideCard: {
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
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
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
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  readTime: {
    fontSize: 12,
  },
  moduleCard: {
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
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
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
    padding: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gradeButton: {
    flex: 1,
    minWidth: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    borderWidth: 2,
  },
  modalSaveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
  },
});
