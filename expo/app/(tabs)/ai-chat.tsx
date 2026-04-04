import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { PremiumGate } from '@/components/PremiumGate';
import AISelectorScreen from '@/components/AISelectorScreen';
import MathAIChat from '@/components/MathAIChat';
import GeneralAIChat from '@/components/GeneralAIChat';

type ChatMode = 'selector' | 'math' | 'general';

export default function AIChatScreen() {
  const [mode, setMode] = useState<ChatMode>('selector');
  const navigation = useNavigation();

  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      if (mode !== 'selector') {
        parent.setOptions({
          tabBarStyle: { display: 'none' as const },
        });
      } else {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      }
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
    setMode('math');
  }, []);

  const handleSelectGeneral = useCallback(() => {
    console.log('[AI Chat] Selected General AI');
    setMode('general');
  }, []);

  const handleBack = useCallback(() => {
    console.log('[AI Chat] Back to selector');
    setMode('selector');
  }, []);

  return (
    <PremiumGate feature="ai-chat" fullScreen>
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
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
