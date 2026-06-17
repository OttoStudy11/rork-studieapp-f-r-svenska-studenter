import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge = memo(function Badge({
  label,
  color,
  backgroundColor,
  size = 'md',
  style,
}: BadgeProps) {
  const sizeConfig = {
    sm: { fontSize: 10, paddingH: 8, paddingV: 3, height: 18 },
    md: { fontSize: 12, paddingH: 10, paddingV: 4, height: 22 },
    lg: { fontSize: 14, paddingH: 14, paddingV: 6, height: 28 },
  };

  const s = sizeConfig[size];

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          height: s.height,
          backgroundColor: backgroundColor || 'rgba(99,102,241,0.1)',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: s.fontSize,
            color: color || '#6366F1',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

interface GradientBadgeProps {
  label: string;
  gradientColors: [string, string];
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const GradientBadge = memo(function GradientBadge({
  label,
  gradientColors,
  size = 'md',
  style,
}: GradientBadgeProps) {
  const sizeConfig = {
    sm: { fontSize: 10, paddingH: 8, paddingV: 3, height: 18 },
    md: { fontSize: 12, paddingH: 10, paddingV: 4, height: 22 },
    lg: { fontSize: 14, paddingH: 14, paddingV: 6, height: 28 },
  };

  const s = sizeConfig[size];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          height: s.height,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: s.fontSize, color: '#FFF' }]}>
        {label}
      </Text>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
