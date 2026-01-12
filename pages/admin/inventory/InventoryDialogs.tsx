import { Button, Input, Label, Dialog, Badge } from '../../../components/ui';
import { InventoryItem } from '../../../types';
import { InventoryItemForm } from './InventoryItemForm';
import { ItemForm, AdjustmentForm } from './inventory-helpers';

// Add Item Dialog
export type AddItemDialogProps = {
  open: boolean;
  onClose: () => void;
  formData: ItemForm;
  onFormChange: (data: ItemForm) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function AddItemDialog({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: AddItemDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="קליטת פריט חדש">
      <InventoryItemForm formData={formData} onFormChange={onFormChange} />
      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button variant="ghost" onClick={onClose} disabled={saving}>ביטול</Button>
        <Button onClick={onSubmit} disabled={saving || !formData.name.trim()}>
          {saving ? 'שומר...' : 'שמור במלאי'}
        </Button>
      </div>
    </Dialog>
  );
}

// Edit Item Dialog
export type EditItemDialogProps = {
  open: boolean;
  onClose: () => void;
  formData: ItemForm;
  onFormChange: (data: ItemForm) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function EditItemDialog({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: EditItemDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="עריכת פריט">
      <InventoryItemForm formData={formData} onFormChange={onFormChange} />
      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button variant="ghost" onClick={onClose} disabled={saving}>ביטול</Button>
        <Button onClick={onSubmit} disabled={saving || !formData.name.trim()}>
          {saving ? 'שומר...' : 'עדכן פריט'}
        </Button>
      </div>
    </Dialog>
  );
}

// Stock Adjustment Dialog
export type StockAdjustmentDialogProps = {
  open: boolean;
  onClose: () => void;
  adjustment: AdjustmentForm | null;
  onAdjustmentChange: (adjustment: AdjustmentForm | null) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function StockAdjustmentDialog({
  open,
  onClose,
  adjustment,
  onAdjustmentChange,
  onSubmit,
  saving,
}: StockAdjustmentDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              onChange={(e) => onAdjustmentChange({ ...adjustment, amount: parseInt(e.target.value) || 0 })}
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
              onChange={(e) => onAdjustmentChange({ ...adjustment, reason: e.target.value })}
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
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              ביטול
            </Button>
            <Button
              onClick={onSubmit}
              disabled={saving || adjustment.amount <= 0}
              className={adjustment.adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {saving ? 'שומר...' : adjustment.adjustmentType === 'add' ? 'הוסף למלאי' : 'הפחת מהמלאי'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// Delete Confirmation Dialog
export type DeleteItemDialogProps = {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteItemDialog({
  open,
  onClose,
  item,
  onConfirm,
  saving,
}: DeleteItemDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="אישור מחיקה"
    >
      {item && (
        <div className="space-y-4">
          <p>האם אתה בטוח שברצונך למחוק את הפריט <strong>{item.name}</strong>?</p>
          <p className="text-sm text-gray-500">פעולה זו אינה ניתנת לביטול.</p>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={saving}>
              {saving ? 'מוחק...' : 'מחק פריט'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// Batch Delete Confirmation Dialog
export type BatchDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
  saving: boolean;
};

export function BatchDeleteDialog({
  open,
  onClose,
  selectedCount,
  onConfirm,
  saving,
}: BatchDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="אישור מחיקה מרובה"
    >
      <div className="space-y-4">
        <p>האם אתה בטוח שברצונך למחוק <strong>{selectedCount} פריטים</strong>?</p>
        <p className="text-sm text-gray-500">פעולה זו אינה ניתנת לביטול.</p>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving ? 'מוחק...' : `מחק ${selectedCount} פריטים`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// Reorder Suggestions Dialog
export type ReorderSuggestionsDialogProps = {
  open: boolean;
  onClose: () => void;
  reorderItems: InventoryItem[];
  onExport: () => void;
};

const getStatusBadge = (status: InventoryItem['status']) => {
  switch (status) {
    case 'critical': return <Badge variant="destructive">קריטי</Badge>;
    case 'low': return <Badge variant="warning">נמוך</Badge>;
    default: return <Badge variant="success">תקין</Badge>;
  }
};

export function ReorderSuggestionsDialog({
  open,
  onClose,
  reorderItems,
  onExport,
}: ReorderSuggestionsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <Button variant="ghost" onClick={onClose}>סגור</Button>
          <Button onClick={onExport}>
            ייצוא רשימה
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
