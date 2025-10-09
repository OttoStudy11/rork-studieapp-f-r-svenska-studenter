import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCourses } from '@/contexts/CourseContext';
import { usePremium } from '@/contexts/PremiumContext';
import { BookOpen, Clock, TrendingUp, Plus, Crown, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AddCourseModal from '@/components/AddCourseModal';

export default function Courses() {
  const { coursesByYear, userProfile, addCourse } = useCourses();
  const { isPremium, canAddCourse, limits, showPremiumModal } = usePremium();
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(userProfile?.year || 1);
  const [showAddModal, setShowAddModal] = useState(false);

  const yearCourses = coursesByYear[selectedYear] || [];
  const totalCourses = Object.values(coursesByYear).flat().length;
  const canAddMoreCourses = canAddCourse(totalCourses);

  const handleAddCourse = () => {
    if (!canAddMoreCourses) {
      Alert.alert(
        'Premium krävs',
        `Du har nått gränsen för kurser (${limits.maxCourses}). Uppgradera till Premium för obegränsade kurser!`,
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Uppgradera', onPress: () => router.push('/premium') }
        ]
      );
      return;
    }
    setShowAddModal(true);
  };

  const handleAddCourseSubmit = async (courseData: any) => {
    try {
      await addCourse(courseData);
      Alert.alert('Klart!', 'Kursen har lagts till');
    } catch (error) {
      console.error('Error adding course:', error);
      Alert.alert('Fel', 'Kunde inte lägga till kursen');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mina Kurser</Text>
          {isPremium && <Crown size={24} color="#FFD700" />}
        </View>
        <Text style={styles.subtitle}>
          {userProfile?.program} • År {userProfile?.year}
        </Text>
        <View style={styles.limitsContainer}>
          <Text style={styles.limitsText}>
            {totalCourses}/{limits.maxCourses === Infinity ? '∞' : limits.maxCourses} kurser
          </Text>
          {!isPremium && (
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/premium')}
            >
              <Crown size={16} color="#FFFFFF" />
              <Text style={styles.upgradeButtonText}>Uppgradera</Text>
            </TouchableOpacity>
          )}
        </View>
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
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard}
                onPress={() => router.push(`/course/${course.id}`)}
              >
                <View style={styles.courseHeader}>
                  <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
                    <BookOpen size={24} color="#fff" />
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
                    <Clock size={16} color="#4ECDC4" />
                    <Text style={styles.statText} numberOfLines={1}>
                      {Math.round(course.studiedHours)}h/{course.totalHours}h
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <TrendingUp size={16} color="#4ECDC4" />
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

          <TouchableOpacity 
            style={[styles.addButton, !canAddMoreCourses && styles.addButtonDisabled]}
            onPress={handleAddCourse}
          >
            {canAddMoreCourses ? (
              <Plus size={24} color="#4ECDC4" />
            ) : (
              <Lock size={24} color="#95a5a6" />
            )}
            <Text style={[styles.addButtonText, !canAddMoreCourses && styles.addButtonTextDisabled]} numberOfLines={2}>
              {canAddMoreCourses ? 'Lägg till kurs' : 'Premium krävs'}
            </Text>
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

      <AddCourseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCourseSubmit}
        currentYear={selectedYear}
      />
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  limitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  limitsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  courseCode: {
    fontSize: 13,
    color: '#95a5a6',
    fontWeight: '500' as const,
  },
  mandatoryBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mandatoryText: {
    fontSize: 11,
    color: '#FF8C00',
    fontWeight: '600' as const,
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