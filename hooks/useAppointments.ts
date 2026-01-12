import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, AppointmentStatus, AppointmentDeclarationStatus, RecurrencePattern } from '../types';
import { createLogger } from '../lib/logger';
import { AppointmentRow, AppointmentRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useAppointments');

interface AppointmentInput {
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  status?: AppointmentStatus;
  notes?: string;
}

interface UseAppointmentsOptions {
  startDate?: string;
  endDate?: string;
  patientId?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE_SIZE = 100;

interface UseAppointments {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  page: number;
  totalCount: number;
  hasMore: boolean;
  fetchAppointments: (options?: UseAppointmentsOptions) => Promise<void>;
  setPage: (page: number) => void;
  getAppointment: (id: string) => Promise<Appointment | null>;
  addAppointment: (appointment: AppointmentInput) => Promise<Appointment | null>;
  addRecurringAppointment: (appointment: AppointmentInput, recurrence: RecurrencePattern) => Promise<Appointment[]>;
  updateAppointment: (id: string, updates: Partial<AppointmentInput>) => Promise<Appointment | null>;
  deleteAppointment: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<boolean>;
}

export function useAppointments(options?: UseAppointmentsOptions): UseAppointments {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { profile } = useAuth();

  const fetchAppointments = useCallback(async (fetchOptions?: UseAppointmentsOptions) => {
    const opts = fetchOptions || options || {};
    const currentPage = opts.page ?? page;
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      if (opts.patientId) {
        query = query.eq('patient_id', opts.patientId);
      }
      if (opts.startDate) {
        query = query.gte('date', opts.startDate);
      }
      if (opts.endDate) {
        query = query.lte('date', opts.endDate);
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * limit;
      query = query.range(startIndex, startIndex + limit - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform database format to app format
      const transformedAppointments: Appointment[] = (data as AppointmentRow[] || []).map((a) => ({
        id: a.id,
        patientId: a.patient_id,
        patientName: a.patient_name || '',
        serviceId: a.service_id,
        serviceName: a.service_name || '',
        date: a.date,
        time: a.time,
        duration: a.duration,
        status: a.status || 'pending',
        notes: a.notes ?? undefined,
        declarationStatus: a.declaration_status ?? undefined,
        declarationTokenId: a.declaration_token_id ?? undefined,
      }));

      setTotalCount(count ?? 0);
      setAppointments(transformedAppointments);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch appointments');
      logger.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id, options?.startDate, options?.endDate, options?.patientId, page]);

  const getAppointment = useCallback(async (id: string): Promise<Appointment | null> => {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name || '',
        serviceId: data.service_id,
        serviceName: data.service_name || '',
        date: data.date,
        time: data.time,
        duration: data.duration,
        status: data.status || 'pending',
        notes: data.notes ?? undefined,
        declarationStatus: data.declaration_status ?? undefined,
        declarationTokenId: data.declaration_token_id ?? undefined,
      };
    } catch (err) {
      logger.error('Error fetching appointment:', err);
      return null;
    }
  }, [profile?.clinic_id]);

  const addAppointment = useCallback(async (appointment: AppointmentInput): Promise<Appointment | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({
          clinic_id: profile?.clinic_id,
          patient_id: appointment.patientId,
          patient_name: appointment.patientName,
          service_id: appointment.serviceId,
          service_name: appointment.serviceName,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          status: appointment.status || 'pending',
          notes: appointment.notes,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name || appointment.patientName,
        serviceId: data.service_id,
        serviceName: data.service_name || appointment.serviceName,
        date: data.date,
        time: data.time,
        duration: data.duration,
        status: data.status || 'pending',
        notes: data.notes ?? undefined,
        declarationStatus: data.declaration_status ?? undefined,
        declarationTokenId: data.declaration_token_id ?? undefined,
      };

      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      logger.error('Error adding appointment:', err);
      setError(getErrorMessage(err) || 'Failed to add appointment');
      return null;
    }
  }, [profile?.clinic_id]);

  // Calculate recurring appointment dates
  const calculateRecurringDates = useCallback((
    startDate: string,
    recurrence: RecurrencePattern
  ): string[] => {
    const dates: string[] = [startDate];
    const start = new Date(startDate);

    // Determine number of occurrences
    let maxOccurrences = recurrence.count || 52; // Default max 1 year of weekly
    if (recurrence.endDate) {
      const end = new Date(recurrence.endDate);
      // Calculate approximate number based on pattern
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      switch (recurrence.type) {
        case 'weekly':
          maxOccurrences = Math.floor(daysDiff / 7) + 1;
          break;
        case 'biweekly':
          maxOccurrences = Math.floor(daysDiff / 14) + 1;
          break;
        case 'monthly':
          maxOccurrences = Math.floor(daysDiff / 30) + 1;
          break;
      }
    }

    // Generate dates based on pattern
    for (let i = 1; i < maxOccurrences; i++) {
      const nextDate = new Date(start);
      switch (recurrence.type) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (7 * i));
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + (14 * i));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + i);
          break;
      }

      // Check if we've passed the end date
      if (recurrence.endDate && nextDate > new Date(recurrence.endDate)) {
        break;
      }

      dates.push(nextDate.toISOString().split('T')[0]!);
    }

    return dates;
  }, []);

  const addRecurringAppointment = useCallback(async (
    appointment: AppointmentInput,
    recurrence: RecurrencePattern
  ): Promise<Appointment[]> => {
    if (recurrence.type === 'none') {
      const result = await addAppointment(appointment);
      return result ? [result] : [];
    }

    const dates = calculateRecurringDates(appointment.date, recurrence);
    const createdAppointments: Appointment[] = [];

    try {
      // Create all appointments in a batch
      const appointmentsToCreate = dates.map(date => ({
        clinic_id: profile?.clinic_id,
        patient_id: appointment.patientId,
        patient_name: appointment.patientName,
        service_id: appointment.serviceId,
        service_name: appointment.serviceName,
        date,
        time: appointment.time,
        duration: appointment.duration,
        status: appointment.status || 'pending',
        notes: appointment.notes,
      }));

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert(appointmentsToCreate)
        .select('*');

      if (insertError) throw insertError;

      const transformedAppointments: Appointment[] = (data as AppointmentRow[] || []).map((a) => ({
        id: a.id,
        patientId: a.patient_id,
        patientName: a.patient_name || '',
        serviceId: a.service_id,
        serviceName: a.service_name || '',
        date: a.date,
        time: a.time,
        duration: a.duration,
        status: a.status || 'pending',
        notes: a.notes ?? undefined,
        declarationStatus: a.declaration_status ?? undefined,
        declarationTokenId: a.declaration_token_id ?? undefined,
      }));

      setAppointments(prev => [...prev, ...transformedAppointments]);
      return transformedAppointments;
    } catch (err) {
      logger.error('Error adding recurring appointments:', err);
      setError(getErrorMessage(err) || 'Failed to add recurring appointments');
      return createdAppointments;
    }
  }, [profile?.clinic_id, addAppointment, calculateRecurringDates]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<AppointmentInput>): Promise<Appointment | null> => {
    try {
      const dbUpdates: AppointmentRowUpdate = {};
      if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
      if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
      if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
      if (updates.serviceName !== undefined) dbUpdates.service_name = updates.serviceName;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      let query = supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select('*').single();

      if (updateError) throw updateError;

      const updatedAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name || '',
        serviceId: data.service_id,
        serviceName: data.service_name || '',
        date: data.date,
        time: data.time,
        duration: data.duration,
        status: data.status || 'pending',
        notes: data.notes ?? undefined,
        declarationStatus: data.declaration_status ?? undefined,
        declarationTokenId: data.declaration_token_id ?? undefined,
      };

      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return updatedAppointment;
    } catch (err) {
      logger.error('Error updating appointment:', err);
      setError(getErrorMessage(err) || 'Failed to update appointment');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateStatus = useCallback(async (id: string, status: AppointmentStatus): Promise<boolean> => {
    const result = await updateAppointment(id, { status });
    return result !== null;
  }, [updateAppointment]);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      let query = supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting appointment:', err);
      setError(getErrorMessage(err) || 'Failed to delete appointment');
      return false;
    }
  }, [profile?.clinic_id]);

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const hasMore = page * DEFAULT_PAGE_SIZE < totalCount;

  return {
    appointments,
    loading,
    error,
    page,
    totalCount,
    hasMore,
    fetchAppointments,
    setPage,
    getAppointment,
    addAppointment,
    addRecurringAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
  };
}
