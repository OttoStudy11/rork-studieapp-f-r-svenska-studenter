import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_config: any;
  };
}

export default function GroupChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [groupName, setGroupName] = useState('Chatt');

  const fetchMessages = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('study_group_messages')
        .select(`
          *,
          profiles (display_name, username, avatar_config)
        `)
        .eq('group_id', id as string)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data.map(m => ({
        ...m,
        profile: m.profiles
      })));

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Exception fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();

    const fetchGroupName = async () => {
      const { data } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', id as string)
        .single();

      if (data) {
        setGroupName(data.name);
      }
    };

    fetchGroupName();
  }, [fetchMessages, id]);

  useEffect(() => {
    if (!id) return;

    const channel: RealtimeChannel = supabase
      .channel(`group_messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `group_id=eq.${id}`
        },
        async (payload) => {
          console.log('New message:', payload);

          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, username, avatar_config')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg: Message = {
            ...payload.new,
            profile: profileData
          } as Message;

          setMessages(prev => [...prev, newMsg]);

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('study_group_messages')
        .insert({
          group_id: id as string,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        alert('Kunde inte skicka meddelande');
      } else {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Exception sending message:', err);
      alert('Kunde inte skicka meddelande');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.user_id === user?.id;
    const showAvatar = index === 0 || messages[index - 1].user_id !== item.user_id;
    const showName = showAvatar;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
        ]}
      >
        {!isMyMessage && showAvatar && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {item.profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}

        <View style={[
          styles.messageBubble,
          isMyMessage 
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: theme.colors.surface }
        ]}>
          {showName && !isMyMessage && (
            <Text style={[styles.senderName, { color: theme.colors.primary }]}>
              {item.profile?.display_name || 'Användare'}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            { color: isMyMessage ? '#fff' : theme.colors.text }
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isMyMessage ? '#fff9' : theme.colors.textMuted }
          ]}>
            {new Date(item.created_at).toLocaleTimeString('sv-SE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {groupName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
            {messages.length} meddelanden
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Inga meddelanden än
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                  Skicka det första meddelandet!
                </Text>
              </View>
            }
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background, 
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            placeholder="Skriv ett meddelande..."
            placeholderTextColor={theme.colors.textMuted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, { 
              backgroundColor: theme.colors.primary,
              opacity: isSending || !newMessage.trim() ? 0.5 : 1
            }]}
            onPress={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatarSpacer: {
    width: 32,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
