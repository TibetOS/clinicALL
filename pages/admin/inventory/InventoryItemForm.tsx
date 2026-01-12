import { Input, Label } from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { ItemForm, CATEGORIES } from './inventory-helpers';

export type InventoryItemFormProps = {
  formData: ItemForm;
  onFormChange: (data: ItemForm) => void;
};

export function InventoryItemForm({ formData, onFormChange }: InventoryItemFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="item-name">שם הפריט *</Label>
          <Input
            id="item-name"
            name="item-name"
            autoComplete="off"
            placeholder="לדוג׳: Botox Allergan 100u"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="sku">מק״ט</Label>
          <Input
            id="sku"
            name="sku"
            autoComplete="off"
            placeholder="BTX-001"
            value={formData.sku}
            onChange={(e) => onFormChange({ ...formData, sku: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">קטגוריה</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onFormChange({ ...formData, category: value })}
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
            value={formData.quantity}
            onChange={(e) => onFormChange({ ...formData, quantity: parseInt(e.target.value) || 0 })}
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
            value={formData.minQuantity}
            onChange={(e) => onFormChange({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="unit">יחידת מידה</Label>
          <Input
            id="unit"
            name="unit"
            autoComplete="off"
            placeholder="יחידות"
            value={formData.unit}
            onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="expiry-date">תאריך תפוגה</Label>
          <Input
            id="expiry-date"
            type="date"
            name="expiry-date"
            autoComplete="off"
            value={formData.expiryDate}
            onChange={(e) => onFormChange({ ...formData, expiryDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="supplier">ספק</Label>
          <Input
            id="supplier"
            name="supplier"
            autoComplete="off"
            placeholder="שם הספק"
            value={formData.supplier}
            onChange={(e) => onFormChange({ ...formData, supplier: e.target.value })}
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
            value={formData.unitPrice || ''}
            onChange={(e) => onFormChange({
              ...formData,
              unitPrice: e.target.value ? parseFloat(e.target.value) : undefined
            })}
          />
        </div>
        <div>
          <Label htmlFor="lot-number">מספר אצווה</Label>
          <Input
            id="lot-number"
            name="lot-number"
            autoComplete="off"
            placeholder="LOT-2024-001"
            value={formData.lotNumber}
            onChange={(e) => onFormChange({ ...formData, lotNumber: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="notes">הערות</Label>
          <Input
            id="notes"
            name="notes"
            autoComplete="off"
            placeholder="הערות נוספות..."
            value={formData.notes}
            onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
