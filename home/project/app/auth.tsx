import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Check, User, AtSign } from 'lucide-react-native';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp, resetPassword, resendConfirmation, isAuthenticated, hasCompletedOnboarding } = useAuth();

  // Simple toast functions
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  // Navigate immediately when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User authenticated, navigating...', { hasCompletedOnboarding });
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading]);

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

    if (isSignUp && !displayName.trim()) {
      showError('Ange ditt namn');
      return;
    }

    if (isSignUp && !username.trim()) {
      showError('Ange ett användarnamn');
      return;
    }

    if (isSignUp && username.length < 3) {
      showError('Användarnamnet måste vara minst 3 tecken');
      return;
    }

    if (isSignUp && !/^[a-z0-9_]+$/.test(username)) {
      showError('Användarnamnet får endast innehålla små bokstäver, siffror och understreck');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password, displayName, username)
        : await signIn(email, password, rememberMe);
      
      if (error) {
        const errorMessage = (error as any)?.message || '';
        const errorCode = (error as any)?.code || '';
        console.error('ERROR Auth error:', errorMessage);
        
        // Handle email not confirmed error specifically
        if (errorCode === 'EMAIL_NOT_CONFIRMED') {
          setPendingEmail(email);
          setShowEmailConfirmation(true);
          return;
        }
        
        // Use the improved error message from AuthContext if available
        if (errorMessage) {
          showError(errorMessage);
        } else {
          showError('Ett fel uppstod vid inloggning');
        }
      } else {
        if (isSignUp) {
          showSuccess('Konto skapat! Kolla din e-post för att bekräfta kontot innan du loggar in.');
          // Switch to sign in mode after successful signup
          setIsSignUp(false);
        } else {
          // Don't show success message for login, just let navigation happen
          console.log('Login successful, waiting for navigation...');
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

  const handleResendConfirmation = async () => {
    if (!pendingEmail.trim()) {
      showError('Ingen e-postadress att skicka till');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resendConfirmation(pendingEmail);
      
      if (error) {
        const errorMessage = (error as any)?.message || '';
        showError(errorMessage || 'Kunde inte skicka bekräftelselänk');
      } else {
        showSuccess('Bekräftelselänk skickad till din e-post! Kolla din inkorg och spam-mapp.');
        setShowEmailConfirmation(false);
        setPendingEmail('');
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
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
              {/* Error/Success Messages */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              <View style={styles.header}>
                <GraduationCap size={80} color="white" style={styles.logo} />
                <Text style={styles.title}>StudieStugan</Text>
                <Text style={styles.subtitle}>
                  {showEmailConfirmation
                    ? 'Bekräfta din e-post'
                    : showForgotPassword 
                      ? 'Återställ ditt lösenord'
                      : isSignUp 
                        ? 'Skapa ditt konto'
                        : 'Välkommen tillbaka!'
                  }
                </Text>
              </View>

              <View style={styles.form}>
                {showEmailConfirmation ? (
                  <View style={styles.confirmationContainer}>
                    <Text style={styles.confirmationText}>
                      Vi har skickat en bekräftelselänk till:
                    </Text>
                    <Text style={styles.confirmationEmail}>{pendingEmail}</Text>
                    <Text style={styles.confirmationInstructions}>
                      Kolla din inkorg och spam-mapp. Klicka på länken för att bekräfta ditt konto.
                    </Text>
                  </View>
                ) : (
                  <>
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

                    {isSignUp && (
                      <>
                        <View style={styles.inputContainer}>
                          <User size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Ditt namn"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                            autoCorrect={false}
                          />
                        </View>

                        <View style={styles.inputContainer}>
                          <AtSign size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Användarnamn"
                            value={username}
                            onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </View>
                      </>
                    )}

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
                  </>
                )}

                <TouchableOpacity
                  style={[styles.authButton, isLoading && styles.disabledButton]}
                  onPress={
                    showEmailConfirmation 
                      ? handleResendConfirmation 
                      : showForgotPassword 
                        ? handleForgotPassword 
                        : handleAuth
                  }
                  disabled={isLoading}
                >
                  <Text style={styles.authButtonText}>
                    {isLoading 
                      ? (showEmailConfirmation 
                          ? 'Skickar...' 
                          : showForgotPassword 
                            ? 'Skickar...' 
                            : isSignUp 
                              ? 'Skapar konto...' 
                              : 'Loggar in...'
                        )
                      : (showEmailConfirmation 
                          ? 'Skicka bekräftelselänk igen' 
                          : showForgotPassword 
                            ? 'Skicka återställningslänk' 
                            : isSignUp 
                              ? 'Skapa konto' 
                              : 'Logga in'
                        )
                    }
                  </Text>
                </TouchableOpacity>

                {!showForgotPassword && !showEmailConfirmation && (
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

                {(showForgotPassword || showEmailConfirmation) && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setShowEmailConfirmation(false);
                      setPendingEmail('');
                    }}
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
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  successText: {
    color: '#44ff44',
    fontSize: 14,
    textAlign: 'center',
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
  confirmationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  confirmationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationEmail: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationInstructions: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});