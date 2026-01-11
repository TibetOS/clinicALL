import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('AuthContext');

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'client';
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
  // New fields for Israeli market
  whatsapp?: string;
  city?: string;
  businessType?: 'exempt' | 'authorized' | 'company' | 'partnership'; // עוסק פטור, עוסק מורשה, חברה בע"מ, שותפות
  practitionerType?: 'doctor' | 'nurse' | 'aesthetician' | 'cosmetician' | 'other';
  licenseNumber?: string;
  instagram?: string;
  facebook?: string;
  languages?: string[];
  operatingHours?: string;
  referralSource?: string;
  specializations?: string[];
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

  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  // Track if we're already fetching profile to prevent duplicate requests
  const fetchingProfile = useRef(false);

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    // Prevent duplicate fetches
    if (fetchingProfile.current && retryCount === 0) {
      return;
    }
    fetchingProfile.current = true;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Only update state if component is still mounted
      if (!isMounted.current) return;

      if (!error && data) {
        setProfile(data as UserProfile);
        logger.info('Profile loaded successfully:', data.full_name);
      } else if (error) {
        logger.error('Error fetching profile:', error);
        // Retry on AbortError (up to 3 times)
        if (error.message?.includes('abort') && retryCount < 3) {
          logger.info(`Retrying profile fetch (attempt ${retryCount + 2})...`);
          setTimeout(() => {
            if (isMounted.current) {
              fetchingProfile.current = false;
              fetchProfile(userId, retryCount + 1);
            }
          }, 500 * (retryCount + 1));
          return;
        }
      }
    } catch (err: unknown) {
      if (!isMounted.current) return;
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Profile fetch error:', errorMessage);
      // Retry on AbortError (up to 3 times)
      if (errorMessage.includes('abort') && retryCount < 3) {
        logger.info(`Retrying profile fetch (attempt ${retryCount + 2})...`);
        setTimeout(() => {
          if (isMounted.current) {
            fetchingProfile.current = false;
            fetchProfile(userId, retryCount + 1);
          }
        }, 500 * (retryCount + 1));
        return;
      }
    } finally {
      fetchingProfile.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        logger.warn('Auth initialization timed out');
        setLoading(false);
      }
    }, 5000);

    // Get initial session with error handling
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted.current) return;
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
        if (!isMounted.current) return;
        logger.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted.current) return;

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
      isMounted.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

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
          // New fields for Israeli market
          whatsapp: data.whatsapp,
          city: data.city,
          business_type: data.businessType,
          practitioner_type: data.practitionerType,
          license_number: data.licenseNumber,
          instagram: data.instagram,
          facebook: data.facebook,
          languages: data.languages,
          operating_hours: data.operatingHours,
          referral_source: data.referralSource,
          specializations: data.specializations,
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
