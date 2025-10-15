import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCourses } from '@/contexts/CourseContext';
import { usePremium } from '@/contexts/PremiumContext';
import { BookOpen, Clock, TrendingUp, Crown } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DbCourse {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  progress: number;
  user_courses?: {
    progress: number;
    is_active: boolean;
  }[];
}

export default function Courses() {
  const { coursesByYear, userProfile } = useCourses();
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const [selectedYear] = useState<1 | 2 | 3>(userProfile?.year || 1);
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const yearCourses = coursesByYear[selectedYear] || [];

  const loadCoursesFromDb = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📚 Loading courses from database for user:', user.id);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          user_courses!inner(
            progress,
            is_active
          )
        `)
        .eq('user_courses.user_id', user.id)
        .eq('user_courses.is_active', true);

      if (error) {
        console.error('Error loading courses:', error);
        throw error;
      }

      console.log('✅ Loaded', data?.length || 0, 'courses from database');
      setDbCourses(data || []);
    } catch (error) {
      console.error('❌ Failed to load courses:', error);
      Alert.alert('Fel', 'Kunde inte ladda kurser från databasen');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCoursesFromDb();
  }, [loadCoursesFromDb]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Laddar kurser...</Text>
        </View>
      </View>
    );
  }

  const coursesToDisplay = dbCourses.length > 0 ? dbCourses : yearCourses;
  const totalStudyHours = coursesToDisplay.reduce((sum, c) => {
    if ('studiedHours' in c) return sum + (c as any).studiedHours;
    return sum + ((c.user_courses?.[0]?.progress || 0) / 10);
  }, 0);
  const completionPercentage = coursesToDisplay.length > 0
    ? coursesToDisplay.reduce((sum, c) => {
        if ('studiedHours' in c && 'totalHours' in c) {
          const course = c as any;
          return sum + ((course.studiedHours / course.totalHours) * 100);
        }
        return sum + (c.user_courses?.[0]?.progress || 0);
      }, 0) / coursesToDisplay.length
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mina Kurser</Text>
          {isPremium && <Crown size={24} color="#FFD700" />}
        </View>
        <Text style={styles.subtitle}>
          {userProfile?.program} • År {userProfile?.year}
        </Text>
      </View>

      {/* Stats Cards - Same as Home */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>{Math.round(totalStudyHours)}h</Text>
          <Text style={styles.statLabel}>Studerat</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{Math.round(completionPercentage)}%</Text>
          <Text style={styles.statLabel}>Framsteg</Text>
        </View>
        <View style={styles.statCard}>
          <BookOpen size={24} color="#FFD93D" />
          <Text style={styles.statValue}>{coursesToDisplay.length}</Text>
          <Text style={styles.statLabel}>Kurser</Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alla Kurser</Text>
        <TouchableOpacity onPress={loadCoursesFromDb}>
          <Text style={styles.refreshText}>Uppdatera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesContainer}>
        <View style={styles.coursesGrid}>
          {coursesToDisplay.map((course) => {
            const isDbCourse = 'user_courses' in course;
            const progress = isDbCourse 
              ? (course.user_courses?.[0]?.progress || 0)
              : ((course as any).studiedHours / (course as any).totalHours) * 100;
            const studiedHours = isDbCourse
              ? Math.round((course.user_courses?.[0]?.progress || 0) / 10)
              : (course as any).studiedHours;
            const totalHours = isDbCourse
              ? Math.ceil((course.progress || 100) / 10)
              : (course as any).totalHours;
            const courseColor = isDbCourse
              ? getColorForSubject(course.subject)
              : (course as any).color;
            
            return (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard}
                onPress={() => router.push(`/course/${course.id}`)}
              >
                <View style={styles.courseHeader}>
                  <View style={[styles.courseIcon, { backgroundColor: courseColor }]}>
                    <BookOpen size={24} color="#fff" />
                  </View>
                  {isDbCourse && (
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{course.level}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.courseInfo}>
                  <Text style={styles.courseName} numberOfLines={2} ellipsizeMode="tail">
                    {isDbCourse ? course.title : (course as any).name}
                  </Text>
                  <Text style={styles.courseSubject} numberOfLines={1}>
                    {isDbCourse ? course.subject : (course as any).code}
                  </Text>
                  {isDbCourse && course.description && (
                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}
                </View>

                <View style={styles.courseStats}>
                  <View style={styles.stat}>
                    <Clock size={16} color="#4ECDC4" />
                    <Text style={styles.statText} numberOfLines={1}>
                      {studiedHours}h/{totalHours}h
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <TrendingUp size={16} color="#4ECDC4" />
                    <Text style={styles.statText}>{Math.round(progress)}%</Text>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progress}%`,
                        backgroundColor: courseColor 
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {coursesToDisplay.length === 0 && (
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Inga kurser ännu</Text>
          <Text style={styles.emptySubtitle}>
            Välj dina kurser i onboarding för att komma igång
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const getColorForSubject = (subject: string): string => {
  const colors: Record<string, string> = {
    'Matematik': '#FF6B6B',
    'Svenska': '#4ECDC4',
    'Engelska': '#45B7D1',
    'Historia': '#96CEB4',
    'Samhällskunskap': '#FFEAA7',
    'Naturkunskap': '#DDA0DD',
    'Biologi': '#98D8C8',
    'Fysik': '#F7DC6F',
    'Kemi': '#BB8FCE',
    'Idrott och hälsa': '#85C1E2',
    'Religionskunskap': '#F8B195',
    'Teknik': '#F67280',
    'Programmering': '#C06C84',
    'Webbutveckling': '#6C5CE7',
  };
  return colors[subject] || '#4ECDC4';
};

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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  refreshText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  yearTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  yearTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  yearTabActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  yearTabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#7f8c8d',
  },
  yearTabTextActive: {
    color: '#fff',
  },
  coursesContainer: {
    paddingHorizontal: 20,
  },
  coursesGrid: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    marginBottom: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 6,
  },
  courseSubject: {
    fontSize: 13,
    color: '#95a5a6',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
  },
  levelBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600' as const,
  },
  pointsBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  addButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    gap: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#4ECDC4',
    textAlign: 'center',
  },
  addButtonDisabled: {
    borderColor: '#95a5a6',
    opacity: 0.6,
  },
  addButtonTextDisabled: {
    color: '#95a5a6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});