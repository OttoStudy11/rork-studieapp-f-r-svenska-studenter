import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, ChevronRight, Clock, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { FreemiumStatus, getResetLabel, getFeatureLabel, FreemiumFeature } from '@/constants/freemiumLimits';
import * as Haptics from 'expo-haptics';

interface FreemiumBannerProps {
  feature: FreemiumFeature;
  status: FreemiumStatus;
  style?: any;
  compact?: boolean;
}

export function FreemiumBanner({ feature, status, style, compact = false }: FreemiumBannerProps) {
  const { theme, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status.remaining <= 1 && !status.isPremium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [status.remaining, status.isPremium, pulseAnim]);

  if (status.isPremium) return null;

  const isExhausted = status.remaining === 0;
  const isLow = status.remaining === 1;
  const label = getFeatureLabel(feature);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/premium' as any);
  };

  if (isExhausted) {
    return (
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
        <View style={[styles.exhaustedContainer, { backgroundColor: isDark ? '#1C1017' : '#FEF2F2' }]}>
          <LinearGradient
            colors={isDark ? ['#7F1D1D', '#991B1B'] : ['#FCA5A5', '#F87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exhaustedIconBar}
          >
            <Lock size={16} color="white" />
          </LinearGradient>
          <View style={styles.exhaustedContent}>
            <Text style={[styles.exhaustedTitle, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
              Du har nått gränsen för {label}
            </Text>
            {status.resetAt && (
              <View style={styles.resetRow}>
                <Clock size={12} color={isDark ? '#FB923C' : '#EA580C'} />
                <Text style={[styles.resetText, { color: isDark ? '#FB923C' : '#EA580C' }]}>
                  {getResetLabel(status.resetAt)}
                </Text>
              </View>
            )}
            {!status.resetAt && (
              <Text style={[styles.exhaustedSub, { color: theme.colors.textSecondary }]}>
                Uppgradera till Premium för obegränsad åtkomst
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.upgradeChip}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeChipGradient}
            >
              <Crown size={14} color="#FFF" />
              <Text style={styles.upgradeChipText}>Uppgradera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: isDark ? '#1A1625' : '#F5F3FF' }, style]}>
        <View style={styles.compactLeft}>
          <View style={[styles.compactDot, {
            backgroundColor: isLow ? '#F59E0B' : theme.colors.primary,
          }]} />
          <Text style={[styles.compactText, { color: theme.colors.textSecondary }]}>
            {status.remaining}/{status.total} {label} kvar
            {isLow ? ' idag' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={styles.compactUpgrade}>
            <Crown size={12} color="#FFD700" />
            <Text style={[styles.compactUpgradeText, { color: '#FFD700' }]}>Obegränsat</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.bannerContainer,
      {
        backgroundColor: isDark ? '#1A1625' : '#F5F3FF',
        borderColor: isDark ? '#2E2545' : '#E0E7FF',
      },
      style,
    ]}>
      <View style={styles.bannerTop}>
        <View style={styles.bannerInfo}>
          <View style={styles.counterRow}>
            {Array.from({ length: status.total }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.counterDot,
                  {
                    backgroundColor: i < (status.total - status.remaining)
                      ? (isDark ? '#475569' : '#CBD5E1')
                      : (isLow ? '#F59E0B' : theme.colors.primary),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.bannerText, { color: theme.colors.text }]}>
            <Text style={{ fontWeight: '700' as const }}>{status.remaining}</Text>
            {' '}{label} kvar{status.resetAt ? ' idag' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bannerUpgrade}
          onPress={handleUpgrade}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerUpgradeGradient}
          >
            <Crown size={13} color="#FFF" />
            <Text style={styles.bannerUpgradeText}>Premium</Text>
            <ChevronRight size={14} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface FreemiumLimitReachedProps {
  feature: FreemiumFeature;
  status: FreemiumStatus;
  onGoBack?: () => void;
}

export function FreemiumLimitReached({ feature, status, onGoBack }: FreemiumLimitReachedProps) {
  const { theme, isDark } = useTheme();
  const label = getFeatureLabel(feature);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/premium' as any);
  };

  return (
    <View style={[styles.limitContainer, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.limitCard, { backgroundColor: theme.colors.card }]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          style={styles.limitIconCircle}
        >
          <Lock size={32} color="#FFF" />
        </LinearGradient>

        <Text style={[styles.limitTitle, { color: theme.colors.text }]}>
          Daglig gräns nådd
        </Text>
        <Text style={[styles.limitDesc, { color: theme.colors.textSecondary }]}>
          Du har använt alla dina {status.total} gratis {label} för idag.
          Uppgradera till Premium för obegränsad åtkomst.
        </Text>

        {status.resetAt && (
          <View style={[styles.limitResetBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Clock size={16} color={theme.colors.primary} />
            <Text style={[styles.limitResetText, { color: theme.colors.text }]}>
              {getResetLabel(status.resetAt)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.limitUpgradeButton}
          onPress={handleUpgrade}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            style={styles.limitUpgradeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Crown size={20} color="#FFF" />
            <Text style={styles.limitUpgradeButtonText}>Uppgradera till Premium</Text>
          </LinearGradient>
        </TouchableOpacity>

        {onGoBack && (
          <TouchableOpacity onPress={onGoBack} style={styles.limitBackButton} activeOpacity={0.7}>
            <Text style={[styles.limitBackText, { color: theme.colors.textSecondary }]}>Gå tillbaka</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exhaustedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    overflow: 'hidden',
  },
  exhaustedIconBar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exhaustedContent: {
    flex: 1,
    gap: 2,
  },
  exhaustedTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  exhaustedSub: {
    fontSize: 12,
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  upgradeChip: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  upgradeChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 5,
  },
  upgradeChipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  compactUpgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactUpgradeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bannerContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerInfo: {
    flex: 1,
    gap: 6,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 5,
  },
  counterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bannerText: {
    fontSize: 14,
  },
  bannerUpgrade: {
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 12,
  },
  bannerUpgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 5,
  },
  bannerUpgradeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  limitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  limitCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  limitIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  limitTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 10,
    textAlign: 'center',
  },
  limitDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  limitResetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  limitResetText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  limitUpgradeButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  limitUpgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  limitUpgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800' as const,
  },
  limitBackButton: {
    paddingVertical: 8,
  },
  limitBackText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
