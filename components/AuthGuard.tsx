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
      if (!isAuthenticated) {
        // User is not authenticated, redirect to auth screen
        router.replace('/auth');
      } else if (!hasCompletedOnboarding) {
        // User is authenticated but hasn't completed onboarding
        router.replace('/onboarding');
      } else {
        // User is authenticated and has completed onboarding
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return <>{children}</>;
}