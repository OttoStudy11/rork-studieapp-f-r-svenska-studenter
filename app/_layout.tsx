import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
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

import { LoadingScreen } from "@/components/LoadingScreen";
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

//...

import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = 'appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX';

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: iosApiKey});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: androidApiKey});
    }
  }, []);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { toasts, dismissToast } = useToast();
  const { isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return <LoadingScreen message="Startar din studieplats..." />;
  }
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
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
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <AchievementProvider>
                          <RootLayoutNav />
                        </AchievementProvider>
                      </GestureHandlerRootView>
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