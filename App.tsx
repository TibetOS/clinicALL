
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings,
  Menu, Bell, LogOut, ChevronLeft, Package,
  Crown, Sparkles, X, Syringe, Send, FileHeart, MessageCircle, Mail
} from 'lucide-react';
import { LoginPage, HealthDeclaration, SignupPage, LandingPage, LockScreen, ResetPasswordPage } from './pages/Public';
import { ClinicLanding } from './pages/ClinicLanding';
import { PricingPage } from './pages/Pricing';
import { BookingApp } from './pages/Booking';
import { Button, Badge, Dialog } from './components/ui';
import { useNotifications, useHealthTokens } from './hooks';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Notification } from './types';

// Lazy load admin pages for code splitting
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const PatientList = lazy(() => import('./pages/admin/PatientList').then(m => ({ default: m.PatientList })));
const Calendar = lazy(() => import('./pages/admin/Calendar').then(m => ({ default: m.Calendar })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ServicesPage = lazy(() => import('./pages/Services').then(m => ({ default: m.ServicesPage })));
const InventoryPage = lazy(() => import('./pages/Inventory').then(m => ({ default: m.InventoryPage })));
const PatientDetails = lazy(() => import('./pages/PatientDetails').then(m => ({ default: m.PatientDetails })));

// Loading spinner for lazy loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">טוען...</p>
    </div>
  </div>
);

// Layout Component
const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  // Notifications State
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Health Declaration Dialog State
  const { createToken, generateShareLink, generateWhatsAppLink, generateEmailLink } = useHealthTokens();
  const [declarationDialog, setDeclarationDialog] = useState<{
    open: boolean;
    notification: Notification | null;
    generatedLink: string | null;
  }>({ open: false, notification: null, generatedLink: null });

  // Handle send declaration action from notification
  const handleSendDeclaration = async (notif: Notification) => {
    if (!notif.metadata) return;

    // Generate token for this patient
    const token = await createToken({
      patientId: notif.metadata.patientId,
      patientName: notif.metadata.patientName || '',
      patientPhone: notif.metadata.patientPhone,
      patientEmail: notif.metadata.patientEmail,
    });

    if (token) {
      const link = generateShareLink(token.token);
      setDeclarationDialog({ open: true, notification: notif, generatedLink: link });
      setIsNotifOpen(false);
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.generatedLink) return;
    const { patientName, patientPhone } = declarationDialog.notification.metadata;
    const whatsappLink = generateWhatsAppLink(
      declarationDialog.generatedLink,
      patientName || '',
      patientPhone || ''
    );
    window.open(whatsappLink, '_blank');
  };

  // Share via Email
  const shareViaEmail = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.generatedLink) return;
    const { patientName, patientEmail } = declarationDialog.notification.metadata;
    const emailLink = generateEmailLink(
      declarationDialog.generatedLink,
      patientName || '',
      patientEmail || ''
    );
    window.location.href = emailLink;
  };

  // Close declaration dialog and mark notification as read
  const closeDeclarationDialog = () => {
    if (declarationDialog.notification) {
      markAsRead(declarationDialog.notification.id);
    }
    setDeclarationDialog({ open: false, notification: null, generatedLink: null });
  };

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'לוח בקרה', path: '/admin/dashboard' },
    { icon: Users, label: 'מטופלים', path: '/admin/patients' },
    { icon: CalendarIcon, label: 'יומן תורים', path: '/admin/calendar' },
    { icon: Syringe, label: 'טיפולים ומחירון', path: '/admin/services' },
    { icon: Package, label: 'מלאי', path: '/admin/inventory' },
    { icon: Settings, label: 'הגדרות', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-stone-100 shadow-xl lg:shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-stone-100 shrink-0 justify-between lg:justify-start">
          <div className="flex items-center">
            <Link to="/">
               <div className="h-9 w-9 bg-gradient-to-br from-primary to-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-lg ml-3 shadow-lg shadow-primary/30">C</div>
            </Link>
            <div>
               <span className="font-bold text-xl text-gray-900 tracking-tight block leading-tight">ClinicALL</span>
               <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Medical System</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 p-1">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10' 
                    : 'text-gray-600 hover:bg-stone-50 hover:text-gray-900'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'} />
                {item.label}
                {isActive && <ChevronLeft className="mr-auto h-4 w-4 opacity-50" />}
              </Link>
            )
          })}
        </nav>

        {/* Subscription Widget & Logout */}
        <div className="p-4 bg-stone-50/50 mt-auto border-t border-stone-100">
           {/* Plan Widget - Clickable Link to Settings */}
           <Link to="/admin/settings?tab=billing">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white mb-4 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                   <div>
                      <p className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">התוכנית שלך</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <Crown size={14} className="text-yellow-400" />
                         <span className="font-bold text-sm">Professional</span>
                      </div>
                   </div>
                   <Badge variant="success" className="text-[10px] h-5 bg-primary text-white border-none">פעיל</Badge>
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-2 relative z-10">
                   <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-gray-400 relative z-10">65% ניצולת חבילה החודש</p>
             </div>
           </Link>

           <Button
             variant="ghost"
             className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
             onClick={async () => {
               await signOut();
               navigate('/login');
             }}
           >
             <LogOut size={20} className="ml-3" /> התנתק
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-stone-50">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-4 lg:px-10 z-40 sticky top-0 transition-all duration-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu />
          </button>

          <div className="flex-1"></div> {/* Spacer */}

          <div className="flex items-center gap-2 lg:gap-4">
             {/* Public Site Link */}
             <a href="/c/dr-sarah" target="_blank" className="hidden md:flex">
                <Button size="sm" variant="outline" className="gap-2">
                   <Sparkles size={14}/> הצג אתר חי
                </Button>
             </a>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 left-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 origin-top-left z-50">
                  <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <span className="font-bold text-sm text-gray-900">התראות ({unreadCount})</span>
                    <button className="text-xs text-primary hover:underline" onClick={() => markAllAsRead()}>סמן הכל כנקרא</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                          onClick={() => !notif.action && markAsRead(notif.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              notif.type === 'warning' ? 'bg-orange-500' :
                              notif.type === 'success' ? 'bg-green-500' :
                              notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>

                              {/* Appointment details for actionable notifications */}
                              {notif.action === 'send_declaration' && notif.metadata && (
                                <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">תאריך:</span>
                                    <span className="font-medium">{notif.metadata.appointmentDate} {notif.metadata.appointmentTime}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">טיפול:</span>
                                    <span className="font-medium">{notif.metadata.serviceName}</span>
                                  </div>
                                </div>
                              )}

                              {/* Action buttons for send_declaration */}
                              {notif.action === 'send_declaration' && (
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    className="text-xs h-7 gap-1 flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendDeclaration(notif);
                                    }}
                                  >
                                    <FileHeart size={12} />
                                    שלח הצהרה
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-7 text-gray-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                  >
                                    לא נדרש
                                  </Button>
                                </div>
                              )}

                              <p className="text-[10px] text-gray-400 mt-1.5">{new Date(notif.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">אין התראות חדשות</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-2 border-r border-gray-100 pr-4">
               <div className="text-left hidden md:block">
                  <div className="text-sm font-bold text-gray-900">{profile?.full_name || 'ד״ר שרה כהן'}</div>
                  <div className="text-xs text-muted-foreground">
                    {profile?.role === 'owner' ? 'בעלים' :
                     profile?.role === 'admin' ? 'מנהל/ת' :
                     profile?.role === 'staff' ? 'צוות' : 'מנהלת רפואית'}
                  </div>
               </div>
               <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                 {profile?.full_name?.charAt(0) || 'ש'}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 xl:p-10 scroll-smooth">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Send Declaration Dialog */}
      <Dialog
        open={declarationDialog.open}
        onClose={closeDeclarationDialog}
        title="שליחת הצהרת בריאות"
      >
        <div className="space-y-4">
          {declarationDialog.notification?.metadata && (
            <>
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-sm text-gray-900">פרטי המטופל</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">שם:</span>
                    <span className="font-medium mr-2">{declarationDialog.notification.metadata.patientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">טלפון:</span>
                    <span className="font-medium mr-2">{declarationDialog.notification.metadata.patientPhone}</span>
                  </div>
                  {declarationDialog.notification.metadata.patientEmail && (
                    <div className="col-span-2">
                      <span className="text-gray-500">אימייל:</span>
                      <span className="font-medium mr-2">{declarationDialog.notification.metadata.patientEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-sm text-gray-900">פרטי התור</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">תאריך:</span>
                    <span className="font-medium mr-2">{declarationDialog.notification.metadata.appointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">שעה:</span>
                    <span className="font-medium mr-2">{declarationDialog.notification.metadata.appointmentTime}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">טיפול:</span>
                    <span className="font-medium mr-2">{declarationDialog.notification.metadata.serviceName}</span>
                  </div>
                </div>
              </div>

              {/* Generated Link */}
              {declarationDialog.generatedLink && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-sm text-green-800 mb-2">קישור נוצר בהצלחה</h4>
                  <div className="bg-white p-2 rounded border text-xs break-all text-gray-600">
                    {declarationDialog.generatedLink}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <h4 className="font-bold text-sm text-gray-900">שליחת הקישור</h4>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={shareViaWhatsApp}
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </Button>
                  {declarationDialog.notification.metadata.patientEmail && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={shareViaEmail}
                    >
                      <Mail size={18} />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={closeDeclarationDialog}>
              סגור
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/health/:token" element={<HealthDeclaration />} />
          <Route path="/health" element={<HealthDeclaration />} />
          <Route path="/locked" element={<LockScreen />} />

          {/* PUBLIC CLINIC LANDING PAGE */}
          <Route path="/c/:slug" element={<ClinicLanding />} />

          {/* Legacy/Direct Booking Link */}
          <Route path="/book/:clinicId" element={<BookingApp />} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="patients" element={<PatientList />} />
                    <Route path="patients/:id" element={<PatientDetails />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Suspense>
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
