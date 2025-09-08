import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourses } from '@/contexts/CourseContext';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const { 
    userProfile, 
    courses, 
    totalStudyHours, 
    completionPercentage,
    mandatoryCourses 
  } = useCourses();

  const todaysCourses = courses.slice(0, 3);
  const recentCourse = courses.find(c => c.lastStudied) || courses[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hej {userProfile?.name || 'Student'}! 👋</Text>
        <Text style={styles.subGreeting}>
          {userProfile?.gymnasium} • {userProfile?.program} • År {userProfile?.year}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>{Math.round(totalStudyHours)}h</Text>
          <Text style={styles.statLabel}>Studerat</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{Math.round(completionPercentage)}%</Text>
          <Text style={styles.statLabel}>Klart</Text>
        </View>
        <View style={styles.statCard}>
          <Trophy size={24} color="#FFD93D" />
          <Text style={styles.statValue}>{courses.length}</Text>
          <Text style={styles.statLabel}>Kurser</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fortsätt där du slutade</Text>
        {recentCourse && (
          <TouchableOpacity 
            style={[styles.courseCard, { backgroundColor: recentCourse.color + '20' }]}
            onPress={() => router.push('/timer')}
          >
            <View style={[styles.courseIcon, { backgroundColor: recentCourse.color }]}>
              <BookOpen size={20} color="#fff" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{recentCourse.name}</Text>
              <Text style={styles.courseProgress}>
                {recentCourse.studiedHours}h / {recentCourse.totalHours}h
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(recentCourse.studiedHours / recentCourse.totalHours) * 100}%`,
                    backgroundColor: recentCourse.color 
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dagens kurser</Text>
          <TouchableOpacity onPress={() => router.push('/courses')}>
            <Text style={styles.seeAll}>Se alla</Text>
          </TouchableOpacity>
        </View>
        {todaysCourses.map((course) => (
          <TouchableOpacity 
            key={course.id}
            style={styles.todayCourseCard}
            onPress={() => router.push('/timer')}
          >
            <View style={[styles.todayCourseIcon, { backgroundColor: course.color }]}>
              <BookOpen size={16} color="#fff" />
            </View>
            <Text style={styles.todayCourseName}>{course.name}</Text>
            <Text style={styles.todayCourseTime}>
              {course.studiedHours}/{course.totalHours}h
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/timer')}>
          <Clock size={24} color="#4ECDC4" />
          <Text style={styles.actionText}>Starta Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/courses')}>
          <BookOpen size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Mina Kurser</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 14,
    color: '#7f8c8d',
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500' as const,
  },
  courseCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseInfo: {
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  courseProgress: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  todayCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  todayCourseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  todayCourseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#2c3e50',
  },
  todayCourseTime: {
    fontSize: 14,
    color: '#95a5a6',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#2c3e50',
    marginTop: 8,
  },
});