import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('AuthContext');

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'staff' | 'client';
  clinic_id: string;
  avatar_url?: string;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  clinicName: string;
  slug: string;
  businessId?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      logger.warn('Auth initialization timed out');
      setLoading(false);
    }, 5000);

    // Get initial session with error handling
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);

        if (error) {
          logger.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        logger.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else if (error) {
        logger.error('Error fetching profile:', error);
      }
    } catch (err) {
      logger.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      // Mock login for development
      setUser({ id: 'mock-user', email } as User);
      setProfile({
        id: 'mock-user',
        email,
        full_name: 'Demo User',
        role: 'owner',
        clinic_id: 'mock-clinic',
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (data: SignUpData) => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          clinic_name: data.clinicName,
          slug: data.slug,
          business_id: data.businessId,
          address: data.address,
          phone: data.phone,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    logger.info('User signing out');

    try {
      // Clear any cached data from localStorage (except essential app settings)
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('supabase.') ||
        key.startsWith('clinic_') ||
        key.startsWith('cache_')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Sign out from Supabase if configured
      if (isConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          logger.error('Supabase signOut error:', error);
          // Still clear local state even if Supabase fails
          setUser(null);
          setProfile(null);
          setSession(null);
          return { error: error as Error };
        }
      }

      // Clear local auth state
      setUser(null);
      setProfile(null);
      setSession(null);

      logger.info('User signed out successfully');
      return { error: null };
    } catch (err) {
      logger.error('signOut exception:', err);
      // Still clear local state on exception
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: error as Error | null };
    } catch (err) {
      logger.error('updatePassword exception:', err);
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
