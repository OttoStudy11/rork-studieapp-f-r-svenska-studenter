import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation, router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import AISelectorScreen from '@/components/AISelectorScreen';
import MathAIChat from '@/components/MathAIChat';
import GeneralAIChat from '@/components/GeneralAIChat';

type ChatMode = 'selector' | 'math' | 'general';

const HIDDEN_TAB_STYLE = {
  display: 'none' as const,
  height: 0,
  overflow: 'hidden' as const,
  opacity: 0,
};

function getDefaultTabStyle(isDark: boolean) {
  return {
    position: 'absolute' as const,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    borderTopWidth: 0,
    borderRadius: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 8,
    height: 64,
    shadowColor: isDark ? '#6366F1' : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.25 : 0.15,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.05)',
  };
}

export default function AIChatScreen() {
  const [mode, setMode] = useState<ChatMode>('selector');
  const navigation = useNavigation();
  const { isPremium } = usePremium();
  const { isDark } = useTheme();

  const defaultTabStyle = useMemo(() => getDefaultTabStyle(isDark), [isDark]);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    if (mode !== 'selector') {
      console.log('[AI Chat] Hiding tab bar for chat mode:', mode);
      parent.setOptions({
        tabBarStyle: HIDDEN_TAB_STYLE,
      });
    } else {
      console.log('[AI Chat] Restoring tab bar for selector mode');
      parent.setOptions({
        tabBarStyle: defaultTabStyle,
      });
    }

    return () => {
      const p = navigation.getParent();
      if (p) {
        console.log('[AI Chat] Cleanup: restoring tab bar');
        p.setOptions({
          tabBarStyle: defaultTabStyle,
        });
      }
    };
  }, [mode, navigation, defaultTabStyle]);

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
