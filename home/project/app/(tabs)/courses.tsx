import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useCourses } from '@/contexts/CourseContext';
import { BookOpen, Clock, TrendingUp, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Courses() {
  const { coursesByYear, userProfile } = useCourses();
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(userProfile?.year || 1);

  const yearCourses = coursesByYear[selectedYear] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
        <View style={styles.coursesGrid}>
          {yearCourses.map((course) => {
            const progress = (course.studiedHours / course.totalHours) * 100;
            
            return (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
                    <BookOpen size={18} color="#fff" />
                  </View>
                  {course.mandatory && (
                    <View style={styles.mandatoryBadge}>
                      <Text style={styles.mandatoryText}>Obligatorisk</Text>
                    </View>
                  )}
                </View>

                <View style={styles.courseInfo}>
                  <Text style={styles.courseName} numberOfLines={2} ellipsizeMode="tail">
                    {course.name}
                  </Text>
                  {course.code && (
                    <Text style={styles.courseCode} numberOfLines={1}>
                      {course.code}
                    </Text>
                  )}
                </View>

                <View style={styles.courseStats}>
                  <View style={styles.stat}>
                    <Clock size={14} color="#7f8c8d" />
                    <Text style={styles.statText} numberOfLines={1}>
                      {Math.round(course.studiedHours)}h/{course.totalHours}h
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <TrendingUp size={14} color="#7f8c8d" />
                    <Text style={styles.statText}>{Math.round(progress)}%</Text>
                  </View>
                </View>

                {course.points && (
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>{course.points}p</Text>
                  </View>
                )}

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
            <Text style={styles.addButtonText} numberOfLines={2}>Lägg till kurs</Text>
          </TouchableOpacity>
        </View>
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
              {yearCourses.reduce((sum, c) => sum + (c.points || 0), 0)}p
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
    </SafeAreaView>
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
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    minWidth: 160,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: '500' as const,
  },
  mandatoryBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mandatoryText: {
    fontSize: 9,
    color: '#FF8C00',
    fontWeight: '600' as const,
  },
  courseStats: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '500' as const,
  },
  pointsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pointsText: {
    fontSize: 10,
    color: '#2c3e50',
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  addButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '48%',
    minWidth: 160,
    height: 200,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
    textAlign: 'center',
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