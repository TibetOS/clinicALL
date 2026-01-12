import {
  Calendar as CalendarIcon, FileText, CheckCircle, Heart, Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

export type DailyStatsProps = {
  todaysAppointments: number;
  completedToday: number;
  todaysRevenue: number;
  pendingDeclarations: number;
};

export function DailyStats({
  todaysAppointments,
  completedToday,
  todaysRevenue,
  pendingDeclarations,
}: DailyStatsProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-1">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors duration-200" />
                <span className="text-xs font-medium text-slate-500">תורים היום</span>
                <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-slate-800 counter-animate">{todaysAppointments}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>כל התורים שנקבעו להיום</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-slate-400 group-hover:text-green-500 transition-colors duration-200" />
                <span className="text-xs font-medium text-slate-500">הושלמו</span>
                <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-slate-800 counter-animate">{completedToday}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>תורים שהושלמו היום</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={16} className="text-teal-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs font-medium text-slate-500">הכנסות היום</span>
                <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-slate-800 counter-animate">₪{todaysRevenue.toLocaleString()}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>סך כל התשלומים ששולמו היום</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group card-animate stagger-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors duration-200" />
                <span className="text-xs font-medium text-slate-500">הצהרות ממתינות</span>
                <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-slate-800 counter-animate">{pendingDeclarations}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>לקוחות שטרם חתמו על הצהרת בריאות</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
