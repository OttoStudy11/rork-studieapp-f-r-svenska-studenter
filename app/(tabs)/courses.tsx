import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { 
  Plus, 
  Search, 
  Clock,
  Target,
  ArrowRight,
  User,
  Crown,
  Award
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { FadeInView, SlideInView } from '@/components/Animations';
import CoursePickerModal, { UnifiedCourse } from '@/components/CoursePickerModal';
import type { Course as ProgramCourse } from '@/home/project/constants/program-courses';

const { width } = Dimensions.get('window');

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
  const [showCoursePickerModal, setShowCoursePickerModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading all data for user:', user?.id);

      // First, check user's education level
      const { data: profileData } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', user!.id)
        .single();

      const isUniversityUser = profileData?.level === 'högskola' || profileData?.level === 'universitet';
      console.log('User education level:', profileData?.level, 'Is university:', isUniversityUser);

      let allCourses: any[] = [];

      // Load gymnasium courses from user_courses
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
      } else if (userCoursesData) {
        const gymnasiumCourses = userCoursesData
          .filter(uc => uc.courses) // Filter out null courses
          .map(userCourse => ({
            id: userCourse.courses.id,
            userCourseId: userCourse.id,
            title: userCourse.courses.title,
            description: userCourse.courses.description,
            subject: userCourse.courses.subject,
            level: userCourse.courses.level,
            progress: userCourse.progress,
            targetGrade: userCourse.target_grade,
            isActive: userCourse.is_active,
            resources: userCourse.courses.resources || [],
            tips: userCourse.courses.tips || [],
            relatedCourses: userCourse.courses.related_courses || [],
            isUniversity: false
          }));
        allCourses = [...allCourses, ...gymnasiumCourses];
      }

      // Also load university courses from user_university_courses
      if (isUniversityUser) {
        const { data: uniCoursesData, error: uniCoursesError } = await supabase
          .from('user_university_courses')
          .select(`
            *,
            course:university_courses (
              id,
              course_code,
              title,
              description,
              credits,
              level,
              subject_area
            )
          `)
          .eq('user_id', user!.id)
          .eq('is_active', true);

        if (uniCoursesError) {
          console.error('Error loading university courses:', uniCoursesError);
        } else if (uniCoursesData) {
          const universityCourses = uniCoursesData
            .filter(uc => uc.course) // Filter out null courses
            .map(userCourse => ({
              id: userCourse.course.id,
              userCourseId: userCourse.id,
              title: userCourse.course.title,
              description: userCourse.course.description || `${userCourse.course.title} - ${userCourse.course.credits} hp`,
              subject: userCourse.course.subject_area || 'Högskola',
              level: 'högskola',
              progress: userCourse.progress,
              targetGrade: null,
              isActive: userCourse.is_active,
              resources: ['Kursmaterial', 'Övningsuppgifter'],
              tips: ['Studera regelbundet'],
              relatedCourses: [],
              isUniversity: true,
              credits: userCourse.course.credits
            }));
          allCourses = [...allCourses, ...universityCourses];
          console.log('Loaded', universityCourses.length, 'university courses');
        }
      }

      // Remove duplicates based on course id
      const uniqueCourses = allCourses.reduce((acc, course) => {
        if (!acc.find((c: any) => c.id === course.id)) {
          acc.push(course);
        }
        return acc;
      }, [] as any[]);

      setCourses(uniqueCourses);
      console.log('Total courses loaded:', uniqueCourses.length);

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

  const handleAddCourseFromPicker = async (course: ProgramCourse | UnifiedCourse) => {
    try {
      console.log('Adding course from picker:', course);
      console.log('Current user ID:', user?.id);

      if (!user?.id) {
        Alert.alert('Fel', 'Du måste vara inloggad för att lägga till kurser');
        return;
      }

      // Determine if this is a university course
      const isUniversityCourse = 'isUniversity' in course && course.isUniversity;
      const courseCode = course.code;
      const courseName = course.name;
      const coursePoints = isUniversityCourse ? (course as UnifiedCourse).credits : (course as ProgramCourse).points;
      const courseField = isUniversityCourse && 'field' in course ? (course as UnifiedCourse).field || 'Allmänt' : extractSubjectFromCourseName(courseName);

      // Verify that the profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, level')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile not found or error:', profileError);
        Alert.alert('Fel', 'Din profil kunde inte hittas. Vänligen logga in igen.');
        return;
      }

      console.log('Profile verified:', profileData);

      // Handle university courses differently
      if (isUniversityCourse) {
        console.log('Adding university course:', courseCode);
        
        // Check if university course exists in university_courses table
        const { data: existingUniCourse } = await supabase
          .from('university_courses')
          .select('id')
          .eq('id', courseCode)
          .maybeSingle();

        if (!existingUniCourse) {
          console.log('University course does not exist, creating:', courseCode);
          const { error: insertError } = await supabase
            .from('university_courses')
            .insert({
              id: courseCode,
              course_code: courseCode,
              title: courseName,
              description: `${courseName} - ${coursePoints} hp`,
              credits: coursePoints || 7.5,
              level: 'grundnivå',
              subject_area: courseField,
            });

          if (insertError) {
            console.error('Error inserting university course:', insertError);
            // Continue anyway - might already exist
          }
        }

        // Check if user already has this university course
        const { data: userUniCourseExists } = await supabase
          .from('user_university_courses')
          .select('id')
          .eq('user_id', user!.id)
          .eq('course_id', courseCode)
          .maybeSingle();

        if (userUniCourseExists) {
          Alert.alert('Info', 'Du har redan lagt till denna kurs');
          return;
        }

        console.log('Creating user university course record...');
        const userCourseId = `${user!.id}-${courseCode}`;

        const { error: userUniCourseError } = await supabase
          .from('user_university_courses')
          .insert({
            id: userCourseId,
            user_id: user!.id,
            course_id: courseCode,
            is_active: true,
            progress: 0
          });

        if (userUniCourseError) {
          console.error('Error adding user university course:', userUniCourseError);
          
          // Fallback: Try adding to regular courses table for compatibility
          console.log('Falling back to regular courses table...');
          const { data: existingCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('id', courseCode)
            .maybeSingle();

          if (!existingCourse) {
            await supabase.from('courses').insert({
              id: courseCode,
              title: courseName,
              description: `${courseName} - ${coursePoints} hp`,
              subject: courseField,
              level: 'hogskola',
              resources: ['Kursmaterial', 'Övningsuppgifter'],
              tips: ['Studera regelbundet'],
              related_courses: []
            });
          }

          const { error: fallbackError } = await supabase
            .from('user_courses')
            .upsert({
              id: userCourseId,
              user_id: user!.id,
              course_id: courseCode,
              is_active: true,
              progress: 0
            }, { onConflict: 'id' });

          if (fallbackError) {
            Alert.alert('Fel', `Kunde inte lägga till kurs: ${fallbackError.message}`);
            return;
          }
        }

        console.log('University course added successfully');
        Alert.alert('Framgång! \u2705', `${courseName} har lagts till i dina kurser`);
        await loadAllData();
        return;
      }

      // Handle gymnasium courses (existing logic)
      const { data: existingCourse, error: courseCheckError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', courseCode)
        .maybeSingle();

      if (courseCheckError) {
        console.error('Error checking course:', courseCheckError);
      }

      if (!existingCourse) {
        console.log('Course does not exist, creating:', courseCode);
        const { error: insertError } = await supabase
          .from('courses')
          .insert({
            id: courseCode,
            title: courseName,
            description: `${courseName} - ${coursePoints} poäng`,
            subject: courseField,
            level: 'gymnasie',
            resources: ['Kursmaterial', 'Övningsuppgifter'],
            tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
            related_courses: []
          });

        if (insertError) {
          console.error('Error inserting course:', insertError);
          Alert.alert('Fel', `Kunde inte skapa kurs: ${insertError.message}`);
          return;
        }
      }

      // Check if user already has this course
      const { data: userCourseExists, error: userCourseCheckError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user!.id)
        .eq('course_id', courseCode)
        .maybeSingle();

      if (userCourseCheckError) {
        console.error('Error checking user course:', userCourseCheckError);
      }

      if (userCourseExists) {
        Alert.alert('Info', 'Du har redan lagt till denna kurs');
        return;
      }

      console.log('Creating user course record...');
      const userCourseId = `${user!.id}-${courseCode}`;
      console.log('User course ID:', userCourseId);

      const { data: insertedUserCourse, error: userCourseError } = await supabase
        .from('user_courses')
        .insert({
          id: userCourseId,
          user_id: user!.id,
          course_id: courseCode,
          is_active: true,
          progress: 0
        })
        .select()
        .single();

      if (userCourseError) {
        console.error('=== USER COURSE ERROR ===');
        console.error('Error message:', userCourseError.message);
        console.error('Error code:', userCourseError.code);
        console.error('Error details:', userCourseError.details);
        console.error('Error hint:', userCourseError.hint);
        console.error('Full error:', JSON.stringify(userCourseError, null, 2));
        console.error('=========================');
        
        let errorMessage = 'Kunde inte lägga till kurs';
        if (userCourseError.message) {
          errorMessage += `: ${userCourseError.message}`;
        }
        if (userCourseError.hint) {
          errorMessage += ` (${userCourseError.hint})`;
        }
        
        Alert.alert('Fel', errorMessage);
        return;
      }

      console.log('Course added successfully:', insertedUserCourse);
      Alert.alert('Framgång! \u2705', `${courseName} har lagts till i dina kurser`);
      await loadAllData();
    } catch (error: any) {
      console.error('Error in handleAddCourseFromPicker:', error);
      Alert.alert('Fel', error?.message || 'Kunde inte lägga till kurs');
    }
  };

  const extractSubjectFromCourseName = (name: string): string => {
    const subjectKeywords: Record<string, string> = {
      'Engelska': 'Engelska',
      'Historia': 'Historia',
      'Idrott': 'Idrott och hälsa',
      'Matematik': 'Matematik',
      'Naturkunskap': 'Naturkunskap',
      'Religionskunskap': 'Religionskunskap',
      'Samhällskunskap': 'Samhällskunskap',
      'Svenska': 'Svenska',
      'Biologi': 'Biologi',
      'Fysik': 'Fysik',
      'Kemi': 'Kemi',
      'Teknik': 'Teknik',
      'Programmering': 'Teknik',
      'Webbutveckling': 'Teknik',
    };

    for (const [keyword, subject] of Object.entries(subjectKeywords)) {
      if (name.includes(keyword)) {
        return subject;
      }
    }

    return 'Övrigt';
  };

  const navigateToCourse = (courseId: string) => {
    console.log('Navigating to course detail:', { courseId });
    router.push({ pathname: '/course/[id]', params: { id: courseId } } as any);
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
              onPress={() => router.push('/profile' as any)}
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
            onPress={() => {
              if (!isPremium) {
                showPremiumModal('Lägg till kurser');
              } else {
                setShowCoursePickerModal(true);
              }
            }}
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
              <TouchableOpacity onPress={() => console.log('Show all active courses')}>
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
                      <View style={styles.courseMetaContainer}>
                        {course.targetGrade && (
                          <View style={[styles.targetGradeBadge, { backgroundColor: theme.colors.success + '20' }]}>
                            <Award size={14} color={theme.colors.success} />
                            <Text style={[styles.targetGradeText, { color: theme.colors.success }]}>Mål: {course.targetGrade}</Text>
                          </View>
                        )}
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
                  onPress={() => {
                    if (!isPremium) {
                      showPremiumModal('Lägg till kurser');
                    } else {
                      setShowCoursePickerModal(true);
                    }
                  }}
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
              <TouchableOpacity onPress={() => router.push('/study-tips' as any)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipsGrid}>
              {studyTips.slice(0, 6).map((tip, index) => (
                <FadeInView key={tip.id} delay={500 + index * 50}>
                  <TouchableOpacity 
                    style={[styles.compactTipCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/study-tip/${tip.id}` as any)}
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
              <TouchableOpacity onPress={() => router.push('/study-techniques' as any)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.techniquesGrid}>
              {studyTechniques.map((technique, index) => (
                <FadeInView key={technique.id} delay={700 + index * 50}>
                  <TouchableOpacity 
                    style={[styles.compactTechniqueCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/study-technique/${technique.id}` as any)}
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

      {/* Course Picker Modal */}
      <CoursePickerModal
        visible={showCoursePickerModal}
        onClose={() => setShowCoursePickerModal(false)}
        onSelectCourse={handleAddCourseFromPicker}
      />
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  courseSubject: {
    fontSize: 15,
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  courseProgressContainer: {
    alignItems: 'flex-end',
  },
  courseMetaContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  targetGradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  targetGradeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  courseProgress: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
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
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
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