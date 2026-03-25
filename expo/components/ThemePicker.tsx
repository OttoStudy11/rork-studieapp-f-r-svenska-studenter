import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Lock, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { AppThemeConfig } from '@/constants/premium-themes';

export default function ThemePicker() {
  const { theme } = useTheme();
  const { isPremium, availableThemes, activeAppTheme, setActiveAppTheme } = usePremium();

  const handleSelectTheme = useCallback(async (themeConfig: AppThemeConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await setActiveAppTheme(themeConfig.id);
  }, [setActiveAppTheme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Apptema</Text>
        {!isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' + '20' }]}>
            <Crown size={12} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themesRow}
      >
        {availableThemes.map((t) => {
          const isActive = activeAppTheme.id === t.id;
          const isLocked = t.isPremium && !isPremium;

          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.themeCard,
                { backgroundColor: theme.colors.card, borderColor: isActive ? t.colors.primary : theme.colors.border },
                isActive && styles.activeThemeCard,
              ]}
              onPress={() => handleSelectTheme(t)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[t.colors.gradientStart, t.colors.gradientEnd]}
                style={styles.themePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isActive && (
                  <View style={styles.activeCheck}>
                    <Check size={14} color="#FFF" strokeWidth={3} />
                  </View>
                )}
                {isLocked && !isActive && (
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
              <Text
                style={[
                  styles.themeName,
                  { color: isActive ? t.colors.primary : theme.colors.textSecondary },
                  isActive && { fontWeight: '700' as const },
                ]}
                numberOfLines={1}
              >
                {t.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  themesRow: {
    gap: 12,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  themeCard: {
    width: 80,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 8,
  },
  activeThemeCard: {
    borderWidth: 2,
  },
  themePreview: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
