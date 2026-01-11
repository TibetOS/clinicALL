import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAppointments } from './useAppointments';
import { MOCK_APPOINTMENTS } from '../data';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  isSupabaseConfigured: vi.fn(() => false), // Default to mock mode
}));

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    profile: {
      clinic_id: 'test-clinic-id',
    },
  })),
}));

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('in mock mode', () => {
    it('should return mock appointments on mount', async () => {
      const { result } = renderHook(() => useAppointments());

      // Wait for data to load (mock mode may load synchronously)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.appointments).toEqual(MOCK_APPOINTMENTS);
      expect(result.current.error).toBeNull();
    });

    it('should filter appointments by patientId', async () => {
      const patientId = MOCK_APPOINTMENTS[0]?.patientId || '';
      const { result } = renderHook(() =>
        useAppointments({ patientId })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const filteredAppointments = MOCK_APPOINTMENTS.filter(
        (a) => a.patientId === patientId
      );
      expect(result.current.appointments).toEqual(filteredAppointments);
    });

    it('should filter appointments by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const { result } = renderHook(() =>
        useAppointments({ startDate, endDate })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // All returned appointments should be within the date range
      result.current.appointments.forEach((apt) => {
        expect(apt.date >= startDate).toBe(true);
        expect(apt.date <= endDate).toBe(true);
      });
    });

    it('should get appointment by id', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointment = await result.current.getAppointment(
        MOCK_APPOINTMENTS[0]?.id || ''
      );
      expect(appointment).toEqual(MOCK_APPOINTMENTS[0]);
    });

    it('should return null for non-existent appointment', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointment = await result.current.getAppointment('non-existent-id');
      expect(appointment).toBeNull();
    });

    it('should add a new appointment', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.appointments.length;

      const newAppointment = await act(async () => {
        return result.current.addAppointment({
          patientId: 'patient-1',
          patientName: 'Test Patient',
          serviceId: 'service-1',
          serviceName: 'Test Service',
          date: '2024-06-15',
          time: '10:00',
          duration: 60,
        });
      });

      expect(newAppointment).not.toBeNull();
      expect(newAppointment?.patientName).toBe('Test Patient');
      expect(newAppointment?.status).toBe('pending'); // Default status
      expect(result.current.appointments.length).toBe(initialCount + 1);
    });

    it('should update an existing appointment', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointmentId = MOCK_APPOINTMENTS[0]?.id || '';

      await act(async () => {
        return result.current.updateAppointment(appointmentId, {
          notes: 'Updated notes',
        });
      });

      // Note: In mock mode, updateAppointment returns the old appointment
      // The state is updated though
      const updatedAppointment = result.current.appointments.find(
        (a) => a.id === appointmentId
      );
      expect(updatedAppointment?.notes).toBe('Updated notes');
    });

    it('should update appointment status', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointmentId = MOCK_APPOINTMENTS[0]?.id || '';

      const success = await act(async () => {
        return result.current.updateStatus(appointmentId, 'confirmed');
      });

      expect(success).toBe(true);

      const updatedAppointment = result.current.appointments.find(
        (a) => a.id === appointmentId
      );
      expect(updatedAppointment?.status).toBe('confirmed');
    });

    it('should delete an appointment', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointmentId = MOCK_APPOINTMENTS[0]?.id || '';
      const initialCount = result.current.appointments.length;

      const success = await act(async () => {
        return result.current.deleteAppointment(appointmentId);
      });

      expect(success).toBe(true);
      expect(result.current.appointments.length).toBe(initialCount - 1);
      expect(
        result.current.appointments.find((a) => a.id === appointmentId)
      ).toBeUndefined();
    });
  });

  describe('hook interface', () => {
    it('should expose all required methods', async () => {
      const { result } = renderHook(() => useAppointments());

      expect(result.current.appointments).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.fetchAppointments).toBeDefined();
      expect(result.current.getAppointment).toBeDefined();
      expect(result.current.addAppointment).toBeDefined();
      expect(result.current.updateAppointment).toBeDefined();
      expect(result.current.deleteAppointment).toBeDefined();
      expect(result.current.updateStatus).toBeDefined();
    });

    it('should be able to refetch appointments with different options', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Refetch with patientId filter
      await act(async () => {
        await result.current.fetchAppointments({
          patientId: MOCK_APPOINTMENTS[0]?.patientId,
        });
      });

      // Should have filtered results
      expect(result.current.appointments.length).toBeLessThanOrEqual(
        MOCK_APPOINTMENTS.length
      );
    });
  });

  describe('appointment status transitions', () => {
    it('should allow transitioning from pending to confirmed', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Find a pending appointment
      const pendingAppointment = result.current.appointments.find(
        (a) => a.status === 'pending'
      );

      if (pendingAppointment) {
        const success = await act(async () => {
          return result.current.updateStatus(pendingAppointment.id, 'confirmed');
        });

        expect(success).toBe(true);
      }
    });

    it('should allow transitioning to completed', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointmentId = MOCK_APPOINTMENTS[0]?.id || '';

      const success = await act(async () => {
        return result.current.updateStatus(appointmentId, 'completed');
      });

      expect(success).toBe(true);

      const updated = result.current.appointments.find(
        (a) => a.id === appointmentId
      );
      expect(updated?.status).toBe('completed');
    });

    it('should allow transitioning to cancelled', async () => {
      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const appointmentId = MOCK_APPOINTMENTS[0]?.id || '';

      const success = await act(async () => {
        return result.current.updateStatus(appointmentId, 'cancelled');
      });

      expect(success).toBe(true);

      const updated = result.current.appointments.find(
        (a) => a.id === appointmentId
      );
      expect(updated?.status).toBe('cancelled');
    });
  });
});
