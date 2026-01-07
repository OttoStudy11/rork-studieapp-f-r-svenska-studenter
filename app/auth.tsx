import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Image } from 'expo-image';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Sparkles, BookOpen, Target, Trophy } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();
  const { signIn, signUp, resetPassword, resendConfirmation, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const { showError, showSuccess } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

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
        const errorCode = (error as any)?.code || '';
        console.error('ERROR Auth error:', errorMessage);
        
        if (errorCode === 'EMAIL_NOT_CONFIRMED') {
          setPendingEmail(email);
          setShowEmailConfirmation(true);
          return;
        }
        
        if (errorMessage) {
          showError(errorMessage);
        } else {
          showError('Ett fel uppstod vid inloggning');
        }
      } else {
        if (isSignUp) {
          showSuccess('Konto skapat! Kolla din e-post för att bekräfta kontot innan du loggar in.');
          setIsSignUp(false);
        } else {
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

  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#059669', '#10B981', '#34D399']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.orb,
            styles.orb1,
            { transform: [{ translateY: orb1TranslateY }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.orb,
            styles.orb2,
            { transform: [{ translateY: orb2TranslateY }] }
          ]} 
        />
        <View style={styles.orb3} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.header}>
                <Animated.View 
                  style={[
                    styles.logoContainer,
                    { transform: [{ scale: logoScale }] }
                  ]}
                >
                  <View style={styles.logoGlow} />
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
                    style={styles.logo}
                    contentFit="contain"
                  />
                </Animated.View>
                
                <Text style={styles.title}>StudieStugan</Text>
                
                <View style={styles.subtitleContainer}>
                  <Sparkles size={14} color="#FFFFFF" style={styles.sparkleIcon} />
                  <Text style={styles.subtitle}>
                    {showEmailConfirmation
                      ? 'Bekräfta din e-post'
                      : showForgotPassword 
                        ? 'Återställ ditt lösenord'
                        : isSignUp 
                          ? 'Skapa ditt konto'
                          : 'Välkommen tillbaka'
                    }
                  </Text>
                  <Sparkles size={14} color="#FFFFFF" style={styles.sparkleIcon} />
                </View>

                {!showEmailConfirmation && !showForgotPassword && (
                  <Text style={styles.description}>
                    {isSignUp 
                      ? 'Börja din studieresa idag'
                      : 'Fortsätt där du slutade'
                    }
                  </Text>
                )}
              </View>

              {!showEmailConfirmation && !showForgotPassword && !isSignUp && (
                <View style={styles.featuresRow}>
                  <View style={styles.featureChip}>
                    <BookOpen size={14} color="#059669" />
                    <Text style={styles.featureChipText}>Kurser</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Target size={14} color="#059669" />
                    <Text style={styles.featureChipText}>Framsteg</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Trophy size={14} color="#059669" />
                    <Text style={styles.featureChipText}>Prestationer</Text>
                  </View>
                </View>
              )}

              <View style={styles.formCard}>
                <View style={styles.formCardInner}>
                  {showEmailConfirmation ? (
                    <View style={styles.confirmationContainer}>
                      <View style={styles.confirmationIconContainer}>
                        <Mail size={32} color="#059669" />
                      </View>
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
                      <View style={[
                        styles.inputContainer,
                        focusedInput === 'email' && styles.inputContainerFocused
                      ]}>
                        <View style={styles.inputIconContainer}>
                          <Mail size={20} color={focusedInput === 'email' ? '#059669' : '#6B7280'} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="E-postadress"
                          placeholderTextColor="#94A3B8"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="email"
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>

                      {!showForgotPassword && (
                        <View style={[
                          styles.inputContainer,
                          focusedInput === 'password' && styles.inputContainerFocused
                        ]}>
                          <View style={styles.inputIconContainer}>
                            <Lock size={20} color={focusedInput === 'password' ? '#059669' : '#6B7280'} />
                          </View>
                          <TextInput
                            style={styles.input}
                            placeholder="Lösenord"
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            {showPassword ? (
                              <EyeOff size={20} color="#6B7280" />
                            ) : (
                              <Eye size={20} color="#6B7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}

                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[styles.authButton, isLoading && styles.disabledButton]}
                      onPress={
                        showEmailConfirmation 
                          ? handleResendConfirmation 
                          : showForgotPassword 
                            ? handleForgotPassword 
                            : handleAuth
                      }
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      disabled={isLoading}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={isLoading ? ['#94A3B8', '#CBD5E1'] : ['#059669', '#10B981']}
                        style={styles.authButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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
                        {!isLoading && (
                          <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  {!showForgotPassword && !showEmailConfirmation && (
                    <>
                      {!isSignUp && (
                        <View style={styles.optionsRow}>
                          <TouchableOpacity
                            style={styles.rememberMeContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                              {rememberMe && <Check size={12} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.rememberMeText}>Kom ihåg mig</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setShowForgotPassword(true)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.forgotText}>Glömt lösenord?</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}

                  {(showForgotPassword || showEmailConfirmation) && (
                    <TouchableOpacity
                      style={styles.backToLoginButton}
                      onPress={() => {
                        setShowForgotPassword(false);
                        setShowEmailConfirmation(false);
                        setPendingEmail('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.backToLoginText}>← Tillbaka till inloggning</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {!showForgotPassword && !showEmailConfirmation && (
                <View style={styles.switchContainer}>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>eller</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => setIsSignUp(!isSignUp)}
                    style={styles.switchButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.switchButtonInner}>
                      <Text style={styles.switchText}>
                        {isSignUp ? 'Har du redan ett konto?' : 'Ny här?'}
                      </Text>
                      <Text style={styles.switchButtonText}>
                        {isSignUp ? 'Logga in' : 'Skapa konto'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.footerText}>
                Genom att fortsätta godkänner du våra villkor
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
  },
  gradient: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  orb3: {
    width: 180,
    height: 180,
    bottom: -50,
    right: 50,
    backgroundColor: 'rgba(6, 95, 70, 0.25)',
    position: 'absolute',
    borderRadius: 999,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sparkleIcon: {
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#059669',
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  formCardInner: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputContainerFocused: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  inputIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },
  authButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rememberMeText: {
    color: '#64748B',
    fontSize: 14,
  },
  forgotText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  switchContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600' as const,
  },
  switchButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  switchButtonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    marginRight: 6,
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  confirmationIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationText: {
    color: '#475569',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationEmail: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationInstructions: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
  },
});
