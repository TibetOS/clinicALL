import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Service } from '../types';
import { MOCK_SERVICES } from '../data';
import { createLogger } from '../lib/logger';
import { ServiceRow, ServiceRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useServices');

interface ServiceInput {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  isActive?: boolean;
}

interface UseServices {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  getService: (id: string) => Promise<Service | null>;
  addService: (service: ServiceInput) => Promise<Service | null>;
  updateService: (id: string, updates: Partial<ServiceInput>) => Promise<Service | null>;
  deleteService: (id: string) => Promise<boolean>;
  getServicesByCategory: (category: string) => Service[];
}

export function useServices(): UseServices {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchServices = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Return mock data in dev mode
      setServices(MOCK_SERVICES);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform database format to app format
      const transformedServices: Service[] = (data as ServiceRow[] || []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        duration: s.duration,
        price: s.price || 0,
        category: s.category,
        image: s.image ?? undefined,
      }));

      setServices(transformedServices);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch services');
      logger.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getService = useCallback(async (id: string): Promise<Service | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_SERVICES.find(s => s.id === id) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: data.price || 0,
        category: data.category,
        image: data.image_url ?? undefined,
      };
    } catch (err) {
      logger.error('Error fetching service:', err);
      return null;
    }
  }, []);

  const addService = useCallback(async (service: ServiceInput): Promise<Service | null> => {
    if (!isSupabaseConfigured()) {
      // Mock add for dev mode
      const newService: Service = {
        id: `mock-${Date.now()}`,
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        category: service.category,
        image: service.image,
      };
      setServices(prev => [...prev, newService]);
      return newService;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('services')
        .insert({
          clinic_id: profile?.clinic_id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          category: service.category,
          image_url: service.image,
          is_active: service.isActive !== false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newService: Service = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: data.price || 0,
        category: data.category,
        image: data.image_url ?? undefined,
      };

      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err) {
      logger.error('Error adding service:', err);
      setError(getErrorMessage(err) || 'Failed to add service');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateService = useCallback(async (id: string, updates: Partial<ServiceInput>): Promise<Service | null> => {
    if (!isSupabaseConfigured()) {
      // Mock update for dev mode
      setServices(prev => prev.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ));
      return services.find(s => s.id === id) || null;
    }

    try {
      const dbUpdates: ServiceRowUpdate & { is_active?: boolean; image_url?: string } = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { data, error: updateError } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedService: Service = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: data.price || 0,
        category: data.category,
        image: data.image_url ?? undefined,
      };

      setServices(prev => prev.map(s => s.id === id ? updatedService : s));
      return updatedService;
    } catch (err) {
      logger.error('Error updating service:', err);
      setError(getErrorMessage(err) || 'Failed to update service');
      return null;
    }
  }, [services]);

  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      // Mock delete for dev mode
      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    }

    try {
      // Soft delete by setting is_active to false
      const { error: deleteError } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting service:', err);
      setError(getErrorMessage(err) || 'Failed to delete service');
      return false;
    }
  }, []);

  const getServicesByCategory = useCallback((category: string): Service[] => {
    return services.filter(s => s.category === category);
  }, [services]);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    getService,
    addService,
    updateService,
    deleteService,
    getServicesByCategory,
  };
}
