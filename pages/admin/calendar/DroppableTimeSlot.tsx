import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Appointment } from '../../../types';
import { DraggableAppointmentCard } from './DraggableAppointmentCard';

export type DroppableTimeSlotProps = {
  day: Date;
  hour: number;
  appointments: Appointment[];
  onSlotClick: (day: Date, hour: number) => void;
  onCancelRequest: (appointment: Appointment) => void;
  onEditRequest: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
};

// Generate slot ID in format: slot-YYYY-MM-DD-HH
function generateSlotId(day: Date, hour: number): string {
  const year = day.getFullYear();
  const month = day.getMonth() + 1;
  const date = day.getDate();
  return `slot-${year}-${month}-${date}-${hour}`;
}

export function DroppableTimeSlot({
  day,
  hour,
  appointments,
  onSlotClick,
  onCancelRequest,
  onEditRequest,
  onViewDetails,
}: DroppableTimeSlotProps) {
  const slotId = generateSlotId(day, hour);

  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: {
      day,
      hour,
    },
  });

  return (
    <div
      ref={setNodeRef}
      role="gridcell"
      aria-label={`${day.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} ${hour}:00${appointments.length > 0 ? `, ${appointments.length} תורים` : ''}`}
      className={`flex-1 border-l border-b border-gray-100 relative group transition-colors min-h-[80px] ${
        isOver ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'hover:bg-gray-50'
      }`}
    >
      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md font-medium">
            שחרר כאן
          </div>
        </div>
      )}

      {/* Add Button on Hover */}
      <button
        className={`absolute inset-0 w-full h-full flex items-center justify-center z-10 ${
          isOver ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={() => onSlotClick(day, hour)}
        aria-label={`הוסף תור ב${day.toLocaleDateString('he-IL', { weekday: 'long' })} ${hour}:00`}
      >
        <Plus className="text-primary bg-white rounded-full shadow-sm p-1 w-6 h-6 border border-gray-100" />
      </button>

      {/* Appointments */}
      {appointments.map(appt => (
        <DraggableAppointmentCard
          key={appt.id}
          appointment={appt}
          onCancelRequest={onCancelRequest}
          onEditRequest={onEditRequest}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
