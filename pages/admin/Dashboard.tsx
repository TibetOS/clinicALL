import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, FileText, AlertTriangle,
  Plus, ChevronLeft, Clock, CheckCircle,
  User, Phone, Gift, Send, Heart, Sparkles,
  Sun, Moon, Coffee, UserCheck, MessageCircle
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../../components/ui';
import { usePatients, useAppointments, useServices, useInvoices, useDeclarations, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';

// Color constants for the beauty theme
const COLORS = {
  taupe: '#8B7355',
  taupeDark: '#6B5A47',
  taupeLight: '#A89080',
  rose: '#D4A5A5',
  roseDark: '#C49090',
  roseLight: '#E4C5C5',
  cream: '#FAF8F5',
  creamDark: '#F0EDE8',
};

export const Dashboard = () => {
  const navigate = useNavigate();

  // ========== DATA HOOKS ==========
  const { appointments, loading: appointmentsLoading, addAppointment } = useAppointments();
  const { patients, loading: patientsLoading, addPatient } = usePatients();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { declarations, loading: declarationsLoading } = useDeclarations();
  const { services } = useServices();
  const { createToken, generateShareLink, generateWhatsAppLink } = useHealthTokens();

  // ========== DIALOG STATES ==========
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [sendingDeclaration, setSendingDeclaration] = useState<string | null>(null);

  // ========== FORM STATES ==========
  const [apptForm, setApptForm] = useState({
    patientId: '',
    patientName: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    time: '10:00',
  });
  const [walkInForm, setWalkInForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ========== COMPUTED VALUES (MEMOIZED FOR PERFORMANCE) ==========
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0] ?? '', [today]);

  // Today's appointments
  const todaysAppointments = useMemo(() => appointments
    .filter(a => {
      const apptDate = new Date(a.date);
      return apptDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(a => ({
      ...a,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patientName)}&background=D4A5A5&color=6B5A47`
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
  const patientsNeedingDeclaration = useMemo(() => {
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
        ...appt,
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
  const dueForFollowUp = useMemo(() => {
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

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
        const link = generateShareLink(token.token);
        const whatsappLink = generateWhatsAppLink(token.token, patientPhone);
        window.open(whatsappLink, '_blank', 'noopener,noreferrer');
        showSuccess('הקישור נשלח בהצלחה');
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
      showSuccess('התור נקבע בהצלחה');
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
      showSuccess('הלקוחה נקלטה בהצלחה');
      navigate(`/admin/patients/${result.id}`);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-700">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-300 text-white font-medium"
          style={{ backgroundColor: COLORS.rose }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        </div>
      )}

      {/* ========== HEADER: GREETING ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium" style={{ color: COLORS.taupeLight }}>
            <GreetingIcon size={20} />
            <span>{greeting.text},</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.taupeDark }}>ד״ר שרה</h1>
        </div>

        {/* Desktop Quick Actions - Now just the main CTA */}
        <div className="hidden md:flex">
          <Button
            onClick={() => setIsNewApptOpen(true)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: COLORS.taupe, color: 'white' }}
          >
            <Plus size={18} /> תור חדש
          </Button>
        </div>
      </div>

      {/* ========== DAILY SUMMARY STRIP ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: COLORS.creamDark }}>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={16} style={{ color: COLORS.taupe }} />
            <span className="text-xs font-medium" style={{ color: COLORS.taupeLight }}>תורים היום</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>{todaysAppointments.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: COLORS.creamDark }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} style={{ color: COLORS.rose }} />
            <span className="text-xs font-medium" style={{ color: COLORS.taupeLight }}>הושלמו</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>{completedToday}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: COLORS.creamDark }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} style={{ color: COLORS.rose }} />
            <span className="text-xs font-medium" style={{ color: COLORS.taupeLight }}>הכנסות היום</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>₪{todaysRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: COLORS.creamDark }}>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} style={{ color: COLORS.taupe }} />
            <span className="text-xs font-medium" style={{ color: COLORS.taupeLight }}>הצהרות ממתינות</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>{pendingDeclarations.length}</p>
        </div>
      </div>

      {/* ========== MAIN GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========== LEFT COLUMN - Main Content ========== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ========== NEXT APPOINTMENT (הטיפול הבא) ========== */}
          <Card className="p-6 rounded-3xl border shadow-sm overflow-hidden relative" style={{ borderColor: COLORS.creamDark }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} style={{ color: COLORS.rose }} />
              <h2 className="text-lg font-bold" style={{ color: COLORS.taupeDark }}>הטיפול הבא</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ) : nextAppointment ? (
              <div
                className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md"
                style={{ backgroundColor: COLORS.cream }}
                onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}
              >
                <div className="relative">
                  <img
                    src={nextAppointment.avatar}
                    alt={nextAppointment.patientName}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{ backgroundColor: COLORS.rose }}>
                    {nextAppointment.time.split(':')[0]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg" style={{ color: COLORS.taupeDark }}>{nextAppointment.patientName}</p>
                  <p className="text-sm" style={{ color: COLORS.taupeLight }}>{nextAppointment.serviceName}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge style={{ backgroundColor: COLORS.roseLight, color: COLORS.taupeDark }} className="border-none">
                      <Clock size={12} className="ml-1" /> {nextAppointment.time}
                    </Badge>
                    <Badge style={{ backgroundColor: COLORS.creamDark, color: COLORS.taupe }} className="border-none">
                      {nextAppointment.duration} דק׳
                    </Badge>
                  </div>
                </div>

                <ChevronLeft size={24} style={{ color: COLORS.taupeLight }} />
              </div>
            ) : (
              /* Empty State - Illustrated */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 relative" style={{ backgroundColor: COLORS.roseLight }}>
                  <Coffee size={40} style={{ color: COLORS.taupeDark }} />
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.rose }}>
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
                <p className="font-bold text-lg mb-1" style={{ color: COLORS.taupeDark }}>אין תורים כרגע</p>
                <p className="text-sm mb-4" style={{ color: COLORS.taupeLight }}>יום מושלם לפנות ללקוחות ותיקות!</p>
                <Button
                  variant="outline"
                  className="gap-2 border-2"
                  style={{ borderColor: COLORS.rose, color: COLORS.taupeDark }}
                  onClick={() => navigate('/admin/patients')}
                >
                  <Phone size={16} /> צפייה בלקוחות
                </Button>
              </div>
            )}
          </Card>

          {/* ========== PENDING HEALTH DECLARATIONS (טפסים ממתינים לחתימה) ========== */}
          <Card className="p-6 rounded-3xl border shadow-sm" style={{ borderColor: COLORS.creamDark }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} style={{ color: COLORS.taupe }} />
                <h2 className="text-lg font-bold" style={{ color: COLORS.taupeDark }}>הצהרות בריאות ממתינות</h2>
              </div>
              {patientsNeedingDeclaration.length > 0 && (
                <Badge style={{ backgroundColor: COLORS.rose, color: 'white' }} className="border-none">
                  {patientsNeedingDeclaration.length}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : patientsNeedingDeclaration.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.roseLight }}>
                  <CheckCircle size={36} style={{ color: COLORS.taupeDark }} />
                </div>
                <p className="font-bold mb-1" style={{ color: COLORS.taupeDark }}>הכל מסודר!</p>
                <p className="text-sm" style={{ color: COLORS.taupeLight }}>כל הלקוחות חתמו על הצהרות</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientsNeedingDeclaration.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                    style={{ backgroundColor: COLORS.cream }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=D4A5A5&color=6B5A47`}
                      alt={item.patientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: COLORS.taupeDark }}>{item.patientName}</p>
                      <p className="text-xs" style={{ color: COLORS.taupeLight }}>
                        תור: {new Date(item.date).toLocaleDateString('he-IL')} {item.time}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 shadow-sm"
                      style={{ backgroundColor: COLORS.taupe, color: 'white' }}
                      disabled={sendingDeclaration === item.patientId}
                      onClick={() => handleSendDeclaration(item.patientId, item.patientName, item.patient?.phone)}
                    >
                      {sendingDeclaration === item.patientId ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          <Send size={14} /> שלח
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ========== FOLLOW-UP LIST (לקוחות להתקשר אליהן) ========== */}
          <Card className="p-6 rounded-3xl border shadow-sm" style={{ borderColor: COLORS.creamDark }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone size={20} style={{ color: COLORS.rose }} />
                <h2 className="text-lg font-bold" style={{ color: COLORS.taupeDark }}>לקוחות להתקשר אליהן</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : dueForFollowUp.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.roseLight }}>
                  <UserCheck size={36} style={{ color: COLORS.taupeDark }} />
                </div>
                <p className="font-bold mb-1" style={{ color: COLORS.taupeDark }}>אין מעקבים ממתינים</p>
                <p className="text-sm" style={{ color: COLORS.taupeLight }}>כל הלקוחות מטופלות</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueForFollowUp.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                    style={{ backgroundColor: COLORS.cream }}
                    onClick={() => navigate(`/admin/patients/${item.patientId}`)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=D4A5A5&color=6B5A47`}
                      alt={item.patientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: COLORS.taupeDark }}>{item.patientName}</p>
                      <p className="text-xs" style={{ color: COLORS.taupeLight }}>
                        {item.serviceName} • לפני {Math.floor((today.getTime() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24))} ימים
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: COLORS.roseLight, color: COLORS.taupeDark }} className="border-none text-xs">
                      מעקב בוטוקס
                    </Badge>
                    <ChevronLeft size={16} style={{ color: COLORS.taupeLight }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ========== RIGHT COLUMN - Retention Metrics ========== */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: COLORS.taupeLight }}>שימור לקוחות</h3>

          {/* Lapsed Clients */}
          <Card
            className="p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
            style={{ borderColor: COLORS.creamDark }}
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.roseLight }}>
                <Clock size={24} style={{ color: COLORS.taupeDark }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: COLORS.taupeLight }}>לקוחות רדומות</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>
                  {lapsedClients.length > 0 ? lapsedClients.length : '—'}
                </p>
                <p className="text-xs" style={{ color: COLORS.taupeLight }}>
                  {lapsedClients.length > 0 ? 'לא ביקרו 60+ יום' : 'כולן פעילות!'}
                </p>
              </div>
            </div>
          </Card>

          {/* Due for Follow-up */}
          <Card
            className="p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
            style={{ borderColor: COLORS.creamDark }}
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
                <Phone size={24} style={{ color: COLORS.taupe }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: COLORS.taupeLight }}>לביקורת מעקב</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>
                  {dueForFollowUp.length > 0 ? dueForFollowUp.length : '—'}
                </p>
                <p className="text-xs" style={{ color: COLORS.taupeLight }}>
                  {dueForFollowUp.length > 0 ? 'בוטוקס 2 שבועות' : 'אין מעקבים'}
                </p>
              </div>
            </div>
          </Card>

          {/* Upcoming Birthdays */}
          <Card
            className="p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
            style={{ borderColor: COLORS.creamDark }}
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.roseLight }}>
                <Gift size={24} style={{ color: COLORS.roseDark }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: COLORS.taupeLight }}>ימי הולדת</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>
                  {upcomingBirthdays.length > 0 ? upcomingBirthdays.length : '—'}
                </p>
                <p className="text-xs" style={{ color: COLORS.taupeLight }}>
                  {upcomingBirthdays.length > 0 ? 'השבוע' : 'אין השבוע'}
                </p>
              </div>
            </div>
          </Card>

          {/* Active Patients */}
          <Card
            className="p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
            style={{ borderColor: COLORS.creamDark }}
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
                <UserCheck size={24} style={{ color: COLORS.taupe }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: COLORS.taupeLight }}>לקוחות פעילות</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.taupeDark }}>
                  {patients.length - lapsedClients.length}
                </p>
                <p className="text-xs" style={{ color: COLORS.taupeLight }}>ביקרו ב-60 יום</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========== MOBILE FAB ========== */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
        {/* FAB Menu */}
        {isFabOpen && (
          <div className="absolute bottom-16 left-0 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium transition-colors min-h-[44px]"
              style={{ color: COLORS.taupeDark }}
              onClick={() => { setIsNewApptOpen(true); setIsFabOpen(false); }}
            >
              <Plus size={18} style={{ color: COLORS.taupe }} />
              תור חדש
            </button>
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium transition-colors min-h-[44px]"
              style={{ color: COLORS.taupeDark }}
              onClick={() => { setIsWalkInOpen(true); setIsFabOpen(false); }}
            >
              <User size={18} style={{ color: COLORS.rose }} />
              קבלת לקוחה
            </button>
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium transition-colors min-h-[44px]"
              style={{ color: COLORS.taupeDark }}
              onClick={() => { navigate('/admin/patients'); setIsFabOpen(false); }}
            >
              <MessageCircle size={18} style={{ color: COLORS.taupe }} />
              שלח תזכורת
            </button>
          </div>
        )}

        {/* FAB Button */}
        <button
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isFabOpen ? 'rotate-45' : ''
          }`}
          style={{ backgroundColor: isFabOpen ? COLORS.taupeDark : COLORS.taupe }}
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* ========== DIALOGS ========== */}
      {/* New Appointment Dialog */}
      <Dialog open={isNewApptOpen} onClose={() => setIsNewApptOpen(false)} title="קביעת תור חדש">
        <div className="space-y-4">
          <div>
            <Label>שם המטופלת</Label>
            <Input
              name="patient-name"
              autoComplete="name"
              placeholder="הכניסי שם מטופלת..."
              value={apptForm.patientName}
              onChange={(e) => setApptForm(prev => ({ ...prev, patientName: e.target.value }))}
            />
          </div>
          <div>
            <Label>טיפול</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={apptForm.serviceId}
              onChange={(e) => setApptForm(prev => ({ ...prev, serviceId: e.target.value }))}
            >
              <option value="">בחרי טיפול...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration} דק׳)</option>
              ))}
            </select>
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
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsNewApptOpen(false)} disabled={saving}>
              ביטול
            </Button>
            <Button
              onClick={handleAddAppointment}
              disabled={saving || !apptForm.patientName || !apptForm.serviceId}
              style={{ backgroundColor: COLORS.taupe }}
            >
              {saving ? 'שומר...' : 'שמור ביומן'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Walk-in Dialog */}
      <Dialog open={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} title="קבלת לקוחה חדשה">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם פרטי</Label>
              <Input
                name="given-name"
                autoComplete="given-name"
                placeholder="שרה"
                value={walkInForm.firstName}
                onChange={(e) => setWalkInForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>שם משפחה</Label>
              <Input
                name="family-name"
                autoComplete="family-name"
                placeholder="כהן"
                value={walkInForm.lastName}
                onChange={(e) => setWalkInForm(prev => ({ ...prev, lastName: e.target.value }))}
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
              value={walkInForm.phone}
              onChange={(e) => setWalkInForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsWalkInOpen(false)} disabled={saving}>
              ביטול
            </Button>
            <Button
              onClick={handleWalkIn}
              disabled={saving || !walkInForm.firstName || !walkInForm.phone}
              style={{ backgroundColor: COLORS.taupe }}
            >
              {saving ? 'שומר...' : 'קלוט לקוחה'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
