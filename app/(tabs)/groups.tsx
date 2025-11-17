import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Users, Plus, Search, Lock, Globe, X, BookOpen, Calendar, TrendingUp } from 'lucide-react-native';
import { useStudyGroups } from '@/contexts/StudyGroupContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function GroupsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const {
    myGroups,
    availableGroups,
    isLoading,
    joinGroup,
    leaveGroup,
    fetchMyGroups,
    fetchAvailableGroups
  } = useStudyGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMyGroups(), fetchAvailableGroups()]);
    setRefreshing(false);
  };

  const handleJoinGroup = async () => {
    if (!selectedGroup) return;

    setIsJoining(true);
    const { error } = await joinGroup(selectedGroup.id, inviteCode);
    setIsJoining(false);

    if (error) {
      alert(error);
    } else {
      setShowJoinModal(false);
      setInviteCode('');
      setSelectedGroup(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    const { error } = await leaveGroup(groupId);
    if (error) {
      alert(error);
    }
  };

  const filteredMyGroups = myGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Studiegrupper</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/group/create' as any)}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Search size={20} color={theme.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Sök grupper..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mina Grupper</Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                {filteredMyGroups.length}
              </Text>
            </View>
          </View>

          {isLoading && filteredMyGroups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : filteredMyGroups.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Users size={48} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Du är inte med i några grupper än
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                Gå med i en grupp eller skapa din egen!
              </Text>
            </View>
          ) : (
            filteredMyGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[styles.groupCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => router.push(`/group/${group.id}` as any)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={isDark ? ['#1a1a2e', '#16213e'] : ['#e3f2fd', '#bbdefb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.groupIcon}
                >
                  <Users size={24} color={theme.colors.primary} strokeWidth={2} />
                </LinearGradient>

                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={[styles.groupName, { color: theme.colors.text }]} numberOfLines={1}>
                      {group.name}
                    </Text>
                    {group.is_private ? (
                      <Lock size={14} color={theme.colors.textMuted} />
                    ) : (
                      <Globe size={14} color={theme.colors.textMuted} />
                    )}
                  </View>
                  
                  {group.course && (
                    <View style={styles.courseTag}>
                      <BookOpen size={12} color={theme.colors.primary} />
                      <Text style={[styles.courseText, { color: theme.colors.primary }]} numberOfLines={1}>
                        {group.course.name}
                      </Text>
                    </View>
                  )}

                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Users size={14} color={theme.colors.textMuted} />
                      <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                        {group.member_count} medlemmar
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLeaveGroup(group.id);
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Lämna</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tillgängliga Grupper</Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.success }]}>
                {filteredAvailableGroups.length}
              </Text>
            </View>
          </View>

          {isLoading && filteredAvailableGroups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : filteredAvailableGroups.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Search size={48} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Inga tillgängliga grupper
              </Text>
            </View>
          ) : (
            filteredAvailableGroups.map((group) => (
              <View
                key={group.id}
                style={[styles.groupCard, { backgroundColor: theme.colors.surface }]}
              >
                <LinearGradient
                  colors={isDark ? ['#1a1a2e', '#16213e'] : ['#e8f5e9', '#c8e6c9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.groupIcon}
                >
                  <Users size={24} color={theme.colors.success} strokeWidth={2} />
                </LinearGradient>

                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={[styles.groupName, { color: theme.colors.text }]} numberOfLines={1}>
                      {group.name}
                    </Text>
                    {group.is_private ? (
                      <Lock size={14} color={theme.colors.textMuted} />
                    ) : (
                      <Globe size={14} color={theme.colors.textMuted} />
                    )}
                  </View>

                  {group.course && (
                    <View style={styles.courseTag}>
                      <BookOpen size={12} color={theme.colors.success} />
                      <Text style={[styles.courseText, { color: theme.colors.success }]} numberOfLines={1}>
                        {group.course.name}
                      </Text>
                    </View>
                  )}

                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Users size={14} color={theme.colors.textMuted} />
                      <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                        {group.member_count}/{group.max_members}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.success + '15' }]}
                  onPress={() => {
                    setSelectedGroup(group);
                    if (group.is_private) {
                      setShowJoinModal(true);
                    } else {
                      joinGroup(group.id);
                    }
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
                    Gå med
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Gå med i privat grupp
              </Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <X size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.colors.textMuted }]}>
              Ange inbjudningskod för att gå med i {selectedGroup?.name}
            </Text>

            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background, 
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Inbjudningskod"
              placeholderTextColor={theme.colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={[styles.modalButton, { 
                backgroundColor: theme.colors.primary,
                opacity: isJoining ? 0.7 : 1
              }]}
              onPress={handleJoinGroup}
              disabled={isJoining || !inviteCode}
            >
              {isJoining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Gå med</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    gap: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseText: {
    fontSize: 13,
    fontWeight: '600',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
