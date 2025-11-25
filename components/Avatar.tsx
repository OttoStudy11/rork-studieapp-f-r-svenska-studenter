import React from 'react';
import CharacterAvatar from './CharacterAvatar';
import type { AvatarConfig } from '@/constants/avatar-config';

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  showBorder?: boolean;
}

export default function Avatar({ config, size = 120, showBorder = false }: AvatarProps) {
  return (
    <CharacterAvatar
      config={config}
      size={size}
      showBorder={showBorder}
    />
  );
}
