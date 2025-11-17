import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Calendar, Clock, Users, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  participant_count?: number;
  my_status?: string | null;
}

export default function GroupSessionsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('study_group_sessions')
        .select('*')
        .eq('group_id', id as string)
        .order('scheduled_start', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      const sessionsWithData = await Promise.all(
        data.map(async (session) => {
          const { count } = await supabase
            .from('study_group_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          const { data: participantData } = await supabase
            .from('study_group_session_participants')
            .select('status')
            .eq('session_id', session.id)
            .eq('user_id', user?.id || '')
            .single();

          return {
            ...session,
            participant_count: count || 0,
            my_status: participantData?.status || null
          };
        })
      );

      setSessions(sessionsWithData);
    } catch (err) {
      console.error('Exception fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    if (!title.trim() || !date || !startTime || !endTime) {
      alert('Fyll i alla fält');
      return;
    }

    const scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
    const scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();

    if (scheduledEnd <= scheduledStart) {
      alert('Sluttid måste vara efter starttid');
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('study_group_sessions')
        .insert({
          group_id: id as string,
          title: title.trim(),
          description: description.trim() || null,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          created_by: user?.id || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        alert('Kunde inte skapa session');
      } else {
        await supabase
          .from('study_group_session_participants')
          .insert({
            session_id: data.id,
            user_id: user?.id || '',
            status: 'accepted'
          });

        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setDate('');
        setStartTime('');
        setEndTime('');
        fetchSessions();
      }
    } catch (err) {
      console.error('Exception creating session:', err);
      alert('Kunde inte skapa session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_group_session_participants')
        .upsert({
          session_id: sessionId,
          user_id: user?.id || '',
          status: 'accepted'
        }, {
          onConflict: 'session_id,user_id'
        });

      if (error) {
        console.error('Error joining session:', error);
      } else {
        fetchSessions();
      }
    } catch (err) {
      console.error('Exception joining session:', err);
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_group_session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user?.id || '');

      if (error) {
        console.error('Error leaving session:', error);
      } else {
        fetchSessions();
      }
    } catch (err) {
      console.error('Exception leaving session:', err);
    }
  };

  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_start) > new Date());
  const pastSessions = sessions.filter(s => new Date(s.scheduled_start) <= new Date());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Studiesessioner</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={24} color={theme.colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
        >
          {upcomingSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kommande</Text>
              {upcomingSessions.map((session) => (
                <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>{session.title}</Text>
                  
                  {session.description && (
                    <Text style={[styles.sessionDescription, { color: theme.colors.textMuted }]}>
                      {session.description}
                    </Text>
                  )}

                  <View style={styles.sessionMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={theme.colors.primary} />
                      <Text style={[styles.metaText, { color: theme.colors.text }]}>
                        {new Date(session.scheduled_start).toLocaleDateString('sv-SE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={theme.colors.primary} />
                      <Text style={[styles.metaText, { color: theme.colors.text }]}>
                        {new Date(session.scheduled_start).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(session.scheduled_end).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={14} color={theme.colors.primary} />
                      <Text style={[styles.metaText, { color: theme.colors.text }]}>
                        {session.participant_count} deltagare
                      </Text>
                    </View>
                  </View>

                  {session.my_status === 'accepted' ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                      onPress={() => handleLeaveSession(session.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Lämna</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.colors.success + '15' }]}
                      onPress={() => handleJoinSession(session.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>Gå med</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {pastSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tidigare</Text>
              {pastSessions.map((session) => (
                <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.surface, opacity: 0.7 }]}>
                  <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>{session.title}</Text>
                  
                  <View style={styles.sessionMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={theme.colors.textMuted} />
                      <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                        {new Date(session.scheduled_start).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={14} color={theme.colors.textMuted} />
                      <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                        {session.participant_count} deltog
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {sessions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Calendar size={64} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Inga sessioner än
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                Skapa en session för att studera tillsammans!
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Skapa studiesession</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Titel *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="T.ex. Matte - Derivata"
                  placeholderTextColor={theme.colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Beskrivning</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="Beskriv vad ni ska göra..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Datum * (ÅÅÅÅ-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="2025-01-20"
                  placeholderTextColor={theme.colors.textMuted}
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <View style={styles.timeRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Start * (HH:MM)</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.background, 
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }]}
                    placeholder="14:00"
                    placeholderTextColor={theme.colors.textMuted}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Slut * (HH:MM)</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.background, 
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }]}
                    placeholder="16:00"
                    placeholderTextColor={theme.colors.textMuted}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.createButton, { 
                backgroundColor: theme.colors.primary,
                opacity: isCreating ? 0.7 : 1
              }]}
              onPress={handleCreateSession}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Skapa session</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sessionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
