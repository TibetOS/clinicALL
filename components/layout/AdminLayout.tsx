import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, useHealthTokens, useActivityLog, useSessionTimeout } from '../../hooks';
import { isValidRedirectUrl } from '../../lib/validation';
import { Notification } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { LogoutDialog, SessionTimeoutDialog, DeclarationShareDialog } from './dialogs';

type AdminLayoutProps = {
  children?: React.ReactNode;
};

type DeclarationDialogState = {
  open: boolean;
  notification: Notification | null;
  generatedLink: string | null;
  tokenValue: string | null;
};

/**
 * Admin layout wrapper composing sidebar, header, and dialogs.
 * Manages shared state for notifications, session timeout, and dialogs.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Health Declaration
  const { createToken, generateShareLink, generateWhatsAppLink, generateEmailLink } = useHealthTokens();
  const [declarationDialog, setDeclarationDialog] = useState<DeclarationDialogState>({
    open: false,
    notification: null,
    generatedLink: null,
    tokenValue: null,
  });

  // Logout Dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location]);

  // Handle send declaration action from notification
  const handleSendDeclaration = async (notif: Notification) => {
    if (!notif.metadata) return;

    const token = await createToken({
      patientId: notif.metadata.patientId,
      patientName: notif.metadata.patientName || '',
      patientPhone: notif.metadata.patientPhone,
      patientEmail: notif.metadata.patientEmail,
    });

    if (token) {
      const link = generateShareLink(token.token);
      setDeclarationDialog({
        open: true,
        notification: notif,
        generatedLink: link,
        tokenValue: token.token,
      });
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.tokenValue) return;
    const { patientPhone } = declarationDialog.notification.metadata;
    const whatsappLink = generateWhatsAppLink(declarationDialog.tokenValue, patientPhone || '');
    // SECURITY: Use noopener,noreferrer to prevent tabnabbing attacks
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  // Share via Email
  const shareViaEmail = () => {
    if (!declarationDialog.notification?.metadata || !declarationDialog.tokenValue) return;
    const { patientEmail } = declarationDialog.notification.metadata;
    const emailLink = generateEmailLink(declarationDialog.tokenValue, patientEmail || '');
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

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setLogoutDialogOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onSendDeclaration={handleSendDeclaration}
        />

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

      {/* Dialogs */}
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />

      <SessionTimeoutDialog
        open={showTimeoutWarning}
        remainingSeconds={remainingSeconds}
        onDismiss={dismissTimeoutWarning}
      />

      <DeclarationShareDialog
        open={declarationDialog.open}
        notification={declarationDialog.notification}
        generatedLink={declarationDialog.generatedLink}
        onClose={closeDeclarationDialog}
        onShareWhatsApp={shareViaWhatsApp}
        onShareEmail={shareViaEmail}
      />
    </div>
  );
}
