import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { AvatarConfig } from './AvatarCustomizer';

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  showBorder?: boolean;
}

const skinTones = [
  { id: 'light', color: '#FDBCB4' },
  { id: 'medium-light', color: '#F1C27D' },
  { id: 'medium', color: '#E0AC69' },
  { id: 'medium-dark', color: '#C68642' },
  { id: 'dark', color: '#8D5524' },
  { id: 'very-dark', color: '#5C2E04' }
];

const hairColors = [
  { id: 'blonde', color: '#F5DEB3' },
  { id: 'brown', color: '#8B4513' },
  { id: 'black', color: '#2F1B14' },
  { id: 'red', color: '#CD853F' },
  { id: 'gray', color: '#808080' },
  { id: 'blue', color: '#4169E1' }
];

const eyeColors = [
  { id: 'brown', color: '#8B4513' },
  { id: 'blue', color: '#4169E1' },
  { id: 'green', color: '#228B22' },
  { id: 'hazel', color: '#DAA520' },
  { id: 'gray', color: '#708090' },
  { id: 'amber', color: '#FFBF00' }
];

const clothingColors = [
  { id: 'red', color: '#FF6B6B' },
  { id: 'blue', color: '#4ECDC4' },
  { id: 'green', color: '#45B7D1' },
  { id: 'purple', color: '#96CEB4' },
  { id: 'orange', color: '#FFEAA7' },
  { id: 'pink', color: '#FD79A8' }
];

const accessories = [
  { id: 'none', icon: '' },
  { id: 'glasses', icon: '👓' },
  { id: 'hat', icon: '🎩' },
  { id: 'headphones', icon: '🎧' },
  { id: 'cap', icon: '🧢' },
  { id: 'bow', icon: '🎀' }
];

export default function Avatar({ config, size = 60, showBorder = false }: AvatarProps) {
  const skinTone = skinTones.find(s => s.id === config.skinTone);
  const hairColor = hairColors.find(h => h.id === config.hairColor);
  const eyeColor = eyeColors.find(e => e.id === config.eyeColor);
  const clothingColor = clothingColors.find(c => c.id === config.clothingColor);
  const accessory = accessories.find(a => a.id === config.accessory);

  const scale = size / 60; // Base size is 60

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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      >
        {/* Face */}
        <View style={[
          styles.face,
          {
            backgroundColor: skinTone?.color,
            width: 42 * scale,
            height: 42 * scale,
            borderRadius: 21 * scale,
          }
        ]}>
          {/* Hair */}
          {config.hairStyle !== 'bald' && (
            <View style={[
              styles.hair,
              {
                backgroundColor: hairColor?.color,
                width: 48 * scale,
                height: 24 * scale,
                borderRadius: 24 * scale,
                top: -6 * scale,
              }
            ]} />
          )}
          
          {/* Eyes */}
          <View style={[styles.eyesContainer, { marginTop: 9 * scale, gap: 5 * scale }]}>
            <View style={[
              styles.eye,
              {
                backgroundColor: eyeColor?.color,
                width: 5 * scale,
                height: 5 * scale,
                borderRadius: 2.5 * scale,
              }
            ]} />
            <View style={[
              styles.eye,
              {
                backgroundColor: eyeColor?.color,
                width: 5 * scale,
                height: 5 * scale,
                borderRadius: 2.5 * scale,
              }
            ]} />
          </View>
          
          {/* Mouth */}
          <View style={[
            styles.mouth,
            {
              width: 7 * scale,
              height: 4 * scale,
              borderRadius: 4 * scale,
              marginTop: 5 * scale,
            }
          ]} />
        </View>
        
        {/* Body/Clothing */}
        <View style={[
          styles.clothing,
          {
            backgroundColor: clothingColor?.color,
            width: 60 * scale,
            height: 24 * scale,
            borderTopLeftRadius: 12 * scale,
            borderTopRightRadius: 12 * scale,
          }
        ]} />
        
        {/* Accessory */}
        {config.accessory !== 'none' && accessory && accessory.icon && (
          <View style={[styles.accessoryContainer, { top: 12 * scale }]}>
            <Text style={[styles.accessoryEmoji, { fontSize: 12 * scale }]}>
              {accessory.icon}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hair: {
    position: 'absolute',
  },
  eyesContainer: {
    flexDirection: 'row',
  },
  eye: {
    // Dynamic styles applied inline
  },
  mouth: {
    backgroundColor: '#FF6B6B',
  },
  clothing: {
    position: 'absolute',
    bottom: 0,
  },
  accessoryContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  accessoryEmoji: {
    // Dynamic styles applied inline
  },
});