import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Custom render with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  if (options?.route) {
    window.history.pushState({}, 'Test page', options.route);
  }
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Helper to wait for async operations
export async function waitForLoadingToFinish() {
  // Wait for any pending promises to resolve
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Helper to create mock user profile
export function createMockProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin' as const,
    clinic_id: 'test-clinic-id',
    full_name: 'Test User',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create mock patient
export function createMockPatient(overrides = {}) {
  return {
    id: 'patient-1',
    name: 'Test Patient',
    email: 'patient@example.com',
    phone: '050-1234567',
    riskLevel: 'low' as const,
    lastVisit: '2024-01-01',
    memberSince: '2023-01-01',
    ...overrides,
  };
}

// Helper to create mock appointment
export function createMockAppointment(overrides = {}) {
  return {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    serviceId: 'service-1',
    serviceName: 'Test Service',
    date: '2024-01-15',
    time: '10:00',
    duration: 60,
    status: 'pending' as const,
    ...overrides,
  };
}
