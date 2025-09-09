import React, { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding } = useAuth();
  const { isLoading: studyLoading } = useStudy();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = authLoading || studyLoading;

  useEffect(() => {
    // Clear any existing timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // Only redirect once the initial auth check is complete and we haven't redirected yet
    if (!isLoading && !hasRedirected && !initialCheckDone) {
      console.log('AuthGuard - Initial auth check:', { isAuthenticated, hasCompletedOnboarding });
      
      // Mark initial check as done
      setInitialCheckDone(true);
      
      // Add a small delay to ensure auth state is stable
      redirectTimerRef.current = setTimeout(() => {
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
      }, 300); // Slightly longer delay to ensure data is loaded
    }
    
    // Reset flags when auth state changes significantly
    if (isLoading && initialCheckDone) {
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
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, hasRedirected, initialCheckDone]);

  if (isLoading || !initialCheckDone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Laddar...</Text>
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
    backgroundColor: '#1E293B'
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 16
  }
});