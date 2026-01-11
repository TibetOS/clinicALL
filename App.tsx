
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings,
  Menu, Bell, LogOut, ChevronLeft, Package,
  Crown, Sparkles, X, Syringe, FileHeart, MessageCircle, Mail,
  Timer, Loader2
} from 'lucide-react';
import { LoginPage, HealthDeclaration, SignupPage, LandingPage, LockScreen, ResetPasswordPage } from './pages/Public';
import { ClinicLanding } from './pages/ClinicLanding';
import { BookingApp } from './pages/Booking';
import { Button, Badge, Dialog } from './components/ui';
import { useNotifications, useHealthTokens, useActivityLog, useSessionTimeout, formatRemainingTime } from './hooks';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Notification } from './types';
import { isValidRedirectUrl } from './lib/validation';

// Lazy load admin pages for code splitting
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const PatientList = lazy(() => import('./pages/admin/PatientList').then(m => ({ default: m.PatientList })));
const Calendar = lazy(() => import('./pages/admin/Calendar').then(m => ({ default: m.Calendar })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ServicesPage = lazy(() => import('./pages/admin/Services').then(m => ({ default: m.ServicesPage })));
const InventoryPage = lazy(() => import('./pages/admin/Inventory').then(m => ({ default: m.InventoryPage })));
const PatientDetails = lazy(() => import('./pages/PatientDetails').then(m => ({ default: m.PatientDetails })));

// Loading spinner for lazy loaded routes with enhanced animation
const PageLoader = () => (
  <div className="flex items-center justify-center h-64 animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-teal-200 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-500 text-sm animate-pulse">טוען...</p>
    </div>
  </div>
);

// Animated page wrapper for route transitions
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <div className="page-transition">
    {children}
  </div>
);

// Role-protected page wrapper for granular access control
const RoleProtectedPage = ({
  children,
  requiredRole
}: {
  children: React.ReactNode;
  requiredRole: 'owner' | 'admin' | 'staff';
}) => {
  const { profile } = useAuth();
  const roleHierarchy: Record<string, number> = {
    owner: 3,
    admin: 2,
    staff: 1,
    client: 0
  };

  const userLevel = roleHierarchy[profile?.role || 'client'] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
          <p className="text-gray-500">אין לך הרשאה לצפות בדף זה. פנה למנהל המערכת לקבלת גישה.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Layout Component
const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  // Notifications State
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Health Declaration Dialog State
  const { createToken, generateShareLink, generateWhatsAppLink, generateEmailLink } = useHealthTokens();
  const [declarationDialog, setDeclarationDialog] = useState<{
    open: boolean;
    notification: Notification | null;
    generatedLink: string | null;
    tokenValue: string | null;
  }>({ open: false, notification: null, generatedLink: null, tokenValue: null });

  // Logout Confirmation Dialog State
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Activity Logging
  const { logActivity } = useActivityLog();

  // Session Timeout for HIPAA compliance (15 min timeout, 1 min warning)
  const {
    showWarning: showTimeoutWarning,
    remainingSeconds,
    dismissWarning: dismissTimeoutWarning,
  } = useSessionTimeout({
    timeoutMinutes: 15,
    warningMinutes: 1,
    onTimeout: async () => {
      await logActivity('logout', 'user', profile?.id, profile?.full_name, {
        reason: 'session_timeout',
        duration_minutes: 15,
      });
    },
    navigateToLock: true,
    enabled: true,
  });

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
      setDeclarationDialog({ open: true, notification: notif, generatedLink: link, tokenValue: token.token });
      setIsNotifOpen(false);
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.tokenValue) return;
    const { patientPhone } = declarationDialog.notification.metadata;
    const whatsappLink = generateWhatsAppLink(
      declarationDialog.tokenValue,
      patientPhone || ''
    );
    // SECURITY: Use noopener,noreferrer to prevent tabnabbing attacks
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  // Share via Email
  const shareViaEmail = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.tokenValue) return;
    const { patientEmail } = declarationDialog.notification.metadata;
    const emailLink = generateEmailLink(
      declarationDialog.tokenValue,
      patientEmail || ''
    );
    // Validate mailto: URL before navigating
    if (isValidRedirectUrl(emailLink)) {
      window.location.href = emailLink;
    }
  };

  // Close declaration dialog and mark notification as read
  const closeDeclarationDialog = () => {
    if (declarationDialog.notification) {
      markAsRead(declarationDialog.notification.id);
    }
    setDeclarationDialog({ open: false, notification: null, generatedLink: null, tokenValue: null });
  };

  // Handle logout with activity logging and error handling
  const handleLogout = async () => {
    setLogoutLoading(true);
    setLogoutError(null);

    try {
      // Log the logout activity before signing out
      await logActivity('logout', 'user', profile?.id, profile?.full_name, {
        reason: 'user_initiated',
      });

      // Perform sign out
      const { error } = await signOut();

      if (error) {
        setLogoutError('שגיאה בהתנתקות. אנא נסה שוב.');
        setLogoutLoading(false);
        return;
      }

      // Close dialog and navigate to login
      setLogoutDialogOpen(false);
      navigate('/login');
    } catch {
      setLogoutError('שגיאה בהתנתקות. אנא נסה שוב.');
      setLogoutLoading(false);
    }
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
    <div className="min-h-screen flex overflow-hidden bg-slate-50" dir="rtl">
      {/* Sidebar - Dark Slate */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-slate-800 shadow-xl lg:shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-slate-700/50 shrink-0 justify-between lg:justify-start">
          <div className="flex items-center">
            <Link to="/">
               <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg ml-3 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600" style={{ boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)' }}>C</div>
            </Link>
            <div>
               <span className="font-bold text-xl tracking-tight block leading-tight text-white">ClinicALL</span>
               <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400">Beauty System</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white" aria-label="סגור תפריט">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar flex-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-out group relative transform-gpu
                  ${isActive
                    ? 'bg-teal-500 text-white shadow-lg scale-100'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1 active:scale-[0.98]'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator bar on right with animation */}
                <div
                  className={`
                    absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-l-full bg-teal-300 transition-all duration-300 ease-out
                    ${isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}
                  `}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
                <Icon
                  size={20}
                  className={`
                    transition-all duration-200
                    ${isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-110'}
                  `}
                />
                <span className="transition-transform duration-200">{item.label}</span>
                <ChevronLeft
                  className={`
                    mr-auto h-4 w-4 transition-all duration-200
                    ${isActive
                      ? 'text-teal-200 opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}
                  `}
                />
              </Link>
            )
          })}
        </nav>

        {/* Subscription Widget & Logout */}
        <div className="p-4 pb-6 mt-auto border-t border-slate-700/50 bg-slate-900/30 relative z-20">
           {/* Plan Widget - Clickable Link to Settings */}
           <Link to="/admin/settings?tab=billing">
             <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 text-white mb-4 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-0.5 ring-1 ring-slate-600/50">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-teal-500/20 rounded-full blur-xl group-hover:bg-teal-500/30 transition-colors"></div>

                <div className="flex justify-between items-start mb-2 relative z-10">
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">התוכנית שלך</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <Crown size={14} className="text-yellow-400" />
                         <span className="font-bold text-sm">Professional</span>
                      </div>
                   </div>
                   <Badge variant="success" className="text-[10px] h-5 bg-teal-500 text-white border-none">פעיל</Badge>
                </div>

                <div className="w-full bg-slate-600/50 rounded-full h-1.5 mb-2 relative z-10">
                   <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400 relative z-10">65% ניצולת חבילה החודש</p>
             </div>
           </Link>

           <Button
             variant="ghost"
             className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-xl py-3 min-h-[48px] select-none group transition-all duration-200"
             onClick={() => setLogoutDialogOpen(true)}
           >
             <LogOut size={20} className="transition-transform duration-200 group-hover:rotate-[-12deg] group-hover:scale-110" /> התנתק
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-40 sticky top-0 transition-all duration-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg" aria-label={sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'} aria-expanded={sidebarOpen}>
            <Menu />
          </button>

          <div className="flex-1"></div> {/* Spacer */}

          <div className="flex items-center gap-2 lg:gap-4">
             {/* Public Site Link */}
             <a href="/c/dr-sarah" target="_blank" rel="noopener noreferrer" className="hidden md:flex">
                <Button size="sm" variant="outline" className="gap-2">
                   <Sparkles size={14}/> הצג אתר חי
                </Button>
             </a>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label={`התראות${unreadCount > 0 ? ` (${unreadCount} חדשות)` : ''}`}
                aria-expanded={isNotifOpen}
                aria-haspopup="true"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 left-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <div
                  className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 transform-gpu"
                  style={{
                    animation: 'fadeInScale 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    transformOrigin: 'top left'
                  }}
                >
                  <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <span className="font-bold text-sm text-gray-900">התראות ({unreadCount})</span>
                    <button className="text-xs text-primary hover:underline transition-colors duration-200" onClick={() => markAllAsRead()}>סמן הכל כנקרא</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:translate-x-1 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                          style={{
                            animation: `fadeInUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                            animationDelay: `${index * 50}ms`,
                            opacity: 0
                          }}
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

            <div className="flex items-center gap-3 pl-2 border-r border-slate-200 pr-4">
               <div className="text-left hidden md:block">
                  <div className="text-sm font-bold text-slate-800">{profile?.full_name || 'ד״ר שרה כהן'}</div>
                  <div className="text-xs text-slate-500">
                    {profile?.role === 'owner' ? 'בעלים' :
                     profile?.role === 'admin' ? 'מנהל/ת' :
                     profile?.role === 'staff' ? 'צוות' : 'מנהלת רפואית'}
                  </div>
               </div>
               <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                 {profile?.full_name?.charAt(0) || 'ש'}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 xl:p-10 scroll-smooth">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay - positioned to not cover the sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 right-72 z-40 lg:hidden transition-all duration-300
          ${sidebarOpen
            ? 'bg-black/40 backdrop-blur-sm opacity-100 pointer-events-auto'
            : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

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

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => !logoutLoading && setLogoutDialogOpen(false)}
        title="יציאה מהמערכת"
      >
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            אתה בטוח שברצונך לצאת מהמערכת?
          </p>

          {/* Error Message */}
          {logoutError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {logoutError}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setLogoutError(null);
                setLogoutDialogOpen(false);
              }}
              disabled={logoutLoading}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              className="gap-2 min-w-[120px]"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  מתנתק...
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  כן, התנתק
                </>
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Session Timeout Warning Dialog */}
      <Dialog
        open={showTimeoutWarning}
        onClose={dismissTimeoutWarning}
        title="אזהרת סיום סשן"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Timer size={32} className="text-orange-600" />
            </div>
            <p className="text-gray-600 text-center">
              הסשן שלך עומד להסתיים עקב חוסר פעילות.
            </p>
            <div className="text-3xl font-bold text-orange-600 font-mono">
              {formatRemainingTime(remainingSeconds)}
            </div>
            <p className="text-sm text-gray-500 text-center">
              לחץ להמשיך עבודה כדי להישאר מחובר
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={dismissTimeoutWarning} className="gap-2">
              המשך עבודה
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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

          {/* Admin routes with role-based access control */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="staff">
              <AdminLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Staff+ can access dashboard, patients, calendar */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="patients" element={<PatientList />} />
                    <Route path="patients/:id" element={<PatientDetails />} />
                    <Route path="calendar" element={<Calendar />} />

                    {/* Admin+ can manage services and inventory */}
                    <Route path="services" element={
                      <RoleProtectedPage requiredRole="admin">
                        <ServicesPage />
                      </RoleProtectedPage>
                    } />
                    <Route path="inventory" element={
                      <RoleProtectedPage requiredRole="admin">
                        <InventoryPage />
                      </RoleProtectedPage>
                    } />

                    {/* Owner only can access settings */}
                    <Route path="settings" element={
                      <RoleProtectedPage requiredRole="owner">
                        <SettingsPage />
                      </RoleProtectedPage>
                    } />

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
    </ErrorBoundary>
  );
}

export default App;
