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
  Clock, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Play,
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { getCourseStyle } from '@/components/CourseHero';
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
  const slideAnim = useRef(new Animated.Value(20)).current;

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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

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
        isLastLesson ? '🎉 Kurs slutförd!' : 'Grattis! 🎉',
        isLastLesson 
          ? 'Du har slutfört hela kursen! Fantastiskt jobbat!' 
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
      router.replace(`/content-lesson/${nextLesson.id}` as any);
    } else if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        router.replace(`/content-lesson/${nextModule.lessons[0].id}` as any);
      }
    } else {
      router.push(`/content-course/${course.id}` as any);
    }
  };

  const navigateToPreviousLesson = () => {
    if (!course || !module || !lesson) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
    const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);

    if (currentLessonIndex > 0) {
      const prevLesson = module.lessons[currentLessonIndex - 1];
      router.replace(`/content-lesson/${prevLesson.id}` as any);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        router.replace(`/content-lesson/${prevModule.lessons[prevModule.lessons.length - 1].id}` as any);
      }
    }
  };

  const navigateToModule = () => {
    if (module) {
      router.push(`/content-module/${module.id}` as any);
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
                    <View style={[styles.numberBadge, { backgroundColor: courseStyle.primaryColor + '20' }]}>
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
        <Stack.Screen 
          options={{ 
            title: 'Lektion ej hittad',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text
          }} 
        />
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

  const LessonIcon = getLessonTypeIcon(lesson.type);
  const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
  const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);
  const hasPrevious = currentLessonIndex > 0 || currentModuleIndex > 0;
  const hasNext = currentLessonIndex < module.lessons.length - 1 || currentModuleIndex < course.modules.length - 1;

  const totalLessonsInModule = module.lessons.length;
  const lessonNumber = currentLessonIndex + 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={courseStyle.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.heroContent}>
              <TouchableOpacity 
                style={styles.moduleBreadcrumb}
                onPress={navigateToModule}
              >
                <ChevronLeft size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.moduleBreadcrumbText} numberOfLines={1}>
                  {module.title}
                </Text>
              </TouchableOpacity>

              <View style={styles.lessonBadgeRow}>
                <View style={styles.lessonTypeBadge}>
                  <LessonIcon size={14} color="white" />
                  <Text style={styles.lessonTypeText}>
                    {lesson.type === 'text' ? 'Läsning' : 
                     lesson.type === 'video' ? 'Video' : 'Quiz'}
                  </Text>
                </View>
                <View style={styles.lessonNumberBadge}>
                  <Text style={styles.lessonNumberText}>
                    {lessonNumber} / {totalLessonsInModule}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              
              <View style={styles.lessonMeta}>
                {lesson.durationMinutes && (
                  <View style={styles.metaItem}>
                    <Clock size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.metaText}>{lesson.durationMinutes} min</Text>
                  </View>
                )}
              </View>

              {completed && (
                <View style={styles.completedBadge}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={styles.completedBadgeText}>Slutförd</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View 
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
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
        </Animated.View>

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
            >
              <CheckCircle size={22} color="white" />
              <Text style={styles.completeButtonText}>
                {isCompleting ? 'Sparar...' : 'Markera som slutförd'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.completedIndicator, { backgroundColor: theme.colors.success + '15' }]}>
              <Award size={26} color={theme.colors.success} />
              <View style={styles.completedIndicatorInfo}>
                <Text style={[styles.completedIndicatorTitle, { color: theme.colors.success }]}>
                  Lektion slutförd!
                </Text>
                <Text style={[styles.completedIndicatorSubtitle, { color: theme.colors.textSecondary }]}>
                  Bra jobbat, fortsätt till nästa
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
              <ChevronLeft size={20} color={hasPrevious ? theme.colors.text : theme.colors.textMuted} />
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
              <ChevronRight size={20} color={hasNext ? 'white' : theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 30,
    left: -30,
  },
  heroContent: {},
  moduleBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleBreadcrumbText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  lessonBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  lessonTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lessonTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  lessonNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lessonNumberText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  lessonTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 12,
    lineHeight: 32,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  completedBadgeText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  contentCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 12,
    marginBottom: 14,
    lineHeight: 28,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
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
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  numberedText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    paddingTop: 4,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  completedIndicatorInfo: {
    flex: 1,
  },
  completedIndicatorTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  completedIndicatorSubtitle: {
    fontSize: 14,
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
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
