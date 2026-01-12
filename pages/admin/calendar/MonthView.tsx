import { useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { Appointment } from '../../../types';
import { Badge } from '../../../components/ui';

type MonthViewProps = {
  currentDate: Date;
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
};

// Hebrew day names (short)
const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export function MonthView({
  currentDate,
  appointments,
  onDayClick,
}: MonthViewProps) {
  // Generate calendar grid for the month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Count appointments per day
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    appointments.forEach((apt) => {
      if (apt.status !== 'cancelled') {
        const key = apt.date; // YYYY-MM-DD format
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return counts;
  }, [appointments]);

  // Get count for a specific day
  const getCount = (date: Date): number => {
    const key = date.toISOString().split('T')[0];
    return appointmentCounts[key ?? ''] || 0;
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is Saturday (Shabbat)
  const isShabbat = (date: Date): boolean => {
    return date.getDay() === 6;
  };

  // Format date for display
  const formatDayNumber = (date: Date): string => {
    return date.getDate().toString();
  };

  // Get badge variant based on count
  const getBadgeVariant = (count: number): 'default' | 'secondary' | 'destructive' => {
    if (count >= 10) return 'destructive'; // Busy
    if (count >= 5) return 'default'; // Moderate
    return 'secondary'; // Light
  };

  return (
    <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-white z-10">
        {HEBREW_DAYS.map((day, i) => (
          <div
            key={i}
            className={cn(
              'py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-100 first:border-l-0',
              i === 6 && 'text-gray-400' // Shabbat
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          const count = getCount(date);
          const inMonth = isCurrentMonth(date);
          const today = isToday(date);
          const shabbat = isShabbat(date);

          return (
            <button
              key={i}
              onClick={() => onDayClick(date)}
              className={cn(
                'min-h-[80px] p-2 border-b border-l border-gray-100 first:border-l-0',
                'flex flex-col items-start gap-1',
                'hover:bg-teal-50 transition-colors cursor-pointer text-right',
                !inMonth && 'bg-gray-50 text-gray-400',
                shabbat && 'bg-gray-50/50',
                today && 'ring-2 ring-inset ring-teal-500'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  today && 'bg-teal-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                )}
              >
                {formatDayNumber(date)}
              </span>

              {count > 0 && inMonth && (
                <Badge
                  variant={getBadgeVariant(count)}
                  className="text-xs mt-auto"
                >
                  {count} {count === 1 ? 'תור' : 'תורים'}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
