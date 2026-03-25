import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.borderLight],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }, style]}>
      <Skeleton height={20} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={16} width="50%" style={{ marginBottom: 12 }} />
      <Skeleton height={4} width="100%" borderRadius={2} />
    </View>
  );
};

export const SkeletonStats: React.FC = () => {
  return (
    <View style={styles.statsContainer}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.statCard}>
          <Skeleton width={24} height={24} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width={30} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width="80%" height={12} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonHeader: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={16} width="40%" />
    </View>
  );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <View>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});