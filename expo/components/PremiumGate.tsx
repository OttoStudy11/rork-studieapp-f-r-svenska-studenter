import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { FreemiumBanner } from '@/components/FreemiumBanner';
import PremiumScreen from '@/app/premium';
import type { FreemiumStatus, FreemiumFeature } from '@/constants/freemiumLimits';

export type FeatureType =
  | 'ai-chat'
  | 'flashcards'
  | 'battle'
  | 'statistics'
  | 'hogskoleprovet'
  | 'quiz';

interface PremiumGateProps {
  feature: FeatureType;
  children: React.ReactNode;
  showLoadingWhileChecking?: boolean;
  fullScreen?: boolean;
  mode?: 'block' | 'limit';
  freemiumStatus?: FreemiumStatus;
  freemiumFeature?: FreemiumFeature;
  bannerPosition?: 'top' | 'bottom';
}

/**
 * Wraps gated content. Premium users see `children` as-is; freemium users in
 * `limit` mode see the content with a usage banner; blocked users see the
 * full paywall screen (same as the /premium route).
 */
export function PremiumGate({
  feature,
  children,
  showLoadingWhileChecking = false,
  fullScreen = false,
  mode = 'block',
  freemiumStatus,
  freemiumFeature,
  bannerPosition = 'top',
}: PremiumGateProps) {
  const { isPremium, isLoading } = usePremium();
  const { theme } = useTheme();

  if (isLoading && showLoadingWhileChecking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Kontrollerar premium-status...
        </Text>
      </View>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (mode === 'limit' && freemiumStatus && freemiumFeature) {
    if (freemiumStatus.isAllowed) {
      return (
        <View style={{ flex: fullScreen ? 1 : undefined }}>
          {bannerPosition === 'top' && (
            <FreemiumBanner
              feature={freemiumFeature}
              status={freemiumStatus}
              style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4 }}
            />
          )}
          {children}
          {bannerPosition === 'bottom' && (
            <FreemiumBanner
              feature={freemiumFeature}
              status={freemiumStatus}
              style={{ marginHorizontal: 16, marginBottom: 8, marginTop: 4 }}
            />
          )}
        </View>
      );
    }
  }

  // Blocked — show the same paywall as the /premium screen.
  // Its built-in back button pops the gated screen; after a successful
  // purchase the gate re-renders and reveals the content.
  return <PremiumScreen />;
}

// HOC version for wrapping entire screens
interface WithPremiumGateOptions {
  feature: FeatureType;
  showLoadingWhileChecking?: boolean;
}

export function withPremiumGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPremiumGateOptions
) {
  return function PremiumGatedComponent(props: P) {
    return (
      <PremiumGate
        feature={options.feature}
        showLoadingWhileChecking={options.showLoadingWhileChecking}
      >
        <WrappedComponent {...props} />
      </PremiumGate>
    );
  };
}

// Hook for checking premium status for specific features
export function usePremiumFeature(feature: FeatureType) {
  const { isPremium, isLoading, limits } = usePremium();

  const featureAccess = {
    'ai-chat': limits.canUseAIChat,
    'flashcards': limits.canUseFlashcards,
    'battle': limits.canUseBattle,
    'statistics': limits.canUseAdvancedStatistics,
    'hogskoleprovet': isPremium,
    'quiz': limits.canUseFlashcards,
  };

  return {
    hasAccess: isPremium && featureAccess[feature],
    isLoading,
    isPremium,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default PremiumGate;
