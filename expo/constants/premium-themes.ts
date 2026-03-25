export interface AppThemeConfig {
  id: string;
  name: string;
  isPremium: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    gradientStart: string;
    gradientEnd: string;
  };
  preview: string[];
}

export const APP_THEMES: AppThemeConfig[] = [
  {
    id: 'default',
    name: 'Standard',
    isPremium: false,
    colors: {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      accent: '#8B5CF6',
      gradientStart: '#6366F1',
      gradientEnd: '#8B5CF6',
    },
    preview: ['#6366F1', '#8B5CF6', '#818CF8'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    isPremium: true,
    colors: {
      primary: '#0EA5E9',
      primaryLight: '#38BDF8',
      primaryDark: '#0284C7',
      accent: '#06B6D4',
      gradientStart: '#0EA5E9',
      gradientEnd: '#06B6D4',
    },
    preview: ['#0EA5E9', '#06B6D4', '#38BDF8'],
  },
  {
    id: 'sunset',
    name: 'Solnedgång',
    isPremium: true,
    colors: {
      primary: '#F97316',
      primaryLight: '#FB923C',
      primaryDark: '#EA580C',
      accent: '#EF4444',
      gradientStart: '#F97316',
      gradientEnd: '#EF4444',
    },
    preview: ['#F97316', '#EF4444', '#FB923C'],
  },
  {
    id: 'forest',
    name: 'Skog',
    isPremium: true,
    colors: {
      primary: '#059669',
      primaryLight: '#34D399',
      primaryDark: '#047857',
      accent: '#10B981',
      gradientStart: '#059669',
      gradientEnd: '#10B981',
    },
    preview: ['#059669', '#10B981', '#34D399'],
  },
  {
    id: 'rose',
    name: 'Ros',
    isPremium: true,
    colors: {
      primary: '#E11D48',
      primaryLight: '#FB7185',
      primaryDark: '#BE123C',
      accent: '#F43F5E',
      gradientStart: '#E11D48',
      gradientEnd: '#F43F5E',
    },
    preview: ['#E11D48', '#F43F5E', '#FB7185'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    isPremium: true,
    colors: {
      primary: '#7C3AED',
      primaryLight: '#A78BFA',
      primaryDark: '#6D28D9',
      accent: '#EC4899',
      gradientStart: '#7C3AED',
      gradientEnd: '#EC4899',
    },
    preview: ['#7C3AED', '#EC4899', '#A78BFA'],
  },
  {
    id: 'midnight',
    name: 'Midnatt',
    isPremium: true,
    colors: {
      primary: '#3B82F6',
      primaryLight: '#60A5FA',
      primaryDark: '#2563EB',
      accent: '#1D4ED8',
      gradientStart: '#3B82F6',
      gradientEnd: '#1D4ED8',
    },
    preview: ['#3B82F6', '#1D4ED8', '#60A5FA'],
  },
  {
    id: 'gold',
    name: 'Guld',
    isPremium: true,
    colors: {
      primary: '#D97706',
      primaryLight: '#FBBF24',
      primaryDark: '#B45309',
      accent: '#F59E0B',
      gradientStart: '#D97706',
      gradientEnd: '#F59E0B',
    },
    preview: ['#D97706', '#F59E0B', '#FBBF24'],
  },
];

export const PREMIUM_AVATAR_ITEMS = {
  faces: [
    { id: 'ninja', name: 'Ninja', emoji: '🥷', isPremium: true },
    { id: 'robot', name: 'Robot', emoji: '🤖', isPremium: true },
    { id: 'alien', name: 'Alien', emoji: '👽', isPremium: true },
    { id: 'fire', name: 'Eld', emoji: '🔥', isPremium: true },
  ],
  hats: [
    { id: 'wizard', name: 'Trollkarl', isPremium: true },
    { id: 'pirate', name: 'Pirat', isPremium: true },
    { id: 'astronaut', name: 'Astronaut', isPremium: true },
    { id: 'viking', name: 'Viking', isPremium: true },
    { id: 'tophat', name: 'Cylinderhatt', isPremium: true },
  ],
  outfits: [
    { id: 'suit', name: 'Kostym', isPremium: true },
    { id: 'labcoat', name: 'Labbrock', isPremium: true },
    { id: 'armor', name: 'Rustning', isPremium: true },
    { id: 'kimono', name: 'Kimono', isPremium: true },
  ],
  backpacks: [
    { id: 'jetpack', name: 'Jetpack', isPremium: true },
    { id: 'sword', name: 'Svärd', isPremium: true },
    { id: 'shield', name: 'Sköld', isPremium: true },
  ],
  bodyColors: [
    { id: 'gold', name: 'Guld', color: '#FFD700', isPremium: true },
    { id: 'silver', name: 'Silver', color: '#C0C0C0', isPremium: true },
    { id: 'neon-green', name: 'Neon Grön', color: '#39FF14', isPremium: true },
    { id: 'neon-pink', name: 'Neon Rosa', color: '#FF6EC7', isPremium: true },
    { id: 'holographic', name: 'Holografisk', color: '#B4A7FF', isPremium: true },
  ],
  backgrounds: [
    { id: 'gradient-fire', name: 'Eld Gradient', color: 'linear-gradient(#FF6B35, #F7931E)', isPremium: true },
    { id: 'gradient-ocean', name: 'Ocean Gradient', color: 'linear-gradient(#667eea, #764ba2)', isPremium: true },
    { id: 'gradient-aurora', name: 'Aurora Gradient', color: 'linear-gradient(#a8edea, #fed6e3)', isPremium: true },
    { id: 'galaxy', name: 'Galax', color: '#0F0C29', isPremium: true },
    { id: 'sunset', name: 'Solnedgång', color: '#FF7E5F', isPremium: true },
  ],
};
