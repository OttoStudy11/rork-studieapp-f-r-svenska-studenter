import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react-native';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const { showError, showSuccess } = useToast();

  const handleAuth = async () => {
    if (!email.trim()) {
      showError('Ange din e-postadress');
      return;
    }

    if (!password.trim()) {
      showError('Ange ditt lösenord');
      return;
    }

    if (isSignUp && password.length < 6) {
      showError('Lösenordet måste vara minst 6 tecken');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password, rememberMe);
      
      if (error) {
        const errorMessage = (error as any)?.message || '';
        console.error('Auth error:', errorMessage);
        
        // Handle common Supabase auth errors
        if (errorMessage.includes('Invalid login credentials')) {
          showError('Felaktig e-post eller lösenord');
        } else if (errorMessage.includes('User already registered')) {
          showError('En användare med denna e-post finns redan');
        } else if (errorMessage.includes('Email not confirmed')) {
          showError('Bekräfta din e-post innan du loggar in');
        } else {
          showError(errorMessage || 'Ett fel uppstod');
        }
      } else {
        if (isSignUp) {
          showSuccess('Konto skapat! Kolla din e-post för att bekräfta kontot.');
        } else {
          showSuccess('Välkommen tillbaka!');
        }
      }
    } catch (error) {
      console.error('Auth exception:', error);
      showError('Ett fel uppstod: ' + String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showError('Ange din e-postadress först');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        const errorMessage = (error as any)?.message || '';
        showError(errorMessage || 'Kunde inte skicka återställningslänk');
      } else {
        showSuccess('Återställningslänk skickad till din e-post!');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <GraduationCap size={80} color="white" style={styles.logo} />
                <Text style={styles.title}>StudyFlow</Text>
                <Text style={styles.subtitle}>
                  {showForgotPassword 
                    ? 'Återställ ditt lösenord'
                    : isSignUp 
                      ? 'Skapa ditt konto'
                      : 'Välkommen tillbaka!'
                  }
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-postadress"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    autoFocus
                  />
                </View>

                {!showForgotPassword && (
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Lösenord"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#666" />
                      ) : (
                        <Eye size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.authButton, isLoading && styles.disabledButton]}
                  onPress={showForgotPassword ? handleForgotPassword : handleAuth}
                  disabled={isLoading}
                >
                  <Text style={styles.authButtonText}>
                    {isLoading 
                      ? (showForgotPassword ? 'Skickar...' : isSignUp ? 'Skapar konto...' : 'Loggar in...')
                      : (showForgotPassword ? 'Skicka återställningslänk' : isSignUp ? 'Skapa konto' : 'Logga in')
                    }
                  </Text>
                </TouchableOpacity>

                {!showForgotPassword && (
                  <>
                    {!isSignUp && (
                      <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                      >
                        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                          {rememberMe && <Check size={16} color="white" />}
                        </View>
                        <Text style={styles.rememberMeText}>Kom ihåg mig</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => setShowForgotPassword(true)}
                    >
                      <Text style={styles.linkText}>Glömt lösenord?</Text>
                    </TouchableOpacity>

                    <View style={styles.switchContainer}>
                      <Text style={styles.switchText}>
                        {isSignUp ? 'Har du redan ett konto?' : 'Har du inget konto?'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsSignUp(!isSignUp)}
                        style={styles.switchButton}
                      >
                        <Text style={styles.switchButtonText}>
                          {isSignUp ? 'Logga in' : 'Skapa konto'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {showForgotPassword && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => setShowForgotPassword(false)}
                  >
                    <Text style={styles.linkText}>Tillbaka till inloggning</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 4,
  },

  authButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginRight: 8,
  },
  switchButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  switchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'white',
  },
  rememberMeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
});