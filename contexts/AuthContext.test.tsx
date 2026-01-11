import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: vi.fn(() => false), // Default to mock mode
}));

// Mock the logger
vi.mock('../lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should return auth context when used within AuthProvider', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isConfigured).toBe(false);
    });
  });

  describe('AuthProvider', () => {
    it('should render children', async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toBeInTheDocument();
      });
    });

    it('should set loading to false when not configured', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('signIn (mock mode)', () => {
    it('should create mock user on signIn', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password');
        expect(response.error).toBeNull();
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.profile).not.toBeNull();
      expect(result.current.profile?.email).toBe('test@example.com');
      expect(result.current.profile?.role).toBe('owner');
      expect(result.current.profile?.full_name).toBe('Demo User');
      expect(result.current.profile?.clinic_id).toBe('mock-clinic');
    });
  });

  describe('signUp (mock mode)', () => {
    it('should return error when Supabase not configured', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signUp({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
          clinicName: 'Test Clinic',
          slug: 'test-clinic',
        });
        expect(response.error).not.toBeNull();
        expect(response.error?.message).toBe('Supabase not configured');
      });
    });
  });

  describe('signOut', () => {
    it('should clear user state on signOut', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First sign in
      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(result.current.user).not.toBeNull();

      // Then sign out
      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toBeNull();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should handle signOut without error even when not signed in', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // signOut should not throw even when no user is logged in
      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toBeNull();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });
  });

  describe('resetPassword (mock mode)', () => {
    it('should return error when Supabase not configured', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response.error).not.toBeNull();
        expect(response.error?.message).toBe('Supabase not configured');
      });
    });
  });

  describe('updatePassword (mock mode)', () => {
    it('should return error when Supabase not configured', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.updatePassword('newpassword123');
        expect(response.error).not.toBeNull();
        expect(response.error?.message).toBe('Supabase not configured');
      });
    });
  });

  describe('context interface', () => {
    it('should expose all required properties and methods', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Properties
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('profile');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('isConfigured');

      // Methods
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.updatePassword).toBe('function');
    });
  });
});
