import { Plus, CalendarDays } from 'lucide-react';
import { Card, Spinner } from '../../../components/ui';
import { Appointment } from '../../../types';
import { AppointmentCard } from './AppointmentCard';

export type CalendarGridProps = {
  weekDays: Date[];
  hours: number[];
  loading: boolean;
  appointments: Appointment[];
  appointmentCountByDay: Map<string, number>;
  getAppointmentsForSlot: (day: Date, hour: number) => Appointment[];
  onSlotClick: (day: Date, hour: number) => void;
  onCancelRequest: (appointment: Appointment) => void;
};

export function CalendarGrid({
  weekDays,
  hours,
  loading,
  appointments,
  appointmentCountByDay,
  getAppointmentsForSlot,
  onSlotClick,
  onCancelRequest,
}: CalendarGridProps) {
  return (
    <Card id="calendar-grid" role="grid" aria-label="לוח תורים" className="flex-1 overflow-hidden flex flex-col border-stone-200">
      {/* Header Row */}
      <div className="flex border-b border-gray-100">
        <div className="w-14 border-l border-gray-100 shrink-0 bg-gray-50"></div>
        {weekDays.map((day, i) => {
          const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const count = appointmentCountByDay.get(dayKey) || 0;
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={i} className={`flex-1 text-center py-3 border-l border-gray-100 ${isToday ? 'bg-primary/5' : ''}`}>
              <div className="text-xs text-gray-500 mb-1">{day.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
              <div className="flex items-center justify-center gap-1.5">
                <div className={`text-lg font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-primary text-white shadow-md' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
                {count > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium" title={`${count} תורים`}>
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="h-8 w-8 text-primary" />
              <span className="text-gray-600 text-sm">טוען תורים...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && appointments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-30 pointer-events-none">
            <div className="text-center p-8">
              <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">אין תורים מתוכננים</h3>
              <p className="text-gray-400 text-sm mb-4">לחץ על משבצת כדי להוסיף תור חדש</p>
            </div>
          </div>
        )}

        {hours.map(hour => (
          <div key={hour} className="flex min-h-[80px]" role="row">
            <div className="w-14 border-l border-b border-gray-100 bg-gray-50 text-xs text-gray-500 text-center pt-2 relative" role="rowheader">
              <span className="-top-3 relative">{hour}:00</span>
            </div>
            {weekDays.map((day, i) => {
              const cellAppts = getAppointmentsForSlot(day, hour);
              return (
                <div
                  key={i}
                  role="gridcell"
                  aria-label={`${day.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} ${hour}:00${cellAppts.length > 0 ? `, ${cellAppts.length} תורים` : ''}`}
                  className="flex-1 border-l border-b border-gray-100 relative group transition-colors hover:bg-gray-50"
                >
                  {/* Add Button on Hover */}
                  <button
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
                    onClick={() => onSlotClick(day, hour)}
                    aria-label={`הוסף תור ב${day.toLocaleDateString('he-IL', { weekday: 'long' })} ${hour}:00`}
                  >
                    <Plus className="text-primary bg-white rounded-full shadow-sm p-1 w-6 h-6 border border-gray-100" />
                  </button>

                  {/* Appointments */}
                  {cellAppts.map(appt => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onCancelRequest={onCancelRequest}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}

        {/* Current Time Indicator */}
        <div
          className="absolute left-14 right-0 border-t-2 border-red-400 z-30 pointer-events-none flex items-center"
          style={{ top: `${((new Date().getHours() - 8) * 80) + ((new Date().getMinutes() / 60) * 80)}px` }}
        >
          <div className="w-2 h-2 bg-red-400 rounded-full -ml-1"></div>
        </div>
      </div>
    </Card>
  );
}
