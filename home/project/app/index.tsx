import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';

export default function Index() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userProfile, isLoading: courseLoading, onboardingCompleted } = useCourses();

  const isLoading = authLoading || courseLoading;

  useEffect(() => {
    if (!isLoading) {
      // If no user is authenticated, go to auth screen
      if (!user) {
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
  }, [isLoading, user, onboardingCompleted, userProfile, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ECDC4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});