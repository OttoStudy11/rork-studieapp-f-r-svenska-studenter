import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Palette, Shirt, Eye, Smile } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothingColor: string;
  accessory: string;
}

interface AvatarCustomizerProps {
  onAvatarChange: (config: AvatarConfig) => void;
  initialConfig?: AvatarConfig;
}

const skinTones = [
  { id: 'light', color: '#FDBCB4', name: 'Ljus' },
  { id: 'medium-light', color: '#F1C27D', name: 'Medium ljus' },
  { id: 'medium', color: '#E0AC69', name: 'Medium' },
  { id: 'medium-dark', color: '#C68642', name: 'Medium mörk' },
  { id: 'dark', color: '#8D5524', name: 'Mörk' },
  { id: 'very-dark', color: '#5C2E04', name: 'Mycket mörk' }
];

const hairStyles = [
  { id: 'short', name: 'Kort', icon: '✂️' },
  { id: 'medium', name: 'Medium', icon: '💇' },
  { id: 'long', name: 'Långt', icon: '👩' },
  { id: 'curly', name: 'Lockigt', icon: '🌀' },
  { id: 'bald', name: 'Skallig', icon: '👨‍🦲' },
  { id: 'ponytail', name: 'Hästsvans', icon: '🎀' }
];

const hairColors = [
  { id: 'blonde', color: '#F5DEB3', name: 'Blond' },
  { id: 'brown', color: '#8B4513', name: 'Brun' },
  { id: 'black', color: '#2F1B14', name: 'Svart' },
  { id: 'red', color: '#CD853F', name: 'Röd' },
  { id: 'gray', color: '#808080', name: 'Grå' },
  { id: 'blue', color: '#4169E1', name: 'Blå' }
];

const eyeColors = [
  { id: 'brown', color: '#8B4513', name: 'Brun' },
  { id: 'blue', color: '#4169E1', name: 'Blå' },
  { id: 'green', color: '#228B22', name: 'Grön' },
  { id: 'hazel', color: '#DAA520', name: 'Nötbrun' },
  { id: 'gray', color: '#708090', name: 'Grå' },
  { id: 'amber', color: '#FFBF00', name: 'Bärnsten' }
];

const clothingColors = [
  { id: 'red', color: '#FF6B6B', name: 'Röd' },
  { id: 'blue', color: '#4ECDC4', name: 'Blå' },
  { id: 'green', color: '#45B7D1', name: 'Grön' },
  { id: 'purple', color: '#96CEB4', name: 'Lila' },
  { id: 'orange', color: '#FFEAA7', name: 'Orange' },
  { id: 'pink', color: '#FD79A8', name: 'Rosa' }
];

const accessories = [
  { id: 'none', name: 'Ingen', icon: '❌' },
  { id: 'glasses', name: 'Glasögon', icon: '👓' },
  { id: 'hat', name: 'Hatt', icon: '🎩' },
  { id: 'headphones', name: 'Hörlurar', icon: '🎧' },
  { id: 'cap', name: 'Keps', icon: '🧢' },
  { id: 'bow', name: 'Rosett', icon: '🎀' }
];

const defaultConfig: AvatarConfig = {
  skinTone: 'medium-light',
  hairStyle: 'medium',
  hairColor: 'brown',
  eyeColor: 'brown',
  clothingColor: 'blue',
  accessory: 'none'
};

