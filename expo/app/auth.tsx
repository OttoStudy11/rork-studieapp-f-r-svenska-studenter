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
import { ROUTES } from '@/utils/typedRoutes';
import { useToast } from '@/contexts/ToastContext';
import { Image } from 'expo-image';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, RefreshCw, CheckCircle, AlertCircle, GraduationCap, Brain, Zap } from 'lucide-react-native';
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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInWithApple, resetPassword, resendConfirmation, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const { showError, showSuccess } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    const createFloat = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    createFloat(floatAnim1, 3500);
    createFloat(floatAnim2, 4500);
    createFloat(floatAnim3, 5500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User authenticated, navigating...', { hasCompletedOnboarding });
      if (hasCompletedOnboarding) {
        router.replace(ROUTES.home as any);
      } else {
        router.replace(ROUTES.onboarding as any);
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading]);

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
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
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      showError('Ange din e-postadress');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showError('Ange en giltig e-postadress');
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
      if (isSignUp) {
        const result = await signUp(trimmedEmail, password);
        
        if (result.error) {
          const errorMessage = (result.error as any)?.message || '';
          console.error('ERROR Sign up error:', errorMessage);
          
          if (errorMessage) {
            showError(errorMessage);
          } else {
            showError('Ett fel uppstod vid registrering');
          }
          return;
        }
        
        if (result.needsEmailConfirmation) {
          setPendingEmail(trimmedEmail);
          setShowEmailConfirmation(true);
          showSuccess('Konto skapat! Kolla din e-post för att bekräfta kontot.');
        } else {
          showSuccess('Konto skapat!');
        }
      } else {
        const result = await signIn(trimmedEmail, password, rememberMe);
        
        if (result.error) {
          const errorMessage = (result.error as any)?.message || '';
          const errorCode = (result.error as any)?.code || '';
          console.error('ERROR Sign in error:', errorMessage);
          
          if (errorCode === 'EMAIL_NOT_CONFIRMED') {
            setPendingEmail(trimmedEmail);
            setShowEmailConfirmation(true);
            return;
          }
          
          if (errorMessage) {
            showError(errorMessage);
          } else {
            showError('Ett fel uppstod vid inloggning');
          }
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

    if (resendCooldown > 0) {
      showError(`Vänta ${resendCooldown} sekunder innan du försöker igen`);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resendConfirmation(pendingEmail);
      
      if (error) {
        const errorMessage = (error as any)?.message || '';
        showError(errorMessage || 'Kunde inte skicka bekräftelselänk');
      } else {
        showSuccess('Bekräftelselänk skickad!');
        setVerificationSent(true);
        setResendCooldown(60);
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
      showError('Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    // Use isLoading (not a separate flag) — the navigation effect below waits
    // for it, so it must stay true until checkOnboardingStatus has finished
    // inside signInWithApple. Otherwise a user who already completed
    // onboarding gets routed straight back into it.
    setIsLoading(true);
    try {
      const result = await signInWithApple();
      if (result.error) {
        showError(result.error.message || 'Ett fel uppstod vid Apple-inloggning');
      }
    } catch (error) {
      console.error('Apple sign in error:', error);
      showError('Ett fel uppstod vid Apple-inloggning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const float1Y = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const float2Y = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 15] });
  const float3Y = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const float1Opacity = floatAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  const float2Opacity = floatAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.5, 0.2] });
  const float3Opacity = floatAnim3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.6, 0.25] });

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bgBase}>
        <Animated.View style={[styles.floatingOrb, styles.orb1, { transform: [{ translateY: float1Y }], opacity: float1Opacity }]} />
        <Animated.View style={[styles.floatingOrb, styles.orb2, { transform: [{ translateY: float2Y }], opacity: float2Opacity }]} />
        <Animated.View style={[styles.floatingOrb, styles.orb3, { transform: [{ translateY: float3Y }], opacity: float3Opacity }]} />
        <View style={styles.gridOverlay} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }, { rotate: logoSpin }] }]}>
            <View style={styles.logoRing}>
              <View style={styles.logoRingInner}>
                <Image
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.appName}>StudieStugan</Text>
            <Text style={styles.tagline}>
              {showEmailConfirmation
                ? 'Bekräfta din e-post'
                : showForgotPassword 
                  ? 'Återställ ditt lösenord'
                  : isSignUp 
                    ? 'Börja din studieresa'
                    : 'Välkommen tillbaka'
              }
            </Text>
          </Animated.View>

          {!showEmailConfirmation && !showForgotPassword && !isSignUp && (
            <Animated.View style={[styles.trustBadges, { opacity: fadeAnim }]}>
              <View style={styles.badge}>
                <GraduationCap size={15} color="#10B981" />
                <Text style={styles.badgeText}>Kurser</Text>
              </View>
              <View style={styles.badgeDot} />
              <View style={styles.badge}>
                <Brain size={15} color="#10B981" />
                <Text style={styles.badgeText}>AI-stöd</Text>
              </View>
              <View style={styles.badgeDot} />
              <View style={styles.badge}>
                <Zap size={15} color="#10B981" />
                <Text style={styles.badgeText}>Framsteg</Text>
              </View>
            </Animated.View>
          )}

          <Animated.View style={[styles.formSection, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>
            {showEmailConfirmation ? (
              <View style={styles.confirmationCard}>
                <View style={styles.confirmationIconWrap}>
                  {verificationSent ? (
                    <CheckCircle size={32} color="#10B981" />
                  ) : (
                    <Mail size={32} color="#10B981" />
                  )}
                </View>
                
                <Text style={styles.confirmationTitle}>
                  {verificationSent ? 'E-post skickad!' : 'Bekräfta din e-post'}
                </Text>
                
                <Text style={styles.confirmationText}>
                  {verificationSent 
                    ? 'Vi har skickat en ny bekräftelselänk till:'
                    : 'Vi har skickat en bekräftelselänk till:'
                  }
                </Text>
                <Text style={styles.confirmationEmail}>{pendingEmail}</Text>
                
                <View style={styles.instructionsBox}>
                  <AlertCircle size={15} color="#F59E0B" style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={styles.confirmationInstructions}>
                    Kolla din inkorg och spam-mapp. Klicka på länken i mailet för att aktivera ditt konto.
                  </Text>
                </View>

                <View style={styles.stepsContainer}>
                  {['Öppna din e-post', 'Hitta mailet från StudieStugan', 'Klicka på bekräftelselänken'].map((step, i) => (
                    <View key={i} style={styles.stepItem}>
                      <View style={styles.stepBullet}>
                        <Text style={styles.stepBulletText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <>
                <View style={[styles.inputWrap, focusedInput === 'email' && styles.inputWrapFocused]}>
                  <Mail size={18} color={focusedInput === 'email' ? '#10B981' : '#6B7280'} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-postadress"
                    placeholderTextColor="#6B7280"
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
                  <View style={[styles.inputWrap, focusedInput === 'password' && styles.inputWrapFocused]}>
                    <Lock size={18} color={focusedInput === 'password' ? '#10B981' : '#6B7280'} />
                    <TextInput
                      style={styles.input}
                      placeholder="Lösenord"
                      placeholderTextColor="#6B7280"
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
                      style={styles.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#6B7280" />
                      ) : (
                        <Eye size={18} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {!showForgotPassword && !showEmailConfirmation && !isSignUp && (
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkBox, rememberMe && styles.checkBoxActive]}>
                    {rememberMe && <Check size={11} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Kom ihåg mig</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowForgotPassword(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Glömt lösenord?</Text>
                </TouchableOpacity>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.mainBtn, (isLoading || (showEmailConfirmation && resendCooldown > 0)) && styles.mainBtnDisabled]}
                onPress={
                  showEmailConfirmation 
                    ? handleResendConfirmation 
                    : showForgotPassword 
                      ? handleForgotPassword 
                      : handleAuth
                }
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={isLoading || (showEmailConfirmation && resendCooldown > 0)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    (isLoading || (showEmailConfirmation && resendCooldown > 0)) 
                      ? ['#374151', '#4B5563'] 
                      : ['#059669', '#10B981']
                  }
                  style={styles.mainBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {showEmailConfirmation && !isLoading && (
                    <RefreshCw size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.mainBtnText}>
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
                          ? (resendCooldown > 0 
                              ? `Skicka igen om ${resendCooldown}s`
                              : 'Skicka bekräftelselänk igen'
                            )
                          : showForgotPassword 
                            ? 'Skicka återställningslänk' 
                            : isSignUp 
                              ? 'Skapa konto' 
                              : 'Logga in'
                        )
                    }
                  </Text>
                  {!isLoading && !showEmailConfirmation && (
                    <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {(showForgotPassword || showEmailConfirmation) && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setShowForgotPassword(false);
                  setShowEmailConfirmation(false);
                  setPendingEmail('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>← Tillbaka till inloggning</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {!showForgotPassword && !showEmailConfirmation && (
            <Animated.View style={[styles.bottomSection, { opacity: formFade }]}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>eller</Text>
                <View style={styles.dividerLine} />
              </View>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.appleBtn}
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  testID="apple-sign-in-button"
                >
                  <Text style={styles.appleIcon}></Text>
                  <Text style={styles.appleBtnText}>
                    {isLoading ? 'Loggar in...' : 'Fortsätt med Apple'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.switchLabel}>
                  {isSignUp ? 'Har du redan ett konto?' : 'Ny här?'}
                </Text>
                <Text style={styles.switchAction}>
                  {isSignUp ? 'Logga in' : 'Skapa konto'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                Genom att fortsätta godkänner du våra villkor
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
    backgroundColor: '#10B981',
    opacity: 0.08,
  },
  orb2: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -80,
    backgroundColor: '#059669',
    opacity: 0.06,
  },
  orb3: {
    width: 160,
    height: 160,
    top: '45%' as any,
    right: -40,
    backgroundColor: '#34D399',
    opacity: 0.05,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  logoRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  logoRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.2,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  badgeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  formSection: {
    marginBottom: 24,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  inputWrapFocused: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rememberText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  forgotText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  mainBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  mainBtnDisabled: {
    opacity: 0.6,
  },
  mainBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: 24,
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  bottomSection: {
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerLabel: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    marginHorizontal: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    fontWeight: '600' as const,
  },
  appleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  appleIcon: {
    fontSize: 19,
    color: '#000000',
    marginRight: 10,
    fontWeight: '500' as const,
  },
  appleBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
  switchBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 6,
  },
  switchLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
  },
  switchAction: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
  confirmationCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  confirmationIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmationText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  confirmationEmail: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  confirmationInstructions: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  stepsContainer: {
    width: '100%',
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBulletText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    flex: 1,
  },
});
