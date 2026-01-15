import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import { NotificationManager } from '@/lib/notification-manager';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { ToastProvider, useToast, ToastContainer } from "@/contexts/ToastContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TimerSettingsProvider } from "@/contexts/TimerSettingsContext";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { CourseContentProvider } from "@/contexts/CourseContentContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PointsProvider } from "@/contexts/PointsContext";
import { ChallengesProvider } from "@/contexts/ChallengesContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { HogskoleprovetProvider } from "@/contexts/HogskoleprovetContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { toasts, dismissToast } = useToast();
  const { isLoading: authLoading } = useAuth();
  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Minimum loading time to show the loading screen (2.5 seconds)
    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide splash screen once we're ready to show our custom loading screen
    if (!splashHidden) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (e) {
          console.log('Error hiding splash:', e);
          setSplashHidden(true);
        }
      };
      // Small delay to ensure our LoadingScreen is mounted
      setTimeout(hideSplash, 100);
    }
  }, [splashHidden]);

  // Add small delay after loading conditions are met to ensure smooth transition
  useEffect(() => {
    if (!authLoading && minimumLoadingDone && !showContent) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading, minimumLoadingDone, showContent]);

  // Show loading screen until auth is done AND minimum time has passed AND content is ready
  if (authLoading || !minimumLoadingDone || !showContent) {
    return <LoadingScreen message="Startar din studieplats..." />;
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
  );
}
