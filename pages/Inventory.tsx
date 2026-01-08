
import React, { useState } from 'react';
import {
  Search, Filter, Plus, Package, AlertTriangle,
  ArrowDown, ArrowUp, History, Download
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label } from '../components/ui';
import { useInventory } from '../hooks';
import { InventoryItem } from '../types';

interface NewItemForm {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  expiryDate: string;
  supplier: string;
}

interface AdjustmentForm {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  adjustmentType: 'add' | 'remove';
  amount: number;
  reason: string;
}

const initialFormState: NewItemForm = {
  name: '',
  sku: '',
  category: 'רעלנים (Toxins)',
  quantity: 0,
  minQuantity: 5,
  expiryDate: '',
  supplier: '',
};

export const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>(initialFormState);
  const [adjustment, setAdjustment] = useState<AdjustmentForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use hook for data
  const { inventory, loading, updateQuantity, addItem } = useInventory();

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const openAdjustment = (item: InventoryItem, type: 'add' | 'remove') => {
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
        showSuccess(
          adjustment.adjustmentType === 'add'
            ? `נוספו ${adjustment.amount} יחידות למלאי`
            : `הופחתו ${adjustment.amount} יחידות מהמלאי`
        );
      }
    } catch (err) {
      console.error('Failed to adjust quantity:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    const success = await updateQuantity(item.id, newQuantity);
    if (success) {
      showSuccess(delta > 0 ? `נוספה יחידה אחת` : `הופחתה יחידה אחת`);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;

    setSaving(true);
    try {
      await addItem({
        name: newItem.name,
        sku: newItem.sku,
        category: newItem.category,
        quantity: newItem.quantity,
        minQuantity: newItem.minQuantity,
        expiryDate: newItem.expiryDate,
        supplier: newItem.supplier,
      });
      setNewItem(initialFormState);
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return <Badge variant="destructive">קריטי</Badge>;
      case 'low': return <Badge variant="warning">נמוך</Badge>;
      default: return <Badge variant="success">תקין</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">ניהול מלאי</h1>
           <p className="text-muted-foreground">מעקב אחר חומרים מתכלים, תרופות וציוד</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Download size={16} className="ml-2"/> ייצוא</Button>
            <Button className="shadow-sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="ml-2 h-4 w-4" /> קליטת סחורה
            </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className={`p-4 flex items-center gap-4 border-l-4 border-l-red-500 transition-all ${
           inventory.filter(i => i.status === 'critical').length > 0
             ? 'bg-red-50 ring-2 ring-red-200 shadow-lg'
             : 'bg-red-50/20'
         }`}>
            <div className={`p-3 bg-white rounded-full shadow-sm text-red-500 ${
              inventory.filter(i => i.status === 'critical').length > 0 ? 'animate-pulse' : ''
            }`}>
              <AlertTriangle size={24} className={inventory.filter(i => i.status === 'critical').length > 0 ? 'animate-bounce' : ''}/>
            </div>
            <div>
               <p className="text-sm font-medium text-gray-600">פריטים במלאי קריטי</p>
               <h3 className={`text-2xl font-bold ${
                 inventory.filter(i => i.status === 'critical').length > 0 ? 'text-red-600' : 'text-gray-900'
               }`}>{inventory.filter(i => i.status === 'critical').length}</h3>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 border-l-4 border-l-yellow-500 bg-yellow-50/20">
            <div className="p-3 bg-white rounded-full shadow-sm text-yellow-600"><Package size={24}/></div>
            <div>
               <p className="text-sm font-medium text-gray-600">שווי מלאי כולל</p>
               <h3 className="text-2xl font-bold text-gray-900">₪42,500</h3>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 bg-blue-50/20">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600"><History size={24}/></div>
            <div>
               <p className="text-sm font-medium text-gray-600">תנועות החודש</p>
               <h3 className="text-2xl font-bold text-gray-900">28</h3>
            </div>
         </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם פריט או מק״ט..."
            className="pr-9"
            name="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1"><Filter className="ml-2 h-3 w-3" /> סינון</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
               <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                     <th className="px-6 py-4">שם הפריט</th>
                     <th className="px-6 py-4">מק״ט</th>
                     <th className="px-6 py-4">קטגוריה</th>
                     <th className="px-6 py-4">כמות במלאי</th>
                     <th className="px-6 py-4">תוקף</th>
                     <th className="px-6 py-4">סטטוס</th>
                     <th className="px-6 py-4">פעולות</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>טוען מלאי...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">לא נמצאו פריטים</p>
                        <p className="text-sm">נסה לשנות את מונחי החיפוש או הוסף פריט חדש</p>
                      </td>
                    </tr>
                  ) : filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.sku}</td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {item.category}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className={`font-bold ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>
                                 {item.quantity}
                              </span>
                              <span className="text-xs text-gray-500">{item.unit}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 direction-ltr text-right">{item.expiryDate}</td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4">
                           <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 min-h-[44px] min-w-[44px] text-green-600 hover:text-green-700 hover:bg-green-50 touch-manipulation"
                                aria-label="הוסף למלאי"
                                onClick={() => handleQuickAdjust(item, 1)}
                              >
                                 <ArrowUp size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 min-h-[44px] min-w-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                                aria-label="הפחת מהמלאי"
                                onClick={() => handleQuickAdjust(item, -1)}
                                disabled={item.quantity <= 0}
                              >
                                 <ArrowDown size={18} />
                              </Button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

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
              <Label>כמות {adjustment.adjustmentType === 'add' ? 'להוספה' : 'להפחתה'}</Label>
              <Input
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
              <Label>סיבה (אופציונלי)</Label>
              <Input
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

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="קליטת פריט חדש">
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <Label>שם הפריט</Label>
                  <Input
                    name="item-name"
                    autoComplete="off"
                    placeholder="לדוג׳: Botox Allergan 100u"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  />
               </div>
               <div>
                  <Label>מק״ט</Label>
                  <Input
                    name="sku"
                    autoComplete="off"
                    placeholder="BTX-001"
                    value={newItem.sku}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                  />
               </div>
               <div>
                  <Label>קטגוריה</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  >
                     <option>רעלנים (Toxins)</option>
                     <option>חומרי מילוי (Fillers)</option>
                     <option>ציוד מתכלה</option>
                  </select>
               </div>
               <div>
                  <Label>כמות התחלתית</Label>
                  <Input
                    type="number"
                    name="quantity"
                    autoComplete="off"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
               </div>
               <div>
                  <Label>סף התראה</Label>
                  <Input
                    type="number"
                    name="min-quantity"
                    autoComplete="off"
                    placeholder="5"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                  />
               </div>
               <div>
                  <Label>תאריך תפוגה</Label>
                  <Input
                    type="date"
                    name="expiry-date"
                    autoComplete="off"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
               </div>
               <div>
                  <Label>ספק</Label>
                  <Input
                    name="supplier"
                    autoComplete="off"
                    placeholder="שם הספק"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                  />
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={saving}>ביטול</Button>
               <Button onClick={handleAddItem} disabled={saving || !newItem.name.trim()}>
                 {saving ? 'שומר...' : 'שמור במלאי'}
               </Button>
            </div>
        </div>
      </Dialog>
    </div>
  );
};
