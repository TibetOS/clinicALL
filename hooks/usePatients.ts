import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Patient, RiskLevel } from '../types';
import { MOCK_PATIENTS } from '../data';
import { createLogger } from '../lib/logger';

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
}

interface UsePatients {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  addPatient: (patient: PatientInput) => Promise<Patient | null>;
  updatePatient: (id: string, updates: Partial<PatientInput>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
}

export function usePatients(): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchPatients = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Return mock data in dev mode
      setPatients(MOCK_PATIENTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform database format to app format
      const transformedPatients: Patient[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        phone: p.phone,
        avatar: p.avatar_url,
        riskLevel: p.risk_level || 'low',
        lastVisit: p.last_visit || '',
        upcomingAppointment: p.upcoming_appointment,
        memberSince: p.member_since || p.created_at,
        birthDate: p.birth_date,
        age: p.age,
        gender: p.gender,
        aestheticInterests: p.aesthetic_interests || [],
        skinType: p.skin_type,
      }));

      setPatients(transformedPatients);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
      logger.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_PATIENTS.find(p => p.id === id) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        avatar: data.avatar_url,
        riskLevel: data.risk_level || 'low',
        lastVisit: data.last_visit || '',
        upcomingAppointment: data.upcoming_appointment,
        memberSince: data.member_since || data.created_at,
        birthDate: data.birth_date,
        age: data.age,
        gender: data.gender,
        aestheticInterests: data.aesthetic_interests || [],
        skinType: data.skin_type,
      };
    } catch (err: any) {
      logger.error('Error fetching patient:', err);
      return null;
    }
  }, []);

  const addPatient = useCallback(async (patient: PatientInput): Promise<Patient | null> => {
    if (!isSupabaseConfigured()) {
      // Mock add for dev mode
      const newPatient: Patient = {
        id: `mock-${Date.now()}`,
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone,
        riskLevel: patient.riskLevel || 'low',
        lastVisit: '',
        memberSince: new Date().toISOString().split('T')[0],
        birthDate: patient.birthDate,
        age: patient.age,
        gender: patient.gender,
        aestheticInterests: patient.aestheticInterests,
        skinType: patient.skinType,
      };
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('patients')
        .insert({
          clinic_id: profile?.clinic_id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          risk_level: patient.riskLevel || 'low',
          birth_date: patient.birthDate,
          age: patient.age,
          gender: patient.gender,
          aesthetic_interests: patient.aestheticInterests,
          skin_type: patient.skinType,
          member_since: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newPatient: Patient = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        riskLevel: data.risk_level || 'low',
        lastVisit: '',
        memberSince: data.member_since,
        birthDate: data.birth_date,
        age: data.age,
        gender: data.gender,
        aestheticInterests: data.aesthetic_interests || [],
        skinType: data.skin_type,
      };

      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err: any) {
      logger.error('Error adding patient:', err);
      setError(err.message || 'Failed to add patient');
      return null;
    }
  }, [profile?.clinic_id]);

  const updatePatient = useCallback(async (id: string, updates: Partial<PatientInput>): Promise<Patient | null> => {
    if (!isSupabaseConfigured()) {
      // Mock update for dev mode
      setPatients(prev => prev.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ));
      return patients.find(p => p.id === id) || null;
    }

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.riskLevel !== undefined) dbUpdates.risk_level = updates.riskLevel;
      if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
      if (updates.age !== undefined) dbUpdates.age = updates.age;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.aestheticInterests !== undefined) dbUpdates.aesthetic_interests = updates.aestheticInterests;
      if (updates.skinType !== undefined) dbUpdates.skin_type = updates.skinType;

      const { data, error: updateError } = await supabase
        .from('patients')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedPatient: Patient = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        riskLevel: data.risk_level || 'low',
        lastVisit: data.last_visit || '',
        memberSince: data.member_since,
        birthDate: data.birth_date,
        age: data.age,
        gender: data.gender,
        aestheticInterests: data.aesthetic_interests || [],
        skinType: data.skin_type,
      };

      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      return updatedPatient;
    } catch (err: any) {
      logger.error('Error updating patient:', err);
      setError(err.message || 'Failed to update patient');
      return null;
    }
  }, [patients]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      // Mock delete for dev mode
      setPatients(prev => prev.filter(p => p.id !== id));
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPatients(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting patient:', err);
      setError(err.message || 'Failed to delete patient');
      return false;
    }
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
  };
}
