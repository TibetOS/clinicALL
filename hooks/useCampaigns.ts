import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Campaign } from '../types';
import { MOCK_CAMPAIGNS } from '../data';
import { createLogger } from '../lib/logger';

const logger = createLogger('useCampaigns');

interface CampaignInput {
  name: string;
  type: 'sms' | 'whatsapp' | 'email';
  status?: 'draft' | 'scheduled' | 'active' | 'completed';
  audience?: string;
  sentCount?: number;
  openRate?: number;
  scheduledDate?: string;
}

interface UseCampaigns {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  getCampaign: (id: string) => Promise<Campaign | null>;
  addCampaign: (campaign: CampaignInput) => Promise<Campaign | null>;
  updateCampaign: (id: string, updates: Partial<CampaignInput>) => Promise<Campaign | null>;
  deleteCampaign: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: Campaign['status']) => Promise<boolean>;
}

export function useCampaigns(): UseCampaigns {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchCampaigns = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCampaigns(MOCK_CAMPAIGNS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedCampaigns: Campaign[] = (data || []).map((camp: any) => ({
        id: camp.id,
        name: camp.name,
        type: camp.type,
        status: camp.status || 'draft',
        audience: camp.audience || '',
        sentCount: camp.sent_count || 0,
        openRate: camp.open_rate ? parseFloat(camp.open_rate) : undefined,
        scheduledDate: camp.scheduled_date,
      }));

      setCampaigns(transformedCampaigns);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
      logger.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_CAMPAIGNS.find(camp => camp.id === id) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        status: data.status || 'draft',
        audience: data.audience || '',
        sentCount: data.sent_count || 0,
        openRate: data.open_rate ? parseFloat(data.open_rate) : undefined,
        scheduledDate: data.scheduled_date,
      };
    } catch (err: any) {
      logger.error('Error fetching campaign:', err);
      return null;
    }
  }, []);

  const addCampaign = useCallback(async (campaign: CampaignInput): Promise<Campaign | null> => {
    if (!isSupabaseConfigured()) {
      const newCampaign: Campaign = {
        id: `mock-${Date.now()}`,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status || 'draft',
        audience: campaign.audience || '',
        sentCount: campaign.sentCount || 0,
        openRate: campaign.openRate,
        scheduledDate: campaign.scheduledDate,
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          clinic_id: profile?.clinic_id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status || 'draft',
          audience: campaign.audience,
          sent_count: campaign.sentCount || 0,
          open_rate: campaign.openRate,
          scheduled_date: campaign.scheduledDate,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newCampaign: Campaign = {
        id: data.id,
        name: data.name,
        type: data.type,
        status: data.status || 'draft',
        audience: data.audience || '',
        sentCount: data.sent_count || 0,
        openRate: data.open_rate ? parseFloat(data.open_rate) : undefined,
        scheduledDate: data.scheduled_date,
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err: any) {
      logger.error('Error adding campaign:', err);
      setError(err.message || 'Failed to add campaign');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<CampaignInput>): Promise<Campaign | null> => {
    if (!isSupabaseConfigured()) {
      setCampaigns(prev => prev.map(camp =>
        camp.id === id ? { ...camp, ...updates } : camp
      ));
      return campaigns.find(camp => camp.id === id) || null;
    }

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.audience !== undefined) dbUpdates.audience = updates.audience;
      if (updates.sentCount !== undefined) dbUpdates.sent_count = updates.sentCount;
      if (updates.openRate !== undefined) dbUpdates.open_rate = updates.openRate;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;

      const { data, error: updateError } = await supabase
        .from('campaigns')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedCampaign: Campaign = {
        id: data.id,
        name: data.name,
        type: data.type,
        status: data.status || 'draft',
        audience: data.audience || '',
        sentCount: data.sent_count || 0,
        openRate: data.open_rate ? parseFloat(data.open_rate) : undefined,
        scheduledDate: data.scheduled_date,
      };

      setCampaigns(prev => prev.map(camp => camp.id === id ? updatedCampaign : camp));
      return updatedCampaign;
    } catch (err: any) {
      logger.error('Error updating campaign:', err);
      setError(err.message || 'Failed to update campaign');
      return null;
    }
  }, [campaigns]);

  const updateStatus = useCallback(async (id: string, status: Campaign['status']): Promise<boolean> => {
    const result = await updateCampaign(id, { status });
    return result !== null;
  }, [updateCampaign]);

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setCampaigns(prev => prev.filter(camp => camp.id !== id));
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCampaigns(prev => prev.filter(camp => camp.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting campaign:', err);
      setError(err.message || 'Failed to delete campaign');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    getCampaign,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updateStatus,
  };
}
