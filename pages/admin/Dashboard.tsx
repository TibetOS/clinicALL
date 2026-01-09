import { useState } from 'react';
import {
  Calendar as CalendarIcon, FileText, AlertTriangle,
  Plus, ChevronLeft, TrendingUp, Clock, CheckCircle,
  UserPlus, Zap, User, MessageSquare, Phone, Gift,
  ShoppingCart, CreditCard, ArrowUpRight, CheckCircle2,
  Sun, Moon, Coffee
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../../components/ui';
import { usePatients, useAppointments, useServices, useInventory, useLeads, useInvoices, useDeclarations } from '../../hooks';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();

  // ========== DATA HOOKS ==========
  const { appointments, loading: appointmentsLoading, addAppointment } = useAppointments();
  const { patients, loading: patientsLoading, addPatient } = usePatients();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { leads, loading: leadsLoading } = useLeads();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { declarations, loading: declarationsLoading } = useDeclarations();
  const { services } = useServices();

  // ========== DIALOG STATES ==========
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

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

  // ========== COMPUTED VALUES ==========
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0] ?? '';

  // Today's appointments with avatar fallback
  const todaysAppointments = appointments
    .filter(a => {
      const apptDate = new Date(a.date);
      return apptDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(a => ({
      ...a,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patientName)}&background=random`
    }));

  // Next appointment (first pending or confirmed)
  const nextAppointment = todaysAppointments.find(a =>
    a.status === 'confirmed' || a.status === 'pending'
  );

  // Alerts calculations
  const pendingDeclarations = declarations.filter(d => d.status === 'pending');

  const expiringProducts = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const expiry = new Date(i.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  });

  const lowStockItems = inventory.filter(i => i.status === 'low' || i.status === 'critical');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const newLeads = leads.filter(l => l.stage === 'new');

  // Revenue calculations
  const todaysRevenue = invoices
    .filter(i => i.date === todayStr && i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const outstandingBalance = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  // Weekly revenue for trend chart
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
    const dayRevenue = invoices
      .filter(inv => inv.date === dateStr && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    return {
      name: dayNames[date.getDay()],
      value: dayRevenue || Math.floor(Math.random() * 3000) + 1000 // Fallback for demo
    };
  });

  // Calculate trend
  const thisWeekRevenue = revenueData.reduce((sum, d) => sum + d.value, 0);
  const lastWeekRevenue = thisWeekRevenue * 0.85;
  const revenueTrend = lastWeekRevenue > 0
    ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
    : 0;

  // Retention: Lapsed clients (no visit > 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const lapsedClients = patients.filter(p =>
    new Date(p.lastVisit) < sixtyDaysAgo && !p.upcomingAppointment
  );

  // Due for Follow-up: Patients with completed botox appointments ~2 weeks ago (10-17 days)
  const botoxFollowUpDays = { min: 10, max: 17 };
  const botoxKeywords = ['בוטוקס', 'botox', 'dysport', 'דיספורט'];
  const dueForFollowUp = appointments.filter(appt => {
    if (appt.status !== 'completed') return false;
    const isBotox = botoxKeywords.some(keyword =>
      appt.serviceName.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!isBotox) return false;

    const apptDate = new Date(appt.date);
    const daysSince = Math.floor((today.getTime() - apptDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= botoxFollowUpDays.min && daysSince <= botoxFollowUpDays.max;
  });

  // Upcoming Birthdays: Patients with birthdays in the next 7 days
  const upcomingBirthdays = patients.filter(p => {
    if (!p.birthDate) return false;
    const birthDate = new Date(p.birthDate);

    // Check next 7 days
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      if (birthDate.getMonth() === checkDate.getMonth() &&
          birthDate.getDate() === checkDate.getDate()) {
        return true;
      }
    }
    return false;
  });

  // Total alerts count
  const totalAlerts = pendingDeclarations.length + expiringProducts.length +
    lowStockItems.length + overdueInvoices.length + newLeads.length;

  // Loading state
  const isLoading = appointmentsLoading || patientsLoading || inventoryLoading ||
    leadsLoading || invoicesLoading || declarationsLoading;

  // ========== HELPERS ==========
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'בוקר טוב', icon: Sun };
    if (hour < 18) return { text: 'צהריים טובים', icon: Sun };
    return { text: 'ערב טוב', icon: Moon };
  };

  const greeting = getCurrentGreeting();
  const GreetingIcon = greeting.icon;

  const getAppointmentStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'no-show': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAppointmentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'הסתיים',
      'confirmed': 'בטיפול',
      'pending': 'ממתין',
      'cancelled': 'בוטל',
      'no-show': 'לא הגיע'
    };
    return labels[status] || status;
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
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
      showSuccess('הלקוח נקלט בהצלחה');
      navigate(`/admin/patients/${result.id}`);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-700">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}

      {/* ========== HEADER: GREETING + QUICK ACTIONS ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary/80 font-medium">
            <GreetingIcon size={20} />
            <span>{greeting.text},</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ד״ר שרה</h1>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden md:flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsNewApptOpen(true)}>
            <Plus size={16} className="ml-1" /> תור חדש
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPosOpen(true)}>
            <Zap size={16} className="ml-1" /> מכירה מהירה
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsWalkInOpen(true)}>
            <User size={16} className="ml-1" /> קבלת לקוח
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare size={16} className="ml-1" /> שלח תזכורת
          </Button>
        </div>
      </div>

      {/* ========== BENTO GRID LAYOUT ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========== TODAY'S SCHEDULE ========== */}
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900">לוח הזמנים להיום</h2>
            </div>
            <Badge variant="secondary">{todaysAppointments.length} תורים</Badge>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : todaysAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Coffee size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">אין תורים היום</p>
              <p className="text-sm text-gray-500">זמן מושלם להפסקת קפה!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {todaysAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-stone-50 group ${
                    nextAppointment?.id === appt.id ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                  }`}
                  onClick={() => navigate(`/admin/patients/${appt.patientId}`)}
                >
                  {/* Time */}
                  <div className="w-14 text-center shrink-0">
                    <span className="text-lg font-bold text-gray-900">{appt.time}</span>
                    <span className="block text-xs text-gray-500">{appt.duration} דק׳</span>
                  </div>

                  {/* Divider */}
                  <div className={`w-1 h-12 rounded-full ${
                    appt.status === 'completed' ? 'bg-green-400' :
                    appt.status === 'confirmed' ? 'bg-blue-400' :
                    appt.status === 'pending' ? 'bg-amber-400' :
                    appt.status === 'no-show' ? 'bg-red-400' : 'bg-gray-300'
                  }`} />

                  {/* Patient Info */}
                  <img
                    src={appt.avatar}
                    alt={appt.patientName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{appt.patientName}</p>
                    <p className="text-sm text-gray-500 truncate">{appt.serviceName}</p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getAppointmentStatusStyle(appt.status)}`}>
                    {getAppointmentStatusLabel(appt.status)}
                  </span>

                  {/* Arrow */}
                  <ChevronLeft size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ========== ALERTS PANEL ========== */}
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">התראות דחופות</h2>
            </div>
            {totalAlerts > 0 && (
              <Badge variant="destructive">{totalAlerts}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : totalAlerts === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">הכל תקין!</p>
              <p className="text-sm text-gray-500">אין התראות דחופות כרגע</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {/* Pending Declarations */}
              {pendingDeclarations.length > 0 && (
                <div
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100/50 transition-colors"
                  onClick={() => navigate('/admin/patients')}
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-900">הצהרות ממתינות לחתימה</p>
                    <p className="text-sm text-red-700">{pendingDeclarations.length} מטופלים</p>
                  </div>
                  <ChevronLeft size={16} className="text-red-400" />
                </div>
              )}

              {/* Expiring Products */}
              {expiringProducts.length > 0 && (
                <div
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100/50 transition-colors"
                  onClick={() => navigate('/admin/inventory')}
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-900">מוצרים עומדים לפוג</p>
                    <p className="text-sm text-red-700">{expiringProducts.length} פריטים ב-30 יום הקרובים</p>
                  </div>
                  <ChevronLeft size={16} className="text-red-400" />
                </div>
              )}

              {/* Low Stock */}
              {lowStockItems.length > 0 && (
                <div
                  className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-colors"
                  onClick={() => navigate('/admin/inventory')}
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingCart size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">מלאי נמוך</p>
                    <p className="text-sm text-amber-700">{lowStockItems.length} פריטים מתחת לסף</p>
                  </div>
                  <ChevronLeft size={16} className="text-amber-400" />
                </div>
              )}

              {/* Overdue Payments */}
              {overdueInvoices.length > 0 && (
                <div
                  className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-colors"
                  onClick={() => navigate('/admin/settings?tab=billing')}
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <CreditCard size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">תשלומים בפיגור</p>
                    <p className="text-sm text-amber-700">₪{overdueInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}</p>
                  </div>
                  <ChevronLeft size={16} className="text-amber-400" />
                </div>
              )}

              {/* New Leads */}
              {newLeads.length > 0 && (
                <div
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => navigate('/admin/patients')}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <UserPlus size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-900">לידים חדשים</p>
                    <p className="text-sm text-blue-700">{newLeads.length} לידים להתקשרות</p>
                  </div>
                  <ChevronLeft size={16} className="text-blue-400" />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ========== REVENUE OVERVIEW ========== */}
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              <h2 className="text-lg font-bold">הכנסות היום</h2>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              revenueTrend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {revenueTrend >= 0 ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />}
              {Math.abs(revenueTrend)}%
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-4xl font-bold tracking-tight">
              ₪{(todaysRevenue || 2450).toLocaleString()}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              יתרה לגבייה: ₪{outstandingBalance.toLocaleString()}
            </p>
          </div>

          {/* Mini Chart */}
          <div className="h-20 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`₪${(value ?? 0).toLocaleString()}`, 'הכנסות']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2DD4BF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenueDashboard)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ========== RETENTION METRICS ========== */}
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User size={20} className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">שימור לקוחות</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Lapsed Clients */}
            <div
              className="p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900">לקוחות רדומים</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{lapsedClients.length}</p>
              <p className="text-xs text-purple-600">לא ביקרו 60+ יום</p>
            </div>

            {/* Due for Follow-up */}
            <div
              className="p-4 bg-teal-50 rounded-xl cursor-pointer hover:bg-teal-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-900">לביקורת מעקב</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">{dueForFollowUp.length}</p>
              <p className="text-xs text-teal-600">בוטוקס 2 שבועות</p>
            </div>

            {/* Upcoming Birthdays */}
            <div
              className="p-4 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-pink-600" />
                <span className="text-sm font-medium text-pink-900">ימי הולדת</span>
              </div>
              <p className="text-2xl font-bold text-pink-700">{upcomingBirthdays.length}</p>
              <p className="text-xs text-pink-600">השבוע</p>
            </div>

            {/* Active Patients */}
            <div
              className="p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-900">לקוחות פעילים</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{patients.length - lapsedClients.length}</p>
              <p className="text-xs text-green-600">ביקרו ב-60 יום</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ========== MOBILE FAB ========== */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
        {/* FAB Menu */}
        {isFabOpen && (
          <div className="absolute bottom-16 left-0 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              onClick={() => { setIsNewApptOpen(true); setIsFabOpen(false); }}
            >
              <Plus size={18} className="text-primary" />
              תור חדש
            </button>
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              onClick={() => { setIsPosOpen(true); setIsFabOpen(false); }}
            >
              <Zap size={18} className="text-orange-500" />
              מכירה מהירה
            </button>
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              onClick={() => { setIsWalkInOpen(true); setIsFabOpen(false); }}
            >
              <User size={18} className="text-blue-500" />
              קבלת לקוח
            </button>
            <button
              className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              onClick={() => setIsFabOpen(false)}
            >
              <MessageSquare size={18} className="text-green-500" />
              שלח תזכורת
            </button>
          </div>
        )}

        {/* FAB Button */}
        <button
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isFabOpen
              ? 'bg-gray-800 rotate-45'
              : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* ========== DIALOGS ========== */}
      {/* Quick POS Modal */}
      <Dialog open={isPosOpen} onClose={() => setIsPosOpen(false)} title="קופה מהירה">
        <div className="flex flex-col h-[500px]">
          <p className="text-center p-10 text-gray-500">תוכן הקופה המהירה יופיע כאן</p>
        </div>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={isNewApptOpen} onClose={() => setIsNewApptOpen(false)} title="קביעת תור חדש">
        <div className="space-y-4">
          <div>
            <Label>שם המטופל</Label>
            <Input
              name="patient-name"
              autoComplete="name"
              placeholder="הכנס שם מטופל..."
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
              <option value="">בחר טיפול...</option>
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
            >
              {saving ? 'שומר...' : 'שמור ביומן'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Walk-in Dialog */}
      <Dialog open={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} title="קבלת לקוח חדש">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם פרטי</Label>
              <Input
                name="given-name"
                autoComplete="given-name"
                placeholder="ישראל"
                value={walkInForm.firstName}
                onChange={(e) => setWalkInForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>שם משפחה</Label>
              <Input
                name="family-name"
                autoComplete="family-name"
                placeholder="ישראלי"
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
            >
              {saving ? 'שומר...' : 'קלוט לקוח'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
