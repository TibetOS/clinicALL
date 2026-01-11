import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePatients } from './usePatients';
import { MOCK_PATIENTS } from '../data';

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

describe('usePatients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('in mock mode', () => {
    it('should return mock patients on mount', async () => {
      const { result } = renderHook(() => usePatients());

      // Wait for data to load (mock mode may load synchronously)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.patients).toEqual(MOCK_PATIENTS);
      expect(result.current.error).toBeNull();
    });

    it('should return patient by id', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const patient = await result.current.getPatient(MOCK_PATIENTS[0]?.id || '');
      expect(patient).toEqual(MOCK_PATIENTS[0]);
    });

    it('should return null for non-existent patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const patient = await result.current.getPatient('non-existent-id');
      expect(patient).toBeNull();
    });

    it('should add a new patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.patients.length;

      const newPatient = await act(async () => {
        return result.current.addPatient({
          name: 'New Patient',
          phone: '050-9999999',
          email: 'new@patient.com',
        });
      });

      expect(newPatient).not.toBeNull();
      expect(newPatient?.name).toBe('New Patient');
      expect(newPatient?.phone).toBe('050-9999999');
      expect(result.current.patients.length).toBe(initialCount + 1);
    });

    it('should update an existing patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const patientId = MOCK_PATIENTS[0]?.id || '';
      const originalName = MOCK_PATIENTS[0]?.name;

      const updated = await act(async () => {
        return result.current.updatePatient(patientId, {
          name: 'Updated Name',
        });
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.name).not.toBe(originalName);

      // Verify the patient list is updated
      const updatedPatient = result.current.patients.find((p) => p.id === patientId);
      expect(updatedPatient?.name).toBe('Updated Name');
    });

    it('should return null when updating non-existent patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = await act(async () => {
        return result.current.updatePatient('non-existent-id', {
          name: 'Updated Name',
        });
      });

      expect(updated).toBeNull();
    });

    it('should delete a patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const patientId = MOCK_PATIENTS[0]?.id || '';
      const initialCount = result.current.patients.length;

      const success = await act(async () => {
        return result.current.deletePatient(patientId);
      });

      expect(success).toBe(true);
      expect(result.current.patients.length).toBe(initialCount - 1);
      expect(result.current.patients.find((p) => p.id === patientId)).toBeUndefined();
    });

    it('should set default risk level when adding patient', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newPatient = await act(async () => {
        return result.current.addPatient({
          name: 'Patient Without Risk',
          phone: '050-1111111',
        });
      });

      expect(newPatient?.riskLevel).toBe('low');
    });
  });

  describe('hook interface', () => {
    it('should expose all required methods', async () => {
      const { result } = renderHook(() => usePatients());

      expect(result.current.patients).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.fetchPatients).toBeDefined();
      expect(result.current.getPatient).toBeDefined();
      expect(result.current.addPatient).toBeDefined();
      expect(result.current.updatePatient).toBeDefined();
      expect(result.current.deletePatient).toBeDefined();
    });

    it('should be able to refetch patients', async () => {
      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Refetch should work without errors
      await act(async () => {
        await result.current.fetchPatients();
      });

      expect(result.current.patients).toEqual(MOCK_PATIENTS);
    });
  });
});
