import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Lead, LeadStage } from '../types';
import { createLogger } from '../lib/logger';
import { LeadRow, LeadRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useLeads');

interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  stage?: LeadStage;
  notes?: string;
  value?: number;
}

interface UseLeads {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  getLead: (id: string) => Promise<Lead | null>;
  addLead: (lead: LeadInput) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<LeadInput>) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<boolean>;
  updateStage: (id: string, stage: LeadStage) => Promise<boolean>;
  getLeadsByStage: (stage: LeadStage) => Lead[];
}

export function useLeads(): UseLeads {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedLeads: Lead[] = (data as LeadRow[] || []).map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? undefined,
        source: lead.source || '',
        stage: lead.stage || 'new',
        notes: lead.notes ?? undefined,
        value: lead.value ?? undefined,
        createdAt: lead.created_at,
      }));

      setLeads(transformedLeads);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch leads');
      logger.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLead = useCallback(async (id: string): Promise<Lead | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source || '',
        stage: data.stage || 'new',
        notes: data.notes,
        value: data.value ?? undefined,
        createdAt: data.created_at,
      };
    } catch (err) {
      logger.error('Error fetching lead:', err);
      return null;
    }
  }, []);

  const addLead = useCallback(async (lead: LeadInput): Promise<Lead | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('leads')
        .insert({
          clinic_id: profile?.clinic_id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          stage: lead.stage || 'new',
          notes: lead.notes,
          value: lead.value,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newLead: Lead = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source || '',
        stage: data.stage || 'new',
        notes: data.notes,
        value: data.value ?? undefined,
        createdAt: data.created_at,
      };

      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      logger.error('Error adding lead:', err);
      setError(getErrorMessage(err) || 'Failed to add lead');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateLead = useCallback(async (id: string, updates: Partial<LeadInput>): Promise<Lead | null> => {
    try {
      const dbUpdates: LeadRowUpdate = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.value !== undefined) dbUpdates.value = updates.value;

      const { data, error: updateError } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedLead: Lead = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source || '',
        stage: data.stage || 'new',
        notes: data.notes,
        value: data.value ?? undefined,
        createdAt: data.created_at,
      };

      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      return updatedLead;
    } catch (err) {
      logger.error('Error updating lead:', err);
      setError(getErrorMessage(err) || 'Failed to update lead');
      return null;
    }
  }, [leads]);

  const updateStage = useCallback(async (id: string, stage: LeadStage): Promise<boolean> => {
    const result = await updateLead(id, { stage });
    return result !== null;
  }, [updateLead]);

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setLeads(prev => prev.filter(lead => lead.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting lead:', err);
      setError(getErrorMessage(err) || 'Failed to delete lead');
      return false;
    }
  }, []);

  const getLeadsByStage = useCallback((stage: LeadStage): Lead[] => {
    return leads.filter(lead => lead.stage === stage);
  }, [leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    getLead,
    addLead,
    updateLead,
    deleteLead,
    updateStage,
    getLeadsByStage,
  };
}
