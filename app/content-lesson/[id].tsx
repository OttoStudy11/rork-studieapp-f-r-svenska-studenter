import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  BookOpen
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import * as Haptics from 'expo-haptics';

export default function ContentLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { 
    findLessonById, 
    markLessonCompleted, 
    isLessonCompleted,
    getCourseProgress
  } = useCourseContent();

  const [startTime] = useState(new Date());
  const [isCompleting, setIsCompleting] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lessonData = id ? findLessonById(id) : undefined;
  const course = lessonData?.course;
  const module = lessonData?.module;
  const lesson = lessonData?.lesson;
  
  const courseStyle = course ? getCourseStyle(course.title.split(' ')[0]) : getCourseStyle('default');
  const completed = (course && lesson ? isLessonCompleted(course.id, lesson.id) : false) || localCompleted;

  useFocusEffect(
    useCallback(() => {
      if (course && lesson) {
        setLocalCompleted(isLessonCompleted(course.id, lesson.id));
      }
    }, [course, lesson, isLessonCompleted])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleMarkCompleted = async () => {
    if (!course || !lesson || completed || isCompleting) return;

    setIsCompleting(true);
    
    try {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
      await markLessonCompleted(course.id, lesson.id, timeSpent);
      
      setLocalCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const progress = getCourseProgress(course.id);
      const isLastLesson = progress && progress.percentComplete === 100;
      
      Alert.alert(
        isLastLesson ? '🎉 Kurs slutförd!' : 'Bra jobbat! 🎉',
        isLastLesson 
          ? 'Du har slutfört hela kursen! Fantastiskt!' 
          : 'Du har slutfört lektionen!',
        [
          {
            text: 'Fortsätt',
            onPress: () => navigateToNextLesson()
          },
          {
            text: 'Stanna kvar',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      Alert.alert('Fel', 'Kunde inte markera lektionen som slutförd.');
    } finally {
      setIsCompleting(false);
    }
  };

  const navigateToNextLesson = () => {
    if (!course || !module || !lesson) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
    const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);

    if (currentLessonIndex < module.lessons.length - 1) {
      const nextLesson = module.lessons[currentLessonIndex + 1];
      router.replace(`/content-lesson/${nextLesson.id}` as never);
    } else if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        router.replace(`/content-lesson/${nextModule.lessons[0].id}` as never);
      }
    } else {
      router.push(`/content-course/${course.id}` as never);
    }
  };

  const navigateToPreviousLesson = () => {
    if (!course || !module || !lesson) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
    const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);

    if (currentLessonIndex > 0) {
      const prevLesson = module.lessons[currentLessonIndex - 1];
      router.replace(`/content-lesson/${prevLesson.id}` as never);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        router.replace(`/content-lesson/${prevModule.lessons[prevModule.lessons.length - 1].id}` as never);
      }
    }
  };

  const navigateToModule = () => {
    if (module) {
      router.push(`/content-module/${module.id}` as never);
    }
  };

  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <Text 
            key={index} 
            style={[styles.heading, { color: theme.colors.text }]}
          >
            {paragraph.replace(/\*\*/g, '')}
          </Text>
        );
      }
      
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n');
        return (
          <View key={index} style={styles.bulletList}>
            {items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.bulletItem}>
                <View style={[styles.bulletDot, { backgroundColor: courseStyle.primaryColor }]} />
                <Text style={[styles.bulletText, { color: theme.colors.text }]}>
                  {item.replace(/^- /, '')}
                </Text>
              </View>
            ))}
          </View>
        );
      }

      if (paragraph.match(/^\d+\./)) {
        const items = paragraph.split('\n');
        return (
          <View key={index} style={styles.numberedList}>
            {items.map((item, itemIndex) => {
              const match = item.match(/^(\d+)\.\s*(.*)$/);
              if (match) {
                return (
                  <View key={itemIndex} style={styles.numberedItem}>
                    <View style={[styles.numberBadge, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                      <Text style={[styles.numberText, { color: courseStyle.primaryColor }]}>
                        {match[1]}
                      </Text>
                    </View>
                    <Text style={[styles.numberedText, { color: theme.colors.text }]}>
                      {match[2]}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        );
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = paragraph.split(boldRegex);
      
      return (
        <Text key={index} style={[styles.paragraph, { color: theme.colors.text }]}>
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              return (
                <Text key={partIndex} style={styles.bold}>
                  {part}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      );
    });
  };

  if (!course || !module || !lesson) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <FileText size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Lektionen hittades inte
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den lektion du söker finns inte längre.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
  const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);
  const hasPrevious = currentLessonIndex > 0 || currentModuleIndex > 0;
  const hasNext = currentLessonIndex < module.lessons.length - 1 || currentModuleIndex < course.modules.length - 1;

  const totalLessonsInModule = module.lessons.length;
  const lessonNumber = currentLessonIndex + 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        <CourseHeader
          title={lesson.title}
          courseStyle={courseStyle}
          breadcrumb={{
            label: module.title,
            onPress: navigateToModule
          }}
          lessonType={lesson.type as 'text' | 'video' | 'quiz'}
          lessonNumber={`${lessonNumber} / ${totalLessonsInModule}`}
          isCompleted={completed}
          stats={lesson.durationMinutes ? [
            { label: 'min', value: lesson.durationMinutes, icon: 'time' }
          ] : undefined}
        />

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={[styles.contentCard, { backgroundColor: theme.colors.card }]}>
            {lesson.content ? (
              renderContent(lesson.content)
            ) : (
              <View style={styles.noContent}>
                <BookOpen size={48} color={theme.colors.textMuted} />
                <Text style={[styles.noContentText, { color: theme.colors.textMuted }]}>
                  Inget innehåll tillgängligt för denna lektion.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionSection}>
            {!completed ? (
              <TouchableOpacity
                style={[
                  styles.completeButton, 
                  { backgroundColor: theme.colors.success },
                  isCompleting && styles.completeButtonDisabled
                ]}
                onPress={handleMarkCompleted}
                disabled={isCompleting}
                activeOpacity={0.8}
              >
                <CheckCircle size={22} color="white" />
                <Text style={styles.completeButtonText}>
                  {isCompleting ? 'Sparar...' : 'Markera som klar'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.completedIndicator, { backgroundColor: theme.colors.success + '10' }]}>
                <Award size={26} color={theme.colors.success} />
                <View style={styles.completedIndicatorInfo}>
                  <Text style={[styles.completedIndicatorTitle, { color: theme.colors.success }]}>
                    Lektion slutförd!
                  </Text>
                  <Text style={[styles.completedIndicatorSubtitle, { color: theme.colors.textSecondary }]}>
                    Fortsätt till nästa lektion
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: theme.colors.card },
                  !hasPrevious && styles.navButtonDisabled
                ]}
                onPress={navigateToPreviousLesson}
                disabled={!hasPrevious}
              >
                <ChevronLeft size={18} color={hasPrevious ? theme.colors.text : theme.colors.textMuted} />
                <Text style={[
                  styles.navButtonText, 
                  { color: hasPrevious ? theme.colors.text : theme.colors.textMuted }
                ]}>
                  Föregående
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: hasNext ? courseStyle.primaryColor : theme.colors.card },
                  !hasNext && styles.navButtonDisabled
                ]}
                onPress={navigateToNextLesson}
                disabled={!hasNext}
              >
                <Text style={[
                  styles.navButtonText, 
                  { color: hasNext ? 'white' : theme.colors.textMuted }
                ]}>
                  Nästa
                </Text>
                <ChevronRight size={18} color={hasNext ? 'white' : theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  contentCard: {
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  noContent: {
    alignItems: 'center',
    padding: 32,
  },
  noContentText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 18,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700' as const,
    marginTop: 12,
    marginBottom: 14,
    lineHeight: 26,
  },
  bold: {
    fontWeight: '600' as const,
  },
  bulletList: {
    marginBottom: 18,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 9,
    marginRight: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
  },
  numberedList: {
    marginBottom: 18,
  },
  numberedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  numberedText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    paddingTop: 3,
  },
  actionSection: {
    gap: 16,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  completedIndicatorInfo: {
    flex: 1,
  },
  completedIndicatorTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  completedIndicatorSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
