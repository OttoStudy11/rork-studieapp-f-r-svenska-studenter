import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { ToastProvider, useToast } from "@/contexts/ToastContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { View, ActivityIndicator, Text } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { ToastContainer } = useToast();
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#1E293B'
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, color: '#CBD5E1', textAlign: 'center' }}>
            Laddar StudyFlow...
          </Text>
        </View>
      </View>
    );
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
      <ToastContainer />
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
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <AchievementProvider>
                    <RootLayoutNav />
                  </AchievementProvider>
                </GestureHandlerRootView>
              </StudyProvider>
            </PremiumProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}