export default function AvatarCustomizer({ onAvatarChange, initialConfig = defaultConfig }: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [activeCategory, setActiveCategory] = useState<string>('skin');

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onAvatarChange(newConfig);
  };

  const renderAvatarPreview = () => {
    const skinTone = skinTones.find(s => s.id === config.skinTone);
    const hairColor = hairColors.find(h => h.id === config.hairColor);
    const eyeColor = eyeColors.find(e => e.id === config.eyeColor);
    const clothingColor = clothingColors.find(c => c.id === config.clothingColor);
    
    return (
      <View style={styles.avatarPreview}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.avatarBackground}
        >
          {/* Face */}
          <View style={[styles.face, { backgroundColor: skinTone?.color }]}>
            {/* Hair */}
            {config.hairStyle !== 'bald' && (
              <View style={[styles.hair, { backgroundColor: hairColor?.color }]} />
            )}
            
            {/* Eyes */}
            <View style={styles.eyesContainer}>
              <View style={[styles.eye, { backgroundColor: eyeColor?.color }]} />
              <View style={[styles.eye, { backgroundColor: eyeColor?.color }]} />
            </View>
            
            {/* Mouth */}
            <View style={styles.mouth} />
          </View>
          
          {/* Body/Clothing */}
          <View style={[styles.clothing, { backgroundColor: clothingColor?.color }]} />
          
          {/* Accessory */}
          {config.accessory !== 'none' && (
            <View style={styles.accessoryContainer}>
              <Text style={styles.accessoryEmoji}>
                {accessories.find(a => a.id === config.accessory)?.icon || ''}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderColorOptions = (colors: any[], selectedId: string, onSelect: (id: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
      {colors.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.colorOption,
            { backgroundColor: item.color },
            selectedId === item.id && styles.selectedColorOption
          ]}
          onPress={() => onSelect(item.id)}
        >
          {selectedId === item.id && (
            <View style={styles.selectedIndicator} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStyleOptions = (options: any[], selectedId: string, onSelect: (id: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
      {options.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.styleOption,
            selectedId === item.id && styles.selectedStyleOption
          ]}
          onPress={() => onSelect(item.id)}
        >
          <Text style={styles.styleEmoji}>{item.icon}</Text>
          <Text style={[
            styles.styleText,
            selectedId === item.id && styles.selectedStyleText
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const categories = [
    { id: 'skin', name: 'Hud', icon: User },
    { id: 'hair', name: 'Hår', icon: Palette },
    { id: 'eyes', name: 'Ögon', icon: Eye },
    { id: 'clothing', name: 'Kläder', icon: Shirt },
    { id: 'accessories', name: 'Tillbehör', icon: Smile }
  ];

  const renderCustomizationOptions = () => {
    switch (activeCategory) {
      case 'skin':
        return (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Hudton</Text>
            {renderColorOptions(skinTones, config.skinTone, (id) => updateConfig('skinTone', id))}
          </View>
        );
      case 'hair':
        return (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Frisyr</Text>
            {renderStyleOptions(hairStyles, config.hairStyle, (id) => updateConfig('hairStyle', id))}
            <Text style={styles.categoryTitle}>Hårfärg</Text>
            {renderColorOptions(hairColors, config.hairColor, (id) => updateConfig('hairColor', id))}
          </View>
        );
      case 'eyes':
        return (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Ögonfärg</Text>
            {renderColorOptions(eyeColors, config.eyeColor, (id) => updateConfig('eyeColor', id))}
          </View>
        );
      case 'clothing':
        return (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Klädfärg</Text>
            {renderColorOptions(clothingColors, config.clothingColor, (id) => updateConfig('clothingColor', id))}
          </View>
        );
      case 'accessories':
        return (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Tillbehör</Text>
            {renderStyleOptions(accessories, config.accessory, (id) => updateConfig('accessory', id))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderAvatarPreview()}
      
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <IconComponent 
                  size={24} 
                  color={activeCategory === category.id ? '#4F46E5' : '#666'} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === category.id && styles.activeCategoryButtonText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      <View style={styles.customizationContainer}>
        {renderCustomizationOptions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  face: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hair: {
    position: 'absolute',
    top: -10,
    width: 80,
    height: 40,
    borderRadius: 40,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mouth: {
    width: 12,
    height: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    marginTop: 8,
  },
  clothing: {
    position: 'absolute',
    bottom: 0,
    width: 100,
    height: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  accessoryContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  accessoryEmoji: {
    fontSize: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 70,
  },
  activeCategoryButton: {
    backgroundColor: 'white',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#4F46E5',
  },
  customizationContainer: {
    flex: 1,
    width: '100%',
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsScroll: {
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: 'white',
    borderWidth: 3,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  styleOption: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 70,
  },
  selectedStyleOption: {
    backgroundColor: 'white',
  },
  styleEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  styleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedStyleText: {
    color: '#4F46E5',
  },
});