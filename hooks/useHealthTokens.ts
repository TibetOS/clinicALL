import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { HealthDeclarationToken } from '../types';
import { MOCK_HEALTH_TOKENS } from '../data';

// Generate a secure random token
export const generateToken = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  const array = new Uint32Array(12);
  crypto.getRandomValues(array);
  for (let i = 0; i < 12; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

// Get expiry date (default 7 days from now)
export const getDefaultExpiry = (days: number = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

interface CreateTokenInput {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  expiryDays?: number;
}

interface UseHealthTokens {
  tokens: HealthDeclarationToken[];
  loading: boolean;
  error: string | null;
  fetchTokens: () => Promise<void>;
  getTokenByValue: (token: string) => Promise<HealthDeclarationToken | null>;
  validateToken: (token: string) => Promise<{ valid: boolean; token?: HealthDeclarationToken; reason?: string }>;
  createToken: (input: CreateTokenInput) => Promise<HealthDeclarationToken | null>;
  markTokenAsUsed: (tokenId: string) => Promise<boolean>;
  deleteToken: (tokenId: string) => Promise<boolean>;
  generateShareLink: (token: string) => string;
  generateWhatsAppLink: (token: string, phone: string) => string;
  generateEmailLink: (token: string, email: string, clinicName?: string) => string;
}

// In-memory store for mock mode (persists across hook instances)
let mockTokensStore = [...MOCK_HEALTH_TOKENS];

export function useHealthTokens(): UseHealthTokens {
  const [tokens, setTokens] = useState<HealthDeclarationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchTokens = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Update status for expired tokens
      const now = new Date();
      mockTokensStore = mockTokensStore.map(t => {
        if (t.status === 'active' && new Date(t.expiresAt) < now) {
          return { ...t, status: 'expired' as const };
        }
        return t;
      });
      setTokens(mockTokensStore);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('health_declaration_tokens')
        .select('*')
        .eq('clinic_id', profile?.clinic_id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedTokens: HealthDeclarationToken[] = (data || []).map((t: any) => ({
        id: t.id,
        token: t.token,
        clinicId: t.clinic_id,
        patientId: t.patient_id,
        patientName: t.patient_name,
        patientPhone: t.patient_phone,
        patientEmail: t.patient_email,
        createdAt: t.created_at,
        expiresAt: t.expires_at,
        status: t.status,
        usedAt: t.used_at,
      }));

      setTokens(transformedTokens);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tokens');
      console.error('Error fetching health tokens:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const getTokenByValue = useCallback(async (tokenValue: string): Promise<HealthDeclarationToken | null> => {
    if (!isSupabaseConfigured()) {
      return mockTokensStore.find(t => t.token === tokenValue) || null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('health_declaration_tokens')
        .select('*')
        .eq('token', tokenValue)
        .single();

      if (fetchError) return null;

      return {
        id: data.id,
        token: data.token,
        clinicId: data.clinic_id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        patientPhone: data.patient_phone,
        patientEmail: data.patient_email,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        status: data.status,
        usedAt: data.used_at,
      };
    } catch (err: any) {
      console.error('Error fetching token:', err);
      return null;
    }
  }, []);

  const validateToken = useCallback(async (tokenValue: string): Promise<{ valid: boolean; token?: HealthDeclarationToken; reason?: string }> => {
    const token = await getTokenByValue(tokenValue);

    if (!token) {
      return { valid: false, reason: 'TOKEN_NOT_FOUND' };
    }

    if (token.status === 'used') {
      return { valid: false, token, reason: 'TOKEN_ALREADY_USED' };
    }

    if (token.status === 'expired' || new Date(token.expiresAt) < new Date()) {
      return { valid: false, token, reason: 'TOKEN_EXPIRED' };
    }

    return { valid: true, token };
  }, [getTokenByValue]);

  const createToken = useCallback(async (input: CreateTokenInput): Promise<HealthDeclarationToken | null> => {
    const tokenValue = generateToken();
    const expiresAt = getDefaultExpiry(input.expiryDays || 7);

    if (!isSupabaseConfigured()) {
      const newToken: HealthDeclarationToken = {
        id: `hdt-${Date.now()}`,
        token: tokenValue,
        clinicId: 'clinic-1',
        patientId: input.patientId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        patientEmail: input.patientEmail,
        createdAt: new Date().toISOString(),
        expiresAt,
        status: 'active',
      };
      mockTokensStore = [newToken, ...mockTokensStore];
      setTokens(mockTokensStore);
      return newToken;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('health_declaration_tokens')
        .insert({
          token: tokenValue,
          clinic_id: profile?.clinic_id,
          patient_id: input.patientId,
          patient_name: input.patientName,
          patient_phone: input.patientPhone,
          patient_email: input.patientEmail,
          expires_at: expiresAt,
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newToken: HealthDeclarationToken = {
        id: data.id,
        token: data.token,
        clinicId: data.clinic_id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        patientPhone: data.patient_phone,
        patientEmail: data.patient_email,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        status: data.status,
      };

      setTokens(prev => [newToken, ...prev]);
      return newToken;
    } catch (err: any) {
      console.error('Error creating token:', err);
      setError(err.message || 'Failed to create token');
      return null;
    }
  }, [profile?.clinic_id]);

  const markTokenAsUsed = useCallback(async (tokenId: string): Promise<boolean> => {
    const usedAt = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      mockTokensStore = mockTokensStore.map(t =>
        t.id === tokenId ? { ...t, status: 'used' as const, usedAt } : t
      );
      setTokens(mockTokensStore);
      return true;
    }

    try {
      const { error: updateError } = await supabase
        .from('health_declaration_tokens')
        .update({ status: 'used', used_at: usedAt })
        .eq('id', tokenId);

      if (updateError) throw updateError;

      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, status: 'used', usedAt } : t
      ));
      return true;
    } catch (err: any) {
      console.error('Error marking token as used:', err);
      return false;
    }
  }, []);

  const deleteToken = useCallback(async (tokenId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      mockTokensStore = mockTokensStore.filter(t => t.id !== tokenId);
      setTokens(mockTokensStore);
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('health_declaration_tokens')
        .delete()
        .eq('id', tokenId);

      if (deleteError) throw deleteError;

      setTokens(prev => prev.filter(t => t.id !== tokenId));
      return true;
    } catch (err: any) {
      console.error('Error deleting token:', err);
      return false;
    }
  }, []);

  const generateShareLink = useCallback((token: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/health/${token}`;
  }, []);

  const generateWhatsAppLink = useCallback((token: string, phone: string): string => {
    const link = generateShareLink(token);
    const message = encodeURIComponent(
      `שלום,\nבבקשה מלא/י את טופס הצהרת הבריאות לפני הגעתך למרפאה:\n${link}\n\nתודה!`
    );
    // Remove non-digits from phone and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '972');
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }, [generateShareLink]);

  const generateEmailLink = useCallback((token: string, email: string, clinicName?: string): string => {
    const link = generateShareLink(token);
    const subject = encodeURIComponent(`הצהרת בריאות - ${clinicName || 'המרפאה'}`);
    const body = encodeURIComponent(
      `שלום,\n\nבבקשה מלא/י את טופס הצהרת הבריאות לפני הגעתך למרפאה:\n${link}\n\nתודה רבה,\n${clinicName || 'צוות המרפאה'}`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }, [generateShareLink]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    loading,
    error,
    fetchTokens,
    getTokenByValue,
    validateToken,
    createToken,
    markTokenAsUsed,
    deleteToken,
    generateShareLink,
    generateWhatsAppLink,
    generateEmailLink,
  };
}
