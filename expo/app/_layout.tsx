import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as Notifications from 'expo-notifications';
import { NotificationManager } from '@/lib/notification-manager';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { ToastProvider, useToast, ToastContainer } from "@/contexts/ToastContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { TimerSettingsProvider } from "@/contexts/TimerSettingsContext";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { CourseContentProvider } from "@/contexts/CourseContentContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { PointsProvider } from "@/contexts/PointsContext";
import { ChallengesProvider } from "@/contexts/ChallengesContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { HogskoleprovetProvider } from "@/contexts/HogskoleprovetContext";
import { HPTrialProvider } from "@/contexts/HPTrialContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { HPStudyPlanProvider } from "@/contexts/HPStudyPlanContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const { toasts, dismissToast } = useToast();
  const { authInitialized } = useAuth();
  const { theme } = useTheme();
  const splashHiddenRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const hideSplash = useCallback(async () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    
    try {
      console.log('📱 Hiding splash screen...');
      await SplashScreen.hideAsync();
      console.log('✅ Splash screen hidden');
    } catch (e) {
      console.log('Error hiding splash:', e);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Auth initialized:', authInitialized);
    
    if (authInitialized) {
      setIsReady(true);
      hideSplash();
    }
  }, [authInitialized, hideSplash]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady) {
        console.log('⏰ Force showing app after timeout');
        setIsReady(true);
        hideSplash();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isReady, hideSplash]);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
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
        <Stack.Screen name="hp-study-plan" options={{ headerShown: false }} />
        <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="study-insights" options={{ headerShown: false }} />
        <Stack.Screen name="advanced-analytics" options={{ headerShown: false }} />
        <Stack.Screen name="study-coach" options={{ headerShown: false }} />
        <Stack.Screen name="smart-flashcards" options={{ headerShown: false }} />
        <Stack.Screen name="speech-practice" options={{ headerShown: false }} />
        <Stack.Screen name="study-plan/[examId]" options={{ headerShown: false }} />
      </Stack>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function RootLayoutNav() {
  return <AppContent />;
}

export default function RootLayout() {
  useEffect(() => {
    NotificationManager.initialize();
    
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
                                    <HPTrialProvider>
                                      <HogskoleprovetProvider>
                                        <HPStudyPlanProvider>
                                          <CommunityProvider>
                                            <RootLayoutNav />
                                          </CommunityProvider>
                                        </HPStudyPlanProvider>
                                      </HogskoleprovetProvider>
                                    </HPTrialProvider>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
