import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StaffMember } from '../types';

// Fallback mock staff for development
const MOCK_STAFF: StaffMember[] = [
  { id: '1', name: 'ד״ר שרה כהן', role: 'רופאה', avatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=0D9488&color=fff' },
  { id: '2', name: 'רונית לוי', role: 'קוסמטיקאית', avatar: 'https://ui-avatars.com/api/?name=Ronit+Levi&background=0D9488&color=fff' },
];

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
      // Return mock data in dev mode
      setStaff(MOCK_STAFF);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('users')
        .select('id, full_name, role, avatar_url, clinic_id')
        .in('role', ['owner', 'admin', 'staff']);

      // Filter by clinic if provided
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform database format to app format
      const transformedStaff: StaffMember[] = (data || []).map((user: any) => ({
        id: user.id,
        name: user.full_name || 'צוות',
        role: getRoleLabel(user.role),
        avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'Staff')}&background=0D9488&color=fff`,
      }));

      // If no staff found, return mock data
      if (transformedStaff.length === 0) {
        setStaff(MOCK_STAFF);
      } else {
        setStaff(transformedStaff);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
      console.error('Error fetching staff:', err);
      // Fallback to mock data on error
      setStaff(MOCK_STAFF);
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
    staff: 'צוות',
  };
  return labels[role] || role;
}
