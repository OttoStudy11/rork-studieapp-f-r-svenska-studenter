import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import CharacterAvatar from './CharacterAvatar';
import { 
  Palette,
  User,
  Eye,
  Smile,
  Shirt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import type { AvatarConfig } from '@/constants/avatar-config';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_SHAPES,
  EYE_COLORS,
  MOUTH_SHAPES,
  CLOTHING_STYLES,
  CLOTHING_COLORS,
  ACCESSORIES,
  BACKGROUND_COLORS,
  DEFAULT_AVATAR_CONFIG,
} from '@/constants/avatar-config';

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel?: () => void;
}

type CustomizationCategory = 
  | 'skin' 
  | 'hair' 
  | 'eyes' 
  | 'mouth' 
  | 'clothing' 
  | 'accessory' 
  | 'background';

export default function AvatarBuilder({ 
  initialConfig = DEFAULT_AVATAR_CONFIG,
  onSave, 
  onCancel 
}: AvatarBuilderProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [activeCategory, setActiveCategory] = useState<CustomizationCategory>('skin');

  const categories = [
    { id: 'skin' as const, name: 'Hudton', icon: User },
    { id: 'hair' as const, name: 'Hår', icon: Sparkles },
    { id: 'eyes' as const, name: 'Ögon', icon: Eye },
    { id: 'mouth' as const, name: 'Mun', icon: Smile },
    { id: 'clothing' as const, name: 'Kläder', icon: Shirt },
    { id: 'accessory' as const, name: 'Tillbehör', icon: Palette },
    { id: 'background' as const, name: 'Bakgrund', icon: Palette },
  ];

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setConfig({ ...config, [key]: value });
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'skin':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Välj hudton</Text>
            <View style={styles.colorGrid}>
              {SKIN_TONES.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: tone.color },
                    config.skinTone === tone.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('skinTone', tone.id)}
                >
                  {config.skinTone === tone.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'hair':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Frisyr</Text>
            <View style={styles.optionsList}>
              {HAIR_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.listOption,
                    config.hairStyle === style.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('hairStyle', style.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.hairStyle === style.id && styles.selectedListOptionText
                  ]}>
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Hårfärg</Text>
            <View style={styles.colorGrid}>
              {HAIR_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    config.hairColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('hairColor', color.id)}
                >
                  {config.hairColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 'eyes':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Ögonform</Text>
            <View style={styles.optionsList}>
              {EYE_SHAPES.map((shape) => (
                <TouchableOpacity
                  key={shape.id}
                  style={[
                    styles.listOption,
                    config.eyeShape === shape.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('eyeShape', shape.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.eyeShape === shape.id && styles.selectedListOptionText
                  ]}>
                    {shape.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Ögonfärg</Text>
            <View style={styles.colorGrid}>
              {EYE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    config.eyeColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('eyeColor', color.id)}
                >
                  {config.eyeColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 'mouth':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Munform</Text>
            <View style={styles.optionsList}>
              {MOUTH_SHAPES.map((shape) => (
                <TouchableOpacity
                  key={shape.id}
                  style={[
                    styles.listOption,
                    config.mouthShape === shape.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('mouthShape', shape.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.mouthShape === shape.id && styles.selectedListOptionText
                  ]}>
                    {shape.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'clothing':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Klädstil</Text>
            <View style={styles.optionsList}>
              {CLOTHING_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.listOption,
                    config.clothingStyle === style.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('clothingStyle', style.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.clothingStyle === style.id && styles.selectedListOptionText
                  ]}>
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Klädfärg</Text>
            <View style={styles.colorGrid}>
              {CLOTHING_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    config.clothingColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('clothingColor', color.id)}
                >
                  {config.clothingColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 'accessory':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Tillbehör</Text>
            <View style={styles.optionsList}>
              {ACCESSORIES.map((accessory) => (
                <TouchableOpacity
                  key={accessory.id}
                  style={[
                    styles.listOption,
                    config.accessory === accessory.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('accessory', accessory.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.accessory === accessory.id && styles.selectedListOptionText
                  ]}>
                    {accessory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'background':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Bakgrundsfärg</Text>
            <View style={styles.colorGrid}>
              {BACKGROUND_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    color.color.includes('gradient') 
                      ? { backgroundColor: '#E3F2FD' }
                      : { backgroundColor: color.color },
                    config.backgroundColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('backgroundColor', color.id)}
                >
                  {color.color.includes('gradient') && (
                    <Text style={styles.gradientLabel}>G</Text>
                  )}
                  {config.backgroundColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const currentCategoryIndex = categories.findIndex(c => c.id === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skapa din avatar</Text>
        <Text style={styles.headerSubtitle}>Anpassa din personliga karaktär</Text>
      </View>

      <View style={styles.previewContainer}>
        <CharacterAvatar config={config} size={180} showBorder />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isActive && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Icon 
                  size={20} 
                  color={isActive ? '#4F46E5' : '#6B7280'} 
                />
                <Text style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {renderCategoryContent()}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentCategoryIndex === 0 && styles.navButtonDisabled
          ]}
          onPress={() => {
            if (currentCategoryIndex > 0) {
              setActiveCategory(categories[currentCategoryIndex - 1].id);
            }
          }}
          disabled={currentCategoryIndex === 0}
        >
          <ChevronLeft size={20} color={currentCategoryIndex === 0 ? '#D1D5DB' : '#6B7280'} />
          <Text style={[
            styles.navButtonText,
            currentCategoryIndex === 0 && styles.navButtonTextDisabled
          ]}>
            Föregående
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentCategoryIndex === categories.length - 1 && styles.navButtonDisabled
          ]}
          onPress={() => {
            if (currentCategoryIndex < categories.length - 1) {
              setActiveCategory(categories[currentCategoryIndex + 1].id);
            }
          }}
          disabled={currentCategoryIndex === categories.length - 1}
        >
          <Text style={[
            styles.navButtonText,
            currentCategoryIndex === categories.length - 1 && styles.navButtonTextDisabled
          ]}>
            Nästa
          </Text>
          <ChevronRight size={20} color={currentCategoryIndex === categories.length - 1 ? '#D1D5DB' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        {onCancel && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Avbryt</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => onSave(config)}
        >
          <Text style={styles.saveButtonText}>Spara avatar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  activeCategoryButton: {
    backgroundColor: '#EEF2FF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeCategoryText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#4F46E5',
    borderWidth: 3,
  },
  checkmark: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gradientLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  optionsList: {
    gap: 8,
  },
  listOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedListOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  listOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedListOptionText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
