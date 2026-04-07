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
  Animated,
} from 'react-native';
import { Send, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

interface GeneralAIChatProps {
  onBack: () => void;
}

const GENERAL_SYSTEM = `Du är en hjälpsam AI-assistent för studenter.
Du ska:
- Svara på alla frågor tydligt och pedagogiskt på svenska
- Ge studietips, sammanfattningar och förklaringar
- Var uppmuntrande och stöttande
- Svara ALLTID på svenska
- Var koncis men informativ

VIKTIGA FORMATERINGSREGLER (följ dessa STRIKT):
- Skriv ALDRIG ###, ##, #, **, ***, *, __ eller någon annan markdown-syntax
- Skriv ALDRIG rubriker med # tecken
- Använd ALDRIG asterisker för fetstil eller kursiv
- Skriv ren, vanlig text utan någon formatering
- Separera stycken med en tom rad för läsbarhet
- Använd bindestreck (-) för punktlistor om det behövs
- Håll mellanrummen lagom, max en tom rad mellan stycken
- Skriv koncist och tydligt utan onödiga tomrader`;

export default function GeneralAIChat({ onBack }: GeneralAIChatProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const prevMessageCount = useRef(0);
  const insets = useSafeAreaInsets();

  const messageAnims = useRef<Map<string, Animated.Value>>(new Map());
  const messageSlideAnims = useRef<Map<string, Animated.Value>>(new Map());

  const loadingDotAnim1 = useRef(new Animated.Value(0.3)).current;
  const loadingDotAnim2 = useRef(new Animated.Value(0.3)).current;
  const loadingDotAnim3 = useRef(new Animated.Value(0.3)).current;

  const { messages, error, sendMessage } = useRorkAgent({
    system: GENERAL_SYSTEM,
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
      console.error('[GeneralAI] useRorkAgent error:', error);
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

  const triggerHaptic = useCallback((type: 'light' | 'medium') => {
    if (type === 'medium') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return;

    triggerHaptic('medium');
    const userMessage = input.trim();
    setInput('');
    setIsSending(true);
    setLocalError(null);

    try {
      console.log('[GeneralAI] Sending message:', userMessage);
      sendMessage(userMessage);
      console.log('[GeneralAI] Message sent successfully');
    } catch (err) {
      console.error('[GeneralAI] Error sending message:', err);
      setLocalError(err instanceof Error ? err.message : 'Ett okänt fel uppstod');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sendMessage, triggerHaptic]);

  const renderCleanText = useCallback((text: string, messageId: string) => {
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

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const bulletContent = trimmed.startsWith('• ') ? trimmed.slice(2) : trimmed.slice(2);
        elements.push(
          <View key={`${messageId}-bullet-${idx}`} style={styles.bulletContainer}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{bulletContent}</Text>
          </View>
        );
      } else {
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (numMatch) {
          elements.push(
            <View key={`${messageId}-num-${idx}`} style={styles.bulletContainer}>
              <Text style={styles.numLabel}>{numMatch[1]}.</Text>
              <Text style={styles.bulletText}>{numMatch[2]}</Text>
            </View>
          );
        } else {
          elements.push(
            <Text key={`${messageId}-line-${idx}`} style={styles.assistantMessageText}>
              {trimmed}
            </Text>
          );
        }
      }
    });

    return elements;
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
        {!isUser && (
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.aiAvatar}
          >
            <Text style={styles.aiAvatarEmoji}>✨</Text>
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
                  {renderCleanText(part.text, `${message.id}-${index}`)}
                </View>
              );
            }
            return null;
          })}
        </View>
      </Animated.View>
    );
  }, [renderCleanText]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 8, transform: [{ translateY: headerSlide }] }]}>
        <TouchableOpacity onPress={() => { triggerHaptic('light'); onBack(); }} style={styles.backButton} testID="general-ai-back">
          <ArrowLeft size={20} color="#10B981" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.headerIcon}
          >
            <Text style={styles.headerIconEmoji}>✨</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Generell AI</Text>
            <Text style={styles.headerSubtitle}>Fråga om vad som helst 💡</Text>
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
                  colors={['#10B981', '#059669']}
                  style={styles.emptyIconContainer}
                >
                  <Text style={styles.emptyIconEmoji}>💬</Text>
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>Hej! Jag är din AI-kompis 👋</Text>
              <Text style={styles.emptySubtitle}>
                Ställ mig frågor om dina studier, kurser,{'\n'}eller vad som helst — jag finns här!
              </Text>
              <View style={styles.suggestionsGrid}>
                {[
                  { emoji: '📖', title: 'Plugga effektivt', query: 'Hur kan jag plugga mer effektivt?' },
                  { emoji: '🧠', title: 'Minnas bättre', query: 'Ge mig tips för att komma ihåg saker bättre' },
                  { emoji: '🍅', title: 'Pomodoro', query: 'Vad är Pomodoro-tekniken?' },
                  { emoji: '✍️', title: 'Sammanfattning', query: 'Hur skriver jag en bra sammanfattning?' },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionButton}
                    onPress={() => { triggerHaptic('light'); setInput(item.query); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionEmoji}>{item.emoji}</Text>
                    <Text style={styles.suggestionText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message: any) => renderMessage(message))
          )}
          {isSending && (
            <View style={styles.loadingRow}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.aiAvatar}
              >
                <Text style={styles.aiAvatarEmoji}>✨</Text>
              </LinearGradient>
              <View style={styles.loadingBubble}>
                <View style={styles.loadingDotsRow}>
                  <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim1 }]} />
                  <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim2 }]} />
                  <Animated.View style={[styles.loadingDot, { opacity: loadingDotAnim3 }]} />
                </View>
                <Text style={styles.loadingText}>🤔 Tänker...</Text>
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

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.inputRow}>
            <View style={styles.inputFieldWrap}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ställ en fråga... ✍️"
                placeholderTextColor="#64748B"
                multiline
                maxLength={1000}
                editable={!isSending}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isSending}
              testID="general-ai-send"
            >
              <LinearGradient
                colors={(!input.trim() || isSending) ? ['#475569', '#334155'] : ['#10B981', '#059669']}
                style={styles.sendButtonGradient}
              >
                <Send size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1410',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#0D1A15',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
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
    color: '#F1F5F9',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#34D399',
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
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
    color: '#F1F5F9',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6A9A94',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  suggestionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  suggestionButton: {
    width: '48%',
    backgroundColor: 'rgba(16,185,129,0.06)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    gap: 6,
  },
  suggestionEmoji: {
    fontSize: 22,
  },
  suggestionText: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  aiAvatarEmoji: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: 'rgba(30,60,50,0.7)',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
  },
  userMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  assistantMessageText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#D1F5EB',
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 16,
    fontSize: 14,
    lineHeight: 22,
    color: '#34D399',
    fontWeight: '600' as const,
  },
  numLabel: {
    width: 22,
    fontSize: 14,
    lineHeight: 22,
    color: '#34D399',
    fontWeight: '600' as const,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: '#D1F5EB',
  },
  textSpacer: {
    height: 6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loadingBubble: {
    backgroundColor: 'rgba(30,60,50,0.7)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  loadingText: {
    fontSize: 13,
    color: '#6A9A94',
    fontWeight: '500' as const,
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    paddingTop: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(10,20,16,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.08)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputFieldWrap: {
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(16,185,129,0.06)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#E0F2EF',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.12)',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
