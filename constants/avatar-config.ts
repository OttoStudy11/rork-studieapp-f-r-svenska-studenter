export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeShape: string;
  eyeColor: string;
  mouthShape: string;
  clothingStyle: string;
  clothingColor: string;
  accessory: string;
  backgroundColor: string;
}

export const SKIN_TONES = [
  { id: 'light', name: 'Ljus', color: '#FFE0BD' },
  { id: 'medium-light', name: 'Mellan-ljus', color: '#FFD0A6' },
  { id: 'medium', name: 'Medium', color: '#D4A574' },
  { id: 'medium-dark', name: 'Mellan-mörk', color: '#B68A62' },
  { id: 'dark', name: 'Mörk', color: '#8D5524' },
  { id: 'very-dark', name: 'Väldigt mörk', color: '#5C3317' },
];

export const HAIR_STYLES = [
  { id: 'short', name: 'Kort' },
  { id: 'medium', name: 'Mellan' },
  { id: 'long', name: 'Långt' },
  { id: 'curly', name: 'Lockigt' },
  { id: 'bald', name: 'Skallig' },
  { id: 'ponytail', name: 'Hästsvans' },
  { id: 'bun', name: 'Knut' },
  { id: 'mohawk', name: 'Mohawk' },
];

export const HAIR_COLORS = [
  { id: 'black', name: 'Svart', color: '#2C1B18' },
  { id: 'brown', name: 'Brun', color: '#7C5643' },
  { id: 'blonde', name: 'Blond', color: '#E6C288' },
  { id: 'red', name: 'Röd', color: '#B55239' },
  { id: 'gray', name: 'Grå', color: '#8C8C8C' },
  { id: 'blue', name: 'Blå', color: '#4A90E2' },
  { id: 'green', name: 'Grön', color: '#50C878' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
];

export const EYE_SHAPES = [
  { id: 'round', name: 'Runda' },
  { id: 'almond', name: 'Mandelformade' },
  { id: 'wide', name: 'Stora' },
  { id: 'narrow', name: 'Smala' },
  { id: 'happy', name: 'Glada' },
];

export const EYE_COLORS = [
  { id: 'brown', name: 'Bruna', color: '#6F4E37' },
  { id: 'blue', name: 'Blå', color: '#4A90E2' },
  { id: 'green', name: 'Gröna', color: '#50C878' },
  { id: 'hazel', name: 'Hasselnöt', color: '#8E7618' },
  { id: 'gray', name: 'Grå', color: '#808080' },
];

export const MOUTH_SHAPES = [
  { id: 'smile', name: 'Leende' },
  { id: 'big-smile', name: 'Stort leende' },
  { id: 'neutral', name: 'Neutral' },
  { id: 'open', name: 'Öppen' },
  { id: 'surprised', name: 'Förvånad' },
];

export const CLOTHING_STYLES = [
  { id: 'tshirt', name: 'T-shirt' },
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'sweater', name: 'Tröja' },
  { id: 'shirt', name: 'Skjorta' },
  { id: 'vneck', name: 'V-ringad' },
];

export const CLOTHING_COLORS = [
  { id: 'red', name: 'Röd', color: '#E74C3C' },
  { id: 'blue', name: 'Blå', color: '#3498DB' },
  { id: 'green', name: 'Grön', color: '#2ECC71' },
  { id: 'yellow', name: 'Gul', color: '#F1C40F' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
  { id: 'orange', name: 'Orange', color: '#E67E22' },
  { id: 'black', name: 'Svart', color: '#2C3E50' },
  { id: 'white', name: 'Vit', color: '#ECF0F1' },
  { id: 'gray', name: 'Grå', color: '#95A5A6' },
];

export const ACCESSORIES = [
  { id: 'none', name: 'Ingen' },
  { id: 'glasses', name: 'Glasögon' },
  { id: 'sunglasses', name: 'Solglasögon' },
  { id: 'cap', name: 'Keps' },
  { id: 'beanie', name: 'Mössa' },
  { id: 'headphones', name: 'Hörlurar' },
  { id: 'earrings', name: 'Örhängen' },
];

export const BACKGROUND_COLORS = [
  { id: 'blue', name: 'Blå', color: '#E3F2FD' },
  { id: 'green', name: 'Grön', color: '#E8F5E9' },
  { id: 'yellow', name: 'Gul', color: '#FFF9E6' },
  { id: 'pink', name: 'Rosa', color: '#FCE4EC' },
  { id: 'purple', name: 'Lila', color: '#F3E5F5' },
  { id: 'gray', name: 'Grå', color: '#F5F5F5' },
  { id: 'gradient-blue', name: 'Gradient Blå', color: 'linear-gradient' },
  { id: 'gradient-purple', name: 'Gradient Lila', color: 'linear-gradient' },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: 'medium-light',
  hairStyle: 'medium',
  hairColor: 'brown',
  eyeShape: 'almond',
  eyeColor: 'brown',
  mouthShape: 'smile',
  clothingStyle: 'tshirt',
  clothingColor: 'blue',
  accessory: 'none',
  backgroundColor: 'blue',
};
