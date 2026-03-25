import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZES } from '@/constants/design-system';

interface IconContainerProps {
  Icon: LucideIcon;
  size?: keyof typeof ICON_SIZES;
  color?: string;
  backgroundColor?: string;
  gradient?: readonly [string, string];
  style?: ViewStyle;
}

export default function IconContainer({
  Icon,
  size = 'md',
  color,
  backgroundColor,
  gradient,
  style,
}: IconContainerProps) {
  const { theme } = useTheme();
  const iconSize = ICON_SIZES[size];
  const containerSize = iconSize * 2;

  const containerStyle = [
    styles.container,
    {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    },
    !gradient && { backgroundColor: backgroundColor || theme.colors.primary + '15' },
    style,
  ];

  const iconColor = color || theme.colors.primary;

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={containerStyle}
      >
        <Icon size={iconSize} color={iconColor} />
      </LinearGradient>
    );
  }

  return (
    <View style={containerStyle}>
      <Icon size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
