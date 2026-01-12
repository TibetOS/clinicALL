import { X as XIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Appointment } from '../../../types';

export type CancelAppointmentDialogProps = {
  appointment: Appointment | null;
  canceling: boolean;
  onCancel: () => void;
  onClose: () => void;
};

export function CancelAppointmentDialog({
  appointment,
  canceling,
  onCancel,
  onClose,
}: CancelAppointmentDialogProps) {
  return (
    <AlertDialog open={!!appointment} onOpenChange={(open) => !canceling && !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">ביטול תור</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            האם לבטל את התור של {appointment?.patientName} ב{appointment?.date ? new Date(appointment.date).toLocaleDateString('he-IL') : ''} בשעה {appointment?.time}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-center">
          <AlertDialogCancel disabled={canceling}>חזור</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            disabled={canceling}
            onClick={onCancel}
          >
            {canceling ? 'מבטל...' : 'בטל תור'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
