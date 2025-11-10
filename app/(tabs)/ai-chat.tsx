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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles } from 'lucide-react-native';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useTheme } from '@/contexts/ThemeContext';

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

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    if (!process.env.EXPO_PUBLIC_TOOLKIT_URL) {
      setLocalError('AI-funktionen är inte konfigurerad. Kontakta support.');
      console.error('EXPO_PUBLIC_TOOLKIT_URL is not configured');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);
    setLocalError(null);

    console.log('Sending message:', userMessage);
    console.log('Toolkit URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);

    try {
      await sendMessage(userMessage);
      console.log('Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
      setLocalError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    console.log('Messages updated:', messages.length);
    console.log('Error:', error);
  }, [messages, error]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const cleanText = (text: string) => {
    return text.replace(/\*/g, '');
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
                <Text
                  key={`${message.id}-${index}`}
                  style={[
                    styles.messageText,
                    isUser ? styles.userMessageText : { color: theme.colors.text },
                  ]}
                >
                  {cleanText(part.text)}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>AI Assistent</Text>
        <Text style={styles.headerSubtitle}>Ställ mig frågor om dina studier</Text>
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
                <Sparkles size={48} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Hej där! 👋</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                Jag är din AI-assistent. Ställ mig frågor om dina studier, kurser, eller vad som helst!
              </Text>
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => setInput('Hur kan jag plugga mer effektivt?')}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.primary }]}>Hur kan jag plugga mer effektivt?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => setInput('Ge mig tips för att komma ihåg saker bättre')}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.primary }]}>Ge mig tips för att komma ihåg saker bättre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => setInput('Vad är Pomodoro-tekniken?')}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.primary }]}>Vad är Pomodoro-tekniken?</Text>
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
                {localError || 'Ett fel uppstod. Försök igen.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
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
              (!input.trim() || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
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
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
