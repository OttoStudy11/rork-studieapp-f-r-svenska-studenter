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
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  BookOpen,
  Clock,
  Star
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import { InfoBox } from '@/components/CourseComponents';
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
  const [readingProgress, setReadingProgress] = useState(0);
  const scrollProgress = useRef(new Animated.Value(0)).current;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollViewRef = useRef<ScrollView>(null);

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
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    const progress = Math.min(100, Math.max(0, scrollPercentage));
    setReadingProgress(progress);
    
    Animated.timing(scrollProgress, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [scrollProgress]);

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
          <View key={index} style={styles.headingContainer}>
            <View style={[styles.headingAccent, { backgroundColor: courseStyle.primaryColor }]} />
            <Text 
              style={[styles.heading, { color: theme.colors.text }]}
            >
              {paragraph.replace(/\*\*/g, '')}
            </Text>
          </View>
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
                <Text key={partIndex} style={[styles.bold, { color: courseStyle.primaryColor }]}>
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

      <View style={styles.readingProgressContainer}>
        <View 
          style={[
            styles.readingProgressBar, 
            { 
              width: `${readingProgress}%`,
              backgroundColor: courseStyle.primaryColor 
            }
          ]} 
        />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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

        <Animated.View style={[
          styles.mainContent, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {completed && (
            <View style={[styles.completedBanner, { backgroundColor: theme.colors.success + '15' }]}>
              <View style={[styles.completedBannerIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Award size={24} color={theme.colors.success} />
              </View>
              <View style={styles.completedBannerContent}>
                <Text style={[styles.completedBannerTitle, { color: theme.colors.success }]}>
                  Lektion slutförd! ✓
                </Text>
                <Text style={[styles.completedBannerSubtitle, { color: theme.colors.textSecondary }]}>
                  Fortsätt till nästa lektion eller repetera innehållet.
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.progressInfoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.progressInfoHeader}>
              <View style={styles.progressInfoTextContainer}>
                <Text style={[styles.progressInfoTitle, { color: theme.colors.text }]}>Läsframsteg</Text>
                <Text style={[styles.progressInfoSubtitle, { color: theme.colors.textSecondary }]}>Scrolla för att läsa lektionen</Text>
              </View>
              <View style={styles.progressPercentContainer}>
                <Text style={[styles.progressPercentValue, { color: courseStyle.primaryColor }]}>{Math.round(readingProgress)}%</Text>
              </View>
            </View>
            <View style={[styles.lessonMetaRow, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <View style={styles.lessonMetaItem}>
                <View style={[styles.lessonMetaIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                  <BookOpen size={16} color={courseStyle.primaryColor} />
                </View>
                <Text style={[styles.lessonMetaLabel, { color: theme.colors.textSecondary }]}>Modul</Text>
                <Text style={[styles.lessonMetaValue, { color: theme.colors.text }]}>{currentModuleIndex + 1}</Text>
              </View>
              <View style={[styles.lessonMetaDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.lessonMetaItem}>
                <View style={[styles.lessonMetaIcon, { backgroundColor: theme.colors.info + '15' }]}>
                  <FileText size={16} color={theme.colors.info} />
                </View>
                <Text style={[styles.lessonMetaLabel, { color: theme.colors.textSecondary }]}>Lektion</Text>
                <Text style={[styles.lessonMetaValue, { color: theme.colors.text }]}>{lessonNumber}/{totalLessonsInModule}</Text>
              </View>
              {lesson.durationMinutes && (
                <>
                  <View style={[styles.lessonMetaDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.lessonMetaItem}>
                    <View style={[styles.lessonMetaIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                      <Clock size={16} color={theme.colors.warning} />
                    </View>
                    <Text style={[styles.lessonMetaLabel, { color: theme.colors.textSecondary }]}>Tid</Text>
                    <Text style={[styles.lessonMetaValue, { color: theme.colors.text }]}>{lesson.durationMinutes} min</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={[styles.contentCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.contentCardHeader}>
              <View style={[styles.contentCardIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <FileText size={20} color={courseStyle.primaryColor} />
              </View>
              <View style={styles.contentCardTitleContainer}>
                <Text style={[styles.contentCardTitle, { color: theme.colors.text }]}>
                  Lektionsinnehåll
                </Text>
                <Text style={[styles.contentCardSubtitle, { color: theme.colors.textSecondary }]}>
                  Läs igenom materialet noggrant
                </Text>
              </View>
            </View>

            <View style={[styles.contentDivider, { backgroundColor: theme.colors.border }]} />
            
            {lesson.content ? (
              <View style={styles.contentBody}>
                {renderContent(lesson.content)}
              </View>
            ) : (
              <View style={styles.noContent}>
                <BookOpen size={48} color={theme.colors.textMuted} />
                <Text style={[styles.noContentText, { color: theme.colors.textMuted }]}>
                  Inget innehåll tillgängligt för denna lektion.
                </Text>
              </View>
            )}
          </View>

          <InfoBox
            type="tip"
            title="Studietips"
            content="Anteckna viktiga punkter och försök förklara dem med egna ord. Det hjälper dig att minnas bättre."
            courseStyle={courseStyle}
          />

          <View style={styles.actionSection}>
            {!completed ? (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
                onPress={handleMarkCompleted}
                disabled={isCompleting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.success, '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.completeButtonGradient}
                >
                  <CheckCircle size={24} color="white" />
                  <Text style={styles.completeButtonText}>
                    {isCompleting ? 'Sparar...' : 'Markera som klar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.completedCard, { backgroundColor: theme.colors.success + '10' }]}>
                <View style={[styles.completedCardIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Star size={28} color={theme.colors.success} />
                </View>
                <View style={styles.completedCardContent}>
                  <Text style={[styles.completedCardTitle, { color: theme.colors.success }]}>
                    Utmärkt arbete!
                  </Text>
                  <Text style={[styles.completedCardSubtitle, { color: theme.colors.textSecondary }]}>
                    Du har klarat denna lektion. Fortsätt till nästa!
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
                <ChevronLeft size={20} color={hasPrevious ? courseStyle.primaryColor : theme.colors.textMuted} />
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

            <TouchableOpacity
              style={[styles.backToModuleButton, { backgroundColor: theme.colors.surface }]}
              onPress={navigateToModule}
            >
              <BookOpen size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.backToModuleText, { color: theme.colors.textSecondary }]}>
                Tillbaka till modulöversikt
              </Text>
            </TouchableOpacity>
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
  readingProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 100,
  },
  readingProgressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
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
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    gap: 12,
  },
  completedBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBannerContent: {
    flex: 1,
  },
  completedBannerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  completedBannerSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  lessonMetaCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  progressInfoCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  progressInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfoTextContainer: {
    flex: 1,
  },
  progressInfoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  progressInfoSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  progressPercentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  progressPercentValue: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  lessonMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  lessonMetaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonMetaLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  lessonMetaValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  lessonMetaDivider: {
    width: 1,
    height: 50,
    marginHorizontal: 12,
  },
  contentCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  contentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCardTitleContainer: {
    flex: 1,
  },
  contentCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  contentCardSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  contentDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  contentBody: {
    padding: 20,
  },
  noContent: {
    alignItems: 'center',
    padding: 40,
  },
  noContentText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  headingAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginTop: 2,
  },
  heading: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 18,
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
    marginTop: 10,
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
    gap: 16,
    marginBottom: 20,
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  completedCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCardContent: {
    flex: 1,
  },
  completedCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  completedCardSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
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
    elevation: 3,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  backToModuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backToModuleText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
