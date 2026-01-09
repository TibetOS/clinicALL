import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClinicProfile } from '../types';
import { createLogger } from '../lib/logger';
import { getErrorMessage } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

const logger = createLogger('useMyClinic');

// Fallback mock profile for development when no database is configured
const MOCK_MY_CLINIC: ClinicProfile = {
  id: 'clinic-1',
  name: 'ד״ר שרה כהן - אסתטיקה רפואית',
  slug: 'dr-sarah',
  businessId: '512345678',
  tagline: 'אומנות היופי הטבעי',
  description: `ברוכים הבאים לקליניקה שלנו בלב תל אביב. אנו מתמחים בטיפולי אסתטיקה מתקדמים המדגישים את היופי הטבעי שלך.

הקליניקה מצוידת בטכנולוגיות המתקדמות ביותר ומציעה מגוון רחב של טיפולים: הזרקות, בוטוקס, חומצה היאלורונית, ושיפור מרקם העור.`,
  brandColor: '#BCA48D',
  address: 'שדרות רוטשילד 45, תל אביב',
  phone: '03-555-1234',
  whatsapp: '050-1234567',
  instagram: '@drsarah_clinic',
  openingHours: {
    'א׳-ה׳': '09:00 - 19:00',
    'ו׳': '09:00 - 13:00',
  },
  services: ['1', '2', '3'],
  coverUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068',
  logoUrl: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=BCA48D&color=fff&size=128'
};

interface UseMyClinic {
  clinic: ClinicProfile | null;
  loading: boolean;
  error: string | null;
  fetchClinic: () => Promise<void>;
  updateClinic: (updates: Partial<ClinicProfile>) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook to fetch and manage the current user's clinic data.
 * Uses the clinic_id from the authenticated user's profile.
 * Falls back to mock data when Supabase is not configured.
 */
export function useMyClinic(): UseMyClinic {
  const { profile } = useAuth();
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinic = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Return mock data in dev mode
      setClinic(MOCK_MY_CLINIC);
      setLoading(false);
      return;
    }

    if (!profile?.clinic_id) {
      setLoading(false);
      setError('No clinic associated with user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', profile.clinic_id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Clinic not found');
          setClinic(null);
        } else {
          throw fetchError;
        }
        return;
      }

      // Transform database format (snake_case) to app format (camelCase)
      const transformedClinic: ClinicProfile = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        businessId: data.business_id || '',
        tagline: data.tagline || '',
        description: data.description || '',
        brandColor: data.brand_color || '#0D9488',
        address: data.address || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        facebook: data.facebook || '',
        openingHours: data.opening_hours || {},
        services: [],
        coverUrl: data.cover_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068',
        logoUrl: data.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D9488&color=fff&size=128`,
        googleMapsUrl: data.google_maps_url || '',
      };

      setClinic(transformedClinic);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch clinic');
      logger.error('Error fetching clinic:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const updateClinic = useCallback(async (updates: Partial<ClinicProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      // In mock mode, just update local state
      setClinic(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    }

    if (!profile?.clinic_id) {
      return { success: false, error: 'No clinic associated with user' };
    }

    try {
      // Transform app format (camelCase) to database format (snake_case)
      const dbUpdates: Record<string, unknown> = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.businessId !== undefined) dbUpdates.business_id = updates.businessId;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.brandColor !== undefined) dbUpdates.brand_color = updates.brandColor;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
      if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
      if (updates.facebook !== undefined) dbUpdates.facebook = updates.facebook;
      if (updates.openingHours !== undefined) dbUpdates.opening_hours = updates.openingHours;
      if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.googleMapsUrl !== undefined) dbUpdates.google_maps_url = updates.googleMapsUrl;

      dbUpdates.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('clinics')
        .update(dbUpdates)
        .eq('id', profile.clinic_id);

      if (updateError) throw updateError;

      // Update local state
      setClinic(prev => prev ? { ...prev, ...updates } : null);

      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to update clinic';
      logger.error('Error updating clinic:', err);
      return { success: false, error: errorMessage };
    }
  }, [profile?.clinic_id]);

  // Fetch clinic on mount or when profile changes
  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  return {
    clinic,
    loading,
    error,
    fetchClinic,
    updateClinic,
  };
}
