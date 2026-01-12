import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Alert, AlertTitle, AlertDescription } from '../../components/ui';
import { useAppointments, useServices, useNotifications, usePatients } from '../../hooks';
import { Appointment } from '../../types';
import { CalendarHeader, CalendarView } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { MonthView } from './calendar/MonthView';
import { AppointmentFormDialog, AppointmentFormData } from './calendar/AppointmentFormDialog';
import { CancelAppointmentDialog } from './calendar/CancelAppointmentDialog';
import { ConflictWarningDialog } from './calendar/ConflictWarningDialog';
import { EditAppointmentDialog } from './calendar/EditAppointmentDialog';
import { useTimeSlots, useDragDrop } from './calendar/hooks';

export const Calendar = () => {
  // Default to day view on mobile
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  );
  const { appointments, addAppointment, addRecurringAppointment, updateAppointment, fetchAppointments, loading, error } = useAppointments();
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { addNotification } = useNotifications();
  const { patients, error: patientsError } = usePatients();

  // Use extracted hooks for time slots and drag-and-drop
  const {
    hours,
    appointmentCountByDay,
    getAppointmentsForSlot,
    checkConflict,
  } = useTimeSlots({ appointments });

  // Reschedule callback for drag-and-drop
  const handleReschedule = useCallback(async (
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<boolean> => {
    const result = await updateAppointment(appointmentId, {
      date: newDate,
      time: newTime,
    });
    if (result) {
      toast.success('התור הוזז בהצלחה');
      return true;
    } else {
      toast.error('שגיאה בהזזת התור');
      return false;
    }
  }, [updateAppointment]);

  const {
    activeId,
    conflict,
    showConflictDialog,
    pendingMove,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleConflictConfirm,
    handleConflictCancel,
  } = useDragDrop({
    appointments,
    checkConflict,
    onReschedule: handleReschedule,
  });
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);

  // Form state
  const [apptForm, setApptForm] = useState<AppointmentFormData>({
    patientName: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    time: '10:00',
    notes: '',
    recurrenceType: 'none',
  });
  const [saving, setSaving] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs, textareas, or when dialogs are open
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      const isDialogOpen = isNewApptOpen || !!appointmentToDelete || !!appointmentToEdit || showConflictDialog;

      if (isInputFocused || isDialogOpen) return;

      // Navigation helper - accounts for RTL
      const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        // In RTL, ArrowRight means "previous" (visual direction)
        const isPrev = direction === 'prev';
        const delta = view === 'day' ? 1 : view === 'week' ? 7 : 30;
        newDate.setDate(newDate.getDate() + (isPrev ? -delta : delta));
        setCurrentDate(newDate);
      };

      switch (e.key.toLowerCase()) {
        case 't':
          // Go to today
          setCurrentDate(new Date());
          break;
        case 'n':
          // New appointment
          openNewApptDialog();
          break;
        case 'd':
          // Day view
          setView('day');
          break;
        case 'w':
          // Week view (only on desktop)
          if (window.innerWidth >= 768) {
            setView('week');
          }
          break;
        case 'm':
          // Month view
          setView('month');
          break;
        case 'arrowleft':
          // In RTL, left arrow goes forward (next)
          navigate('next');
          break;
        case 'arrowright':
          // In RTL, right arrow goes backward (prev)
          navigate('prev');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, view, isNewApptOpen, appointmentToDelete, appointmentToEdit, showConflictDialog]);

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

  const handleEditAppointment = async (
    appointmentId: string,
    updates: {
      serviceId: string;
      serviceName: string;
      date: string;
      time: string;
      duration: number;
      notes?: string;
      status: import('../../types').AppointmentStatus;
    }
  ) => {
    setSavingEdit(true);
    const result = await updateAppointment(appointmentId, updates);
    setSavingEdit(false);

    if (result) {
      toast.success('התור עודכן בהצלחה');
      setAppointmentToEdit(null);
    } else {
      toast.error('שגיאה בעדכון התור');
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

    const appointmentInput = {
      patientId: existingPatient?.id || `walk-in-${Date.now()}`,
      patientName: apptForm.patientName,
      serviceId: apptForm.serviceId,
      serviceName: service?.name || '',
      date: apptForm.date,
      time: apptForm.time,
      duration: service?.duration || 30,
      status: 'pending' as const,
      notes: apptForm.notes,
    };

    // Use recurring or single appointment based on recurrence type
    let result: Appointment | Appointment[] | null;
    if (apptForm.recurrenceType !== 'none') {
      const recurrence = {
        type: apptForm.recurrenceType,
        endDate: apptForm.recurrenceEndDate,
        count: apptForm.recurrenceCount,
      };
      result = await addRecurringAppointment(appointmentInput, recurrence);
    } else {
      result = await addAppointment(appointmentInput);
    }

    setSaving(false);

    // Check if we got results (single appointment or array of appointments)
    const hasResult = Array.isArray(result) ? result.length > 0 : result !== null;
    const firstAppointment = Array.isArray(result) ? result[0] : result;

    if (hasResult && firstAppointment) {
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
            appointmentId: firstAppointment.id,
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
        recurrenceType: 'none',
      });

      // Show appropriate success message
      if (Array.isArray(result) && result.length > 1) {
        toast.success(`${result.length} תורים נקבעו בהצלחה`);
      } else {
        toast.success('התור נקבע בהצלחה');
      }
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

      {view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          appointments={appointments}
          onDayClick={(date) => {
            setCurrentDate(date);
            setView('day');
          }}
        />
      ) : (
        <CalendarGrid
          weekDays={weekDays}
          hours={hours}
          loading={loading}
          appointments={appointments}
          appointmentCountByDay={appointmentCountByDay}
          getAppointmentsForSlot={getAppointmentsForSlot}
          onSlotClick={openNewApptDialog}
          onCancelRequest={setAppointmentToDelete}
          onEditRequest={setAppointmentToEdit}
          onViewDetails={(appt) => {
            toast.info(`${appt.patientName} - ${appt.serviceName}`, {
              description: `${new Date(appt.date).toLocaleDateString('he-IL')} בשעה ${appt.time}`,
            });
          }}
          activeId={activeId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      )}

      <AppointmentFormDialog
        open={isNewApptOpen}
        onClose={() => setIsNewApptOpen(false)}
        form={apptForm}
        setForm={setApptForm}
        services={services}
        servicesLoading={servicesLoading}
        saving={saving}
        onSave={handleAddAppointment}
        patients={patients}
      />

      <CancelAppointmentDialog
        appointment={appointmentToDelete}
        canceling={canceling}
        onCancel={handleCancelAppointment}
        onClose={() => setAppointmentToDelete(null)}
      />

      <EditAppointmentDialog
        appointment={appointmentToEdit}
        open={!!appointmentToEdit}
        onClose={() => setAppointmentToEdit(null)}
        services={services}
        servicesLoading={servicesLoading}
        saving={savingEdit}
        onSave={handleEditAppointment}
      />

      <ConflictWarningDialog
        open={showConflictDialog}
        onClose={handleConflictCancel}
        onConfirm={handleConflictConfirm}
        conflict={conflict}
        newTime={pendingMove?.newTime ?? ''}
        newDate={pendingMove?.newDate ?? ''}
      />
    </div>
  );
};
