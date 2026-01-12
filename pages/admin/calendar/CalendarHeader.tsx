import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import { DatePicker } from '../../../components/ui/date-picker';
import { CalendarView } from './types';

export type { CalendarView };

export type CalendarHeaderProps = {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onNewAppointment: () => void;
};

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onNewAppointment,
}: CalendarHeaderProps) {
  // Navigate by 1 day in day/team view, 7 days in week view, 1 month in month view
  const navigate = (direction: 'prev' | 'next') => {
    const d = new Date(currentDate);
    const multiplier = direction === 'next' ? 1 : -1;

    if (view === 'day' || view === 'team') {
      d.setDate(d.getDate() + multiplier);
    } else if (view === 'week') {
      d.setDate(d.getDate() + (7 * multiplier));
    } else {
      d.setMonth(d.getMonth() + multiplier);
    }
    onDateChange(d);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
    }
  };

  // Get appropriate aria-label for navigation direction
  const getNavLabel = (direction: 'prev' | 'next') => {
    const labels = {
      day: direction === 'prev' ? 'יום קודם' : 'יום הבא',
      week: direction === 'prev' ? 'שבוע קודם' : 'שבוע הבא',
      month: direction === 'prev' ? 'חודש קודם' : 'חודש הבא',
      team: direction === 'prev' ? 'יום קודם' : 'יום הבא',
    };
    return labels[view];
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div
        className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200"
        role="group"
        aria-label="ניווט בלוח שנה"
      >
        {/* Today Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-primary font-medium"
          aria-label="חזור להיום"
        >
          היום
        </Button>

        <div className="w-px h-6 bg-gray-200" />

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={getNavLabel('prev')}
          onClick={() => navigate('prev')}
        >
          <ChevronRight />
        </Button>
        <span className="font-bold text-lg min-w-[150px] text-center" aria-live="polite">
          {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={getNavLabel('next')}
          onClick={() => navigate('next')}
        >
          <ChevronLeft />
        </Button>

        <div className="w-px h-6 bg-gray-200" />

        {/* Date Picker */}
        <DatePicker
          date={currentDate}
          onDateChange={handleDatePickerChange}
          placeholder="בחר תאריך"
          className="w-auto border-0 shadow-none hover:bg-gray-100"
        />
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
          <button
            role="tab"
            aria-selected={view === 'month'}
            aria-controls="calendar-grid"
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              view === 'month' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => onViewChange('month')}
          >
            חודש
          </button>
          <button
            role="tab"
            aria-selected={view === 'team'}
            aria-controls="calendar-grid"
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              view === 'team' ? 'bg-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => onViewChange('team')}
          >
            צוות
          </button>
        </div>
        <Button onClick={onNewAppointment} className="shadow-sm gap-2" aria-label="קביעת תור חדש">
          תור חדש <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
