import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected) {
      console.log('AuthGuard - Auth state:', { isAuthenticated, hasCompletedOnboarding });
      
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
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
      }, 50); // Reduced delay
      
      return () => clearTimeout(timer);
    }
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