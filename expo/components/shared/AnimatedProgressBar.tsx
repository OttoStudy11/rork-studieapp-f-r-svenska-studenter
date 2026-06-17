import React, { memo, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, LayoutChangeEvent, ViewStyle } from 'react-native';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  color: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const AnimatedProgressBar = memo(function AnimatedProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  borderRadius = 4,
  animated = true,
  style,
}: AnimatedProgressBarProps) {
  const { theme } = require('@/contexts/ThemeContext').useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const prevProgress = useRef(0);

  useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: progress,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      anim.setValue(progress);
    }
    prevProgress.current = progress;
  }, [progress, animated, anim]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius,
          backgroundColor: backgroundColor || theme.colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius,
            backgroundColor: color,
            width: animated ? widthInterpolated : `${Math.min(100, Math.max(0, progress))}%`,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
