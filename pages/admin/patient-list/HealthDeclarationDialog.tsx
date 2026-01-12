import React from 'react';
import { Check, Copy, Phone, Mail } from 'lucide-react';
import { Button, Input, Label, Dialog } from '../../../components/ui';
import { HealthDeclarationToken } from '../../../types';
import { HealthDeclarationFormData } from './patient-list-helpers';

export type HealthDeclarationDialogProps = {
  open: boolean;
  onClose: () => void;
  formData: HealthDeclarationFormData;
  onFormChange: (data: HealthDeclarationFormData) => void;
  generatedToken: HealthDeclarationToken | null;
  linkCopied: boolean;
  creatingToken: boolean;
  onGenerateToken: () => void;
  onCopyLink: () => void;
  onSendWhatsApp: () => void;
  onSendEmail: () => void;
  onCreateAnother: () => void;
  generateShareLink: (token: string) => string;
};

export function HealthDeclarationDialog({
  open,
  onClose,
  formData,
  onFormChange,
  generatedToken,
  linkCopied,
  creatingToken,
  onGenerateToken,
  onCopyLink,
  onSendWhatsApp,
  onSendEmail,
  onCreateAnother,
  generateShareLink,
}: HealthDeclarationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="שליחת הצהרת בריאות"
    >
      <div className="space-y-4">
        {!generatedToken ? (
          <>
            {/* Form to collect patient info */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p>צור קישור ייחודי להצהרת בריאות ושלח אותו ללקוח באמצעות WhatsApp או אימייל.</p>
            </div>

            <div>
              <Label htmlFor="health-patient-name">שם מלא *</Label>
              <Input
                id="health-patient-name"
                placeholder="שם הלקוח"
                value={formData.patientName}
                onChange={(e) => onFormChange({ ...formData, patientName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="health-patient-phone">טלפון נייד *</Label>
              <Input
                id="health-patient-phone"
                type="tel"
                placeholder="050-0000000"
                className="direction-ltr"
                value={formData.patientPhone}
                onChange={(e) => onFormChange({ ...formData, patientPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="health-patient-email">אימייל (אופציונלי)</Label>
              <Input
                id="health-patient-email"
                type="email"
                placeholder="email@example.com"
                className="direction-ltr"
                value={formData.patientEmail}
                onChange={(e) => onFormChange({ ...formData, patientEmail: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="ghost" onClick={onClose}>
                ביטול
              </Button>
              <Button
                onClick={onGenerateToken}
                disabled={creatingToken || !formData.patientName || !formData.patientPhone}
              >
                {creatingToken ? 'יוצר קישור...' : 'צור קישור'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Token generated - show sharing options */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 mb-1">הקישור נוצר בהצלחה!</h3>
              <p className="text-sm text-green-700">תוקף הקישור: 7 ימים</p>
            </div>

            <div className="space-y-2">
              <Label>קישור להצהרת בריאות</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generateShareLink(generatedToken.token)}
                  className="bg-gray-50 text-sm font-mono direction-ltr"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCopyLink}
                  className="shrink-0"
                >
                  {linkCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <Label className="mb-3 block">שלח ללקוח</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={onSendWhatsApp}
                >
                  <Phone size={18} className="text-green-600" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={onSendEmail}
                  disabled={!formData.patientEmail}
                >
                  <Mail size={18} className="text-blue-600" />
                  <span>אימייל</span>
                </Button>
              </div>
              {!formData.patientEmail && (
                <p className="text-xs text-gray-500 mt-2 text-center">לא הוזן אימייל - לא ניתן לשלוח במייל</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="ghost" onClick={onCreateAnother}>
                צור קישור נוסף
              </Button>
              <Button onClick={onClose}>
                סיום
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
