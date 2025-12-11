import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
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
  BookOpen, 
  CheckCircle,
  ChevronRight,
  Play,
  Clock,
  ChevronLeft,
  Target,
  Award,
  TrendingUp
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { CourseHeader, getCourseStyle } from '@/components/CourseHeader';
import {
  LessonCardEnhanced,
  SectionHeader,
  InfoBox,
  ProgressSummary
} from '@/components/CourseComponents';
import * as Haptics from 'expo-haptics';

const getModuleObjectives = (moduleTitle: string): string[] => {
  const title = moduleTitle.toLowerCase();
  
  if (title.includes('grunderna') || title.includes('introduktion')) {
    return [
      'Förstå de grundläggande koncepten',
      'Bygga en stabil kunskapsbas',
      'Förbereda dig för mer avancerade ämnen'
    ];
  }
  if (title.includes('praktisk') || title.includes('övning')) {
    return [
      'Tillämpa teorin i praktiken',
      'Utveckla problemlösningsförmåga',
      'Öka din självständighet'
    ];
  }
  if (title.includes('minnes') || title.includes('repetition')) {
    return [
      'Förstärka din minneskapacitet',
      'Lära dig effektiva repetitionstekniker',
      'Skapa långsiktiga kunskaper'
    ];
  }
  if (title.includes('strategier') || title.includes('prov')) {
    return [
      'Förbereda dig optimalt för examination',
      'Hantera stress och prestationsångest',
      'Maximera dina resultat'
    ];
  }
  
  return [
    'Förstå modulens huvudbegrepp',
    'Utveckla praktiska färdigheter',
    'Förbereda dig för nästa steg'
  ];
};

const getModuleTip = (moduleTitle: string): { title: string; content: string } => {
  const title = moduleTitle.toLowerCase();
  
  if (title.includes('grunderna')) {
    return {
      title: 'Starta rätt',
      content: 'Ta dig tid att verkligen förstå grunderna. En stark grund gör allt annat lättare.'
    };
  }
  if (title.includes('minnes')) {
    return {
      title: 'Repetera smart',
      content: 'Använd spaced repetition för bästa resultat. Repetera inte allt på en gång.'
    };
  }
  if (title.includes('strategier')) {
    return {
      title: 'Var förberedd',
      content: 'Börja förbereda dig i god tid. Stressa inte kvällen innan provet.'
    };
  }
  
  return {
    title: 'Håll fokus',
    content: 'Arbeta genom lektionerna i ordning och ta pauser regelbundet för bästa inlärning.'
  };
};

