import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Clipboard,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, BookOpen, Lightbulb, Brain, Flame, TrendingUp, ImageIcon, X, Copy, ArrowUp } from 'lucide-react-native';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumGate } from '@/components/PremiumGate';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MarkdownText } from '@/components/MarkdownText';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const inputFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inputFadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [inputFadeAnim]);

  const { messages, error, sendMessage } = useRorkAgent({
    tools: {},
  });

  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && selectedImages.length === 0) || isSending) return;

    if (!process.env.EXPO_PUBLIC_TOOLKIT_URL) {
      setLocalError('AI-funktionen är inte konfigurerad. Kontakta support.');
      console.error('EXPO_PUBLIC_TOOLKIT_URL is not configured');
      return;
    }

    const userMessage = input.trim();
    const imagesToSend = [...selectedImages];
    setInput('');
    setSelectedImages([]);
    setIsSending(true);
    setLocalError(null);

    console.log('[AI Chat] Sending message:', userMessage, 'with images:', imagesToSend.length);
    
    if (!user?.id) {
      console.error('[AI Chat] No user ID available');
      setLocalError('Du måste vara inloggad för att använda AI-chatten.');
      setIsSending(false);
      return;
    }

    try {
      if (imagesToSend.length > 0) {
        const files = await Promise.all(
          imagesToSend.map(async (uri) => {
            let base64: string;
            if (uri.startsWith('data:')) {
              base64 = uri;
            } else if (uri.startsWith('file://')) {
              const fileBase64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64' as any,
              });
              base64 = `data:image/jpeg;base64,${fileBase64}`;
            } else {
              base64 = uri;
            }
            return {
              type: 'file' as const,
              mediaType: 'image/jpeg' as const,
              url: base64,
            };
          })
        );

        await sendMessage({
          text: userMessage || 'Vad finns på denna bild?',
          files,
        });
      } else {
        await sendMessage(userMessage);
      }
      console.log('[AI Chat] Message sent successfully');
    } catch (err) {
      console.error('[AI Chat] Error sending message:', err);
      
      let errorMessage = 'Ett fel uppstod. Försök igen.';
      
      if (err instanceof Error) {
        if (err.message.includes('Internal Server Error')) {
          errorMessage = 'AI-tjänsten är inte tillgänglig för tillfället. Försök igen om en stund.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Nätverksfel. Kontrollera din internetanslutning.';
        } else if (err.message.includes('Unauthorized') || err.message.includes('401')) {
          errorMessage = 'Du måste vara inloggad för att använda AI-chatten.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = (err as any).message || JSON.stringify(err);
      }
      
      setLocalError(errorMessage);
    } finally {
      setIsSending(false);
    }
  }, [input, selectedImages, isSending, user?.id, sendMessage]);

  useEffect(() => {
    if (error) {
      console.error('[AI Chat] useRorkAgent error:', error);
      setLocalError(typeof error === 'string' ? error : (error as any)?.message || 'Ett fel uppstod');
    }
  }, [error]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleCopyMessage = useCallback((text: string) => {
    Clipboard.setString(text);
    Alert.alert('Kopierat!', 'Texten har kopierats till urklipp.');
  }, []);

  const handlePickImage = useCallback(async () => {
    Alert.alert(
      'Lägg till bild',
      'Välj hur du vill lägga till en bild',
      [
        {
          text: 'Ta foto',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till kameran.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images' as any,
              quality: 0.7,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              setSelectedImages(prev => [...prev, result.assets[0].uri]);
            }
          },
        },
        {
          text: 'Välj från galleri',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till ditt fotoalbum.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images' as any,
              quality: 0.7,
              allowsEditing: true,
              allowsMultipleSelection: false,
            });
            if (!result.canceled && result.assets[0]) {
              setSelectedImages(prev => [...prev, result.assets[0].uri]);
            }
          },
        },
        { text: 'Avbryt', style: 'cancel' },
      ]
    );
  }, []);

  const renderMessage = useCallback((message: any) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.aiMessageRow,
        ]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }]}>
            <Sparkles size={14} color={theme.colors.primary} />
          </View>
        )}
        <View style={{ flex: 1, maxWidth: isUser ? '80%' : undefined }}>
          <View
            style={[
              styles.bubble,
              isUser 
                ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                : [styles.aiBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }],
            ]}
          >
            {message.parts.map((part: any, index: number) => {
              if (part.type === 'text') {
                return (
                  <View key={`${message.id}-${index}`}>
                    {isUser ? (
                      <Text style={styles.userText} selectable>
                        {part.text}
                      </Text>
                    ) : (
                      <MarkdownText style={[styles.aiText, { color: theme.colors.text }]}>
                        {part.text}
                      </MarkdownText>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </View>
          {!isUser && (
            <TouchableOpacity
              style={styles.copyAction}
              onPress={() => {
                const textParts = message.parts
                  .filter((p: any) => p.type === 'text')
                  .map((p: any) => p.text)
                  .join('\n');
                handleCopyMessage(textParts);
              }}
              activeOpacity={0.6}
            >
              <Copy size={12} color={theme.colors.textMuted} />
              <Text style={[styles.copyActionText, { color: theme.colors.textMuted }]}>Kopiera</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [isDark, theme.colors, handleCopyMessage]);

  const suggestions = [
    { text: 'Hur kan jag plugga mer effektivt?', icon: TrendingUp, color: theme.colors.primary },
    { text: 'Tips för att komma ihåg saker bättre', icon: Lightbulb, color: '#F59E0B' },
    { text: 'Förklara Pomodoro-tekniken', icon: Flame, color: '#EF4444' },
    { text: 'Hjälp mig med matematik', icon: BookOpen, color: '#10B981' },
  ];

  const hasInput = input.trim().length > 0 || selectedImages.length > 0;

  return (
    <PremiumGate feature="ai-chat" fullScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }]}>
              <Sparkles size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>StudieStugan AI</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>Din personliga studieguide</Text>
            </View>
          </View>
        </View>
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesArea}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <Animated.View style={[styles.emptyState, { opacity: inputFadeAnim }]}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)' }]}>
                  <Brain size={40} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Hej! Hur kan jag hjälpa dig?
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                  Fråga mig om studier, få tips och förklaringar
                </Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.suggestionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
                      onPress={() => setInput(item.text)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.suggestionIconWrap, { backgroundColor: item.color + '12' }]}>
                        <item.icon size={16} color={item.color} />
                      </View>
                      <Text style={[styles.suggestionText, { color: theme.colors.text }]} numberOfLines={2}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ) : (
              messages.map((message) => renderMessage(message))
            )}

            {isSending && (
              <View style={styles.typingRow}>
                <View style={[styles.aiAvatar, { backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }]}>
                  <Sparkles size={14} color={theme.colors.primary} />
                </View>
                <View style={[styles.typingBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <View style={styles.typingDots}>
                    <TypingDot delay={0} color={theme.colors.textMuted} />
                    <TypingDot delay={200} color={theme.colors.textMuted} />
                    <TypingDot delay={400} color={theme.colors.textMuted} />
                  </View>
                </View>
              </View>
            )}

            {(error || localError) && (
              <View style={[styles.errorCard, { backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)' }]}>
                <Text style={[styles.errorText, { color: '#EF4444' }]}>
                  {localError || (typeof error === 'string' ? error : error?.message) || 'Ett fel uppstod. Försök igen.'}
                </Text>
                <TouchableOpacity 
                  style={[styles.errorDismiss, { backgroundColor: '#EF4444' + '14' }]}
                  onPress={() => setLocalError(null)}
                >
                  <Text style={[styles.errorDismissText, { color: '#EF4444' }]}>Stäng</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom + 60, 76) }]}>
            {selectedImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewRow} contentContainerStyle={styles.imagePreviewContent}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImage}
                      onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={[
              styles.inputRow, 
              { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderColor: hasInput ? theme.colors.primary + '30' : 'transparent',
              }
            ]}>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={handlePickImage}
                disabled={isSending}
                activeOpacity={0.6}
              >
                <ImageIcon size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Ställ en fråga..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                maxLength={1000}
                editable={!isSending}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: hasInput && !isSending ? theme.colors.primary : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') },
                ]}
                onPress={handleSend}
                disabled={!hasInput || isSending}
                activeOpacity={0.7}
              >
                <ArrowUp size={18} color={hasInput && !isSending ? '#FFFFFF' : theme.colors.textMuted} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </PremiumGate>
  );
}

function TypingDot({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color, opacity: anim }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsGrid: {
    width: '100%',
    gap: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  suggestionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  aiText: {
    fontSize: 15,
    lineHeight: 22,
  },
  copyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignSelf: 'flex-start',
  },
  copyActionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  errorDismiss: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  errorDismissText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  imagePreviewRow: {
    maxHeight: 80,
    marginBottom: 8,
  },
  imagePreviewContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  removeImage: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 4,
    gap: 2,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 9,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});
