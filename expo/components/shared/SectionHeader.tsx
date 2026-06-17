import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  style?: ViewStyle;
}

export const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  icon,
  onSeeAll,
  seeAllLabel = 'Se alla',
  style,
}: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            {seeAllLabel} →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {},
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  seeAllBtn: {
    paddingLeft: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
