import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Sparkles, Crown, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { FREE_AI_LIMIT } from '@/lib/ai-usage-tracker';

interface AIUsageIndicatorProps {
  compact?: boolean;
}

export default function AIUsageIndicator({ compact = false }: AIUsageIndicatorProps) {
  const { theme } = useTheme();
  const { isPremium, aiUsageCount } = usePremium();

  if (isPremium) {
    if (compact) return null;
    return (
      <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' + '15' }]}>
        <Sparkles size={14} color="#FFD700" />
        <Text style={styles.premiumText}>Obegränsade AI-genereringar</Text>
      </View>
    );
  }

  const remaining = Math.max(0, FREE_AI_LIMIT - aiUsageCount);
  const usagePercent = Math.min(100, (aiUsageCount / FREE_AI_LIMIT) * 100);
  const isLow = remaining <= 3;
  const isOut = remaining === 0;

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: isOut ? '#EF4444' + '15' : isLow ? '#F59E0B' + '15' : theme.colors.card }]}>
        <Zap size={12} color={isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.colors.primary} />
        <Text style={[styles.compactText, { color: isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.colors.textSecondary }]}>
          {remaining}/{FREE_AI_LIMIT}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Zap size={16} color={isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.text }]}>
            AI-genereringar denna vecka
          </Text>
        </View>
        <Text style={[styles.countText, { color: isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.colors.primary }]}>
          {aiUsageCount}/{FREE_AI_LIMIT}
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${usagePercent}%`,
              backgroundColor: isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.colors.primary,
            },
          ]}
        />
      </View>

      {isOut && (
        <TouchableOpacity
          style={styles.upgradeRow}
          onPress={() => router.push('/premium' as any)}
          activeOpacity={0.7}
        >
          <Crown size={14} color="#FFD700" />
          <Text style={styles.upgradeText}>Uppgradera till Premium för obegränsade genereringar</Text>
        </TouchableOpacity>
      )}

      {isLow && !isOut && (
        <Text style={[styles.warningText, { color: '#F59E0B' }]}>
          {remaining} generering{remaining !== 1 ? 'ar' : ''} kvar denna vecka
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
