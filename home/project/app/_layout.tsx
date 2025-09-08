import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseProvider } from '@/contexts/CourseContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CourseProvider>
        <RootLayoutNav />
      </CourseProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="program-selection" options={{ title: 'Välj Program', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: 'Inställningar', presentation: 'modal' }} />
    </Stack>
  );
}