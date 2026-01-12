import { useMemo, useCallback } from 'react';
import { Appointment } from '../../../../types';
import { TimeSlotConflict } from '../types';

export type UseTimeSlotsProps = {
  appointments: Appointment[];
};

export type UseTimeSlotsReturn = {
  hours: number[];
  appointmentsBySlot: Map<string, Appointment[]>;
  appointmentCountByDay: Map<string, number>;
  getAppointmentsForSlot: (day: Date, hour: number) => Appointment[];
  checkConflict: (
    date: string,
    time: string,
    duration: number,
    excludeId?: string
  ) => TimeSlotConflict | null;
};

// Working hours: 08:00 - 20:00
const START_HOUR = 8;
const END_HOUR = 20;

export function useTimeSlots({ appointments }: UseTimeSlotsProps): UseTimeSlotsReturn {
  // Generate hours array (08:00 - 20:00)
  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR),
    []
  );

  // Group appointments by slot for O(1) lookup
  const appointmentsBySlot = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach(appt => {
      if (appt.status === 'cancelled') return; // Skip cancelled appointments

      const apptDate = new Date(appt.date);
      const apptHour = parseInt(appt.time.split(':')[0] ?? '0', 10);
      const key = `${apptDate.getFullYear()}-${apptDate.getMonth()}-${apptDate.getDate()}-${apptHour}`;
      const existing = map.get(key) || [];
      existing.push(appt);
      map.set(key, existing);
    });
    return map;
  }, [appointments]);

  // Count appointments per day for week view badges
  const appointmentCountByDay = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach(appt => {
      if (appt.status === 'cancelled') return; // Skip cancelled appointments

      const apptDate = new Date(appt.date);
      const key = `${apptDate.getFullYear()}-${apptDate.getMonth()}-${apptDate.getDate()}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [appointments]);

  const getAppointmentsForSlot = useCallback(
    (day: Date, hour: number): Appointment[] => {
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}-${hour}`;
      return appointmentsBySlot.get(key) || [];
    },
    [appointmentsBySlot]
  );

  // Check for conflicts when scheduling/moving an appointment
  const checkConflict = useCallback(
    (
      date: string,
      time: string,
      duration: number,
      excludeId?: string
    ): TimeSlotConflict | null => {
      const targetDate = new Date(date);
      const timeParts = time.split(':').map(Number);
      const targetHour = timeParts[0] ?? 0;
      const targetMinute = timeParts[1] ?? 0;
      const targetStart = targetHour * 60 + targetMinute;
      const targetEnd = targetStart + duration;

      // Check all appointments on the same day
      for (const appt of appointments) {
        // Skip cancelled or excluded appointments
        if (appt.status === 'cancelled') continue;
        if (excludeId && appt.id === excludeId) continue;

        const apptDate = new Date(appt.date);
        // Skip if different day
        if (
          apptDate.getFullYear() !== targetDate.getFullYear() ||
          apptDate.getMonth() !== targetDate.getMonth() ||
          apptDate.getDate() !== targetDate.getDate()
        ) {
          continue;
        }

        const apptTimeParts = appt.time.split(':').map(Number);
        const apptHour = apptTimeParts[0] ?? 0;
        const apptMinute = apptTimeParts[1] ?? 0;
        const apptStart = apptHour * 60 + apptMinute;
        const apptEnd = apptStart + appt.duration;

        // Check for overlap
        if (targetStart < apptEnd && targetEnd > apptStart) {
          const overlapStart = Math.max(targetStart, apptStart);
          const overlapEnd = Math.min(targetEnd, apptEnd);
          const overlapMinutes = overlapEnd - overlapStart;

          return {
            existingAppointment: appt,
            overlapMinutes,
          };
        }
      }

      return null;
    },
    [appointments]
  );

  return {
    hours,
    appointmentsBySlot,
    appointmentCountByDay,
    getAppointmentsForSlot,
    checkConflict,
  };
}
