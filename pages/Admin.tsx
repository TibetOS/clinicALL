import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon, FileText, AlertTriangle, 
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  TrendingUp, Clock, CheckCircle, XCircle, MoreVertical,
  Settings as SettingsIcon, Shield, CreditCard, UserPlus, Trash2,
  Sparkles, Palette, Zap, Syringe, CheckSquare, Phone, MessageSquare,
  LayoutGrid, List, User, Bell, Mail, Smartphone, Download, Check,
  Crown, Server, FileCheck, CheckCircle2, ShoppingCart, Gift, ArrowUpRight,
  ShoppingBag, Target, PieChart, Activity, MapPin, Coffee, Sun, Moon,
  Globe, Image as ImageIcon, Link as LinkIcon, MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card, Button, Input, Badge, Dialog, Tabs, TabsList, TabsTrigger, Label, Skeleton } from '../components/ui';
import { usePatients, useAppointments, useServices, useInventory, useLeads, useInvoices, useDeclarations } from '../hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Patient, Service, Appointment, InventoryItem, Lead, Invoice, Declaration } from '../types';

// Helper for translating status
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'confirmed': 'מאושר',
    'completed': 'בוצע',
    'pending': 'ממתין',
    'cancelled': 'בוטל',
    'no-show': 'לא הגיע',
    'low': 'נמוך',
    'medium': 'בינוני',
    'high': 'גבוה',
    'reviewed': 'נבדק'
  };
  return map[status] || status;
};

