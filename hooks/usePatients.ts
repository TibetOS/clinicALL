import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Patient, RiskLevel, DeclarationStatus } from '../types';
import { createLogger } from '../lib/logger';
import { PatientRow, PatientRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('usePatients');

interface PatientInput {
  name: string;
  email?: string;
  phone: string;
  riskLevel?: RiskLevel;
  birthDate?: string;
  age?: number;
  gender?: string;
  aestheticInterests?: string[];
  skinType?: string;
  // Health declaration fields
  lastDeclarationDate?: string;
  declarationStatus?: DeclarationStatus;
  pendingDeclarationToken?: string;
}

const ITEMS_PER_PAGE = 50;

interface PaginationState {
  page: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsePatients {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchPatients: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  getPatient: (id: string) => Promise<Patient | null>;
  addPatient: (patient: PatientInput) => Promise<Patient | null>;
  updatePatient: (id: string, updates: Partial<PatientInput>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
}

// Transform database row to app format
function transformPatientRow(p: PatientRow): Patient {
  return {
    id: p.id,
    name: p.name,
    email: p.email || '',
    phone: p.phone,
    avatar: p.avatar_url ?? undefined,
    riskLevel: p.risk_level || 'low',
    lastVisit: p.last_visit || '',
    upcomingAppointment: p.upcoming_appointment ?? undefined,
    memberSince: p.member_since || p.created_at,
    birthDate: p.birth_date ?? undefined,
    age: p.age ?? undefined,
    gender: p.gender ?? undefined,
    aestheticInterests: p.aesthetic_interests || [],
    skinType: p.skin_type ?? undefined,
    // Health declaration fields
    lastDeclarationDate: p.last_declaration_date ?? undefined,
    declarationStatus: p.declaration_status ?? undefined,
    pendingDeclarationToken: p.pending_declaration_token ?? undefined,
  };
}

export function usePatients(): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { profile } = useAuth();

  const pagination: PaginationState = {
    page,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    hasNextPage: page < Math.ceil(totalCount / ITEMS_PER_PAGE),
    hasPrevPage: page > 1,
  };

  const fetchPatients = useCallback(async (requestedPage?: number) => {
    const targetPage = requestedPage ?? page;

    setLoading(true);
    setError(null);

    try {
      // Build query with count
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      // Add pagination range
      const from = (targetPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform database format to app format
      const transformedPatients: Patient[] = (data as PatientRow[] || []).map(transformPatientRow);

      setPatients(transformedPatients);
      setTotalCount(count ?? 0);
      setPage(targetPage);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch patients');
      logger.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id, page]);

  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;

      return transformPatientRow(data as PatientRow);
    } catch (err) {
      logger.error('Error fetching patient:', err);
      return null;
    }
  }, [profile?.clinic_id]);

  const addPatient = useCallback(async (patient: PatientInput): Promise<Patient | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('patients')
        .insert({
          clinic_id: profile?.clinic_id,
          name: patient.name,
          email: patient.email ?? null,
          phone: patient.phone,
          risk_level: patient.riskLevel || 'low',
          birth_date: patient.birthDate ?? null,
          age: patient.age ?? null,
          gender: patient.gender ?? null,
          aesthetic_interests: patient.aestheticInterests ?? null,
          skin_type: patient.skinType ?? null,
          member_since: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newPatient = transformPatientRow(data as PatientRow);
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err) {
      logger.error('Error adding patient:', err);
      setError(getErrorMessage(err) || 'Failed to add patient');
      return null;
    }
  }, [profile?.clinic_id]);

  const updatePatient = useCallback(async (id: string, updates: Partial<PatientInput>): Promise<Patient | null> => {
    try {
      const dbUpdates: PatientRowUpdate = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.riskLevel !== undefined) dbUpdates.risk_level = updates.riskLevel;
      if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
      if (updates.age !== undefined) dbUpdates.age = updates.age;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.aestheticInterests !== undefined) dbUpdates.aesthetic_interests = updates.aestheticInterests;
      if (updates.skinType !== undefined) dbUpdates.skin_type = updates.skinType;
      // Health declaration fields
      if (updates.lastDeclarationDate !== undefined) dbUpdates.last_declaration_date = updates.lastDeclarationDate;
      if (updates.declarationStatus !== undefined) dbUpdates.declaration_status = updates.declarationStatus;
      if (updates.pendingDeclarationToken !== undefined) dbUpdates.pending_declaration_token = updates.pendingDeclarationToken;

      // SECURITY: Filter by clinic_id to ensure multi-tenant isolation
      let query = supabase
        .from('patients')
        .update(dbUpdates)
        .eq('id', id);

      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select().single();

      if (updateError) throw updateError;

      const updatedPatient = transformPatientRow(data as PatientRow);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      logger.error('Error updating patient:', err);
      setError(getErrorMessage(err) || 'Failed to update patient');
      return null;
    }
  }, [patients, profile?.clinic_id]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      // SECURITY: Filter by clinic_id to ensure multi-tenant isolation
      let query = supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setPatients(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting patient:', err);
      setError(getErrorMessage(err) || 'Failed to delete patient');
      return false;
    }
  }, [profile?.clinic_id]);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    pagination,
    fetchPatients,
    setPage: (newPage: number) => fetchPatients(newPage),
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
  };
}
