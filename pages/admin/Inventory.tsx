import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Package, AlertTriangle,
  ArrowDown, ArrowUp, History, Download, Edit2, Trash2,
  ChevronDown, ChevronUp, ShoppingCart, X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card, Button, Input, Badge, Dialog, Label,
  Alert, AlertTitle, AlertDescription, Spinner,
} from '../../components/ui';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { Empty } from '../../components/ui/empty';
import { useInventory } from '../../hooks';
import { InventoryItem } from '../../types';
import { createLogger } from '../../lib/logger';

const logger = createLogger('Inventory');

// Categories for filtering
const CATEGORIES = [
  { value: 'all', label: 'כל הקטגוריות' },
  { value: 'רעלנים', label: 'רעלנים (Toxins)' },
  { value: 'חומרי מילוי', label: 'חומרי מילוי (Fillers)' },
  { value: 'ציוד מתכלה', label: 'ציוד מתכלה' },
];

// Status options for filtering
const STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'ok', label: 'תקין' },
  { value: 'low', label: 'נמוך' },
  { value: 'critical', label: 'קריטי' },
];

// Sort options
type SortField = 'name' | 'quantity' | 'expiryDate' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'name', direction: 'asc', label: 'שם (א-ת)' },
  { field: 'name', direction: 'desc', label: 'שם (ת-א)' },
  { field: 'quantity', direction: 'asc', label: 'כמות (נמוך-גבוה)' },
  { field: 'quantity', direction: 'desc', label: 'כמות (גבוה-נמוך)' },
  { field: 'expiryDate', direction: 'asc', label: 'תוקף (קרוב-רחוק)' },
  { field: 'expiryDate', direction: 'desc', label: 'תוקף (רחוק-קרוב)' },
  { field: 'status', direction: 'desc', label: 'סטטוס (קריטי קודם)' },
];

interface ItemForm {
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
}

