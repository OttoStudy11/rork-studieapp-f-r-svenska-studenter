import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Star, 
  TrendingUp, 
  X, 
  Clock,
  Target,
  Lightbulb,
  Brain,
  ArrowRight,
  User,
  Crown,
  Flame
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { FadeInView, SlideInView } from '@/components/Animations';
import type { Database } from '@/lib/database.types';

const { width } = Dimensions.get('window');

type Course = Database['public']['Tables']['courses']['Row'];
type StudyGuide = Database['public']['Tables']['study_guides']['Row'];

interface StudyTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
}

interface StudyTechnique {
  id: number;
  title: string;
  description: string;
  steps: string[];
  icon: string;
  timeNeeded: string;
}

export default function CoursesScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { isPremium, showPremiumModal } = usePremium();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [studyTips, setStudyTips] = useState<StudyTip[]>([]);
  const [studyTechniques, setStudyTechniques] = useState<StudyTechnique[]>([]);
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
      loadAllData();
    }
  }, [user?.id]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading all data for user:', user?.id);

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
      } else {
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
      }

      // Load study tips from database (hardcoded for now)
      const tipsData: StudyTip[] = [
        {
          id: 1,
          title: 'Pomodoro-tekniken',
          description: 'Studera i 25-minuters intervaller med 5 minuters pauser',
          icon: '🍅',
          category: 'Tidshantering',
          difficulty: 'Nybörjare'
        },
        {
          id: 2,
          title: 'Aktiv repetition',
          description: 'Testa dig själv istället för att bara läsa om materialet',
          icon: '🧠',
          category: 'Minnestekniker',
          difficulty: 'Medel'
        },
        {
          id: 3,
          title: 'Spaced repetition',
          description: 'Repetera material med ökande intervaller för bättre minne',
          icon: '📅',
          category: 'Minnestekniker',
          difficulty: 'Avancerad'
        },
        {
          id: 4,
          title: 'Feynman-tekniken',
          description: 'Förklara komplexa koncept med enkla ord',
          icon: '👨‍🏫',
          category: 'Förståelse',
          difficulty: 'Medel'
        },
        {
          id: 5,
          title: 'Mind mapping',
          description: 'Skapa visuella kartor för att organisera information',
          icon: '🗺️',
          category: 'Organisation',
          difficulty: 'Nybörjare'
        },
        {
          id: 6,
          title: 'Miljöbyte',
          description: 'Byt studiemiljö för att förbättra inlärningen',
          icon: '🏠',
          category: 'Miljö',
          difficulty: 'Nybörjare'
        }
      ];
      setStudyTips(tipsData);

      // Load study techniques from database (hardcoded for now)
      const techniquesData: StudyTechnique[] = [
        {
          id: 1,
          title: 'SQ3R-metoden',
          description: 'Survey, Question, Read, Recite, Review - systematisk läsning',
          steps: ['Överblicka', 'Fråga', 'Läs', 'Återge', 'Repetera'],
          icon: '📖',
          timeNeeded: '30-60 min'
        },
        {
          id: 2,
          title: 'Cornell-anteckningar',
          description: 'Strukturerad anteckningsmetod med tre sektioner',
          steps: ['Anteckningar', 'Ledtrådar', 'Sammanfattning'],
          icon: '📝',
          timeNeeded: '15-30 min'
        },
        {
          id: 3,
          title: 'Elaborativ förfrågan',
          description: 'Ställ "varför" och "hur" frågor för djupare förståelse',
          steps: ['Läs fakta', 'Fråga varför', 'Förklara samband', 'Koppla till tidigare kunskap'],
          icon: '❓',
          timeNeeded: '20-40 min'
        }
      ];
      setStudyTechniques(techniquesData);

    } catch (error) {
      console.error('Error in loadAllData:', error);
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
      console.log('Creating course with data:', {
        title: newCourse.title,
        description: newCourse.description || 'Ingen beskrivning',
        subject: newCourse.subject,
        level: newCourse.level,
      });

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title,
          description: newCourse.description || 'Ingen beskrivning',
          subject: newCourse.subject,
          level: newCourse.level,
          resources: [],
          tips: [],
          related_courses: []
        })
        .select()
        .single();

      if (courseError) {
        console.error('Error creating course:', courseError);
        Alert.alert('Fel', `Kunde inte skapa kurs: ${courseError.message}`);
        return;
      }

      console.log('Course created successfully:', courseData);

      const { error: userCourseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: user!.id,
          course_id: courseData.id,
          is_active: true
        });

      if (userCourseError) {
        console.error('Error creating user course:', userCourseError);
        Alert.alert('Fel', `Kunde inte lägga till kurs till användare: ${userCourseError.message}`);
        return;
      }

      console.log('User course created successfully');
      Alert.alert('Framgång', 'Kurs tillagd!');
      setNewCourse({ title: '', description: '', subject: '', level: 'gymnasie' });
      setShowAddModal(false);
      loadAllData();
    } catch (error: any) {
      console.error('Error in handleAddCourse:', error);
      Alert.alert('Fel', error?.message || 'Kunde inte lägga till kurs');
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

      loadAllData(); // Reload all data
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

      loadAllData(); // Reload all data
    } catch (error) {
      console.error('Error in updateProgress:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera framsteg');
    }
  };

  const navigateToCourse = (courseId: string) => {
    router.push(`/course/${courseId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar kurser...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>Mina Kurser 📚</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Utforska och lär dig</Text>
          </View>
          <View style={styles.headerRight}>
            {isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                <Crown size={16} color={theme.colors.warning} />
                <Text style={[styles.premiumText, { color: theme.colors.warning }]}>Pro</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.profileButton, { backgroundColor: theme.colors.primary + '15' }]}
              onPress={() => router.push('/profile')}
            >
              <User size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <SlideInView direction="up" delay={100}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Sök kurser..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SlideInView>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Courses Section */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktiva kurser</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <FadeInView key={course.id} delay={300 + index * 100}>
                  <TouchableOpacity 
                    style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => navigateToCourse(course.id)}
                  >
                    <View style={styles.courseHeader}>
                      <View style={styles.courseInfo}>
                        <Text style={[styles.courseTitle, { color: theme.colors.text }]}>{course.title}</Text>
                        <Text style={[styles.courseSubject, { color: theme.colors.textSecondary }]}>{course.subject}</Text>
                      </View>
                      <View style={styles.courseProgressContainer}>
                        <Text style={[styles.courseProgress, { color: theme.colors.primary }]}>{course.progress}%</Text>
                      </View>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                      <View 
                        style={[styles.progressFill, { 
                          width: `${course.progress}%`,
                          backgroundColor: theme.colors.primary
                        }]} 
                      />
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Target size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inga aktiva kurser</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Lägg till kurser för att komma igång</Text>
                <TouchableOpacity 
                  style={[styles.addButtonLarge, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowAddModal(true)}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addButtonText}>Lägg till kurs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SlideInView>

        {/* Study Tips Section */}
        <SlideInView direction="up" delay={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipsGrid}>
              {studyTips.slice(0, 6).map((tip, index) => (
                <FadeInView key={tip.id} delay={500 + index * 50}>
                  <TouchableOpacity 
                    style={[styles.compactTipCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/study-tip/${tip.id}`)}
                  >
                    <Text style={styles.compactTipIcon}>{tip.icon}</Text>
                    <Text style={[styles.compactTipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                    <View style={[styles.compactTipDifficulty, { 
                      backgroundColor: tip.difficulty === 'Nybörjare' ? theme.colors.success + '20' :
                                     tip.difficulty === 'Medel' ? theme.colors.warning + '20' :
                                     theme.colors.error + '20'
                    }]}>
                      <Text style={[styles.compactTipDifficultyText, { 
                        color: tip.difficulty === 'Nybörjare' ? theme.colors.success :
                              tip.difficulty === 'Medel' ? theme.colors.warning :
                              theme.colors.error
                      }]}>{tip.difficulty}</Text>
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>
          </View>
        </SlideInView>

        {/* Study Techniques Section */}
        <SlideInView direction="up" delay={600}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietekniker</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.techniquesGrid}>
              {studyTechniques.map((technique, index) => (
                <FadeInView key={technique.id} delay={700 + index * 50}>
                  <TouchableOpacity 
                    style={[styles.compactTechniqueCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/study-technique/${technique.id}`)}
                  >
                    <Text style={styles.compactTechniqueIcon}>{technique.icon}</Text>
                    <Text style={[styles.compactTechniqueTitle, { color: theme.colors.text }]}>{technique.title}</Text>
                    <View style={[styles.compactTimeTag, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Clock size={10} color={theme.colors.primary} />
                      <Text style={[styles.compactTimeText, { color: theme.colors.primary }]}>{technique.timeNeeded}</Text>
                    </View>
                    <ArrowRight size={14} color={theme.colors.textMuted} style={styles.compactArrow} />
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>
          </View>
        </SlideInView>
      </ScrollView>

      {/* Add Course Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Lägg till kurs</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Kurstitel</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card
                }]}
                placeholder="T.ex. Matematik 3c"
                placeholderTextColor={theme.colors.textMuted}
                value={newCourse.title}
                onChangeText={(text) => setNewCourse({ ...newCourse, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Ämne</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card
                }]}
                placeholder="T.ex. Matematik"
                placeholderTextColor={theme.colors.textMuted}
                value={newCourse.subject}
                onChangeText={(text) => setNewCourse({ ...newCourse, subject: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Beskrivning</Text>
              <TextInput
                style={[styles.input, styles.textArea, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card
                }]}
                placeholder="Beskriv kursen..."
                placeholderTextColor={theme.colors.textMuted}
                value={newCourse.description}
                onChangeText={(text) => setNewCourse({ ...newCourse, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Nivå</Text>
              <View style={styles.levelButtons}>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { borderColor: theme.colors.border },
                    newCourse.level === 'gymnasie' && { 
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '15'
                    }
                  ]}
                  onPress={() => setNewCourse({ ...newCourse, level: 'gymnasie' })}
                >
                  <Text style={[
                    styles.levelButtonText,
                    { color: theme.colors.textSecondary },
                    newCourse.level === 'gymnasie' && { color: theme.colors.primary, fontWeight: '600' }
                  ]}>
                    Gymnasie
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { borderColor: theme.colors.border },
                    newCourse.level === 'högskola' && { 
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '15'
                    }
                  ]}
                  onPress={() => setNewCourse({ ...newCourse, level: 'högskola' })}
                >
                  <Text style={[
                    styles.levelButtonText,
                    { color: theme.colors.textSecondary },
                    newCourse.level === 'högskola' && { color: theme.colors.primary, fontWeight: '600' }
                  ]}>
                    Högskola
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
                (!newCourse.title || !newCourse.subject) && styles.saveButtonDisabled
              ]}
              onPress={handleAddCourse}
              disabled={!newCourse.title || !newCourse.subject}
            >
              <Text style={styles.saveButtonText}>Lägg till</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 16,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  courseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 14,
    fontWeight: '500',
  },
  courseProgressContainer: {
    alignItems: 'flex-end',
  },
  courseProgress: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compactTipCard: {
    width: (width - 72) / 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactTipIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  compactTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  compactTipDifficulty: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compactTipDifficultyText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  techniquesGrid: {
    gap: 12,
  },
  compactTechniqueCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactTechniqueIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactTechniqueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  compactTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginRight: 8,
  },
  compactTimeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compactArrow: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
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