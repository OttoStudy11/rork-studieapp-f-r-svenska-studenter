import React, { memo } from 'react';
import { StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';

interface GradientCardProps {
  children: React.ReactNode;
  colors: [string, string, ...string[]];
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  borderRadius?: number;
  disabled?: boolean;
}

export const GradientCard = memo(function GradientCard({
  children,
  colors,
  onPress,
  style,
  borderRadius = 20,
  disabled,
}: GradientCardProps) {
  const gradient = (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius }, style]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
        style={{ borderRadius }}
      >
        {gradient}
      </TouchableOpacity>
    );
  }

  return gradient;
});

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
