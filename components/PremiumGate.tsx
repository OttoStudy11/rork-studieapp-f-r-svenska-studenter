import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Sparkles, Zap, BarChart3, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';



// Feature configurations for different premium features
const FEATURE_CONFIGS = {
  'ai-chat': {
    title: 'AI Chat är Premium',
    description: 'Få tillgång till din personliga AI-studieguide med obegränsade frågor och svar',
    icon: Sparkles,
    gradient: ['#EC4899', '#DB2777'] as const,
  },
  'flashcards': {
    title: 'Flashcards är Premium',
    description: 'Träna med AI-genererade flashcards och spaced repetition för bättre minne',
    icon: Zap,
    gradient: ['#F59E0B', '#D97706'] as const,
  },
  'battle': {
    title: 'Tävlingsfunktionen är Premium',
    description: 'Tävla mot dina vänner och se vem som pluggar mest. Håll dig motiverad!',
    icon: Users,
    gradient: ['#EF4444', '#DC2626'] as const,
  },
  'statistics': {
    title: 'Avancerad Statistik är Premium',
    description: 'Få detaljerade insikter och trendanalys av din studietid och framsteg',
    icon: BarChart3,
    gradient: ['#06B6D4', '#0891B2'] as const,
  },
} as const;

type FeatureType = keyof typeof FEATURE_CONFIGS;

interface PremiumGateProps {
  feature: FeatureType;
  children: React.ReactNode;
  showLoadingWhileChecking?: boolean;
  fullScreen?: boolean;
}

export function PremiumGate({ 
  feature, 
  children, 
  showLoadingWhileChecking = false,
  fullScreen = false 
}: PremiumGateProps) {
  const { isPremium, isLoading, isOffline } = usePremium();
  const { theme, isDark } = useTheme();

  // Show loading state while checking premium status
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

  // User has premium access - show children
  if (isPremium) {
    return <>{children}</>;
  }

  // User does not have premium - show gate with inline overlay
  const featureConfig = FEATURE_CONFIGS[feature];
  const FeatureIcon = featureConfig.icon;

  const handleUpgrade = () => {
    router.push('/premium');
  };

  return (
    <View style={fullScreen ? styles.fullScreenContainer : styles.container}>
      <View style={fullScreen ? styles.fullScreenChildrenWrapper : styles.childrenWrapper}>
        {children}
      </View>
      <View style={fullScreen ? styles.fullScreenOverlayWrapper : styles.overlayWrapper}>
        <BlurView
          intensity={isDark ? 60 : 90}
          style={styles.blurOverlay}
          tint={isDark ? 'dark' : 'light'}
        >
          <View style={[
            styles.contentContainer, 
            { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)' }
          ]}>
            {/* Premium badge */}
            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={14} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.badgeText}>PREMIUM</Text>
              </LinearGradient>
            </View>

            {/* Feature-specific icon */}
            <LinearGradient
              colors={featureConfig.gradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FeatureIcon size={32} color="#FFF" />
            </LinearGradient>

            {/* Title and description */}
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {featureConfig.title}
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {featureConfig.description}
            </Text>

            {/* Offline notice */}
            {isOffline && (
              <View style={[styles.offlineNotice, { backgroundColor: theme.colors.warning + '20' }]}>
                <Text style={[styles.offlineText, { color: theme.colors.warning }]}>
                  Du är offline. Anslut till internet för att uppgradera.
                </Text>
              </View>
            )}

            {/* Upgrade button */}
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={isOffline}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isOffline ? ['#9CA3AF', '#6B7280'] : ['#FFD700', '#FFA500']}
                style={styles.upgradeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={18} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.upgradeButtonText}>Uppgradera till Premium</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Learn more link */}
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleUpgrade}
              activeOpacity={0.7}
            >
              <Text style={[styles.learnMoreText, { color: theme.colors.primary }]}>
                Se alla Premium-fördelar
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
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
  };
  
  return {
    hasAccess: isPremium && featureAccess[feature],
    isLoading,
    isPremium,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    minHeight: 200,
  },
  fullScreenContainer: {
    flex: 1,
    position: 'relative',
  },
  childrenWrapper: {
    opacity: 0.15,
    pointerEvents: 'none',
  },
  fullScreenChildrenWrapper: {
    opacity: 0.1,
    pointerEvents: 'none',
  },
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  fullScreenOverlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  premiumBadge: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
    opacity: 0.8,
  },
  offlineNotice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 13,
    textAlign: 'center',
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  learnMoreButton: {
    paddingVertical: 6,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

export default PremiumGate;
