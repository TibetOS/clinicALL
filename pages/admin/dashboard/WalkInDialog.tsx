import {
  Button, Input, Label, Dialog,
} from '../../../components/ui';

export type WalkInForm = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type WalkInDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  form: WalkInForm;
  setForm: (form: WalkInForm) => void;
  saving: boolean;
  onSubmit: () => void;
};

export function WalkInDialog({
  isOpen,
  onClose,
  form,
  setForm,
  saving,
  onSubmit,
}: WalkInDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} title="קבלת לקוחה חדשה">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>שם פרטי</Label>
            <Input
              name="given-name"
              autoComplete="given-name"
              placeholder="שרה"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>שם משפחה</Label>
            <Input
              name="family-name"
              autoComplete="family-name"
              placeholder="כהן"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>טלפון נייד</Label>
          <Input
            type="tel"
            name="tel"
            autoComplete="tel"
            placeholder="050-0000000"
            className="direction-ltr text-right"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !form.firstName || !form.phone}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {saving ? 'שומר...' : 'קלוט לקוחה'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
