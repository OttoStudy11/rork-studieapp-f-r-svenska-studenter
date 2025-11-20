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

import { LoadingScreen } from "@/components/LoadingScreen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { toasts, dismissToast } = useToast();
  const { isLoading } = useAuth();
  
  if (isLoading) {
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
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <AchievementProvider>
                      <RootLayoutNav />
                    </AchievementProvider>
                  </GestureHandlerRootView>
                </TimerSettingsProvider>
              </StudyProvider>
            </PremiumProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}