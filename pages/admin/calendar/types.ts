import { Appointment } from '../../../types';

export type CalendarView = 'day' | 'week' | 'month' | 'team';

export type TimeSlotConflict = {
  existingAppointment: Appointment;
  overlapMinutes: number;
};

export type DragPayload = {
  appointmentId: string;
  sourceDate: Date;
  sourceTime: string;
};

export type WorkingHours = {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  start: string; // "09:00"
  end: string; // "18:00"
  isWorkingDay: boolean;
};

export type RecurrencePattern = {
  type: 'none' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: string;
  count?: number;
};

// Default Israeli working hours
export const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { dayOfWeek: 0, start: '09:00', end: '18:00', isWorkingDay: true }, // Sunday
  { dayOfWeek: 1, start: '09:00', end: '18:00', isWorkingDay: true }, // Monday
  { dayOfWeek: 2, start: '09:00', end: '18:00', isWorkingDay: true }, // Tuesday
  { dayOfWeek: 3, start: '09:00', end: '18:00', isWorkingDay: true }, // Wednesday
  { dayOfWeek: 4, start: '09:00', end: '18:00', isWorkingDay: true }, // Thursday
  { dayOfWeek: 5, start: '09:00', end: '13:00', isWorkingDay: true }, // Friday
  { dayOfWeek: 6, start: '09:00', end: '18:00', isWorkingDay: false }, // Saturday (closed)
];

// Status colors for service-based appointment coloring
export const SERVICE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-800' },
  botox: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-800' },
  filler: { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-800' },
  laser: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-800' },
  consultation: { bg: 'bg-teal-50', border: 'border-teal-500', text: 'text-teal-800' },
  skincare: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-800' },
};

// Appointment status colors (already used in AppointmentCard)
export const STATUS_COLORS = {
  confirmed: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-800' },
  pending: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-800' },
  cancelled: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' },
};
