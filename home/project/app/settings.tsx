import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCourses } from '@/contexts/CourseContext';
import { ChevronRight, User, School, BookOpen, RotateCcw, LogOut } from 'lucide-react-native';

export default function Settings() {
  const router = useRouter();
  const { userProfile, resetOnboarding } = useCourses();

  const handleResetOnboarding = () => {
    Alert.alert(
      'Återställ profil',
      'Är du säker på att du vill återställa din profil? Detta kommer radera alla dina kurser och framsteg.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Återställ',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Inställningar</Text>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Min Profil</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <User size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Namn</Text>
                <Text style={styles.infoValue}>{userProfile?.name || 'Ej angivet'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <School size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gymnasium</Text>
                <Text style={styles.infoValue}>{userProfile?.gymnasium || 'Ej angivet'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <BookOpen size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Program</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.program || 'Ej angivet'} - År {userProfile?.year || '?'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Åtgärder</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleResetOnboarding}>
            <View style={styles.actionContent}>
              <RotateCcw size={20} color="#FF6B6B" />
              <Text style={styles.actionText}>Återställ profil och börja om</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Om</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>StudieStugan v1.0.0</Text>
            <Text style={styles.aboutSubtext}>Din personliga studieassistent</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500' as const,
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});