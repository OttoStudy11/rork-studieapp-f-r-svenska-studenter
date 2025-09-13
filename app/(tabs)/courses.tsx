import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { BookOpen, Plus, Search, Star, TrendingUp, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    subject: '',
    level: 'gymnasie' as 'gymnasie' | 'högskola'
  });

  useEffect(() => {
    if (user?.id) {
      loadCourses();
    }
  }, [user?.id]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      console.log('Loading courses for user:', user?.id);

      // Load user's active courses
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            *
          )
        `)
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (userCoursesError) {
        console.error('Error loading user courses:', userCoursesError);
        return;
      }

      const coursesWithProgress = userCoursesData?.map(userCourse => ({
        id: userCourse.courses.id,
        title: userCourse.courses.title,
        description: userCourse.courses.description,
        subject: userCourse.courses.subject,
        level: userCourse.courses.level,
        progress: userCourse.progress,
        isActive: userCourse.is_active,
        resources: userCourse.courses.resources || [],
        tips: userCourse.courses.tips || [],
        relatedCourses: userCourse.courses.related_courses || []
      })) || [];

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error in loadCourses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.subject) {
      Alert.alert('Fel', 'Fyll i alla fält');
      return;
    }

    try {
      // Create course in database
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title,
          description: newCourse.description,
          subject: newCourse.subject,
          level: newCourse.level,
          resources: [],
          tips: [],
          related_courses: [],
          progress: 0
        })
        .select()
        .single();

      if (courseError) {
        console.error('Error creating course:', courseError);
        Alert.alert('Fel', 'Kunde inte skapa kurs');
        return;
      }

      // Add user course relationship
      const { error: userCourseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: user!.id,
          course_id: courseData.id,
          progress: 0,
          is_active: true
        });

      if (userCourseError) {
        console.error('Error creating user course:', userCourseError);
        Alert.alert('Fel', 'Kunde inte lägga till kurs till användare');
        return;
      }

      setNewCourse({ title: '', description: '', subject: '', level: 'gymnasie' });
      setShowAddModal(false);
      loadCourses(); // Reload courses
    } catch (error) {
      console.error('Error in handleAddCourse:', error);
      Alert.alert('Fel', 'Kunde inte lägga till kurs');
    }
  };

  const toggleCourseActive = async (courseId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_courses')
        .update({ is_active: !isActive })
        .eq('user_id', user!.id)
        .eq('course_id', courseId);

      if (error) {
        console.error('Error updating course active status:', error);
        Alert.alert('Fel', 'Kunde inte uppdatera kurs');
        return;
      }

      loadCourses(); // Reload courses
    } catch (error) {
      console.error('Error in toggleCourseActive:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera kurs');
    }
  };

  const updateProgress = async (courseId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('user_courses')
        .update({ progress })
        .eq('user_id', user!.id)
        .eq('course_id', courseId);

      if (error) {
        console.error('Error updating course progress:', error);
        Alert.alert('Fel', 'Kunde inte uppdatera framsteg');
        return;
      }

      loadCourses(); // Reload courses
    } catch (error) {
      console.error('Error in updateProgress:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera framsteg');
    }
  };

  const navigateToCourse = (courseId: string) => {
    router.push(`/course/${courseId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Kurser</Text>
        <Text style={styles.headerSubtitle}>Hantera dina studier</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök kurser..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCourses.map((course) => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.courseCard}
            onPress={() => navigateToCourse(course.id)}
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseSubject}>{course.subject}</Text>
                <Text style={styles.courseLevel}>
                  {course.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.activeToggle,
                  course.isActive && styles.activeToggleOn
                ]}
                onPress={() => toggleCourseActive(course.id, course.isActive)}
              >
                <Star 
                  size={16} 
                  color={course.isActive ? '#F59E0B' : '#9CA3AF'} 
                  fill={course.isActive ? '#F59E0B' : 'none'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.courseDescription} numberOfLines={2}>
              {course.description}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Framsteg</Text>
                <Text style={styles.progressPercent}>{course.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${course.progress}%` }]} 
                />
              </View>
              <View style={styles.progressButtons}>
                <TouchableOpacity
                  style={styles.progressButton}
                  onPress={() => updateProgress(course.id, Math.max(0, course.progress - 10))}
                >
                  <Text style={styles.progressButtonText}>-10%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.progressButton}
                  onPress={() => updateProgress(course.id, Math.min(100, course.progress + 10))}
                >
                  <Text style={styles.progressButtonText}>+10%</Text>
                </TouchableOpacity>
              </View>
            </View>

            {Array.isArray(course.tips) && course.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Tips:</Text>
                <Text style={styles.tipsText} numberOfLines={1}>
                  {Array.isArray(course.tips) ? course.tips[0] : ''}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Laddar kurser...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Inga kurser hittades' : 'Inga kurser än'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Prova att söka på något annat'
                : 'Lägg till din första kurs för att komma igång'
              }
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Add Course Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lägg till kurs</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kurstitel</Text>
              <TextInput
                style={styles.input}
                placeholder="T.ex. Matematik 3c"
                value={newCourse.title}
                onChangeText={(text) => setNewCourse({ ...newCourse, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ämne</Text>
              <TextInput
                style={styles.input}
                placeholder="T.ex. Matematik"
                value={newCourse.subject}
                onChangeText={(text) => setNewCourse({ ...newCourse, subject: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Beskrivning</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beskriv kursen..."
                value={newCourse.description}
                onChangeText={(text) => setNewCourse({ ...newCourse, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nivå</Text>
              <View style={styles.levelButtons}>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    newCourse.level === 'gymnasie' && styles.levelButtonActive
                  ]}
                  onPress={() => setNewCourse({ ...newCourse, level: 'gymnasie' })}
                >
                  <Text style={[
                    styles.levelButtonText,
                    newCourse.level === 'gymnasie' && styles.levelButtonTextActive
                  ]}>
                    Gymnasie
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    newCourse.level === 'högskola' && styles.levelButtonActive
                  ]}
                  onPress={() => setNewCourse({ ...newCourse, level: 'högskola' })}
                >
                  <Text style={[
                    styles.levelButtonText,
                    newCourse.level === 'högskola' && styles.levelButtonTextActive
                  ]}>
                    Högskola
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!newCourse.title || !newCourse.subject) && styles.saveButtonDisabled
              ]}
              onPress={handleAddCourse}
              disabled={!newCourse.title || !newCourse.subject}
            >
              <Text style={styles.saveButtonText}>Lägg till</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 2,
  },
  courseLevel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  activeToggle: {
    padding: 8,
  },
  activeToggleOn: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  progressButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  progressButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  tipsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  levelButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  levelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  levelButtonTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});