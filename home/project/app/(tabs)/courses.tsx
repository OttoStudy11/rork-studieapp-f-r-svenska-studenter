import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useCourses } from '@/contexts/CourseContext';
import { BookOpen, Clock, TrendingUp, Plus } from 'lucide-react-native';
import { useState } from 'react';

export default function Courses() {
  const { courses, coursesByYear, userProfile } = useCourses();
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(userProfile?.year || 1);

  const yearCourses = coursesByYear[selectedYear] || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mina Kurser</Text>
        <Text style={styles.subtitle}>
          {userProfile?.program} • År {userProfile?.year}
        </Text>
      </View>

      <View style={styles.yearTabs}>
        {[1, 2, 3].map((year) => (
          <TouchableOpacity
            key={year}
            style={[styles.yearTab, selectedYear === year && styles.yearTabActive]}
            onPress={() => setSelectedYear(year as 1 | 2 | 3)}
          >
            <Text style={[styles.yearTabText, selectedYear === year && styles.yearTabTextActive]}>
              År {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.coursesContainer}>
        {yearCourses.map((course) => {
          const progress = (course.studiedHours / course.totalHours) * 100;
          
          return (
            <TouchableOpacity key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
                  <BookOpen size={20} color="#fff" />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  {course.code && (
                    <Text style={styles.courseCode}>{course.code}</Text>
                  )}
                </View>
                {course.mandatory && (
                  <View style={styles.mandatoryBadge}>
                    <Text style={styles.mandatoryText}>Obligatorisk</Text>
                  </View>
                )}
              </View>

              <View style={styles.courseStats}>
                <View style={styles.stat}>
                  <Clock size={16} color="#7f8c8d" />
                  <Text style={styles.statText}>
                    {Math.round(course.studiedHours)}h / {course.totalHours}h
                  </Text>
                </View>
                <View style={styles.stat}>
                  <TrendingUp size={16} color="#7f8c8d" />
                  <Text style={styles.statText}>{Math.round(progress)}%</Text>
                </View>
                {course.points && (
                  <View style={styles.stat}>
                    <Text style={styles.statText}>{course.points}p</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: course.color 
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#4ECDC4" />
          <Text style={styles.addButtonText}>Lägg till kurs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Sammanfattning År {selectedYear}</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{yearCourses.length}</Text>
            <Text style={styles.summaryLabel}>Kurser</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {yearCourses.reduce((sum, c) => sum + c.points, 0)}p
            </Text>
            <Text style={styles.summaryLabel}>Poäng</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {Math.round(yearCourses.reduce((sum, c) => sum + c.studiedHours, 0))}h
            </Text>
            <Text style={styles.summaryLabel}>Studerat</Text>
          </View>
        </View>
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
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  courseCode: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  mandatoryBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mandatoryText: {
    fontSize: 11,
    color: '#FF8C00',
    fontWeight: '500' as const,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#4ECDC4',
  },
  summaryCard: {
    margin: 20,
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
});