import { useState, useCallback } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Appointment } from '../../../../types';
import { DragPayload, TimeSlotConflict } from '../types';

export type UseDragDropProps = {
  appointments: Appointment[];
  checkConflict: (date: string, time: string, duration: number, excludeId?: string) => TimeSlotConflict | null;
  onReschedule: (appointmentId: string, newDate: string, newTime: string) => Promise<boolean>;
};

export type UseDragDropReturn = {
  activeId: string | null;
  activeDragPayload: DragPayload | null;
  overId: string | null;
  conflict: TimeSlotConflict | null;
  showConflictDialog: boolean;
  pendingMove: { appointmentId: string; newDate: string; newTime: string } | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleConflictConfirm: () => Promise<void>;
  handleConflictCancel: () => void;
};

// Parse slot ID format: "slot-YYYY-MM-DD-HH"
function parseSlotId(slotId: string): { date: string; hour: number } | null {
  const match = slotId.match(/^slot-(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;

  const [, year, month, day, hour] = match;
  // Create date string in YYYY-MM-DD format
  const date = `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
  return { date, hour: parseInt(hour ?? '0', 10) };
}

export function useDragDrop({
  appointments,
  checkConflict,
  onReschedule,
}: UseDragDropProps): UseDragDropReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragPayload, setActiveDragPayload] = useState<DragPayload | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<TimeSlotConflict | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    appointmentId: string;
    newDate: string;
    newTime: string;
  } | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const appointmentId = active.id as string;

    // Find the appointment being dragged
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    setActiveId(appointmentId);
    setActiveDragPayload({
      appointmentId,
      sourceDate: new Date(appointment.date),
      sourceTime: appointment.time,
    });
  }, [appointments]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setActiveId(null);
    setActiveDragPayload(null);
    setOverId(null);

    if (!over || !active) return;

    const appointmentId = active.id as string;
    const slotId = over.id as string;

    // Parse the target slot
    const slotInfo = parseSlotId(slotId);
    if (!slotInfo) return;

    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const newTime = `${slotInfo.hour.toString().padStart(2, '0')}:00`;

    // Check if position actually changed
    const isSameSlot =
      appointment.date === slotInfo.date &&
      appointment.time.split(':')[0] === slotInfo.hour.toString();

    if (isSameSlot) return;

    // Check for conflicts
    const conflictResult = checkConflict(
      slotInfo.date,
      newTime,
      appointment.duration,
      appointmentId
    );

    if (conflictResult) {
      // Store pending move and show conflict dialog
      setConflict(conflictResult);
      setPendingMove({
        appointmentId,
        newDate: slotInfo.date,
        newTime,
      });
      setShowConflictDialog(true);
    } else {
      // No conflict, proceed with reschedule
      await onReschedule(appointmentId, slotInfo.date, newTime);
    }
  }, [appointments, checkConflict, onReschedule]);

  const handleConflictConfirm = useCallback(async () => {
    if (!pendingMove) return;

    setShowConflictDialog(false);
    await onReschedule(pendingMove.appointmentId, pendingMove.newDate, pendingMove.newTime);

    setConflict(null);
    setPendingMove(null);
  }, [pendingMove, onReschedule]);

  const handleConflictCancel = useCallback(() => {
    setShowConflictDialog(false);
    setConflict(null);
    setPendingMove(null);
  }, []);

  return {
    activeId,
    activeDragPayload,
    overId,
    conflict,
    showConflictDialog,
    pendingMove,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleConflictConfirm,
    handleConflictCancel,
  };
}
