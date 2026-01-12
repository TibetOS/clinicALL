import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, uploadImage } from '../lib/supabase';
import { createLogger } from '../lib/logger';
import type { DaySchedule, ServiceInput, BusinessTypeKey } from '../components/auth/types';

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
  phone: string;
  businessName: string;
  businessPhone: string;
  slug: string;
  address: string;
  city: string;
  businessTypes: BusinessTypeKey[];
  operatingHours: DaySchedule[];
  services: ServiceInput[];
  logo: File | null;
  coverImage: File | null;
  galleryImages: File[];
  tagline: string;
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

  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent duplicate fetches
    if (fetchingProfile.current) {
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
        logger.info('Profile loaded:', data.full_name);
      } else if (error) {
        logger.error('Error fetching profile:', error);
      }
    } catch (err) {
      if (!isMounted.current) return;
      logger.error('Profile fetch error:', err);
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
      // Mock signup for development - simulate success
      logger.info('Mock signup (Supabase not configured)');
      setUser({ id: 'mock-user', email: data.email } as User);
      setProfile({
        id: 'mock-user',
        email: data.email,
        full_name: data.businessName,
        role: 'admin',
        clinic_id: 'mock-clinic',
      });
      return { error: null };
    }

    try {
      // Upload images first if present
      let logoUrl: string | null = null;
      let coverUrl: string | null = null;
      const galleryUrls: string[] = [];

      if (data.logo) {
        const ext = data.logo.name.split('.').pop() || 'jpg';
        logoUrl = await uploadImage(data.logo, 'clinic-assets', `${data.slug}/logo.${ext}`);
      }

      if (data.coverImage) {
        const ext = data.coverImage.name.split('.').pop() || 'jpg';
        coverUrl = await uploadImage(data.coverImage, 'clinic-assets', `${data.slug}/cover.${ext}`);
      }

      for (let i = 0; i < data.galleryImages.length; i++) {
        const file = data.galleryImages[i];
        if (file) {
          const ext = file.name.split('.').pop() || 'jpg';
          const url = await uploadImage(file, 'clinic-assets', `${data.slug}/gallery/${i}.${ext}`);
          if (url) galleryUrls.push(url);
        }
      }

      // Step 1: Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.businessName,
          },
        },
      });

      if (authError) {
        logger.error('Auth signUp error:', authError);
        return { error: authError as Error };
      }

      const userId = authData.user?.id;
      if (!userId) {
        return { error: new Error('Failed to create user account') };
      }

      // Step 2: Create clinic record
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: data.businessName,
          slug: data.slug,
          phone: data.businessPhone,
          address: data.address,
          city: data.city,
          tagline: data.tagline,
          logo_url: logoUrl,
          cover_url: coverUrl,
          gallery_urls: galleryUrls,
          business_types: data.businessTypes,
          opening_hours: data.operatingHours,
        })
        .select('id')
        .single();

      if (clinicError) {
        logger.error('Clinic creation error:', clinicError);
        return { error: clinicError as Error };
      }

      const clinicId = clinicData.id;

      // Step 3: Create services records
      if (data.services.length > 0) {
        const servicesData = data.services.map((service) => ({
          clinic_id: clinicId,
          name: service.name,
          duration: service.duration,
          price: service.price,
          category: 'כללי', // Default category
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesData);

        if (servicesError) {
          logger.error('Services creation error:', servicesError);
          // Continue even if services fail - non-critical
        }
      }

      // Step 4: Update user record with clinic_id and phone
      // The user record might be auto-created by trigger, so we use upsert
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: data.email,
          full_name: data.businessName,
          phone: data.phone.replace(/\D/g, ''), // Normalize phone
          clinic_id: clinicId,
          role: 'admin',
        }, {
          onConflict: 'id',
        });

      if (userError) {
        logger.error('User update error:', userError);
        // Continue - the user might still be able to use the app
      }

      logger.info('Signup completed successfully for:', data.email);
      return { error: null };
    } catch (err) {
      logger.error('signUp exception:', err);
      return { error: err as Error };
    }
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
