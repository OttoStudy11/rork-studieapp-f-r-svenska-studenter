import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/contexts/StudyContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useToast } from '@/contexts/ToastContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Image } from 'expo-image';
import { BookOpen, Clock, Target, Plus, Award, Zap, Star, Crown, User, StickyNote, Edit3, TrendingUp, Calendar, Flame, Lightbulb, Brain, CheckCircle, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { AnimatedPressable, FadeInView, SlideInView } from '@/components/Animations';
import { Skeleton, SkeletonStats, SkeletonList } from '@/components/Skeleton';
import CharacterAvatar from '@/components/CharacterAvatar';

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
    showSuccess('Anteckningar', 'Anteckningsfunktionen kommer snart!');
  };

  // Handle loading
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Ingen användardata tillgänglig</Text>
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

  // Study tips and techniques data
  const studyTips = [
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

  const studyTechniques = [
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerLogo}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Hej, {user?.name}! 👋</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Redo att plugga idag?</Text>
            </View>
            <View style={styles.headerRight}>
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Crown size={16} color={theme.colors.warning} />
                  <Text style={[styles.premiumText, { color: theme.colors.warning }]}>Pro</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                {user.avatar ? (
                  <CharacterAvatar config={user.avatar} size={44} />
                ) : (
                  <View style={[styles.profileButtonFallback, { backgroundColor: theme.colors.primary + '15' }]}>
                    <User size={22} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {isDemoMode && (
            <View style={[styles.demoBanner, { backgroundColor: theme.colors.info + '15' }]}>
              <Text style={[styles.demoText, { color: theme.colors.info }]}>🎯 Demo-läge aktivt</Text>
            </View>
          )}
        </View>

        {/* Hero Stats Card */}
        <SlideInView direction="up" delay={100}>
          <LinearGradient
            colors={theme.colors.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Flame size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{currentStreak}</Text>
                  <Text style={styles.heroStatLabel}>Dagars streak</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Clock size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{todaySessions.length}</Text>
                  <Text style={styles.heroStatLabel}>Idag</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Star size={20} color="white" />
                  </View>
                  <Text style={styles.heroStatNumber}>{totalPoints}</Text>
                  <Text style={styles.heroStatLabel}>Poäng</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </SlideInView>



        {/* Quick Actions */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/timer')}
            >
              <Clock size={24} color="white" />
              <Text style={styles.actionButtonText}>Starta fokus</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={handleAddCourse}
            >
              <Plus size={24} color="white" />
              <Text style={styles.actionButtonText}>Ny kurs</Text>
            </TouchableOpacity>
          </View>
        </SlideInView>

        {/* Mini Stats Grid */}
        <SlideInView direction="up" delay={300}>
          <View style={styles.miniStatsGrid}>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <BookOpen size={20} color={theme.colors.primary} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{activeCourses.length}</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Aktiva kurser</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <TrendingUp size={20} color={theme.colors.secondary} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{averageProgress}%</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Genomsnitt</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: theme.colors.card }]}>
              <Calendar size={20} color={theme.colors.warning} />
              <Text style={[styles.miniStatNumber, { color: theme.colors.text }]}>{Math.round(totalStudyTime / 60)}h</Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>Total tid</Text>
            </View>
          </View>
        </SlideInView>

        {/* Level Progress */}
        <SlideInView direction="up" delay={400}>
          <View style={styles.section}>
            <View style={[styles.levelCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Award size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color: theme.colors.text }]}>Nivå {userLevel.level}</Text>
                  <Text style={[styles.levelSubtitle, { color: theme.colors.textSecondary }]}>{userLevel.title}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.achievementsButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/achievements')}
                >
                  <Text style={styles.achievementsButtonText}>Se alla</Text>
                </TouchableOpacity>
              </View>
              {recentAchievements.length > 0 && (
                <View style={[styles.recentAchievements, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.recentAchievementsTitle, { color: theme.colors.textSecondary }]}>Senaste prestationer:</Text>
                  {recentAchievements.slice(0, 2).map((achievement) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <Text style={[styles.achievementText, { color: theme.colors.text }]}>{achievement.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </SlideInView>

        {/* Study Tips Section */}
        <SlideInView direction="up" delay={500}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipsGrid}>
              {studyTips.slice(0, 6).map((tip, index) => (
                <FadeInView key={tip.id} delay={600 + index * 50}>
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

        {/* Premium Upgrade Banner */}
        {!isPremium && (
          <SlideInView direction="up" delay={700}>
            <View style={styles.section}>
              <TouchableOpacity 
                style={[styles.premiumBanner, { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning + '30' }]}
                onPress={() => router.push('/premium')}
              >
                <View style={styles.premiumBannerContent}>
                  <View style={styles.premiumBannerLeft}>
                    <Crown size={24} color={theme.colors.warning} />
                    <View style={styles.premiumBannerText}>
                      <Text style={[styles.premiumBannerTitle, { color: theme.colors.text }]}>Uppgradera till Premium</Text>
                      <Text style={[styles.premiumBannerSubtitle, { color: theme.colors.textSecondary }]}>Obegränsade kurser, avancerad statistik och mer</Text>
                    </View>
                  </View>
                  <View style={[styles.premiumBannerButton, { backgroundColor: theme.colors.warning }]}>
                    <Text style={styles.premiumBannerButtonText}>Uppgradera</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </SlideInView>
        )}

        {/* Active Courses */}
        <SlideInView direction="up" delay={800}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktiva kurser</Text>
              <TouchableOpacity onPress={() => router.push('/courses')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            
            {activeCourses.length > 0 ? (
              activeCourses.slice(0, 3).map((course, index) => (
                <FadeInView key={course.id} delay={900 + index * 100}>
                  <TouchableOpacity style={[styles.courseCard, { backgroundColor: theme.colors.card }]}>
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
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/courses')}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addButtonText}>Lägg till kurs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SlideInView>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLogo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
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
    overflow: 'hidden',
  },
  profileButtonFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBanner: {
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  miniStatsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  miniStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
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
  levelCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  achievementsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentAchievements: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  recentAchievementsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '500',
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
  addButton: {
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

  premiumBanner: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  premiumBannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  premiumBannerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  premiumBannerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  techniqueCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  techniqueLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  techniqueIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  techniqueRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});