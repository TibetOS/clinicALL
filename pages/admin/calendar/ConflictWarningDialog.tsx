import { AlertTriangle, Clock, User, Calendar } from 'lucide-react';
import { Dialog, Button } from '../../../components/ui';
import { TimeSlotConflict } from './types';

export type ConflictWarningDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflict: TimeSlotConflict | null;
  newTime: string;
  newDate: string;
};

export function ConflictWarningDialog({
  open,
  onClose,
  onConfirm,
  conflict,
  newTime,
  newDate,
}: ConflictWarningDialogProps) {
  if (!conflict) return null;

  const { existingAppointment, overlapMinutes } = conflict;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="אזהרת חפיפה בזמנים"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">קיימת חפיפה בזמנים</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm mb-3">
            התור שאתה מנסה לקבוע חופף לתור קיים ב-
            <strong>{overlapMinutes}</strong> דקות.
          </p>

          <div className="bg-white rounded-md p-3 border border-amber-100">
            <h4 className="font-medium text-gray-900 mb-2">התור הקיים:</h4>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{existingAppointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(existingAppointment.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {existingAppointment.time} ({existingAppointment.duration} דקות)
                </span>
              </div>
              <div className="text-gray-500 mt-1">
                {existingAppointment.serviceName}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">הזמן החדש המבוקש:</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(newDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{newTime}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          האם אתה בטוח שברצונך להמשיך? זה עלול לגרום לחפיפה בין התורים.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            בחר שעה אחרת
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
          >
            המשך בכל זאת
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
