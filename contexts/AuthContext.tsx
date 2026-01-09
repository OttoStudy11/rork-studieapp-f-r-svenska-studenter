import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, createRememberMeSession, validateRememberMeSession, clearRememberMeSession, cleanupExpiredSessions, testDatabaseConnection } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: any; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  resendConfirmation: (email: string) => Promise<{ error?: any }>;
}

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [lastSignUpAttempt, setLastSignUpAttempt] = useState<number>(0);
  const [lastSignInAttempt, setLastSignInAttempt] = useState<number>(0);

  const checkOnboardingStatus = useCallback(async (userId: string) => {
    try {
      console.log('Checking onboarding status for user:', userId);
      
      // First check AsyncStorage for faster loading
      const storedStatus = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
      if (storedStatus === 'true') {
        console.log('Onboarding status found in AsyncStorage: completed');
        setHasCompletedOnboarding(true);
        return;
      }
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        console.warn('Database not available, using AsyncStorage fallback');
        setHasCompletedOnboarding(storedStatus === 'true');
        return;
      }
      
      // Check if user has a profile in the database (indicating onboarding was completed)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, username, display_name, program, level')
        .eq('id', userId)
        .single();
      
      if (!error && profile && profile.name && profile.username && profile.display_name && profile.program && profile.level) {
        // User has a complete profile, mark onboarding as completed
        console.log('User has complete profile, onboarding completed:', profile.name);
        setHasCompletedOnboarding(true);
        // Store in AsyncStorage for faster future checks
        await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
        return;
      }
      
      // If no complete profile, onboarding is not completed
      console.log('User profile incomplete or not found, onboarding not completed');
      setHasCompletedOnboarding(false);
      // Remove from AsyncStorage if it exists
      await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If database check fails, check AsyncStorage as fallback
      try {
        const storedStatus = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
        if (storedStatus === 'true') {
          console.log('Using AsyncStorage fallback: onboarding completed');
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(false);
        }
      } catch (storageError) {
        console.error('Error checking AsyncStorage:', storageError);
        setHasCompletedOnboarding(false);
      }
    }
  }, []);

  const tryRememberMeLogin = useCallback(async () => {
    try {
      console.log('Trying remember me login...');
      const { userId, error } = await validateRememberMeSession();
      
      if (error || !userId) {
        console.log('No valid remember me session');
        setUser(null);
        setHasCompletedOnboarding(false);
        return;
      }
      
      // Get user profile from database using the userId
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.log('Could not find user profile for remember me session');
        await clearRememberMeSession();
        setUser(null);
        setHasCompletedOnboarding(false);
        return;
      }
      
      // Create a mock auth user from profile data
      const authUser: AuthUser = {
        id: profile.id,
        email: `${profile.name}@studiestugan.app`, // Temporary email format
        createdAt: profile.created_at
      };
      
      console.log('Remember me login successful for user:', authUser.id);
      setUser(authUser);
      await checkOnboardingStatus(authUser.id);
    } catch (error) {
      console.error('Error in remember me login:', error);
      setUser(null);
      setHasCompletedOnboarding(false);
    }
  }, [checkOnboardingStatus]);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing Supabase auth...');
      setIsLoading(true);
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        console.warn('Database connection failed, but continuing with auth initialization');
      }
      
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('Session error (expected if no session):', sessionError.message);
        // Try remember me session if no active session
        await tryRememberMeLogin();
        return;
      }
      
      if (!session) {
        console.log('No active session found');
        // Try remember me session if no active session
        await tryRememberMeLogin();
        return;
      }
      
      // If we have a session, get the user
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('Error getting user:', error.message);
        // If we get an auth session missing error, try remember me
        if (error.message.includes('Auth session missing')) {
          console.log('Auth session missing - trying remember me');
          await tryRememberMeLogin();
          return;
        }
        throw error;
      }
      
      if (supabaseUser) {
        console.log('Found authenticated user:', supabaseUser.email);
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          createdAt: supabaseUser.created_at
        };
        setUser(authUser);
        await checkOnboardingStatus(supabaseUser.id);
        // Clean up expired sessions for this user
        await cleanupExpiredSessions(supabaseUser.id);
      } else {
        console.log('No authenticated user found');
        await tryRememberMeLogin();
      }
    } catch (error: any) {
      console.log('Error initializing auth:', error?.message || error);
      // Handle auth session missing gracefully
      if (error?.message?.includes('Auth session missing')) {
        console.log('Auth session missing - trying remember me');
        await tryRememberMeLogin();
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
      }
    } finally {
      console.log('Auth initialization complete');
      setIsLoading(false);
    }
  }, [checkOnboardingStatus, tryRememberMeLogin]);

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };
    
    initialize();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            createdAt: session.user.created_at
          };
          setUser(prev => {
            if (JSON.stringify(prev) === JSON.stringify(authUser)) return prev;
            return authUser;
          });
          await checkOnboardingStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setHasCompletedOnboarding(false);
        }
        
        setIsLoading(false);
      }
    );
    
    // Handle deep links for email verification
    const handleDeepLink = async (event: { url: string }) => {
      if (!mounted) return;
      
      console.log('Deep link received:', event.url);
      const url = event.url;
      
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        console.log('Email verification link detected');
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session from deep link:', error);
            return;
          }
          
          if (session?.user) {
            console.log('Email verified successfully!', session.user.email);
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email!,
              createdAt: session.user.created_at
            };
            setUser(authUser);
            await checkOnboardingStatus(session.user.id);
          }
        } catch (err) {
          console.error('Error processing email verification:', err);
        }
      }
    };
    
    // Check for initial URL (app opened from email link)
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then(url => {
        if (url && mounted) {
          handleDeepLink({ url });
        }
      }).catch(err => {
        console.error('Error getting initial URL:', err);
      });
      
      // Listen for deep links while app is running
      const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
      
      // Fallback timeout to ensure loading doesn't get stuck
      const fallbackTimeout = setTimeout(() => {
        if (mounted) {
          console.log('Auth initialization timeout - forcing loading to false');
          setIsLoading(false);
          setUser(null);
          setHasCompletedOnboarding(false);
        }
      }, 8000);

      return () => {
        mounted = false;
        subscription.unsubscribe();
        linkingSubscription.remove();
        clearTimeout(fallbackTimeout);
      };
    } else {
      // Web doesn't need deep linking, just fallback timeout
      const fallbackTimeout = setTimeout(() => {
        if (mounted) {
          console.log('Auth initialization timeout - forcing loading to false');
          setIsLoading(false);
          setUser(null);
          setHasCompletedOnboarding(false);
        }
      }, 8000);

      return () => {
        mounted = false;
        subscription.unsubscribe();
        clearTimeout(fallbackTimeout);
      };
    }
  }, [initializeAuth, checkOnboardingStatus]);

  const RATE_LIMIT_DELAY = 0; // No delay

  const handleSignUp = useCallback(async (email: string, password: string) => {
    try {
      // Check rate limiting
      const now = Date.now();
      const timeSinceLastAttempt = now - lastSignUpAttempt;
      
      if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
        const remainingTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000);
        return { error: { message: `Vänta ${remainingTime} sekunder innan du försöker igen` } };
      }
      
      setLastSignUpAttempt(now);
      console.log('Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Handle specific Supabase errors
        if (error.message.includes('For security purposes')) {
          const match = error.message.match(/(\d+) seconds/);
          const seconds = match ? match[1] : '60';
          return { error: { message: `Vänta ${seconds} sekunder innan du försöker igen` } };
        }
        
        if (error.message.includes('User already registered')) {
          return { error: { message: 'En användare med denna e-post finns redan' } };
        }
        
        if (error.message.includes('Password should be at least')) {
          return { error: { message: 'Lösenordet måste vara minst 6 tecken' } };
        }
        
        return { error };
      }
      
      console.log('Sign up successful:', data.user?.email);
      
      // Check if email confirmation is required
      const needsEmailConfirmation = data.user && !data.session;
      if (needsEmailConfirmation) {
        console.log('Email confirmation required for:', email);
        return { error: null, needsEmailConfirmation: true };
      }
      
      // Create profile automatically after successful signup
      if (data.user) {
        console.log('User signed up successfully, creating profile:', data.user.id);
        
        // Try to create a basic profile entry
        try {
          const dbConnected = await testDatabaseConnection();
          if (dbConnected) {
            const emailPrefix = email.split('@')[0] || 'Student';
            const defaultUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name: emailPrefix,
                username: defaultUsername,
                display_name: emailPrefix,
                email: email.trim(),
                level: 'gymnasie',
                program: '',
                purpose: '',
                subscription_type: 'free'
              });
            
            if (profileError) {
              console.warn('Could not create profile automatically:', profileError.message);
            } else {
              console.log('Basic profile created successfully');
            }
          }
        } catch (profileCreationError) {
          console.warn('Profile creation failed, will be handled during onboarding:', profileCreationError);
        }
      }
      
      return { error: null, needsEmailConfirmation: false };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  }, [lastSignUpAttempt]);

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Check rate limiting
      const now = Date.now();
      const timeSinceLastAttempt = now - lastSignInAttempt;
      
      if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
        const remainingTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000);
        return { error: { message: `Vänta ${remainingTime} sekunder innan du försöker igen` } };
      }
      
      setLastSignInAttempt(now);
      console.log('Signing in user:', email, 'Remember me:', rememberMe);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific Supabase errors
        if (error.message.includes('For security purposes')) {
          const match = error.message.match(/(\d+) seconds/);
          const seconds = match ? match[1] : '60';
          return { error: { message: `Vänta ${seconds} sekunder innan du försöker igen` } };
        }
        
        if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Bekräfta din e-post innan du loggar in. Kolla din inkorg och spam-mapp.', code: 'EMAIL_NOT_CONFIRMED' } };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Felaktiga uppgifter' } };
        }
        
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      
      // Immediately update the user state to ensure UI updates
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          createdAt: data.user.created_at
        };
        console.log('Setting user state after successful login:', authUser.email);
        setUser(authUser);
        await checkOnboardingStatus(data.user.id);
        
        // Check if profile exists, create if needed
        try {
          const dbConnected = await testDatabaseConnection();
          if (dbConnected) {
            const { error: profileCheckError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .single();
            
            if (profileCheckError && profileCheckError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              console.log('Profile does not exist, creating basic profile');
              const emailPrefix = email.split('@')[0] || 'Student';
              const defaultUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_');
              
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  name: emailPrefix,
                  username: defaultUsername,
                  display_name: emailPrefix,
                  email: email.trim(),
                  level: 'gymnasie',
                  program: '',
                  purpose: '',
                  subscription_type: 'free'
                });
              
              if (profileError) {
                console.warn('Could not create profile on signin:', profileError.message);
              } else {
                console.log('Basic profile created on signin');
              }
            } else if (!profileCheckError) {
              console.log('Profile already exists for user');
            }
          }
        } catch (profileError) {
          console.warn('Profile check/creation failed on signin:', profileError);
        }
        
        // Create remember me session if requested (only after profile exists)
        if (rememberMe) {
          console.log('Creating remember me session...');
          try {
            // Wait a bit to ensure profile is fully created
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { error: rememberError } = await createRememberMeSession(data.user.id);
            if (rememberError) {
              console.log('Failed to create remember me session:', rememberError);
              // Don't fail the login if remember me fails
            } else {
              console.log('Remember me session created successfully');
            }
          } catch (rememberException) {
            console.error('ERROR Error creating remember me session:', rememberException);
            // Don't fail the login if remember me fails
          }
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  }, [checkOnboardingStatus, lastSignInAttempt]);

  const handleSignOut = useCallback(async () => {
    try {
      console.log('Signing out user...');
      
      // Clear remember me session first
      await clearRememberMeSession();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear onboarding status from AsyncStorage
      if (user) {
        try {
          await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
          console.log('Onboarding status cleared from AsyncStorage');
        } catch (error) {
          console.error('Error clearing onboarding status:', error);
        }
      }
      
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [user]);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      console.log('Resetting password for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      
      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }
      
      console.log('Reset password email sent');
      return { error: null };
    } catch (error) {
      console.error('Reset password exception:', error);
      return { error };
    }
  }, []);

  const handleResendConfirmation = useCallback(async (email: string) => {
    try {
      console.log('Resending confirmation email for:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });
      
      if (error) {
        console.error('Resend confirmation error:', error);
        
        if (error.message.includes('For security purposes')) {
          const match = error.message.match(/(\d+) seconds/);
          const seconds = match ? match[1] : '60';
          return { error: { message: `Vänta ${seconds} sekunder innan du försöker igen` } };
        }
        
        if (error.message.includes('Email rate limit exceeded')) {
          return { error: { message: 'För många e-postförfrågningar. Vänta en stund innan du försöker igen.' } };
        }
        
        return { error };
      }
      
      console.log('Confirmation email resent successfully');
      return { error: null };
    } catch (error) {
      console.error('Resend confirmation exception:', error);
      return { error };
    }
  }, []);

  const setOnboardingCompleted = useCallback(async () => {
    if (user) {
      try {
        console.log('Marking onboarding as completed for user:', user.id);
        await AsyncStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
        setHasCompletedOnboarding(true);
        console.log('Onboarding completion stored successfully');
      } catch (error) {
        console.error('Error setting onboarding completed:', error);
      }
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    setOnboardingCompleted,
    resetPassword: handleResetPassword,
    resendConfirmation: handleResendConfirmation
  }), [
    user,
    isLoading,
    hasCompletedOnboarding,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    setOnboardingCompleted,
    handleResetPassword,
    handleResendConfirmation
  ]);

  return contextValue;
});