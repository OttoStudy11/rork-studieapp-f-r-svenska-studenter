import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import AISelectorScreen from '@/components/AISelectorScreen';

export default function AIChatScreen() {
  const { isPremium } = usePremium();

  const handleSelectMath = useCallback(() => {
    console.log('[AI Chat] Selected Math AI');
    if (!isPremium) {
      console.log('[AI Chat] User not premium, redirecting to premium page');
      router.push('/premium' as any);
      return;
    }
    router.push('/math-chat' as any);
  }, [isPremium]);

  const handleSelectGeneral = useCallback(() => {
    console.log('[AI Chat] Selected General AI');
    if (!isPremium) {
      console.log('[AI Chat] User not premium, redirecting to premium page');
      router.push('/premium' as any);
      return;
    }
    router.push('/general-chat' as any);
  }, [isPremium]);

  return (
    <View style={styles.container}>
      <AISelectorScreen
        onSelectMath={handleSelectMath}
        onSelectGeneral={handleSelectGeneral}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
