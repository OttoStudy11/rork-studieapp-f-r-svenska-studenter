import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Search, UserPlus, X } from 'lucide-react-native';
import { useFriends } from '../contexts/FriendsContext';

interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

interface FriendSearchProps {
  onClose: () => void;
}

export default function FriendSearch({ onClose }: FriendSearchProps) {
  const { searchUsers, sendFriendRequest } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchUsers(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Fel', 'Kunde inte söka efter användare');
    } finally {
      setIsSearching(false);
    }
  }, [searchUsers]);

  const handleSendRequest = useCallback(async (userId: string) => {
    setSendingRequests(prev => new Set(prev).add(userId));
    
    try {
      const { error } = await sendFriendRequest(userId);
      
      if (error) {
        Alert.alert('Fel', error.message || 'Kunde inte skicka vänförfrågan');
      } else {
        Alert.alert('Skickat!', 'Vänförfrågan skickad');
        // Remove user from results after successful request
        setResults(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Send request error:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [sendFriendRequest]);

  const getAvatarColor = (name: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderUser = ({ item }: { item: SearchUser }) => {
    const isLoading = sendingRequests.has(item.id);
    
    return (
      <View style={styles.userItem}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.display_name || item.username) }]}>
          <Text style={styles.avatarText}>
            {(item.display_name || item.username || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{item.display_name || item.username}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={() => handleSendRequest(item.id)}
          disabled={isLoading}
        >
          <UserPlus size={20} color={isLoading ? '#95a5a6' : '#4ECDC4'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sök vänner</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök efter användarnamn..."
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Söker...</Text>
        </View>
      )}

      {!isSearching && query.length >= 2 && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Inga användare hittades</Text>
        </View>
      )}

      {!isSearching && query.length > 0 && query.length < 2 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Skriv minst 2 tecken för att söka</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
});