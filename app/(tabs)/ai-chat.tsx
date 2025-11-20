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
import { Image } from 'expo-image';
import { Send, Sparkles, BookOpen, Lightbulb, Brain, Flame, TrendingUp } from 'lucide-react-native';
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
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
              style={styles.headerLogo}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>StudieStugan AI</Text>
            <Text style={styles.headerSubtitle}>Din personliga studieguide</Text>
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
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>AI-funktionen kommer snart! 🚀</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                Vi arbetar på en fantastisk AI-assistent som kommer hjälpa dig med studier, ge tips och förklaringar. Håll utkik!
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
            placeholder="Kommer snart..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            maxLength={1000}
            editable={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: theme.colors.primary },
              styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={true}
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
    paddingVertical: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  headerLogo: {
    width: 52,
    height: 52,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500' as const,
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
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
});
