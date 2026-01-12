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
  fetchServices: (includeInactive?: boolean) => Promise<void>;
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

  const fetchServices = useCallback(async (includeInactive = false) => {
    if (!isSupabaseConfigured()) {
      // Return mock data in dev mode (add isActive: true to mock services)
      const mockWithActive = MOCK_SERVICES.map(s => ({ ...s, isActive: true }));
      setServices(mockWithActive);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

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
        isActive: s.is_active,
      }));

      setServices(transformedServices);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch services');
      logger.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const getService = useCallback(async (id: string): Promise<Service | null> => {
    if (!isSupabaseConfigured()) {
      const mock = MOCK_SERVICES.find(s => s.id === id);
      return mock ? { ...mock, isActive: true } : null;
    }

    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: data.price || 0,
        category: data.category,
        image: data.image ?? undefined,
        isActive: data.is_active,
      };
    } catch (err) {
      logger.error('Error fetching service:', err);
      return null;
    }
  }, [profile?.clinic_id]);

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
        isActive: service.isActive !== false,
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
          image: service.image,
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
        image: data.image ?? undefined,
        isActive: data.is_active,
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
      let updatedService: Service | null = null;
      setServices(prev => prev.map(s => {
        if (s.id === id) {
          updatedService = { ...s, ...updates, isActive: updates.isActive ?? s.isActive };
          return updatedService;
        }
        return s;
      }));
      return updatedService;
    }

    try {
      const dbUpdates: ServiceRowUpdate = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      let query = supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select().single();

      if (updateError) throw updateError;

      const updatedService: Service = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: data.price || 0,
        category: data.category,
        image: data.image ?? undefined,
        isActive: data.is_active,
      };

      setServices(prev => prev.map(s => s.id === id ? updatedService : s));
      return updatedService;
    } catch (err) {
      logger.error('Error updating service:', err);
      setError(getErrorMessage(err) || 'Failed to update service');
      return null;
    }
  }, [profile?.clinic_id]);

  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      // Mock delete for dev mode
      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    }

    try {
      // Soft delete by setting is_active to false
      let query = supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting service:', err);
      setError(getErrorMessage(err) || 'Failed to delete service');
      return false;
    }
  }, [profile?.clinic_id]);

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
