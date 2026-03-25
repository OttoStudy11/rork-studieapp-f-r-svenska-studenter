import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { User, AtSign, Save, RefreshCw } from 'lucide-react-native';

export default function ProfileManagement() {
  const auth = useAuth();
  const user = auth.user;
  const updateProfile = (auth as any).updateProfile;
  const refreshUser = (auth as any).refreshUser;
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName((user as any).displayName || '');
      setUsername((user as any).username || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Fel', 'Visningsnamn krävs');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Fel', 'Användarnamn krävs');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      Alert.alert('Fel', 'Användarnamnet får endast innehålla bokstäver, siffror och understreck');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Fel', 'Användarnamnet måste vara minst 3 tecken');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        name: displayName.trim()
      });

      if (error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Kunde inte uppdatera profilen';
        Alert.alert('Fel', errorMessage);
      } else {
        Alert.alert('Framgång', 'Profilen har uppdaterats!');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Ett oväntat fel inträffade';
      Alert.alert('Fel', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ingen användare inloggad</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Profilinställningar</Text>
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.refreshButton}
              disabled={isRefreshing}
            >
              <RefreshCw 
                size={20} 
                color="#007AFF" 
                style={[styles.refreshIcon, isRefreshing && styles.spinning]} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <User size={20} color="#666" />
                <Text style={styles.inputLabel}>Visningsnamn</Text>
              </View>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Ditt för- och efternamn"
                placeholderTextColor="#999"
                autoCapitalize="words"
                testID="display-name-input"
              />
              <Text style={styles.inputHelp}>
                Detta namn visas för andra användare
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <AtSign size={20} color="#666" />
                <Text style={styles.inputLabel}>Användarnamn</Text>
              </View>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase())}
                placeholder="dittanvandarnamn"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                testID="username-input"
              />
              <Text style={styles.inputHelp}>
                Används för att lägga till vänner. Endast bokstäver, siffror och understreck.
              </Text>
            </View>

            <View style={styles.currentInfo}>
              <Text style={styles.currentInfoTitle}>Nuvarande information:</Text>
              <Text style={styles.currentInfoText}>
                E-post: {user.email}
              </Text>
              {(user as any).username && (
                <Text style={styles.currentInfoText}>
                  Användarnamn: @{(user as any).username}
                </Text>
              )}
              {(user as any).displayName && (
                <Text style={styles.currentInfoText}>
                  Visningsnamn: {(user as any).displayName}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              testID="save-button"
            >
              <Save size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Sparar...' : 'Spara ändringar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    opacity: 0.7,
  },
  spinning: {
    opacity: 0.5,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputHelp: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  currentInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  currentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 50,
  },
});