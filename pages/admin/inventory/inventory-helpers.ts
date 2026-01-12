import { InventoryItem } from '../../../types';

// Categories for filtering
export const CATEGORIES = [
  { value: 'all', label: 'כל הקטגוריות' },
  { value: 'רעלנים', label: 'רעלנים (Toxins)' },
  { value: 'חומרי מילוי', label: 'חומרי מילוי (Fillers)' },
  { value: 'ציוד מתכלה', label: 'ציוד מתכלה' },
];

// Status options for filtering
export const STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'ok', label: 'תקין' },
  { value: 'low', label: 'נמוך' },
  { value: 'critical', label: 'קריטי' },
];

// Sort options
export type SortField = 'name' | 'quantity' | 'expiryDate' | 'status';
export type SortDirection = 'asc' | 'desc';

export type SortOption = {
  field: SortField;
  direction: SortDirection;
  label: string;
};

export const DEFAULT_SORT_OPTION: SortOption = { field: 'name', direction: 'asc', label: 'שם (א-ת)' };

export const SORT_OPTIONS: SortOption[] = [
  DEFAULT_SORT_OPTION,
  { field: 'name', direction: 'desc', label: 'שם (ת-א)' },
  { field: 'quantity', direction: 'asc', label: 'כמות (נמוך-גבוה)' },
  { field: 'quantity', direction: 'desc', label: 'כמות (גבוה-נמוך)' },
  { field: 'expiryDate', direction: 'asc', label: 'תוקף (קרוב-רחוק)' },
  { field: 'expiryDate', direction: 'desc', label: 'תוקף (רחוק-קרוב)' },
  { field: 'status', direction: 'desc', label: 'סטטוס (קריטי קודם)' },
];

export type ItemForm = {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  unitPrice: number | undefined;
  lotNumber: string;
  notes: string;
};

export const INITIAL_ITEM_FORM: ItemForm = {
  name: '',
  sku: '',
  category: 'רעלנים',
  quantity: 0,
  minQuantity: 5,
  unit: 'יחידות',
  expiryDate: '',
  supplier: '',
  unitPrice: undefined,
  lotNumber: '',
  notes: '',
};

export type AdjustmentForm = {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  adjustmentType: 'add' | 'remove';
  amount: number;
  reason: string;
};

// Calculate days until expiry
export const getDaysUntilExpiry = (expiryDate: string): number | null => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Export to CSV
export const exportInventoryToCsv = (items: InventoryItem[], filename: string = 'inventory') => {
  const headers = ['שם', 'מק״ט', 'קטגוריה', 'כמות', 'סף התראה', 'יחידה', 'תוקף', 'ספק', 'מחיר', 'מספר אצווה', 'סטטוס'];
  const rows = items.map((item: InventoryItem) => [
    item.name,
    item.sku,
    item.category,
    item.quantity.toString(),
    item.minQuantity.toString(),
    item.unit,
    item.expiryDate,
    item.supplier,
    item.unitPrice?.toString() || '',
    item.lotNumber || '',
    item.status === 'ok' ? 'תקין' : item.status === 'low' ? 'נמוך' : 'קריטי',
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
