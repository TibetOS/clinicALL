import { MessageCircle, Mail } from 'lucide-react';
import { Button, Dialog } from '../../ui';
import { Notification } from '../../../types';

type DeclarationShareDialogProps = {
  open: boolean;
  notification: Notification | null;
  generatedLink: string | null;
  onClose: () => void;
  onShareWhatsApp: () => void;
  onShareEmail: () => void;
};

/**
 * Health declaration share dialog.
 * Displays patient info, appointment details, and share options.
 */
export function DeclarationShareDialog({
  open,
  notification,
  generatedLink,
  onClose,
  onShareWhatsApp,
  onShareEmail,
}: DeclarationShareDialogProps) {
  const metadata = notification?.metadata;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="שליחת הצהרת בריאות"
    >
      <div className="space-y-4">
        {metadata && (
          <>
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-sm text-gray-900">פרטי המטופל</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">שם:</span>
                  <span className="font-medium mr-2">{metadata.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-500">טלפון:</span>
                  <span className="font-medium mr-2">{metadata.patientPhone}</span>
                </div>
                {metadata.patientEmail && (
                  <div className="col-span-2">
                    <span className="text-gray-500">אימייל:</span>
                    <span className="font-medium mr-2">{metadata.patientEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-sm text-gray-900">פרטי התור</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">תאריך:</span>
                  <span className="font-medium mr-2">{metadata.appointmentDate}</span>
                </div>
                <div>
                  <span className="text-gray-500">שעה:</span>
                  <span className="font-medium mr-2">{metadata.appointmentTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">טיפול:</span>
                  <span className="font-medium mr-2">{metadata.serviceName}</span>
                </div>
              </div>
            </div>

            {/* Generated Link */}
            {generatedLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-sm text-green-800 mb-2">קישור נוצר בהצלחה</h4>
                <div className="bg-white p-2 rounded border text-xs break-all text-gray-600">
                  {generatedLink}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <h4 className="font-bold text-sm text-gray-900">שליחת הקישור</h4>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={onShareWhatsApp}
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </Button>
                {metadata.patientEmail && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={onShareEmail}
                  >
                    <Mail size={18} />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            סגור
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
