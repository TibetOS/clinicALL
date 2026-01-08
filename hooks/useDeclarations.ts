import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Declaration } from '../types';
import { MOCK_DECLARATIONS } from '../data';
import { createLogger } from '../lib/logger';

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

      if (opts.patientId) {
        query = query.eq('patient_id', opts.patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedDeclarations: Declaration[] = (data || []).map((dec: any) => ({
        id: dec.id,
        patientId: dec.patient_id,
        patientName: dec.patient_name,
        submittedAt: dec.submitted_at,
        status: dec.status || 'pending',
        formData: dec.form_data || {},
      }));

      setDeclarations(transformedDeclarations);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch declarations');
      logger.error('Error fetching declarations:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.patientId]);

  const getDeclaration = useCallback(async (id: string): Promise<Declaration | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_DECLARATIONS.find(dec => dec.id === id) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('declarations')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        submittedAt: data.submitted_at,
        status: data.status || 'pending',
        formData: data.form_data || {},
      };
    } catch (err: any) {
      logger.error('Error fetching declaration:', err);
      return null;
    }
  }, []);

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

      const newDeclaration: Declaration = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        submittedAt: data.submitted_at,
        status: data.status || 'pending',
        formData: data.form_data || {},
      };

      setDeclarations(prev => [newDeclaration, ...prev]);
      return newDeclaration;
    } catch (err: any) {
      logger.error('Error adding declaration:', err);
      setError(err.message || 'Failed to add declaration');
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
      const dbUpdates: any = {};
      if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
      if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.formData !== undefined) dbUpdates.form_data = updates.formData;

      const { data, error: updateError } = await supabase
        .from('declarations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedDeclaration: Declaration = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        submittedAt: data.submitted_at,
        status: data.status || 'pending',
        formData: data.form_data || {},
      };

      setDeclarations(prev => prev.map(dec => dec.id === id ? updatedDeclaration : dec));
      return updatedDeclaration;
    } catch (err: any) {
      logger.error('Error updating declaration:', err);
      setError(err.message || 'Failed to update declaration');
      return null;
    }
  }, [declarations]);

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
      const { error: deleteError } = await supabase
        .from('declarations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setDeclarations(prev => prev.filter(dec => dec.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting declaration:', err);
      setError(err.message || 'Failed to delete declaration');
      return false;
    }
  }, []);

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
