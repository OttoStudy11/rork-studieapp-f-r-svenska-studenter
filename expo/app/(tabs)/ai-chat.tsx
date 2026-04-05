import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import AISelectorScreen from '@/components/AISelectorScreen';
import MathAIChat from '@/components/MathAIChat';
import GeneralAIChat from '@/components/GeneralAIChat';

type ChatMode = 'selector' | 'math' | 'general';

export default function AIChatScreen() {
  const [mode, setMode] = useState<ChatMode>('selector');
  const navigation = useNavigation();
  const { isPremium } = usePremium();

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    if (mode !== 'selector') {
      parent.setOptions({
        tabBarStyle: { display: 'none' as const },
      });
    } else {
      parent.setOptions({
        tabBarStyle: undefined,
      });
    }

    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      }
    };
  }, [mode, navigation]);

  const handleSelectMath = useCallback(() => {
    console.log('[AI Chat] Selected Math AI');
    if (!isPremium) {
      console.log('[AI Chat] User not premium, redirecting to premium page');
      router.push('/premium' as any);
      return;
    }
    setMode('math');
  }, [isPremium]);

  const handleSelectGeneral = useCallback(() => {
    console.log('[AI Chat] Selected General AI');
    if (!isPremium) {
      console.log('[AI Chat] User not premium, redirecting to premium page');
      router.push('/premium' as any);
      return;
    }
    setMode('general');
  }, [isPremium]);

  const handleBack = useCallback(() => {
    console.log('[AI Chat] Back to selector');
    setMode('selector');
  }, []);

  return (
    <View style={styles.container}>
      {mode === 'selector' && (
        <AISelectorScreen
          onSelectMath={handleSelectMath}
          onSelectGeneral={handleSelectGeneral}
        />
      )}
      {mode === 'math' && (
        <MathAIChat onBack={handleBack} />
      )}
      {mode === 'general' && (
        <GeneralAIChat onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
