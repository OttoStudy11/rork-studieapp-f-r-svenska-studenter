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
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Send, ArrowLeft, Camera, ImageIcon, X, Zap, BookOpen, TriangleRight, Sigma } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MATH_SYSTEM = `Du är en expert matematiklärare och problemlösare, liknande Photomath.

OAVSETT om användaren skickar en bild, en ekvation, eller en fråga — du ska ALLTID svara med steg-för-steg-format.

Instruktioner:
- Analysera alltid input noggrant (text ELLER bild)
- Om du får en bild: identifiera alla matematiska problem, ekvationer, grafer eller uppgifter i bilden FÖRST, skriv sedan lösningen steg för steg
- Formatera ALLTID ditt svar med numrerade steg: "Steg 1:", "Steg 2:", "Steg 3:" etc.
- Ge slutsvaret på en egen rad som börjar med "Svar:"
- Om det är en graf eller figur, beskriv den och analysera steg för steg
- Var uppmuntrande och pedagogisk
- Svara ALLTID på svenska

VIKTIGA FORMATERINGSREGLER (följ dessa STRIKT):
- Skriv ALDRIG ###, ##, #, **, ***, *, __ eller någon markdown
- Skriv ren text utan formatering
- Använd ENBART "Steg 1:", "Steg 2:" etc. för struktur
- Ge slutsvaret som "Svar:" på egen rad
- Håll mellanrum lagom, max en tom rad mellan stycken
- Du FÅR använda LaTeX för matematik (t.ex. \\frac{a}{b}, x^2, \\sqrt{x})

VIKTIGT FÖR BILDER:
- När du får en bild, börja ALLTID med att kort beskriva vad du ser i bilden
- Identifiera uppgiften/problemet
- Lös sedan steg för steg med "Steg 1:", "Steg 2:" osv.
- Avsluta med "Svar:"`;

