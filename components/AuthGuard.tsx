import React, { useEffect, useRef, useCallback } from 'react';
import { router, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

const FTUE_COMPLETED_KEY = 'ftue_completed_v1';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, authInitialized, hasCompletedOnboarding } = useAuth();
  
  const hasNavigatedRef = useRef(false);
  const navigationInProgressRef = useRef(false);
  const initCompletedRef = useRef(false);

  const performNavigation = useCallback(async () => {
    if (hasNavigatedRef.current || navigationInProgressRef.current) {
      return;
    }
    
    navigationInProgressRef.current = true;
    
    try {
      const ftueCompleted = await AsyncStorage.getItem(FTUE_COMPLETED_KEY);
      const isFtueComplete = ftueCompleted === 'true';
      
      console.log('AuthGuard - Navigation check:', { 
        isAuthenticated, 
        hasCompletedOnboarding, 
        isFtueComplete
      });

      hasNavigatedRef.current = true;
      
      if (!isFtueComplete) {
        console.log('AuthGuard - Navigating to FTUE');
        router.replace('/ftue' as Href);
      } else if (!isAuthenticated) {
        console.log('AuthGuard - Navigating to Auth');
        router.replace('/auth' as Href);
      } else if (!hasCompletedOnboarding) {
        console.log('AuthGuard - Navigating to Onboarding');
        router.replace('/onboarding' as Href);
      } else {
        console.log('AuthGuard - Navigating to Home');
        router.replace('/(tabs)/home' as Href);
      }
    } catch (error) {
      console.error('AuthGuard - Navigation error:', error);
      hasNavigatedRef.current = true;
      router.replace('/auth' as Href);
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

  useEffect(() => {
    if (!authInitialized || initCompletedRef.current) {
      return;
    }
    
    initCompletedRef.current = true;
    
    const timer = setTimeout(() => {
      performNavigation();
    }, 100);

    return () => clearTimeout(timer);
  }, [authInitialized, performNavigation]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasNavigatedRef.current && authInitialized) {
        console.log('AuthGuard - Fallback timeout triggered');
        performNavigation();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [performNavigation, authInitialized]);

  if (!hasNavigatedRef.current) {
    return <LoadingScreen message="Startar din studieplats..." />;
  }

  return <>{children}</>;
}
