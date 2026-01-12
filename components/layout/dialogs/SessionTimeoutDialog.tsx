import { Timer } from 'lucide-react';
import { Button, Dialog } from '../../ui';
import { formatRemainingTime } from '../../../hooks';

type SessionTimeoutDialogProps = {
  open: boolean;
  remainingSeconds: number;
  onDismiss: () => void;
};

/**
 * Session timeout warning dialog for HIPAA compliance.
 * Shows countdown timer and allows user to continue working.
 */
export function SessionTimeoutDialog({ open, remainingSeconds, onDismiss }: SessionTimeoutDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      title="אזהרת סיום סשן"
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Timer size={32} className="text-orange-600" />
          </div>
          <p className="text-gray-600 text-center">
            הסשן שלך עומד להסתיים עקב חוסר פעילות.
          </p>
          <div className="text-3xl font-bold text-orange-600 font-mono">
            {formatRemainingTime(remainingSeconds)}
          </div>
          <p className="text-sm text-gray-500 text-center">
            לחץ להמשיך עבודה כדי להישאר מחובר
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onDismiss} className="gap-2">
            המשך עבודה
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
