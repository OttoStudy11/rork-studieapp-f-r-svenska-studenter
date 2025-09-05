import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AvatarConfig } from './AvatarCustomizer';

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  showBorder?: boolean;
}

export default function Avatar({ config, size = 60, showBorder = false }: AvatarProps) {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: showBorder ? 2 : 0,
        borderColor: showBorder ? '#4F46E5' : 'transparent'
      }
    ]}>
      <Text style={[styles.emoji, { fontSize: size * 0.7 }]}>
        {config.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  emoji: {
    textAlign: 'center',
  },
});