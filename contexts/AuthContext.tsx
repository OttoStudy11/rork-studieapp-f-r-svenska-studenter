import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, createRememberMeSession, validateRememberMeSession, clearRememberMeSession, cleanupExpiredSessions, testDatabaseConnection } from '@/lib/supabase';

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
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
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
      // Check if user has selected a program in the database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('program_id, program')
        .eq('id', userId)
        .single();
      
      if (!error && profile && profile.program_id && profile.program !== 'Ej valt') {
        // User has selected a program, mark onboarding as completed
        console.log('User has selected program, onboarding completed');
        setHasCompletedOnboarding(true);
        // Also store in AsyncStorage for faster future checks
        await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
        return;
      }
      
      // If no program selected, onboarding is not completed
      console.log('User has not selected program yet, onboarding not completed');
      setHasCompletedOnboarding(false);
      // Remove from AsyncStorage if it exists
      await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
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
        email: `${profile.name}@studyflow.app`, // Temporary email format
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
          setUser(authUser);
          await checkOnboardingStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setHasCompletedOnboarding(false);
        }
        
        setIsLoading(false);
      }
    );
    
    // Fallback timeout to ensure loading doesn't get stuck
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [initializeAuth, checkOnboardingStatus]);

  const RATE_LIMIT_DELAY = 60000; // 60 seconds

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
      
      // Profile will be created automatically by the database trigger
      if (data.user) {
        console.log('User signed up successfully, profile will be created automatically:', data.user.id);
      }
      
      return { error: null };
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
          return { error: { message: 'Bekräfta din e-post innan du loggar in. Kolla din inkorg och spam-mapp.' } };
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
        
        // Profile should exist automatically due to database trigger
        console.log('User signed in successfully, profile should exist automatically');
        
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
      
      // Clear onboarding status
      if (user) {
        await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
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

  const setOnboardingCompleted = useCallback(async () => {
    if (user) {
      try {
        await AsyncStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.error('Error setting onboarding completed:', error);
      }
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    setOnboardingCompleted,
    resetPassword: handleResetPassword
  }), [
    user,
    isLoading,
    hasCompletedOnboarding,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    setOnboardingCompleted,
    handleResetPassword
  ]);
});