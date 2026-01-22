import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from 'expo-notifications';
import { NotificationManager } from '@/lib/notification-manager';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { ToastProvider, useToast, ToastContainer } from "@/contexts/ToastContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TimerSettingsProvider } from "@/contexts/TimerSettingsContext";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { CourseContentProvider } from "@/contexts/CourseContentContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { PointsProvider } from "@/contexts/PointsContext";
import { ChallengesProvider } from "@/contexts/ChallengesContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { HogskoleprovetProvider } from "@/contexts/HogskoleprovetContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data is always considered stale - ensures fresh data on navigation
      gcTime: 1000 * 60 * 5, // 5 minutes cache time
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always', // Always refetch on mount for fresh data
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function RootLayoutNav() {
  const { toasts, dismissToast } = useToast();
  const splashHideAttempted = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!splashHideAttempted.current) {
      splashHideAttempted.current = true;
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.log('Error hiding splash:', e);
        }
      };
      hideSplash();
    }
  }, []);

  // Refetch all queries when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log('📱 App became active, invalidating queries for fresh data');
          queryClient.invalidateQueries();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ftue" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="hogskoleprovet" options={{ headerShown: false }} />
        <Stack.Screen name="hp-practice/[sectionCode]" options={{ headerShown: false }} />
        <Stack.Screen name="hp-results" options={{ headerShown: false }} />
        <Stack.Screen name="hp-stats" options={{ headerShown: false }} />
      </Stack>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification manager
    NotificationManager.initialize();
    
    // Setup notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <PremiumProvider>
                <StudyProvider>
                  <TimerSettingsProvider>
                    <CourseProgressProvider>
                      <ExamProvider>
                        <CourseContentProvider>
                          <GestureHandlerRootView style={{ flex: 1 }}>
                            <GamificationProvider>
                              <AchievementProvider>
                                <PointsProvider>
                                  <ChallengesProvider>
                                    <HogskoleprovetProvider>
                                      <RootLayoutNav />
                                    </HogskoleprovetProvider>
                                  </ChallengesProvider>
                                </PointsProvider>
                              </AchievementProvider>
                            </GamificationProvider>
                          </GestureHandlerRootView>
                        </CourseContentProvider>
                      </ExamProvider>
                    </CourseProgressProvider>
                  </TimerSettingsProvider>
                </StudyProvider>
              </PremiumProvider>
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
