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
  Animated,
} from 'react-native';
import { Send, ArrowLeft, Camera, ImageIcon, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

interface MathAIChatProps {
  onBack: () => void;
}

interface AttachedImage {
  uri: string;
  base64: string;
  mimeType: string;
}

const MATH_SYSTEM = `Du är en expert matematiklärare och problemlösare, liknande Photomath.
Du ska:
- Lösa matematiska problem steg för steg
- Förklara varje steg tydligt på svenska
- Om du får en bild, analysera den och identifiera matematiska problem/ekvationer/grafer
- Formatera lösningar med tydliga numrerade steg (Steg 1:, Steg 2:, etc.)
- Ge slutsvaret tydligt markerat med "Svar:" på en egen rad
- Om det är en graf, beskriv vad grafen visar och analysera den
- Var uppmuntrande och pedagogisk
- Svara ALLTID på svenska

VIKTIGA FORMATERINGSREGLER (följ dessa STRIKT):
- Skriv ALDRIG ###, ##, #, **, ***, *, __ eller någon annan markdown-syntax
- Skriv ALDRIG rubriker med # tecken
- Använd ALDRIG asterisker för fetstil eller kursiv
- Skriv ren, vanlig text utan någon formatering
- Använd radbrytningar mellan stycken för läsbarhet
- Använd "Steg 1:", "Steg 2:" etc. för att strukturera lösningar
- Håll mellanrummen lagom, max en tom rad mellan stycken
- Skriv koncist och tydligt
- Du FÅR använda LaTeX-notation för matematik (t.ex. \\frac{a}{b}, x^2, \\sqrt{x}, \\theta) — det konverteras automatiskt till snygga tecken`;

export default function MathAIChat({ onBack }: MathAIChatProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const { messages, error, sendMessage } = useRorkAgent({
    system: MATH_SYSTEM,
    tools: {},
  } as any);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (error) {
      console.error('[MathAI] useRorkAgent error:', error);
      setLocalError(error instanceof Error ? error.message : 'Ett fel uppstod med AI-assistenten');
    }
  }, [error]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const pickImageFromLibrary = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let base64Data = asset.base64 || '';

        if (!base64Data && Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const r = reader.result as string;
              resolve(r.split(',')[1] || '');
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }

        if (base64Data) {
          setAttachedImage({
            uri: asset.uri,
            base64: base64Data,
            mimeType: asset.mimeType || 'image/jpeg',
          });
          console.log('[MathAI] Image picked from library');
        }
      }
    } catch (err) {
      console.error('[MathAI] Error picking image:', err);
      setLocalError('Kunde inte välja bild');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setLocalError('Kameratillstånd krävs för att ta bilder');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          setAttachedImage({
            uri: asset.uri,
            base64: asset.base64,
            mimeType: asset.mimeType || 'image/jpeg',
          });
          console.log('[MathAI] Photo taken with camera');
        }
      }
    } catch (err) {
      console.error('[MathAI] Error taking photo:', err);
      setLocalError('Kunde inte ta bild');
    }
  }, []);

  const removeAttachedImage = useCallback(() => {
    setAttachedImage(null);
  }, []);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !attachedImage) || isSending) return;

    const userText = input.trim() || (attachedImage ? 'Analysera denna bild och lös uppgiften steg för steg.' : '');
    setInput('');
    setIsSending(true);
    setLocalError(null);

    try {
      if (attachedImage) {
        const messagePayload = {
          text: userText,
          files: [{
            type: 'file' as const,
            mediaType: attachedImage.mimeType,
            url: `data:${attachedImage.mimeType};base64,${attachedImage.base64}`,
          }],
        };
        console.log('[MathAI] Sending message with image');
        setAttachedImage(null);
        sendMessage(messagePayload);
      } else {
        console.log('[MathAI] Sending text message:', userText);
        sendMessage(userText);
      }
      console.log('[MathAI] Message sent successfully');
    } catch (err) {
      console.error('[MathAI] Error sending message:', err);
      setLocalError(err instanceof Error ? err.message : 'Ett okänt fel uppstod');
    } finally {
      setIsSending(false);
    }
  }, [input, attachedImage, isSending, sendMessage]);

  const parseSteps = useCallback((text: string, messageId: string) => {
    const cleaned = cleanMarkdown(text);
    const lines = cleaned.split('\n');
    const cards: React.ReactNode[] = [];
    let currentCardLines: string[] = [];
    let currentStepNum: number | null = null;
    let cardIndex = 0;

    const flushCard = () => {
      if (currentCardLines.length === 0) return;
      const content = currentCardLines.join('\n').trim();
      if (!content) return;

      if (currentStepNum !== null) {
        cards.push(
          <View key={`${messageId}-card-${cardIndex}`} style={styles.stepCard}>
            <View style={styles.stepCardHeader}>
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.stepBadge}
              >
                <Text style={styles.stepBadgeText}>{currentStepNum}</Text>
              </LinearGradient>
              <Text style={styles.stepLabel}>Steg {currentStepNum}</Text>
            </View>
            <Text style={styles.stepCardContent}>{content}</Text>
          </View>
        );
      } else {
        cards.push(
          <Text key={`${messageId}-text-${cardIndex}`} style={styles.plainText}>{content}</Text>
        );
      }
      cardIndex++;
      currentCardLines = [];
      currentStepNum = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        if (currentCardLines.length > 0) {
          currentCardLines.push('');
        }
        continue;
      }

      const stepMatch = trimmed.match(/^(?:Steg|Step)\s*(\d+)\s*[:.]/i);
      const answerMatch = trimmed.match(/^(?:Svar|Resultat|Slutsvar)\s*[:.]/i);

      if (stepMatch) {
        flushCard();
        currentStepNum = parseInt(stepMatch[1], 10);
        const stepContent = trimmed.replace(/^(?:Steg|Step)\s*\d+\s*[:.]\s*/i, '');
        if (stepContent) currentCardLines.push(stepContent);
      } else if (answerMatch) {
        flushCard();
        const answerContent = trimmed.replace(/^(?:Svar|Resultat|Slutsvar)\s*[:.]\s*/i, '');
        cards.push(
          <View key={`${messageId}-answer-${cardIndex}`} style={styles.answerCard}>
            <View style={styles.answerCardHeader}>
              <Text style={styles.answerBadgeText}>SVAR</Text>
            </View>
            <Text style={styles.answerCardContent}>{answerContent}</Text>
          </View>
        );
        cardIndex++;
      } else {
        currentCardLines.push(trimmed);
      }
    }

    flushCard();
    return cards;
  }, []);

  const renderMessage = useCallback((message: any) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {isUser ? (
          <View style={styles.userBubble}>
            {message.parts.map((part: any, index: number) => {
              if (part.type === 'text') {
                return (
                  <Text key={`${message.id}-${index}`} style={styles.userMessageText}>
                    {part.text}
                  </Text>
                );
              }
              if (part.type === 'file' || (part.type === 'image' && part.image)) {
                return (
                  <Image
                    key={`${message.id}-img-${index}`}
                    source={{ uri: part.data || part.image || part.uri }}
                    style={styles.messageImage}
                    resizeMode="contain"
                  />
                );
              }
              return null;
            })}
          </View>
        ) : (
          <View style={styles.assistantContainer}>
            {message.parts.map((part: any, index: number) => {
              if (part.type === 'text') {
                return (
                  <View key={`${message.id}-${index}`} style={styles.stepsContainer}>
                    {parseSteps(part.text, `${message.id}-${index}`)}
                  </View>
                );
              }
              if (part.type === 'file' || (part.type === 'image' && part.image)) {
                return (
                  <Image
                    key={`${message.id}-img-${index}`}
                    source={{ uri: part.data || part.image || part.uri }}
                    style={styles.messageImage}
                    resizeMode="contain"
                  />
                );
              }
              return null;
            })}
          </View>
        )}
      </View>
    );
  }, [parseSteps]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.background}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} testID="math-ai-back">
            <ArrowLeft size={22} color="#2563eb" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              style={styles.headerIcon}
            >
              <Text style={styles.headerIconText}>M</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Matematik AI</Text>
              <Text style={styles.headerSubtitle}>Steg-för-steg lösningar</Text>
            </View>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#eff6ff', '#dbeafe']}
                  style={styles.emptyIconContainer}
                >
                  <Text style={styles.emptyIconText}>f(x)</Text>
                </LinearGradient>
                <Text style={styles.emptyTitle}>Matematik AI</Text>
                <Text style={styles.emptySubtitle}>
                  Fota en uppgift, skriv en ekvation eller ställ en fråga. Jag löser det steg för steg.
                </Text>

                <View style={styles.suggestionsGrid}>
                  <TouchableOpacity style={styles.suggestionCard} onPress={takePhoto}>
                    <Camera size={20} color="#2563eb" />
                    <Text style={styles.suggestionCardText}>Fota en uppgift</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => setInput('Lös ekvationen: 2x + 5 = 15')}>
                    <Text style={styles.suggestionIcon}>x²</Text>
                    <Text style={styles.suggestionCardText}>Skriv en ekvation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => setInput('Förklara Pythagoras sats')}>
                    <Text style={styles.suggestionIcon}>△</Text>
                    <Text style={styles.suggestionCardText}>Geometri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => setInput('Hur beräknar jag derivatan av x³ + 2x?')}>
                    <Text style={styles.suggestionIcon}>∫</Text>
                    <Text style={styles.suggestionCardText}>Derivata & Integral</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              messages.map((message) => renderMessage(message))
            )}

            {isSending && (
              <View style={styles.loadingRow}>
                <View style={styles.loadingCard}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.loadingText}>Löser uppgiften...</Text>
                </View>
              </View>
            )}

            {(error || localError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {localError || 'Ett fel uppstod. Försök igen.'}
                </Text>
              </View>
            )}
          </ScrollView>

          {attachedImage && (
            <View style={styles.imagePreviewBar}>
              <Image source={{ uri: attachedImage.uri }} style={styles.previewThumbnail} />
              <Text style={styles.previewText}>Bild bifogad</Text>
              <TouchableOpacity onPress={removeAttachedImage} style={styles.removeImageButton}>
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} testID="math-ai-camera">
              <Camera size={20} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImageFromLibrary} testID="math-ai-gallery">
              <ImageIcon size={20} color="#2563eb" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Skriv en ekvation eller fråga..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={2000}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() && !attachedImage || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={(!input.trim() && !attachedImage) || isSending}
              testID="math-ai-send"
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  headerSpacer: {
    width: 40,
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  suggestionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionIcon: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: '700' as const,
  },
  suggestionCardText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  messageRow: {
    marginBottom: 16,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  assistantMessageRow: {
    alignItems: 'flex-start',
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  assistantContainer: {
    width: '100%',
  },
  stepsContainer: {
    gap: 10,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  stepCardContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  answerCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  answerCardHeader: {
    marginBottom: 8,
  },
  answerBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#2563eb',
    letterSpacing: 1,
  },
  answerCardContent: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1e40af',
    lineHeight: 28,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  loadingRow: {
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500' as const,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  imagePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  previewThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  removeImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
    gap: 6,
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
});
