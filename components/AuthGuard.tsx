import React, { useEffect, useState, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { LoadingScreen } from '@/components/LoadingScreen';

const FTUE_COMPLETED_KEY = 'ftue_completed_v1';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding } = useAuth();
  const { user: studyUser, isLoading: studyLoading } = useStudy();
  const [ftueCompleted, setFtueCompleted] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Use refs to prevent multiple navigations and track state
  const hasNavigatedRef = useRef(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNavigationTimeRef = useRef(0);

  const isLoading = authLoading || studyLoading || ftueCompleted === null;

  // Check FTUE completion status on mount - only once
  useEffect(() => {
    let mounted = true;
    
    const checkFTUEStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(FTUE_COMPLETED_KEY);
        if (mounted) {
          console.log('FTUE completion status:', completed);
          setFtueCompleted(completed === 'true');
        }
      } catch (error) {
        console.error('Error checking FTUE status:', error);
        if (mounted) {
          setFtueCompleted(false);
        }
      }
    };
    
    checkFTUEStatus();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Safe navigation function with rate limiting
  const safeNavigate = useCallback((path: string) => {
    const now = Date.now();
    const timeSinceLastNav = now - lastNavigationTimeRef.current;
    
    // Prevent navigation if already navigated or if too soon (rate limit: 1 nav per 500ms)
    if (hasNavigatedRef.current || timeSinceLastNav < 500) {
      console.log('AuthGuard - Navigation blocked (already navigated or rate limited)');
      return;
    }
    
    hasNavigatedRef.current = true;
    lastNavigationTimeRef.current = now;
    console.log('AuthGuard - Navigating to:', path);
    
    router.replace(path as any);
  }, []);

  // Main navigation effect - runs when loading completes
  useEffect(() => {
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    // Don't navigate if still loading or already navigated
    if (isLoading || hasNavigatedRef.current) {
      return;
    }

    console.log('AuthGuard - Auth check complete:', { 
      isAuthenticated, 
      hasCompletedOnboarding, 
      ftueCompleted,
      studyUserOnboarded: studyUser?.onboardingCompleted 
    });

    // Small delay to ensure state is stable before navigation
    navigationTimeoutRef.current = setTimeout(() => {
      if (hasNavigatedRef.current) return;
      
      setIsReady(true);
      
      // Determine where to navigate
      if (!ftueCompleted) {
        safeNavigate('/ftue');
      } else if (!isAuthenticated) {
        safeNavigate('/auth');
      } else if (!hasCompletedOnboarding && (!studyUser || !studyUser.onboardingCompleted)) {
        safeNavigate('/onboarding');
      } else {
        safeNavigate('/(tabs)/home');
      }
    }, 300);

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, ftueCompleted, studyUser, safeNavigate]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!hasNavigatedRef.current && !isReady) {
        console.log('AuthGuard - Fallback timeout reached');
        if (ftueCompleted === false) {
          safeNavigate('/ftue');
        } else {
          safeNavigate('/auth');
        }
      }
    }, 8000);

    return () => clearTimeout(fallbackTimeout);
  }, [ftueCompleted, safeNavigate, isReady]);

  if (isLoading && !isReady) {
    return <LoadingScreen message="Startar din studieplats..." />;
  }

  return <>{children}</>
}