const initialFormState: ItemForm = {
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

interface AdjustmentForm {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  adjustmentType: 'add' | 'remove';
  amount: number;
  reason: string;
}

export const InventoryPage = () => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  // Form state
  const [itemForm, setItemForm] = useState<ItemForm>(initialFormState);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState<AdjustmentForm | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Batch selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Hook for data
  const { inventory, loading, error, updateQuantity, addItem, updateItem, deleteItem } = useInventory();

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...inventory];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        (item.lotNumber && item.lotNumber.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }

    // Sort
    items.sort((a, b) => {
      let comparison = 0;
      switch (sortOption.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'he');
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'expiryDate':
          const daysA = getDaysUntilExpiry(a.expiryDate) ?? 9999;
          const daysB = getDaysUntilExpiry(b.expiryDate) ?? 9999;
          comparison = daysA - daysB;
          break;
        case 'status':
          const statusOrder = { critical: 0, low: 1, ok: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      return sortOption.direction === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [inventory, searchTerm, categoryFilter, statusFilter, sortOption]);

  // Items needing reorder (low or critical status)
  const reorderItems = useMemo(() =>
    inventory.filter(item => item.status === 'low' || item.status === 'critical'),
    [inventory]
  );

  // Calculate stats
  const criticalCount = inventory.filter(i => i.status === 'critical').length;
  const lowStockCount = inventory.filter(i => i.status === 'low').length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);

  // Handlers
  const handleAddItem = async () => {
    if (!itemForm.name.trim()) return;

    setSaving(true);
    try {
      await addItem({
        name: itemForm.name,
        sku: itemForm.sku,
        category: itemForm.category,
        quantity: itemForm.quantity,
        minQuantity: itemForm.minQuantity,
        unit: itemForm.unit || 'יחידות',
        expiryDate: itemForm.expiryDate,
        supplier: itemForm.supplier,
        unitPrice: itemForm.unitPrice,
        lotNumber: itemForm.lotNumber,
        notes: itemForm.notes,
      });
      setItemForm(initialFormState);
      setIsAddOpen(false);
      toast.success('הפריט נוסף בהצלחה');
    } catch (err) {
      logger.error('Failed to add item:', err);
      toast.error('שגיאה בהוספת הפריט');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !itemForm.name.trim()) return;

    setSaving(true);
    try {
      await updateItem(editingItem.id, {
        name: itemForm.name,
        sku: itemForm.sku,
        category: itemForm.category,
        quantity: itemForm.quantity,
        minQuantity: itemForm.minQuantity,
        unit: itemForm.unit,
        expiryDate: itemForm.expiryDate,
        supplier: itemForm.supplier,
        unitPrice: itemForm.unitPrice,
        lotNumber: itemForm.lotNumber,
        notes: itemForm.notes,
      });
      setEditingItem(null);
      setItemForm(initialFormState);
      setIsEditOpen(false);
      toast.success('הפריט עודכן בהצלחה');
    } catch (err) {
      logger.error('Failed to update item:', err);
      toast.error('שגיאה בעדכון הפריט');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setSaving(true);
    try {
      const success = await deleteItem(itemToDelete.id);
      if (success) {
        setItemToDelete(null);
        setIsDeleteOpen(false);
        selectedItems.delete(itemToDelete.id);
        setSelectedItems(new Set(selectedItems));
        toast.success('הפריט נמחק בהצלחה');
      } else {
        toast.error('שגיאה במחיקת הפריט');
      }
    } catch (err) {
      logger.error('Failed to delete item:', err);
      toast.error('שגיאה במחיקת הפריט');
    } finally {
      setSaving(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;

    setSaving(true);
    let deleted = 0;
    for (const id of selectedItems) {
      const success = await deleteItem(id);
      if (success) deleted++;
    }
    setSaving(false);
    setSelectedItems(new Set());
    setIsBatchDeleteOpen(false);
    toast.success(`${deleted} פריטים נמחקו בהצלחה`);
  };

  const handleAdjustment = async () => {
    if (!adjustment || adjustment.amount <= 0) return;

    setSaving(true);
    try {
      const newQuantity = adjustment.adjustmentType === 'add'
        ? adjustment.currentQuantity + adjustment.amount
        : Math.max(0, adjustment.currentQuantity - adjustment.amount);

      const success = await updateQuantity(adjustment.itemId, newQuantity);
      if (success) {
        setIsAdjustOpen(false);
        setAdjustment(null);
        toast.success(
          adjustment.adjustmentType === 'add'
            ? `נוספו ${adjustment.amount} יחידות למלאי`
            : `הופחתו ${adjustment.amount} יחידות מהמלאי`
        );
      } else {
        toast.error('שגיאה בעדכון המלאי');
      }
    } catch (err) {
      logger.error('Failed to adjust quantity:', err);
      toast.error('שגיאה בעדכון המלאי');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    const success = await updateQuantity(item.id, newQuantity);
    if (success) {
      toast.success(delta > 0 ? `נוספה יחידה אחת` : `הופחתה יחידה אחת`);
    } else {
      toast.error('שגיאה בעדכון המלאי');
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      supplier: item.supplier,
      unitPrice: item.unitPrice,
      lotNumber: item.lotNumber || '',
      notes: item.notes || '',
    });
    setIsEditOpen(true);
  };

  const openAdjustDialog = (item: InventoryItem, type: 'add' | 'remove') => {
    setAdjustment({
      itemId: item.id,
      itemName: item.name,
      currentQuantity: item.quantity,
      adjustmentType: type,
      amount: 1,
      reason: '',
    });
    setIsAdjustOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['שם', 'מק״ט', 'קטגוריה', 'כמות', 'סף התראה', 'יחידה', 'תוקף', 'ספק', 'מחיר', 'מספר אצווה', 'סטטוס'];
    const rows = filteredItems.map((item: InventoryItem) => [
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
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד בהצלחה');
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i: InventoryItem) => i.id)));
    }
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return <Badge variant="destructive">קריטי</Badge>;
      case 'low': return <Badge variant="warning">נמוך</Badge>;
      default: return <Badge variant="success">תקין</Badge>;
    }
  };

  const getExpiryWarning = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return null;
    if (days <= 0) return <Badge variant="destructive">פג תוקף</Badge>;
    if (days <= 7) return <Badge variant="destructive">פג בקרוב ({days} ימים)</Badge>;
    if (days <= 30) return <Badge variant="warning">תוקף קרוב ({days} ימים)</Badge>;
    return null;
  };

  // Item form component (reused in add and edit dialogs)
  const renderItemForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="item-name">שם הפריט *</Label>
          <Input
            id="item-name"
            name="item-name"
            autoComplete="off"
            placeholder="לדוג׳: Botox Allergan 100u"
            value={itemForm.name}
            onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="sku">מק״ט</Label>
          <Input
            id="sku"
            name="sku"
            autoComplete="off"
            placeholder="BTX-001"
            value={itemForm.sku}
            onChange={(e) => setItemForm(prev => ({ ...prev, sku: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="category">קטגוריה</Label>
          <Select
            value={itemForm.category}
            onValueChange={(value) => setItemForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">כמות</Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            autoComplete="off"
            min="0"
            value={itemForm.quantity}
            onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="min-quantity">סף התראה</Label>
          <Input
            id="min-quantity"
            type="number"
            name="min-quantity"
            autoComplete="off"
            min="0"
            value={itemForm.minQuantity}
            onChange={(e) => setItemForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="unit">יחידת מידה</Label>
          <Input
            id="unit"
            name="unit"
            autoComplete="off"
            placeholder="יחידות"
            value={itemForm.unit}
            onChange={(e) => setItemForm(prev => ({ ...prev, unit: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="expiry-date">תאריך תפוגה</Label>
          <Input
            id="expiry-date"
            type="date"
            name="expiry-date"
            autoComplete="off"
            value={itemForm.expiryDate}
            onChange={(e) => setItemForm(prev => ({ ...prev, expiryDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="supplier">ספק</Label>
          <Input
            id="supplier"
            name="supplier"
            autoComplete="off"
            placeholder="שם הספק"
            value={itemForm.supplier}
            onChange={(e) => setItemForm(prev => ({ ...prev, supplier: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="unit-price">מחיר ליחידה (₪)</Label>
          <Input
            id="unit-price"
            type="number"
            name="unit-price"
            autoComplete="off"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={itemForm.unitPrice || ''}
            onChange={(e) => setItemForm(prev => ({
              ...prev,
              unitPrice: e.target.value ? parseFloat(e.target.value) : undefined
            }))}
          />
        </div>
        <div>
          <Label htmlFor="lot-number">מספר אצווה</Label>
          <Input
            id="lot-number"
            name="lot-number"
            autoComplete="off"
            placeholder="LOT-2024-001"
            value={itemForm.lotNumber}
            onChange={(e) => setItemForm(prev => ({ ...prev, lotNumber: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="notes">הערות</Label>
          <Input
            id="notes"
            name="notes"
            autoComplete="off"
            placeholder="הערות נוספות..."
            value={itemForm.notes}
            onChange={(e) => setItemForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת המלאי</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">ניהול מלאי</h1>
          <p className="text-muted-foreground">מעקב אחר חומרים מתכלים, תרופות וציוד</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {reorderItems.length > 0 && (
            <Button variant="outline" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => setIsReorderOpen(true)}>
              <ShoppingCart size={16} />
              הצעות להזמנה ({reorderItems.length})
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            ייצוא <Download size={16} />
          </Button>
          <Button className="shadow-sm gap-2" onClick={() => { setItemForm(initialFormState); setIsAddOpen(true); }}>
            קליטת סחורה <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 border-l-4 border-l-red-500 transition-all ${
          criticalCount > 0 ? 'bg-red-50 ring-2 ring-red-200 shadow-lg' : 'bg-red-50/20'
        }`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 bg-white rounded-full shadow-sm text-red-500 ${criticalCount > 0 ? 'animate-pulse' : ''}`}>
              <AlertTriangle size={24} className={criticalCount > 0 ? 'animate-bounce' : ''}/>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">פריטים במלאי קריטי</p>
              <h3 className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{criticalCount}</h3>
            </div>
          </div>
          <Progress value={inventory.length > 0 ? (criticalCount / inventory.length) * 100 : 0} className="h-2" indicatorClassName="bg-red-500" />
        </Card>
        <Card className={`p-4 border-l-4 border-l-yellow-500 transition-all ${
          lowStockCount > 0 ? 'bg-yellow-50 ring-2 ring-yellow-200 shadow-lg' : 'bg-yellow-50/20'
        }`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 bg-white rounded-full shadow-sm text-yellow-600 ${lowStockCount > 0 ? 'animate-pulse' : ''}`}>
              <Package size={24}/>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">פריטים במלאי נמוך</p>
              <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{lowStockCount}</h3>
            </div>
          </div>
          <Progress value={inventory.length > 0 ? (lowStockCount / inventory.length) * 100 : 0} className="h-2" indicatorClassName="bg-yellow-500" />
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/20">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600"><History size={24}/></div>
            <div>
              <p className="text-sm font-medium text-gray-600">סה״כ יחידות במלאי</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</h3>
            </div>
          </div>
          <Progress value={100} className="h-2" indicatorClassName="bg-blue-500" />
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/20">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white rounded-full shadow-sm text-green-600">₪</div>
            <div>
              <p className="text-sm font-medium text-gray-600">שווי מלאי</p>
              <h3 className="text-2xl font-bold text-gray-900">₪{totalValue.toLocaleString()}</h3>
            </div>
          </div>
          <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם, מק״ט או אצווה..."
              className="pr-9"
              name="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              סינון <Filter className="h-3 w-3" />
              {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Select value={`${sortOption.field}-${sortOption.direction}`} onValueChange={(value) => {
              const [field, direction] = value.split('-') as [SortField, SortDirection];
              setSortOption(SORT_OPTIONS.find(o => o.field === field && o.direction === direction) || SORT_OPTIONS[0]);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="מיון" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={`${opt.field}-${opt.direction}`} value={`${opt.field}-${opt.direction}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="w-48">
              <Label className="text-xs text-gray-500">קטגוריה</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-xs text-gray-500">סטטוס</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button variant="ghost" size="sm" className="self-end" onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); }}>
                <X className="h-4 w-4 ml-1" /> נקה סינון
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-primary/10 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">{selectedItems.size} פריטים נבחרו</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>בטל בחירה</Button>
            <Button variant="destructive" size="sm" onClick={() => setIsBatchDeleteOpen(true)} disabled={saving}>
              {saving ? 'מוחק...' : 'מחק נבחרים'}
            </Button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-4 py-4 w-10">
                  <Checkbox
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4">שם הפריט</th>
                <th className="px-4 py-4">מק״ט</th>
                <th className="px-4 py-4">קטגוריה</th>
                <th className="px-4 py-4">ספק</th>
                <th className="px-4 py-4">כמות</th>
                <th className="px-4 py-4">מחיר</th>
                <th className="px-4 py-4">תוקף</th>
                <th className="px-4 py-4">סטטוס</th>
                <th className="px-4 py-4">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Spinner className="h-8 w-8 text-primary" />
                      <span>טוען מלאי...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12">
                    <Empty
                      icon={searchTerm ? <Search className="h-6 w-6 text-muted-foreground" /> : <Package className="h-6 w-6 text-muted-foreground" />}
                      title={searchTerm ? 'לא נמצאו תוצאות' : 'אין פריטים במלאי'}
                      description={searchTerm ? 'נסה לשנות את מונחי החיפוש' : 'הוסף פריט חדש כדי להתחיל'}
                      action={!searchTerm ? (
                        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                          קליטת סחורה <Plus size={16} />
                        </Button>
                      ) : undefined}
                    />
                  </td>
                </tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.lotNumber && (
                        <p className="text-xs text-gray-500">אצווה: {item.lotNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 font-mono text-xs">{item.sku}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-sm">{item.supplier || '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {item.unitPrice ? `₪${item.unitPrice.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 direction-ltr text-right">{item.expiryDate || '—'}</span>
                      {getExpiryWarning(item.expiryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                        aria-label="הוסף למלאי"
                        onClick={() => openAdjustDialog(item, 'add')}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label="הפחת מהמלאי"
                        onClick={() => openAdjustDialog(item, 'remove')}
                        disabled={item.quantity <= 0}
                      >
                        <ArrowDown size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        aria-label="ערוך פריט"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        aria-label="מחק פריט"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="קליטת פריט חדש">
        {renderItemForm()}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={saving}>ביטול</Button>
          <Button onClick={handleAddItem} disabled={saving || !itemForm.name.trim()}>
            {saving ? 'שומר...' : 'שמור במלאי'}
          </Button>
        </div>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingItem(null); }} title="עריכת פריט">
        {renderItemForm()}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={() => { setIsEditOpen(false); setEditingItem(null); }} disabled={saving}>ביטול</Button>
          <Button onClick={handleEditItem} disabled={saving || !itemForm.name.trim()}>
            {saving ? 'שומר...' : 'עדכן פריט'}
          </Button>
        </div>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={isAdjustOpen}
        onClose={() => { setIsAdjustOpen(false); setAdjustment(null); }}
        title={adjustment?.adjustmentType === 'add' ? 'הוספה למלאי' : 'הפחתה מהמלאי'}
      >
        {adjustment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900">{adjustment.itemName}</p>
              <p className="text-sm text-gray-500">כמות נוכחית: {adjustment.currentQuantity} יחידות</p>
            </div>
            <div>
              <Label htmlFor="adjustment-amount">כמות {adjustment.adjustmentType === 'add' ? 'להוספה' : 'להפחתה'}</Label>
              <Input
                id="adjustment-amount"
                type="number"
                name="adjustment-amount"
                autoComplete="off"
                min="1"
                max={adjustment.adjustmentType === 'remove' ? adjustment.currentQuantity : undefined}
                value={adjustment.amount}
                onChange={(e) => setAdjustment(prev => prev ? { ...prev, amount: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div>
              <Label htmlFor="adjustment-reason">סיבה (אופציונלי)</Label>
              <Input
                id="adjustment-reason"
                name="adjustment-reason"
                autoComplete="off"
                placeholder={adjustment.adjustmentType === 'add' ? 'לדוג׳: קליטת הזמנה' : 'לדוג׳: שימוש בטיפול'}
                value={adjustment.reason}
                onChange={(e) => setAdjustment(prev => prev ? { ...prev, reason: e.target.value } : null)}
              />
            </div>
            <div className={`p-3 rounded-lg ${adjustment.adjustmentType === 'add' ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm font-medium">
                כמות חדשה לאחר {adjustment.adjustmentType === 'add' ? 'הוספה' : 'הפחתה'}:{' '}
                <span className={adjustment.adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}>
                  {adjustment.adjustmentType === 'add'
                    ? adjustment.currentQuantity + adjustment.amount
                    : Math.max(0, adjustment.currentQuantity - adjustment.amount)
                  } יחידות
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="ghost" onClick={() => { setIsAdjustOpen(false); setAdjustment(null); }} disabled={saving}>
                ביטול
              </Button>
              <Button
                onClick={handleAdjustment}
                disabled={saving || adjustment.amount <= 0}
                className={adjustment.adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {saving ? 'שומר...' : adjustment.adjustmentType === 'add' ? 'הוסף למלאי' : 'הפחת מהמלאי'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setItemToDelete(null); }}
        title="אישור מחיקה"
      >
        {itemToDelete && (
          <div className="space-y-4">
            <p>האם אתה בטוח שברצונך למחוק את הפריט <strong>{itemToDelete.name}</strong>?</p>
            <p className="text-sm text-gray-500">פעולה זו אינה ניתנת לביטול.</p>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="ghost" onClick={() => { setIsDeleteOpen(false); setItemToDelete(null); }} disabled={saving}>
                ביטול
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem} disabled={saving}>
                {saving ? 'מוחק...' : 'מחק פריט'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog
        open={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        title="אישור מחיקה מרובה"
      >
        <div className="space-y-4">
          <p>האם אתה בטוח שברצונך למחוק <strong>{selectedItems.size} פריטים</strong>?</p>
          <p className="text-sm text-gray-500">פעולה זו אינה ניתנת לביטול.</p>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsBatchDeleteOpen(false)} disabled={saving}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete} disabled={saving}>
              {saving ? 'מוחק...' : `מחק ${selectedItems.size} פריטים`}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reorder Suggestions Dialog */}
      <Dialog
        open={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        title="פריטים להזמנה"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">הפריטים הבאים מומלצים להזמנה מחדש:</p>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {reorderItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.supplier && `ספק: ${item.supplier} | `}
                    כמות נוכחית: {item.quantity} / סף: {item.minQuantity}
                  </p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsReorderOpen(false)}>סגור</Button>
            <Button onClick={() => { exportToCSV(); setIsReorderOpen(false); }}>
              ייצוא רשימה
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
