import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Alert, AlertTitle, AlertDescription } from '../../components/ui';
import { useAppointments, useServices, useNotifications, usePatients } from '../../hooks';
import { Appointment } from '../../types';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { AppointmentFormDialog, AppointmentFormData } from './calendar/AppointmentFormDialog';
import { CancelAppointmentDialog } from './calendar/CancelAppointmentDialog';

export const Calendar = () => {
  // Default to day view on mobile
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  );
  const { appointments, addAppointment, updateAppointment, fetchAppointments, loading, error } = useAppointments();
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { addNotification } = useNotifications();
  const { patients, error: patientsError } = usePatients();
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);

  // Form state
  const [apptForm, setApptForm] = useState<AppointmentFormData>({
    patientName: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    time: '10:00',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [canceling, setCanceling] = useState(false);

  // Auto-switch to day view on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && view === 'week') {
        setView('day');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Debounce date changes to avoid excessive fetches when navigating quickly
  const [debouncedDate, setDebouncedDate] = useState(currentDate);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDate(currentDate), 150);
    return () => clearTimeout(timer);
  }, [currentDate]);

  // Helper to format hours
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00

  // Memoized week days calculation
  const weekDays = useMemo(() => {
    const start = new Date(debouncedDate);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [debouncedDate]);

  // Memoized appointments grouped by date and hour for O(1) lookup
  const appointmentsBySlot = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach(appt => {
      const apptDate = new Date(appt.date);
      const apptHour = parseInt(appt.time.split(':')[0] ?? '0', 10);
      const key = `${apptDate.getFullYear()}-${apptDate.getMonth()}-${apptDate.getDate()}-${apptHour}`;
      const existing = map.get(key) || [];
      existing.push(appt);
      map.set(key, existing);
    });
    return map;
  }, [appointments]);

  // Memoized appointment counts per day for week view badges
  const appointmentCountByDay = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach(appt => {
      const apptDate = new Date(appt.date);
      const key = `${apptDate.getFullYear()}-${apptDate.getMonth()}-${apptDate.getDate()}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [appointments]);

  const getAppointmentsForSlot = useCallback((day: Date, hour: number): Appointment[] => {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}-${hour}`;
    return appointmentsBySlot.get(key) || [];
  }, [appointmentsBySlot]);

  const handleCancelAppointment = async () => {
    if (!appointmentToDelete) return;

    setCanceling(true);
    const result = await updateAppointment(appointmentToDelete.id, { status: 'cancelled' });
    setCanceling(false);

    if (result) {
      toast.success('התור בוטל בהצלחה');
      setAppointmentToDelete(null);
    } else {
      toast.error('שגיאה בביטול התור');
    }
  };

  const openNewApptDialog = (day?: Date, hour?: number) => {
    // Show loading toast if services haven't loaded yet
    if (servicesLoading) {
      toast.info('טוען טיפולים...');
      return;
    }

    if (day && hour !== undefined) {
      setApptForm(prev => ({
        ...prev,
        date: day.toISOString().split('T')[0] ?? '',
        time: `${hour.toString().padStart(2, '0')}:00`,
      }));
    }
    setIsNewApptOpen(true);
  };

  const handleAddAppointment = async () => {
    if (!apptForm.patientName || !apptForm.serviceId) return;

    setSaving(true);
    const service = services.find(s => s.id === apptForm.serviceId);

    // Try to find existing patient by name
    const existingPatient = patients.find(
      p => p.name.toLowerCase() === apptForm.patientName.toLowerCase()
    );

    const result = await addAppointment({
      patientId: existingPatient?.id || `walk-in-${Date.now()}`,
      patientName: apptForm.patientName,
      serviceId: apptForm.serviceId,
      serviceName: service?.name || '',
      date: apptForm.date,
      time: apptForm.time,
      duration: service?.duration || 30,
      status: 'pending',
      notes: apptForm.notes,
    });

    setSaving(false);

    if (result) {
      // Check if patient needs a health declaration
      const needsDeclaration = !existingPatient ||
        existingPatient.declarationStatus === 'none' ||
        existingPatient.declarationStatus === 'expired';

      // Create notification for clinic owner about new appointment
      if (needsDeclaration) {
        await addNotification({
          title: 'תור חדש נקבע',
          message: `${apptForm.patientName} קבע/ה תור ל${service?.name || 'טיפול'}. האם לשלוח הצהרת בריאות?`,
          type: 'info',
          action: 'send_declaration',
          metadata: {
            appointmentId: result.id,
            patientId: existingPatient?.id,
            patientName: apptForm.patientName,
            patientPhone: existingPatient?.phone,
            patientEmail: existingPatient?.email,
            appointmentDate: apptForm.date,
            appointmentTime: apptForm.time,
            serviceName: service?.name,
          },
        });
      }

      setIsNewApptOpen(false);
      setApptForm({
        patientName: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0] ?? '',
        time: '10:00',
        notes: '',
      });
      toast.success('התור נקבע בהצלחה');
    } else {
      toast.error('שגיאה בקביעת התור');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col page-transition">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onNewAppointment={() => openNewApptDialog()}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת תורים</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => fetchAppointments()}>
              נסה שוב
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for services/patients data issues */}
      {(servicesError || patientsError) && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>אזהרה</AlertTitle>
          <AlertDescription>
            {servicesError && 'שגיאה בטעינת שירותים. '}
            {patientsError && 'שגיאה בטעינת מטופלים - התאמת שמות לא תפעל.'}
          </AlertDescription>
        </Alert>
      )}

      <CalendarGrid
        weekDays={weekDays}
        hours={hours}
        loading={loading}
        appointments={appointments}
        appointmentCountByDay={appointmentCountByDay}
        getAppointmentsForSlot={getAppointmentsForSlot}
        onSlotClick={openNewApptDialog}
        onCancelRequest={setAppointmentToDelete}
      />

      <AppointmentFormDialog
        open={isNewApptOpen}
        onClose={() => setIsNewApptOpen(false)}
        form={apptForm}
        setForm={setApptForm}
        services={services}
        servicesLoading={servicesLoading}
        saving={saving}
        onSave={handleAddAppointment}
      />

      <CancelAppointmentDialog
        appointment={appointmentToDelete}
        canceling={canceling}
        onCancel={handleCancelAppointment}
        onClose={() => setAppointmentToDelete(null)}
      />
    </div>
  );
};
