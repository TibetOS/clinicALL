import { Button, Input, Dialog, Label } from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Service } from '../../../types';

export type AppointmentFormData = {
  patientName: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
};

export type AppointmentFormDialogProps = {
  open: boolean;
  onClose: () => void;
  form: AppointmentFormData;
  setForm: (form: AppointmentFormData | ((prev: AppointmentFormData) => AppointmentFormData)) => void;
  services: Service[];
  servicesLoading: boolean;
  saving: boolean;
  onSave: () => void;
};

export function AppointmentFormDialog({
  open,
  onClose,
  form,
  setForm,
  services,
  servicesLoading,
  saving,
  onSave,
}: AppointmentFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="קביעת תור חדש">
      <div className="space-y-4">
        <div>
          <Label htmlFor="patient-name">שם המטופל</Label>
          <Input
            id="patient-name"
            name="patient-name"
            autoComplete="name"
            placeholder="הכנס שם מטופל..."
            value={form.patientName}
            onChange={(e) => setForm(prev => ({ ...prev, patientName: e.target.value }))}
          />
        </div>
        <div>
          <Label>טיפול</Label>
          <Select
            value={form.serviceId}
            onValueChange={(value) => setForm(prev => ({ ...prev, serviceId: value }))}
            disabled={servicesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={servicesLoading ? 'טוען טיפולים...' : 'בחר טיפול...'} />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration} דק׳)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>תאריך</Label>
            <Input
              type="date"
              name="appointment-date"
              autoComplete="off"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div>
            <Label>שעה</Label>
            <Input
              type="time"
              name="appointment-time"
              autoComplete="off"
              value={form.time}
              onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="appointment-notes">הערות</Label>
          <textarea
            id="appointment-notes"
            name="notes"
            className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm"
            placeholder="הערות מיוחדות..."
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.patientName || !form.serviceId}
          >
            {saving ? 'שומר...' : 'שמור ביומן'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
