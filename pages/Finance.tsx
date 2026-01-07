
import React, { useState } from 'react';
import { 
  DollarSign, CreditCard, Download, Plus, Search, Filter, 
  FileText, TrendingUp, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label } from '../components/ui';
import { useInvoices, usePatients, useServices } from '../hooks';
import { Invoice, InvoiceItem } from '../types';

export const FinancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  // Use hooks for data
  const { invoices } = useInvoices();
  const { patients } = usePatients();
  const { services } = useServices();

  // New Invoice State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);

  const filteredInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.includes(searchTerm)
  );

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceItems(newItems);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">כספים וחשבוניות</h1>
           <p className="text-muted-foreground">ניהול תזרים מזומנים, הפקת מסמכים וגבייה</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Download size={16} className="ml-2"/> דוח חודשי</Button>
            <Button className="shadow-sm" onClick={() => setIsNewInvoiceOpen(true)}>
               <Plus className="ml-2 h-4 w-4" /> חשבונית חדשה
            </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4 bg-white border-t-4 border-t-emerald-500 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-sm font-medium text-gray-500">הכנסות החודש</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₪42,500</h3>
               </div>
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20}/></div>
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium">+12% מחודש שעבר</div>
         </Card>
         
         <Card className="p-4 bg-white border-t-4 border-t-blue-500 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-sm font-medium text-gray-500">עסקאות בכרטיס אשראי</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₪28,300</h3>
               </div>
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={20}/></div>
            </div>
         </Card>

         <Card className="p-4 bg-white border-t-4 border-t-orange-500 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-sm font-medium text-gray-500">חוב פתוח (גבייה)</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₪4,200</h3>
               </div>
               <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle size={20}/></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">3 חשבוניות ממתינות לתשלום</div>
         </Card>

         <Card className="p-4 bg-white border-t-4 border-t-purple-500 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-sm font-medium text-gray-500">ממוצע לעסקה</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₪850</h3>
               </div>
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><DollarSign size={20}/></div>
            </div>
         </Card>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
         <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">תנועות אחרונות</h3>
            <div className="flex gap-2 w-full sm:w-auto">
               <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                     placeholder="חיפוש לפי שם או מספר..." 
                     className="pr-9 h-9"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" size="sm"><Filter size={14} className="ml-2"/> סינון</Button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
               <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                     <th className="px-6 py-4">מספר חשבונית</th>
                     <th className="px-6 py-4">לקוח</th>
                     <th className="px-6 py-4">תאריך</th>
                     <th className="px-6 py-4">פירוט</th>
                     <th className="px-6 py-4">סכום</th>
                     <th className="px-6 py-4">סטטוס</th>
                     <th className="px-6 py-4">פעולות</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map(inv => (
                     <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-600">#{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{inv.patientName}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                           {inv.items.map(i => i.description).join(', ')}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">₪{inv.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <Badge variant={
                              inv.status === 'paid' ? 'success' : 
                              inv.status === 'pending' ? 'warning' : 
                              inv.status === 'overdue' ? 'destructive' : 'secondary'
                           }>
                              {inv.status === 'paid' ? 'שולם' : 
                               inv.status === 'pending' ? 'ממתין' : 
                               inv.status === 'refunded' ? 'זוכה' : 'באיחור'}
                           </Badge>
                        </td>
                        <td className="px-6 py-4">
                           <Button variant="ghost" size="sm" className="h-8">
                              <FileText size={14} className="text-gray-500" />
                           </Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={isNewInvoiceOpen} onClose={() => setIsNewInvoiceOpen(false)} title="הפקת חשבונית מס / קבלה">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>עבור מטופל</Label>
                  <select 
                     className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                     value={selectedPatient}
                     onChange={(e) => setSelectedPatient(e.target.value)}
                  >
                     <option value="">בחר מטופל...</option>
                     {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
               </div>
               <div>
                  <Label>תאריך ערך</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
               </div>
            </div>

            <div className="space-y-3">
               <Label>פריטים לחיוב</Label>
               {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                     <div className="flex-1">
                        <Input 
                           placeholder="תיאור השירות..." 
                           value={item.description}
                           onChange={(e) => updateItem(idx, 'description', e.target.value)}
                           list="services"
                        />
                        <datalist id="services">
                           {services.map(s => <option key={s.id} value={s.name} />)}
                        </datalist>
                     </div>
                     <div className="w-20">
                        <Input 
                           type="number" 
                           placeholder="כמות" 
                           value={item.quantity}
                           onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                        />
                     </div>
                     <div className="w-28">
                        <Input 
                           type="number" 
                           placeholder="מחיר" 
                           value={item.price}
                           onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                        />
                     </div>
                  </div>
               ))}
               <Button variant="ghost" size="sm" onClick={addItem} className="text-primary hover:text-primary hover:bg-primary/5">
                  <Plus size={14} className="ml-2"/> הוסף שורה
               </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
               <span className="font-bold text-gray-700">סה״כ לתשלום:</span>
               <span className="text-2xl font-bold text-primary">₪{calculateTotal().toLocaleString()}</span>
            </div>

            <div className="space-y-3">
               <Label>אמצעי תשלום</Label>
               <div className="flex gap-3">
                  {['כרטיס אשראי', 'מזומן', 'Bit', 'העברה'].map(m => (
                     <button key={m} className="px-4 py-2 border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium">
                        {m}
                     </button>
                  ))}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsNewInvoiceOpen(false)}>ביטול</Button>
               <Button onClick={() => setIsNewInvoiceOpen(false)} className="shadow-md">
                  <CheckCircle2 size={16} className="ml-2"/> הפק מסמך
               </Button>
            </div>
         </div>
      </Dialog>
    </div>
  );
};
