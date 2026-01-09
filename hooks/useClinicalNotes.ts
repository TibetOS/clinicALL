import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ClinicalNote, InjectionPoint } from '../types';
import { MOCK_CLINICAL_NOTES } from '../data';
import { createLogger } from '../lib/logger';

const logger = createLogger('useClinicalNotes');

interface ClinicalNoteInput {
  patientId: string;
  date?: string;
  providerName?: string;
  treatmentType?: string;
  notes?: string;
  injectionPoints?: InjectionPoint[];
  images?: string[];
}

interface UseClinicalNotesOptions {
  patientId?: string;
}

interface UseClinicalNotes {
  clinicalNotes: ClinicalNote[];
  loading: boolean;
  error: string | null;
  fetchClinicalNotes: (options?: UseClinicalNotesOptions) => Promise<void>;
  getClinicalNote: (id: string) => Promise<ClinicalNote | null>;
  addClinicalNote: (note: ClinicalNoteInput) => Promise<ClinicalNote | null>;
  updateClinicalNote: (id: string, updates: Partial<ClinicalNoteInput>) => Promise<ClinicalNote | null>;
  deleteClinicalNote: (id: string) => Promise<boolean>;
  getNotesByPatient: (patientId: string) => ClinicalNote[];
}

export function useClinicalNotes(options?: UseClinicalNotesOptions): UseClinicalNotes {
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchClinicalNotes = useCallback(async (fetchOptions?: UseClinicalNotesOptions) => {
    const opts = fetchOptions || options || {};

    if (!isSupabaseConfigured()) {
      let filtered = [...MOCK_CLINICAL_NOTES];
      if (opts.patientId) {
        filtered = filtered.filter(note => note.patientId === opts.patientId);
      }
      setClinicalNotes(filtered);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clinical_notes')
        .select('*')
        .order('date', { ascending: false });

      if (opts.patientId) {
        query = query.eq('patient_id', opts.patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedNotes: ClinicalNote[] = (data || []).map((note: any) => ({
        id: note.id,
        patientId: note.patient_id,
        date: note.date,
        providerName: note.provider_name || '',
        treatmentType: note.treatment_type || '',
        notes: note.notes || '',
        injectionPoints: note.injection_points || [],
        images: note.images || [],
      }));

      setClinicalNotes(transformedNotes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinical notes');
      logger.error('Error fetching clinical notes:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.patientId]);

  const getClinicalNote = useCallback(async (id: string): Promise<ClinicalNote | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_CLINICAL_NOTES.find(note => note.id === id) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        patientId: data.patient_id,
        date: data.date,
        providerName: data.provider_name || '',
        treatmentType: data.treatment_type || '',
        notes: data.notes || '',
        injectionPoints: data.injection_points || [],
        images: data.images || [],
      };
    } catch (err: any) {
      logger.error('Error fetching clinical note:', err);
      return null;
    }
  }, []);

  const addClinicalNote = useCallback(async (note: ClinicalNoteInput): Promise<ClinicalNote | null> => {
    if (!isSupabaseConfigured()) {
      const newNote: ClinicalNote = {
        id: `mock-${Date.now()}`,
        patientId: note.patientId || '',
        date: note.date ?? new Date().toISOString().split('T')[0] ?? '',
        providerName: note.providerName || '',
        treatmentType: note.treatmentType || '',
        notes: note.notes || '',
        injectionPoints: note.injectionPoints || [],
        images: note.images || [],
      };
      setClinicalNotes(prev => [newNote, ...prev]);
      return newNote;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('clinical_notes')
        .insert({
          clinic_id: profile?.clinic_id,
          patient_id: note.patientId || '',
          date: note.date || new Date().toISOString().split('T')[0],
          provider_name: note.providerName ?? null,
          treatment_type: note.treatmentType ?? null,
          notes: note.notes ?? null,
          injection_points: note.injectionPoints || [],
          images: note.images || [],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newNote: ClinicalNote = {
        id: data.id,
        patientId: data.patient_id,
        date: data.date,
        providerName: data.provider_name || '',
        treatmentType: data.treatment_type || '',
        notes: data.notes || '',
        injectionPoints: data.injection_points || [],
        images: data.images || [],
      };

      setClinicalNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err: any) {
      logger.error('Error adding clinical note:', err);
      setError(err.message || 'Failed to add clinical note');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateClinicalNote = useCallback(async (id: string, updates: Partial<ClinicalNoteInput>): Promise<ClinicalNote | null> => {
    if (!isSupabaseConfigured()) {
      setClinicalNotes(prev => prev.map(note =>
        note.id === id ? { ...note, ...updates } : note
      ));
      return clinicalNotes.find(note => note.id === id) || null;
    }

    try {
      const dbUpdates: any = {};
      if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.providerName !== undefined) dbUpdates.provider_name = updates.providerName;
      if (updates.treatmentType !== undefined) dbUpdates.treatment_type = updates.treatmentType;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.injectionPoints !== undefined) dbUpdates.injection_points = updates.injectionPoints;
      if (updates.images !== undefined) dbUpdates.images = updates.images;

      const { data, error: updateError } = await supabase
        .from('clinical_notes')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedNote: ClinicalNote = {
        id: data.id,
        patientId: data.patient_id,
        date: data.date,
        providerName: data.provider_name || '',
        treatmentType: data.treatment_type || '',
        notes: data.notes || '',
        injectionPoints: data.injection_points || [],
        images: data.images || [],
      };

      setClinicalNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      return updatedNote;
    } catch (err: any) {
      logger.error('Error updating clinical note:', err);
      setError(err.message || 'Failed to update clinical note');
      return null;
    }
  }, [clinicalNotes]);

  const deleteClinicalNote = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setClinicalNotes(prev => prev.filter(note => note.id !== id));
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('clinical_notes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setClinicalNotes(prev => prev.filter(note => note.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting clinical note:', err);
      setError(err.message || 'Failed to delete clinical note');
      return false;
    }
  }, []);

  const getNotesByPatient = useCallback((patientId: string): ClinicalNote[] => {
    return clinicalNotes.filter(note => note.patientId === patientId);
  }, [clinicalNotes]);

  useEffect(() => {
    fetchClinicalNotes();
  }, [fetchClinicalNotes]);

  return {
    clinicalNotes,
    loading,
    error,
    fetchClinicalNotes,
    getClinicalNote,
    addClinicalNote,
    updateClinicalNote,
    deleteClinicalNote,
    getNotesByPatient,
  };
}
