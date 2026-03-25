import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/design-system';

interface TextProps {
  children: React.ReactNode;
  variant?: keyof typeof TYPOGRAPHY;
  color?: 'text' | 'textSecondary' | 'textMuted' | 'primary' | 'success' | 'error' | 'warning';
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}

export default function Text({
  children,
  variant = 'bodyMedium',
  color = 'text',
  style,
  numberOfLines,
  onPress,
}: TextProps) {
  const { theme } = useTheme();

  const colorMap = {
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
  };

  return (
    <RNText
      style={[
        TYPOGRAPHY[variant],
        { color: colorMap[color] },
        style,
      ]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
}
