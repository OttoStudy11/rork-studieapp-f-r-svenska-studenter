import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface XpLevelRingProps {
  progress: number; // 0-100
  color: string;
  size?: number;
  strokeWidth?: number;
  level: number;
  totalXp: number;
  xpCurrent: number;
  xpRequired: number;
  tierName: string;
  emoji: string;
}

export const XpLevelRing = memo(function XpLevelRing({
  progress,
  color,
  size = 80,
  strokeWidth = 6,
  level,
  totalXp,
  xpCurrent,
  xpRequired,
  tierName,
  emoji,
}: XpLevelRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - filled}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.levelText, { color }]}>Nivå {level}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
