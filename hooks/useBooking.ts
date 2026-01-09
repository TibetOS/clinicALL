import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TimeSlot } from '../types';
import { createLogger } from '../lib/logger';
import { getErrorMessage } from '../lib/database.types';

const logger = createLogger('useBooking');

// Default clinic operating hours (can be overridden by clinic settings)
const DEFAULT_OPERATING_HOURS = {
  start: '09:00',
  end: '19:00',
  slotInterval: 30, // minutes
};

interface BookingInput {
  clinicId: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  staffId?: string;
  staffName?: string;
  date: string;
  time: string;
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

interface BookingResult {
  success: boolean;
  appointmentId?: string;
  patientId?: string;
  error?: string;
}

interface UseBooking {
  loading: boolean;
  error: string | null;
  getAvailableSlots: (date: string, serviceDuration: number, staffId?: string, clinicId?: string) => Promise<TimeSlot[]>;
  createBooking: (booking: BookingInput) => Promise<BookingResult>;
}

export function useBooking(): UseBooking {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailableSlots = useCallback(async (
    date: string,
    serviceDuration: number,
    _staffId?: string,
    clinicId?: string
  ): Promise<TimeSlot[]> => {
    if (!isSupabaseConfigured()) {
      // No mock data - Supabase must be configured for public pages
      setError('Database not configured');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch existing appointments for the date
      let query = supabase
        .from('appointments')
        .select('time, duration, status')
        .eq('date', date)
        .not('status', 'in', '("cancelled")');

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      // Note: staff filtering would require a staff_id column in appointments
      // For now, we check all appointments for the date

      const { data: appointments, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Generate all possible slots
      const allSlots = generateAllSlots(serviceDuration);

      // Mark slots as unavailable if they overlap with existing appointments
      const bookedSlots = appointments || [];

      return allSlots.map(slot => {
        const slotStart = timeToMinutes(slot.time);
        const slotEnd = slotStart + serviceDuration;

        // Check if this slot overlaps with any existing appointment
        const isBlocked = bookedSlots.some(appt => {
          const apptStart = timeToMinutes(appt.time ?? '00:00');
          const apptEnd = apptStart + (appt.duration || 30);

          // Check for overlap
          return (slotStart < apptEnd && slotEnd > apptStart);
        });

        return {
          ...slot,
          available: !isBlocked,
        };
      });
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch available slots');
      logger.error('Error fetching slots:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (booking: BookingInput): Promise<BookingResult> => {
    if (!isSupabaseConfigured()) {
      // No mock data - Supabase must be configured for public pages
      return {
        success: false,
        error: 'Database not configured',
      };
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Find or create the patient
      let patientId: string;

      // Check if patient exists by phone
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', booking.customerPhone)
        .eq('clinic_id', booking.clinicId)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            clinic_id: booking.clinicId,
            name: booking.customerName || 'לקוח חדש',
            phone: booking.customerPhone,
            email: booking.customerEmail,
            risk_level: 'low',
            member_since: new Date().toISOString().split('T')[0],
          })
          .select('id')
          .single();

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      // Step 2: Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          clinic_id: booking.clinicId,
          patient_id: patientId,
          service_id: booking.serviceId,
          date: booking.date,
          time: booking.time,
          duration: booking.serviceDuration,
          status: 'pending',
          notes: booking.notes || `הזמנה מקוונת - ${booking.customerPhone}`,
        })
        .select('id')
        .single();

      if (appointmentError) throw appointmentError;

      return {
        success: true,
        appointmentId: appointment.id,
        patientId,
      };
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to create booking';
      setError(errorMessage);
      logger.error('Error creating booking:', err);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAvailableSlots,
    createBooking,
  };
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function generateAllSlots(serviceDuration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { start, end, slotInterval } = DEFAULT_OPERATING_HOURS;

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  // Generate slots ensuring the service can complete before closing
  for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += slotInterval) {
    slots.push({
      time: minutesToTime(minutes),
      available: true,
    });
  }

  return slots;
}
