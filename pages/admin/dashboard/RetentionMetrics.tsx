import { useNavigate } from 'react-router-dom';
import { Clock, Phone, Gift, UserCheck } from 'lucide-react';
import { Card } from '../../../components/ui';
import { Patient } from '../../../types';
import { FollowUpItem } from './FollowUpListCard';

export type RetentionMetricsProps = {
  lapsedClients: Patient[];
  dueForFollowUp: FollowUpItem[];
  upcomingBirthdays: Patient[];
  totalPatients: number;
};

export function RetentionMetrics({
  lapsedClients,
  dueForFollowUp,
  upcomingBirthdays,
  totalPatients,
}: RetentionMetricsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 animate-fade-in">שימור לקוחות</h3>

      {/* Lapsed Clients */}
      <Card
        role="button"
        tabIndex={0}
        className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-5 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        onClick={() => navigate('/admin/patients')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/patients')}
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
        role="button"
        tabIndex={0}
        className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-6 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        onClick={() => navigate('/admin/patients')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/patients')}
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
        role="button"
        tabIndex={0}
        className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-7 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        onClick={() => navigate('/admin/patients')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/patients')}
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
        role="button"
        tabIndex={0}
        className="p-5 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-animate stagger-8 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        onClick={() => navigate('/admin/patients')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/patients')}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 group-hover:scale-110 transition-transform duration-200">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">לקוחות פעילות</p>
            <p className="text-2xl font-bold text-slate-800">
              {totalPatients - lapsedClients.length}
            </p>
            <p className="text-xs text-slate-500">ביקרו ב-60 יום</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
