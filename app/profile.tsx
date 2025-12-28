import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  StatusBar,
  Alert as RNAlert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { 
  Edit3, 
  Settings, 
  BookOpen, 
  Clock, 
  Award,
  Star,
  Flame,
  X,
  ChevronRight,
  User,
  Mail,
  Zap,
  Sparkles,
  ArrowLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/Animations';
import CharacterAvatar from '@/components/CharacterAvatar';
import type { AvatarConfig } from '@/constants/avatar-config';
import AvatarBuilder from '@/components/AvatarBuilder';
import { LevelCard } from '@/components/LevelProgress';
import { TIER_COLORS, RARITY_COLORS, formatXp } from '@/constants/gamification';

export default function ProfileScreen() {
  const { user, courses, pomodoroSessions, updateUser } = useStudy();
  const { user: authUser } = useAuth();
  const { theme, isDark } = useTheme();
  const { showSuccess } = useToast();
  const gamificationData = useGamification();
  const { 
    totalXp = 0, 
    currentLevel, 
    xpProgress, 
    streak = 0, 
    achievements = [],
    dailyChallenges = [],
    unclaimedAchievements = 0,
  } = gamificationData || {};
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    program: user?.program || '',
    purpose: user?.purpose || ''
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const totalStudyTime = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        name: editForm.name,
        program: editForm.program,
        purpose: editForm.purpose
      });
      setShowEditModal(false);
      RNAlert.alert('Profil uppdaterad! ✅');
    } catch {
      RNAlert.alert('Fel', 'Kunde inte uppdatera profil');
    }
  };

  const handleSaveAvatar = async (config: AvatarConfig & { emoji?: string }) => {
    try {
      await updateUser({ avatar: config as AvatarConfig });
      setShowAvatarModal(false);
      showSuccess('Avatar uppdaterad! ✅');
    } catch {
      showSuccess('Kunde inte uppdatera avatar');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Profil',
          headerShown: false
        }} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Laddar profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Min Profil',
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8 }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      }} />
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Profile Header Card */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={theme.colors.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            {user.avatar ? (
              <View style={styles.avatarContainer}>
                <CharacterAvatar config={user.avatar} size={140} showBorder />
                <View style={styles.editAvatarBadge}>
                  <Sparkles size={16} color="white" />
                </View>
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <User size={60} color="white" />
                </View>
                <View style={styles.editAvatarBadge}>
                  <Sparkles size={16} color="white" />
                </View>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <View style={styles.profileMetaRow}>
              <Mail size={14} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.profileEmail}>{authUser?.email || 'Okänd e-post'}</Text>
            </View>
            {user.program && (
              <View style={styles.profileProgramTag}>
                <Text style={styles.profileProgramText}>
                  {user.program}
                  {user.studyLevel === 'gymnasie' && user.gymnasiumGrade ? ` - År ${user.gymnasiumGrade}` : ''}
                  {user.studyLevel === 'högskola' && user.universityYear ? ` - Termin ${user.universityYear}` : ''}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Level Card */}
        {currentLevel && xpProgress && (
          <View style={styles.levelSection}>
            <LevelCard
              currentLevel={currentLevel}
              xpProgress={xpProgress}
              totalXp={totalXp}
              streak={streak}
              onPress={() => router.push('/achievements')}
            />
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: (currentLevel?.tier ? TIER_COLORS[currentLevel.tier] : '#C7D2FE') + '15' }]}>
                <Zap size={24} color={currentLevel?.tier ? TIER_COLORS[currentLevel.tier] : '#C7D2FE'} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{formatXp(totalXp)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.warning + '15' }]}>
                <Flame size={24} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <BookOpen size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{courses.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Kurser</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.success + '15' }]}>
                <Clock size={24} color={theme.colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalStudyTime}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Minuter</Text>
            </View>
          </View>
        </View>

        {/* Daily Challenges Preview */}
        {dailyChallenges && dailyChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dagens utmaningar</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.challengesPreview}>
              {dailyChallenges.slice(0, 3).map((challenge, index) => (
                <View
                  key={challenge.id}
                  style={[
                    styles.challengeItem,
                    { backgroundColor: theme.colors.card },
                    challenge.isCompleted && { borderColor: theme.colors.success, borderWidth: 1 },
                  ]}
                >
                  <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {challenge.title}
                    </Text>
                    <View style={styles.challengeProgressRow}>
                      <View style={[styles.challengeProgressTrack, { backgroundColor: theme.colors.borderLight }]}>
                        <View
                          style={[
                            styles.challengeProgressFill,
                            {
                              width: `${Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100)}%`,
                              backgroundColor: challenge.isCompleted ? theme.colors.success : theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.challengeXp, { color: theme.colors.textSecondary }]}>
                        +{challenge.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Achievements Preview */}
        {achievements && achievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Prestationer
                {unclaimedAchievements > 0 && (
                  <Text style={{ color: theme.colors.primary }}> ({unclaimedAchievements} nya)</Text>
                )}
              </Text>
              <TouchableOpacity onPress={() => router.push('/achievements')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {achievements
                .filter(a => a.isUnlocked)
                .slice(0, 6)
                .map((achievement) => (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementBadge,
                      { backgroundColor: RARITY_COLORS[achievement.rarity] + '20', borderColor: RARITY_COLORS[achievement.rarity] },
                    ]}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={[styles.achievementTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {achievement.title}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Study Goals */}
        {user.purpose && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dina mål</Text>
            <View style={[styles.goalCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.goalIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <Star size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.goalText, { color: theme.colors.text }]}>{user.purpose}</Text>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Senaste aktivitet</Text>
          <View style={[styles.activityCard, { backgroundColor: theme.colors.card }]}>
            {pomodoroSessions.length > 0 ? (
              pomodoroSessions.slice(0, 5).map((session, sessionIndex) => (
                <View key={`session-${sessionIndex}-${session.id}`}>
                  <View style={styles.activityItem}>
                    <View style={[styles.activityIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Clock size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                        {session.courseId 
                          ? courses.find(c => c.id === session.courseId)?.title || 'Okänd kurs'
                          : 'Allmän session'
                        }
                      </Text>
                      <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
                        {session.duration} minuter • {new Date(session.endTime).toLocaleDateString('sv-SE')}
                      </Text>
                    </View>
                  </View>
                  {sessionIndex < 4 && sessionIndex < pomodoroSessions.length - 1 && (
                    <View style={[styles.activityDivider, { backgroundColor: theme.colors.borderLight }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Flame size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyActivityText, { color: theme.colors.text }]}>Ingen aktivitet än</Text>
                <Text style={[styles.emptyActivitySubtext, { color: theme.colors.textSecondary }]}>Starta din första studiesession!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Snabblänkar</Text>
          
          <View style={[styles.actionsCard, { backgroundColor: theme.colors.card }]}>
            <AnimatedPressable 
              style={styles.actionItem}
              onPress={() => setShowEditModal(true)}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <Edit3 size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Redigera profil</Text>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </AnimatedPressable>

            <View style={[styles.actionDivider, { backgroundColor: theme.colors.borderLight }]} />

            <AnimatedPressable 
              style={styles.actionItem}
              onPress={() => router.push('/settings')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Settings size={20} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Inställningar</Text>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </AnimatedPressable>

            <View style={[styles.actionDivider, { backgroundColor: theme.colors.borderLight }]} />

            <AnimatedPressable 
              style={styles.actionItem}
              onPress={() => router.push('/achievements')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: theme.colors.warning + '15' }]}>
                <Award size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Prestationer</Text>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera profil</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Namn</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Ditt namn"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Program/Inriktning</Text>
              <TextInput
                style={styles.input}
                value={editForm.program}
                onChangeText={(text) => setEditForm({ ...editForm, program: text })}
                placeholder="T.ex. Naturvetenskapsprogrammet"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mål och syfte</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.purpose}
                onChangeText={(text) => setEditForm({ ...editForm, purpose: text })}
                placeholder="Vad vill du uppnå med dina studier?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Spara</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Avatar Builder Modal */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AvatarBuilder
          initialConfig={user?.avatar}
          onSave={handleSaveAvatar}
          onCancel={() => setShowAvatarModal(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerCard: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  profileProgramTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  profileProgramText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
  levelSection: {
    paddingHorizontal: 20,
    marginTop: -32,
    marginBottom: 24,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengesPreview: {
    gap: 10,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  challengeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeXp: {
    fontSize: 12,
    fontWeight: '500',
  },
  achievementsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 70,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDivider: {
    height: 1,
    marginVertical: 16,
  },
  actionsCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actionDivider: {
    height: 1,
    marginLeft: 72,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyActivityText: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyActivitySubtext: {
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

});