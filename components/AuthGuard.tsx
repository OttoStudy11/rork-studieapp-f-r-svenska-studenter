import React, { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding } = useAuth();
  const { isLoading: courseLoading } = useCourses();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = authLoading || courseLoading;

  // Add timeout to prevent infinite loading
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      console.log('AuthGuard timeout reached - forcing navigation to auth');
      setTimeoutReached(true);
      router.replace('/auth');
    }, 10000); // 10 second timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear any existing timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // Only redirect once the initial auth check is complete and we haven't redirected yet
    if (!isLoading && !hasRedirected && !initialCheckDone && !timeoutReached) {
      console.log('AuthGuard - Initial auth check:', { isAuthenticated, hasCompletedOnboarding, authLoading, courseLoading });
      
      // Mark initial check as done
      setInitialCheckDone(true);
      
      // Add a small delay to ensure auth state is stable
      redirectTimerRef.current = setTimeout(() => {
        if (!timeoutReached) {
          setHasRedirected(true);
          
          if (!isAuthenticated) {
            console.log('AuthGuard - Redirecting to auth (not authenticated)');
            router.replace('/auth');
          } else if (!hasCompletedOnboarding) {
            console.log('AuthGuard - Redirecting to onboarding (onboarding not completed)');
            router.replace('/onboarding');
          } else {
            console.log('AuthGuard - Redirecting to home (authenticated and onboarded)');
            router.replace('/(tabs)/home');
          }
        }
      }, 500); // Slightly longer delay to ensure data is loaded
    }
    
    // Reset flags when auth state changes significantly
    if (isLoading && initialCheckDone && !timeoutReached) {
      console.log('AuthGuard - Auth state changed, resetting flags');
      setHasRedirected(false);
      setInitialCheckDone(false);
    }
    
    // Cleanup function
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, hasRedirected, initialCheckDone, timeoutReached, authLoading, courseLoading]);

  if ((isLoading || !initialCheckDone) && !timeoutReached) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Laddar...</Text>
        <Text style={styles.debugText}>
          Auth: {authLoading ? 'loading' : 'ready'}, 
          Courses: {courseLoading ? 'loading' : 'ready'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 20,
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 16,
    fontSize: 16,
  },
  debugText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});