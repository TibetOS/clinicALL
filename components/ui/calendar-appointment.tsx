/**
 * Calendar Appointment Block (calendar-31 style)
 * A full calendar view with appointments and time slots
 */
import * as React from 'react';
import { format, isSameDay, isToday, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { cn } from '../ui';
import { Button } from '../ui';
import { ScrollArea } from './scroll-area';

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientName?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  color?: string;
}

interface CalendarAppointmentProps {
  appointments?: Appointment[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  className?: string;
  workingHours?: { start: number; end: number };
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

function CalendarAppointment({
  appointments = [],
  selectedDate = new Date(),
  onDateSelect,
  onAppointmentClick,
  onTimeSlotClick,
  className,
  workingHours = { start: 8, end: 21 },
}: CalendarAppointmentProps) {
  const [currentWeek, setCurrentWeek] = React.useState(() =>
    startOfWeek(selectedDate, { locale: he })
  );

  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  const hours = React.useMemo(() => {
    return Array.from(
      { length: workingHours.end - workingHours.start },
      (_, i) => i + workingHours.start
    );
  }, [workingHours]);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.start, date));
  };

  const getAppointmentStyle = (appointment: Appointment) => {
    const startHour = appointment.start.getHours();
    const startMinute = appointment.start.getMinutes();
    const endHour = appointment.end.getHours();
    const endMinute = appointment.end.getMinutes();

    const top = ((startHour - workingHours.start) * 60 + startMinute) * (60 / 60);
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (60 / 60);

    return { top: `${top}px`, height: `${Math.max(height, 30)}px` };
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 border-blue-300 text-blue-800',
    confirmed: 'bg-green-100 border-green-300 text-green-800',
    completed: 'bg-gray-100 border-gray-300 text-gray-600',
    cancelled: 'bg-red-100 border-red-300 text-red-800 line-through',
  };

  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek((w) => subWeeks(w, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek((w) => addWeeks(w, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(currentWeek, 'MMMM yyyy', { locale: he })}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentWeek(startOfWeek(new Date(), { locale: he }));
            onDateSelect?.(new Date());
          }}
        >
          היום
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        <div className="w-16 border-l" /> {/* Time column spacer */}
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect?.(day)}
            className={cn(
              'p-2 text-center border-l transition-colors hover:bg-accent',
              isSameDay(day, selectedDate) && 'bg-primary/10',
              isToday(day) && 'font-bold'
            )}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, 'EEEE', { locale: he })}
            </div>
            <div
              className={cn(
                'text-lg mt-1',
                isToday(day) &&
                  'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto'
              )}
            >
              {format(day, 'd')}
            </div>
          </button>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-8 relative">
          {/* Time labels */}
          <div className="w-16">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-l text-xs text-muted-foreground pr-2 text-left"
              >
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative border-l">
              {/* Hour slots */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick?.(day, hour)}
                />
              ))}

              {/* Appointments overlay */}
              {getAppointmentsForDay(day).map((appointment) => (
                <button
                  key={appointment.id}
                  className={cn(
                    'absolute inset-x-1 rounded-md border p-1 text-xs overflow-hidden cursor-pointer transition-opacity hover:opacity-80',
                    statusColors[appointment.status || 'scheduled'],
                    appointment.color
                  )}
                  style={getAppointmentStyle(appointment)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick?.(appointment);
                  }}
                >
                  <div className="font-medium truncate">{appointment.title}</div>
                  {appointment.patientName && (
                    <div className="flex items-center gap-1 text-[10px] opacity-80">
                      <User className="h-3 w-3" />
                      {appointment.patientName}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <Clock className="h-3 w-3" />
                    {format(appointment.start, 'HH:mm')} - {format(appointment.end, 'HH:mm')}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export { CalendarAppointment };
export type { CalendarAppointmentProps, Appointment };
