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

  const getHairShadow = () => {
    const colorMap: Record<string, string> = {
      '#2C1B18': '#1A0F0D',
      '#7C5643': '#5A3D2E',
      '#E6C288': '#C9A56C',
      '#B55239': '#8A3D2A',
      '#8C8C8C': '#6B6B6B',
      '#4A90E2': '#3672B8',
      '#50C878': '#3DA360',
      '#9B59B6': '#7E3D96',
    };
    return colorMap[hairColor] || hairColor;
  };

  const renderHair = () => {
    const shadowColor = getHairShadow();

    switch (config.hairStyle) {
      case 'short':
        return (
          <G>
            <Path
              d="M42 38 Q40 30, 38 24 Q36 16, 40 12 Q48 6, 58 8 Q65 6, 70 4 Q75 6, 82 8 Q92 6, 100 12 Q104 16, 102 24 Q100 30, 98 38 Q96 42, 94 44"
              fill={hairColor}
            />
            <Path
              d="M42 38 Q40 32, 38 28 Q37 22, 39 18"
              stroke={shadowColor}
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
          </G>
        );
      case 'medium':
        return (
          <G>
            <Path
              d="M36 40 Q34 32, 32 24 Q30 14, 36 8 Q44 2, 54 4 Q62 2, 70 0 Q78 2, 86 4 Q96 2, 104 8 Q110 14, 108 24 Q106 32, 104 40 Q102 48, 98 54 L42 54 Q38 48, 36 40 Z"
              fill={hairColor}
            />
            <Path
              d="M38 40 Q36 34, 34 28 Q33 20, 37 14"
              stroke={shadowColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M44 52 Q48 50, 52 52"
              stroke={shadowColor}
              strokeWidth="1.5"
              fill="none"
              opacity="0.2"
            />
          </G>
        );
      case 'long':
        return (
          <G>
            <Path
              d="M30 36 Q28 26, 26 18 Q24 8, 32 2 Q42 -4, 54 -2 Q62 -4, 70 -6 Q78 -4, 86 -2 Q98 -4, 108 2 Q116 8, 114 18 Q112 26, 110 36 Q110 50, 108 64 Q106 76, 102 84 L38 84 Q34 76, 32 64 Q30 50, 30 36 Z"
              fill={hairColor}
            />
            <Path
              d="M32 36 Q30 28, 28 22 Q27 14, 33 8"
              stroke={shadowColor}
              strokeWidth="2.5"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M40 78 Q44 75, 48 78 M52 80 Q56 77, 60 80"
              stroke={shadowColor}
              strokeWidth="1.5"
              fill="none"
              opacity="0.2"
            />
          </G>
        );
      case 'curly':
        return (
          <G>
            <Circle cx="42" cy="24" r="11" fill={hairColor} />
            <Circle cx="48" cy="16" r="10" fill={hairColor} />
            <Circle cx="58" cy="12" r="12" fill={hairColor} />
            <Circle cx="70" cy="10" r="13" fill={hairColor} />
            <Circle cx="82" cy="12" r="12" fill={hairColor} />
            <Circle cx="92" cy="16" r="10" fill={hairColor} />
            <Circle cx="98" cy="24" r="11" fill={hairColor} />
            <Circle cx="46" cy="30" r="9" fill={hairColor} />
            <Circle cx="58" cy="28" r="10" fill={hairColor} />
            <Circle cx="70" cy="26" r="11" fill={hairColor} />
            <Circle cx="82" cy="28" r="10" fill={hairColor} />
            <Circle cx="94" cy="30" r="9" fill={hairColor} />
            <Circle cx="42" cy="24" r="6" fill={shadowColor} opacity="0.3" />
            <Circle cx="70" cy="10" r="7" fill="white" opacity="0.3" />
          </G>
        );
      case 'bald':
        return null;
      case 'ponytail':
        return (
          <G>
            <Path
              d="M40 38 Q38 30, 36 24 Q34 16, 40 10 Q50 4, 60 6 Q68 4, 76 6 Q86 4, 96 10 Q102 16, 100 24 Q98 30, 96 38"
              fill={hairColor}
            />
            <Ellipse cx="104" cy="32" rx="10" ry="26" fill={hairColor} />
            <Path
              d="M100 20 Q102 28, 104 36"
              stroke={shadowColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </G>
        );
      case 'bun':
        return (
          <G>
            <Path
              d="M40 38 Q38 30, 36 24 Q34 16, 40 10 Q50 4, 60 6 Q68 4, 76 6 Q86 4, 96 10 Q102 16, 100 24 Q98 30, 96 38"
              fill={hairColor}
            />
            <Circle cx="70" cy="10" r="14" fill={hairColor} />
            <Path
              d="M60 10 Q70 14, 80 10"
              stroke={shadowColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </G>
        );
      case 'mohawk':
        return (
          <Path
            d="M60 38 Q64 28, 66 20 Q68 10, 70 2 Q72 10, 74 20 Q76 28, 80 38 L70 40 Z"
            fill={hairColor}
          />
        );
      default:
        return null;
    }
  };

  const renderEyebrows = () => {
    return (
      <G>
        <Path
          d="M46 44 Q52 42, 58 43"
          stroke="#2C1B18"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <Path
          d="M82 43 Q88 42, 94 44"
          stroke="#2C1B18"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </G>
    );
  };

  const renderEyes = () => {
    switch (config.eyeShape) {
      case 'round':
        return (
          <G>
            <Ellipse cx="52" cy="52" rx="9" ry="10" fill="white" />
            <Circle cx="52" cy="52" r="6" fill={eyeColor} />
            <Circle cx="52" cy="52" r="3" fill="#1A1A1A" />
            <Circle cx="54" cy="50" r="1.5" fill="white" />
            
            <Ellipse cx="88" cy="52" rx="9" ry="10" fill="white" />
            <Circle cx="88" cy="52" r="6" fill={eyeColor} />
            <Circle cx="88" cy="52" r="3" fill="#1A1A1A" />
            <Circle cx="90" cy="50" r="1.5" fill="white" />
          </G>
        );
      case 'almond':
        return (
          <G>
            <Ellipse cx="52" cy="52" rx="10" ry="8" fill="white" />
            <Ellipse cx="52" cy="52" rx="5" ry="4.5" fill={eyeColor} />
            <Circle cx="52" cy="52" r="2.5" fill="#1A1A1A" />
            <Circle cx="53.5" cy="50.5" r="1" fill="white" />
            
            <Ellipse cx="88" cy="52" rx="10" ry="8" fill="white" />
            <Ellipse cx="88" cy="52" rx="5" ry="4.5" fill={eyeColor} />
            <Circle cx="88" cy="52" r="2.5" fill="#1A1A1A" />
            <Circle cx="89.5" cy="50.5" r="1" fill="white" />
          </G>
        );
      case 'wide':
        return (
          <G>
            <Ellipse cx="52" cy="52" rx="10" ry="11" fill="white" />
            <Circle cx="52" cy="52" r="7" fill={eyeColor} />
            <Circle cx="52" cy="52" r="4" fill="#1A1A1A" />
            <Circle cx="54" cy="50" r="2" fill="white" />
            
            <Ellipse cx="88" cy="52" rx="10" ry="11" fill="white" />
            <Circle cx="88" cy="52" r="7" fill={eyeColor} />
            <Circle cx="88" cy="52" r="4" fill="#1A1A1A" />
            <Circle cx="90" cy="50" r="2" fill="white" />
          </G>
        );
      case 'narrow':
        return (
          <G>
            <Ellipse cx="52" cy="52" rx="11" ry="6" fill="white" />
            <Ellipse cx="52" cy="52" rx="6" ry="3.5" fill={eyeColor} />
            <Ellipse cx="52" cy="52" rx="3" ry="2" fill="#1A1A1A" />
            <Circle cx="53.5" cy="51" r="0.8" fill="white" />
            
            <Ellipse cx="88" cy="52" rx="11" ry="6" fill="white" />
            <Ellipse cx="88" cy="52" rx="6" ry="3.5" fill={eyeColor} />
            <Ellipse cx="88" cy="52" rx="3" ry="2" fill="#1A1A1A" />
            <Circle cx="89.5" cy="51" r="0.8" fill="white" />
          </G>
        );
      case 'happy':
        return (
          <G>
            <Path d="M46 52 Q52 56, 58 52" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <Path d="M82 52 Q88 56, 94 52" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none" />
          </G>
        );
      default:
        return null;
    }
  };

  const renderNose = () => {
    return (
      <G>
        <Path
          d="M68 58 Q69 62, 70 64"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="67" cy="64" r="1.5" fill="rgba(0,0,0,0.1)" />
        <Circle cx="73" cy="64" r="1.5" fill="rgba(0,0,0,0.1)" />
      </G>
    );
  };

  const renderMouth = () => {
    switch (config.mouthShape) {
      case 'smile':
        return (
          <G>
            <Path
              d="M52 70 Q70 80, 88 70"
              stroke="#8B4545"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M54 71 Q70 78, 86 71"
              stroke="#FF6B9D"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </G>
        );
      case 'big-smile':
        return (
          <G>
            <Path
              d="M48 70 Q70 84, 92 70 Q88 78, 70 82 Q52 78, 48 70 Z"
              fill="#8B4545"
            />
            <Path
              d="M52 72 L58 72 M62 72 L68 72 M72 72 L78 72 M82 72 L88 72"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M50 71 Q70 80, 90 71"
              stroke="#FF6B9D"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </G>
        );
      case 'neutral':
        return (
          <Path
            d="M54 72 L86 72"
            stroke="#8B4545"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'open':
        return (
          <G>
            <Ellipse
              cx="70"
              cy="74"
              rx="10"
              ry="7"
              fill="#8B4545"
            />
            <Ellipse
              cx="70"
              cy="72"
              rx="8"
              ry="5"
              fill="#4A2525"
            />
          </G>
        );
      case 'surprised':
        return (
          <G>
            <Circle
              cx="70"
              cy="72"
              r="6"
              fill="#8B4545"
            />
            <Circle
              cx="70"
              cy="71"
              r="4"
              fill="#4A2525"
            />
          </G>
        );
      default:
        return null;
    }
  };

  const getClothingShadow = () => {
    const alpha = clothingColor.startsWith('#') ? '30' : '';
    if (clothingColor.startsWith('#')) {
      return clothingColor + alpha;
    }
    return clothingColor;
  };

  const renderClothing = () => {
    const baseY = 86;
    const shadowColor = getClothingShadow();
    
    switch (config.clothingStyle) {
      case 'tshirt':
        return (
          <G>
            <Path
              d={`M38 ${baseY} Q32 ${baseY + 4}, 28 ${baseY + 12} L28 ${baseY + 50} L112 ${baseY + 50} L112 ${baseY + 12} Q108 ${baseY + 4}, 102 ${baseY} L88 ${baseY} Q84 ${baseY + 4}, 70 ${baseY + 4} Q56 ${baseY + 4}, 52 ${baseY} Z`}
              fill={clothingColor}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Path
              d={`M52 ${baseY + 2} Q48 ${baseY + 6}, 44 ${baseY + 12}`}
              stroke={shadowColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <Ellipse cx="70" cy={baseY + 8} rx="8" ry="3" fill="rgba(0,0,0,0.08)" />
          </G>
        );
      case 'hoodie':
        return (
          <G>
            <Path
              d={`M38 ${baseY} Q32 ${baseY + 4}, 28 ${baseY + 12} L28 ${baseY + 50} L112 ${baseY + 50} L112 ${baseY + 12} Q108 ${baseY + 4}, 102 ${baseY} L88 ${baseY} Q84 ${baseY + 4}, 70 ${baseY + 4} Q56 ${baseY + 4}, 52 ${baseY} Z`}
              fill={clothingColor}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Path
              d="M52 ${baseY + 4} Q58 ${baseY}, 64 ${baseY + 2} Q70 ${baseY}, 76 ${baseY + 2} Q82 ${baseY}, 88 ${baseY + 4}"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              fill="none"
            />
            <Circle cx="66" cy={baseY + 10} r="1.5" fill="rgba(0,0,0,0.3)" />
            <Circle cx="74" cy={baseY + 10} r="1.5" fill="rgba(0,0,0,0.3)" />
            <Path
              d="M56 ${baseY + 6} L58 ${baseY + 14}"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Path
              d="M84 ${baseY + 6} L82 ${baseY + 14}"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
          </G>
        );
      case 'sweater':
        return (
          <G>
            <Rect
              x="28"
              y={baseY}
              width="84"
              height="50"
              rx="8"
              fill={clothingColor}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Ellipse cx="70" cy={baseY + 6} rx="10" ry="4" fill="rgba(0,0,0,0.1)" />
            <Path
              d={`M32 ${baseY + 20} Q70 ${baseY + 22}, 108 ${baseY + 20}`}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="2"
              fill="none"
            />
          </G>
        );
      case 'shirt':
        return (
          <G>
            <Path
              d={`M38 ${baseY} Q32 ${baseY + 4}, 28 ${baseY + 12} L28 ${baseY + 50} L112 ${baseY + 50} L112 ${baseY + 12} Q108 ${baseY + 4}, 102 ${baseY} L88 ${baseY} Q84 ${baseY + 4}, 70 ${baseY + 4} Q56 ${baseY + 4}, 52 ${baseY} Z`}
              fill={clothingColor}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Path
              d={`M70 ${baseY + 4} L70 ${baseY + 30}`}
              stroke="white"
              strokeWidth="3"
            />
            <Circle cx="70" cy={baseY + 10} r="1.5" fill="rgba(0,0,0,0.3)" />
            <Circle cx="70" cy={baseY + 18} r="1.5" fill="rgba(0,0,0,0.3)" />
            <Circle cx="70" cy={baseY + 26} r="1.5" fill="rgba(0,0,0,0.3)" />
            <Path
              d={`M56 ${baseY} Q52 ${baseY + 2}, 50 ${baseY + 6}`}
              stroke="white"
              strokeWidth="2.5"
              fill="none"
            />
            <Path
              d={`M84 ${baseY} Q88 ${baseY + 2}, 90 ${baseY + 6}`}
              stroke="white"
              strokeWidth="2.5"
              fill="none"
            />
          </G>
        );
      case 'vneck':
        return (
          <G>
            <Path
              d={`M38 ${baseY} Q32 ${baseY + 4}, 28 ${baseY + 12} L28 ${baseY + 50} L112 ${baseY + 50} L112 ${baseY + 12} Q108 ${baseY + 4}, 102 ${baseY} L88 ${baseY + 2} L70 ${baseY + 14} L52 ${baseY + 2} Z`}
              fill={clothingColor}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <Path
              d={`M88 ${baseY + 2} L70 ${baseY + 14}`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              fill="none"
            />
            <Path
              d={`M52 ${baseY + 2} L70 ${baseY + 14}`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              fill="none"
            />
          </G>
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
            <Ellipse cx="52" cy="52" rx="10" ry="9" fill="rgba(255,255,255,0.3)" stroke="#2C1B18" strokeWidth="2.5" />
            <Ellipse cx="88" cy="52" rx="10" ry="9" fill="rgba(255,255,255,0.3)" stroke="#2C1B18" strokeWidth="2.5" />
            <Path d="M62 52 L78 52" stroke="#2C1B18" strokeWidth="2.5" />
            <Path d="M42 52 Q38 50, 36 48" stroke="#2C1B18" strokeWidth="2" />
            <Path d="M98 52 Q102 50, 104 48" stroke="#2C1B18" strokeWidth="2" />
          </G>
        );
      case 'sunglasses':
        return (
          <G>
            <Ellipse cx="52" cy="52" rx="10" ry="9" fill="#1A1A1A" opacity="0.8" stroke="#2C1B18" strokeWidth="2.5" />
            <Ellipse cx="88" cy="52" rx="10" ry="9" fill="#1A1A1A" opacity="0.8" stroke="#2C1B18" strokeWidth="2.5" />
            <Path d="M62 52 L78 52" stroke="#2C1B18" strokeWidth="2.5" />
            <Path d="M42 52 Q38 50, 36 48" stroke="#2C1B18" strokeWidth="2" />
            <Path d="M98 52 Q102 50, 104 48" stroke="#2C1B18" strokeWidth="2" />
            <Ellipse cx="48" cy="48" rx="3" ry="2" fill="white" opacity="0.4" />
            <Ellipse cx="84" cy="48" rx="3" ry="2" fill="white" opacity="0.4" />
          </G>
        );
      case 'cap':
        return (
          <G>
            <Ellipse cx="70" cy="28" rx="32" ry="10" fill="#E74C3C" />
            <Path d="M38 28 Q70 22, 102 28 L92 34 Q70 28, 48 34 Z" fill="#E74C3C" />
            <Rect x="28" y="28" width="16" height="4" rx="2" fill="#C0392B" />
            <Path d="M40 30 Q45 28, 50 30" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none" />
          </G>
        );
      case 'beanie':
        return (
          <G>
            <Path
              d="M36 36 Q34 26, 36 18 Q40 8, 50 4 Q60 2, 70 0 Q80 2, 90 4 Q100 8, 104 18 Q106 26, 104 36"
              fill="#E67E22"
              stroke="#C55616"
              strokeWidth="1"
            />
            <Path
              d="M40 20 Q70 22, 100 20"
              stroke="#C55616"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <Circle cx="70" cy="4" r="4" fill="#C55616" />
          </G>
        );
      case 'headphones':
        return (
          <G>
            <Path
              d="M38 50 Q38 20, 70 18 Q102 20, 102 50"
              stroke="#2C3E50"
              strokeWidth="4"
              fill="none"
            />
            <Rect x="34" y="50" width="10" height="14" rx="5" fill="#2C3E50" />
            <Rect x="96" y="50" width="10" height="14" rx="5" fill="#2C3E50" />
            <Rect x="36" y="52" width="6" height="10" rx="3" fill="#34495E" />
            <Rect x="98" y="52" width="6" height="10" rx="3" fill="#34495E" />
          </G>
        );
      case 'earrings':
        return (
          <G>
            <Circle cx="38" cy="58" r="1" fill="#FFD700" />
            <Circle cx="38" cy="62" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
            <Circle cx="102" cy="58" r="1" fill="#FFD700" />
            <Circle cx="102" cy="62" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
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

  const getSkinShadow = () => {
    const colorMap: Record<string, string> = {
      '#FFE0BD': '#E6C9A8',
      '#FFD0A6': '#E6B990',
      '#D4A574': '#B8895D',
      '#B68A62': '#9A6F4C',
      '#8D5524': '#6B3D15',
      '#5C3317': '#3D1F0B',
    };
    return colorMap[skinColor] || skinColor;
  };

  const content = (
    <View style={containerStyle}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        <Circle cx="70" cy="60" r="32" fill={skinColor} />
        <Circle cx="70" cy="60" r="32" fill={getSkinShadow()} opacity="0.15" />
        
        <Path
          d="M50 72 Q60 76, 70 76 Q80 76, 90 72"
          fill={skinColor}
        />
        
        <Ellipse cx="44" cy="58" rx="4" ry="6" fill="rgba(255,105,180,0.3)" />
        <Ellipse cx="96" cy="58" rx="4" ry="6" fill="rgba(255,105,180,0.3)" />
        
        {renderClothing()}
        
        {renderHair()}
        
        {config.eyeShape !== 'happy' && renderEyebrows()}
        
        {renderEyes()}
        
        {renderNose()}
        
        {renderMouth()}
        
        {renderAccessory()}
        
        <Path
          d="M38 60 Q38 50, 42 44"
          stroke={getSkinShadow()}
          strokeWidth="3"
          opacity="0.15"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M102 60 Q102 50, 98 44"
          stroke={getSkinShadow()}
          strokeWidth="3"
          opacity="0.15"
          fill="none"
          strokeLinecap="round"
        />
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
          <Circle cx="70" cy="60" r="32" fill={skinColor} />
          <Circle cx="70" cy="60" r="32" fill={getSkinShadow()} opacity="0.15" />
          
          <Path
            d="M50 72 Q60 76, 70 76 Q80 76, 90 72"
            fill={skinColor}
          />
          
          <Ellipse cx="44" cy="58" rx="4" ry="6" fill="rgba(255,105,180,0.3)" />
          <Ellipse cx="96" cy="58" rx="4" ry="6" fill="rgba(255,105,180,0.3)" />
          
          {renderClothing()}
          
          {renderHair()}
          
          {config.eyeShape !== 'happy' && renderEyebrows()}
          
          {renderEyes()}
          
          {renderNose()}
          
          {renderMouth()}
          
          {renderAccessory()}
          
          <Path
            d="M38 60 Q38 50, 42 44"
            stroke={getSkinShadow()}
            strokeWidth="3"
            opacity="0.15"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M102 60 Q102 50, 98 44"
            stroke={getSkinShadow()}
            strokeWidth="3"
            opacity="0.15"
            fill="none"
            strokeLinecap="round"
          />
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
