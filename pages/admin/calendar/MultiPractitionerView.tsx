import { useMemo } from 'react';
import { Clock, User } from 'lucide-react';
import { cn } from '../../../components/ui';
import { Appointment, StaffMember } from '../../../types';
import { DraggableAppointmentCard } from './DraggableAppointmentCard';

type MultiPractitionerViewProps = {
  date: Date;
  appointments: Appointment[];
  staff: StaffMember[];
  loading?: boolean;
  hours: number[];
  onSlotClick?: (day: Date, hour: number, staffId?: string) => void;
  onCancelRequest?: (appointment: Appointment) => void;
  onEditRequest?: (appointment: Appointment) => void;
  onViewDetails?: (appointment: Appointment) => void;
};

// No-op function to satisfy required props when callbacks are undefined
const noopWithArg = (_: Appointment) => {};

// NOTE: This view currently distributes appointments evenly for demo purposes.
// For real staff assignment, add staffId field to the Appointment type and
// filter appointments by staff.id === appointment.staffId

/**
 * MultiPractitionerView displays side-by-side columns for each staff member,
 * showing their appointments for a single day.
 */
export function MultiPractitionerView({
  date,
  appointments,
  staff,
  loading = false,
  hours,
  onSlotClick,
  onCancelRequest,
  onEditRequest,
  onViewDetails,
}: MultiPractitionerViewProps) {
  const dateStr = date.toISOString().split('T')[0] ?? '';

  // Get appointments for this day
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => apt.date === dateStr && apt.status !== 'cancelled');
  }, [appointments, dateStr]);

  // For demo: distribute appointments among staff based on appointment index
  // In production, this would filter by apt.staffId === staff[i].id
  const appointmentsByStaff = useMemo(() => {
    const result: Record<string, Appointment[]> = {};

    staff.forEach(s => {
      result[s.id] = [];
    });

    // Distribute appointments round-robin for demo (no staffId field exists)
    dayAppointments.forEach((apt, i) => {
      const staffIndex = i % staff.length;
      const staffId = staff[staffIndex]?.id;
      if (staffId) {
        result[staffId]?.push(apt);
      }
    });

    return result;
  }, [dayAppointments, staff]);

  // Get appointments for a specific slot
  const getSlotAppointments = (staffId: string, hour: number): Appointment[] => {
    const staffAppts = appointmentsByStaff[staffId] || [];
    return staffAppts.filter(apt => {
      const [h] = apt.time.split(':').map(Number);
      return h === hour;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100">
        <div className="animate-pulse text-gray-400">טוען...</div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8">
        <User className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">אין אנשי צוות להצגה</p>
        <p className="text-sm text-gray-400 mt-2">הוסף אנשי צוות בהגדרות</p>
      </div>
    );
  }

  const formattedDate = date.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Date header */}
      <div className="px-4 py-3 bg-gray-50 border-b text-center">
        <span className="font-medium text-gray-900">{formattedDate}</span>
        <span className="text-sm text-gray-500 mr-2">
          ({dayAppointments.length} תורים)
        </span>
      </div>

      {/* Staff columns header */}
      <div className="flex border-b bg-gray-50">
        {/* Time column spacer */}
        <div className="w-16 flex-shrink-0" />

        {/* Staff headers */}
        {staff.map(member => (
          <div
            key={member.id}
            className="flex-1 min-w-[180px] px-3 py-2 border-r last:border-r-0 flex items-center gap-2"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm truncate">
                {member.name}
              </div>
              <div className="text-xs text-gray-500">{member.role}</div>
            </div>
            <div className="text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
              {appointmentsByStaff[member.id]?.length || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-100 last:border-b-0">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 py-3 px-2 text-xs text-gray-500 font-medium border-l bg-gray-50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>

              {/* Staff columns */}
              {staff.map(member => {
                const slotAppointments = getSlotAppointments(member.id, hour);
                const hasAppointments = slotAppointments.length > 0;

                return (
                  <div
                    key={member.id}
                    className={cn(
                      'flex-1 min-w-[180px] min-h-[60px] border-r last:border-r-0 p-1 relative',
                      !hasAppointments && 'hover:bg-gray-50 cursor-pointer transition-colors'
                    )}
                    onClick={() => {
                      if (!hasAppointments && onSlotClick) {
                        onSlotClick(date, hour, member.id);
                      }
                    }}
                  >
                    {slotAppointments.map(apt => (
                      <DraggableAppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onCancelRequest={onCancelRequest || noopWithArg}
                        onEditRequest={onEditRequest || noopWithArg}
                        onViewDetails={onViewDetails || noopWithArg}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 bg-amber-50 border-t text-xs text-amber-700">
        <span className="font-medium">הערה:</span> התורים מוצגים לדוגמה בלבד.
        להקצאה אמיתית יש להוסיף שדה staffId לתורים.
      </div>
    </div>
  );
}
