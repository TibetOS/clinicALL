import { useNavigate } from 'react-router-dom';
import { Plus, User, MessageCircle } from 'lucide-react';

export type MobileActionMenuProps = {
  isFabOpen: boolean;
  setIsFabOpen: (open: boolean) => void;
  onNewAppointment: () => void;
  onWalkIn: () => void;
};

export function MobileActionMenu({
  isFabOpen,
  setIsFabOpen,
  onNewAppointment,
  onWalkIn,
}: MobileActionMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="md:hidden fixed bottom-6 left-6 z-50">
      {/* FAB Menu */}
      <div
        className={`absolute bottom-16 left-0 space-y-2 transition-all duration-300 ${
          isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          aria-label="תור חדש"
          className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] active:scale-95"
          style={{ transitionDelay: isFabOpen ? '100ms' : '0ms' }}
          onClick={() => { onNewAppointment(); setIsFabOpen(false); }}
        >
          <Plus size={18} className="text-teal-500" />
          תור חדש
        </button>
        <button
          aria-label="קבלת לקוחה"
          className="flex items-center gap-2 bg-white shadow-lg rounded-full py-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] active:scale-95"
          style={{ transitionDelay: isFabOpen ? '50ms' : '0ms' }}
          onClick={() => { onWalkIn(); setIsFabOpen(false); }}
        >
          <User size={18} className="text-blue-500" />
          קבלת לקוחה
        </button>
        <button
          aria-label="שלח תזכורת"
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
        aria-label={isFabOpen ? 'סגור תפריט' : 'פתח תפריט פעולות מהירות'}
        aria-expanded={isFabOpen}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform-gpu active:scale-90 ${
          isFabOpen ? 'bg-slate-800 rotate-45 shadow-xl' : 'bg-teal-500 hover:bg-teal-600 hover:shadow-xl hover:scale-105'
        }`}
        onClick={() => setIsFabOpen(!isFabOpen)}
      >
        <Plus size={24} className="text-white transition-transform duration-300" />
      </button>
    </div>
  );
}
