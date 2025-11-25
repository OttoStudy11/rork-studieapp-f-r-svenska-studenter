import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import type { AvatarConfig } from '@/constants/avatar-config';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';

interface AvatarCustomizerProps {
  onAvatarChange: (config: AvatarConfig) => void;
  initialConfig?: AvatarConfig;
}

const avatarEmojis = [
  // People
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾',
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
  '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
  '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
  '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙',
  '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
  '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏',
  '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
  '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓',
  '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡',
  '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'
];

const defaultConfig: AvatarConfig = DEFAULT_AVATAR_CONFIG;

export default function AvatarCustomizer({ onAvatarChange, initialConfig = defaultConfig }: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);

  const updateConfig = (emoji: string) => {
    const newConfig = { ...config };
    setConfig(newConfig);
    onAvatarChange(newConfig);
  };

  const renderAvatarPreview = () => {
    return (
      <View style={styles.avatarPreview}>
        <Text style={styles.previewEmoji}>😊</Text>
      </View>
    );
  };

  const renderEmojiGrid = () => {
    const rows = [];
    for (let i = 0; i < avatarEmojis.length; i += 6) {
      rows.push(avatarEmojis.slice(i, i + 6));
    }

    return (
      <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.emojiRow}>
            {row.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  false && styles.selectedEmojiOption
                ]}
                onPress={() => updateConfig(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };



  return (
    <View style={styles.container}>
      {renderAvatarPreview()}
      
      <Text style={styles.title}>Välj din avatar</Text>
      
      <View style={styles.customizationContainer}>
        {renderEmojiGrid()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  previewEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  customizationContainer: {
    flex: 1,
    width: '100%',
  },
  emojiGrid: {
    flex: 1,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiOption: {
    backgroundColor: 'white',
    borderColor: '#4F46E5',
  },
  emojiText: {
    fontSize: 28,
    textAlign: 'center',
  },
});