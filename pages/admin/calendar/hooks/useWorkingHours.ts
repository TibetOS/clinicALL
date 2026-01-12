import { useState, useCallback } from 'react';

export type WorkingDay = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isWorkingDay: boolean;
  start: string; // HH:mm format
  end: string;   // HH:mm format
};

export type WorkingHoursConfig = {
  days: WorkingDay[];
  timezone: string;
};

// Default Israeli business hours
const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { dayOfWeek: 0, isWorkingDay: true, start: '09:00', end: '18:00' },  // Sunday
  { dayOfWeek: 1, isWorkingDay: true, start: '09:00', end: '18:00' },  // Monday
  { dayOfWeek: 2, isWorkingDay: true, start: '09:00', end: '18:00' },  // Tuesday
  { dayOfWeek: 3, isWorkingDay: true, start: '09:00', end: '18:00' },  // Wednesday
  { dayOfWeek: 4, isWorkingDay: true, start: '09:00', end: '18:00' },  // Thursday
  { dayOfWeek: 5, isWorkingDay: true, start: '09:00', end: '13:00' },  // Friday (half day)
  { dayOfWeek: 6, isWorkingDay: false, start: '09:00', end: '18:00' }, // Saturday (closed)
];

type UseWorkingHoursOptions = {
  customHours?: WorkingDay[];
};

type UseWorkingHoursReturn = {
  workingHours: WorkingDay[];
  isWorkingHour: (date: Date, hour: number) => boolean;
  isWorkingDay: (date: Date) => boolean;
  getWorkingHoursForDay: (date: Date) => { start: string; end: string } | null;
  getFirstWorkingHour: () => number;
  getLastWorkingHour: () => number;
  setWorkingHours: (hours: WorkingDay[]) => void;
};

export function useWorkingHours(
  options: UseWorkingHoursOptions = {}
): UseWorkingHoursReturn {
  const { customHours } = options;
  const [workingHours, setWorkingHours] = useState<WorkingDay[]>(
    customHours ?? DEFAULT_WORKING_HOURS
  );

  // Check if a specific date is a working day
  const isWorkingDay = useCallback(
    (date: Date): boolean => {
      const dayOfWeek = date.getDay();
      const dayConfig = workingHours.find((d) => d.dayOfWeek === dayOfWeek);
      return dayConfig?.isWorkingDay ?? false;
    },
    [workingHours]
  );

  // Get working hours for a specific date
  const getWorkingHoursForDay = useCallback(
    (date: Date): { start: string; end: string } | null => {
      const dayOfWeek = date.getDay();
      const dayConfig = workingHours.find((d) => d.dayOfWeek === dayOfWeek);

      if (!dayConfig?.isWorkingDay) return null;

      return {
        start: dayConfig.start,
        end: dayConfig.end,
      };
    },
    [workingHours]
  );

  // Check if a specific hour on a specific date is within working hours
  const isWorkingHour = useCallback(
    (date: Date, hour: number): boolean => {
      const dayHours = getWorkingHoursForDay(date);
      if (!dayHours) return false;

      const startHour = parseInt(dayHours.start.split(':')[0] ?? '9', 10);
      const endHour = parseInt(dayHours.end.split(':')[0] ?? '18', 10);

      return hour >= startHour && hour < endHour;
    },
    [getWorkingHoursForDay]
  );

  // Get the earliest working hour across all days
  const getFirstWorkingHour = useCallback((): number => {
    const workingDays = workingHours.filter((d) => d.isWorkingDay);
    if (workingDays.length === 0) return 9; // default

    const hours = workingDays.map((d) =>
      parseInt(d.start.split(':')[0] ?? '9', 10)
    );
    return Math.min(...hours);
  }, [workingHours]);

  // Get the latest working hour across all days
  const getLastWorkingHour = useCallback((): number => {
    const workingDays = workingHours.filter((d) => d.isWorkingDay);
    if (workingDays.length === 0) return 18; // default

    const hours = workingDays.map((d) =>
      parseInt(d.end.split(':')[0] ?? '18', 10)
    );
    return Math.max(...hours);
  }, [workingHours]);

  return {
    workingHours,
    isWorkingHour,
    isWorkingDay,
    getWorkingHoursForDay,
    getFirstWorkingHour,
    getLastWorkingHour,
    setWorkingHours,
  };
}

// Helper: Get Hebrew day name
export function getHebrewDayName(dayOfWeek: number): string {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[dayOfWeek] ?? '';
}

// Helper: Format time range for display
export function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`;
}
