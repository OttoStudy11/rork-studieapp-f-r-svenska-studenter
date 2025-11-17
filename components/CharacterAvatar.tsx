import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import type { AvatarConfig } from '@/constants/avatar-config';
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  CLOTHING_COLORS,
  BACKGROUND_COLORS,
} from '@/constants/avatar-config';
import { LinearGradient } from 'expo-linear-gradient';

interface CharacterAvatarProps {
  config: AvatarConfig;
  size?: number;
  showBorder?: boolean;
}

export default function CharacterAvatar({ 
  config, 
  size = 120, 
  showBorder = false 
}: CharacterAvatarProps) {
  const skinColor = SKIN_TONES.find(t => t.id === config.skinTone)?.color || SKIN_TONES[1].color;
  const hairColor = HAIR_COLORS.find(c => c.id === config.hairColor)?.color || HAIR_COLORS[1].color;
  const eyeColor = EYE_COLORS.find(c => c.id === config.eyeColor)?.color || EYE_COLORS[0].color;
  const clothingColor = CLOTHING_COLORS.find(c => c.id === config.clothingColor)?.color || CLOTHING_COLORS[1].color;
  const bgColorObj = BACKGROUND_COLORS.find(c => c.id === config.backgroundColor);

  const renderHair = () => {
    switch (config.hairStyle) {
      case 'short':
        return (
          <Path
            d="M60 30 Q50 15, 60 10 Q70 5, 80 10 Q90 15, 80 30 Z"
            fill={hairColor}
          />
        );
      case 'medium':
        return (
          <Path
            d="M55 25 Q45 10, 55 5 Q70 0, 85 5 Q95 10, 85 25 Q90 35, 85 40 L55 40 Q50 35, 55 25 Z"
            fill={hairColor}
          />
        );
      case 'long':
        return (
          <Path
            d="M50 20 Q40 5, 50 0 Q70 -5, 90 0 Q100 5, 90 20 Q95 40, 90 60 L50 60 Q45 40, 50 20 Z"
            fill={hairColor}
          />
        );
      case 'curly':
        return (
          <G>
            <Circle cx="55" cy="20" r="8" fill={hairColor} />
            <Circle cx="70" cy="15" r="10" fill={hairColor} />
            <Circle cx="85" cy="20" r="8" fill={hairColor} />
            <Circle cx="60" cy="30" r="7" fill={hairColor} />
            <Circle cx="80" cy="30" r="7" fill={hairColor} />
          </G>
        );
      case 'bald':
        return null;
      case 'ponytail':
        return (
          <G>
            <Path
              d="M55 25 Q50 15, 60 10 Q70 5, 80 10 Q85 15, 82 25"
              fill={hairColor}
            />
            <Ellipse cx="90" cy="30" rx="8" ry="20" fill={hairColor} />
          </G>
        );
      case 'bun':
        return (
          <G>
            <Path
              d="M55 25 Q50 15, 60 10 Q70 5, 80 10 Q85 15, 82 25"
              fill={hairColor}
            />
            <Circle cx="70" cy="15" r="10" fill={hairColor} />
          </G>
        );
      case 'mohawk':
        return (
          <Path
            d="M65 30 Q68 10, 70 5 Q72 10, 75 30 Z"
            fill={hairColor}
          />
        );
      default:
        return null;
    }
  };

  const renderEyes = () => {
    switch (config.eyeShape) {
      case 'round':
        return (
          <G>
            <Circle cx="55" cy="50" r="5" fill="white" />
            <Circle cx="55" cy="50" r="3" fill={eyeColor} />
            <Circle cx="85" cy="50" r="5" fill="white" />
            <Circle cx="85" cy="50" r="3" fill={eyeColor} />
          </G>
        );
      case 'almond':
        return (
          <G>
            <Ellipse cx="55" cy="50" rx="6" ry="4" fill="white" />
            <Circle cx="55" cy="50" r="2.5" fill={eyeColor} />
            <Ellipse cx="85" cy="50" rx="6" ry="4" fill="white" />
            <Circle cx="85" cy="50" r="2.5" fill={eyeColor} />
          </G>
        );
      case 'wide':
        return (
          <G>
            <Circle cx="55" cy="50" r="6" fill="white" />
            <Circle cx="55" cy="50" r="4" fill={eyeColor} />
            <Circle cx="85" cy="50" r="6" fill="white" />
            <Circle cx="85" cy="50" r="4" fill={eyeColor} />
          </G>
        );
      case 'narrow':
        return (
          <G>
            <Ellipse cx="55" cy="50" rx="7" ry="3" fill="white" />
            <Ellipse cx="55" cy="50" rx="4" ry="2" fill={eyeColor} />
            <Ellipse cx="85" cy="50" rx="7" ry="3" fill="white" />
            <Ellipse cx="85" cy="50" rx="4" ry="2" fill={eyeColor} />
          </G>
        );
      case 'happy':
        return (
          <G>
            <Path d="M50 48 Q55 52, 60 48" stroke={eyeColor} strokeWidth="2" fill="none" />
            <Path d="M80 48 Q85 52, 90 48" stroke={eyeColor} strokeWidth="2" fill="none" />
          </G>
        );
      default:
        return null;
    }
  };

  const renderMouth = () => {
    switch (config.mouthShape) {
      case 'smile':
        return (
          <Path
            d="M55 65 Q70 72, 85 65"
            stroke="#D97777"
            strokeWidth="2"
            fill="none"
          />
        );
      case 'big-smile':
        return (
          <Path
            d="M50 65 Q70 75, 90 65"
            stroke="#D97777"
            strokeWidth="3"
            fill="none"
          />
        );
      case 'neutral':
        return (
          <Path
            d="M55 68 L85 68"
            stroke="#D97777"
            strokeWidth="2"
          />
        );
      case 'open':
        return (
          <Ellipse
            cx="70"
            cy="70"
            rx="8"
            ry="6"
            fill="#D97777"
          />
        );
      case 'surprised':
        return (
          <Circle
            cx="70"
            cy="68"
            r="5"
            fill="#D97777"
          />
        );
      default:
        return null;
    }
  };

  const renderClothing = () => {
    const baseY = 90;
    
    switch (config.clothingStyle) {
      case 'tshirt':
        return (
          <Path
            d={`M45 ${baseY} L35 ${baseY + 15} L35 ${baseY + 40} L105 ${baseY + 40} L105 ${baseY + 15} L95 ${baseY} Z`}
            fill={clothingColor}
          />
        );
      case 'hoodie':
        return (
          <G>
            <Path
              d={`M45 ${baseY} L35 ${baseY + 15} L35 ${baseY + 40} L105 ${baseY + 40} L105 ${baseY + 15} L95 ${baseY} Z`}
              fill={clothingColor}
            />
            <Path
              d="M55 90 Q70 85, 85 90"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="2"
            />
          </G>
        );
      case 'sweater':
        return (
          <Rect
            x="35"
            y={baseY}
            width="70"
            height="40"
            rx="5"
            fill={clothingColor}
          />
        );
      case 'shirt':
        return (
          <G>
            <Path
              d={`M45 ${baseY} L35 ${baseY + 15} L35 ${baseY + 40} L105 ${baseY + 40} L105 ${baseY + 15} L95 ${baseY} Z`}
              fill={clothingColor}
            />
            <Rect x="67" y={baseY} width="6" height="30" fill="white" />
          </G>
        );
      case 'vneck':
        return (
          <Path
            d={`M45 ${baseY} L35 ${baseY + 15} L35 ${baseY + 40} L105 ${baseY + 40} L105 ${baseY + 15} L95 ${baseY} L70 ${baseY + 10} Z`}
            fill={clothingColor}
          />
        );
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    switch (config.accessory) {
      case 'glasses':
        return (
          <G>
            <Circle cx="55" cy="50" r="8" fill="none" stroke="#333" strokeWidth="2" />
            <Circle cx="85" cy="50" r="8" fill="none" stroke="#333" strokeWidth="2" />
            <Path d="M63 50 L77 50" stroke="#333" strokeWidth="2" />
          </G>
        );
      case 'sunglasses':
        return (
          <G>
            <Circle cx="55" cy="50" r="8" fill="#333" opacity="0.7" />
            <Circle cx="85" cy="50" r="8" fill="#333" opacity="0.7" />
            <Path d="M63 50 L77 50" stroke="#333" strokeWidth="2" />
          </G>
        );
      case 'cap':
        return (
          <G>
            <Ellipse cx="70" cy="25" rx="25" ry="8" fill="#E74C3C" />
            <Path d="M45 25 Q70 20, 95 25 L85 30 Q70 25, 55 30 Z" fill="#E74C3C" />
            <Rect x="40" y="25" width="10" height="3" fill="#C0392B" />
          </G>
        );
      case 'beanie':
        return (
          <Path
            d="M50 30 Q45 15, 55 10 Q70 5, 85 10 Q95 15, 90 30 Z"
            fill="#E67E22"
          />
        );
      case 'headphones':
        return (
          <G>
            <Path
              d="M45 45 Q45 25, 70 25 Q95 25, 95 45"
              stroke="#333"
              strokeWidth="3"
              fill="none"
            />
            <Rect x="42" y="45" width="8" height="12" rx="4" fill="#333" />
            <Rect x="90" y="45" width="8" height="12" rx="4" fill="#333" />
          </G>
        );
      case 'earrings':
        return (
          <G>
            <Circle cx="45" cy="55" r="3" fill="#FFD700" />
            <Circle cx="95" cy="55" r="3" fill="#FFD700" />
          </G>
        );
      default:
        return null;
    }
  };

  const getBackgroundGradient = () => {
    if (config.backgroundColor === 'gradient-blue') {
      return ['#667eea', '#764ba2'];
    } else if (config.backgroundColor === 'gradient-purple') {
      return ['#a8edea', '#fed6e3'];
    }
    return null;
  };

  const backgroundColor = bgColorObj?.color.includes('gradient') 
    ? 'transparent' 
    : (bgColorObj?.color || '#E3F2FD');

  const gradientColors = getBackgroundGradient();

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: gradientColors ? 'transparent' : backgroundColor,
      borderWidth: showBorder ? 3 : 0,
      borderColor: showBorder ? '#4F46E5' : 'transparent',
    }
  ];

  const content = (
    <View style={containerStyle}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        <Circle cx="70" cy="60" r="28" fill={skinColor} />
        
        {renderClothing()}
        
        {renderHair()}
        
        {renderEyes()}
        
        {renderMouth()}
        
        {renderAccessory()}
      </Svg>
    </View>
  );

  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: showBorder ? 3 : 0,
            borderColor: showBorder ? '#4F46E5' : 'transparent',
          }
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 140 140">
          <Circle cx="70" cy="60" r="28" fill={skinColor} />
          
          {renderClothing()}
          
          {renderHair()}
          
          {renderEyes()}
          
          {renderMouth()}
          
          {renderAccessory()}
        </Svg>
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
