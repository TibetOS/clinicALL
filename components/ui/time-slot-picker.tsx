/**
 * Time Slot Picker Block (calendar-32 style)
 * A compact time slot selection component for booking appointments
 */
import * as React from 'react';
import { format, isSameDay, isToday, addDays, isBefore, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../ui';
import { Button } from '../ui';
import { ScrollArea } from './scroll-area';

interface TimeSlot {
  time: string; // "09:00", "09:30", etc.
  available: boolean;
}

interface TimeSlotPickerProps {
  selectedDate?: Date;
  selectedTime?: string;
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  availableSlots?: Record<string, TimeSlot[]>; // key: date ISO string
  disablePastDates?: boolean;
  daysToShow?: number;
  className?: string;
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '12:00', available: true },
  { time: '12:30', available: false },
  { time: '13:00', available: false },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
  { time: '17:00', available: true },
  { time: '17:30', available: true },
  { time: '18:00', available: true },
];

function TimeSlotPicker({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableSlots,
  disablePastDates = true,
  daysToShow = 7,
  className,
}: TimeSlotPickerProps) {
  const [startDate, setStartDate] = React.useState(() => startOfDay(new Date()));
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<Date | undefined>(
    selectedDate
  );

  const currentSelectedDate = selectedDate ?? internalSelectedDate;

  const visibleDays = React.useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));
  }, [startDate, daysToShow]);

  const handleDateSelect = (date: Date) => {
    setInternalSelectedDate(date);
    onDateSelect?.(date);
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    if (availableSlots) {
      const key = format(date, 'yyyy-MM-dd');
      return availableSlots[key] || DEFAULT_SLOTS;
    }
    return DEFAULT_SLOTS;
  };

  const currentSlots = currentSelectedDate
    ? getSlotsForDate(currentSelectedDate)
    : [];

  return (
    <div className={cn('flex flex-col bg-background rounded-lg border', className)}>
      {/* Date selector */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStartDate((d) => addDays(d, -daysToShow))}
            disabled={disablePastDates && isBefore(addDays(startDate, -1), startOfDay(new Date()))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(startDate, 'MMMM yyyy', { locale: he })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStartDate((d) => addDays(d, daysToShow))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {visibleDays.map((day) => {
            const isPast = disablePastDates && isBefore(day, startOfDay(new Date()));
            const isSelected = currentSelectedDate && isSameDay(day, currentSelectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isPast && handleDateSelect(day)}
                disabled={isPast}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg transition-colors',
                  isPast && 'opacity-40 cursor-not-allowed',
                  !isPast && 'hover:bg-accent cursor-pointer',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  isToday(day) && !isSelected && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                <span className="text-xs">{format(day, 'EEE', { locale: he })}</span>
                <span className="text-lg font-semibold">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {currentSelectedDate && (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">
            שעות פנויות ב{format(currentSelectedDate, 'EEEE, d בMMMM', { locale: he })}
          </h3>
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-4 gap-2">
              {currentSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && onTimeSelect?.(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      'relative px-3 py-2 text-sm rounded-md border transition-colors',
                      !slot.available && 'bg-muted text-muted-foreground cursor-not-allowed line-through',
                      slot.available && !isSelected && 'hover:bg-accent hover:border-accent-foreground cursor-pointer',
                      isSelected && 'bg-primary text-primary-foreground border-primary'
                    )}
                  >
                    {slot.time}
                    {isSelected && (
                      <Check className="absolute top-1 left-1 h-3 w-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Selection summary */}
      {currentSelectedDate && selectedTime && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">נבחר:</p>
              <p className="font-medium">
                {format(currentSelectedDate, 'EEEE, d בMMMM yyyy', { locale: he })} בשעה {selectedTime}
              </p>
            </div>
            <Button>אישור</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { TimeSlotPicker };
export type { TimeSlotPickerProps, TimeSlot };
