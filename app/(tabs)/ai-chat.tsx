import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, BookOpen, Lightbulb, Brain, Flame, TrendingUp, ImageIcon, X, Copy } from 'lucide-react-native';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumGate } from '@/components/PremiumGate';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MarkdownText } from '@/components/MarkdownText';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();



  const { messages, error, sendMessage } = useRorkAgent({
    tools: {},
  });

  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSend = async () => {
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
    console.log('[AI Chat] Toolkit URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
    console.log('[AI Chat] RORK_DB_ENDPOINT:', process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT);
    console.log('[AI Chat] PROJECT_ID:', process.env.EXPO_PUBLIC_PROJECT_ID);

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
              mimeType: 'image/jpeg' as const,
              uri: base64,
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
      console.log('[AI Chat] Messages after send:', messages.length);
    } catch (err) {
      console.error('[AI Chat] Error sending message:', err);
      console.error('[AI Chat] Error type:', typeof err);
      console.error('[AI Chat] Error constructor:', err?.constructor?.name);
      
      let errorMessage = 'Ett fel uppstod. Försök igen.';
      
      if (err instanceof Error) {
        console.error('[AI Chat] Error message:', err.message);
        console.error('[AI Chat] Error stack:', err.stack);
        errorMessage = err.message || errorMessage;
      } else if (typeof err === 'object' && err !== null) {
        console.error('[AI Chat] Error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        errorMessage = (err as any).message || JSON.stringify(err);
      }
      
      console.error('[AI Chat] Final error message:', errorMessage);
      setLocalError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    console.log('[AI Chat] Messages updated:', messages.length);
    console.log('[AI Chat] Current messages:', JSON.stringify(messages, null, 2));
    if (error) {
      console.error('[AI Chat] useRorkAgent error:', error);
      console.error('[AI Chat] Error type:', typeof error);
      console.error('[AI Chat] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      setLocalError(typeof error === 'string' ? error : (error as any)?.message || 'Ett fel uppstod');
    }
  }, [messages, error]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const cleanText = (text: string) => {
    return text;
  };

  const handleCopyMessage = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Kopierat!', 'Texten har kopierats till urklipp.');
  };

  const renderMessage = (message: any) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.aiIconContainer, { backgroundColor: theme.colors.primary }]}>
            <Sparkles size={16} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1, maxWidth: '75%' }}>
          <View
            style={[
              styles.messageBubble,
              isUser 
                ? { ...styles.userBubble, backgroundColor: theme.colors.primary } 
                : { ...styles.assistantBubble, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            {message.parts.map((part: any, index: number) => {
              if (part.type === 'text') {
                return (
                  <View key={`${message.id}-${index}`}>
                    {isUser ? (
                      <Text
                        style={[
                          styles.messageText,
                          styles.userMessageText,
                        ]}
                        selectable
                      >
                        {cleanText(part.text)}
                      </Text>
                    ) : (
                      <MarkdownText style={[styles.messageText, { color: theme.colors.text }]}>
                        {cleanText(part.text)}
                      </MarkdownText>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </View>
          {!isUser && (
            <View style={styles.messageActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  const textParts = message.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('\n');
                  handleCopyMessage(textParts);
                }}
              >
                <Copy size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>Kopiera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <PremiumGate feature="ai-chat" fullScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>🤖 StudieStugan AI</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Din personliga studieguide</Text>
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
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Brain size={48} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Hej! Hur kan jag hjälpa dig? 🚀</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                Fråga mig om vad som helst! Jag kan hjälpa dig med studier, ge tips och förklaringar.
              </Text>
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary + '30' }]}
                  onPress={() => setInput('Hur kan jag plugga mer effektivt?')}
                >
                  <View style={[styles.suggestionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                    <TrendingUp size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>Hur kan jag plugga mer effektivt?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.secondary + '30' }]}
                  onPress={() => setInput('Ge mig tips för att komma ihåg saker bättre')}
                >
                  <View style={[styles.suggestionIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                    <Lightbulb size={18} color={theme.colors.secondary} />
                  </View>
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>Ge mig tips för att komma ihåg saker bättre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.warning + '30' }]}
                  onPress={() => setInput('Förklara Pomodoro-tekniken')}
                >
                  <View style={[styles.suggestionIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                    <Flame size={18} color={theme.colors.warning} />
                  </View>
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>Förklara Pomodoro-tekniken</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.success + '30' }]}
                  onPress={() => setInput('Hjälp mig med matematik')}
                >
                  <View style={[styles.suggestionIcon, { backgroundColor: theme.colors.success + '15' }]}>
                    <BookOpen size={18} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>Hjälp mig med matematik</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            messages.map((message) => renderMessage(message))
          )}
          {isSending && (
            <View style={styles.loadingContainer}>
              <View style={[styles.aiIconContainer, { backgroundColor: theme.colors.primary }]}>
                <Sparkles size={16} color="#fff" />
              </View>
              <View style={[styles.loadingBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          )}
          {(error || localError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {localError || (typeof error === 'string' ? error : error?.message) || 'Ett fel uppstod. Försök igen.'}
              </Text>
              <TouchableOpacity 
                style={styles.dismissErrorButton}
                onPress={() => {
                  setLocalError(null);
                }}
              >
                <Text style={styles.dismissErrorText}>Stäng</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom + 60, 70) }]}>
          {selectedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.imagePickerButton, { backgroundColor: isDark ? theme.colors.background : '#f5f5f5' }]}
              onPress={async () => {
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
              }}
              disabled={isSending}
            >
              <ImageIcon size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? theme.colors.background : '#f5f5f5', color: theme.colors.text }]}
              value={input}
              onChangeText={setInput}
              placeholder="Skriv ditt meddelande..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={1000}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { backgroundColor: theme.colors.primary },
                (!input.trim() && selectedImages.length === 0 || isSending) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={(!input.trim() && selectedImages.length === 0) || isSending}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
    lineHeight: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  dismissErrorButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 4,
  },
  dismissErrorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imagePickerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: 120,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
