import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { 
  Play,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  Zap,
  Calendar,
  Award,
  TrendingUp,
  Layers
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import {
  LearningObjectives,
  MotivationCard,
  CourseIntro,
  ModuleCardEnhanced,
  QuickActionButton,
  SectionHeader,
  ProgressSummary,
  InfoBox
} from '@/components/CourseComponents';
import AddExamModal from '@/components/AddExamModal';
import { useExams } from '@/contexts/ExamContext';
import * as Haptics from 'expo-haptics';

const getLearningObjectives = (courseTitle: string): string[] => {
  const title = courseTitle.toLowerCase();
  
  if (title.includes('matematik')) {
    return [
      'Lösa matematiska problem med säkerhet',
      'Förstå grundläggande algebraiska begrepp',
      'Tillämpa matematiska metoder i praktiken',
      'Analysera och tolka matematiska resultat'
    ];
  }
  if (title.includes('svenska')) {
    return [
      'Skriva välstrukturerade texter',
      'Analysera och tolka litterära verk',
      'Uttrycka dig tydligt i tal och skrift',
      'Förstå språkets struktur och regler'
    ];
  }
  if (title.includes('engelska')) {
    return [
      'Kommunicera flytande på engelska',
      'Förstå och analysera engelska texter',
      'Skriva grammatiskt korrekt engelska',
      'Använda engelskan i olika sammanhang'
    ];
  }
  if (title.includes('studieteknik')) {
    return [
      'Använda effektiva inlärningsstrategier',
      'Planera och organisera dina studier',
      'Hantera stress och prestationsångest',
      'Maximera din studietid och motivation'
    ];
  }
  if (title.includes('stress')) {
    return [
      'Identifiera och hantera stressorer',
      'Använda avslappningstekniker effektivt',
      'Skapa hälsosamma rutiner',
      'Balansera studier och återhämtning'
    ];
  }
  
  return [
    'Förstå kursens grundläggande koncept',
    'Tillämpa kunskapen praktiskt',
    'Utveckla analytiskt tänkande',
    'Förbereda dig för examination'
  ];
};

const getMotivationQuote = (courseTitle: string): { quote: string; author: string } => {
  const title = courseTitle.toLowerCase();
  
  if (title.includes('matematik')) {
    return {
      quote: 'Matematik är inte om siffror, ekvationer eller algoritmer: det handlar om att förstå.',
      author: 'William Paul Thurston'
    };
  }
  if (title.includes('svenska')) {
    return {
      quote: 'Språket är nyckeln till tanken.',
      author: 'Ludwig Wittgenstein'
    };
  }
  if (title.includes('studieteknik')) {
    return {
      quote: 'Framgång kommer inte till dig, du måste gå och hämta den.',
      author: 'Marva Collins'
    };
  }
  
  return {
    quote: 'Utbildning är det mest kraftfulla vapnet du kan använda för att förändra världen.',
    author: 'Nelson Mandela'
  };
};

export default function ContentCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { 
    getCourseById, 
    getCourseProgress, 
    getModuleProgress,
    isLessonCompleted,
    updateLastAccessed,
    isLoading 
  } = useCourseContent();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showExamModal, setShowExamModal] = React.useState(false);
  
  const { exams } = useExams();
  const courseExams = id ? exams.filter(exam => exam.courseId === id) : [];

  const course = id ? getCourseById(id) : undefined;
  const progress = id ? getCourseProgress(id) : undefined;
  const courseStyle = course ? getCourseStyle(course.title.split(' ')[0]) : getCourseStyle('default');

  const learningObjectives = useMemo(() => 
    course ? getLearningObjectives(course.title) : [], 
    [course]
  );

  const motivationQuote = useMemo(() => 
    course ? getMotivationQuote(course.title) : { quote: '', author: '' }, 
    [course]
  );

  useFocusEffect(
    useCallback(() => {
      if (id) {
        console.log('Course screen focused, updating last accessed');
        updateLastAccessed(id);
      }
    }, [id, updateLastAccessed])
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

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (id) {
      await updateLastAccessed(id);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  }, [id, updateLastAccessed]);

  const navigateToLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-lesson/${lessonId}` as never);
  };

  const navigateToModule = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-module/${moduleId}` as never);
  };

  const handleStartCourse = () => {
    if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigateToLesson(course.modules[0].lessons[0].id);
    }
  };

  const getNextIncompleteLesson = () => {
    if (!course || !id) return null;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!isLessonCompleted(id, lesson.id)) {
          return lesson;
        }
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar kurs...
          </Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <BookOpen size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Kursen hittades inte
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den kurs du söker finns inte längre eller har flyttats.
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

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + (l.durationMinutes || 0), 0), 
    0
  );
  const estimatedHours = Math.ceil(totalDuration / 60);
  const isCompleted = progress?.percentComplete === 100;
  const nextLesson = getNextIncompleteLesson();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <CourseHeader
          title={course.title}
          subtitle={course.description}
          courseStyle={courseStyle}
          badge="Studiekurs"
          isCompleted={isCompleted}
          stats={[
            { label: 'moduler', value: course.modules.length, icon: 'modules' },
            { label: 'lektioner', value: totalLessons, icon: 'lessons' },
            { label: estimatedHours > 0 ? 'timmar' : 'min', value: estimatedHours > 0 ? estimatedHours : totalDuration, icon: 'time' }
          ]}
          progress={progress ? {
            completed: progress.lessonsCompleted,
            total: progress.totalLessons || totalLessons,
            percentage: progress.percentComplete
          } : undefined}
        />

        <Animated.View style={[
          styles.mainContent, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {progress && progress.percentComplete === 0 && (
            <QuickActionButton
              icon={<Sparkles size={24} color="white" />}
              label="Börja kursen"
              sublabel="Starta din läranderesa nu"
              onPress={handleStartCourse}
              courseStyle={courseStyle}
              variant="primary"
            />
          )}

          {progress && progress.percentComplete > 0 && progress.percentComplete < 100 && nextLesson && (
            <QuickActionButton
              icon={<Play size={24} color="white" />}
              label="Fortsätt studera"
              sublabel={nextLesson.title}
              onPress={() => navigateToLesson(nextLesson.id)}
              courseStyle={courseStyle}
              variant="primary"
            />
          )}

          {isCompleted && (
            <View style={[styles.completedBanner, { backgroundColor: theme.colors.success + '15' }]}>
              <View style={[styles.completedBannerIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Award size={28} color={theme.colors.success} />
              </View>
              <View style={styles.completedBannerContent}>
                <Text style={[styles.completedBannerTitle, { color: theme.colors.success }]}>
                  Kurs slutförd! 🎉
                </Text>
                <Text style={[styles.completedBannerSubtitle, { color: theme.colors.textSecondary }]}>
                  Bra jobbat! Du har klarat alla lektioner i denna kurs.
                </Text>
              </View>
            </View>
          )}

          {progress && progress.percentComplete > 0 && (
            <ProgressSummary
              completed={progress.lessonsCompleted}
              total={progress.totalLessons || totalLessons}
              percentage={progress.percentComplete}
              courseStyle={courseStyle}
            />
          )}

          <CourseIntro
            title={course.title}
            description={course.description}
            courseStyle={courseStyle}
            difficulty="Nybörjare"
          />

          <LearningObjectives
            objectives={learningObjectives}
            courseStyle={courseStyle}
          />

          <MotivationCard
            quote={motivationQuote.quote}
            author={motivationQuote.author}
            courseStyle={courseStyle}
          />

          <QuickActionButton
            icon={<Zap size={20} color={courseStyle.primaryColor} />}
            label="AI Flashcards"
            sublabel="Generera och öva med intelligenta flashcards"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/flashcards-v2/${id}` as never);
            }}
            courseStyle={courseStyle}
            variant="secondary"
          />

          <View style={styles.examsSection}>
            <SectionHeader
              title="Prov"
              subtitle="Planerade examinationer"
              icon={<Calendar size={20} color={theme.colors.primary} />}
              courseStyle={courseStyle}
              action={{
                label: 'Lägg till',
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowExamModal(true);
                }
              }}
            />

            {courseExams.length > 0 ? (
              <View style={styles.examsList}>
                {courseExams
                  .filter(exam => exam.status === 'scheduled')
                  .sort((a, b) => a.examDate.getTime() - b.examDate.getTime())
                  .slice(0, 3)
                  .map((exam) => {
                    const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
                    
                    return (
                      <View
                        key={exam.id}
                        style={[
                          styles.examCard,
                          { backgroundColor: theme.colors.card },
                          isUpcoming && { borderLeftWidth: 3, borderLeftColor: theme.colors.warning }
                        ]}
                      >
                        <View style={styles.examCardHeader}>
                          <View style={[styles.examDateBadge, { backgroundColor: isUpcoming ? theme.colors.warning + '15' : courseStyle.primaryColor + '15' }]}>
                            <Text style={[styles.examDateDay, { color: isUpcoming ? theme.colors.warning : courseStyle.primaryColor }]}>
                              {exam.examDate.getDate()}
                            </Text>
                            <Text style={[styles.examDateMonth, { color: isUpcoming ? theme.colors.warning : courseStyle.primaryColor }]}>
                              {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.examCardInfo}>
                            <Text style={[styles.examCardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                              {exam.title}
                            </Text>
                            <View style={styles.examCardMeta}>
                              <View style={styles.examMetaItem}>
                                <Clock size={12} color={theme.colors.textMuted} />
                                <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                                  {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>
                              {exam.location && (
                                <View style={styles.examMetaItem}>
                                  <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>•</Text>
                                  <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                                    {exam.location}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        {isUpcoming && (
                          <View style={[styles.examWarning, { backgroundColor: theme.colors.warning + '10' }]}>
                            <Text style={[styles.examWarningText, { color: theme.colors.warning }]}>
                              Om {daysUntil} {daysUntil === 1 ? 'dag' : 'dagar'}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>
            ) : (
              <View style={[styles.noExamsCard, { backgroundColor: theme.colors.card }]}>
                <Calendar size={32} color={theme.colors.textMuted} />
                <Text style={[styles.noExamsText, { color: theme.colors.textSecondary }]}>
                  Inga prov planerade än
                </Text>
                <Text style={[styles.noExamsHint, { color: theme.colors.textMuted }]}>
                  Tryck på Lägg till för att schemalägga ett prov
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modulesSection}>
            <SectionHeader
              title="Kursinnehåll"
              subtitle={`${course.modules.length} moduler • ${totalLessons} lektioner`}
              icon={<Layers size={20} color={courseStyle.primaryColor} />}
              courseStyle={courseStyle}
            />

            <InfoBox
              type="tip"
              title="Tips för att lyckas"
              content="Arbeta igenom modulerna i ordning för bästa inlärningsresultat. Varje modul bygger på tidigare kunskap."
              courseStyle={courseStyle}
            />

            {course.modules.map((module, moduleIndex) => {
              const moduleProgress = id ? getModuleProgress(id, module.id) : undefined;
              const isModuleCompleted = moduleProgress?.percentComplete === 100;
              const isModuleLocked = course.premiumRequired && moduleIndex > 0;
              const moduleDuration = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

              return (
                <ModuleCardEnhanced
                  key={module.id}
                  moduleIndex={moduleIndex}
                  title={module.title}
                  description={module.description}
                  lessonsCount={module.lessons.length}
                  durationMinutes={moduleDuration}
                  isCompleted={isModuleCompleted}
                  isLocked={isModuleLocked}
                  progressPercent={moduleProgress?.percentComplete || 0}
                  courseStyle={courseStyle}
                  onPress={() => !isModuleLocked && navigateToModule(module.id)}
                />
              );
            })}
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <BookOpen size={20} color={courseStyle.primaryColor} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{course.modules.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Moduler</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.info + '15' }]}>
                <FileText size={20} color={theme.colors.info} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalLessons}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Lektioner</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                <Clock size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {estimatedHours > 0 ? `${estimatedHours}h` : `${totalDuration}m`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Studietid</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                <TrendingUp size={20} color={theme.colors.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{progress?.percentComplete || 0}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Klart</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <AddExamModal
        visible={showExamModal}
        onClose={() => setShowExamModal(false)}
        courseId={id}
        courseTitle={course?.title}
      />
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
    paddingBottom: 50,
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
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    gap: 14,
  },
  completedBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBannerContent: {
    flex: 1,
  },
  completedBannerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  completedBannerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  modulesSection: {
    marginTop: 8,
  },
  examsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  examsList: {
    gap: 12,
  },
  examCard: {
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  examCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  examDateBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examDateDay: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  examDateMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  examCardInfo: {
    flex: 1,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  examCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  examMetaText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  examWarning: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  examWarningText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  noExamsCard: {
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noExamsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 14,
    marginBottom: 6,
  },
  noExamsHint: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 28,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});
