import { Button, Input, Dialog, Label } from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Service, Patient, RecurrenceType } from '../../../types';
import { PatientAutocomplete } from './PatientAutocomplete';

// Helper to get Hebrew label for recurrence type
function getRecurrenceLabel(type: RecurrenceType): string {
  const labels: Record<RecurrenceType, string> = {
    none: 'ללא חזרה',
    weekly: 'כל שבוע',
    biweekly: 'כל שבועיים',
    monthly: 'כל חודש',
  };
  return labels[type];
}

export type AppointmentFormData = {
  patientName: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
  // Recurrence fields
  recurrenceType: RecurrenceType;
  recurrenceEndDate?: string;
  recurrenceCount?: number;
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
  patients?: Patient[];
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
  patients = [],
}: AppointmentFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="קביעת תור חדש">
      <div className="space-y-4">
        <div>
          <Label htmlFor="patient-name">שם המטופל</Label>
          {patients.length > 0 ? (
            <PatientAutocomplete
              patients={patients}
              value={form.patientName}
              onChange={(value) => setForm(prev => ({ ...prev, patientName: value }))}
              placeholder="חפש או הכנס שם מטופל..."
            />
          ) : (
            <Input
              id="patient-name"
              name="patient-name"
              autoComplete="name"
              placeholder="הכנס שם מטופל..."
              value={form.patientName}
              onChange={(e) => setForm(prev => ({ ...prev, patientName: e.target.value }))}
            />
          )}
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

        {/* Recurrence settings */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <Label>חזרה</Label>
            <Select
              value={form.recurrenceType}
              onValueChange={(value: RecurrenceType) => setForm(prev => ({ ...prev, recurrenceType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג חזרה..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא חזרה</SelectItem>
                <SelectItem value="weekly">כל שבוע</SelectItem>
                <SelectItem value="biweekly">כל שבועיים</SelectItem>
                <SelectItem value="monthly">כל חודש</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.recurrenceType !== 'none' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מספר פגישות</Label>
                <Input
                  type="number"
                  min="2"
                  max="52"
                  placeholder="למשל: 4"
                  value={form.recurrenceCount || ''}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    recurrenceCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    recurrenceEndDate: e.target.value ? undefined : prev.recurrenceEndDate,
                  }))}
                />
              </div>
              <div>
                <Label>או עד תאריך</Label>
                <Input
                  type="date"
                  value={form.recurrenceEndDate || ''}
                  disabled={!!form.recurrenceCount}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    recurrenceEndDate: e.target.value || undefined,
                    recurrenceCount: e.target.value ? undefined : prev.recurrenceCount,
                  }))}
                />
              </div>
            </div>
          )}

          {form.recurrenceType !== 'none' && (
            <p className="text-xs text-gray-500">
              {form.recurrenceCount
                ? `יווצרו ${form.recurrenceCount} תורים ${getRecurrenceLabel(form.recurrenceType)}`
                : form.recurrenceEndDate
                  ? `תורים ${getRecurrenceLabel(form.recurrenceType)} עד ${new Date(form.recurrenceEndDate).toLocaleDateString('he-IL')}`
                  : 'הזן מספר פגישות או תאריך סיום'}
            </p>
          )}
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
