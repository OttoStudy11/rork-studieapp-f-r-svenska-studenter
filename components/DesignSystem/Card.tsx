import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/design-system';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'compact' | 'elevated';
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.xl,
      ...SHADOWS.sm,
    },
    compact: {
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.lg,
      ...SHADOWS.sm,
    },
    elevated: {
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.xl,
      ...SHADOWS.md,
    },
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.card },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
});
