export interface AvatarConfig {
  bodyColor: string;
  faceExpression: string;
  hat: string;
  hatColor: string;
  outfit: string;
  outfitColor: string;
  outfitPattern: string;
  backpack: string;
  backpackColor: string;
  socks: string;
  socksColor: string;
  backgroundColor: string;
}

export const BODY_COLORS = [
  { id: 'white', name: 'Vit', color: '#F5F5F5' },
  { id: 'cream', name: 'Kräm', color: '#FFF8E7' },
  { id: 'pink', name: 'Rosa', color: '#FFE4E8' },
  { id: 'mint', name: 'Mint', color: '#E0F5F0' },
  { id: 'lavender', name: 'Lavendel', color: '#E8E0F0' },
  { id: 'peach', name: 'Persika', color: '#FFE5D0' },
  { id: 'sky', name: 'Himmel', color: '#E0F0FF' },
  { id: 'yellow', name: 'Gul', color: '#FFF5D0' },
];

export const FACE_EXPRESSIONS = [
  { id: 'happy', name: 'Glad', emoji: '😊' },
  { id: 'cool', name: 'Cool', emoji: '😎' },
  { id: 'surprised', name: 'Förvånad', emoji: '😮' },
  { id: 'wink', name: 'Blink', emoji: '😉' },
  { id: 'love', name: 'Kärlek', emoji: '😍' },
  { id: 'sleepy', name: 'Sömnig', emoji: '😴' },
  { id: 'silly', name: 'Fånig', emoji: '😜' },
  { id: 'focused', name: 'Fokuserad', emoji: '🧐' },
];

export const HATS = [
  { id: 'none', name: 'Ingen' },
  { id: 'cap', name: 'Keps' },
  { id: 'beanie', name: 'Mössa' },
  { id: 'crown', name: 'Krona' },
  { id: 'headband', name: 'Pannband' },
  { id: 'bow', name: 'Rosett' },
  { id: 'horns', name: 'Horn' },
  { id: 'halo', name: 'Gloria' },
];

export const HAT_COLORS = [
  { id: 'blue', name: 'Blå', color: '#4A90E2' },
  { id: 'orange', name: 'Orange', color: '#F5A623' },
  { id: 'red', name: 'Röd', color: '#E74C3C' },
  { id: 'green', name: 'Grön', color: '#2ECC71' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
  { id: 'pink', name: 'Rosa', color: '#FF6B9D' },
  { id: 'yellow', name: 'Gul', color: '#F1C40F' },
  { id: 'black', name: 'Svart', color: '#2C3E50' },
];

export const OUTFITS = [
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'tshirt', name: 'T-shirt' },
  { id: 'sweater', name: 'Tröja' },
  { id: 'jacket', name: 'Jacka' },
  { id: 'dress', name: 'Klänning' },
  { id: 'overalls', name: 'Hängselbyxor' },
];

export const OUTFIT_COLORS = [
  { id: 'black', name: 'Svart', color: '#1A1A1A' },
  { id: 'white', name: 'Vit', color: '#FFFFFF' },
  { id: 'red', name: 'Röd', color: '#E74C3C' },
  { id: 'blue', name: 'Blå', color: '#3498DB' },
  { id: 'green', name: 'Grön', color: '#2ECC71' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
  { id: 'orange', name: 'Orange', color: '#E67E22' },
  { id: 'pink', name: 'Rosa', color: '#FF6B9D' },
  { id: 'navy', name: 'Marinblå', color: '#2C3E50' },
];

export const OUTFIT_PATTERNS = [
  { id: 'none', name: 'Ingen' },
  { id: 'flames', name: 'Lågor' },
  { id: 'stars', name: 'Stjärnor' },
  { id: 'stripes', name: 'Ränder' },
  { id: 'hearts', name: 'Hjärtan' },
  { id: 'lightning', name: 'Blixt' },
  { id: 'skull', name: 'Dödskalle' },
  { id: 'rainbow', name: 'Regnbåge' },
];

export const BACKPACKS = [
  { id: 'none', name: 'Ingen' },
  { id: 'school', name: 'Skolväska' },
  { id: 'rocket', name: 'Raket' },
  { id: 'wings', name: 'Vingar' },
  { id: 'cape', name: 'Cape' },
  { id: 'teddy', name: 'Nalle' },
];

export const BACKPACK_COLORS = [
  { id: 'green', name: 'Grön', color: '#2ECC71' },
  { id: 'blue', name: 'Blå', color: '#3498DB' },
  { id: 'red', name: 'Röd', color: '#E74C3C' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
  { id: 'orange', name: 'Orange', color: '#E67E22' },
  { id: 'pink', name: 'Rosa', color: '#FF6B9D' },
  { id: 'yellow', name: 'Gul', color: '#F1C40F' },
];

export const SOCKS = [
  { id: 'short', name: 'Korta' },
  { id: 'long', name: 'Långa' },
  { id: 'striped', name: 'Randiga' },
  { id: 'mismatched', name: 'Olika' },
];

export const SOCK_COLORS = [
  { id: 'white', name: 'Vit', color: '#FFFFFF' },
  { id: 'blue', name: 'Blå', color: '#4A90E2' },
  { id: 'red', name: 'Röd', color: '#E74C3C' },
  { id: 'green', name: 'Grön', color: '#2ECC71' },
  { id: 'purple', name: 'Lila', color: '#9B59B6' },
  { id: 'pink', name: 'Rosa', color: '#FF6B9D' },
  { id: 'rainbow', name: 'Regnbåge', color: 'rainbow' },
];

export const BACKGROUND_COLORS = [
  { id: 'dark', name: 'Mörk', color: '#2D2D2D' },
  { id: 'blue', name: 'Blå', color: '#E3F2FD' },
  { id: 'green', name: 'Grön', color: '#E8F5E9' },
  { id: 'yellow', name: 'Gul', color: '#FFF9E6' },
  { id: 'pink', name: 'Rosa', color: '#FCE4EC' },
  { id: 'purple', name: 'Lila', color: '#F3E5F5' },
  { id: 'orange', name: 'Orange', color: '#FFF3E0' },
  { id: 'gray', name: 'Grå', color: '#F5F5F5' },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  bodyColor: 'white',
  faceExpression: 'happy',
  hat: 'cap',
  hatColor: 'blue',
  outfit: 'hoodie',
  outfitColor: 'black',
  outfitPattern: 'flames',
  backpack: 'school',
  backpackColor: 'green',
  socks: 'long',
  socksColor: 'blue',
  backgroundColor: 'dark',
};
