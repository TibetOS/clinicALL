import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClinicProfile } from '../types';
import { createLogger } from '../lib/logger';
import { getErrorMessage } from '../lib/database.types';

const logger = createLogger('useClinic');

// Fallback mock profile for development
const MOCK_CLINIC: ClinicProfile = {
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

interface UseClinic {
  clinic: ClinicProfile | null;
  loading: boolean;
  error: string | null;
  fetchClinic: () => Promise<void>;
}

export function useClinic(slug: string | undefined): UseClinic {
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinic = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      // Return mock data in dev mode
      if (slug === 'dr-sarah' || slug === MOCK_CLINIC.slug) {
        setClinic(MOCK_CLINIC);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows found
          setError('Clinic not found');
          setClinic(null);
        } else {
          throw fetchError;
        }
        return;
      }

      // Transform database format to app format
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
        services: [], // Services are fetched separately
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
  }, [slug]);

  // Fetch clinic on mount or when slug changes
  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  return {
    clinic,
    loading,
    error,
    fetchClinic,
  };
}
