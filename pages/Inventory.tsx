
import React, { useState } from 'react';
import {
  Search, Filter, Plus, Package, AlertTriangle,
  ArrowDown, ArrowUp, History, Download
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label } from '../components/ui';
import { useInventory } from '../hooks';
import { InventoryItem } from '../types';

export const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Use hook for data
  const { inventory, updateQuantity } = useInventory();

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
         <Card className="p-4 flex items-center gap-4 border-l-4 border-l-red-500 bg-red-50/20">
            <div className="p-3 bg-white rounded-full shadow-sm text-red-500"><AlertTriangle size={24}/></div>
            <div>
               <p className="text-sm font-medium text-gray-500">פריטים במלאי קריטי</p>
               <h3 className="text-2xl font-bold text-gray-900">{inventory.filter(i => i.status === 'critical').length}</h3>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 border-l-4 border-l-yellow-500 bg-yellow-50/20">
            <div className="p-3 bg-white rounded-full shadow-sm text-yellow-600"><Package size={24}/></div>
            <div>
               <p className="text-sm font-medium text-gray-500">שווי מלאי כולל</p>
               <h3 className="text-2xl font-bold text-gray-900">₪42,500</h3>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 bg-blue-50/20">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600"><History size={24}/></div>
            <div>
               <p className="text-sm font-medium text-gray-500">תנועות החודש</p>
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
                  {filteredItems.map(item => (
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
                           <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                 <ArrowUp size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                 <ArrowDown size={16} />
                              </Button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="קליטת פריט חדש">
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <Label>שם הפריט</Label>
                  <Input placeholder="לדוג׳: Botox Allergan 100u" />
               </div>
               <div>
                  <Label>מק״ט</Label>
                  <Input placeholder="BTX-001" />
               </div>
               <div>
                  <Label>קטגוריה</Label>
                  <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                     <option>רעלנים (Toxins)</option>
                     <option>חומרי מילוי (Fillers)</option>
                     <option>ציוד מתכלה</option>
                  </select>
               </div>
               <div>
                  <Label>כמות התחלתית</Label>
                  <Input type="number" placeholder="0" />
               </div>
               <div>
                  <Label>סף התראה</Label>
                  <Input type="number" placeholder="5" />
               </div>
               <div>
                  <Label>תאריך תפוגה</Label>
                  <Input type="date" />
               </div>
               <div>
                  <Label>ספק</Label>
                  <Input placeholder="שם הספק" />
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsAddOpen(false)}>ביטול</Button>
               <Button onClick={() => setIsAddOpen(false)}>שמור במלאי</Button>
            </div>
        </div>
      </Dialog>
    </div>
  );
};
