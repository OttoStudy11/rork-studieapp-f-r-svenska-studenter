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
  Shirt,
  ChevronLeft,
  ChevronRight,
  Crown,
  Backpack,
  Footprints,
  Smile,
} from 'lucide-react-native';
import type { AvatarConfig } from '@/constants/avatar-config';
import {
  BODY_COLORS,
  FACE_EXPRESSIONS,
  HATS,
  HAT_COLORS,
  OUTFITS,
  OUTFIT_COLORS,
  OUTFIT_PATTERNS,
  BACKPACKS,
  BACKPACK_COLORS,
  SOCKS,
  SOCK_COLORS,
  BACKGROUND_COLORS,
  DEFAULT_AVATAR_CONFIG,
} from '@/constants/avatar-config';

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig;
  config?: AvatarConfig;
  onSave?: (config: AvatarConfig) => void;
  onConfigChange?: (config: AvatarConfig) => void;
  onCancel?: () => void;
}

type CustomizationCategory = 
  | 'body' 
  | 'face' 
  | 'hat' 
  | 'outfit' 
  | 'backpack' 
  | 'socks'
  | 'background';

export default function AvatarBuilder({ 
  initialConfig,
  config: externalConfig,
  onSave, 
  onConfigChange,
  onCancel 
}: AvatarBuilderProps) {
  const [internalConfig, setInternalConfig] = useState<AvatarConfig>(initialConfig || externalConfig || DEFAULT_AVATAR_CONFIG);
  
  const config = externalConfig || internalConfig;
  const [activeCategory, setActiveCategory] = useState<CustomizationCategory>('body');

  const categories = [
    { id: 'body' as const, name: 'Kropp', icon: User },
    { id: 'face' as const, name: 'Ansikte', icon: Smile },
    { id: 'hat' as const, name: 'Hatt', icon: Crown },
    { id: 'outfit' as const, name: 'Kläder', icon: Shirt },
    { id: 'backpack' as const, name: 'Ryggsäck', icon: Backpack },
    { id: 'socks' as const, name: 'Strumpor', icon: Footprints },
    { id: 'background' as const, name: 'Bakgrund', icon: Palette },
  ];

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    if (onConfigChange) {
      onConfigChange(newConfig);
    } else {
      setInternalConfig(newConfig);
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'body':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Välj kroppsfärg</Text>
            <View style={styles.colorGrid}>
              {BODY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    config.bodyColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('bodyColor', color.id)}
                >
                  {config.bodyColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'face':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionLabel}>Ansiktsuttryck</Text>
            <View style={styles.emojiGrid}>
              {FACE_EXPRESSIONS.map((expression) => (
                <TouchableOpacity
                  key={expression.id}
                  style={[
                    styles.emojiOption,
                    config.faceExpression === expression.id && styles.selectedEmojiOption
                  ]}
                  onPress={() => updateConfig('faceExpression', expression.id)}
                >
                  <Text style={styles.emojiText}>{expression.emoji}</Text>
                  <Text style={[
                    styles.emojiLabel,
                    config.faceExpression === expression.id && styles.selectedEmojiLabel
                  ]}>
                    {expression.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'hat':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Typ av hatt</Text>
            <View style={styles.optionsList}>
              {HATS.map((hat) => (
                <TouchableOpacity
                  key={hat.id}
                  style={[
                    styles.listOption,
                    config.hat === hat.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('hat', hat.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.hat === hat.id && styles.selectedListOptionText
                  ]}>
                    {hat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {config.hat !== 'none' && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Hattfärg</Text>
                <View style={styles.colorGrid}>
                  {HAT_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.id}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.color },
                        config.hatColor === color.id && styles.selectedOption
                      ]}
                      onPress={() => updateConfig('hatColor', color.id)}
                    >
                      {config.hatColor === color.id && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        );

      case 'outfit':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Klädstil</Text>
            <View style={styles.optionsList}>
              {OUTFITS.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={[
                    styles.listOption,
                    config.outfit === outfit.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('outfit', outfit.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.outfit === outfit.id && styles.selectedListOptionText
                  ]}>
                    {outfit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Klädfärg</Text>
            <View style={styles.colorGrid}>
              {OUTFIT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    config.outfitColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('outfitColor', color.id)}
                >
                  {config.outfitColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Mönster</Text>
            <View style={styles.optionsList}>
              {OUTFIT_PATTERNS.map((pattern) => (
                <TouchableOpacity
                  key={pattern.id}
                  style={[
                    styles.listOption,
                    config.outfitPattern === pattern.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('outfitPattern', pattern.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.outfitPattern === pattern.id && styles.selectedListOptionText
                  ]}>
                    {pattern.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 'backpack':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Ryggsäck</Text>
            <View style={styles.optionsList}>
              {BACKPACKS.map((backpack) => (
                <TouchableOpacity
                  key={backpack.id}
                  style={[
                    styles.listOption,
                    config.backpack === backpack.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('backpack', backpack.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.backpack === backpack.id && styles.selectedListOptionText
                  ]}>
                    {backpack.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {config.backpack !== 'none' && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Ryggsäcksfärg</Text>
                <View style={styles.colorGrid}>
                  {BACKPACK_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.id}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.color },
                        config.backpackColor === color.id && styles.selectedOption
                      ]}
                      onPress={() => updateConfig('backpackColor', color.id)}
                    >
                      {config.backpackColor === color.id && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        );

      case 'socks':
        return (
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Strumpor</Text>
            <View style={styles.optionsList}>
              {SOCKS.map((sock) => (
                <TouchableOpacity
                  key={sock.id}
                  style={[
                    styles.listOption,
                    config.socks === sock.id && styles.selectedListOption
                  ]}
                  onPress={() => updateConfig('socks', sock.id)}
                >
                  <Text style={[
                    styles.listOptionText,
                    config.socks === sock.id && styles.selectedListOptionText
                  ]}>
                    {sock.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Strumpfärg</Text>
            <View style={styles.colorGrid}>
              {SOCK_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    color.color === 'rainbow' 
                      ? styles.rainbowOption 
                      : { backgroundColor: color.color },
                    config.socksColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('socksColor', color.id)}
                >
                  {color.color === 'rainbow' && (
                    <Text style={styles.rainbowText}>🌈</Text>
                  )}
                  {config.socksColor === color.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
                    { backgroundColor: color.color },
                    config.backgroundColor === color.id && styles.selectedOption
                  ]}
                  onPress={() => updateConfig('backgroundColor', color.id)}
                >
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

      {onSave && (
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
      )}
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
    fontWeight: 'bold' as const,
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
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  activeCategoryText: {
    color: '#4F46E5',
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: 'bold' as const,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiOption: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  emojiText: {
    fontSize: 32,
  },
  emojiLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  selectedEmojiLabel: {
    color: '#4F46E5',
    fontWeight: '600' as const,
  },
  rainbowOption: {
    backgroundColor: '#F3F4F6',
  },
  rainbowText: {
    fontSize: 24,
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
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  selectedListOptionText: {
    color: '#4F46E5',
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
    color: 'white',
  },
});
