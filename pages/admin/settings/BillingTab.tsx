import {
  Crown, CreditCard, ArrowUpRight, Download, Check, XCircle, Sparkles,
} from 'lucide-react';
import { Card, Button, Input, Badge, Label, ComingSoon, Spinner } from '../../../components/ui';
import { Progress } from '../../../components/ui/progress';
import { Invoice } from '../../../types';

export type BillingFormData = {
  billingName: string;
  billingTaxId: string;
  billingAddress: string;
  billingEmail: string;
};

export type BillingTabProps = {
  profileName: string | null;
  activePatients: number;
  monthlyAppointments: number;
  invoices: Invoice[];
  invoicesLoading: boolean;
  billingForm: BillingFormData;
  setBillingForm: (form: BillingFormData | ((prev: BillingFormData) => BillingFormData)) => void;
  billingSaving: boolean;
  onSave: () => void;
};

export function BillingTab({
  profileName,
  activePatients,
  monthlyAppointments,
  invoices,
  invoicesLoading,
  billingForm,
  setBillingForm,
  billingSaving,
  onSave,
}: BillingTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Current Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-3xl border-stone-100 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-teal-400 to-emerald-400"></div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Crown size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Professional</h3>
                    <Badge variant="success">פעיל</Badge>
                  </div>
                  <p className="text-gray-500 text-sm">חבילה חודשית • מתחדשת ב-15 לחודש</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-gray-900">₪349<span className="text-base font-normal text-gray-500">/חודש</span></p>
                <p className="text-xs text-gray-400">לפני מע״מ</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl">
              <div>
                <p className="text-xs text-gray-500 mb-1">מטופלים פעילים</p>
                <p className="text-lg font-bold text-gray-900">{activePatients} <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                <Progress value={Math.min((activePatients / 500) * 100, 100)} className="h-1.5 mt-1" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">תורים החודש</p>
                <p className="text-lg font-bold text-gray-900">{monthlyAppointments} <span className="text-sm font-normal text-gray-400">/ ללא הגבלה</span></p>
                <Progress value={100} className="h-1.5 mt-1" indicatorClassName="bg-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">SMS שנשלחו</p>
                <p className="text-lg font-bold text-gray-900">-- <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                <Progress value={0} className="h-1.5 mt-1" indicatorClassName="bg-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">שאילתות AI</p>
                <p className="text-lg font-bold text-gray-900">-- <span className="text-sm font-normal text-gray-400">/ 200</span></p>
                <Progress value={0} className="h-1.5 mt-1" indicatorClassName="bg-purple-500" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <ComingSoon>
                <Button variant="outline" size="sm" className="gap-2">
                  שדרג חבילה <ArrowUpRight size={14} />
                </Button>
              </ComingSoon>
              <ComingSoon>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  בטל מנוי
                </Button>
              </ComingSoon>
            </div>
          </Card>
        </div>

        {/* Payment Method */}
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4">אמצעי תשלום</h3>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-start mb-8">
              <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded"></div>
              <span className="text-xs opacity-60">VISA</span>
            </div>
            <p className="font-mono text-lg tracking-wider mb-4">•••• •••• •••• ****</p>
            <div className="flex justify-between text-xs">
              <div>
                <p className="opacity-60">בעל הכרטיס</p>
                <p>{profileName || '---'}</p>
              </div>
              <div>
                <p className="opacity-60">תוקף</p>
                <p>--/--</p>
              </div>
            </div>
          </div>
          <ComingSoon>
            <Button variant="outline" className="w-full gap-2">
              עדכן כרטיס <CreditCard size={16} />
            </Button>
          </ComingSoon>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
        <h3 className="text-lg font-bold mb-6">השוואת חבילות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter */}
          <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors">
            <h4 className="font-bold text-gray-900 mb-1">Starter</h4>
            <p className="text-2xl font-bold mb-4">₪149<span className="text-sm font-normal text-gray-500">/חודש</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עד 100 מטופלים</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> יומן תורים בסיסי</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 100 SMS לחודש</li>
              <li className="flex items-center gap-2 text-gray-400"><XCircle size={14} /> עוזר AI</li>
              <li className="flex items-center gap-2 text-gray-400"><XCircle size={14} /> דוחות מתקדמים</li>
            </ul>
            <ComingSoon>
              <Button variant="outline" className="w-full">בחר חבילה</Button>
            </ComingSoon>
          </div>

          {/* Professional - Current */}
          <div className="border-2 border-primary rounded-2xl p-5 relative bg-primary/5">
            <Badge className="absolute -top-3 right-4 bg-primary text-white">החבילה שלך</Badge>
            <h4 className="font-bold text-gray-900 mb-1">Professional</h4>
            <p className="text-2xl font-bold mb-4">₪349<span className="text-sm font-normal text-gray-500">/חודש</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עד 500 מטופלים</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> יומן מתקדם + סנכרון</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 500 SMS לחודש</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עוזר AI (200 שאילתות)</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> דוחות מתקדמים</li>
            </ul>
            <Button className="w-full" disabled>החבילה הנוכחית</Button>
          </div>

          {/* Enterprise */}
          <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors bg-gradient-to-br from-gray-50 to-white">
            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">Enterprise <Sparkles size={14} className="text-amber-500" /></h4>
            <p className="text-2xl font-bold mb-4">₪699<span className="text-sm font-normal text-gray-500">/חודש</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מטופלים ללא הגבלה</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מספר סניפים</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> SMS ללא הגבלה</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> AI ללא הגבלה + התאמה</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מנהל לקוח ייעודי</li>
            </ul>
            <ComingSoon>
              <Button variant="outline" className="w-full">שדרג עכשיו</Button>
            </ComingSoon>
          </div>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">היסטוריית חשבוניות</h3>
          <ComingSoon>
            <Button variant="ghost" size="sm" className="gap-2">
              הורד הכל <Download size={14} />
            </Button>
          </ComingSoon>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-right py-3 px-4 font-medium">מספר חשבונית</th>
                <th className="text-right py-3 px-4 font-medium">תאריך</th>
                <th className="text-right py-3 px-4 font-medium">סכום</th>
                <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                <th className="text-right py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <Spinner className="h-6 w-6 mx-auto mb-2" />
                    טוען חשבוניות...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    אין חשבוניות עדיין
                  </td>
                </tr>
              ) : (
                invoices.slice(0, 10).map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                    <td className="py-3 px-4 text-gray-900">₪{inv.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'destructive'}>
                        {inv.status === 'paid' ? 'שולם' : inv.status === 'pending' ? 'ממתין' : inv.status === 'overdue' ? 'באיחור' : 'החזר'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <ComingSoon>
                        <Button variant="ghost" size="sm">
                          <Download size={14} />
                        </Button>
                      </ComingSoon>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing Contact */}
      <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
        <h3 className="text-lg font-bold mb-4">פרטי חיוב</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>שם לחשבונית</Label>
            <Input
              name="billing-organization"
              autoComplete="organization"
              value={billingForm.billingName}
              onChange={(e) => setBillingForm(prev => ({ ...prev, billingName: e.target.value }))}
            />
          </div>
          <div>
            <Label>ח.פ. / ע.מ.</Label>
            <Input
              name="billing-tax-id"
              autoComplete="off"
              value={billingForm.billingTaxId}
              onChange={(e) => setBillingForm(prev => ({ ...prev, billingTaxId: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>כתובת לחשבונית</Label>
            <Input
              name="billing-street-address"
              autoComplete="street-address"
              value={billingForm.billingAddress}
              onChange={(e) => setBillingForm(prev => ({ ...prev, billingAddress: e.target.value }))}
            />
          </div>
          <div>
            <Label>אימייל לקבלת חשבוניות</Label>
            <Input
              type="email"
              name="billing-email"
              autoComplete="email"
              value={billingForm.billingEmail}
              onChange={(e) => setBillingForm(prev => ({ ...prev, billingEmail: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t flex justify-end">
          <Button onClick={onSave} disabled={billingSaving}>
            {billingSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
