import { CheckCircle2 } from 'lucide-react';
import { Button, Badge, Dialog } from '../../../components/ui';
import { Declaration } from '../../../types';

interface DeclarationViewDialogProps {
  declaration: Declaration | null;
  onClose: () => void;
}

export const DeclarationViewDialog = ({
  declaration,
  onClose,
}: DeclarationViewDialogProps) => {
  if (!declaration) return null;

  return (
    <Dialog open={!!declaration} onClose={onClose} title="הצהרת בריאות - צפייה">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-gray-500 text-xs">שם המטופל</span>
            <span className="font-bold">{declaration.patientName}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">תאריך הגשה</span>
            <span className="font-bold">
              {new Date(declaration.submittedAt).toLocaleDateString('he-IL')}
            </span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">טלפון</span>
            <span className="font-bold">{declaration.formData.personalInfo.phone}</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold border-b pb-2 mb-3 text-gray-800">היסטוריה רפואית</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-dashed pb-2">
              <span className="text-gray-600">רגישויות ומחלות רקע</span>
              <div className="flex gap-2">
                {declaration.formData.medicalHistory.conditions.length > 0 ? (
                  declaration.formData.medicalHistory.conditions.map((c) => (
                    <Badge key={c} variant="destructive">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">ללא</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-dashed pb-2">
              <span className="text-gray-600">תרופות קבועות</span>
              <span className="font-medium text-gray-900">
                {declaration.formData.medicalHistory.medications || 'ללא'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" />
            <span className="text-green-800 font-medium">נחתם דיגיטלית</span>
          </div>
          <span className="text-xs text-green-700 font-mono tracking-wider opacity-70">
            SIG-{declaration.id.toUpperCase()}-SECURE
          </span>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>סגור</Button>
        </div>
      </div>
    </Dialog>
  );
};
