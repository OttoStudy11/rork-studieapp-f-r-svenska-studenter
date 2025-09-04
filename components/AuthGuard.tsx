import React, { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { View, ActivityIndicator, Text } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding } = useAuth();
  const { isLoading: studyLoading } = useStudy();
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = authLoading || studyLoading;

  useEffect(() => {
    // Clear any existing timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (!isLoading && !hasRedirected) {
      console.log('AuthGuard - Auth state:', { isAuthenticated, hasCompletedOnboarding });
      
      // Add a small delay to ensure auth state is stable
      redirectTimerRef.current = setTimeout(() => {
        setHasRedirected(true);
        
        if (!isAuthenticated) {
          console.log('AuthGuard - Redirecting to auth');
          router.replace('/auth');
        } else if (!hasCompletedOnboarding) {
          console.log('AuthGuard - Redirecting to onboarding');
          router.replace('/onboarding');
        } else {
          console.log('AuthGuard - Redirecting to home');
          router.replace('/(tabs)/home');
        }
      }, 200); // Slightly longer delay to ensure data is loaded
    }
    
    // Reset redirect flag when auth state changes
    if (isLoading) {
      setHasRedirected(false);
    }
    
    // Cleanup function
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, hasRedirected]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#1E293B'
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: '#CBD5E1', marginTop: 16 }}>Laddar...</Text>
      </View>
    );
  }

  return <>{children}</>;
}