import { useState, useEffect } from 'react';
import { Button, Input, Dialog, Label } from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Appointment, Service, AppointmentStatus } from '../../../types';

export type EditAppointmentDialogProps = {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  services: Service[];
  servicesLoading: boolean;
  saving: boolean;
  onSave: (appointmentId: string, updates: {
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
    status: AppointmentStatus;
  }) => void;
};

type EditFormData = {
  serviceId: string;
  date: string;
  time: string;
  notes: string;
  status: AppointmentStatus;
};

export function EditAppointmentDialog({
  appointment,
  open,
  onClose,
  services,
  servicesLoading,
  saving,
  onSave,
}: EditAppointmentDialogProps) {
  const [form, setForm] = useState<EditFormData>({
    serviceId: '',
    date: '',
    time: '',
    notes: '',
    status: 'pending',
  });

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      setForm({
        serviceId: appointment.serviceId,
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes || '',
        status: appointment.status,
      });
    }
  }, [appointment]);

  const handleSave = () => {
    if (!appointment) return;

    const service = services.find(s => s.id === form.serviceId);

    onSave(appointment.id, {
      serviceId: form.serviceId,
      serviceName: service?.name || appointment.serviceName,
      date: form.date,
      time: form.time,
      duration: service?.duration || appointment.duration,
      notes: form.notes || undefined,
      status: form.status,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setForm({
      serviceId: '',
      date: '',
      time: '',
      notes: '',
      status: 'pending',
    });
  };

  if (!appointment) return null;

  const statusOptions: { value: AppointmentStatus; label: string }[] = [
    { value: 'pending', label: 'ממתין' },
    { value: 'confirmed', label: 'מאושר' },
    { value: 'completed', label: 'הושלם' },
    { value: 'cancelled', label: 'בוטל' },
    { value: 'no-show', label: 'לא הגיע' },
  ];

  return (
    <Dialog open={open} onClose={handleClose} title="עריכת תור">
      <div className="space-y-4">
        {/* Patient name - read only */}
        <div>
          <Label>שם המטופל</Label>
          <div className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
            {appointment.patientName}
          </div>
        </div>

        {/* Service selection */}
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
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.duration} דק׳)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date and time */}
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

        {/* Status */}
        <div>
          <Label>סטטוס</Label>
          <Select
            value={form.status}
            onValueChange={(value) => setForm(prev => ({ ...prev, status: value as AppointmentStatus }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סטטוס..." />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="edit-appointment-notes">הערות</Label>
          <textarea
            id="edit-appointment-notes"
            name="notes"
            className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm"
            placeholder="הערות מיוחדות..."
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.serviceId}
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
