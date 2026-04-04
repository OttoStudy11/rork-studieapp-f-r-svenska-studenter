import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AISelectorScreen from '@/components/AISelectorScreen';
import MathAIChat from '@/components/MathAIChat';
import GeneralAIChat from '@/components/GeneralAIChat';

type ChatMode = 'selector' | 'math' | 'general';

export default function AIChatScreen() {
  const [mode, setMode] = useState<ChatMode>('selector');
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
    backgroundColor: '#0a0e14',
  },
});
