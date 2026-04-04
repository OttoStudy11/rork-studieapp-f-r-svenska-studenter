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
- Skriv koncist och tydligt`;

export default function MathAIChat({ onBack }: MathAIChatProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        if (asset.base64) {
          setAttachedImage({
            uri: asset.uri,
            base64: asset.base64,
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

  const renderStepText = useCallback((text: string, messageId: string) => {
    const cleaned = cleanMarkdown(text);
    const lines = cleaned.split('\n');
    const elements: React.ReactNode[] = [];
    let consecutiveEmpty = 0;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty <= 1 && idx > 0 && idx < lines.length - 1) {
          elements.push(
            <View key={`${messageId}-spacer-${idx}`} style={styles.textSpacer} />
          );
        }
        return;
      }
      consecutiveEmpty = 0;

      const stepMatch = trimmed.match(/^(?:Steg|Step)\s*(\d+)\s*[:.]/i);

      if (stepMatch) {
        const currentStep = parseInt(stepMatch[1], 10);
        const stepContent = trimmed.replace(/^(?:Steg|Step)\s*\d+\s*[:.]\s*/i, '');

        elements.push(
          <View key={`${messageId}-step-${idx}`} style={styles.stepContainer}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>{currentStep}</Text>
            </View>
            <Text style={styles.stepText}>{stepContent}</Text>
          </View>
        );
      } else if (trimmed.match(/^(?:Svar|Resultat|Slutsvar)\s*[:.]/i)) {
        const answerContent = trimmed.replace(/^(?:Svar|Resultat|Slutsvar)\s*[:.]\s*/i, '');
        elements.push(
          <View key={`${messageId}-answer-${idx}`} style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Svar</Text>
            <Text style={styles.answerText}>{answerContent}</Text>
          </View>
        );
      } else if (trimmed.startsWith('• ')) {
        elements.push(
          <View key={`${messageId}-bullet-${idx}`} style={styles.bulletContainer}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{trimmed.slice(2)}</Text>
          </View>
        );
      } else {
        elements.push(
          <Text key={`${messageId}-line-${idx}`} style={styles.assistantMessageText}>
            {trimmed}
          </Text>
        );
      }
    });

    return elements;
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
        {!isUser && (
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.aiAvatar}
          >
            <Text style={styles.aiAvatarText}>M</Text>
          </LinearGradient>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {message.parts.map((part: any, index: number) => {
            if (part.type === 'text') {
              if (isUser) {
                return (
                  <Text key={`${message.id}-${index}`} style={styles.userMessageText}>
                    {part.text}
                  </Text>
                );
              }
              return (
                <View key={`${message.id}-${index}`}>
                  {renderStepText(part.text, `${message.id}-${index}`)}
                </View>
              );
            }
            if (part.type === 'file' || (part.type === 'image' && part.image)) {
              return (
                <Image
                  key={`${message.id}-img-${index}`}
                  source={{ uri: part.image || part.uri }}
                  style={styles.messageImage}
                  resizeMode="contain"
                />
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  }, [renderStepText]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0f1a2e', '#0a1220', '#060d18']}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} testID="math-ai-back">
            <ArrowLeft size={22} color="#5eb8ff" />
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                  colors={['#1e3a5f', '#152d4a']}
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
                    <Camera size={20} color="#5eb8ff" />
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
                <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>M</Text>
                </LinearGradient>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#5eb8ff" />
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
                <X size={16} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} testID="math-ai-camera">
              <Camera size={20} color="#5eb8ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImageFromLibrary} testID="math-ai-gallery">
              <ImageIcon size={20} color="#5eb8ff" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Skriv en ekvation eller fråga..."
              placeholderTextColor="#4a6a8a"
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
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94,184,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(94,184,255,0.08)',
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
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5eb8ff',
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
    color: '#5eb8ff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6a8aaa',
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
    backgroundColor: 'rgba(94,184,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(94,184,255,0.12)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  suggestionIcon: {
    fontSize: 20,
    color: '#5eb8ff',
    fontWeight: '700' as const,
  },
  suggestionCardText: {
    fontSize: 13,
    color: '#5eb8ff',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  aiAvatarText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#fff',
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(30,58,95,0.6)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(94,184,255,0.1)',
  },
  userMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  assistantMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#c8ddf0',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
    gap: 10,
  },
  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#c8ddf0',
  },
  answerContainer: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#5eb8ff',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#fff',
    lineHeight: 24,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 16,
    fontSize: 14,
    lineHeight: 22,
    color: '#5eb8ff',
    fontWeight: '600' as const,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#c8ddf0',
  },
  textSpacer: {
    height: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loadingBubble: {
    backgroundColor: 'rgba(30,58,95,0.6)',
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(94,184,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#5eb8ff',
  },
  errorContainer: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  imagePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(30,58,95,0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(94,184,255,0.08)',
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
    color: '#8ab4d4',
  },
  removeImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(10,18,32,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(94,184,255,0.08)',
    alignItems: 'flex-end',
    gap: 6,
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(94,184,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(94,184,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#e0ecf5',
    borderWidth: 1,
    borderColor: 'rgba(94,184,255,0.1)',
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
    backgroundColor: 'rgba(37,99,235,0.3)',
  },
});
