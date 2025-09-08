import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCourses } from '@/contexts/CourseContext';

export default function Index() {
  const router = useRouter();
  const { userProfile, isLoading, onboardingCompleted } = useCourses();

  useEffect(() => {
    if (!isLoading) {
      if (!onboardingCompleted || !userProfile || !userProfile.program || !userProfile.year) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, onboardingCompleted, userProfile, router]);

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