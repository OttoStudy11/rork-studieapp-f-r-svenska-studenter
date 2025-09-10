import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CourseProvider } from '@/contexts/CourseContext';
import { PremiumProvider } from '@/contexts/PremiumContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <CourseProvider>
            <RootLayoutNav />
          </CourseProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="program-selection" options={{ title: 'Välj Program', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: 'Inställningar', presentation: 'modal' }} />
      <Stack.Screen name="premium" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}