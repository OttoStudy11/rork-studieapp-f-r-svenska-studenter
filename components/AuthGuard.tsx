import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log('AuthGuard - Auth state:', { isAuthenticated, hasCompletedOnboarding });
      
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
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
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#1E293B'
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
}