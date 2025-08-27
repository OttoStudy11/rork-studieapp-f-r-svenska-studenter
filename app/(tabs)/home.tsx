import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/contexts/StudyContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useToast } from '@/contexts/ToastContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BookOpen, Clock, Target, Plus, Award, Zap, Star, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import { AnimatedPressable, FadeInView, SlideInView } from '@/components/Animations';
import { Skeleton, SkeletonStats, SkeletonList } from '@/components/Skeleton';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, courses, notes, pomodoroSessions, isLoading } = useStudy();
  const { totalPoints, getUserLevel, getRecentAchievements, currentStreak } = useAchievements();
  const { showSuccess } = useToast();
  const { isPremium, limits, isDemoMode, canAddCourse, canAddNote, showPremiumModal } = usePremium();
  const { theme, isDark } = useTheme();
  
  const handleAddCourse = () => {
    if (!canAddCourse(courses.length)) {
      showPremiumModal('Obegränsat antal kurser');
      return;
    }
    router.push('/courses');
  };
  
  const handleAddNote = () => {
    if (!canAddNote(notes.length)) {
      showPremiumModal('Obegränsat antal anteckningar');
      return;
    }
    router.push('/notes');
  };

  // Handle loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Ingen användardata tillgänglig</Text>
      </View>
    );
  }

  const activeCourses = courses.filter(course => course.isActive);
  const recentNotes = notes.slice(-3);
  const todaySessions = pomodoroSessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.endTime).toDateString();
    return today === sessionDate;
  });

  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;

  const userLevel = getUserLevel();
  const recentAchievements = getRecentAchievements(3);
  const totalStudyTime = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hej, {user?.name}! 👋</Text>
              <Text style={styles.subtitle}>Redo att plugga idag?</Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={16} color="#FFD700" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Text style={styles.demoText}>🎯 Demo-läge aktivt</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Stats */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.statsContainer}>
            <AnimatedPressable style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <BookOpen size={24} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{activeCourses.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aktiva kurser</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Clock size={24} color={theme.colors.secondary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{todaySessions.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sessioner idag</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Zap size={24} color={theme.colors.warning} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Dagars streak</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Star size={24} color="#8B5CF6" />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalPoints}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Poäng</Text>
            </AnimatedPressable>
          </View>
        </SlideInView>

        {/* Level Progress */}
        <View style={styles.section}>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Award size={20} color="#4F46E5" />
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Nivå {userLevel.level}</Text>
                <Text style={styles.levelSubtitle}>{userLevel.title}</Text>
              </View>
              <TouchableOpacity 
                style={styles.achievementsButton}
                onPress={() => showSuccess('Achievements', 'Kommer snart!')}
              >
                <Text style={styles.achievementsButtonText}>Se alla</Text>
              </TouchableOpacity>
            </View>
            {recentAchievements.length > 0 && (
              <View style={styles.recentAchievements}>
                <Text style={styles.recentAchievementsTitle}>Senaste prestationer:</Text>
                {recentAchievements.slice(0, 2).map((achievement) => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementText}>{achievement.title}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Active Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktiva kurser</Text>
            <TouchableOpacity onPress={() => router.push('/courses')}>
              <Text style={styles.seeAllText}>Se alla</Text>
            </TouchableOpacity>
          </View>
          
          {/* Premium limits info */}
          {!isPremium && (
            <View style={styles.limitsCard}>
              <View style={styles.limitsHeader}>
                <Crown size={20} color="#F59E0B" />
                <Text style={styles.limitsTitle}>Gratis-plan</Text>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/premium')}
                >
                  <Text style={styles.upgradeButtonText}>Uppgradera</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.limitsContent}>
                <Text style={styles.limitText}>
                  Kurser: {courses.length}/{limits.maxCourses}
                </Text>
                <Text style={styles.limitText}>
                  Anteckningar: {notes.length}/{limits.maxNotes}
                </Text>
              </View>
            </View>
          )}
          
          {activeCourses.length > 0 ? (
            activeCourses.map((course) => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseProgress}>{course.progress}%</Text>
                </View>
                <Text style={styles.courseSubject}>{course.subject}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${course.progress}%` }]} 
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Inga aktiva kurser</Text>
              <Text style={styles.emptyText}>Lägg till kurser för att komma igång</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/courses')}
              >
                <Plus size={20} color="white" />
                <Text style={styles.addButtonText}>Lägg till kurs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Senaste anteckningar</Text>
            <TouchableOpacity onPress={() => router.push('/notes')}>
              <Text style={styles.seeAllText}>Se alla</Text>
            </TouchableOpacity>
          </View>
          
          {recentNotes.length > 0 ? (
            recentNotes.map((note) => (
              <TouchableOpacity key={note.id} style={styles.noteCard}>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.content}
                </Text>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleDateString('sv-SE')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Inga anteckningar än</Text>
            </View>
          )}
        </View>

        {/* Study Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekommendationer för dig</Text>
          
          {currentStreak === 0 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>🔥 Starta din streak!</Text>
              <Text style={styles.recommendationText}>
                Börja plugga idag för att starta din studiestreak. Konsekvent pluggande ger bäst resultat!
              </Text>
            </View>
          )}
          
          {currentStreak > 0 && currentStreak < 7 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>💪 Håll streaken vid liv!</Text>
              <Text style={styles.recommendationText}>
                Du har pluggat {currentStreak} dagar i rad. Fortsätt så här för att nå 7-dagars målet!
              </Text>
            </View>
          )}
          
          {!isPremium && courses.length >= limits.maxCourses && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>📚 Uppgradera för fler kurser</Text>
              <Text style={styles.recommendationText}>
                Du har nått gränsen för gratis-planen. Uppgradera till Premium för obegränsat antal kurser!
              </Text>
            </View>
          )}
          
          {!isPremium && notes.length >= limits.maxNotes && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>📝 Uppgradera för fler anteckningar</Text>
              <Text style={styles.recommendationText}>
                Du har nått gränsen för anteckningar. Premium ger dig obegränsat utrymme!
              </Text>
            </View>
          )}
          
          {totalStudyTime < 60 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>⏰ Använd Pomodoro-tekniken</Text>
              <Text style={styles.recommendationText}>
                Prova 25-minuters fokussessioner för bättre koncentration och för att låsa upp prestationer.
              </Text>
            </View>
          )}
          
          {activeCourses.length === 0 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>📚 Lägg till kurser</Text>
              <Text style={styles.recommendationText}>
                Lägg till dina kurser för att få personliga rekommendationer och spåra din progress.
              </Text>
            </View>
          )}
          
          {notes.length === 0 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>📝 Börja anteckna</Text>
              <Text style={styles.recommendationText}>
                Anteckningar hjälper dig att komma ihåg viktiga koncept och förbättra ditt lärande.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demoBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  demoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  courseProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  courseSubject: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Level and Achievement styles
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementsButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  achievementsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recentAchievements: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  recentAchievementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  limitsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  limitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  limitsContent: {
    flexDirection: 'row',
    gap: 16,
  },
  limitText: {
    fontSize: 14,
    color: '#6B7280',
  },
});