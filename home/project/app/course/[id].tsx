import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Clock, Play, CheckCircle, Circle, ArrowRight, FileText, Award } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_hours: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  lesson_type: string;
  order_index: number;
  estimated_minutes: number;
  learning_objectives: string[];
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
    progress_percentage: number;
  };
}

interface StudyGuide {
  id: string;
  title: string;
  description: string;
  guide_type: string;
  estimated_read_time: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  total_points: number;
  passing_score: number;
  time_limit_minutes: number;
}

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'modules' | 'guides' | 'assessments'>('modules');

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // Load course info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (
            *,
            user_lesson_progress (
              status,
              progress_percentage
            )
          )
        `)
        .eq('course_id', id)
        .eq('course_lessons.user_lesson_progress.user_id', user?.id)
        .order('order_index');

      if (modulesError) throw modulesError;

      const formattedModules = modulesData.map(module => ({
        ...module,
        lessons: module.course_lessons
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            ...lesson,
            progress: lesson.user_lesson_progress?.[0] || { status: 'not_started', progress_percentage: 0 }
          }))
      }));

      setModules(formattedModules);

      // Load study guides
      const { data: guidesData, error: guidesError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('course_id', id)
        .eq('is_published', true);

      if (guidesError) throw guidesError;
      setStudyGuides(guidesData || []);

      // Load assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('course_assessments')
        .select('*')
        .eq('course_id', id)
        .eq('is_published', true);

      if (assessmentsError) throw assessmentsError;
      setAssessments(assessmentsData || []);

    } catch (error) {
      console.error('Error loading course data:', error);
      Alert.alert('Fel', 'Kunde inte ladda kursdata');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    router.push(`/lesson/${lesson.id}`);
  };

  const handleStudyGuidePress = (guide: StudyGuide) => {
    router.push(`/study-guide/${guide.id}`);
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#10B981" />;
      case 'in_progress':
        return <Play size={20} color="#F59E0B" />;
      default:
        return <Circle size={20} color="#9CA3AF" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      default:
        return '#E5E7EB';
    }
  };

  const calculateCourseProgress = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    if (allLessons.length === 0) return 0;
    
    const completedLessons = allLessons.filter(l => l.progress?.status === 'completed').length;
    return Math.round((completedLessons / allLessons.length) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar kurs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kursen kunde inte hittas</Text>
        </View>
      </SafeAreaView>
    );
  }

  const courseProgress = calculateCourseProgress();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce((sum, m) => 
    sum + m.lessons.filter(l => l.progress?.status === 'completed').length, 0
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: course.title,
          headerStyle: { backgroundColor: '#4ECDC4' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Course Header */}
          <View style={styles.header}>
            <View style={styles.courseIcon}>
              <BookOpen size={32} color="#fff" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseSubject}>{course.subject} • {course.level}</Text>
              <Text style={styles.courseDescription}>{course.description}</Text>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Framsteg</Text>
              <Text style={styles.progressPercentage}>{courseProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${courseProgress}%` }
                ]} 
              />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressText}>
                {completedLessons} av {totalLessons} lektioner slutförda
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'modules' && styles.tabActive]}
              onPress={() => setSelectedTab('modules')}
            >
              <Text style={[styles.tabText, selectedTab === 'modules' && styles.tabTextActive]}>
                Lektioner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'guides' && styles.tabActive]}
              onPress={() => setSelectedTab('guides')}
            >
              <Text style={[styles.tabText, selectedTab === 'guides' && styles.tabTextActive]}>
                Studiehjälp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'assessments' && styles.tabActive]}
              onPress={() => setSelectedTab('assessments')}
            >
              <Text style={[styles.tabText, selectedTab === 'assessments' && styles.tabTextActive]}>
                Prov
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {selectedTab === 'modules' && (
              <View>
                {modules.map((module) => (
                  <View key={module.id} style={styles.moduleCard}>
                    <View style={styles.moduleHeader}>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <Text style={styles.moduleDescription}>{module.description}</Text>
                      <View style={styles.moduleStats}>
                        <Clock size={14} color="#7f8c8d" />
                        <Text style={styles.moduleStatsText}>~{module.estimated_hours}h</Text>
                      </View>
                    </View>
                    
                    <View style={styles.lessons}>
                      {module.lessons.map((lesson) => (
                        <TouchableOpacity
                          key={lesson.id}
                          style={styles.lessonItem}
                          onPress={() => handleLessonPress(lesson)}
                        >
                          <View style={styles.lessonLeft}>
                            {getProgressIcon(lesson.progress?.status || 'not_started')}
                            <View style={styles.lessonInfo}>
                              <Text style={styles.lessonTitle}>{lesson.title}</Text>
                              <Text style={styles.lessonDescription} numberOfLines={2}>
                                {lesson.description}
                              </Text>
                              <View style={styles.lessonMeta}>
                                <Clock size={12} color="#9CA3AF" />
                                <Text style={styles.lessonDuration}>
                                  {lesson.estimated_minutes} min
                                </Text>
                                <Text style={styles.lessonType}>
                                  • {lesson.lesson_type}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <ArrowRight size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedTab === 'guides' && (
              <View>
                {studyGuides.map((guide) => (
                  <TouchableOpacity
                    key={guide.id}
                    style={styles.guideCard}
                    onPress={() => handleStudyGuidePress(guide)}
                  >
                    <View style={styles.guideIcon}>
                      <FileText size={24} color="#4ECDC4" />
                    </View>
                    <View style={styles.guideInfo}>
                      <Text style={styles.guideTitle}>{guide.title}</Text>
                      <Text style={styles.guideDescription} numberOfLines={2}>
                        {guide.description}
                      </Text>
                      <View style={styles.guideMeta}>
                        <Clock size={12} color="#9CA3AF" />
                        <Text style={styles.guideReadTime}>
                          ~{guide.estimated_read_time} min läsning
                        </Text>
                        <Text style={styles.guideType}>• {guide.guide_type}</Text>
                      </View>
                    </View>
                    <ArrowRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
                {studyGuides.length === 0 && (
                  <View style={styles.emptyState}>
                    <FileText size={48} color="#E5E7EB" />
                    <Text style={styles.emptyText}>Inga studiehjälpmedel tillgängliga</Text>
                  </View>
                )}
              </View>
            )}

            {selectedTab === 'assessments' && (
              <View>
                {assessments.map((assessment) => (
                  <TouchableOpacity
                    key={assessment.id}
                    style={styles.assessmentCard}
                  >
                    <View style={styles.assessmentIcon}>
                      <Award size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.assessmentInfo}>
                      <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                      <Text style={styles.assessmentDescription} numberOfLines={2}>
                        {assessment.description}
                      </Text>
                      <View style={styles.assessmentMeta}>
                        <Text style={styles.assessmentPoints}>
                          {assessment.total_points} poäng
                        </Text>
                        <Text style={styles.assessmentTime}>
                          • {assessment.time_limit_minutes} min
                        </Text>
                        <Text style={styles.assessmentType}>
                          • {assessment.assessment_type}
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
                {assessments.length === 0 && (
                  <View style={styles.emptyState}>
                    <Award size={48} color="#E5E7EB" />
                    <Text style={styles.emptyText}>Inga prov tillgängliga</Text>
                  </View>
                )}
              </View>
            )}
          </View>
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
  courseIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
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
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressStats: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#7f8c8d',
  },
  tabTextActive: {
    color: '#4ECDC4',
    fontWeight: '600' as const,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeader: {
    marginBottom: 16,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleStatsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  lessons: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lessonType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  guideMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideReadTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  guideType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  assessmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assessmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  assessmentDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  assessmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assessmentPoints: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assessmentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assessmentType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});