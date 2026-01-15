import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import type { AvatarConfig } from '@/constants/avatar-config';
import {
  BODY_COLORS,
  HAT_COLORS,
  OUTFIT_COLORS,
  BACKPACK_COLORS,
  SOCK_COLORS,
  BACKGROUND_COLORS,
} from '@/constants/avatar-config';

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
  const bodyColor = BODY_COLORS.find(c => c.id === config.bodyColor)?.color || '#F5F5F5';
  const hatColor = HAT_COLORS.find(c => c.id === config.hatColor)?.color || '#4A90E2';
  const outfitColor = OUTFIT_COLORS.find(c => c.id === config.outfitColor)?.color || '#1A1A1A';
  const backpackColor = BACKPACK_COLORS.find(c => c.id === config.backpackColor)?.color || '#2ECC71';
  const sockColor = SOCK_COLORS.find(c => c.id === config.socksColor)?.color || '#4A90E2';
  const bgColor = BACKGROUND_COLORS.find(c => c.id === config.backgroundColor)?.color || '#2D2D2D';

  const darkenColor = (color: string, amount: number = 0.2): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const renderFace = () => {
    switch (config.faceExpression) {
      case 'happy':
        return (
          <G>
            <Circle cx="58" cy="38" r="3" fill="#1A1A1A" />
            <Circle cx="82" cy="38" r="3" fill="#1A1A1A" />
            <Path d="M62 48 Q70 54, 78 48" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
          </G>
        );
      case 'cool':
        return (
          <G>
            <Path d="M54 36 L62 36" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
            <Path d="M78 36 L86 36" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
            <Path d="M64 48 L76 48" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          </G>
        );
      case 'surprised':
        return (
          <G>
            <Circle cx="58" cy="38" r="4" fill="#1A1A1A" />
            <Circle cx="82" cy="38" r="4" fill="#1A1A1A" />
            <Ellipse cx="70" cy="50" rx="4" ry="5" fill="#1A1A1A" />
          </G>
        );
      case 'wink':
        return (
          <G>
            <Circle cx="58" cy="38" r="3" fill="#1A1A1A" />
            <Path d="M78 38 Q82 36, 86 38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M62 48 Q70 54, 78 48" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
          </G>
        );
      case 'love':
        return (
          <G>
            <Path d="M54 36 Q56 32, 58 36 Q60 32, 62 36 L58 42 Z" fill="#E74C3C" />
            <Path d="M78 36 Q80 32, 82 36 Q84 32, 86 36 L82 42 Z" fill="#E74C3C" />
            <Path d="M62 48 Q70 54, 78 48" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
          </G>
        );
      case 'sleepy':
        return (
          <G>
            <Path d="M54 38 Q58 40, 62 38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M78 38 Q82 40, 86 38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Ellipse cx="70" cy="50" rx="3" ry="2" fill="#1A1A1A" />
          </G>
        );
      case 'silly':
        return (
          <G>
            <Circle cx="58" cy="38" r="3" fill="#1A1A1A" />
            <Path d="M78 38 Q82 36, 86 38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M62 48 Q70 54, 78 48" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M72 50 L72 56" stroke="#FF6B9D" strokeWidth="3" strokeLinecap="round" />
          </G>
        );
      case 'focused':
        return (
          <G>
            <Circle cx="58" cy="38" r="3" fill="#1A1A1A" />
            <Circle cx="82" cy="38" r="3" fill="#1A1A1A" />
            <Path d="M52 32 L64 34" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            <Path d="M88 32 L76 34" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            <Path d="M66 50 L74 50" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          </G>
        );
      default:
        return (
          <G>
            <Circle cx="58" cy="38" r="3" fill="#1A1A1A" />
            <Circle cx="82" cy="38" r="3" fill="#1A1A1A" />
          </G>
        );
    }
  };

  const renderHat = () => {
    const hatDark = darkenColor(hatColor, 0.15);
    
    switch (config.hat) {
      case 'cap':
        return (
          <G>
            <Ellipse cx="70" cy="18" rx="28" ry="12" fill={hatColor} />
            <Rect x="42" y="14" width="56" height="10" rx="5" fill={hatColor} />
            <Rect x="30" y="18" width="24" height="6" rx="3" fill={hatDark} />
            <Circle cx="56" cy="14" r="8" fill="#F5A623" />
            <Circle cx="56" cy="14" r="5" fill="#FFD93D" />
            <Circle cx="55" cy="13" r="1.5" fill="#1A1A1A" />
            <Circle cx="58" cy="13" r="1.5" fill="#1A1A1A" />
            <Path d="M54 16 Q56 17, 58 16" stroke="#1A1A1A" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </G>
        );
      case 'beanie':
        return (
          <G>
            <Path d="M42 28 Q42 8, 70 6 Q98 8, 98 28 L42 28 Z" fill={hatColor} />
            <Rect x="42" y="22" width="56" height="8" fill={hatDark} />
            <Circle cx="70" cy="4" r="5" fill={hatColor} />
          </G>
        );
      case 'crown':
        return (
          <G>
            <Path d="M46 28 L50 10 L58 20 L70 6 L82 20 L90 10 L94 28 Z" fill="#F1C40F" />
            <Circle cx="50" cy="10" r="3" fill="#E74C3C" />
            <Circle cx="70" cy="6" r="3" fill="#3498DB" />
            <Circle cx="90" cy="10" r="3" fill="#2ECC71" />
            <Rect x="46" y="24" width="48" height="6" fill="#DAA520" />
          </G>
        );
      case 'headband':
        return (
          <G>
            <Rect x="42" y="18" width="56" height="8" rx="4" fill={hatColor} />
            <Circle cx="70" cy="22" r="6" fill={hatDark} />
          </G>
        );
      case 'bow':
        return (
          <G>
            <Ellipse cx="55" cy="16" rx="10" ry="8" fill={hatColor} />
            <Ellipse cx="85" cy="16" rx="10" ry="8" fill={hatColor} />
            <Circle cx="70" cy="16" r="6" fill={hatDark} />
          </G>
        );
      case 'horns':
        return (
          <G>
            <Path d="M48 28 Q42 18, 38 8" stroke={hatColor} strokeWidth="8" strokeLinecap="round" fill="none" />
            <Path d="M92 28 Q98 18, 102 8" stroke={hatColor} strokeWidth="8" strokeLinecap="round" fill="none" />
          </G>
        );
      case 'halo':
        return (
          <G>
            <Ellipse cx="70" cy="8" rx="20" ry="6" fill="none" stroke="#F1C40F" strokeWidth="4" />
            <Ellipse cx="70" cy="8" rx="20" ry="6" fill="none" stroke="#FFE66D" strokeWidth="2" />
          </G>
        );
      default:
        return null;
    }
  };

  const renderOutfitPattern = () => {
    switch (config.outfitPattern) {
      case 'flames':
        return (
          <G>
            <Path d="M50 95 Q52 85, 56 90 Q54 80, 60 88 Q58 78, 66 86 Q64 90, 68 95" fill="#F5A623" />
            <Path d="M72 95 Q74 85, 78 90 Q76 80, 82 88 Q80 78, 88 86 Q86 90, 90 95" fill="#F5A623" />
            <Path d="M52 92 Q54 86, 58 90 Q56 84, 62 88" fill="#FF6B35" />
            <Path d="M78 92 Q80 86, 84 90 Q82 84, 88 88" fill="#FF6B35" />
          </G>
        );
      case 'stars':
        return (
          <G>
            <Path d="M55 80 L57 76 L59 80 L63 80 L60 83 L61 87 L57 85 L53 87 L54 83 L51 80 Z" fill="#F1C40F" />
            <Path d="M80 85 L82 81 L84 85 L88 85 L85 88 L86 92 L82 90 L78 92 L79 88 L76 85 Z" fill="#F1C40F" />
          </G>
        );
      case 'stripes':
        return (
          <G>
            <Rect x="48" y="75" width="44" height="4" fill="rgba(255,255,255,0.3)" />
            <Rect x="48" y="85" width="44" height="4" fill="rgba(255,255,255,0.3)" />
          </G>
        );
      case 'hearts':
        return (
          <G>
            <Path d="M52 80 Q54 76, 56 80 Q58 76, 60 80 L56 86 Z" fill="#E74C3C" />
            <Path d="M80 85 Q82 81, 84 85 Q86 81, 88 85 L84 91 Z" fill="#E74C3C" />
          </G>
        );
      case 'lightning':
        return (
          <G>
            <Path d="M65 72 L70 82 L66 82 L72 96 L68 86 L72 86 Z" fill="#F1C40F" />
          </G>
        );
      case 'skull':
        return (
          <G>
            <Ellipse cx="70" cy="82" rx="8" ry="9" fill="white" />
            <Circle cx="66" cy="80" r="2" fill="#1A1A1A" />
            <Circle cx="74" cy="80" r="2" fill="#1A1A1A" />
            <Path d="M66 88 L68 86 L70 88 L72 86 L74 88" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
          </G>
        );
      case 'rainbow':
        return (
          <G>
            <Path d="M50 78 Q70 72, 90 78" stroke="#E74C3C" strokeWidth="3" fill="none" />
            <Path d="M50 82 Q70 76, 90 82" stroke="#F1C40F" strokeWidth="3" fill="none" />
            <Path d="M50 86 Q70 80, 90 86" stroke="#2ECC71" strokeWidth="3" fill="none" />
            <Path d="M50 90 Q70 84, 90 90" stroke="#3498DB" strokeWidth="3" fill="none" />
          </G>
        );
      default:
        return null;
    }
  };

  const renderOutfit = () => {
    const outfitDark = darkenColor(outfitColor, 0.1);
    
    switch (config.outfit) {
      case 'hoodie':
        return (
          <G>
            <Path d="M42 60 Q42 56, 48 54 L92 54 Q98 56, 98 60 L98 100 L42 100 Z" fill={outfitColor} />
            <Path d="M56 54 Q70 60, 84 54" stroke={outfitDark} strokeWidth="2" fill="none" />
            <Circle cx="64" cy="62" r="2" fill={outfitDark} />
            <Circle cx="76" cy="62" r="2" fill={outfitDark} />
            <Path d="M64 64 L64 72" stroke={outfitDark} strokeWidth="1.5" />
            <Path d="M76 64 L76 72" stroke={outfitDark} strokeWidth="1.5" />
            {renderOutfitPattern()}
          </G>
        );
      case 'tshirt':
        return (
          <G>
            <Path d="M46 60 L46 100 L94 100 L94 60 Q90 56, 84 54 L56 54 Q50 56, 46 60 Z" fill={outfitColor} />
            <Path d="M56 54 Q70 58, 84 54" stroke={outfitDark} strokeWidth="2" fill="none" />
            {renderOutfitPattern()}
          </G>
        );
      case 'sweater':
        return (
          <G>
            <Rect x="44" y="56" width="52" height="44" rx="4" fill={outfitColor} />
            <Rect x="44" y="56" width="52" height="8" fill={outfitDark} />
            <Rect x="44" y="92" width="52" height="8" fill={outfitDark} />
            {renderOutfitPattern()}
          </G>
        );
      case 'jacket':
        return (
          <G>
            <Rect x="44" y="56" width="52" height="44" rx="2" fill={outfitColor} />
            <Rect x="68" y="56" width="4" height="44" fill={outfitDark} />
            <Circle cx="62" cy="70" r="2" fill={outfitDark} />
            <Circle cx="62" cy="82" r="2" fill={outfitDark} />
            {renderOutfitPattern()}
          </G>
        );
      case 'dress':
        return (
          <G>
            <Path d="M48 56 L48 80 L40 100 L100 100 L92 80 L92 56 Q84 54, 70 54 Q56 54, 48 56 Z" fill={outfitColor} />
            <Path d="M56 54 Q70 58, 84 54" stroke={outfitDark} strokeWidth="2" fill="none" />
            {renderOutfitPattern()}
          </G>
        );
      case 'overalls':
        return (
          <G>
            <Rect x="46" y="66" width="48" height="34" rx="2" fill={outfitColor} />
            <Path d="M54 66 L54 54" stroke={outfitColor} strokeWidth="8" strokeLinecap="round" />
            <Path d="M86 66 L86 54" stroke={outfitColor} strokeWidth="8" strokeLinecap="round" />
            <Rect x="60" y="72" width="20" height="14" rx="2" fill={outfitDark} />
            {renderOutfitPattern()}
          </G>
        );
      default:
        return (
          <G>
            <Rect x="44" y="56" width="52" height="44" rx="4" fill={outfitColor} />
            {renderOutfitPattern()}
          </G>
        );
    }
  };

  const renderBackpack = () => {
    const bpDark = darkenColor(backpackColor, 0.15);
    
    switch (config.backpack) {
      case 'school':
        return (
          <G>
            <Rect x="96" y="58" width="18" height="36" rx="4" fill={backpackColor} />
            <Rect x="98" y="62" width="14" height="8" rx="2" fill={bpDark} />
            <Rect x="100" y="74" width="10" height="16" rx="2" fill={bpDark} />
          </G>
        );
      case 'rocket':
        return (
          <G>
            <Path d="M100 90 L108 50 L116 90 Z" fill={backpackColor} />
            <Circle cx="108" cy="70" r="6" fill={bpDark} />
            <Path d="M100 90 L104 100 L108 90 L112 100 L116 90" fill="#F5A623" />
          </G>
        );
      case 'wings':
        return (
          <G>
            <Path d="M96 55 Q110 50, 120 60 Q115 70, 96 75" fill={backpackColor} />
            <Path d="M96 58 Q108 54, 116 62 Q112 70, 96 73" fill="white" opacity="0.5" />
            <Path d="M44 55 Q30 50, 20 60 Q25 70, 44 75" fill={backpackColor} />
            <Path d="M44 58 Q32 54, 24 62 Q28 70, 44 73" fill="white" opacity="0.5" />
          </G>
        );
      case 'cape':
        return (
          <G>
            <Path d="M46 56 Q30 70, 35 100 L105 100 Q110 70, 94 56" fill={backpackColor} />
            <Path d="M48 58 Q35 70, 40 95 L100 95 Q105 70, 92 58" fill={bpDark} opacity="0.3" />
          </G>
        );
      case 'teddy':
        return (
          <G>
            <Ellipse cx="108" cy="75" rx="12" ry="15" fill="#B8860B" />
            <Circle cx="102" cy="65" r="6" fill="#B8860B" />
            <Circle cx="114" cy="65" r="6" fill="#B8860B" />
            <Circle cx="108" cy="78" r="8" fill="#D4A84B" />
            <Circle cx="105" cy="72" r="2" fill="#1A1A1A" />
            <Circle cx="111" cy="72" r="2" fill="#1A1A1A" />
            <Ellipse cx="108" cy="78" rx="3" ry="2" fill="#1A1A1A" />
          </G>
        );
      default:
        return null;
    }
  };

  const renderSocks = () => {
    const sockDark = sockColor === 'rainbow' ? '#9B59B6' : darkenColor(sockColor, 0.15);
    const actualSockColor = sockColor === 'rainbow' ? '#4A90E2' : sockColor;
    
    switch (config.socks) {
      case 'short':
        return (
          <G>
            <Rect x="48" y="100" width="14" height="8" rx="2" fill={actualSockColor} />
            <Rect x="78" y="100" width="14" height="8" rx="2" fill={actualSockColor} />
          </G>
        );
      case 'long':
        return (
          <G>
            <Rect x="48" y="96" width="14" height="16" rx="2" fill={actualSockColor} />
            <Rect x="78" y="96" width="14" height="16" rx="2" fill={actualSockColor} />
            <Rect x="48" y="96" width="14" height="4" fill={sockDark} />
            <Rect x="78" y="96" width="14" height="4" fill={sockDark} />
          </G>
        );
      case 'striped':
        return (
          <G>
            <Rect x="48" y="96" width="14" height="16" rx="2" fill={actualSockColor} />
            <Rect x="78" y="96" width="14" height="16" rx="2" fill={actualSockColor} />
            <Rect x="48" y="100" width="14" height="3" fill="white" />
            <Rect x="48" y="106" width="14" height="3" fill="white" />
            <Rect x="78" y="100" width="14" height="3" fill="white" />
            <Rect x="78" y="106" width="14" height="3" fill="white" />
          </G>
        );
      case 'mismatched':
        return (
          <G>
            <Rect x="48" y="96" width="14" height="16" rx="2" fill={actualSockColor} />
            <Rect x="78" y="96" width="14" height="16" rx="2" fill="#FF6B9D" />
          </G>
        );
      default:
        return (
          <G>
            <Rect x="48" y="100" width="14" height="8" rx="2" fill={actualSockColor} />
            <Rect x="78" y="100" width="14" height="8" rx="2" fill={actualSockColor} />
          </G>
        );
    }
  };

  const renderArms = () => {
    const armColor = bodyColor;
    return (
      <G>
        <Rect x="30" y="62" width="14" height="28" rx="7" fill={armColor} />
        <Rect x="96" y="62" width="14" height="28" rx="7" fill={armColor} />
        <Circle cx="37" cy="92" r="8" fill={armColor} />
        <Circle cx="103" cy="92" r="8" fill={armColor} />
      </G>
    );
  };

  const renderLegs = () => {
    const legColor = bodyColor;
    return (
      <G>
        <Rect x="50" y="98" width="10" height="20" rx="5" fill={legColor} />
        <Rect x="80" y="98" width="10" height="20" rx="5" fill={legColor} />
      </G>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 8,
        backgroundColor: bgColor,
        borderWidth: showBorder ? 3 : 0,
        borderColor: showBorder ? '#4F46E5' : 'transparent',
      }
    ]}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        {config.backpack === 'cape' && renderBackpack()}
        {config.backpack === 'wings' && renderBackpack()}
        
        {renderLegs()}
        {renderArms()}
        
        <Ellipse cx="70" cy="40" rx="28" ry="30" fill={bodyColor} />
        <Ellipse cx="70" cy="42" rx="26" ry="28" fill="white" opacity="0.3" />
        
        {renderFace()}
        
        {renderOutfit()}
        
        {config.hat !== 'none' && renderHat()}
        
        {config.backpack !== 'none' && config.backpack !== 'cape' && config.backpack !== 'wings' && renderBackpack()}
        
        {renderSocks()}
        
        <Circle cx="103" cy="72" r="5" fill="#4A4A4A" />
        <Circle cx="103" cy="72" r="3" fill="#2A2A2A" />
      </Svg>
    </View>
  );
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
