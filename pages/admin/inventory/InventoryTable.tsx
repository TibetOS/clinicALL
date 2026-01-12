import { Search, Plus, Package, ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../../../components/ui';
import { Checkbox } from '../../../components/ui/checkbox';
import { Empty } from '../../../components/ui/empty';
import { InventoryItem } from '../../../types';
import { getDaysUntilExpiry } from './inventory-helpers';

export type InventoryTableProps = {
  items: InventoryItem[];
  loading: boolean;
  searchTerm: string;
  selectedItems: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenAdjustDialog: (item: InventoryItem, type: 'add' | 'remove') => void;
  onOpenEditDialog: (item: InventoryItem) => void;
  onOpenDeleteDialog: (item: InventoryItem) => void;
  onAddItem: () => void;
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

export function InventoryTable({
  items,
  loading,
  searchTerm,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  onOpenAdjustDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onAddItem,
}: InventoryTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-4 py-4 w-10">
                <Checkbox
                  checked={selectedItems.size === items.length && items.length > 0}
                  onCheckedChange={onToggleSelectAll}
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12">
                  <Empty
                    icon={searchTerm ? <Search className="h-6 w-6 text-muted-foreground" /> : <Package className="h-6 w-6 text-muted-foreground" />}
                    title={searchTerm ? 'לא נמצאו תוצאות' : 'אין פריטים במלאי'}
                    description={searchTerm ? 'נסה לשנות את מונחי החיפוש' : 'הוסף פריט חדש כדי להתחיל'}
                    action={!searchTerm ? (
                      <Button className="gap-2" onClick={onAddItem}>
                        קליטת סחורה <Plus size={16} />
                      </Button>
                    ) : undefined}
                  />
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => onToggleSelect(item.id)}
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
                      onClick={() => onOpenAdjustDialog(item, 'add')}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="הפחת מהמלאי"
                      onClick={() => onOpenAdjustDialog(item, 'remove')}
                      disabled={item.quantity <= 0}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      aria-label="ערוך פריט"
                      onClick={() => onOpenEditDialog(item)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      aria-label="מחק פריט"
                      onClick={() => onOpenDeleteDialog(item)}
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
  );
}
