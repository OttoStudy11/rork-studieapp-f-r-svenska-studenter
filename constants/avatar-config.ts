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
  { id: 'white', name: 'Vit', color: '#F5F5F5', isPremium: false },
  { id: 'cream', name: 'Kräm', color: '#FFF8E7', isPremium: false },
  { id: 'pink', name: 'Rosa', color: '#FFE4E8', isPremium: false },
  { id: 'mint', name: 'Mint', color: '#E0F5F0', isPremium: false },
  { id: 'lavender', name: 'Lavendel', color: '#E8E0F0', isPremium: false },
  { id: 'peach', name: 'Persika', color: '#FFE5D0', isPremium: false },
  { id: 'sky', name: 'Himmel', color: '#E0F0FF', isPremium: false },
  { id: 'yellow', name: 'Gul', color: '#FFF5D0', isPremium: false },
  { id: 'gold', name: 'Guld', color: '#FFD700', isPremium: true },
  { id: 'silver', name: 'Silver', color: '#C0C0C0', isPremium: true },
  { id: 'neon-green', name: 'Neon Grön', color: '#39FF14', isPremium: true },
  { id: 'neon-pink', name: 'Neon Rosa', color: '#FF6EC7', isPremium: true },
  { id: 'holographic', name: 'Holografisk', color: '#B4A7FF', isPremium: true },
];

export const FACE_EXPRESSIONS = [
  { id: 'happy', name: 'Glad', emoji: '😊', isPremium: false },
  { id: 'cool', name: 'Cool', emoji: '😎', isPremium: false },
  { id: 'surprised', name: 'Förvånad', emoji: '😮', isPremium: false },
  { id: 'wink', name: 'Blink', emoji: '😉', isPremium: false },
  { id: 'love', name: 'Kärlek', emoji: '😍', isPremium: false },
  { id: 'sleepy', name: 'Sömnig', emoji: '😴', isPremium: false },
  { id: 'silly', name: 'Fånig', emoji: '😜', isPremium: false },
  { id: 'focused', name: 'Fokuserad', emoji: '🧐', isPremium: false },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', isPremium: true },
  { id: 'robot', name: 'Robot', emoji: '🤖', isPremium: true },
  { id: 'alien', name: 'Alien', emoji: '👽', isPremium: true },
  { id: 'fire', name: 'Eld', emoji: '🔥', isPremium: true },
];

export const HATS = [
  { id: 'none', name: 'Ingen', isPremium: false },
  { id: 'cap', name: 'Keps', isPremium: false },
  { id: 'beanie', name: 'Mössa', isPremium: false },
  { id: 'crown', name: 'Krona', isPremium: false },
  { id: 'headband', name: 'Pannband', isPremium: false },
  { id: 'bow', name: 'Rosett', isPremium: false },
  { id: 'horns', name: 'Horn', isPremium: false },
  { id: 'halo', name: 'Gloria', isPremium: false },
  { id: 'wizard', name: 'Trollkarl', isPremium: true },
  { id: 'pirate', name: 'Pirat', isPremium: true },
  { id: 'astronaut', name: 'Astronaut', isPremium: true },
  { id: 'viking', name: 'Viking', isPremium: true },
  { id: 'tophat', name: 'Cylinderhatt', isPremium: true },
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
  { id: 'hoodie', name: 'Hoodie', isPremium: false },
  { id: 'tshirt', name: 'T-shirt', isPremium: false },
  { id: 'sweater', name: 'Tröja', isPremium: false },
  { id: 'jacket', name: 'Jacka', isPremium: false },
  { id: 'dress', name: 'Klänning', isPremium: false },
  { id: 'overalls', name: 'Hängselbyxor', isPremium: false },
  { id: 'suit', name: 'Kostym', isPremium: true },
  { id: 'labcoat', name: 'Labbrock', isPremium: true },
  { id: 'armor', name: 'Rustning', isPremium: true },
  { id: 'kimono', name: 'Kimono', isPremium: true },
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
  { id: 'none', name: 'Ingen', isPremium: false },
  { id: 'school', name: 'Skolväska', isPremium: false },
  { id: 'rocket', name: 'Raket', isPremium: false },
  { id: 'wings', name: 'Vingar', isPremium: false },
  { id: 'cape', name: 'Cape', isPremium: false },
  { id: 'teddy', name: 'Nalle', isPremium: false },
  { id: 'jetpack', name: 'Jetpack', isPremium: true },
  { id: 'sword', name: 'Svärd', isPremium: true },
  { id: 'shield', name: 'Sköld', isPremium: true },
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
  { id: 'dark', name: 'Mörk', color: '#2D2D2D', isPremium: false },
  { id: 'blue', name: 'Blå', color: '#E3F2FD', isPremium: false },
  { id: 'green', name: 'Grön', color: '#E8F5E9', isPremium: false },
  { id: 'yellow', name: 'Gul', color: '#FFF9E6', isPremium: false },
  { id: 'pink', name: 'Rosa', color: '#FCE4EC', isPremium: false },
  { id: 'purple', name: 'Lila', color: '#F3E5F5', isPremium: false },
  { id: 'orange', name: 'Orange', color: '#FFF3E0', isPremium: false },
  { id: 'gray', name: 'Grå', color: '#F5F5F5', isPremium: false },
  { id: 'galaxy', name: 'Galax', color: '#0F0C29', isPremium: true },
  { id: 'sunset', name: 'Solnedgång', color: '#FF7E5F', isPremium: true },
  { id: 'neon', name: 'Neon', color: '#0D0D0D', isPremium: true },
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
