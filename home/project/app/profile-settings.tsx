import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { User, AtSign, Save, RefreshCw } from 'lucide-react-native';

export default function ProfileSettings() {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (auth.user) {
      setDisplayName(auth.user.displayName || '');
      setUsername(auth.user.username || '');
    }
  }, [auth.user]);

  const showMessage = (text: string, isError = false) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      showMessage('Visningsnamn krävs', true);
      return;
    }

    if (!username.trim()) {
      showMessage('Användarnamn krävs', true);
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      showMessage('Användarnamnet får endast innehålla bokstäver, siffror och understreck', true);
      return;
    }

    if (username.length < 3) {
      showMessage('Användarnamnet måste vara minst 3 tecken', true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        name: displayName.trim()
      });

      if (error) {
        showMessage(error.message || 'Kunde inte uppdatera profilen', true);
      } else {
        showMessage('Profilen har uppdaterats!');
      }
    } catch (error) {
      showMessage('Ett oväntat fel inträffade', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await auth.refreshUser();
      showMessage('Profil uppdaterad');
    } catch (error) {
      console.error('Error refreshing user:', error);
      showMessage('Kunde inte uppdatera profilen', true);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!auth.user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Profilinställningar' }} />
        <Text style={styles.errorText}>Ingen användare inloggad</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profilinställningar',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.headerButton}
              disabled={isRefreshing}
            >
              <RefreshCw 
                size={20} 
                color="#007AFF" 
                style={[isRefreshing && styles.spinning]} 
              />
            </TouchableOpacity>
          )
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {message ? (
            <View style={[styles.messageContainer, message.includes('fel') || message.includes('Kunde') ? styles.errorMessage : styles.successMessage]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

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
                E-post: {auth.user.email}
              </Text>
              {auth.user.username && (
                <Text style={styles.currentInfoText}>
                  Användarnamn: @{auth.user.username}
                </Text>
              )}
              {auth.user.displayName && (
                <Text style={styles.currentInfoText}>
                  Visningsnamn: {auth.user.displayName}
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
  headerButton: {
    padding: 8,
  },
  spinning: {
    opacity: 0.5,
  },
  messageContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
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