import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Download, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Alert, AlertTitle, AlertDescription } from '../../components/ui';
import { useInventory } from '../../hooks';
import { InventoryItem } from '../../types';
import { createLogger } from '../../lib/logger';

// Extracted components and helpers
import {
  DEFAULT_SORT_OPTION,
  SortOption,
  ItemForm,
  AdjustmentForm,
  INITIAL_ITEM_FORM,
  getDaysUntilExpiry,
  exportInventoryToCsv,
} from './inventory/inventory-helpers';
import { InventoryTable } from './inventory/InventoryTable';
import { InventoryStatusCards } from './inventory/InventoryStatusCards';
import { InventoryFilters } from './inventory/InventoryFilters';
import {
  AddItemDialog,
  EditItemDialog,
  StockAdjustmentDialog,
  DeleteItemDialog,
  BatchDeleteDialog,
  ReorderSuggestionsDialog,
} from './inventory/InventoryDialogs';

const logger = createLogger('Inventory');

export const InventoryPage = () => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION);
  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  // Form state
  const [itemForm, setItemForm] = useState<ItemForm>(INITIAL_ITEM_FORM);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState<AdjustmentForm | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Batch selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Hook for data
  const { inventory, loading, error, updateQuantity, addItem, updateItem, deleteItem } = useInventory();

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
      setItemForm(INITIAL_ITEM_FORM);
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
      setItemForm(INITIAL_ITEM_FORM);
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
  const handleExportToCsv = () => {
    exportInventoryToCsv(filteredItems, 'inventory');
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
          <Button variant="outline" className="gap-2" onClick={handleExportToCsv}>
            ייצוא <Download size={16} />
          </Button>
          <Button className="shadow-sm gap-2" onClick={() => { setItemForm(INITIAL_ITEM_FORM); setIsAddOpen(true); }}>
            קליטת סחורה <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <InventoryStatusCards
        criticalCount={criticalCount}
        lowStockCount={lowStockCount}
        totalQuantity={totalQuantity}
        totalValue={totalValue}
        totalItems={inventory.length}
      />

      {/* Search and Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

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
      <InventoryTable
        items={filteredItems}
        loading={loading}
        searchTerm={searchTerm}
        selectedItems={selectedItems}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onOpenAdjustDialog={openAdjustDialog}
        onOpenEditDialog={openEditDialog}
        onOpenDeleteDialog={openDeleteDialog}
        onAddItem={() => setIsAddOpen(true)}
      />

      {/* Dialogs */}
      <AddItemDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        formData={itemForm}
        onFormChange={setItemForm}
        onSubmit={handleAddItem}
        saving={saving}
      />

      <EditItemDialog
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingItem(null); }}
        formData={itemForm}
        onFormChange={setItemForm}
        onSubmit={handleEditItem}
        saving={saving}
      />

      <StockAdjustmentDialog
        open={isAdjustOpen}
        onClose={() => { setIsAdjustOpen(false); setAdjustment(null); }}
        adjustment={adjustment}
        onAdjustmentChange={setAdjustment}
        onSubmit={handleAdjustment}
        saving={saving}
      />

      <DeleteItemDialog
        open={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setItemToDelete(null); }}
        item={itemToDelete}
        onConfirm={handleDeleteItem}
        saving={saving}
      />

      <BatchDeleteDialog
        open={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        selectedCount={selectedItems.size}
        onConfirm={handleBatchDelete}
        saving={saving}
      />

      <ReorderSuggestionsDialog
        open={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        reorderItems={reorderItems}
        onExport={() => { handleExportToCsv(); setIsReorderOpen(false); }}
      />
    </div>
  );
};
