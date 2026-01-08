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
import { usePatients, useAppointments, useServices } from '../hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Patient, Service, Appointment } from '../types';

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
  // Mock Data for Dashboard
  const todayStats = {
    revenue: 2450,
    revenueTrend: 15, // percent
    appointments: {
      total: 8,
      completed: 3,
      pending: 4,
      cancelled: 1
    },
    monthlyGoal: 72 // percent
  };

  const revenueData = [
    { name: 'א׳', value: 4000 },
    { name: 'ב׳', value: 3000 },
    { name: 'ג׳', value: 2000 },
    { name: 'ד׳', value: 2780 },
    { name: 'ה׳', value: 1890 },
    { name: 'ו׳', value: 2390 },
    { name: 'שבת', value: 3490 },
  ];

  // Visual Timeline Data (Mock)
  const timelineHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const todaysAppointments = [
    { id: '101', time: '09:00', duration: 15, patient: 'שרה כהן', service: 'בוטוקס', status: 'completed', image: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=random' },
    { id: '102', time: '10:00', duration: 60, patient: 'מיכל לוי', service: 'טיפול פנים', status: 'confirmed', image: 'https://ui-avatars.com/api/?name=Michal+Levi&background=random' },
    { id: '103', time: '11:30', duration: 30, patient: 'דניאל אברהם', service: 'ייעוץ', status: 'confirmed', image: 'https://ui-avatars.com/api/?name=Daniel+Avraham&background=random' },
    { id: '104', time: '13:00', duration: 45, patient: 'רונית שמעוני', service: 'מילוי שפתיים', status: 'pending', image: 'https://ui-avatars.com/api/?name=Ronit+Shimoni&background=random' },
    { id: '105', time: '15:30', duration: 30, patient: 'יעל גולן', service: 'ביקורת', status: 'pending', image: 'https://ui-avatars.com/api/?name=Yael+Golan&background=random' },
  ];

  const nextAppointment = todaysAppointments.find(a => a.status === 'confirmed' || a.status === 'pending');

  const { items: timelineItems, count: laneCount } = { items: todaysAppointments.map(a => ({...a, lane: 0})), count: 1 }; // Simplified for now

  // POS State
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [cart, setCart] = useState<Service[]>([]);
  const [posSearch, setPosSearch] = useState('');
  
  // Appointment Dialog State
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);

  const addToCart = (service: Service) => {
     setCart([...cart, service]);
  };
  
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'בוקר טוב', icon: Sun };
    if (hour < 18) return { text: 'צהריים טובים', icon: Sun };
    return { text: 'ערב טוב', icon: Moon };
  };

  const greeting = getCurrentGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 lg:gap-6 auto-rows-auto">
        
        {/* 1. HERO / BRIEFING TILE (Large, Span 6) */}
        <div className="col-span-1 lg:col-span-6 bg-white rounded-3xl p-6 lg:p-8 shadow-soft border border-stone-100 relative overflow-hidden group">
           <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
              <div>
                 <div className="flex items-center gap-2 text-primary/80 mb-2 font-medium">
                    <GreetingIcon size={18} />
                    <span>{greeting.text}</span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    ד״ר שרה <span className="inline-block animate-bounce delay-1000">👋</span>
                 </h1>
                 
                 {nextAppointment ? (
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform group-hover:scale-[1.01] duration-300 w-full sm:w-auto shadow-sm">
                       <div className="flex -space-x-3 space-x-reverse shrink-0">
                          <img src={nextAppointment.image} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="" />
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white text-primary font-bold shadow-sm">
                             {nextAppointment.time}
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium truncate">המטופל הבא שלך</p>
                          <p className="text-lg font-bold text-gray-900 truncate">{nextAppointment.patient}</p>
                          <p className="text-sm text-gray-500 truncate">{nextAppointment.service}</p>
                       </div>
                       <Button size="sm" className="w-full sm:w-auto mt-2 sm:mt-0 rounded-xl shadow-lg shadow-primary/20 whitespace-nowrap" onClick={() => navigate(`/admin/patients/${nextAppointment.id}`)}>
                          צפה בתיק <ChevronLeft size={16} className="mr-1" />
                       </Button>
                    </div>
                 ) : (
                    <div className="bg-green-50 rounded-2xl p-4 text-green-800 border border-green-100 inline-block">
                       <p className="font-bold flex items-center gap-2"><Coffee size={18}/> אין תורים קרובים, זמן להפסקת קפה!</p>
                    </div>
                 )}
              </div>
           </div>
           
           {/* Abstract Background Decoration */}
           <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 bottom-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl"></div>
           </div>
        </div>

        {/* 2. REVENUE TILE (Medium, Span 3) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#1C1917] text-white rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between min-h-[220px]">
           <div className="flex justify-between items-start z-10">
              <div>
                 <p className="text-stone-400 font-medium text-sm mb-1">הכנסות היום</p>
                 <h2 className="text-4xl font-bold tracking-tight">₪{todayStats.revenue.toLocaleString()}</h2>
              </div>
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                 <TrendingUp size={20} className="text-green-400" />
              </div>
           </div>
           
           {/* Micro Chart with tooltip */}
           <div className="h-24 -mx-6 -mb-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis
                       dataKey="name"
                       axisLine={false}
                       tickLine={false}
                       tick={{ fontSize: 10, fill: '#9CA3AF' }}
                       dy={5}
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
                       labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2DD4BF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueDark)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex items-center gap-2 mt-4 text-sm font-medium z-10">
              <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg flex items-center">
                 <ArrowUpRight size={14} className="mr-1" /> {todayStats.revenueTrend}%
              </span>
              <span className="text-stone-500">מהשבוע שעבר</span>
           </div>
        </div>

        {/* 3. QUICK ACTIONS (Medium, Span 3) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-rows-2 gap-4">
           {/* Top Half: POS */}
           <div 
              className="bg-white rounded-3xl p-5 shadow-soft border border-stone-100 hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
              onClick={() => setIsPosOpen(true)}
           >
              <div>
                 <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Zap size={20} />
                 </div>
                 <h3 className="font-bold text-gray-900">מכירה מהירה</h3>
              </div>
              <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                 <ChevronLeft />
              </div>
           </div>

           {/* Bottom Half: New Appt */}
           <div 
              className="bg-white rounded-3xl p-5 shadow-soft border border-stone-100 hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
              onClick={() => setIsNewApptOpen(true)}
           >
              <div>
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <CalendarIcon size={20} />
                 </div>
                 <h3 className="font-bold text-gray-900">תור חדש</h3>
              </div>
              <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                 <ChevronLeft />
              </div>
           </div>
        </div>
      </div>

      {/* Quick POS Modal */}
      <Dialog open={isPosOpen} onClose={() => setIsPosOpen(false)} title="קופה מהירה">
         <div className="flex flex-col h-[500px]">
            {/* ... Content same as before ... */}
            <p className="text-center p-10">תוכן הקופה המהירה יופיע כאן</p>
         </div>
      </Dialog>
      
      {/* New Appt Dialog */}
      <Dialog open={isNewApptOpen} onClose={() => setIsNewApptOpen(false)} title="קביעת תור חדש">
        <div className="space-y-4">
            {/* ... Content same as before ... */}
            <p className="text-center p-10">טופס קביעת תור יופיע כאן</p>
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