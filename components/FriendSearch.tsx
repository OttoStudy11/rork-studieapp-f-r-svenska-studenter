import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Search, UserPlus, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface FriendSearchProps {
  onFriendAdded?: () => void;
}

export default function FriendSearch({ onFriendAdded }: FriendSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const searchUsers = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_users_by_username', {
        search_term: term
      });

      if (error) {
        console.error('Error searching users:', error?.message || JSON.stringify(error));
        showError('Kunde inte söka efter användare');
        return;
      }

      // Filter out current user from results
      const filteredResults = data?.filter((result: SearchResult) => result.id !== user?.id) || [];
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error?.message || JSON.stringify(error));
      showError('Något gick fel vid sökning');
    } finally {
      setIsSearching(false);
    }
  }, [user?.id, showError]);

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    
    // Debounce search
    const timer = setTimeout(() => {
      searchUsers(text);
    }, 300);

    return () => clearTimeout(timer);
  };

  const addFriend = async (friendId: string, friendUsername: string) => {
    if (!user) return;

    setAddingFriendId(friendId);
    try {
      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .single();

      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          showError('Ni är redan vänner!');
        } else if (existingFriendship.status === 'pending') {
          showError('Vänförfrågan redan skickad');
        }
        return;
      }

      // Create friend request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) {
        console.error('Error adding friend:', error?.message || JSON.stringify(error));
        showError('Kunde inte skicka vänförfrågan');
        return;
      }

      showSuccess(`Vänförfrågan skickad till @${friendUsername}`);
      onFriendAdded?.();
      
      // Remove from search results
      setSearchResults(prev => prev.filter(result => result.id !== friendId));
    } catch (error: any) {
      console.error('Error adding friend:', error?.message || JSON.stringify(error));
      showError('Något gick fel');
    } finally {
      setAddingFriendId(null);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <User size={20} color="#6B7280" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.displayName}>{item.display_name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.addButton,
          addingFriendId === item.id && styles.addButtonDisabled
        ]}
        onPress={() => addFriend(item.id, item.username)}
        disabled={addingFriendId === item.id}
      >
        {addingFriendId === item.id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <UserPlus size={16} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök efter användarnamn..."
            value={searchTerm}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.loadingText}>Söker...</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Inga användare hittades</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});