import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, FileText,
  Plus, ChevronLeft, Clock, CheckCircle,
  User, Phone, Gift, Send, Heart, Sparkles,
  Sun, Moon, Coffee, UserCheck, MessageCircle,
  MoreHorizontal, Eye, PhoneCall, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../../components/ui';
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
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Empty } from '../../components/ui/empty';
import { usePatients, useAppointments, useServices, useInvoices, useDeclarations, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

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

      {/* ========== DAILY SUMMARY STRIP ========== */}
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-1">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors duration-200" />
                  <span className="text-xs font-medium text-slate-500">תורים היום</span>
                  <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold text-slate-800 counter-animate">{todaysAppointments.length}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>כל התורים שנקבעו להיום</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} className="text-slate-400 group-hover:text-green-500 transition-colors duration-200" />
                  <span className="text-xs font-medium text-slate-500">הושלמו</span>
                  <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold text-slate-800 counter-animate">{completedToday}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>תורים שהושלמו היום</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-3">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-teal-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium text-slate-500">הכנסות היום</span>
                  <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold text-slate-800 counter-animate">₪{todaysRevenue.toLocaleString()}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>סך כל התשלומים ששולמו היום</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors duration-200" />
                  <span className="text-xs font-medium text-slate-500">הצהרות ממתינות</span>
                  <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold text-slate-800 counter-animate">{pendingDeclarations.length}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>לקוחות שטרם חתמו על הצהרת בריאות</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* ========== MAIN GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========== LEFT COLUMN - Main Content ========== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ========== NEXT APPOINTMENT (הטיפול הבא) ========== */}
          <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative card-animate stagger-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-teal-500 animate-gentle-bounce" />
              <h2 className="text-lg font-bold text-slate-800">הטיפול הבא</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="w-16 h-16 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32 bg-slate-200" />
                  <Skeleton className="h-4 w-48 bg-slate-200" />
                </div>
              </div>
            ) : nextAppointment ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-md bg-slate-50">
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}
                >
                  <Avatar className="w-16 h-16 ring-4 ring-white shadow-md">
                    <AvatarImage src={nextAppointment.avatar} alt={nextAppointment.patientName} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                      {nextAppointment.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg bg-teal-500">
                    {nextAppointment.time.split(':')[0]}
                  </div>
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}
                >
                  <p className="font-bold text-lg text-slate-800">{nextAppointment.patientName}</p>
                  <p className="text-sm text-slate-600">{nextAppointment.serviceName}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="border-none bg-teal-100 text-teal-700 gap-1">
                      <Clock size={12} /> {nextAppointment.time}
                    </Badge>
                    <Badge className="border-none bg-slate-100 text-slate-600">
                      {nextAppointment.duration} דק׳
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <MoreHorizontal size={20} className="text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}>
                      <Eye size={16} />
                      צפייה בכרטיס
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => navigate('/admin/calendar')}>
                      <CalendarIcon size={16} />
                      פתח ביומן
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2" onClick={() => {
                      const patient = patients.find(p => p.id === nextAppointment.patientId);
                      if (patient?.phone) window.open(`tel:${patient.phone}`);
                    }}>
                      <PhoneCall size={16} />
                      התקשר
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Empty State - Using Empty component */
              <Empty
                icon={<Coffee size={32} className="text-teal-500" />}
                title="אין תורים כרגע"
                description="יום מושלם לפנות ללקוחות ותיקות!"
                action={
                  <Button
                    variant="outline"
                    className="gap-2 border-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                    onClick={() => navigate('/admin/patients')}
                  >
                    <Phone size={16} /> צפייה בלקוחות
                  </Button>
                }
                className="py-10 border-none min-h-0"
              />
            )}
          </Card>

          {/* ========== PENDING HEALTH DECLARATIONS (טפסים ממתינים לחתימה) ========== */}
          <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm card-animate stagger-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-slate-400 group-hover:rotate-6 transition-transform duration-200" />
                <h2 className="text-lg font-bold text-slate-800">הצהרות בריאות ממתינות</h2>
              </div>
              {patientsNeedingDeclaration.length > 0 && (
                <Badge className="border-none bg-amber-100 text-amber-700">
                  {patientsNeedingDeclaration.length}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : patientsNeedingDeclaration.length === 0 ? (
              <Empty
                icon={<CheckCircle size={28} className="text-green-600" />}
                title="הכל מסודר!"
                description="כל הלקוחות חתמו על הצהרות"
                className="py-8 border-none min-h-0"
              />
            ) : (
              <div className="space-y-3">
                {patientsNeedingDeclaration.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-slate-50 group"
                    style={{
                      animation: 'fadeInUp 300ms ease-out forwards',
                      animationDelay: `${index * 75}ms`,
                      opacity: 0
                    }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=CCFBF1&color=0D9488`}
                      alt={item.patientName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-slate-800">{item.patientName}</p>
                      <p className="text-xs text-slate-500">
                        תור: {new Date(item.date).toLocaleDateString('he-IL')} {item.time}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 shadow-sm bg-teal-500 hover:bg-teal-600 text-white"
                      disabled={sendingDeclaration === item.patientId}
                      onClick={() => handleSendDeclaration(item.patientId, item.patientName, item.patient?.phone)}
                    >
                      {sendingDeclaration === item.patientId ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          <Send size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" /> שלח
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ========== FOLLOW-UP LIST (לקוחות להתקשר אליהן) ========== */}
          <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm card-animate stagger-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 group">
                <Phone size={20} className="text-slate-400 group-hover:rotate-12 transition-transform duration-200" />
                <h2 className="text-lg font-bold text-slate-800">לקוחות להתקשר אליהן</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : dueForFollowUp.length === 0 ? (
              <Empty
                icon={<UserCheck size={28} className="text-green-600" />}
                title="אין מעקבים ממתינים"
                description="כל הלקוחות מטופלות"
                className="py-8 border-none min-h-0"
              />
            ) : (
              <div className="space-y-3">
                {dueForFollowUp.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-slate-50 group"
                    style={{
                      animation: 'fadeInUp 300ms ease-out forwards',
                      animationDelay: `${index * 75}ms`,
                      opacity: 0
                    }}
                    onClick={() => navigate(`/admin/patients/${item.patientId}`)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=CCFBF1&color=0D9488`}
                      alt={item.patientName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-slate-800">{item.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {item.serviceName} • לפני {Math.floor((today.getTime() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24))} ימים
                      </p>
                    </div>
                    <Badge className="border-none text-xs bg-teal-100 text-teal-700">
                      מעקב בוטוקס
                    </Badge>
                    <ChevronLeft size={16} className="text-slate-400 group-hover:translate-x-[-4px] transition-transform duration-200" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ========== RIGHT COLUMN - Retention Metrics ========== */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 animate-fade-in">שימור לקוחות</h3>

          {/* Lapsed Clients */}
          <Card
            className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-5 group"
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lapsedClients.length > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                <Clock size={24} className={lapsedClients.length > 0 ? 'text-amber-600' : 'text-slate-400'} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">לקוחות רדומות</p>
                {lapsedClients.length > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">{lapsedClients.length}</p>
                    <p className="text-xs text-slate-500">לא ביקרו 60+ יום</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-green-600">מעולה! 🎉</p>
                    <p className="text-xs text-slate-500">כל הלקוחות פעילות</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Due for Follow-up */}
          <Card
            className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-6 group"
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 group-hover:scale-110 transition-transform duration-200">
                <Phone size={24} className="text-teal-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">לביקורת מעקב</p>
                {dueForFollowUp.length > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">{dueForFollowUp.length}</p>
                    <p className="text-xs text-slate-500">בוטוקס 2 שבועות</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-green-600">הכל מטופל ✓</p>
                    <p className="text-xs text-slate-500">אין מעקבים ממתינים</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Upcoming Birthdays */}
          <Card
            className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-7 group"
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-50 group-hover:scale-110 transition-transform duration-200">
                <Gift size={24} className="text-pink-500 group-hover:rotate-12 transition-transform duration-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">ימי הולדת</p>
                {upcomingBirthdays.length > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">{upcomingBirthdays.length}</p>
                    <p className="text-xs text-slate-500">השבוע</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-400">אין השבוע</p>
                    <p className="text-xs text-slate-500">שבוע שקט</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Active Patients */}
          <Card
            className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-8 group"
            onClick={() => navigate('/admin/patients')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 group-hover:scale-110 transition-transform duration-200">
                <UserCheck size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">לקוחות פעילות</p>
                <p className="text-2xl font-bold text-slate-800">
                  {patients.length - lapsedClients.length}
                </p>
                <p className="text-xs text-slate-500">ביקרו ב-60 יום</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========== MOBILE FAB ========== */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
        {/* FAB Menu */}
        <div
          className={`absolute bottom-16 left-0 space-y-2 transition-all duration-300 ${
            isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] active:scale-95"
            style={{ transitionDelay: isFabOpen ? '100ms' : '0ms' }}
            onClick={() => { setIsNewApptOpen(true); setIsFabOpen(false); }}
          >
            <Plus size={18} className="text-teal-500" />
            תור חדש
          </button>
          <button
            className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] active:scale-95"
            style={{ transitionDelay: isFabOpen ? '50ms' : '0ms' }}
            onClick={() => { setIsWalkInOpen(true); setIsFabOpen(false); }}
          >
            <User size={18} className="text-blue-500" />
            קבלת לקוחה
          </button>
          <button
            className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] active:scale-95"
            style={{ transitionDelay: isFabOpen ? '0ms' : '0ms' }}
            onClick={() => { navigate('/admin/patients'); setIsFabOpen(false); }}
          >
            <MessageCircle size={18} className="text-green-500" />
            שלח תזכורת
          </button>
        </div>

        {/* FAB Button */}
        <button
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform-gpu active:scale-90 ${
            isFabOpen ? 'bg-slate-800 rotate-45 shadow-xl' : 'bg-teal-500 hover:bg-teal-600 hover:shadow-xl hover:scale-105'
          }`}
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          <Plus size={24} className="text-white transition-transform duration-300" />
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
            <Select
              value={apptForm.serviceId}
              onValueChange={(value) => setApptForm(prev => ({ ...prev, serviceId: value }))}
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
              className="bg-teal-500 hover:bg-teal-600 text-white"
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
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {saving ? 'שומר...' : 'קלוט לקוחה'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
