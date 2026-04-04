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
  Animated,
} from 'react-native';
import { Send, ArrowLeft, Sparkles } from 'lucide-react-native';
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
  const insets = useSafeAreaInsets();

  const { messages, error, sendMessage } = useRorkAgent({
    system: GENERAL_SYSTEM,
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
      console.error('[GeneralAI] useRorkAgent error:', error);
      setLocalError(error instanceof Error ? error.message : 'Ett fel uppstod med AI-assistenten');
    }
  }, [error]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return;

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
  }, [input, isSending, sendMessage]);

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

      if (trimmed.startsWith('• ')) {
        elements.push(
          <View key={`${messageId}-bullet-${idx}`} style={styles.bulletContainer}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{trimmed.slice(2)}</Text>
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

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Sparkles size={14} color="#fff" />
          </View>
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
      </View>
    );
  }, [renderCleanText]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} testID="general-ai-back">
          <ArrowLeft size={22} color="#4ECDC4" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Sparkles size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Generell AI</Text>
            <Text style={styles.headerSubtitle}>Fråga om vad som helst</Text>
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
              <View style={styles.emptyIconContainer}>
                <Sparkles size={40} color="#4ECDC4" />
              </View>
              <Text style={styles.emptyTitle}>Hej!</Text>
              <Text style={styles.emptySubtitle}>
                Jag är din AI-assistent. Ställ mig frågor om dina studier, kurser, eller vad som helst!
              </Text>
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => setInput('Hur kan jag plugga mer effektivt?')}
                >
                  <Text style={styles.suggestionText}>Hur kan jag plugga mer effektivt?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => setInput('Ge mig tips för att komma ihåg saker bättre')}
                >
                  <Text style={styles.suggestionText}>Ge mig tips för att komma ihåg saker bättre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => setInput('Vad är Pomodoro-tekniken?')}
                >
                  <Text style={styles.suggestionText}>Vad är Pomodoro-tekniken?</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            messages.map((message) => renderMessage(message))
          )}
          {isSending && (
            <View style={styles.loadingRow}>
              <View style={styles.aiAvatar}>
                <Sparkles size={14} color="#fff" />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#4ECDC4" />
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

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Skriv ditt meddelande..."
            placeholderTextColor="#667788"
            multiline
            maxLength={1000}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            testID="general-ai-send"
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1410',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78,205,196,0.08)',
    backgroundColor: '#0d1a15',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(78,205,196,0.08)',
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
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#4ECDC4',
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
    paddingTop: 50,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(78,205,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6a9a94',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: 'rgba(78,205,196,0.06)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.12)',
  },
  suggestionText: {
    fontSize: 14,
    color: '#4ECDC4',
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
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4ECDC4',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(30,60,50,0.6)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.1)',
  },
  userMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  assistantMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#c8ece8',
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
    color: '#4ECDC4',
    fontWeight: '600' as const,
  },
  numLabel: {
    width: 22,
    fontSize: 14,
    lineHeight: 22,
    color: '#4ECDC4',
    fontWeight: '600' as const,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#c8ece8',
  },
  textSpacer: {
    height: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loadingBubble: {
    backgroundColor: 'rgba(30,60,50,0.6)',
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.1)',
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
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(10,20,16,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(78,205,196,0.08)',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(78,205,196,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#e0f2ef',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.1)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(78,205,196,0.3)',
  },
});
