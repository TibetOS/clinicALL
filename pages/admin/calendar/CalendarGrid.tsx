import { Plus, CalendarDays } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { Card, Spinner } from '../../../components/ui';
import { Appointment } from '../../../types';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { DraggableAppointmentCard } from './DraggableAppointmentCard';

export type CalendarGridProps = {
  weekDays: Date[];
  hours: number[];
  loading: boolean;
  appointments: Appointment[];
  appointmentCountByDay: Map<string, number>;
  getAppointmentsForSlot: (day: Date, hour: number) => Appointment[];
  onSlotClick: (day: Date, hour: number) => void;
  onCancelRequest: (appointment: Appointment) => void;
  onEditRequest: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
  // Drag-and-drop handlers
  activeId: string | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
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
  onEditRequest,
  onViewDetails,
  activeId,
  onDragStart,
  onDragOver,
  onDragEnd,
}: CalendarGridProps) {
  // Find the active appointment for drag overlay
  const activeAppointment = activeId
    ? appointments.find(a => a.id === activeId)
    : null;
  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <Card id="calendar-grid" role="grid" aria-label="לוח תורים" className="flex-1 overflow-hidden flex flex-col border-stone-200">
        {/* Header Row */}
        <div className="flex border-b border-gray-100">
          <div className="w-14 border-l border-gray-100 shrink-0 bg-gray-50"></div>
          {weekDays.map((day, i) => {
            const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const count = appointmentCountByDay.get(dayKey) || 0;
            const isToday = day.toDateString() === new Date().toDateString();
            const isSingleDay = weekDays.length === 1;
            return (
              <div key={i} className={`flex-1 text-center py-3 border-l border-gray-100 ${isToday ? 'bg-primary/5' : ''}`}>
                {isSingleDay ? (
                  // Day view: show full date with weekday
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      {day.toLocaleDateString('he-IL', { weekday: 'long' })}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`text-2xl font-bold inline-flex items-center justify-center w-10 h-10 rounded-full ${isToday ? 'bg-primary text-white shadow-md' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {day.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                      </div>
                      {count > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium" title={`${count} תורים`}>
                          {count} תורים
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  // Week view: compact header
                  <>
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
                  </>
                )}
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
                <p className="text-gray-400 text-sm mb-4">לחץ על משבצת או גרור תור כדי לתזמן</p>
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
                  <DroppableTimeSlot
                    key={`${day.toISOString()}-${hour}-${i}`}
                    day={day}
                    hour={hour}
                    appointments={cellAppts}
                    onSlotClick={onSlotClick}
                    onCancelRequest={onCancelRequest}
                    onEditRequest={onEditRequest}
                    onViewDetails={onViewDetails}
                  />
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

        {/* Mobile FAB - Always visible on mobile */}
        <button
          className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 active:scale-95 transition-all"
          onClick={() => onSlotClick(new Date(), new Date().getHours())}
          aria-label="הוסף תור חדש"
        >
          <Plus className="w-6 h-6" />
        </button>
      </Card>

      {/* Drag Overlay - Shows dragged item while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeAppointment && (
          <div className="p-2 rounded-lg text-xs shadow-lg border-l-4 bg-white border-primary text-gray-800 opacity-90 w-40">
            <div className="font-bold truncate">{activeAppointment.patientName}</div>
            <div className="truncate opacity-80">{activeAppointment.serviceName}</div>
            <div className="text-gray-500 mt-1">{activeAppointment.time} - {activeAppointment.duration} דק׳</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
