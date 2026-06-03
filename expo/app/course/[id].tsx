import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Platform,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Clock, 
  ChevronRight,
  ChevronUp,
  ChevronDown, 
  Play,
  CheckCircle,
  Circle,
  FileText,
  Target,
  TrendingUp,
  Lock,
  Award,
  Edit3,
  X as CloseIcon,
  Brain,
  Sparkles,
  Zap,
  Trophy,
  RefreshCw,
  AlertCircle,
  HelpCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { Database } from '@/lib/database.types';
import { AIStudyInsights, AIQuickHelp } from '@/components/AIStudyInsights';
import CourseAIChat from '@/components/CourseAIChat';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import { Crown } from 'lucide-react-native';
import CourseExamsSection from '@/components/CourseExamsSection';

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
  const freemium = useFreemiumLimits();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userProgress, setUserProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [courseStyle, setCourseStyle] = useState<CourseStyle>(courseStyles.default);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [userCourseData, setUserCourseData] = useState<any>(null);
  const [showContent, setShowContent] = useState(false);
  const [editCurrentGrade, setEditCurrentGrade] = useState<string>('');
  const [editSelfEvaluation, setEditSelfEvaluation] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'progress' | 'grades' | 'eval' | 'notes'>('progress');

  const isFirstMount = useRef(true);
  const previousId = useRef<string | undefined>(undefined);

  const loadCourseData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      console.log('Loading course data for ID:', id);

      // Try to find course by ID directly first, then by course_code
      let courseData: any = null;
      let courseError = null;
      let isUniversity = false;

      console.log('🔍 Searching for course with ID:', id);

      // First try gymnasium courses table by ID
      const { data: directData, error: directError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (directData) {
        courseData = directData;
        console.log('✅ Found gymnasium course by ID:', id, directData.title);
      } else {
        // Try finding gymnasium course by course_code
        const { data: codeData, error: codeError } = await supabase
          .from('courses')
          .select('*')
          .eq('course_code', id)
          .maybeSingle();

        if (codeData) {
          courseData = codeData;
          console.log('✅ Found gymnasium course by course_code:', id, codeData.title);
        } else {
          // Try university courses table by ID
          console.log('🔍 Trying university_courses table...');
          const { data: uniData, error: uniError } = await supabase
            .from('university_courses')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (uniData) {
            courseData = {
              id: uniData.id,
              title: uniData.title,
              description: uniData.description,
              subject: uniData.subject_area || 'Högskola',
              level: 'högskola',
              resources: [],
              tips: [],
              related_courses: []
            };
            isUniversity = true;
            console.log('✅ Found university course:', id, uniData.title);
          } else {
            // Try by course_code in university_courses
            const { data: uniCodeData, error: uniCodeError } = await supabase
              .from('university_courses')
              .select('*')
              .eq('course_code', id)
              .maybeSingle();

            if (uniCodeData) {
              courseData = {
                id: uniCodeData.id,
                title: uniCodeData.title,
                description: uniCodeData.description,
                subject: uniCodeData.subject_area || 'Högskola',
                level: 'högskola',
                resources: [],
                tips: [],
                related_courses: []
              };
              isUniversity = true;
              console.log('✅ Found university course by course_code:', id, uniCodeData.title);
            } else {
              // Last resort: try searching with ILIKE for partial matches
              const { data: searchData } = await supabase
                .from('courses')
                .select('*')
                .or(`id.ilike.%${id}%,course_code.ilike.%${id}%`)
                .limit(1)
                .maybeSingle();
              
              if (searchData) {
                courseData = searchData;
                console.log('✅ Found course by partial match:', id, searchData.title);
              } else {
                courseError = directError || codeError || uniError || uniCodeError;
                console.error('❌ Course not found by ID or course_code:', id);
                console.error('Searched in: courses (id), courses (code), university_courses (id), university_courses (code), courses (partial)');
              }
            }
          }
        }
      }

      if (!courseData) {
        console.error('❌ Error loading course:', courseError);
        console.error('📋 Course ID attempted:', id);
        Alert.alert(
          'Kurs ej hittad', 
          `Kunde inte hitta kursen med ID: ${id}\n\nDenna kurs har eventuellt inte skapats i databasen ännu.`
        );
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }



      setCourse(courseData);
      const actualCourseId = courseData.id;
      console.log('📌 Using actual course ID:', actualCourseId);

      if (courseData && courseData.subject) {
        setCourseStyle(getCourseStyle(courseData.subject));
      }

      // Load user course data from appropriate table
      if (isUniversity) {
        const { data: userCourse, error: userCourseError } = await supabase
          .from('user_university_courses')
          .select('*')
          .eq('user_id', user!.id)
          .eq('course_id', actualCourseId)
          .maybeSingle();

        if (userCourseError && userCourseError.code !== 'PGRST116') {
          console.error('Error loading user university course:', userCourseError);
        }
        
        if (userCourse) {
          console.log('✅ Found user university course enrollment');
          setUserCourseData(userCourse);
          setEditProgress(userCourse?.progress?.toString() || '0');
        } else {
          console.log('ℹ️ No enrollment found, creating...');
          // Create enrollment if missing
          const { data: newEnrollment, error: createError } = await supabase
            .from('user_university_courses')
            .insert({
              user_id: user!.id,
              course_id: actualCourseId,
              progress: 0,
              is_active: true
            } as any)
            .select()
            .single();
          
          if (!createError && newEnrollment) {
            console.log('✅ Created user university course enrollment');
            setUserCourseData(newEnrollment);
            setEditProgress('0');
          } else {
            console.error('❌ Failed to create enrollment:', createError);
          }
        }
      } else {
        const { data: userCourse, error: userCourseError } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', user!.id)
          .eq('course_id', actualCourseId)
          .maybeSingle();

        if (userCourseError && userCourseError.code !== 'PGRST116') {
          console.error('Error loading user course:', userCourseError);
        }
        
        if (userCourse) {
          console.log('✅ Found user course enrollment');
          setUserCourseData(userCourse);
          setEditProgress(userCourse?.progress?.toString() || '0');
          setEditTargetGrade(userCourse?.target_grade || '');
          setEditCurrentGrade((userCourse as any)?.current_grade || '');
          setEditSelfEvaluation((userCourse as any)?.self_evaluation || 0);
          setEditNotes((userCourse as any)?.notes || '');
        } else {
          console.log('ℹ️ No enrollment found for gymnasium course');
        }
      }

      console.log('🔍 Fetching modules for course:', actualCourseId);
      
      // Load modules from appropriate table
      let modulesData = null;
      let modulesError = null;
      
      if (isUniversity) {
        const { data, error } = await supabase
          .from('university_course_modules')
          .select(`
            *,
            university_course_lessons (
              *,
              user_university_lesson_progress (
                *
              )
            )
          `)
          .eq('course_id', actualCourseId)
          .eq('is_published', true)
          .order('order_index');
        modulesData = data;
        modulesError = error;
      } else {
        const { data, error } = await supabase
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
          .eq('course_id', actualCourseId)
          .eq('is_published', true)
          .order('order_index');
        modulesData = data;
        modulesError = error;
      }

      console.log('📦 Modules data:', modulesData?.length || 0, 'modules found');
      if (modulesError) console.log('❌ Modules error:', modulesError);

      if (modulesError) {
        console.error('Error loading modules:', modulesError);
      }

      const processedModules: ModuleWithLessons[] = (modulesData?.map(module => {
        const moduleLessons = isUniversity 
          ? (module as any).university_course_lessons 
          : (module as any).course_lessons;
        const progressKey = isUniversity ? 'user_university_lesson_progress' : 'user_lesson_progress';
        
        return {
          ...module,
          description: module.description || '',
          lessons: (moduleLessons || [])
            .filter((lesson: any) => lesson.is_published)
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((lesson: any) => ({
              ...lesson,
              progress: lesson[progressKey]?.find(
                (p: any) => p.user_id === user?.id
              )
            }))
        };
      }) || []) as ModuleWithLessons[];
      
      console.log('✅ Processed modules:', processedModules.length);
      const totalLessonCount = processedModules.reduce((sum, m) => sum + m.lessons.length, 0);
      console.log('📝 Total lessons found:', totalLessonCount);
      
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

      const { data: guidesData, error: guidesError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('course_id', actualCourseId)
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
      setIsRefreshing(false);
    }
  }, [id, user, fadeAnim, slideAnim]);

  useEffect(() => {
    if (id && user?.id) {
      console.log('🔄 Course ID changed or initial mount:', id);
      loadCourseData();
    }
  }, [id, user?.id, loadCourseData]);
  
  useFocusEffect(
    useCallback(() => {
      const shouldReload = !isFirstMount.current || previousId.current !== id;
      
      if (id && user?.id && shouldReload) {
        console.log('📍 Course screen focused, reloading data for:', id);
        loadCourseData();
      }
      
      isFirstMount.current = false;
      previousId.current = id;
      
      return () => {
        console.log('📍 Course screen unfocused');
      };
    }, [id, user?.id, loadCourseData])
  );

  const onRefresh = useCallback(() => {
    loadCourseData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const navigateToLesson = (lesson: CourseLesson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lesson.id}` as any);
  };

  const navigateToStudyGuide = (guide: StudyGuide) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/study-guide/${guide.id}` as any);
  };



  const handleSaveProgress = async () => {
    try {
      const progressValue = parseInt(editProgress, 10);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        Alert.alert('Fel', 'Framsteg måste vara ett tal mellan 0 och 100');
        return;
      }

      const isUniversityCourse = course?.level === 'högskola';

      if (isUniversityCourse) {
        const { error } = await supabase
          .from('user_university_courses')
          .update({
            progress: progressValue,
            current_grade: editCurrentGrade || null,
            self_evaluation: editSelfEvaluation || null,
            notes: editNotes || null
          } as any)
          .eq('user_id', user!.id)
          .eq('course_id', id || '');
        if (error) {
          console.error('Error updating university course:', error);
          Alert.alert('Fel', 'Kunde inte uppdatera kursen');
          return;
        }
      } else {
        const { error } = await supabase
          .from('user_courses')
          .update({
            progress: progressValue,
            target_grade: editTargetGrade || null,
            current_grade: editCurrentGrade || null,
            self_evaluation: editSelfEvaluation || null,
            notes: editNotes || null
          } as any)
          .eq('user_id', user!.id)
          .eq('course_id', id || '');
        if (error) {
          console.error('Error updating course:', error);
          Alert.alert('Fel', 'Kunde inte uppdatera kursen');
          return;
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          headerBackTitle: 'Kurser',
          headerStyle: { backgroundColor: courseStyle.primaryColor },
          headerTintColor: 'white'
        }} 
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
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



        {/* Status Card */}
        {userCourseData && (
          <TouchableOpacity
            style={styles.statusCard}
            onPress={() => { setActiveTab('progress'); setShowEditModal(true); }}
            activeOpacity={0.85}
          >
            <View style={styles.statusCardHeader}>
              <Text style={[styles.statusCardTitle, { color: theme.colors.text }]}>Mina mål & anteckningar</Text>
              <View style={[styles.statusEditBtn, { backgroundColor: courseStyle.primaryColor + '18' }]}>
                <Edit3 size={14} color={courseStyle.primaryColor} />
                <Text style={[styles.statusEditBtnText, { color: courseStyle.primaryColor }]}>Redigera</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>Nuv. betyg</Text>
                <View style={[styles.gradePill, { backgroundColor: (userCourseData as any)?.current_grade ? courseStyle.primaryColor : theme.colors.borderLight }]}>
                  <Text style={[styles.gradePillText, { color: (userCourseData as any)?.current_grade ? 'white' : theme.colors.textMuted }]}>
                    {(userCourseData as any)?.current_grade || '–'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>Målbetyg</Text>
                <View style={[styles.gradePill, { backgroundColor: userCourseData?.target_grade ? courseStyle.primaryColor + '20' : theme.colors.borderLight }]}>
                  <Text style={[styles.gradePillText, { color: userCourseData?.target_grade ? courseStyle.primaryColor : theme.colors.textMuted }]}>
                    {userCourseData?.target_grade || '–'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>Självvärdering</Text>
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map(s => (
                    <Text key={s} style={[styles.starSmall, { opacity: s <= ((userCourseData as any)?.self_evaluation || 0) ? 1 : 0.25 }]}>★</Text>
                  ))}
                </View>
              </View>
            </View>
            {(userCourseData as any)?.notes ? (
              <View style={[styles.notesPreview, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.notesPreviewText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {(userCourseData as any).notes}
                </Text>
              </View>
            ) : (
              <Text style={[styles.notesEmpty, { color: theme.colors.textMuted }]}>Tryck för att lägga till anteckningar...</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.heroSection}>
          <TouchableOpacity
            style={[styles.flashcardsHeroCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/flashcards-v2/${id}` as any);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[courseStyle.primaryColor, courseStyle.gradient[1]] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.flashcardsGradient}
            >
              <View style={styles.flashcardsIconBg}>
                <Brain size={48} color="white" strokeWidth={2.5} />
              </View>
              <View style={styles.flashcardsContent}>
                <View style={styles.flashcardsBadge}>
                  <Sparkles size={14} color="white" />
                  <Text style={styles.flashcardsBadgeText}>AI-POWERED</Text>
                </View>
                <Text style={styles.flashcardsTitle}>Flashcards</Text>
                <Text style={styles.flashcardsDescription}>
                  Träna och memorera med AI-genererade flashcards anpassade för din kurs
                </Text>
                <View style={styles.flashcardsAction}>
                  <Text style={styles.flashcardsActionText}>Börja träna</Text>
                  <ChevronRight size={20} color="white" strokeWidth={3} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.flashcardsHeroCard, { backgroundColor: theme.colors.card, marginTop: 16 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/course-quiz/${id}` as any);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#F59E0B', '#EF4444'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.flashcardsGradient}
            >
              <View style={styles.flashcardsIconBg}>
                <HelpCircle size={48} color="white" strokeWidth={2.5} />
              </View>
              <View style={styles.flashcardsContent}>
                <View style={styles.flashcardsBadge}>
                  <Sparkles size={14} color="white" />
                  <Text style={styles.flashcardsBadgeText}>AI-POWERED</Text>
                </View>
                <Text style={styles.flashcardsTitle}>Quiz</Text>
                <Text style={styles.flashcardsDescription}>
                  Testa dina kunskaper med AI-genererade flervalsfrågor för din kurs
                </Text>
                <View style={styles.flashcardsAction}>
                  <Text style={styles.flashcardsActionText}>Starta Quiz</Text>
                  <ChevronRight size={20} color="white" strokeWidth={3} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <CourseExamsSection
          courseId={id || ''}
          courseTitle={course.title}
          accentColor={courseStyle.primaryColor}
        />

        <View style={styles.aiSection}>
          <View style={styles.aiSectionHeader}>
            <Sparkles size={24} color={courseStyle.primaryColor} />
            <Text style={[styles.aiSectionTitle, { color: theme.colors.text }]}>AI-Assisterad Inlärning</Text>
          </View>
          
          <AIStudyInsights
            courseTitle={course.title}
            courseDescription={course.description}
            progress={userCourseData?.progress || 0}
            totalLessons={userProgress.total}
            completedLessons={userProgress.completed}
            courseStyle={courseStyle}
          />

          <AIQuickHelp
            courseTitle={course.title}
            courseStyle={courseStyle}
            onAskQuestion={(question) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/ai-chat?question=${encodeURIComponent(question)}&course=${encodeURIComponent(course.title)}` as any);
            }}
          />

          <CourseAIChat
            courseTitle={course.title}
            accentColor={courseStyle.primaryColor}
            compact
          />
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

        <View style={styles.contentSection}>
          <TouchableOpacity
            style={[styles.contentToggle, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowContent(!showContent);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.contentToggleLeft}>
              <BookOpen size={20} color={theme.colors.textMuted} />
              <Text style={[styles.contentToggleTitle, { color: theme.colors.text }]}>Kursinnehåll & Lektioner</Text>
            </View>
            <View style={styles.contentToggleRight}>
              <Text style={[styles.contentToggleCount, { color: theme.colors.textSecondary }]}>
                {modules.length} moduler · {userProgress.total} lektioner
              </Text>
              {showContent ? (
                <ChevronUp size={20} color={theme.colors.textMuted} />
              ) : (
                <ChevronDown size={20} color={theme.colors.textMuted} />
              )}
            </View>
          </TouchableOpacity>

          {showContent && (
            <Animated.View style={styles.contentCollapse}>
              {modules.map((module, moduleIndex) => {
                const moduleLimit = freemium.checkCourseModule(moduleIndex);
                const isModuleLocked = !moduleLimit.isAllowed;

                return (
            <View key={module.id} style={[styles.moduleCard, { backgroundColor: theme.colors.card }, isModuleLocked && { opacity: 0.6 }]}>
              <View style={[styles.moduleHeader, { borderBottomColor: theme.colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.moduleTitle, { color: theme.colors.text, flex: 1 }]}>
                    {moduleIndex + 1}. {module.title}
                  </Text>
                  {isModuleLocked && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700' + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 }}>
                      <Crown size={12} color="#FFD700" />
                      <Text style={{ fontSize: 11, fontWeight: '700' as const, color: '#FFD700' }}>Premium</Text>
                    </View>
                  )}
                </View>
                {module.description && <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>{module.description}</Text>}
                <Text style={[styles.moduleHours, { color: theme.colors.textMuted }]}>{module.estimated_hours}h uppskattad tid</Text>
              </View>
              
              {!isModuleLocked && (
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
              )}
              {isModuleLocked && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => router.push('/premium' as any)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFD700' + '15', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                    activeOpacity={0.7}
                  >
                    <Lock size={14} color="#FFD700" />
                    <Text style={{ fontSize: 13, fontWeight: '600' as const, color: '#FFD700' }}>Lås upp med Premium</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
                );
              })}
            </Animated.View>
          )}
        </View>

        {modules.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <BookOpen size={48} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inget innehåll tillgängligt</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Kursinnehåll med moduler och lektioner har inte lagts till för denna kurs ännu.
            </Text>
            <View style={styles.emptyInfoCard}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={[styles.emptyInfoText, { color: theme.colors.textSecondary }]}>
                Kursen fungerar fortfarande för flashcards och studieplanering.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
              onPress={onRefresh}
            >
              <RefreshCw size={18} color="white" />
              <Text style={styles.refreshButtonText}>Uppdatera</Text>
            </TouchableOpacity>
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
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
            {/* Drag Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBg, { backgroundColor: courseStyle.primaryColor + '18' }]}>
                <Text style={styles.sheetHeaderEmoji}>{courseStyle.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Redigera kurs</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.colors.textMuted }]}>{course?.title}</Text>
              </View>
              <TouchableOpacity
                style={[styles.sheetCloseBtn, { backgroundColor: theme.colors.surface }]}
                onPress={() => setShowEditModal(false)}
              >
                <CloseIcon size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
              {[
                { key: 'progress', label: 'Framsteg', emoji: '📊' },
                { key: 'grades', label: 'Betyg', emoji: '🎯' },
                { key: 'eval', label: 'Värdering', emoji: '⭐' },
                { key: 'notes', label: 'Anteckningar', emoji: '📝' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tabItem,
                    activeTab === tab.key && { backgroundColor: courseStyle.primaryColor }
                  ]}
                  onPress={() => { setActiveTab(tab.key as any); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                  <Text style={[styles.tabLabel, { color: activeTab === tab.key ? 'white' : theme.colors.textSecondary }]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {activeTab === 'progress' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>Hur långt har du kommit?</Text>
                  <View style={[styles.progressDisplayBox, { backgroundColor: courseStyle.primaryColor + '12', borderColor: courseStyle.primaryColor + '30' }]}>
                    <Text style={[styles.progressBigNumber, { color: courseStyle.primaryColor }]}>{editProgress}%</Text>
                    <Text style={[styles.progressBigLabel, { color: theme.colors.textMuted }]}>slutfört</Text>
                  </View>
                  <View style={[styles.progressBarEdit, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.progressBarFillEdit, { width: `${Math.max(0, Math.min(100, parseInt(editProgress) || 0))}%`, backgroundColor: courseStyle.primaryColor }]} />
                  </View>
                  <View style={styles.progressControls}>
                    {[0, 10, 25, 50, 75, 90, 100].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.progressChip,
                          { borderColor: theme.colors.border },
                          editProgress === String(val) && { backgroundColor: courseStyle.primaryColor, borderColor: courseStyle.primaryColor }
                        ]}
                        onPress={() => { setEditProgress(String(val)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      >
                        <Text style={[styles.progressChipText, { color: editProgress === String(val) ? 'white' : theme.colors.text }]}>{val}%</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.progressManualRow}>
                    <TouchableOpacity
                      style={[styles.progressStepBtn, { backgroundColor: theme.colors.surface }]}
                      onPress={() => { const v = Math.max(0, (parseInt(editProgress) || 0) - 1); setEditProgress(String(v)); }}
                    >
                      <Text style={[styles.progressStepBtnText, { color: theme.colors.text }]}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.progressManualInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                      value={editProgress}
                      onChangeText={setEditProgress}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={[styles.progressStepBtn, { backgroundColor: theme.colors.surface }]}
                      onPress={() => { const v = Math.min(100, (parseInt(editProgress) || 0) + 1); setEditProgress(String(v)); }}
                    >
                      <Text style={[styles.progressStepBtnText, { color: theme.colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeTab === 'grades' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>Betygsättning</Text>
                  <View style={styles.gradeSection}>
                    <Text style={[styles.gradeSectionLabel, { color: theme.colors.textSecondary }]}>Nuvarande betyg</Text>
                    <Text style={[styles.gradeSectionHint, { color: theme.colors.textMuted }]}>Vilket betyg har du fått hittills?</Text>
                    <View style={styles.gradeRow}>
                      {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                        <TouchableOpacity
                          key={grade}
                          style={[
                            styles.gradePillBtn,
                            { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                            editCurrentGrade === grade && { backgroundColor: courseStyle.primaryColor, borderColor: courseStyle.primaryColor }
                          ]}
                          onPress={() => { setEditCurrentGrade(grade === editCurrentGrade ? '' : grade); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        >
                          <Text style={[styles.gradePillBtnText, { color: editCurrentGrade === grade ? 'white' : theme.colors.text }]}>{grade}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={[styles.gradeDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.gradeSection}>
                    <Text style={[styles.gradeSectionLabel, { color: theme.colors.textSecondary }]}>Målbetyg</Text>
                    <Text style={[styles.gradeSectionHint, { color: theme.colors.textMuted }]}>Vilket betyg siktar du på?</Text>
                    <View style={styles.gradeRow}>
                      {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                        <TouchableOpacity
                          key={grade}
                          style={[
                            styles.gradePillBtn,
                            { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                            editTargetGrade === grade && { backgroundColor: courseStyle.primaryColor + '25', borderColor: courseStyle.primaryColor }
                          ]}
                          onPress={() => { setEditTargetGrade(grade === editTargetGrade ? '' : grade); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        >
                          <Text style={[styles.gradePillBtnText, { color: editTargetGrade === grade ? courseStyle.primaryColor : theme.colors.text }]}>{grade}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'eval' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>Självvärdering</Text>
                  <Text style={[styles.evalSubtitle, { color: theme.colors.textSecondary }]}>Hur väl behärskar du kursen?</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => { setEditSelfEvaluation(star === editSelfEvaluation ? 0 : star); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                        style={styles.starButton}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.starLarge,
                          { color: star <= editSelfEvaluation ? '#F59E0B' : theme.colors.border }
                        ]}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[styles.evalLabel, { color: courseStyle.primaryColor }]}>
                    {editSelfEvaluation === 0 ? 'Ej värderad' :
                     editSelfEvaluation === 1 ? 'Nybörjare – Behöver mycket hjälp' :
                     editSelfEvaluation === 2 ? 'Grundläggande – Förstår det mesta' :
                     editSelfEvaluation === 3 ? 'Medel – Klarar de flesta uppgifter' :
                     editSelfEvaluation === 4 ? 'Bra – Behärskar kursen väl' :
                     'Utmärkt – Fullständig behärskning'}
                  </Text>
                  <View style={styles.evalCardsRow}>
                    {[
                      { val: 1, label: 'Nybörjare', emoji: '🌱' },
                      { val: 2, label: 'Grundläggande', emoji: '📖' },
                      { val: 3, label: 'Medel', emoji: '💡' },
                      { val: 4, label: 'Bra', emoji: '🚀' },
                      { val: 5, label: 'Utmärkt', emoji: '🏆' },
                    ].map(item => (
                      <TouchableOpacity
                        key={item.val}
                        style={[
                          styles.evalCard,
                          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                          editSelfEvaluation === item.val && { borderColor: courseStyle.primaryColor, backgroundColor: courseStyle.primaryColor + '12' }
                        ]}
                        onPress={() => { setEditSelfEvaluation(item.val === editSelfEvaluation ? 0 : item.val); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      >
                        <Text style={styles.evalCardEmoji}>{item.emoji}</Text>
                        <Text style={[styles.evalCardLabel, { color: editSelfEvaluation === item.val ? courseStyle.primaryColor : theme.colors.text }]}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'notes' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>Anteckningar</Text>
                  <Text style={[styles.evalSubtitle, { color: theme.colors.textSecondary }]}>Skriv dina egna tankar, mål eller påminnelser</Text>
                  <TextInput
                    style={[
                      styles.notesInput,
                      { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }
                    ]}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    multiline
                    numberOfLines={10}
                    placeholder="T.ex. 'Behöver repetera kapitel 3', 'Fråga läraren om derivatan', 'Plugga inför provet den 15e'..."
                    placeholderTextColor={theme.colors.textMuted}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>{editNotes.length} tecken</Text>
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.sheetFooter, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.sheetCancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.sheetCancelBtnText, { color: theme.colors.text }]}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetSaveBtn, { backgroundColor: courseStyle.primaryColor }]}
                onPress={handleSaveProgress}
              >
                <CheckCircle size={18} color="white" />
                <Text style={styles.sheetSaveBtnText}>Spara ändringar</Text>
              </TouchableOpacity>
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
    marginBottom: 20,
  },
  courseHeader: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
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
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  moduleHeader: {
    padding: 24,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
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
    padding: 20,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    paddingVertical: 48,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  emptyInfoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
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
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'white',
  },
  statusCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  statusEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusEditBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statusDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  gradePill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradePillText: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starSmall: {
    fontSize: 13,
    color: '#F59E0B',
  },
  notesPreview: {
    borderRadius: 10,
    padding: 12,
  },
  notesPreviewText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic' as const,
  },
  notesEmpty: {
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  sheetIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeaderEmoji: {
    fontSize: 22,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 2,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  sheetBody: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  progressDisplayBox: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  progressBigNumber: {
    fontSize: 56,
    fontWeight: '900' as const,
    letterSpacing: -2,
  },
  progressBigLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: -4,
  },
  progressBarEdit: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFillEdit: {
    height: '100%',
    borderRadius: 4,
  },
  progressControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  progressChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  progressChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressManualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressStepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepBtnText: {
    fontSize: 22,
    fontWeight: '300' as const,
  },
  progressManualInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  gradeSection: {
    marginBottom: 8,
  },
  gradeSectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 16,
  },
  gradeSectionHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradePillBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradePillBtnText: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  gradeDivider: {
    height: 1,
    marginVertical: 4,
  },
  evalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  starLarge: {
    fontSize: 44,
  },
  evalLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  evalCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evalCard: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  evalCardEmoji: {
    fontSize: 22,
  },
  evalCardLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  sheetFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  sheetCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sheetSaveBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetSaveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'white',
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
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  flashcardsHeroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  flashcardsGradient: {
    padding: 28,
    minHeight: 200,
    position: 'relative',
  },
  flashcardsIconBg: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  flashcardsContent: {
    position: 'relative',
    zIndex: 1,
  },
  flashcardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  flashcardsBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  flashcardsTitle: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: 'white',
    marginBottom: 12,
    letterSpacing: -1,
  },
  flashcardsDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
    marginBottom: 20,
  },
  flashcardsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashcardsActionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: 'white',
  },
  aiSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aiSectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  contentSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  contentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contentToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contentToggleTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  contentToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentToggleCount: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  contentCollapse: {
    gap: 0,
  },
});