// -- DASHBOARD --
export const Dashboard = () => {
  const navigate = useNavigate();

  // ========== DATA HOOKS ==========
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { patients, loading: patientsLoading } = usePatients();
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

  // ========== COMPUTED VALUES ==========
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

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

  // Calculate trend (this week vs last week)
  const thisWeekRevenue = revenueData.reduce((sum, d) => sum + d.value, 0);
  const lastWeekRevenue = thisWeekRevenue * 0.85; // Mock: assume 15% growth
  const revenueTrend = lastWeekRevenue > 0
    ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
    : 0;

  // Retention: Lapsed clients (no visit > 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const lapsedClients = patients.filter(p =>
    new Date(p.lastVisit) < sixtyDaysAgo && !p.upcomingAppointment
  );

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

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-700">

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
                  onClick={() => navigate('/admin/finance')}
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
                  onClick={() => navigate('/admin/leads')}
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
                  formatter={(value: number) => [`₪${value.toLocaleString()}`, 'הכנסות']}
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
              <Users size={20} className="text-purple-500" />
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

            {/* Due for Follow-up (mock) */}
            <div
              className="p-4 bg-teal-50 rounded-xl cursor-pointer hover:bg-teal-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-900">לביקורת מעקב</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">5</p>
              <p className="text-xs text-teal-600">בוטוקס 2 שבועות</p>
            </div>

            {/* Upcoming Birthdays (mock) */}
            <div
              className="p-4 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100/70 transition-colors"
              onClick={() => navigate('/admin/patients')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-pink-600" />
                <span className="text-sm font-medium text-pink-900">ימי הולדת</span>
              </div>
              <p className="text-2xl font-bold text-pink-700">3</p>
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
            <Label>מטופל</Label>
            <Input placeholder="חפש מטופל..." />
          </div>
          <div>
            <Label>טיפול</Label>
            <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              {services.map(s => <option key={s.id}>{s.name} ({s.duration} דק׳)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך</Label>
              <Input type="date" defaultValue={todayStr} />
            </div>
            <div>
              <Label>שעה</Label>
              <Input type="time" defaultValue="10:00" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsNewApptOpen(false)}>ביטול</Button>
            <Button onClick={() => setIsNewApptOpen(false)}>שמור ביומן</Button>
          </div>
        </div>
      </Dialog>

      {/* Walk-in Dialog */}
      <Dialog open={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} title="קבלת לקוח חדש">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם פרטי</Label>
              <Input placeholder="ישראל" />
            </div>
            <div>
              <Label>שם משפחה</Label>
              <Input placeholder="ישראלי" />
            </div>
          </div>
          <div>
            <Label>טלפון נייד</Label>
            <Input placeholder="050-0000000" className="direction-ltr text-right" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsWalkInOpen(false)}>ביטול</Button>
            <Button onClick={() => setIsWalkInOpen(false)}>קלוט לקוח</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

// -- PATIENTS --
export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { patients, loading: patientsLoading } = usePatients();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">מטופלים</h1>
           <p className="text-gray-600">ניהול תיקי לקוחות וטיפולים</p>
        </div>
        <Button className="shadow-sm" onClick={() => setIsAddPatientOpen(true)}>
           <UserPlus className="ml-2 h-4 w-4" /> מטופל חדש
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש לפי שם או טלפון..." 
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1"><Filter className="ml-2 h-3 w-3" /> סינון</Button>
          <Button variant="outline" size="sm" className="flex-1"><Download className="ml-2 h-3 w-3" /> ייצוא</Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden hidden md:block">
         <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
               <tr>
                  <th className="px-6 py-4">שם המטופל</th>
                  <th className="px-6 py-4">טלפון</th>
                  <th className="px-6 py-4">ביקור אחרון</th>
                  <th className="px-6 py-4">תור קרוב</th>
                  <th className="px-6 py-4">רמת סיכון</th>
                  <th className="px-6 py-4">סטטוס</th>
                  <th className="px-6 py-4"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {/* Loading skeleton */}
               {patientsLoading && (
                 <>
                   {[1,2,3,4,5].map(i => (
                     <tr key={i} className="animate-pulse">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <Skeleton className="h-8 w-8 rounded-full" />
                           <div className="space-y-2">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-3 w-24" />
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-6 w-14 rounded-full" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-6 w-12 rounded-full" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-8 w-8" /></td>
                     </tr>
                   ))}
                 </>
               )}
               {!patientsLoading && filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    className="hover:bg-primary/5 transition-all cursor-pointer group border-r-2 border-r-transparent hover:border-r-primary"
                    onClick={() => navigate(`/admin/patients/${patient.id}`)}
                  >
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={patient.avatar} className="w-8 h-8 rounded-full bg-gray-200 object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                           <div>
                              <div className="font-medium text-gray-900">{patient.name}</div>
                              <div className="text-xs text-gray-500">{patient.email}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-gray-500">{patient.phone}</td>
                     <td className="px-6 py-4 text-gray-500">{new Date(patient.lastVisit).toLocaleDateString('he-IL')}</td>
                     <td className="px-6 py-4">
                        {patient.upcomingAppointment ? (
                           <span className="flex items-center text-primary font-medium">
                              <CalendarIcon size={14} className="ml-1"/>
                              {new Date(patient.upcomingAppointment).toLocaleDateString('he-IL')}
                           </span>
                        ) : <span className="text-gray-500">-</span>}
                     </td>
                     <td className="px-6 py-4">
                        <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'success'}>
                           {getStatusLabel(patient.riskLevel)}
                        </Badge>
                     </td>
                     <td className="px-6 py-4">
                        <Badge variant="outline">פעיל</Badge>
                     </td>
                     <td className="px-6 py-4">
                        <Button variant="ghost" size="icon">
                           <ChevronLeft size={16} />
                        </Button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </Card>

      {/* Mobile List */}
      <div className="md:hidden space-y-4">
         {/* Mobile loading skeleton */}
         {patientsLoading && (
           <>
             {[1,2,3,4].map(i => (
               <Card key={i} className="p-5 animate-pulse">
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                     <Skeleton className="w-12 h-12 rounded-full" />
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-28" />
                       <Skeleton className="h-3 w-24" />
                     </div>
                   </div>
                   <Skeleton className="h-6 w-14 rounded-full" />
                 </div>
                 <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t">
                   <div className="space-y-1">
                     <Skeleton className="h-3 w-16" />
                     <Skeleton className="h-4 w-20" />
                   </div>
                   <div className="space-y-1">
                     <Skeleton className="h-3 w-16" />
                     <Skeleton className="h-4 w-20" />
                   </div>
                 </div>
               </Card>
             ))}
           </>
         )}
         {!patientsLoading && filteredPatients.map(patient => (
            <Card
               key={patient.id}
               className="p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-all touch-manipulation hover:shadow-lg border-r-2 border-r-transparent hover:border-r-primary"
               onClick={() => navigate(`/admin/patients/${patient.id}`)}
            >
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <img src={patient.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                     <div>
                        <div className="font-bold text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-600">{patient.phone}</div>
                     </div>
                  </div>
                  <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'success'}>
                     {getStatusLabel(patient.riskLevel)}
                  </Badge>
               </div>

               <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                  <div>
                     <span className="text-gray-600 block text-xs">ביקור אחרון</span>
                     {new Date(patient.lastVisit).toLocaleDateString('he-IL')}
                  </div>
                  <div>
                     <span className="text-gray-600 block text-xs">תור קרוב</span>
                     {patient.upcomingAppointment ? new Date(patient.upcomingAppointment).toLocaleDateString('he-IL') : '-'}
                  </div>
               </div>
            </Card>
         ))}
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} title="הוספת מטופל חדש">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>שם פרטי</Label>
                  <Input placeholder="ישראל" />
               </div>
               <div>
                  <Label>שם משפחה</Label>
                  <Input placeholder="ישראלי" />
               </div>
            </div>
            <div>
               <Label>טלפון נייד</Label>
               <Input placeholder="050-0000000" className="direction-ltr" />
            </div>
            <div>
               <Label>אימייל</Label>
               <Input placeholder="email@example.com" className="direction-ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>תאריך לידה</Label>
                  <Input type="date" />
               </div>
               <div>
                  <Label>מגדר</Label>
                  <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                     <option>נקבה</option>
                     <option>זכר</option>
                     <option>אחר</option>
                  </select>
               </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsAddPatientOpen(false)}>ביטול</Button>
               <Button onClick={() => setIsAddPatientOpen(false)}>צור כרטיס</Button>
            </div>
         </div>
      </Dialog>
    </div>
  );
};

