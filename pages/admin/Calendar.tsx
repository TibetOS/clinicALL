import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, FileCheck, Clock, AlertCircle, MoreHorizontal, Eye, Trash2, Phone, Edit2, X as XIcon, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card, Button, Input, Dialog, Label,
  Alert, AlertTitle, AlertDescription, Spinner,
} from '../../components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useAppointments, useServices, useNotifications, usePatients } from '../../hooks';
import { AppointmentDeclarationStatus, Appointment } from '../../types';

// Declaration status indicator config
const getDeclarationIndicator = (status?: AppointmentDeclarationStatus) => {
  switch (status) {
    case 'received':
      return { color: 'bg-green-500', title: 'הצהרה התקבלה', Icon: FileCheck };
    case 'pending':
      return { color: 'bg-yellow-500', title: 'ממתין להצהרה', Icon: Clock };
    case 'required':
      return { color: 'bg-red-500', title: 'נדרשת הצהרה', Icon: AlertCircle };
    case 'not_required':
    default:
      return null;
  }
};

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
  const [apptForm, setApptForm] = useState({
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200" role="group" aria-label="ניווט בלוח שנה">
          <Button
            variant="ghost"
            size="icon"
            aria-label="שבוע קודם"
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }}
          >
            <ChevronRight />
          </Button>
          <span className="font-bold text-lg min-w-[150px] text-center" aria-live="polite">
            {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="שבוע הבא"
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }}
          >
            <ChevronLeft />
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm" role="tablist" aria-label="תצוגת לוח שנה">
            <button
              role="tab"
              aria-selected={view === 'day'}
              aria-controls="calendar-grid"
              className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${view === 'day' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setView('day')}
            >
              יום
            </button>
            <button
              role="tab"
              aria-selected={view === 'week'}
              aria-controls="calendar-grid"
              className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${view === 'week' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setView('week')}
            >
              שבוע
            </button>
          </div>
          <Button onClick={() => openNewApptDialog()} className="shadow-sm gap-2" aria-label="קביעת תור חדש">
            תור חדש <Plus size={16} />
          </Button>
        </div>
      </div>

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

      {/* Calendar Grid */}
      <Card id="calendar-grid" role="grid" aria-label="לוח תורים" className="flex-1 overflow-hidden flex flex-col border-stone-200">
        {/* Header Row */}
        <div className="flex border-b border-gray-100">
          <div className="w-14 border-l border-gray-100 shrink-0 bg-gray-50"></div>
          {weekDays.map((day, i) => {
            const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const count = appointmentCountByDay.get(dayKey) || 0;
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`flex-1 text-center py-3 border-l border-gray-100 ${isToday ? 'bg-primary/5' : ''}`}>
                <div className="text-xs text-gray-500 mb-1">{day.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`text-lg font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-primary text-white shadow-md' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                  {count > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium" title={`${count} תורים`}>
                      {count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="h-8 w-8 text-primary" />
                <span className="text-gray-600 text-sm">טוען תורים...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && appointments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-30 pointer-events-none">
              <div className="text-center p-8">
                <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">אין תורים מתוכננים</h3>
                <p className="text-gray-400 text-sm mb-4">לחץ על משבצת כדי להוסיף תור חדש</p>
              </div>
            </div>
          )}

          {hours.map(hour => (
            <div key={hour} className="flex min-h-[80px]" role="row">
              <div className="w-14 border-l border-b border-gray-100 bg-gray-50 text-xs text-gray-500 text-center pt-2 relative" role="rowheader">
                <span className="-top-3 relative">{hour}:00</span>
              </div>
              {weekDays.map((day, i) => {
                const cellAppts = getAppointmentsForSlot(day, hour);
                return (
                  <div
                    key={i}
                    role="gridcell"
                    aria-label={`${day.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} ${hour}:00${cellAppts.length > 0 ? `, ${cellAppts.length} תורים` : ''}`}
                    className="flex-1 border-l border-b border-gray-100 relative group transition-colors hover:bg-gray-50"
                  >
                    {/* Add Button on Hover */}
                    <button
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
                      onClick={() => openNewApptDialog(day, hour)}
                      aria-label={`הוסף תור ב${day.toLocaleDateString('he-IL', { weekday: 'long' })} ${hour}:00`}
                    >
                      <Plus className="text-primary bg-white rounded-full shadow-sm p-1 w-6 h-6 border border-gray-100" />
                    </button>

                    {/* Appointments */}
                    {cellAppts.map(appt => {
                      const declIndicator = getDeclarationIndicator(appt.declarationStatus);
                      return (
                        <Popover key={appt.id}>
                          <PopoverTrigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={`תור: ${appt.patientName}, ${appt.serviceName}, ${appt.time}`}
                              className={`absolute left-1 right-1 p-2 rounded-lg text-xs shadow-sm border-l-4 cursor-pointer z-20 hover:scale-[1.02] transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
                                 ${appt.status === 'confirmed' ? 'bg-green-50 border-green-500 text-green-800' :
                                   appt.status === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-gray-100 border-gray-400 text-gray-700'}
                              `}
                              style={{
                                top: `${(parseInt(appt.time.split(':')[1] ?? '0', 10) / 60) * 100}%`,
                                height: `${(appt.duration / 60) * 100}%`,
                                minHeight: '40px'
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="font-bold truncate flex-1">{appt.patientName}</span>
                                {declIndicator && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${declIndicator.color}`} />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>{declIndicator.title}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="truncate opacity-80">{appt.serviceName}</div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" align="start">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-sm">{appt.patientName}</h4>
                                  <p className="text-xs text-muted-foreground">{appt.serviceName}</p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="אפשרויות נוספות">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2">
                                      צפייה בפרטים <Eye className="h-4 w-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      עריכה <Edit2 className="h-4 w-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      התקשר ללקוח <Phone className="h-4 w-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 text-red-600 focus:text-red-600"
                                      onClick={() => setAppointmentToDelete(appt)}
                                    >
                                      ביטול תור <Trash2 className="h-4 w-4" />
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                                <div>
                                  <span className="text-muted-foreground block">תאריך</span>
                                  <span className="font-medium">{new Date(appt.date).toLocaleDateString('he-IL')}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">שעה</span>
                                  <span className="font-medium">{appt.time}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">משך</span>
                                  <span className="font-medium">{appt.duration} דק׳</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">סטטוס</span>
                                  <span className={`font-medium ${appt.status === 'confirmed' ? 'text-green-600' : appt.status === 'pending' ? 'text-amber-600' : 'text-gray-600'}`}>
                                    {appt.status === 'confirmed' ? 'מאושר' : appt.status === 'pending' ? 'ממתין' : 'בוטל'}
                                  </span>
                                </div>
                              </div>
                              {appt.notes && (
                                <div className="text-xs border-t pt-2">
                                  <span className="text-muted-foreground block mb-1">הערות</span>
                                  <p className="text-gray-700">{appt.notes}</p>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Current Time Indicator */}
          <div
            className="absolute left-14 right-0 border-t-2 border-red-400 z-30 pointer-events-none flex items-center"
            style={{ top: `${((new Date().getHours() - 8) * 80) + ((new Date().getMinutes() / 60) * 80)}px` }}
          >
            <div className="w-2 h-2 bg-red-400 rounded-full -ml-1"></div>
          </div>
        </div>
      </Card>

      {/* New Appointment Dialog */}
      <Dialog open={isNewApptOpen} onClose={() => setIsNewApptOpen(false)} title="קביעת תור חדש">
        <div className="space-y-4">
          <div>
            <Label htmlFor="patient-name">שם המטופל</Label>
            <Input
              id="patient-name"
              name="patient-name"
              autoComplete="name"
              placeholder="הכנס שם מטופל..."
              value={apptForm.patientName}
              onChange={(e) => setApptForm(prev => ({ ...prev, patientName: e.target.value }))}
            />
          </div>
          <div>
            <Label>טיפול</Label>
            <Select
              value={apptForm.serviceId}
              onValueChange={(value) => setApptForm(prev => ({ ...prev, serviceId: value }))}
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
                value={apptForm.date}
                onChange={(e) => setApptForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>שעה</Label>
              <Input
                type="time"
                name="appointment-time"
                autoComplete="off"
                value={apptForm.time}
                onChange={(e) => setApptForm(prev => ({ ...prev, time: e.target.value }))}
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
              value={apptForm.notes}
              onChange={(e) => setApptForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsNewApptOpen(false)} disabled={saving}>
              ביטול
            </Button>
            <Button
              onClick={handleAddAppointment}
              disabled={saving || !apptForm.patientName || !apptForm.serviceId}
            >
              {saving ? 'שומר...' : 'שמור ביומן'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Appointment AlertDialog */}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !canceling && !open && setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">ביטול תור</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              האם לבטל את התור של {appointmentToDelete?.patientName} ב{appointmentToDelete?.date ? new Date(appointmentToDelete.date).toLocaleDateString('he-IL') : ''} בשעה {appointmentToDelete?.time}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-center">
            <AlertDialogCancel disabled={canceling}>חזור</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={canceling}
              onClick={handleCancelAppointment}
            >
              {canceling ? 'מבטל...' : 'בטל תור'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
