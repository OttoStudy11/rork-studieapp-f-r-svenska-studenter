import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Lock, Sparkles, Zap, BarChart3, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';

const { width } = Dimensions.get('window');

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
}

export function PremiumGate({ 
  feature, 
  children, 
  showLoadingWhileChecking = false 
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

  // User does not have premium - show gate
  const featureConfig = FEATURE_CONFIGS[feature];
  const FeatureIcon = featureConfig.icon;

  const handleUpgrade = () => {
    router.push('/premium');
  };

  return (
    <View style={styles.container}>
      {children}
      <BlurView
        intensity={isDark ? 40 : 80}
        style={styles.blurOverlay}
        tint={isDark ? 'dark' : 'light'}
      >
        <View style={[
          styles.contentContainer, 
          { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }
        ]}>
          {/* Crown icon with gradient */}
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Crown size={48} color="#FFF" strokeWidth={2.5} />
          </LinearGradient>

          {/* Lock badge */}
          <View style={styles.lockBadge}>
            <Lock size={16} color="#FFF" />
          </View>

          {/* Feature-specific icon */}
          <LinearGradient
            colors={featureConfig.gradient}
            style={styles.featureIconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FeatureIcon size={16} color="#FFF" />
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
          >
            <LinearGradient
              colors={isOffline ? ['#9CA3AF', '#6B7280'] : ['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Crown size={20} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.upgradeButtonText}>Uppgradera till Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Learn more link */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={handleUpgrade}
          >
            <Text style={[styles.learnMoreText, { color: theme.colors.primary }]}>
              Se alla Premium-fördelar
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
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
    flex: 1,
    position: 'relative',
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  contentContainer: {
    width: width - 48,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  lockBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconBadge: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
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
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  learnMoreButton: {
    paddingVertical: 8,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});

export default PremiumGate;
