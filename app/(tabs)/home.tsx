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
import { usePoints } from '@/contexts/PointsContext';
import { useChallenges } from '@/contexts/ChallengesContext';
import { useGamification, TIER_COLORS, DIFFICULTY_CONFIG } from '@/contexts/GamificationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams } from '@/contexts/ExamContext';
import { Image } from 'expo-image';
import { BookOpen, Clock, Target, Plus, Award, Star, Crown, User, TrendingUp, Calendar, Flame, ArrowRight, GraduationCap, AlertCircle, ChevronRight, Zap, Trophy, Lock, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { FadeInView, SlideInView } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, courses, pomodoroSessions, isLoading } = useStudy();
  const { getRecentAchievements, currentStreak } = useAchievements();
  const { totalPoints } = usePoints();
  const { claimChallenge } = useChallenges();
  const { currentLevel, xpProgress, totalXp, dailyChallenges, unclaimedChallenges } = useGamification();
  const { isPremium, isDemoMode, canAddCourse, showPremiumModal } = usePremium();
  const { theme, isDark } = useTheme();
  const { upcomingExams } = useExams();

  const handleAddCourse = () => {
    if (!canAddCourse(courses.length)) {
      showPremiumModal('Obegränsat antal kurser');
      return;
    }
    router.push('/courses');
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
  const todaySessions = pomodoroSessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.endTime).toDateString();
    return today === sessionDate;
  });

  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;

  
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
    },
    {
      id: 7,
      title: 'Chunking',
      description: 'Dela upp information i mindre, hanterbara delar',
      icon: '🧩',
      category: 'Minnestekniker',
      difficulty: 'Nybörjare'
    },
    {
      id: 8,
      title: 'Interleaving',
      description: 'Variera mellan olika ämnen för effektivare inlärning',
      icon: '🔀',
      category: 'Inlärning',
      difficulty: 'Medel'
    },
    {
      id: 9,
      title: 'Sömn & vila',
      description: 'Optimera din sömn för bättre minneskonsolidering',
      icon: '😴',
      category: 'Hälsa',
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
    },
    {
      id: 4,
      title: 'Leitner-systemet',
      description: 'Flashcard-system med repetitionsintervaller baserat på prestation',
      steps: ['Skapa kort', 'Sortera i lådor', 'Repetera', 'Flytta kort'],
      icon: '📦',
      timeNeeded: '15-25 min'
    },
    {
      id: 5,
      title: 'Retrieval Practice',
      description: 'Träna på att hämta information från minnet aktivt',
      steps: ['Studera material', 'Stäng allt', 'Skriv ner allt', 'Kontrollera'],
      icon: '🔄',
      timeNeeded: '20-30 min'
    },
    {
      id: 6,
      title: 'Dual Coding',
      description: 'Kombinera text med visuella element för bättre inlärning',
      steps: ['Läs text', 'Skapa bilder', 'Koppla samman', 'Repetera båda'],
      icon: '🎨',
      timeNeeded: '25-45 min'
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
                  <Text style={styles.heroStatSubtext}>1p per 5 min</Text>
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
              onPress={() => router.push('/course-library')}
            >
              <GraduationCap size={24} color="white" />
              <Text style={styles.actionButtonText}>Studiekurser</Text>
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



        {/* Upcoming Exams Section */}
        <SlideInView direction="up" delay={450}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Calendar size={20} color={theme.colors.warning} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kommande prov</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/planning' as any)}>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Planering →</Text>
                </TouchableOpacity>
              </View>
              
              {upcomingExams.slice(0, 3).map((exam, index) => {
                const daysUntil = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 3;
                
                return (
                  <FadeInView key={exam.id} delay={500 + index * 100}>
                    <View style={[
                      styles.examCard,
                      { backgroundColor: theme.colors.card },
                      isUrgent && { borderLeftWidth: 4, borderLeftColor: theme.colors.error }
                    ]}>
                      <View style={styles.examCardContent}>
                        <View style={[
                          styles.examDateBadge,
                          { backgroundColor: isUrgent ? theme.colors.error + '15' : theme.colors.warning + '15' }
                        ]}>
                          <Text style={[
                            styles.examDateDay,
                            { color: isUrgent ? theme.colors.error : theme.colors.warning }
                          ]}>
                            {exam.examDate.getDate()}
                          </Text>
                          <Text style={[
                            styles.examDateMonth,
                            { color: isUrgent ? theme.colors.error : theme.colors.warning }
                          ]}>
                            {exam.examDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                          </Text>
                        </View>
                        
                        <View style={styles.examInfo}>
                          <Text style={[styles.examTitle, { color: theme.colors.text }]} numberOfLines={1}>
                            {exam.title}
                          </Text>
                          <View style={styles.examMeta}>
                            <View style={styles.examMetaItem}>
                              <Clock size={12} color={theme.colors.textMuted} />
                              <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>
                                {exam.examDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                            {exam.location && (
                              <>
                                <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]}>•</Text>
                                <Text style={[styles.examMetaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                                  {exam.location}
                                </Text>
                              </>
                            )}
                          </View>
                          {isUrgent && (
                            <View style={[styles.urgentBadge, { backgroundColor: theme.colors.error + '15' }]}>
                              <AlertCircle size={12} color={theme.colors.error} />
                              <Text style={[styles.urgentText, { color: theme.colors.error }]}>
                                {daysUntil === 0 ? 'Idag' : daysUntil === 1 ? 'Imorgon' : `Om ${daysUntil} dagar`}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </FadeInView>
                );
              })}
            {upcomingExams.length === 0 && (
              <TouchableOpacity
                style={[styles.addExamPrompt, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => router.push('/planning' as any)}
              >
                <View style={[styles.addExamIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Calendar size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.addExamContent}>
                  <Text style={[styles.addExamTitle, { color: theme.colors.text }]}>Inga planerade prov</Text>
                  <Text style={[styles.addExamSubtitle, { color: theme.colors.textSecondary }]}>Lägg till prov för att få påminnelser</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SlideInView>

        {/* XP Level & Progression Hub */}
        <SlideInView direction="up" delay={400}>
          <View style={styles.section}>
            {/* Main XP Card */}
            <LinearGradient
              colors={[TIER_COLORS[currentLevel.tier], TIER_COLORS[currentLevel.tier] + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainXpCard}
            >
              <View style={styles.mainXpHeader}>
                <View style={styles.mainXpLeft}>
                  <View style={styles.mainXpBadge}>
                    <Text style={styles.mainXpEmoji}>{currentLevel.iconEmoji}</Text>
                  </View>
                  <View style={styles.mainXpInfo}>
                    <Text style={styles.mainXpLevel}>Nivå {currentLevel.level}</Text>
                    <Text style={styles.mainXpTitle}>{currentLevel.titleSv}</Text>
                  </View>
                </View>
                <View style={styles.mainXpRight}>
                  <View style={styles.mainXpTotal}>
                    <Zap size={16} color="white" />
                    <Text style={styles.mainXpTotalNumber}>{totalXp}</Text>
                  </View>
                  <Text style={styles.mainXpTotalLabel}>Total XP</Text>
                </View>
              </View>

              <View style={styles.mainXpProgressSection}>
                <View style={styles.mainXpProgressBar}>
                  <View style={[styles.mainXpProgressFill, { width: `${Math.min(100, xpProgress.percent)}%` }]} />
                </View>
                <View style={styles.mainXpProgressLabels}>
                  <Text style={styles.mainXpProgressText}>{xpProgress.current} / {xpProgress.required} XP</Text>
                  {xpProgress.nextLevel && (
                    <Text style={styles.mainXpNextText}>
                      {xpProgress.nextLevel.iconEmoji} {xpProgress.nextLevel.titleSv}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.mainXpTierBadge}>
                <Crown size={12} color="white" />
                <Text style={styles.mainXpTierText}>
                  {currentLevel.tier === 'beginner' ? 'Nybörjare' :
                   currentLevel.tier === 'intermediate' ? 'Student' :
                   currentLevel.tier === 'advanced' ? 'Avancerad' :
                   currentLevel.tier === 'expert' ? 'Expert' :
                   currentLevel.tier === 'master' ? 'Mästare' : 'Legend'}
                </Text>
              </View>
            </LinearGradient>

            {/* Tier Roadmap */}
            <View style={[styles.tierRoadmap, { backgroundColor: theme.colors.card }]}>
              <View style={styles.tierRoadmapHeader}>
                <Trophy size={18} color={theme.colors.primary} />
                <Text style={[styles.tierRoadmapTitle, { color: theme.colors.text }]}>Nivåvägen</Text>
                <TouchableOpacity onPress={() => router.push('/achievements')}>
                  <Text style={[styles.tierRoadmapLink, { color: theme.colors.primary }]}>Se alla →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tierList}>
                {[
                  { tier: 'beginner', name: 'Nybörjare', levels: '1-9', emoji: '🌱', minXp: 0 },
                  { tier: 'intermediate', name: 'Student', levels: '10-19', emoji: '🚀', minXp: 2700 },
                  { tier: 'advanced', name: 'Avancerad', levels: '20-29', emoji: '⭐', minXp: 13200 },
                  { tier: 'expert', name: 'Expert', levels: '30-39', emoji: '👑', minXp: 33700 },
                  { tier: 'master', name: 'Mästare', levels: '40-49', emoji: '🌟', minXp: 64200 },
                  { tier: 'legend', name: 'Legend', levels: '50', emoji: '👑', minXp: 104700 },
                ].map((t, index) => {
                  const isCurrentTier = currentLevel.tier === t.tier;
                  const isUnlocked = totalXp >= t.minXp;
                  const tierColor = TIER_COLORS[t.tier as keyof typeof TIER_COLORS];
                  
                  return (
                    <View key={t.tier} style={styles.tierItem}>
                      <View style={[
                        styles.tierItemBadge,
                        { 
                          backgroundColor: isUnlocked ? tierColor + '20' : theme.colors.border,
                          borderColor: isCurrentTier ? tierColor : 'transparent',
                          borderWidth: isCurrentTier ? 2 : 0,
                        }
                      ]}>
                        {isUnlocked ? (
                          <Text style={styles.tierItemEmoji}>{t.emoji}</Text>
                        ) : (
                          <Lock size={14} color={theme.colors.textMuted} />
                        )}
                      </View>
                      <Text style={[
                        styles.tierItemName,
                        { color: isUnlocked ? theme.colors.text : theme.colors.textMuted }
                      ]} numberOfLines={1}>{t.name}</Text>
                      {isCurrentTier && (
                        <View style={[styles.tierCurrentDot, { backgroundColor: tierColor }]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.quickStatsRow}>
              <View style={[styles.quickStatItem, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.success + '15' }]}>
                  <CheckCircle size={18} color={theme.colors.success} />
                </View>
                <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                  {recentAchievements.length}
                </Text>
                <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Prestationer</Text>
              </View>
              <View style={[styles.quickStatItem, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                  <Flame size={18} color={theme.colors.warning} />
                </View>
                <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                  {currentStreak}
                </Text>
                <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Dagars streak</Text>
              </View>
              <View style={[styles.quickStatItem, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Target size={18} color={theme.colors.primary} />
                </View>
                <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                  {dailyChallenges.filter(c => c.isCompleted).length}/{dailyChallenges.length}
                </Text>
                <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Utmaningar</Text>
              </View>
            </View>

            {/* Achievements Showcase */}
            {recentAchievements.length > 0 && (
              <View style={[styles.achievementsShowcase, { backgroundColor: theme.colors.card }]}>
                <View style={styles.achievementsShowcaseHeader}>
                  <Award size={18} color={theme.colors.warning} />
                  <Text style={[styles.achievementsShowcaseTitle, { color: theme.colors.text }]}>Senaste prestationer</Text>
                </View>
                <View style={styles.achievementsList}>
                  {recentAchievements.slice(0, 3).map((achievement, index) => (
                    <View key={achievement.id} style={[styles.achievementShowcaseItem, { borderBottomColor: index < 2 ? theme.colors.border : 'transparent' }]}>
                      <View style={[styles.achievementShowcaseIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                        <Text style={styles.achievementShowcaseEmoji}>{achievement.icon}</Text>
                      </View>
                      <View style={styles.achievementShowcaseInfo}>
                        <Text style={[styles.achievementShowcaseName, { color: theme.colors.text }]}>{achievement.title}</Text>
                        <Text style={[styles.achievementShowcaseDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{achievement.description}</Text>
                      </View>
                      <View style={[styles.achievementShowcaseXp, { backgroundColor: theme.colors.success + '15' }]}>
                        <Zap size={12} color={theme.colors.success} />
                        <Text style={[styles.achievementShowcaseXpText, { color: theme.colors.success }]}>+{achievement.reward?.points || 25}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <TouchableOpacity 
                  style={[styles.achievementsShowcaseButton, { backgroundColor: theme.colors.primary + '10' }]}
                  onPress={() => router.push('/achievements')}
                >
                  <Text style={[styles.achievementsShowcaseButtonText, { color: theme.colors.primary }]}>Se alla prestationer</Text>
                  <ArrowRight size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Daily Challenges */}
            <View style={[styles.challengesSectionHeader, { marginTop: 20 }]}>
              <View style={styles.challengesHeaderLeft}>
                <Target size={20} color={theme.colors.primary} />
                <Text style={[styles.challengesSectionTitle, { color: theme.colors.text }]}>Dagliga utmaningar</Text>
                {unclaimedChallenges > 0 && (
                  <View style={[styles.unclaimedBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.unclaimedBadgeText}>{unclaimedChallenges}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.challengesRefreshText, { color: theme.colors.textSecondary }]}>Uppdateras dagligen</Text>
            </View>

            <View style={styles.challengesList}>
              {dailyChallenges.map((c) => {
                const isClaimable = c.isCompleted && !c.isClaimed;
                const isClaimed = c.isClaimed;
                const progressPercent = c.targetValue > 0 ? Math.min(100, (c.currentProgress / c.targetValue) * 100) : 0;
                const difficultyConfig = DIFFICULTY_CONFIG[c.difficulty] || DIFFICULTY_CONFIG.easy;

                return (
                  <View key={c.id} style={[
                    styles.challengeCardNew,
                    { backgroundColor: theme.colors.card },
                    isClaimed && { opacity: 0.7 }
                  ]}>
                    <View style={styles.challengeCardHeader}>
                      <View style={[styles.challengeIconNew, { backgroundColor: difficultyConfig.color + '15' }]}>
                        <Text style={styles.challengeEmojiNew}>{c.emoji}</Text>
                      </View>
                      <View style={styles.challengeContentNew}>
                        <View style={styles.challengeTitleRowNew}>
                          <Text style={[styles.challengeTitleNew, { color: theme.colors.text }]}>{c.title}</Text>
                          <View style={[styles.difficultyBadgeNew, { backgroundColor: difficultyConfig.color + '20' }]}>
                            <Text style={[styles.difficultyTextNew, { color: difficultyConfig.color }]}>{difficultyConfig.label}</Text>
                          </View>
                        </View>
                        <Text style={[styles.challengeDescNew, { color: theme.colors.textSecondary }]} numberOfLines={1}>{c.description}</Text>
                      </View>
                      <View style={styles.challengeRewardNew}>
                        <View style={[styles.xpBadgeNew, { backgroundColor: theme.colors.primary + '15' }]}>
                          <Zap size={12} color={theme.colors.primary} />
                          <Text style={[styles.xpTextNew, { color: theme.colors.primary }]}>+{c.xpReward}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.challengeProgressSection}>
                      <View style={[styles.progressTrackNew, { backgroundColor: theme.colors.border }]}>
                        <View style={[
                          styles.progressFillNew,
                          { 
                            width: `${progressPercent}%`, 
                            backgroundColor: isClaimed ? theme.colors.success : (isClaimable ? theme.colors.primary : difficultyConfig.color) 
                          }
                        ]} />
                      </View>
                      <View style={styles.challengeFooter}>
                        <Text style={[styles.progressTextNew, { color: theme.colors.textSecondary }]}>
                          {c.currentProgress}/{c.targetValue} {c.type === 'study_minutes' ? 'min' : 'pass'}
                        </Text>
                        <TouchableOpacity
                          testID={`challenge-claim-${c.id}`}
                          style={[
                            styles.claimButtonNew,
                            { 
                              backgroundColor: isClaimable ? theme.colors.primary : 
                                              isClaimed ? theme.colors.success : theme.colors.border 
                            }
                          ]}
                          onPress={() => {
                            if (isClaimable) {
                              void claimChallenge(c.id);
                            }
                          }}
                          disabled={!isClaimable}
                        >
                          {isClaimed ? (
                            <CheckCircle size={14} color="white" />
                          ) : (
                            <Text style={[
                              styles.claimButtonText,
                              { color: isClaimable ? 'white' : theme.colors.textSecondary }
                            ]}>
                              {isClaimable ? 'Hämta' : 'Pågår'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
              
              {dailyChallenges.length === 0 && (
                <View style={[styles.emptyChallenges, { backgroundColor: theme.colors.card }]}>
                  <Target size={32} color={theme.colors.textMuted} />
                  <Text style={[styles.emptyChallengesText, { color: theme.colors.textSecondary }]}>Inga utmaningar just nu</Text>
                  <Text style={[styles.emptyChallengesSubtext, { color: theme.colors.textMuted }]}>Nya utmaningar kommer snart!</Text>
                </View>
              )}
            </View>

            {/* XP Sources Info */}
            <View style={[styles.xpSourcesCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.xpSourcesTitle, { color: theme.colors.text }]}>Hur du tjänar XP</Text>
              <View style={styles.xpSourcesList}>
                {[
                  { icon: '📚', name: 'Slutför lektion', xp: '+10 XP' },
                  { icon: '✅', name: 'Quiz (90%+)', xp: '+50 XP' },
                  { icon: '⏱️', name: 'Studera 5 min', xp: '+5 XP' },
                  { icon: '🎯', name: 'Svår utmaning', xp: '+150 XP' },
                  { icon: '🏆', name: 'Kurs klar', xp: '+500 XP' },
                ].map((source, index) => (
                  <View key={index} style={styles.xpSourceItem}>
                    <Text style={styles.xpSourceIcon}>{source.icon}</Text>
                    <Text style={[styles.xpSourceName, { color: theme.colors.textSecondary }]}>{source.name}</Text>
                    <Text style={[styles.xpSourceAmount, { color: theme.colors.success }]}>{source.xp}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </SlideInView>

        {/* Study Tips Section */}
        <SlideInView direction="up" delay={500}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studietips</Text>
              <TouchableOpacity onPress={() => router.push('/study-tips')}>
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
              <TouchableOpacity onPress={() => router.push('/study-techniques')}>
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
                  <TouchableOpacity 
                    style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => router.push(`/content-course/${course.id}`)}
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
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddCourse}
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
  heroStatSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
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
  challengesList: {
    gap: 12,
  },
  challengeCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  challengeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  challengeEmoji: {
    fontSize: 22,
    marginTop: 1,
  },
  challengeTextCol: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  challengeDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  challengeRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  challengePointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  challengePointsText: {
    fontSize: 12,
    fontWeight: '800',
  },
  challengeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 84,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  challengeProgressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  challengeProgressText: {
    marginTop: 8,
    fontSize: 12,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  examDateBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examDateDay: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  examDateMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  examMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  addExamPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addExamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addExamContent: {
    flex: 1,
  },
  addExamTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  addExamSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  xpLevelCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  xpLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpLevelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginRight: 14,
    position: 'relative' as const,
  },
  xpLevelEmoji: {
    fontSize: 24,
  },
  xpLevelNumberBadge: {
    position: 'absolute' as const,
    bottom: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  xpLevelNumber: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  xpLevelInfo: {
    flex: 1,
  },
  xpLevelTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  xpTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start' as const,
  },
  xpTierText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  xpTotalContainer: {
    alignItems: 'flex-end' as const,
  },
  xpTotalNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  xpTotalLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  xpProgressContainer: {
    marginTop: 4,
  },
  xpProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpProgressCurrent: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  xpProgressRequired: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  xpProgressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  xpNextLevelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  xpNextLevelText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  challengesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unclaimedBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unclaimedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  challengesRefreshText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  challengeEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  emptyChallenges: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyChallengesText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyChallengesSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  mainXpCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mainXpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainXpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mainXpBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainXpEmoji: {
    fontSize: 28,
  },
  mainXpInfo: {
    gap: 2,
  },
  mainXpLevel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mainXpTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: 'white',
  },
  mainXpRight: {
    alignItems: 'flex-end' as const,
  },
  mainXpTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainXpTotalNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
  },
  mainXpTotalLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  mainXpProgressSection: {
    marginBottom: 16,
  },
  mainXpProgressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden' as const,
  },
  mainXpProgressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  mainXpProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  mainXpProgressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mainXpNextText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  mainXpTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start' as const,
  },
  mainXpTierText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tierRoadmap: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tierRoadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  tierRoadmapTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  tierRoadmapLink: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tierList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierItem: {
    alignItems: 'center' as const,
    gap: 6,
    flex: 1,
  },
  tierItemBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierItemEmoji: {
    fontSize: 18,
  },
  tierItemName: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  tierCurrentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -2,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickStatItem: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  achievementsShowcase: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementsShowcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  achievementsShowcaseTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  achievementsList: {
    gap: 0,
  },
  achievementShowcaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  achievementShowcaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementShowcaseEmoji: {
    fontSize: 20,
  },
  achievementShowcaseInfo: {
    flex: 1,
  },
  achievementShowcaseName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  achievementShowcaseDesc: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  achievementShowcaseXp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  achievementShowcaseXpText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  achievementsShowcaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  achievementsShowcaseButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  challengesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  challengesSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 8,
  },
  challengeCardNew: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIconNew: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeEmojiNew: {
    fontSize: 22,
  },
  challengeContentNew: {
    flex: 1,
  },
  challengeTitleRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  challengeTitleNew: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  difficultyBadgeNew: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyTextNew: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  challengeDescNew: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  challengeRewardNew: {
    marginLeft: 8,
  },
  xpBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  xpTextNew: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  challengeProgressSection: {
    marginTop: 4,
  },
  progressTrackNew: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFillNew: {
    height: '100%',
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressTextNew: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  claimButtonNew: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  xpSourcesCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  xpSourcesTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  xpSourcesList: {
    gap: 10,
  },
  xpSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpSourceIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  xpSourceName: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  xpSourceAmount: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
});