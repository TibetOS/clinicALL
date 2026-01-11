import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StaffMember } from '../types';
import { createLogger } from '../lib/logger';
import { UserRow, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useStaff');

interface UseStaff {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  getStaffMember: (id: string) => StaffMember | undefined;
}

export function useStaff(clinicId?: string): UseStaff {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // No mock data - Supabase must be configured for public pages
      setLoading(false);
      setError('Database not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('users')
        .select('id, full_name, role, avatar_url, clinic_id')
        .in('role', ['owner', 'admin']);

      // Filter by clinic if provided
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform database format to app format
      interface StaffRow {
        id: string;
        full_name: string | null;
        role: string;
        avatar_url: string | null;
        clinic_id: string;
      }
      const transformedStaff: StaffMember[] = (data as StaffRow[] || []).map((user) => ({
        id: user.id,
        name: user.full_name || 'צוות',
        role: getRoleLabel(user.role),
        avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'Staff')}&background=0D9488&color=fff`,
      }));

      setStaff(transformedStaff);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch staff');
      logger.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  const getStaffMember = useCallback((id: string): StaffMember | undefined => {
    return staff.find(s => s.id === id);
  }, [staff]);

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    getStaffMember,
  };
}

// Helper to translate role to Hebrew
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'בעלים',
    admin: 'מנהל/ת',
  };
  return labels[role] || role;
}
