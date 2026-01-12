import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Declaration } from '../types';
import { MOCK_DECLARATIONS } from '../data';
import { createLogger } from '../lib/logger';
import { DeclarationRow, DeclarationRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useDeclarations');

interface DeclarationInput {
  patientId: string;
  patientName: string;
  status?: 'pending' | 'reviewed' | 'signed';
  formData: Declaration['formData'];
}

interface UseDeclarationsOptions {
  patientId?: string;
}

interface UseDeclarations {
  declarations: Declaration[];
  loading: boolean;
  error: string | null;
  fetchDeclarations: (options?: UseDeclarationsOptions) => Promise<void>;
  getDeclaration: (id: string) => Promise<Declaration | null>;
  addDeclaration: (declaration: DeclarationInput) => Promise<Declaration | null>;
  updateDeclaration: (id: string, updates: Partial<DeclarationInput>) => Promise<Declaration | null>;
  deleteDeclaration: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: Declaration['status']) => Promise<boolean>;
  getDeclarationsByPatient: (patientId: string) => Declaration[];
}

// Transform database row to app format
function transformDeclarationRow(dec: DeclarationRow): Declaration {
  return {
    id: dec.id,
    patientId: dec.patient_id,
    patientName: dec.patient_name,
    submittedAt: dec.submitted_at,
    status: dec.status || 'pending',
    formData: dec.form_data || {
      personalInfo: { firstName: '', lastName: '', phone: '', gender: '' },
      medicalHistory: { conditions: [], medications: '' },
      signature: ''
    },
  };
}

export function useDeclarations(options?: UseDeclarationsOptions): UseDeclarations {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchDeclarations = useCallback(async (fetchOptions?: UseDeclarationsOptions) => {
    const opts = fetchOptions || options || {};

    if (!isSupabaseConfigured()) {
      let filtered = [...MOCK_DECLARATIONS];
      if (opts.patientId) {
        filtered = filtered.filter(dec => dec.patientId === opts.patientId);
      }
      setDeclarations(filtered);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('declarations')
        .select('*')
        .order('submitted_at', { ascending: false });

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      if (opts.patientId) {
        query = query.eq('patient_id', opts.patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedDeclarations: Declaration[] = (data as DeclarationRow[] || []).map(transformDeclarationRow);

      setDeclarations(transformedDeclarations);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch declarations');
      logger.error('Error fetching declarations:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.patientId, profile?.clinic_id]);

  const getDeclaration = useCallback(async (id: string): Promise<Declaration | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_DECLARATIONS.find(dec => dec.id === id) || null;
    }

    try {
      let query = supabase
        .from('declarations')
        .select('*')
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;

      return transformDeclarationRow(data as DeclarationRow);
    } catch (err) {
      logger.error('Error fetching declaration:', err);
      return null;
    }
  }, [profile?.clinic_id]);

  const addDeclaration = useCallback(async (declaration: DeclarationInput): Promise<Declaration | null> => {
    if (!isSupabaseConfigured()) {
      const newDeclaration: Declaration = {
        id: `mock-${Date.now()}`,
        patientId: declaration.patientId,
        patientName: declaration.patientName,
        submittedAt: new Date().toISOString(),
        status: declaration.status || 'pending',
        formData: declaration.formData,
      };
      setDeclarations(prev => [newDeclaration, ...prev]);
      return newDeclaration;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('declarations')
        .insert({
          clinic_id: profile?.clinic_id,
          patient_id: declaration.patientId,
          patient_name: declaration.patientName,
          status: declaration.status || 'pending',
          form_data: declaration.formData,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newDeclaration = transformDeclarationRow(data as DeclarationRow);
      setDeclarations(prev => [newDeclaration, ...prev]);
      return newDeclaration;
    } catch (err) {
      logger.error('Error adding declaration:', err);
      setError(getErrorMessage(err) || 'Failed to add declaration');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateDeclaration = useCallback(async (id: string, updates: Partial<DeclarationInput>): Promise<Declaration | null> => {
    if (!isSupabaseConfigured()) {
      setDeclarations(prev => prev.map(dec =>
        dec.id === id ? { ...dec, ...updates } : dec
      ));
      return declarations.find(dec => dec.id === id) || null;
    }

    try {
      const dbUpdates: DeclarationRowUpdate = {};
      if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
      if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.formData !== undefined) dbUpdates.form_data = updates.formData;

      let query = supabase
        .from('declarations')
        .update(dbUpdates)
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select().single();

      if (updateError) throw updateError;

      const updatedDeclaration = transformDeclarationRow(data as DeclarationRow);
      setDeclarations(prev => prev.map(dec => dec.id === id ? updatedDeclaration : dec));
      return updatedDeclaration;
    } catch (err) {
      logger.error('Error updating declaration:', err);
      setError(getErrorMessage(err) || 'Failed to update declaration');
      return null;
    }
  }, [declarations, profile?.clinic_id]);

  const updateStatus = useCallback(async (id: string, status: Declaration['status']): Promise<boolean> => {
    const result = await updateDeclaration(id, { status });
    return result !== null;
  }, [updateDeclaration]);

  const deleteDeclaration = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setDeclarations(prev => prev.filter(dec => dec.id !== id));
      return true;
    }

    try {
      let query = supabase
        .from('declarations')
        .delete()
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setDeclarations(prev => prev.filter(dec => dec.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting declaration:', err);
      setError(getErrorMessage(err) || 'Failed to delete declaration');
      return false;
    }
  }, [profile?.clinic_id]);

  const getDeclarationsByPatient = useCallback((patientId: string): Declaration[] => {
    return declarations.filter(dec => dec.patientId === patientId);
  }, [declarations]);

  useEffect(() => {
    fetchDeclarations();
  }, [fetchDeclarations]);

  return {
    declarations,
    loading,
    error,
    fetchDeclarations,
    getDeclaration,
    addDeclaration,
    updateDeclaration,
    deleteDeclaration,
    updateStatus,
    getDeclarationsByPatient,
  };
}