// -- CALENDAR --
export const Calendar = () => {
  // Default to day view on mobile
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  );
  const { appointments } = useAppointments();
  const { services } = useServices();
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);

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

  // Helper to format hours
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00
  
  // Helper to get days of week
  const getDaysOfWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfWeek(currentDate);

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter(a => {
      const apptDate = new Date(a.date);
      const apptHour = parseInt(a.time.split(':')[0]);
      return (
        apptDate.getDate() === day.getDate() && 
        apptDate.getMonth() === day.getMonth() && 
        apptHour === hour
      );
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
           <Button variant="ghost" size="icon" onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
           }}>
              <ChevronRight />
           </Button>
           <span className="font-bold text-lg min-w-[150px] text-center">
              {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
           </span>
           <Button variant="ghost" size="icon" onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
           }}>
              <ChevronLeft />
           </Button>
        </div>

        <div className="flex gap-3">
           <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
              <button 
                className={`px-3 py-1.5 rounded-md transition-all ${view === 'day' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setView('day')}
              >
                 יום
              </button>
              <button 
                className={`px-3 py-1.5 rounded-md transition-all ${view === 'week' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setView('week')}
              >
                 שבוע
              </button>
           </div>
           <Button onClick={() => setIsNewApptOpen(true)} className="shadow-sm">
              <Plus size={16} className="ml-2" /> תור חדש
           </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden flex flex-col border-stone-200">
         {/* Header Row */}
         <div className="flex border-b border-gray-100">
            <div className="w-14 border-l border-gray-100 shrink-0 bg-gray-50"></div>
            {weekDays.map((day, i) => (
               <div key={i} className={`flex-1 text-center py-3 border-l border-gray-100 ${day.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                  <div className="text-xs text-gray-500 mb-1">{day.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                  <div className={`text-lg font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${day.toDateString() === new Date().toDateString() ? 'bg-primary text-white shadow-md' : 'text-gray-900'}`}>
                     {day.getDate()}
                  </div>
               </div>
            ))}
         </div>

         {/* Time Grid */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
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
                              onClick={() => setIsNewApptOpen(true)}
                           >
                              <Plus className="text-primary bg-white rounded-full shadow-sm p-1 w-6 h-6 border border-gray-100" />
                           </button>

                           {/* Appointments */}
                           {cellAppts.map(appt => (
                              <div 
                                 key={appt.id}
                                 className={`absolute left-1 right-1 p-2 rounded-lg text-xs shadow-sm border-l-4 cursor-pointer z-20 hover:scale-[1.02] transition-transform
                                    ${appt.status === 'confirmed' ? 'bg-green-50 border-green-500 text-green-800' : 
                                      appt.status === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-gray-100 border-gray-400 text-gray-700'}
                                 `}
                                 style={{ 
                                    top: `${(parseInt(appt.time.split(':')[1]) / 60) * 100}%`,
                                    height: `${(appt.duration / 60) * 100}%`,
                                    minHeight: '40px'
                                 }}
                                 onClick={(e) => { e.stopPropagation(); alert(`צפייה בפרטי תור: ${appt.patientName}`); }}
                              >
                                 <div className="font-bold truncate">{appt.patientName}</div>
                                 <div className="truncate opacity-80">{appt.serviceName}</div>
                              </div>
                           ))}
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
               <Label>מטופל</Label>
               <Input placeholder="חפש מטופל..." />
            </div>
            <div>
               <Label>טיפול</Label>
               <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  {services.map(s => <option key={s.id}>{s.name} ({s.duration} דק׳)</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>תאריך</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
               </div>
               <div>
                  <Label>שעה</Label>
                  <Input type="time" defaultValue="10:00" />
               </div>
            </div>
            <div>
               <Label>הערות</Label>
               <textarea className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm" placeholder="הערות מיוחדות..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsNewApptOpen(false)}>ביטול</Button>
               <Button onClick={() => setIsNewApptOpen(false)}>שמור ביומן</Button>
            </div>
         </div>
      </Dialog>
    </div>
  );
};

// -- SETTINGS (Upgraded with Clinic Profile) --
export const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  // Sync activeTab with URL param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in pb-10">
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm"><SettingsIcon className="w-6 h-6 text-gray-700" /></div>
         <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">הגדרות מרפאה</h1>
           <p className="text-muted-foreground text-sm">התאמת המערכת לצרכי הקליניקה האסתטית</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none gap-6 h-auto overflow-x-auto no-scrollbar">
          {['profile', 'general', 'team', 'billing'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              activeValue={activeTab}
              onClick={setActiveTab}
            >
                <span className={`pb-3 border-b-2 text-base px-2 whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                   {tab === 'profile' && 'אתר ונראות'}
                   {tab === 'general' && 'פרטי עסק'}
                   {tab === 'team' && 'צוות מטפל'}
                   {tab === 'billing' && 'חבילה ותשלומים'}
                </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* NEW: PROFILE TAB */}
          {activeTab === 'profile' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                   <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold">עיצוב עמוד נחיתה</h3>
                         <a href="/c/dr-sarah" target="_blank">
                           <Button variant="outline" size="sm">
                              <Globe size={14} className="ml-2"/> צפה באתר החי
                           </Button>
                         </a>
                      </div>
                      
                      <div className="space-y-6">
                         <div>
                            <Label>תמונת נושא (Hero Image)</Label>
                            <div className="h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group">
                               <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068" className="w-full h-full object-cover opacity-80" />
                               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                  <span className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                                     <ImageIcon size={16} className="ml-2"/> החלף תמונה
                                  </span>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <Label>לוגו הקליניקה</Label>
                               <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-full border bg-gray-50 flex items-center justify-center overflow-hidden">
                                     <span className="text-xl font-bold text-gray-400">Logo</span>
                                  </div>
                                  <Button variant="ghost" size="sm">העלה</Button>
                               </div>
                            </div>
                            <div>
                               <Label>צבע מותג</Label>
                               <div className="flex items-center gap-2 border p-2 rounded-lg bg-white">
                                  <div className="w-8 h-8 rounded bg-[#BCA48D] border"></div>
                                  <span className="text-sm font-mono">#BCA48D</span>
                               </div>
                            </div>
                         </div>

                         <div>
                            <Label>תיאור אודות (יופיע בדף הבית)</Label>
                            <textarea className="w-full min-h-[100px] border border-gray-200 rounded-lg p-3 text-sm" placeholder="ספרי על הקליניקה שלך..." defaultValue="ברוכים הבאים לקליניקה שלנו בלב תל אביב. אנו מתמחים בטיפולי אסתטיקה מתקדמים..." />
                         </div>
                      </div>
                   </Card>

                   <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                      <h3 className="text-lg font-bold mb-4">כתובת ה-URL שלך</h3>
                      <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                         <Globe size={18} className="text-gray-400" />
                         <span className="text-gray-500 text-sm">clinicall.com/c/</span>
                         <input type="text" className="bg-transparent font-bold text-gray-900 border-none outline-none flex-1" defaultValue="dr-sarah" />
                         <Button size="sm" variant="ghost"><Check size={16}/></Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">שינוי הכתובת עלול לשבור קישורים קיימים ששלחת למטופלים.</p>
                   </Card>
                </div>
                
                <div className="space-y-6">
                   <Card className="p-6 rounded-3xl bg-stone-900 text-white border-none">
                      <h3 className="font-bold mb-2 flex items-center gap-2"><Sparkles size={16}/> טיפים לנראות</h3>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">
                         תמונות אותנטיות של הקליניקה והצוות מגדילות את אחוזי ההמרה ב-40%. מומלץ להעלות לפחות 3 תמונות לגלריה.
                      </p>
                      <Button variant="secondary" className="w-full bg-white/10 text-white border-none hover:bg-white/20">מדריך צילום</Button>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === 'general' && (
             <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                   <h3 className="text-lg font-bold mb-6">פרטי העסק</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label>שם העסק (חשבוניות)</Label>
                           <Input defaultValue="ד״ר שרה כהן בע״מ" />
                        </div>
                        <div>
                           <Label>מספר עוסק / ח.פ.</Label>
                           <Input defaultValue="512345678" />
                        </div>
                      </div>
                      <div>
                         <Label>כתובת למשלוח דואר</Label>
                         <Input defaultValue="שדרות רוטשילד 45, תל אביב" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label>טלפון ראשי</Label>
                            <Input defaultValue="03-555-1234" />
                         </div>
                         <div>
                            <Label>אימייל לחיובים</Label>
                            <Input defaultValue="billing@clinic.com" />
                         </div>
                      </div>
                   </div>
                   <div className="mt-6 pt-6 border-t flex justify-end">
                      <Button>שמור שינויים</Button>
                   </div>
                </Card>
             </div>
          )}
          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">צוות המטפלים</h3>
                  <Button size="sm"><UserPlus size={14} className="ml-2"/> הזמן איש צוות</Button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'ד״ר שרה כהן', role: 'מנהלת רפואית', email: 'sarah@clinic.com', avatar: 'ש' },
                    { name: 'מיכל לוי', role: 'קוסמטיקאית', email: 'michal@clinic.com', avatar: 'מ' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">פעיל</Badge>
                        <Button variant="ghost" size="icon"><MoreVertical size={16}/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Current Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6 rounded-3xl border-stone-100 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-teal-400 to-emerald-400"></div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                          <Crown size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">Professional</h3>
                            <Badge variant="success">פעיל</Badge>
                          </div>
                          <p className="text-gray-500 text-sm">חבילה חודשית • מתחדשת ב-15 לחודש</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-3xl font-bold text-gray-900">₪349<span className="text-base font-normal text-gray-500">/חודש</span></p>
                        <p className="text-xs text-gray-400">לפני מע״מ</p>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">מטופלים פעילים</p>
                        <p className="text-lg font-bold text-gray-900">127 <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-primary h-1.5 rounded-full" style={{width: '25%'}}></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">תורים החודש</p>
                        <p className="text-lg font-bold text-gray-900">89 <span className="text-sm font-normal text-gray-400">/ ללא הגבלה</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">SMS שנשלחו</p>
                        <p className="text-lg font-bold text-gray-900">342 <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '68%'}}></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">שאילתות AI</p>
                        <p className="text-lg font-bold text-gray-900">156 <span className="text-sm font-normal text-gray-400">/ 200</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <Button variant="outline" size="sm">
                        <ArrowUpRight size={14} className="ml-2"/> שדרג חבילה
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        בטל מנוי
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Payment Method */}
                <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                  <h3 className="text-lg font-bold mb-4">אמצעי תשלום</h3>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden mb-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded"></div>
                      <span className="text-xs opacity-60">VISA</span>
                    </div>
                    <p className="font-mono text-lg tracking-wider mb-4">•••• •••• •••• 4521</p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="opacity-60">בעל הכרטיס</p>
                        <p>שרה כהן</p>
                      </div>
                      <div>
                        <p className="opacity-60">תוקף</p>
                        <p>12/26</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <CreditCard size={16} className="ml-2"/> עדכן כרטיס
                  </Button>
                </Card>
              </div>

              {/* Plan Comparison */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <h3 className="text-lg font-bold mb-6">השוואת חבילות</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Starter */}
                  <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-1">Starter</h4>
                    <p className="text-2xl font-bold mb-4">₪149<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> עד 100 מטופלים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> יומן תורים בסיסי</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> 100 SMS לחודש</li>
                      <li className="flex items-center gap-2 text-gray-400"><XCircle size={14}/> עוזר AI</li>
                      <li className="flex items-center gap-2 text-gray-400"><XCircle size={14}/> דוחות מתקדמים</li>
                    </ul>
                    <Button variant="outline" className="w-full">בחר חבילה</Button>
                  </div>

                  {/* Professional - Current */}
                  <div className="border-2 border-primary rounded-2xl p-5 relative bg-primary/5">
                    <Badge className="absolute -top-3 right-4 bg-primary text-white">החבילה שלך</Badge>
                    <h4 className="font-bold text-gray-900 mb-1">Professional</h4>
                    <p className="text-2xl font-bold mb-4">₪349<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> עד 500 מטופלים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> יומן מתקדם + סנכרון</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> 500 SMS לחודש</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> עוזר AI (200 שאילתות)</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> דוחות מתקדמים</li>
                    </ul>
                    <Button className="w-full" disabled>החבילה הנוכחית</Button>
                  </div>

                  {/* Enterprise */}
                  <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors bg-gradient-to-br from-gray-50 to-white">
                    <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">Enterprise <Sparkles size={14} className="text-amber-500"/></h4>
                    <p className="text-2xl font-bold mb-4">₪699<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> מטופלים ללא הגבלה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> מספר סניפים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> SMS ללא הגבלה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> AI ללא הגבלה + התאמה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> מנהל לקוח ייעודי</li>
                    </ul>
                    <Button variant="outline" className="w-full">שדרג עכשיו</Button>
                  </div>
                </div>
              </Card>

              {/* Invoice History */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">היסטוריית חשבוניות</h3>
                  <Button variant="ghost" size="sm">
                    <Download size={14} className="ml-2"/> הורד הכל
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium">מספר חשבונית</th>
                        <th className="text-right py-3 px-4 font-medium">תאריך</th>
                        <th className="text-right py-3 px-4 font-medium">סכום</th>
                        <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                        <th className="text-right py-3 px-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { id: 'INV-2024-012', date: '15/01/2024', amount: 408.41, status: 'paid' },
                        { id: 'INV-2024-011', date: '15/12/2023', amount: 408.41, status: 'paid' },
                        { id: 'INV-2024-010', date: '15/11/2023', amount: 408.41, status: 'paid' },
                        { id: 'INV-2024-009', date: '15/10/2023', amount: 408.41, status: 'paid' },
                      ].map((inv, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{inv.id}</td>
                          <td className="py-3 px-4 text-gray-500">{inv.date}</td>
                          <td className="py-3 px-4 text-gray-900">₪{inv.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="success">שולם</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Download size={14}/>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Billing Contact */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <h3 className="text-lg font-bold mb-4">פרטי חיוב</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם לחשבונית</Label>
                    <Input defaultValue="ד״ר שרה כהן בע״מ" />
                  </div>
                  <div>
                    <Label>ח.פ. / ע.מ.</Label>
                    <Input defaultValue="512345678" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>כתובת לחשבונית</Label>
                    <Input defaultValue="שדרות רוטשילד 45, תל אביב 6688312" />
                  </div>
                  <div>
                    <Label>אימייל לקבלת חשבוניות</Label>
                    <Input defaultValue="billing@drsarah.co.il" />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Button>שמור שינויים</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};