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
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useStudy } from '@/contexts/StudyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  User, 
  Edit3, 
  Settings, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Download,
  LogOut,
  X,
  ArrowLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable, FadeInView, SlideInView } from '@/components/Animations';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, courses, pomodoroSessions, updateUser } = useStudy();
  const { theme } = useTheme();
  const { showSuccess } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    program: user?.program || '',
    purpose: user?.purpose || ''
  });

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
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Profil',
          headerShown: true,
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Min Profil',
        headerShown: true,
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        )
      }} />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileProgram}>
              {user.program} • {user.studyLevel === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
            </Text>
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Edit3 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Din statistik</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BookOpen size={24} color="#4F46E5" />
              <Text style={styles.statNumber}>{courses.length}</Text>
              <Text style={styles.statLabel}>Kurser</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={24} color="#10B981" />
              <Text style={styles.statNumber}>{activeCourses}</Text>
              <Text style={styles.statLabel}>Aktiva</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{totalStudyTime}</Text>
              <Text style={styles.statLabel}>Minuter</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#EF4444" />
              <Text style={styles.statNumber}>{averageProgress}%</Text>
              <Text style={styles.statLabel}>Genomsnitt</Text>
            </View>
          </View>
        </View>

        {/* Study Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dina mål</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalText}>{user.purpose}</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Senaste aktivitet</Text>
          {pomodoroSessions.slice(0, 5).map((session, sessionIndex) => (
            <View key={`session-${sessionIndex}-${session.id}`} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Clock size={16} color="#4F46E5" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>
                  {session.courseId 
                    ? courses.find(c => c.id === session.courseId)?.title || 'Okänd kurs'
                    : 'Allmän session'
                  }
                </Text>
                <Text style={styles.activityTime}>
                  {session.duration} minuter • {new Date(session.endTime).toLocaleDateString('sv-SE')}
                </Text>
              </View>
            </View>
          ))}
          
          {pomodoroSessions.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>Ingen aktivitet än</Text>
              <Text style={styles.emptyActivitySubtext}>Starta din första studiesession!</Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inställningar</Text>
          
          <AnimatedPressable 
            style={styles.settingItem}
            onPress={() => {
              router.push('/settings');
              showSuccess('Navigerar', 'Öppnar inställningar');
            }}
          >
            <Settings size={20} color="#6B7280" />
            <Text style={styles.settingText}>Appinställningar</Text>
          </AnimatedPressable>

          <AnimatedPressable style={styles.settingItem} onPress={handleExportData}>
            <Download size={20} color="#6B7280" />
            <Text style={styles.settingText}>Exportera data</Text>
          </AnimatedPressable>

          <AnimatedPressable style={styles.settingItem} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.settingText, { color: '#EF4444' }]}>Logga ut</Text>
          </AnimatedPressable>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileProgram: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: -20,
    marginBottom: 24,
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
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyActivity: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500',
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