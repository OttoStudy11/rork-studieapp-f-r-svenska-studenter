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
} from 'react-native';
import { Send, ArrowLeft, Camera, ImageIcon, X, Zap, BookOpen, TriangleRight, Sigma } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { compressImage } from '@/utils/compressImage';

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
- Använd ALDRIG \\boxed{} — skriv istället svaret efter "Svar:" på en egen rad

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
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'medium') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const pickImageFromLibrary = useCallback(async () => {
    triggerHaptic('light');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[MathAI] Compressing picked image...');
        const compressed = await compressImage(asset.uri);

        if (compressed.base64) {
          setAttachedImage({
            uri: compressed.uri,
            base64: compressed.base64,
            mimeType: compressed.mimeType,
          });
          triggerHaptic('medium');
          console.log('[MathAI] Image picked and compressed from library');
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
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[MathAI] Compressing camera photo...');
        const compressed = await compressImage(asset.uri);

        if (compressed.base64) {
          setAttachedImage({
            uri: compressed.uri,
            base64: compressed.base64,
            mimeType: compressed.mimeType,
          });
          triggerHaptic('medium');
          console.log('[MathAI] Photo taken and compressed');
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
    void takePhoto();
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
                colors={['#0EA5E9', '#0284C7']}
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
      const boxedMatch = !stepMatch && !answerMatch ? trimmed.match(/\\boxed\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/) : null;

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
              colors={['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.answerBadge}
            >
              <Zap size={12} color="#fff" />
              <Text style={styles.answerBadgeText}>SVAR</Text>
            </LinearGradient>
            <Text style={styles.answerCardContent}>{cleanMarkdown(answerContent)}</Text>
          </View>
        );
        cardIndex++;
      } else if (boxedMatch) {
        flushCard();
        const boxedContent = cleanMarkdown(boxedMatch[1]);
        cards.push(
          <View key={`${messageId}-answer-${cardIndex}`} style={styles.answerCard}>
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.answerBadge}
            >
              <Zap size={12} color="#fff" />
              <Text style={styles.answerBadgeText}>SVAR</Text>
            </LinearGradient>
            <Text style={styles.answerCardContent}>{boxedContent}</Text>
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
            <View style={styles.assistantAvatarRow}>
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                style={styles.assistantAvatar}
              >
                <Text style={styles.assistantAvatarText}>🧮</Text>
              </LinearGradient>
              <Text style={styles.assistantName}>Matematik AI</Text>
            </View>
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
            <ArrowLeft size={20} color="#0EA5E9" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              style={styles.headerIcon}
            >
              <Text style={styles.headerIconEmoji}>🧮</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Matematik AI</Text>
              <Text style={styles.headerSubtitle}>Steg-för-steg lösningar ✨</Text>
            </View>
          </View>
          <View style={styles.onlineDotWrap}>
            <View style={styles.onlineDot} />
          </View>
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
                    colors={['#0EA5E9', '#0284C7']}
                    style={styles.emptyIconContainer}
                  >
                    <Text style={styles.emptyIconEmoji}>📐</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>Hej! Jag är din matte-AI 🎓</Text>
                <Text style={styles.emptySubtitle}>
                  Fota en uppgift, skriv en ekvation eller ställ en fråga{'\n'}— jag löser det steg för steg!
                </Text>

                <View style={styles.suggestionsGrid}>
                  <TouchableOpacity style={styles.suggestionCard} onPress={handleSuggestionPhoto} activeOpacity={0.7}>
                    <Text style={styles.suggestionCardTitle}>📸 Fota uppgift</Text>
                    <Text style={styles.suggestionCardDesc}>Ta en bild direkt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Lös ekvationen: 2x + 5 = 15')} activeOpacity={0.7}>
                    <Text style={styles.suggestionCardTitle}>✏️ Ekvation</Text>
                    <Text style={styles.suggestionCardDesc}>Skriv & lös</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Förklara Pythagoras sats')} activeOpacity={0.7}>
                    <Text style={styles.suggestionCardTitle}>📐 Geometri</Text>
                    <Text style={styles.suggestionCardDesc}>Former & satser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSuggestion('Hur beräknar jag derivatan av x³ + 2x?')} activeOpacity={0.7}>
                    <Text style={styles.suggestionCardTitle}>🧮 Derivata</Text>
                    <Text style={styles.suggestionCardDesc}>Kalkyl & analys</Text>
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
                  <Text style={styles.loadingText}>🔍 Löser uppgiften...</Text>
                </View>
              </View>
            )}

            {(error || localError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  ⚠️ {localError || 'Ett fel uppstod. Försök igen.'}
                </Text>
              </View>
            )}
          </ScrollView>

          {attachedImage && (
            <View style={styles.imagePreviewBar}>
              <Image source={{ uri: attachedImage.uri }} style={styles.previewThumbnail} />
              <Text style={styles.previewText}>📎 Bild bifogad — redo att analysera</Text>
              <TouchableOpacity onPress={removeAttachedImage} style={styles.removeImageButton}>
                <X size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
            <View style={styles.inputRow}>
              <View style={styles.mediaButtonsRow}>
                <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} testID="math-ai-camera" activeOpacity={0.7}>
                  <Camera size={18} color="#0EA5E9" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImageFromLibrary} testID="math-ai-gallery" activeOpacity={0.7}>
                  <ImageIcon size={18} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputFieldWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Skriv en ekvation eller fråga... ✍️"
                  placeholderTextColor="#94A3B8"
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
                  colors={((!input.trim() && !attachedImage) || isSending) ? ['#CBD5E1', '#94A3B8'] : ['#0EA5E9', '#0284C7']}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.1,
  },
  onlineDotWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
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
    paddingTop: 40,
  },
  emptyIconOuter: {
    marginBottom: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 10,
  },
  suggestionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  suggestionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  suggestionCardTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  suggestionCardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400' as const,
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
    backgroundColor: '#0EA5E9',
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    shadowColor: '#0EA5E9',
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
  assistantAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantAvatarText: {
    fontSize: 14,
  },
  assistantName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  stepsContainer: {
    gap: 10,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
    shadowColor: '#0F172A',
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
    width: 30,
    height: 30,
    borderRadius: 10,
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
    color: '#64748B',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  stepCardContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1E293B',
  },
  answerCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    shadowColor: '#0EA5E9',
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
    paddingVertical: 5,
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
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#0369A1',
    lineHeight: 30,
  },
  plainTextCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 23,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
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
    backgroundColor: '#0EA5E9',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
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
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  previewThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  removeImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  inputContainer: {
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  inputFieldWrap: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
