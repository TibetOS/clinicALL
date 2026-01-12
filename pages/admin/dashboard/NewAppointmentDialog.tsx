import {
  Button, Input, Label, Dialog,
} from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Service } from '../../../types';

export type AppointmentForm = {
  patientId: string;
  patientName: string;
  serviceId: string;
  date: string;
  time: string;
};

export type NewAppointmentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  form: AppointmentForm;
  setForm: (form: AppointmentForm) => void;
  services: Service[];
  saving: boolean;
  onSubmit: () => void;
};

export function NewAppointmentDialog({
  isOpen,
  onClose,
  form,
  setForm,
  services,
  saving,
  onSubmit,
}: NewAppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} title="קביעת תור חדש">
      <div className="space-y-4">
        <div>
          <Label>שם המטופלת</Label>
          <Input
            name="patient-name"
            autoComplete="name"
            placeholder="הכניסי שם מטופלת..."
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
          />
        </div>
        <div>
          <Label>טיפול</Label>
          <Select
            value={form.serviceId}
            onValueChange={(value) => setForm({ ...form, serviceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחרי טיפול..." />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.duration} דק׳)
                </SelectItem>
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
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label>שעה</Label>
            <Input
              type="time"
              name="appointment-time"
              autoComplete="off"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !form.patientName || !form.serviceId}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {saving ? 'שומר...' : 'שמור ביומן'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
