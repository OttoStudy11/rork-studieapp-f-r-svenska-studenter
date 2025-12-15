import React, { useEffect, useState, useRef } from 'react';
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
  const [hasRedirected, setHasRedirected] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [ftueCompleted, setFtueCompleted] = useState<boolean | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = authLoading || studyLoading || ftueCompleted === null;

  // Check FTUE completion status on mount
  useEffect(() => {
    const checkFTUEStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(FTUE_COMPLETED_KEY);
        console.log('FTUE completion status:', completed);
        setFtueCompleted(completed === 'true');
      } catch (error) {
        console.error('Error checking FTUE status:', error);
        setFtueCompleted(false);
      }
    };
    checkFTUEStatus();
  }, []);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      console.log('AuthGuard timeout reached - forcing navigation');
      setTimeoutReached(true);
      if (ftueCompleted === false) {
        router.replace('/ftue');
      } else {
        router.replace('/auth');
      }
    }, 10000); // 10 second timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ftueCompleted]);

  useEffect(() => {
    // Clear any existing timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // Only redirect once the initial auth check is complete and we haven't redirected yet
    if (!isLoading && !hasRedirected && !initialCheckDone && !timeoutReached && ftueCompleted !== null) {
      console.log('AuthGuard - Initial auth check:', { isAuthenticated, hasCompletedOnboarding, authLoading, studyLoading, ftueCompleted });
      
      // Mark initial check as done
      setInitialCheckDone(true);
      
      // Add a small delay to ensure auth state is stable
      redirectTimerRef.current = setTimeout(() => {
        if (!timeoutReached) {
          setHasRedirected(true);
          
          // Check FTUE first - this takes priority for first-time users
          if (!ftueCompleted) {
            console.log('AuthGuard - Redirecting to FTUE (first time user)');
            router.replace('/ftue');
          } else if (!isAuthenticated) {
            console.log('AuthGuard - Redirecting to auth (not authenticated)');
            router.replace('/auth');
          } else if (!hasCompletedOnboarding && (!studyUser || !studyUser.onboardingCompleted)) {
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
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, hasRedirected, initialCheckDone, timeoutReached, authLoading, studyLoading, studyUser, ftueCompleted]);

  if ((isLoading || !initialCheckDone) && !timeoutReached) {
    return <LoadingScreen message="Startar din studieplats..." />;
  }

  return <>{children}</>;
}