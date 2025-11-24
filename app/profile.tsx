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
  Dimensions,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Edit3, 
  Settings, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Award,
  Star,
  Flame,
  X,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable, FadeInView } from '@/components/Animations';
import { router } from 'expo-router';
import CharacterAvatar from '@/components/CharacterAvatar';
import type { AvatarConfig } from '@/constants/avatar-config';
import AvatarBuilder from '@/components/AvatarBuilder';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, courses, pomodoroSessions, updateUser } = useStudy();
  const { user: authUser } = useAuth();
  const { theme, isDark } = useTheme();
  const { showSuccess } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    program: user?.program || '',
    purpose: user?.purpose || ''
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const totalStudyTime = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);
  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;
  const activeCourses = courses.filter(course => course.isActive).length;

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        name: editForm.name,
        program: editForm.program,
        purpose: editForm.purpose
      });
      setShowEditModal(false);
      Alert.alert('Profil uppdaterad! ✅');
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte uppdatera profil');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportera data',
      'Din studiedata kommer att exporteras som en fil',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Exportera', onPress: () => Alert.alert('Export startar...') }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Logga ut',
      'Är du säker på att du vill logga ut?',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Logga ut', style: 'destructive', onPress: () => Alert.alert('Utloggad') }
      ]
    );
  };

  const handleSaveAvatar = async (config: AvatarConfig) => {
    try {
      await updateUser({ avatar: config });
      setShowAvatarModal(false);
      showSuccess('Avatar uppdaterad! ✅');
    } catch (error) {
      console.error('Error updating avatar:', error);
      showSuccess('Kunde inte uppdatera avatar');
    }
  };

  const getMotivationalMessage = () => {
    if (totalStudyTime === 0) {
      return "Välkommen! Dags att börja plugga! 🚀";
    } else if (totalStudyTime < 60) {
      return "Bra start! Fortsätt så här! 💪";
    } else if (totalStudyTime < 300) {
      return "Du är på rätt väg! 🌟";
    } else {
      return "Fantastiskt arbete! Du är en studiemästare! 🏆";
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
        headerShown: false
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
                <Text style={styles.profileProgramText}>{user.program}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <BookOpen size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{courses.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Kurser</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Target size={24} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{activeCourses}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aktiva</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.warning + '15' }]}>
                <Clock size={24} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalStudyTime}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Minuter</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.success + '15' }]}>
                <TrendingUp size={24} color={theme.colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{averageProgress}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Genomsnitt</Text>
            </View>
          </View>
        </View>

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
    paddingTop: 60,
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
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -32,
    marginBottom: 24,
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