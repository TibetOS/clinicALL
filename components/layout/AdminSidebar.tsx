import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings,
  LogOut, ChevronLeft, Package, Crown, X, Syringe
} from 'lucide-react';
import { Button, Badge } from '../ui';

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const navItems = [
  { icon: LayoutDashboard, label: 'לוח בקרה', path: '/admin/dashboard' },
  { icon: Users, label: 'מטופלים', path: '/admin/patients' },
  { icon: CalendarIcon, label: 'יומן תורים', path: '/admin/calendar' },
  { icon: Syringe, label: 'טיפולים ומחירון', path: '/admin/services' },
  { icon: Package, label: 'מלאי', path: '/admin/inventory' },
  { icon: Settings, label: 'הגדרות', path: '/admin/settings' },
];

/**
 * Admin sidebar with navigation, plan widget, and logout button.
 * RTL layout with sidebar on the right side.
 */
export function AdminSidebar({ isOpen, onClose, onLogout }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-slate-800 shadow-xl lg:shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0
      `}
    >
      {/* Logo Header */}
      <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-slate-700/50 shrink-0 justify-between lg:justify-start">
        <div className="flex items-center">
          <Link to="/">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg ml-3 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600"
              style={{ boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)' }}
            >
              C
            </div>
          </Link>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-tight text-white">ClinicALL</span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400">Beauty System</span>
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white"
          aria-label="סגור תפריט"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
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
          );
        })}
      </nav>

      {/* Subscription Widget & Logout */}
      <div className="p-4 pb-6 mt-auto border-t border-slate-700/50 bg-slate-900/30 relative z-20">
        {/* Plan Widget - Clickable Link to Settings */}
        <Link to="/admin/settings?tab=billing">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 text-white mb-4 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-0.5 ring-1 ring-slate-600/50">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-teal-500/20 rounded-full blur-xl group-hover:bg-teal-500/30 transition-colors" />

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
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-slate-400 relative z-10">65% ניצולת חבילה החודש</p>
          </div>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-xl py-3 min-h-[48px] select-none group transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut size={20} className="transition-transform duration-200 group-hover:rotate-[-12deg] group-hover:scale-110" /> התנתק
        </Button>
      </div>
    </aside>
  );
}
