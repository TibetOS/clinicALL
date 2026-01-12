import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui';

export type CalendarHeaderProps = {
  currentDate: Date;
  view: 'week' | 'day';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'week' | 'day') => void;
  onNewAppointment: () => void;
};

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onNewAppointment,
}: CalendarHeaderProps) {
  const navigateWeek = (direction: 'prev' | 'next') => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(d);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div
        className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200"
        role="group"
        aria-label="ניווט בלוח שנה"
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label="שבוע קודם"
          onClick={() => navigateWeek('prev')}
        >
          <ChevronRight />
        </Button>
        <span className="font-bold text-lg min-w-[150px] text-center" aria-live="polite">
          {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="שבוע הבא"
          onClick={() => navigateWeek('next')}
        >
          <ChevronLeft />
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="bg-gray-100 p-1 rounded-lg flex text-sm" role="tablist" aria-label="תצוגת לוח שנה">
          <button
            role="tab"
            aria-selected={view === 'day'}
            aria-controls="calendar-grid"
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              view === 'day' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => onViewChange('day')}
          >
            יום
          </button>
          <button
            role="tab"
            aria-selected={view === 'week'}
            aria-controls="calendar-grid"
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              view === 'week' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => onViewChange('week')}
          >
            שבוע
          </button>
        </div>
        <Button onClick={onNewAppointment} className="shadow-sm gap-2" aria-label="קביעת תור חדש">
          תור חדש <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
