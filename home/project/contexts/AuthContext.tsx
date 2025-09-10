import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, createRememberMeSession, validateRememberMeSession, clearRememberMeSession, cleanupExpiredSessions, testDatabaseConnection } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  username?: string;
  displayName?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  resendConfirmation: (email: string) => Promise<{ error?: any }>;
  updateProfile: (updates: { displayName?: string; username?: string; name?: string }) => Promise<{ error?: any }>;
  refreshUser: () => Promise<void>;
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
      // Check AsyncStorage for onboarding status
      const storedStatus = await AsyncStorage.getItem(`@onboarding_completed_${userId}`);
      if (storedStatus === 'true') {
        console.log('Onboarding status found in AsyncStorage: completed');
        setHasCompletedOnboarding(true);
        return;
      }
      
      // Also check the old key format for backward compatibility
      const oldStoredStatus = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
      if (oldStoredStatus === 'true') {
        console.log('Onboarding status found in old AsyncStorage format: completed');
        setHasCompletedOnboarding(true);
        // Migrate to new format
        await AsyncStorage.setItem(`@onboarding_completed_${userId}`, 'true');
        await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
        return;
      }
      
      // Check if user has a complete profile in database
      try {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!error && dbProfile) {
          const hasCompleteProfile = dbProfile.name && 
            (dbProfile as any).gymnasium && 
            (dbProfile as any).program && 
            (dbProfile as any).year;
          
          if (hasCompleteProfile) {
            console.log('Complete profile found in database, marking onboarding as completed');
            await AsyncStorage.setItem(`@onboarding_completed_${userId}`, 'true');
            setHasCompletedOnboarding(true);
            return;
          }
        }
      } catch (dbError) {
        console.log('Could not check profile in database:', dbError);
      }
      
      // If no onboarding status found, it's not completed
      console.log('No onboarding status found, onboarding not completed');
      setHasCompletedOnboarding(false);
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
        email: profile.email || `${profile.name}@studiestugan.app`, // Use actual email or fallback
        createdAt: profile.created_at,
        username: profile.username,
        displayName: profile.display_name || profile.name
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
        console.warn('Database connection failed, continuing with limited functionality');
        // Still try to get session from local storage
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
        // Get profile data to include username and display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, name')
          .eq('id', supabaseUser.id)
          .single();
        
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          createdAt: supabaseUser.created_at,
          username: profile?.username,
          displayName: profile?.display_name || profile?.name
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
          // Get profile data to include username and display name
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, name')
            .eq('id', session.user.id)
            .single();
          
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            createdAt: session.user.created_at,
            username: profile?.username,
            displayName: profile?.display_name || profile?.name
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
        // Don't clear user state on timeout, might have valid remember me session
      }
    }, 12000); // Increased timeout to 12 seconds

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [initializeAuth, checkOnboardingStatus]);

  const RATE_LIMIT_DELAY = 60000; // 60 seconds

  const handleSignUp = useCallback(async (email: string, password: string, displayName?: string) => {
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
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
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
        // Get profile data after sign in
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, name')
          .eq('id', data.user.id)
          .single();
        
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          createdAt: data.user.created_at,
          username: profile?.username,
          displayName: profile?.display_name || profile?.name
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

  const updateProfile = useCallback(async (updates: { displayName?: string; username?: string; name?: string }) => {
    try {
      if (!user) {
        return { error: { message: 'Ingen användare inloggad' } };
      }

      console.log('Updating profile for user:', user.id, updates);
      
      // Check if username is already taken before updating
      if (updates.username && updates.username !== user.username) {
        try {
          const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', updates.username)
            .neq('id', user.id)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking username availability:', checkError);
            return { error: { message: 'Kunde inte kontrollera användarnamn' } };
          }
          
          if (existingUser) {
            return { error: { message: 'Användarnamnet är redan taget' } };
          }
        } catch (usernameCheckError: any) {
          console.error('Error checking username:', usernameCheckError?.message || JSON.stringify(usernameCheckError));
          return { error: { message: 'Kunde inte kontrollera användarnamn' } };
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          username: updates.username,
          name: updates.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Profile update error:', error);
        
        if (error.message && error.message.includes('duplicate key')) {
          return { error: { message: 'Användarnamnet är redan taget' } };
        }
        
        if (error.message && error.message.includes('violates unique constraint')) {
          return { error: { message: 'Användarnamnet är redan taget' } };
        }
        
        return { error: { message: error.message || 'Ett fel inträffade vid uppdatering av profilen' } };
      }
      
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        username: data.username,
        displayName: data.display_name || data.name
      } : null);
      
      console.log('Profile updated successfully:', data);
      return { error: null };
    } catch (error: any) {
      console.error('Profile update exception:', error?.message || JSON.stringify(error));
      return { error: { message: error?.message || 'Ett oväntat fel inträffade' } };
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, name, email')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          username: profile.username,
          displayName: profile.display_name || profile.name,
          email: profile.email || prev.email
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [user]);

  const setOnboardingCompleted = useCallback(async () => {
    if (user) {
      try {
        console.log('Marking onboarding as completed for user:', user.id);
        await AsyncStorage.setItem(`@onboarding_completed_${user.id}`, 'true');
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
    resendConfirmation: handleResendConfirmation,
    updateProfile,
    refreshUser
  }), [
    user,
    isLoading,
    hasCompletedOnboarding,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    setOnboardingCompleted,
    handleResetPassword,
    handleResendConfirmation,
    updateProfile,
    refreshUser
  ]);

  return contextValue;
});