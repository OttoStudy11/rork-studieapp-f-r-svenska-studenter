import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Lock, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';

const { width } = Dimensions.get('window');

interface PremiumGateProps {
  feature: 'ai-chat' | 'flashcards' | 'battle' | 'statistics';
  children: React.ReactNode;
}

const FEATURE_TEXTS = {
  'ai-chat': {
    title: 'AI Chat är Premium',
    description: 'Få tillgång till din personliga AI-studieguide med obegränsade frågor och svar',
    icon: Sparkles,
  },
  'flashcards': {
    title: 'Flashcards är Premium',
    description: 'Träna med AI-genererade flashcards och spaced repetition för bättre minne',
    icon: Sparkles,
  },
  'battle': {
    title: 'Tävlingsfunktionen är Premium',
    description: 'Tävla mot dina vänner och se vem som pluggar mest. Håll dig motiverad!',
    icon: Crown,
  },
  'statistics': {
    title: 'Avancerad Statistik är Premium',
    description: 'Få detaljerade insikter och trendanalys av din studietid och framsteg',
    icon: Crown,
  },
};

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const { isPremium } = usePremium();
  const { theme, isDark } = useTheme();

  if (isPremium) {
    return <>{children}</>;
  }

  const featureText = FEATURE_TEXTS[feature];
  const Icon = featureText.icon;

  return (
    <View style={styles.container}>
      {children}
      <BlurView
        intensity={isDark ? 40 : 80}
        style={styles.blurOverlay}
        tint={isDark ? 'dark' : 'light'}
      >
        <View style={[styles.contentContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Crown size={48} color="#FFF" strokeWidth={2.5} />
          </LinearGradient>

          <View style={styles.lockBadge}>
            <Lock size={16} color="#FFF" />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {featureText.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {featureText.description}
          </Text>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/premium')}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Crown size={20} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.upgradeButtonText}>Uppgradera till Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => router.push('/premium')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  contentContainer: {
    width: width - 64,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    top: 32,
    right: 32,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
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
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  learnMoreButton: {
    paddingVertical: 8,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
