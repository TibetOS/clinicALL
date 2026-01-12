import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { InventoryItem } from '../types';
import { MOCK_INVENTORY } from '../data';
import { createLogger } from '../lib/logger';
import { InventoryItemRow, InventoryItemRowUpdate, getErrorMessage } from '../lib/database.types';

const logger = createLogger('useInventory');

interface InventoryInput {
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit?: string;
  expiryDate?: string;
  supplier?: string;
  unitPrice?: number;
  lotNumber?: string;
  notes?: string;
}

interface UseInventory {
  inventory: InventoryItem[];
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  getItem: (id: string) => Promise<InventoryItem | null>;
  addItem: (item: InventoryInput) => Promise<InventoryItem | null>;
  updateItem: (id: string, updates: Partial<InventoryInput>) => Promise<InventoryItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
}

function calculateStatus(quantity: number, minQuantity: number): 'ok' | 'low' | 'critical' {
  if (quantity <= 0) return 'critical';
  if (quantity <= minQuantity) return 'low';
  return 'ok';
}

export function useInventory(): UseInventory {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setItems(MOCK_INVENTORY);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedItems: InventoryItem[] = (data as InventoryItemRow[] || []).map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku || '',
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.min_quantity,
        unit: item.unit || 'יחידות',
        expiryDate: item.expiry_date || '',
        supplier: item.supplier || '',
        status: item.status || calculateStatus(item.quantity, item.min_quantity),
        unitPrice: item.unit_price ?? undefined,
        lotNumber: item.lot_number || '',
        notes: item.notes || '',
      }));

      setItems(transformedItems);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch inventory');
      logger.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinic_id]);

  const getItem = useCallback(async (id: string): Promise<InventoryItem | null> => {
    if (!isSupabaseConfigured()) {
      return MOCK_INVENTORY.find(item => item.id === id) || null;
    }

    try {
      let query = supabase
        .from('inventory_items')
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
        name: data.name,
        sku: data.sku || '',
        category: data.category,
        quantity: data.quantity,
        minQuantity: data.min_quantity,
        unit: data.unit || 'יחידות',
        expiryDate: data.expiry_date || '',
        supplier: data.supplier || '',
        status: data.status || calculateStatus(data.quantity, data.min_quantity),
        unitPrice: data.unit_price ?? undefined,
        lotNumber: data.lot_number || '',
        notes: data.notes || '',
      };
    } catch (err) {
      logger.error('Error fetching inventory item:', err);
      return null;
    }
  }, [profile?.clinic_id]);

  const addItem = useCallback(async (item: InventoryInput): Promise<InventoryItem | null> => {
    if (!isSupabaseConfigured()) {
      const newItem: InventoryItem = {
        id: `mock-${Date.now()}`,
        name: item.name,
        sku: item.sku || '',
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unit: item.unit || 'יחידות',
        expiryDate: item.expiryDate || '',
        supplier: item.supplier || '',
        status: calculateStatus(item.quantity, item.minQuantity),
        unitPrice: item.unitPrice,
        lotNumber: item.lotNumber || '',
        notes: item.notes || '',
      };
      setItems((prev: InventoryItem[]) => [...prev, newItem]);
      return newItem;
    }

    try {
      const status = calculateStatus(item.quantity, item.minQuantity);
      const { data, error: insertError } = await supabase
        .from('inventory_items')
        .insert({
          clinic_id: profile?.clinic_id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          min_quantity: item.minQuantity,
          unit: item.unit || 'יחידות',
          expiry_date: item.expiryDate,
          supplier: item.supplier,
          status,
          unit_price: item.unitPrice,
          lot_number: item.lotNumber,
          notes: item.notes,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newItem: InventoryItem = {
        id: data.id,
        name: data.name,
        sku: data.sku || '',
        category: data.category,
        quantity: data.quantity,
        minQuantity: data.min_quantity,
        unit: data.unit || 'יחידות',
        expiryDate: data.expiry_date || '',
        supplier: data.supplier || '',
        status: data.status,
        unitPrice: data.unit_price ?? undefined,
        lotNumber: data.lot_number || '',
        notes: data.notes || '',
      };

      setItems((prev: InventoryItem[]) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      logger.error('Error adding inventory item:', err);
      setError(getErrorMessage(err) || 'Failed to add inventory item');
      return null;
    }
  }, [profile?.clinic_id]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryInput>): Promise<InventoryItem | null> => {
    if (!isSupabaseConfigured()) {
      setItems((prev: InventoryItem[]) => prev.map((item: InventoryItem) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.minQuantity !== undefined) {
          updated.status = calculateStatus(
            updates.quantity ?? item.quantity,
            updates.minQuantity ?? item.minQuantity
          );
        }
        return updated;
      }));
      return items.find((item: InventoryItem) => item.id === id) || null;
    }

    try {
      const dbUpdates: InventoryItemRowUpdate = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
      if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
      if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
      if (updates.lotNumber !== undefined) dbUpdates.lot_number = updates.lotNumber;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      // Recalculate status if quantity or minQuantity changed
      if (updates.quantity !== undefined || updates.minQuantity !== undefined) {
        const currentItem = items.find((i: InventoryItem) => i.id === id);
        const newQuantity = updates.quantity ?? currentItem?.quantity ?? 0;
        const newMinQuantity = updates.minQuantity ?? currentItem?.minQuantity ?? 0;
        dbUpdates.status = calculateStatus(newQuantity, newMinQuantity);
      }

      let query = supabase
        .from('inventory_items')
        .update(dbUpdates)
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error: updateError } = await query.select().single();

      if (updateError) throw updateError;

      const updatedItem: InventoryItem = {
        id: data.id,
        name: data.name,
        sku: data.sku || '',
        category: data.category,
        quantity: data.quantity,
        minQuantity: data.min_quantity,
        unit: data.unit || 'יחידות',
        expiryDate: data.expiry_date || '',
        supplier: data.supplier || '',
        status: data.status,
        unitPrice: data.unit_price ?? undefined,
        lotNumber: data.lot_number || '',
        notes: data.notes || '',
      };

      setItems((prev: InventoryItem[]) => prev.map((item: InventoryItem) => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      logger.error('Error updating inventory item:', err);
      setError(getErrorMessage(err) || 'Failed to update inventory item');
      return null;
    }
  }, [items, profile?.clinic_id]);

  const updateQuantity = useCallback(async (id: string, quantity: number): Promise<boolean> => {
    const result = await updateItem(id, { quantity });
    return result !== null;
  }, [updateItem]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setItems((prev: InventoryItem[]) => prev.filter((item: InventoryItem) => item.id !== id));
      return true;
    }

    try {
      let query = supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      // Filter by clinic_id for multi-tenant isolation
      if (profile?.clinic_id) {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      setItems((prev: InventoryItem[]) => prev.filter((item: InventoryItem) => item.id !== id));
      return true;
    } catch (err) {
      logger.error('Error deleting inventory item:', err);
      setError(getErrorMessage(err) || 'Failed to delete inventory item');
      return false;
    }
  }, [profile?.clinic_id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    inventory: items,
    items,
    loading,
    error,
    fetchItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
  };
}
