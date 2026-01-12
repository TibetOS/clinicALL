import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Invoice, InvoiceItem } from '../types';
import { MOCK_INVOICES } from '../data';
import { createLogger } from '../lib/logger';
import { InvoiceRow, InvoiceRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useInvoices');

interface InvoiceInput {
  invoiceNumber: string;
  patientId?: string;
  patientName: string;
  date?: string;
  items: InvoiceItem[];
  total: number;
  status?: 'pending' | 'paid' | 'overdue' | 'refunded';
}

interface UseInvoices {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  getInvoice: (id: string) => Promise<Invoice | null>;
  addInvoice: (invoice: InvoiceInput) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<InvoiceInput>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: Invoice['status']) => Promise<boolean>;
  generateInvoiceNumber: () => string;
}

export function useInvoices(): UseInvoices {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const generateInvoiceNumber = useCallback((): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setInvoices(MOCK_INVOICES);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedInvoices: Invoice[] = (data as InvoiceRow[] || []).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        patientId: inv.patient_id ?? undefined,
        patientName: inv.patient_name,
        date: inv.date,
        items: inv.items || [],
        total: inv.total || 0,
        status: inv.status || 'pending',
      }));

      setInvoices(transformedInvoices);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch invoices');
      logger.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const getInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_INVOICES.find(inv => inv.id === id) || null;
    }

    try {
      let query = supabase
        .from('invoices')
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
        invoiceNumber: data.invoice_number,
        patientId: data.patient_id,
        patientName: data.patient_name,
        date: data.date,
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'pending',
      };
    } catch (err) {
      logger.error('Error fetching invoice:', err);
      return null;
    }
  }, [profile?.clinic_id]);

  const addInvoice = useCallback(async (invoice: InvoiceInput): Promise<Invoice | null> => {
    if (!isSupabaseConfigured()) {
      const newInvoice: Invoice = {
        id: `mock-${Date.now()}`,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId ?? undefined,
        patientName: invoice.patientName,
        date: invoice.date ?? new Date().toISOString().split('T')[0] ?? '',
        items: invoice.items,
        total: invoice.total,
        status: invoice.status || 'pending',
      };
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert({
          clinic_id: profile?.clinic_id,
          invoice_number: invoice.invoiceNumber,
          patient_id: invoice.patientId ?? null,
          patient_name: invoice.patientName,
          date: invoice.date || new Date().toISOString().split('T')[0],
          items: invoice.items,
          total: invoice.total,
          status: invoice.status || 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newInvoice: Invoice = {
        id: data.id,
        invoiceNumber: data.invoice_number,
        patientId: data.patient_id,
        patientName: data.patient_name,
        date: data.date,
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'pending',
      };

      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      logger.error('Error adding invoice:', err);
      setError(getErrorMessage(err) || 'Failed to add invoice');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<InvoiceInput>): Promise<Invoice | null> => {
    if (!isSupabaseConfigured()) {
      setInvoices(prev => prev.map(inv =>
        inv.id === id ? { ...inv, ...updates } : inv
      ));
      return invoices.find(inv => inv.id === id) || null;
    }

    try {
      const dbUpdates: InvoiceRowUpdate = {};
      if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
      if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
      if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.items !== undefined) dbUpdates.items = updates.items;
      if (updates.total !== undefined) dbUpdates.total = updates.total;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      let query = supabase
        .from('invoices')
        .update(dbUpdates)
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select().single();

      if (updateError) throw updateError;

      const updatedInvoice: Invoice = {
        id: data.id,
        invoiceNumber: data.invoice_number,
        patientId: data.patient_id,
        patientName: data.patient_name,
        date: data.date,
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'pending',
      };

      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      return updatedInvoice;
    } catch (err) {
      logger.error('Error updating invoice:', err);
      setError(getErrorMessage(err) || 'Failed to update invoice');
      return null;
    }
  }, [invoices, profile?.clinic_id]);

  const updateStatus = useCallback(async (id: string, status: Invoice['status']): Promise<boolean> => {
    const result = await updateInvoice(id, { status });
    return result !== null;
  }, [updateInvoice]);

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      return true;
    }

    try {
      let query = supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      // SECURITY: Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setInvoices(prev => prev.filter(inv => inv.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting invoice:', err);
      setError(getErrorMessage(err) || 'Failed to delete invoice');
      return false;
    }
  }, [profile?.clinic_id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    getInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus,
    generateInvoiceNumber,
  };
}
