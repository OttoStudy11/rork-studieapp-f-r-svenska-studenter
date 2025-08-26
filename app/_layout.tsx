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
import { View, ActivityIndicator, Text } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { ToastContainer } = useToast();
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
            Laddar StudyFlow...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Tillbaka" }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ title: "Premium" }} />
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
        <AuthProvider>
          <PremiumProvider>
            <StudyProvider>
              <AchievementProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </AchievementProvider>
            </StudyProvider>
          </PremiumProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}