export default function ContentModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { 
    findModuleById, 
    getModuleProgress,
    isLessonCompleted,
    isLoading 
  } = useCourseContent();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const moduleData = id ? findModuleById(id) : undefined;
  const course = moduleData?.course;
  const module = moduleData?.module;
  
  const courseStyle = course ? getCourseStyle(course.title.split(' ')[0]) : getCourseStyle('default');
  const moduleProgress = course && module ? getModuleProgress(course.id, module.id) : undefined;

  const moduleObjectives = useMemo(() => 
    module ? getModuleObjectives(module.title) : [], 
    [module]
  );

  const moduleTip = useMemo(() => 
    module ? getModuleTip(module.title) : { title: '', content: '' }, 
    [module]
  );

  useFocusEffect(
    useCallback(() => {
      console.log('Module screen focused');
    }, [])
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
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const navigateToLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/content-lesson/${lessonId}` as never);
  };

  const navigateToCourse = () => {
    if (course) {
      router.push(`/content-course/${course.id}` as never);
    }
  };

  const getNextIncompleteLesson = () => {
    if (!course || !module) return null;
    for (const lesson of module.lessons) {
      if (!isLessonCompleted(course.id, lesson.id)) {
        return lesson;
      }
    }
    return null;
  };

  const handleContinueModule = () => {
    const nextLesson = getNextIncompleteLesson();
    if (nextLesson) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigateToLesson(nextLesson.id);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar modul...
          </Text>
        </View>
      </View>
    );
  }

  if (!course || !module) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <BookOpen size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Modulen hittades inte
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Den modul du söker finns inte längre eller har flyttats.
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
  const isFirstModule = currentModuleIndex === 0;
  const isLastModule = currentModuleIndex === course.modules.length - 1;
  const prevModule = !isFirstModule ? course.modules[currentModuleIndex - 1] : null;
  const nextModule = !isLastModule ? course.modules[currentModuleIndex + 1] : null;

  const totalDuration = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const isModuleCompleted = moduleProgress?.percentComplete === 100;
  const completedLessons = moduleProgress?.lessonsCompleted || 0;
  const nextIncompleteLesson = getNextIncompleteLesson();

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
          title={module.title}
          subtitle={module.description}
          courseStyle={courseStyle}
          breadcrumb={{
            label: course.title,
            onPress: navigateToCourse
          }}
          badge={`Modul ${currentModuleIndex + 1} av ${course.modules.length}`}
          isCompleted={isModuleCompleted}
          stats={[
            { label: 'lektioner', value: module.lessons.length, icon: 'lessons' },
            { label: 'min', value: totalDuration, icon: 'time' }
          ]}
          progress={moduleProgress && moduleProgress.percentComplete > 0 ? {
            completed: completedLessons,
            total: module.lessons.length,
            percentage: moduleProgress.percentComplete
          } : undefined}
        />

        <Animated.View style={[
          styles.mainContent, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {isModuleCompleted && (
            <View style={[styles.completedBanner, { backgroundColor: theme.colors.success + '15' }]}>
              <View style={[styles.completedBannerIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Award size={28} color={theme.colors.success} />
              </View>
              <View style={styles.completedBannerContent}>
                <Text style={[styles.completedBannerTitle, { color: theme.colors.success }]}>
                  Modul slutförd! 🎉
                </Text>
                <Text style={[styles.completedBannerSubtitle, { color: theme.colors.textSecondary }]}>
                  Bra jobbat! Du har klarat alla lektioner i denna modul.
                </Text>
              </View>
            </View>
          )}

          {!isModuleCompleted && nextIncompleteLesson && (
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: courseStyle.primaryColor }]}
              onPress={handleContinueModule}
              activeOpacity={0.8}
            >
              <View style={styles.continueCardContent}>
                <View style={styles.continueCardIcon}>
                  <Play size={24} color="white" />
                </View>
                <View style={styles.continueCardText}>
                  <Text style={styles.continueCardLabel}>
                    {completedLessons === 0 ? 'Börja modulen' : 'Fortsätt där du slutade'}
                  </Text>
                  <Text style={styles.continueCardTitle} numberOfLines={1}>
                    {nextIncompleteLesson.title}
                  </Text>
                </View>
              </View>
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          )}

          {moduleProgress && moduleProgress.percentComplete > 0 && (
            <ProgressSummary
              completed={completedLessons}
              total={module.lessons.length}
              percentage={moduleProgress.percentComplete}
              courseStyle={courseStyle}
            />
          )}

          <View style={[styles.moduleIntroCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.moduleIntroHeader}>
              <View style={[styles.moduleIntroIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <BookOpen size={22} color={courseStyle.primaryColor} />
              </View>
              <View style={styles.moduleIntroTitleContainer}>
                <Text style={[styles.moduleIntroTitle, { color: theme.colors.text }]}>
                  Om modulen
                </Text>
                <Text style={[styles.moduleIntroSubtitle, { color: theme.colors.textSecondary }]}>
                  {module.lessons.length} lektioner • {totalDuration} min
                </Text>
              </View>
            </View>
            <Text style={[styles.moduleIntroDescription, { color: theme.colors.text }]}>
              {module.description}
            </Text>
          </View>

          <View style={[styles.objectivesCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.objectivesHeader}>
              <View style={[styles.objectivesIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <Target size={20} color={courseStyle.primaryColor} />
              </View>
              <Text style={[styles.objectivesTitle, { color: theme.colors.text }]}>
                Lärandemål
              </Text>
            </View>
            <View style={styles.objectivesList}>
              {moduleObjectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <View style={[styles.objectiveCheck, { backgroundColor: courseStyle.primaryColor }]}>
                    <CheckCircle size={12} color="white" />
                  </View>
                  <Text style={[styles.objectiveText, { color: theme.colors.text }]}>
                    {objective}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <InfoBox
            type="tip"
            title={moduleTip.title}
            content={moduleTip.content}
            courseStyle={courseStyle}
          />

          <View style={styles.lessonsSection}>
            <SectionHeader
              title="Lektioner"
              subtitle={`${completedLessons} av ${module.lessons.length} klara`}
              icon={<BookOpen size={20} color={courseStyle.primaryColor} />}
              courseStyle={courseStyle}
            />

            {module.lessons.map((lesson, lessonIndex) => {
              const completed = course ? isLessonCompleted(course.id, lesson.id) : false;
              const isCurrentLesson = nextIncompleteLesson?.id === lesson.id;
              
              return (
                <LessonCardEnhanced
                  key={lesson.id}
                  lessonIndex={lessonIndex}
                  title={lesson.title}
                  type={lesson.type as 'text' | 'video' | 'quiz'}
                  durationMinutes={lesson.durationMinutes}
                  isCompleted={completed}
                  isNext={isCurrentLesson}
                  courseStyle={courseStyle}
                  onPress={() => navigateToLesson(lesson.id)}
                />
              );
            })}
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
                <BookOpen size={18} color={courseStyle.primaryColor} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{module.lessons.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Lektioner</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                <Clock size={18} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalDuration}m</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Studietid</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                <TrendingUp size={18} color={theme.colors.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{moduleProgress?.percentComplete || 0}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Klart</Text>
            </View>
          </View>

          <View style={styles.navigationSection}>
            <View style={styles.moduleNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: theme.colors.card },
                  !prevModule && styles.navButtonDisabled
                ]}
                onPress={() => prevModule && router.replace(`/content-module/${prevModule.id}` as never)}
                disabled={!prevModule}
              >
                <ChevronLeft size={20} color={prevModule ? courseStyle.primaryColor : theme.colors.textMuted} />
                <View style={styles.navButtonContent}>
                  <Text style={[
                    styles.navButtonLabel,
                    { color: prevModule ? theme.colors.textSecondary : theme.colors.textMuted }
                  ]}>
                    Föregående
                  </Text>
                  {prevModule && (
                    <Text 
                      style={[styles.navButtonTitle, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {prevModule.title}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: nextModule ? courseStyle.primaryColor : theme.colors.card },
                  !nextModule && styles.navButtonDisabled
                ]}
                onPress={() => nextModule && router.replace(`/content-module/${nextModule.id}` as never)}
                disabled={!nextModule}
              >
                <View style={styles.navButtonContent}>
                  <Text style={[
                    styles.navButtonLabel,
                    { color: nextModule ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted }
                  ]}>
                    Nästa
                  </Text>
                  {nextModule && (
                    <Text 
                      style={[styles.navButtonTitle, { color: 'white' }]}
                      numberOfLines={1}
                    >
                      {nextModule.title}
                    </Text>
                  )}
                </View>
                <ChevronRight size={20} color={nextModule ? 'white' : theme.colors.textMuted} />
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
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  continueCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueCardText: {
    flex: 1,
  },
  continueCardLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  continueCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  moduleIntroCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  moduleIntroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  moduleIntroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIntroTitleContainer: {
    flex: 1,
  },
  moduleIntroTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  moduleIntroSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  moduleIntroDescription: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  objectivesCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  objectivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  objectivesIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectivesTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  objectivesList: {
    gap: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  objectiveCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  lessonsSection: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  navigationSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  moduleNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonContent: {
    flex: 1,
  },
  navButtonLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  navButtonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