export default function MathAIChat({ onBack }: MathAIChatProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const prevMessageCount = useRef(0);
  const insets = useSafeAreaInsets();

  const messageAnims = useRef<Map<string, Animated.Value>>(new Map());
  const messageSlideAnims = useRef<Map<string, Animated.Value>>(new Map());

  const { messages, error, sendMessage } = useRorkAgent({
    system: MATH_SYSTEM,
    tools: {},
  } as any);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, headerSlide]);

  useEffect(() => {
    if (error) {
      console.error('[MathAI] useRorkAgent error:', error);
      setLocalError(error instanceof Error ? error.message : 'Ett fel uppstod med AI-assistenten');
    }
  }, [error]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const newMessages = messages.slice(prevMessageCount.current);
      newMessages.forEach((msg: any) => {
        if (!messageAnims.current.has(msg.id)) {
          const opacityAnim = new Animated.Value(0);
          const slideAnim = new Animated.Value(20);
          messageAnims.current.set(msg.id, opacityAnim);
          messageSlideAnims.current.set(msg.id, slideAnim);
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }

        if (msg.role === 'assistant') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      });
      prevMessageCount.current = messages.length;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [messages]);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'success') => {
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const pickImageFromLibrary = useCallback(async () => {
    triggerHaptic('light');
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
          triggerHaptic('medium');
          console.log('[MathAI] Image picked from library');
        }
      }
    } catch (err) {
      console.error('[MathAI] Error picking image:', err);
      setLocalError('Kunde inte välja bild');
    }
  }, [triggerHaptic]);

  const takePhoto = useCallback(async () => {
    triggerHaptic('light');
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
          triggerHaptic('medium');
          console.log('[MathAI] Photo taken with camera');
        }
      }
    } catch (err) {
      console.error('[MathAI] Error taking photo:', err);
      setLocalError('Kunde inte ta bild');
    }
  }, [triggerHaptic]);

  const removeAttachedImage = useCallback(() => {
    triggerHaptic('light');
    setAttachedImage(null);
  }, [triggerHaptic]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !attachedImage) || isSending) return;

    triggerHaptic('medium');
    const userText = input.trim() || (attachedImage ? 'Analysera denna bild och lös uppgiften steg för steg. Visa alltid lösningen med Steg 1:, Steg 2: osv. och avsluta med Svar:' : '');
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
  }, [input, attachedImage, isSending, sendMessage, triggerHaptic]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    onBack();
  }, [onBack, triggerHaptic]);

  const handleSuggestion = useCallback((text: string) => {
    triggerHaptic('light');
    setInput(text);
  }, [triggerHaptic]);

  const handleSuggestionPhoto = useCallback(() => {
    triggerHaptic('light');
    takePhoto();
  }, [takePhoto, triggerHaptic]);

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
                colors={['#0ea5e9', '#0284c7']}
                style={styles.stepBadge}
              >
                <Text style={styles.stepBadgeText}>{currentStepNum}</Text>
              </LinearGradient>
              <Text style={styles.stepLabel}>Steg {currentStepNum}</Text>
            </View>
            <View style={styles.stepDivider} />
            <Text style={styles.stepCardContent}>{content}</Text>
          </View>
        );
      } else {
        cards.push(
          <View key={`${messageId}-text-${cardIndex}`} style={styles.plainTextCard}>
            <Text style={styles.plainText}>{content}</Text>
          </View>
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
            <LinearGradient
              colors={['#0ea5e9', '#0284c7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.answerBadge}
            >
              <Zap size={12} color="#fff" />
              <Text style={styles.answerBadgeText}>SVAR</Text>
            </LinearGradient>
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
    const opacityAnim = messageAnims.current.get(message.id);
    const slideAnim = messageSlideAnims.current.get(message.id);

    const animStyle = opacityAnim && slideAnim ? {
      opacity: opacityAnim,
      transform: [{ translateY: slideAnim }],
    } : {};

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
          animStyle,
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
      </Animated.View>
    );
  }, [parseSteps]);

  const loadingDotAnim1 = useRef(new Animated.Value(0.3)).current;
  const loadingDotAnim2 = useRef(new Animated.Value(0.3)).current;
  const loadingDotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isSending) return;
    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    const a1 = createPulse(loadingDotAnim1, 0);
    const a2 = createPulse(loadingDotAnim2, 150);
    const a3 = createPulse(loadingDotAnim3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [isSending, loadingDotAnim1, loadingDotAnim2, loadingDotAnim3]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.background}>
        <Animated.View style={[styles.header, { paddingTop: insets.top + 8, transform: [{ translateY: headerSlide }] }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="math-ai-back">
            <ArrowLeft size={20} color="#0ea5e9" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['#0ea5e9', '#0284c7']}
              style={styles.headerIcon}
            >
              <Text style={styles.headerIconText}>M</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Matematik AI</Text>
              <Text style={styles.headerSubtitle}>Steg-för-steg lösningar</Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
        </Animated.View>

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
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconOuter}>
                  <LinearGradient
                    colors={['#0ea5e9', '#0284c7']}
                    style={styles.emptyIconContainer}
                  >
                    <Text style={styles.emptyIconText}>f(x)</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>Matematik AI</Text>
                <Text style={styles.emptySubtitle}>
                  Fota en uppgift, skriv en ekvation eller ställ en fråga — jag löser det steg för steg.
                </Text>

                <View style={styles.suggestionsGrid}>
                  <TouchableOpacity style={styles.suggestionCard} onPress={handleSuggestionPhoto}>
                    <View style={styles.suggestionIconWrap}>
                      <Camera size={18} color="#0ea5e9" />
                    </View>
                    <Text style={styles.suggestionCardText}>Fota uppgift</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Lös ekvationen: 2x + 5 = 15')}>
                    <View style={styles.suggestionIconWrap}>
                      <BookOpen size={18} color="#0ea5e9" />
                    </View>
                    <Text style={styles.suggestionCardText}>Ekvation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Förklara Pythagoras sats')}>
                    <View style={styles.suggestionIconWrap}>
                      <TriangleRight size={18} color="#0ea5e9" />
                    </View>
                    <Text style={styles.suggestionCardText}>Geometri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Hur beräknar jag derivatan av x³ + 2x?')}>
                    <View style={styles.suggestionIconWrap}>
                      <Sigma size={18} color="#0ea5e9" />
                    </View>
                    <Text style={styles.suggestionCardText}>Derivata</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              messages.map((message: any) => renderMessage(message))
            )}

            {isSending && (
              <View style={styles.loadingRow}>
                <View style={styles.loadingCard}>
                  <View style={styles.loadingDotsRow}>
                    <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim1 }]} />
                    <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim2 }]} />
                    <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim3 }]} />
                  </View>
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
                <X size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
            <View style={styles.inputRow}>
              <View style={styles.mediaButtonsRow}>
                <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} testID="math-ai-camera">
                  <Camera size={18} color="#0ea5e9" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImageFromLibrary} testID="math-ai-gallery">
                  <ImageIcon size={18} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputFieldWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Skriv en ekvation eller fråga..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  maxLength={2000}
                  editable={!isSending}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  ((!input.trim() && !attachedImage) || isSending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={(!input.trim() && !attachedImage) || isSending}
                testID="math-ai-send"
              >
                <LinearGradient
                  colors={((!input.trim() && !attachedImage) || isSending) ? ['#cbd5e1', '#94a3b8'] : ['#0ea5e9', '#0284c7']}
                  style={styles.sendButtonGradient}
                >
                  <Send size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 0.1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 16,
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
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  emptyIconOuter: {
    marginBottom: 24,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  suggestionCard: {
    width: (SCREEN_WIDTH - 52) / 2 - 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  suggestionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  suggestionCardText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600' as const,
    flex: 1,
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
    maxWidth: '82%',
    backgroundColor: '#0ea5e9',
    padding: 14,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
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
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  stepCardContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1e293b',
  },
  answerCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
    marginBottom: 10,
  },
  answerBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 1.2,
  },
  answerCardContent: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0369a1',
    lineHeight: 28,
  },
  plainTextCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
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
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 14,
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
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  previewThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  removeImageButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  inputContainer: {
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  inputFieldWrap: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
