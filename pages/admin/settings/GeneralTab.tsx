import { Card, Button, Input, Label } from '../../../components/ui';

export type BusinessFormData = {
  businessName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
};

export type GeneralTabProps = {
  businessForm: BusinessFormData;
  setBusinessForm: (form: BusinessFormData | ((prev: BusinessFormData) => BusinessFormData)) => void;
  businessSaving: boolean;
  onSave: () => void;
};

export function GeneralTab({
  businessForm,
  setBusinessForm,
  businessSaving,
  onSave,
}: GeneralTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
        <h3 className="text-lg font-bold mb-6">פרטי העסק</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם העסק (חשבוניות)</Label>
              <Input
                name="organization"
                autoComplete="organization"
                value={businessForm.businessName}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            <div>
              <Label>מספר עוסק / ח.פ.</Label>
              <Input
                name="tax-id"
                autoComplete="off"
                value={businessForm.taxId}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, taxId: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>כתובת למשלוח דואר</Label>
            <Input
              name="street-address"
              autoComplete="street-address"
              value={businessForm.address}
              onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>טלפון ראשי</Label>
              <Input
                type="tel"
                name="tel"
                autoComplete="tel"
                value={businessForm.phone}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>אימייל לחיובים</Label>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                value={businessForm.email}
                readOnly
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">האימייל מוגדר בפרופיל המשתמש</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t flex justify-end">
          <Button onClick={onSave} disabled={businessSaving}>
            {businessSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
