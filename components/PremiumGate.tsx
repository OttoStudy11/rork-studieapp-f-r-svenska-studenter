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
import { Crown, Sparkles, Zap, BarChart3, Users, GraduationCap } from 'lucide-react-native';
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
  'hogskoleprovet': {
    title: 'Högskoleprov är Premium',
    description: 'Träna inför högskoleprovet med realistiska övningar, tidsbegränsning och AI-feedback',
    icon: GraduationCap,
    gradient: ['#6366F1', '#8B5CF6'] as const,
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
          intensity={isDark ? 80 : 95}
          style={styles.blurOverlay}
          tint={isDark ? 'dark' : 'light'}
        >
          <LinearGradient
            colors={isDark 
              ? ['rgba(0,0,0,0.7)', 'rgba(20,20,30,0.85)', 'rgba(0,0,0,0.7)']
              : ['rgba(255,255,255,0.85)', 'rgba(250,250,255,0.92)', 'rgba(255,255,255,0.85)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.contentContainer}>
              {/* Premium crown badge with glow */}
              <View style={styles.crownContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  style={styles.crownGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Crown size={48} color="#FFF" strokeWidth={2} fill="#FFF" />
                </LinearGradient>
              </View>

              {/* Premium badge */}
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                style={styles.premiumBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Sparkles size={12} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.badgeText}>PREMIUM FEATURE</Text>
                <Sparkles size={12} color="#FFF" strokeWidth={2.5} />
              </LinearGradient>

              {/* Title and description */}
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {featureConfig.title}
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {featureConfig.description}
              </Text>

              {/* Feature highlights */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <View style={[styles.checkmark, { backgroundColor: '#FFD700' + '20' }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                  <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Obegränsad tillgång</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.checkmark, { backgroundColor: '#FFD700' + '20' }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                  <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Premium funktioner</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.checkmark, { backgroundColor: '#FFD700' + '20' }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                  <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Avancerad analys</Text>
                </View>
              </View>

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
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isOffline ? ['#9CA3AF', '#6B7280'] : ['#FFD700', '#FFA500', '#FF8C00']}
                  style={styles.upgradeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Crown size={20} color="#FFF" strokeWidth={2.5} fill="#FFF" />
                  <Text style={styles.upgradeButtonText}>Uppgradera till Premium</Text>
                  <Sparkles size={16} color="#FFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Learn more link */}
              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={handleUpgrade}
                activeOpacity={0.7}
              >
                <Text style={[styles.learnMoreText, { color: '#FFD700' }]}>
                  Se alla Premium-fördelar →
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    'hogskoleprovet': isPremium,
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
    opacity: 0.12,
    pointerEvents: 'none',
  },
  fullScreenChildrenWrapper: {
    opacity: 0.08,
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
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '88%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  crownContainer: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  crownGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4,
    fontWeight: '500' as const,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  offlineNotice: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  learnMoreButton: {
    paddingVertical: 8,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});

export default PremiumGate;
