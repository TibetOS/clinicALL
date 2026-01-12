import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarView } from '../types';

export type UseCalendarNavReturn = {
  currentDate: Date;
  debouncedDate: Date;
  view: CalendarView;
  weekDays: Date[];
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  navigate: (direction: 'prev' | 'next') => void;
};

export function useCalendarNav(): UseCalendarNavReturn {
  // Default to day view on mobile
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  );

  // Auto-switch to day view on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && view === 'week') {
        setView('day');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Debounce date changes to avoid excessive fetches when navigating quickly
  const [debouncedDate, setDebouncedDate] = useState(currentDate);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDate(currentDate), 150);
    return () => clearTimeout(timer);
  }, [currentDate]);

  // Memoized week days calculation
  const weekDays = useMemo(() => {
    const start = new Date(debouncedDate);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [debouncedDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    const d = new Date(currentDate);
    const multiplier = direction === 'next' ? 1 : -1;

    if (view === 'day') {
      d.setDate(d.getDate() + multiplier);
    } else if (view === 'week') {
      d.setDate(d.getDate() + (7 * multiplier));
    } else {
      d.setMonth(d.getMonth() + multiplier);
    }
    setCurrentDate(d);
  }, [currentDate, view]);

  return {
    currentDate,
    debouncedDate,
    view,
    weekDays,
    setCurrentDate,
    setView,
    goToToday,
    goToDate,
    navigate,
  };
}
