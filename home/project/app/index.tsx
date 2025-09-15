import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { testDatabaseConnection } from '@/lib/supabase';
import { runDatabaseTests } from '../lib/database-test';
import SplashScreen from '../components/SplashScreen';
import { useWelcomeStorage } from '../hooks/useWelcomeStorage';

export default function Index() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userProfile, isLoading: courseLoading, onboardingCompleted } = useCourses();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [showDetails, setShowDetails] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { hasSeenWelcome } = useWelcomeStorage();

  const isLoading = authLoading || courseLoading;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Checking database connection from index...');
        const isConnected = await testDatabaseConnection();
        setDbStatus(isConnected ? 'connected' : 'failed');
        console.log('Database connection status:', isConnected ? 'connected' : 'failed');
      } catch (error) {
        console.error('Database connection check failed in index:', error);
        setDbStatus('failed');
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (!isLoading && !showSplash && hasSeenWelcome !== null) {
      // If user hasn't seen welcome screens, show them first
      if (!hasSeenWelcome) {
        router.replace('/welcome');
      }
      // If no user is authenticated, go to auth screen
      else if (!user) {
        router.replace('/auth');
      } 
      // If user exists but hasn't completed onboarding
      else if (!onboardingCompleted || !userProfile || !userProfile.program || !userProfile.year) {
        router.replace('/onboarding');
      } 
      // User is authenticated and has completed onboarding
      else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, user, onboardingCompleted, userProfile, router, showSplash, hasSeenWelcome]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  const getStatusColor = () => {
    switch (dbStatus) {
      case 'connected': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = () => {
    switch (dbStatus) {
      case 'connected': return 'Databas ansluten';
      case 'failed': return 'Databasanslutning misslyckades';
      default: return 'Kontrollerar databasanslutning...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      <ActivityIndicator size="large" color="#4ECDC4" />
      <Text style={styles.loadingText}>Förbereder din studieupplevelse...</Text>
      
      <TouchableOpacity 
        style={styles.statusContainer}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </TouchableOpacity>
      
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            Auth Loading: {authLoading ? 'Ja' : 'Nej'}{"\n"}
            Course Loading: {courseLoading ? 'Ja' : 'Nej'}{"\n"}
            User: {user ? user.email : 'Ingen'}{"\n"}
            DB Status: {dbStatus}{"\n"}
            Onboarding: {onboardingCompleted ? 'Klar' : 'Inte klar'}
          </Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              console.log('Running comprehensive database tests...');
              runDatabaseTests().then((results: any) => {
                console.log('Database test results:', results);
              }).catch((error: any) => {
                console.error('Database test error:', error);
              });
            }}
          >
            <Text style={styles.testButtonText}>Kör Databastester</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    maxWidth: '100%',
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  testButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});