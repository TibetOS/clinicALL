import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Sparkles, FileHeart } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';

type AdminHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSendDeclaration: (notification: Notification) => void;
};

/**
 * Admin header with menu toggle, notifications dropdown, and user profile.
 */
export function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onSendDeclaration,
}: AdminHeaderProps) {
  const { profile } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-40 sticky top-0 transition-all duration-200">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        aria-label={sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}
        aria-expanded={sidebarOpen}
      >
        <Menu />
      </button>

      <div className="flex-1" /> {/* Spacer */}

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Public Site Link */}
        <a href="/c/dr-sarah" target="_blank" rel="noopener noreferrer" className="hidden md:flex">
          <Button size="sm" variant="outline" className="gap-2">
            <Sparkles size={14} /> הצג אתר חי
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
              <span className="absolute top-2 left-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div
              className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 transform-gpu"
              style={{
                animation: 'fadeInScale 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transformOrigin: 'top left',
              }}
            >
              <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <span className="font-bold text-sm text-gray-900">התראות ({unreadCount})</span>
                <button
                  className="text-xs text-primary hover:underline transition-colors duration-200"
                  onClick={() => onMarkAllAsRead()}
                >
                  סמן הכל כנקרא
                </button>
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
                        opacity: 0,
                      }}
                      onClick={() => !notif.action && onMarkAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            notif.type === 'warning'
                              ? 'bg-orange-500'
                              : notif.type === 'success'
                                ? 'bg-green-500'
                                : notif.type === 'error'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>

                          {/* Appointment details for actionable notifications */}
                          {notif.action === 'send_declaration' && notif.metadata && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">תאריך:</span>
                                <span className="font-medium">
                                  {notif.metadata.appointmentDate} {notif.metadata.appointmentTime}
                                </span>
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
                                  onSendDeclaration(notif);
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
                                  onMarkAsRead(notif.id);
                                }}
                              >
                                לא נדרש
                              </Button>
                            </div>
                          )}

                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {new Date(notif.timestamp).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
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

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-r border-slate-200 pr-4">
          <div className="text-left hidden md:block">
            <div className="text-sm font-bold text-slate-800">{profile?.full_name || 'ד״ר שרה כהן'}</div>
            <div className="text-xs text-slate-500">
              {profile?.role === 'owner' ? 'בעלים' : profile?.role === 'admin' ? 'מנהל/ת' : 'לקוח/ה'}
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
            {profile?.full_name?.charAt(0) || 'ש'}
          </div>
        </div>
      </div>
    </header>
  );
}
