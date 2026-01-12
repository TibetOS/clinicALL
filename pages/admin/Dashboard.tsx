import { useState, useMemo, useEffect } from 'react';
import { Plus, Sun, Moon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Alert, AlertTitle, AlertDescription,
} from '../../components/ui';
import { usePatients, useAppointments, useServices, useInvoices, useDeclarations, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DailyStats } from './dashboard/DailyStats';
import { NextAppointmentCard } from './dashboard/NextAppointmentCard';
import { PendingDeclarationsCard, DeclarationItem } from './dashboard/PendingDeclarationsCard';
import { FollowUpListCard, FollowUpItem } from './dashboard/FollowUpListCard';
import { RetentionMetrics } from './dashboard/RetentionMetrics';
import { MobileActionMenu } from './dashboard/MobileActionMenu';
import { NewAppointmentDialog, AppointmentForm } from './dashboard/NewAppointmentDialog';
import { WalkInDialog, WalkInForm } from './dashboard/WalkInDialog';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // ========== DATA HOOKS ==========
  const { appointments, loading: appointmentsLoading, error: appointmentsError, addAppointment } = useAppointments();
  const { patients, loading: patientsLoading, error: patientsError, addPatient } = usePatients();
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices();
  const { declarations, loading: declarationsLoading, error: declarationsError } = useDeclarations();
  const { services } = useServices();
  const { createToken, generateShareLink, generateWhatsAppLink } = useHealthTokens();

  // Aggregate errors for display
  const dataError = appointmentsError || patientsError || invoicesError || declarationsError;

  // ========== DIALOG STATES ==========
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [sendingDeclaration, setSendingDeclaration] = useState<string | null>(null);

  // ========== FORM STATES ==========
  const [apptForm, setApptForm] = useState<AppointmentForm>({
    patientId: '',
    patientName: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    time: '10:00',
  });
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  // ========== COMPUTED VALUES (MEMOIZED FOR PERFORMANCE) ==========
  // Use state for today to handle day changes when dashboard stays open
  const [today, setToday] = useState(() => new Date());
  const todayStr = useMemo(() => today.toISOString().split('T')[0] ?? '', [today]);

  // Check for day change every minute
  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      if (now.toDateString() !== today.toDateString()) {
        setToday(now);
      }
    };
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [today]);

  // Today's appointments
  const todaysAppointments = useMemo(() => appointments
    .filter(a => {
      const apptDate = new Date(a.date);
      return apptDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(a => ({
      ...a,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patientName)}&background=CCFBF1&color=0D9488`
    })), [appointments, today]);

  // Next appointment (first pending or confirmed)
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return todaysAppointments.find(a =>
      (a.status === 'confirmed' || a.status === 'pending') && a.time >= currentTime
    );
  }, [todaysAppointments]);

  // Pending declarations
  const pendingDeclarations = useMemo(() =>
    declarations.filter(d => d.status === 'pending'), [declarations]);

  // Patients needing health declarations (those with upcoming appointments but no recent declaration)
  const patientsNeedingDeclaration = useMemo((): DeclarationItem[] => {
    const upcomingAppts = appointments.filter(a => {
      const apptDate = new Date(a.date);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return apptDate >= today && apptDate <= threeDaysFromNow &&
        (a.status === 'confirmed' || a.status === 'pending');
    });

    return upcomingAppts.map(appt => {
      const patient = patients.find(p => p.id === appt.patientId);
      return {
        id: appt.id,
        patientId: appt.patientId,
        patientName: appt.patientName,
        date: appt.date,
        time: appt.time,
        patient,
        hasRecentDeclaration: patient?.declarationStatus === 'valid'
      };
    }).filter(a => !a.hasRecentDeclaration).slice(0, 5);
  }, [appointments, patients, today]);

  // Revenue calculations
  const todaysRevenue = useMemo(() => invoices
    .filter(i => i.date === todayStr && i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0), [invoices, todayStr]);

  const completedToday = useMemo(() =>
    todaysAppointments.filter(a => a.status === 'completed').length,
    [todaysAppointments]);

  // Retention: Lapsed clients (no visit > 60 days)
  const lapsedClients = useMemo(() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    return patients.filter(p =>
      new Date(p.lastVisit) < sixtyDaysAgo && !p.upcomingAppointment
    );
  }, [patients]);

  // Due for Follow-up: Patients with completed botox appointments ~2 weeks ago
  const dueForFollowUp = useMemo((): FollowUpItem[] => {
    const botoxFollowUpDays = { min: 10, max: 17 };
    const botoxKeywords = ['בוטוקס', 'botox', 'dysport', 'דיספורט'];
    return appointments.filter(appt => {
      if (appt.status !== 'completed') return false;
      const isBotox = botoxKeywords.some(keyword =>
        appt.serviceName.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!isBotox) return false;

      const apptDate = new Date(appt.date);
      const daysSince = Math.floor((today.getTime() - apptDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= botoxFollowUpDays.min && daysSince <= botoxFollowUpDays.max;
    }).map(appt => {
      const patient = patients.find(p => p.id === appt.patientId);
      return { ...appt, patient };
    }).slice(0, 5);
  }, [appointments, patients, today]);

  // Upcoming Birthdays
  const upcomingBirthdays = useMemo(() => patients.filter(p => {
    if (!p.birthDate) return false;
    const birthDate = new Date(p.birthDate);
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      if (birthDate.getMonth() === checkDate.getMonth() &&
          birthDate.getDate() === checkDate.getDate()) {
        return true;
      }
    }
    return false;
  }), [patients, today]);

  // Loading state
  const isLoading = appointmentsLoading || patientsLoading || invoicesLoading || declarationsLoading;

  // ========== HELPERS ==========
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'בוקר טוב', icon: Sun };
    if (hour < 18) return { text: 'צהריים טובים', icon: Sun };
    return { text: 'ערב טוב', icon: Moon };
  };

  const greeting = getCurrentGreeting();
  const GreetingIcon = greeting.icon;

  // Send health declaration
  const handleSendDeclaration = async (patientId: string, patientName: string, patientPhone?: string) => {
    setSendingDeclaration(patientId);
    try {
      const token = await createToken({
        patientId,
        patientName,
        patientPhone,
      });
      if (token && patientPhone) {
        const whatsappLink = generateWhatsAppLink(token.token, patientPhone);
        window.open(whatsappLink, '_blank', 'noopener,noreferrer');
        toast.success('הקישור נשלח בהצלחה');
      } else if (token) {
        // If no phone, copy link to clipboard
        const link = generateShareLink(token.token);
        await navigator.clipboard.writeText(link);
        toast.success('הקישור הועתק ללוח');
      } else {
        toast.error('שגיאה ביצירת הקישור');
      }
    } finally {
      setSendingDeclaration(null);
    }
  };

  // ========== FORM HANDLERS ==========
  const handleAddAppointment = async () => {
    if (!apptForm.patientName || !apptForm.serviceId) return;

    setSaving(true);
    const service = services.find(s => s.id === apptForm.serviceId);

    const result = await addAppointment({
      patientId: apptForm.patientId || `walk-in-${Date.now()}`,
      patientName: apptForm.patientName,
      serviceId: apptForm.serviceId,
      serviceName: service?.name || '',
      date: apptForm.date,
      time: apptForm.time,
      duration: service?.duration || 30,
      status: 'pending',
    });

    setSaving(false);

    if (result) {
      setIsNewApptOpen(false);
      setApptForm({
        patientId: '',
        patientName: '',
        serviceId: '',
        date: todayStr,
        time: '10:00',
      });
      toast.success('התור נקבע בהצלחה');
    } else {
      toast.error('שגיאה בקביעת התור');
    }
  };

  const handleWalkIn = async () => {
    if (!walkInForm.firstName || !walkInForm.phone) return;

    setSaving(true);
    const result = await addPatient({
      name: `${walkInForm.firstName} ${walkInForm.lastName}`.trim(),
      phone: walkInForm.phone,
      email: '',
      riskLevel: 'low',
    });

    setSaving(false);

    if (result) {
      setIsWalkInOpen(false);
      setWalkInForm({ firstName: '', lastName: '', phone: '' });
      toast.success('הלקוחה נקלטה בהצלחה');
      navigate(`/admin/patients/${result.id}`);
    } else {
      toast.error('שגיאה בקליטת הלקוחה');
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-700">
      {/* ========== HEADER: GREETING ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium text-teal-500">
            <GreetingIcon size={20} />
            <span>{greeting.text},</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{profile?.full_name || 'שלום'}</h1>
        </div>

        {/* Desktop Quick Actions - Now just the main CTA */}
        <div className="hidden md:flex">
          <Button
            onClick={() => setIsNewApptOpen(true)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Plus size={18} /> תור חדש
          </Button>
        </div>
      </div>

      {/* ========== ERROR BANNER ========== */}
      {dataError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת נתונים</AlertTitle>
          <AlertDescription>{dataError}</AlertDescription>
        </Alert>
      )}

      {/* ========== DAILY SUMMARY STRIP ========== */}
      <DailyStats
        todaysAppointments={todaysAppointments.length}
        completedToday={completedToday}
        todaysRevenue={todaysRevenue}
        pendingDeclarations={pendingDeclarations.length}
      />

      {/* ========== MAIN GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========== LEFT COLUMN - Main Content ========== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ========== NEXT APPOINTMENT (הטיפול הבא) ========== */}
          <NextAppointmentCard
            isLoading={isLoading}
            nextAppointment={nextAppointment}
            patients={patients}
          />

          {/* ========== PENDING HEALTH DECLARATIONS (טפסים ממתינים לחתימה) ========== */}
          <PendingDeclarationsCard
            isLoading={isLoading}
            patientsNeedingDeclaration={patientsNeedingDeclaration}
            sendingDeclaration={sendingDeclaration}
            onSendDeclaration={handleSendDeclaration}
          />

          {/* ========== FOLLOW-UP LIST (לקוחות להתקשר אליהן) ========== */}
          <FollowUpListCard
            isLoading={isLoading}
            dueForFollowUp={dueForFollowUp}
            today={today}
          />
        </div>

        {/* ========== RIGHT COLUMN - Retention Metrics ========== */}
        <RetentionMetrics
          lapsedClients={lapsedClients}
          dueForFollowUp={dueForFollowUp}
          upcomingBirthdays={upcomingBirthdays}
          totalPatients={patients.length}
        />
      </div>

      {/* ========== MOBILE FAB ========== */}
      <MobileActionMenu
        isFabOpen={isFabOpen}
        setIsFabOpen={setIsFabOpen}
        onNewAppointment={() => setIsNewApptOpen(true)}
        onWalkIn={() => setIsWalkInOpen(true)}
      />

      {/* ========== DIALOGS ========== */}
      <NewAppointmentDialog
        isOpen={isNewApptOpen}
        onClose={() => setIsNewApptOpen(false)}
        form={apptForm}
        setForm={setApptForm}
        services={services}
        saving={saving}
        onSubmit={handleAddAppointment}
      />

      <WalkInDialog
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        form={walkInForm}
        setForm={setWalkInForm}
        saving={saving}
        onSubmit={handleWalkIn}
      />
    </div>
  );
};
