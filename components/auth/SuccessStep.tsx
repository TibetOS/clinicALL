import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui';
import type { SignupFormData } from './types';

const PRACTITIONER_LABELS: Record<string, string> = {
  doctor: 'רופא/ה',
  nurse: 'אח/ות',
  aesthetician: 'אסתטיקאי/ת',
  cosmetician: 'קוסמטיקאי/ת',
  other: 'אחר',
};

type SuccessStepProps = {
  formData: SignupFormData;
  error: string | null;
  loading: boolean;
  onSubmit: () => void;
};

export const SuccessStep = ({ formData, error, loading, onSubmit }: SuccessStepProps) => {
  return (
    <div className="text-center py-8 animate-in fade-in zoom-in-95">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <Check size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">האתר שלך מוכן!</h2>
      <p className="text-gray-500 mb-8">
        הגדרנו עבורך את הכל. כעת נעביר אותך למערכת הניהול כדי להוסיף שירותים וצוות.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center max-w-sm mx-auto">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-xl text-right max-w-sm mx-auto mb-8 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-gray-500">כתובת האתר:</span>
          <span className="font-mono font-bold text-primary">
            clinicall.com/c/{formData.slug || 'my-clinic'}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-500">עיר:</span>
          <span className="font-bold">{formData.city || '-'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-500">סוג מטפל/ת:</span>
          <span className="font-bold">
            {PRACTITIONER_LABELS[formData.practitionerType] || '-'}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-500">חבילה:</span>
          <span className="font-bold">ניסיון חינם (Pro)</span>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className="px-12 h-12 text-lg shadow-xl shadow-primary/20 w-full md:w-auto"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> יוצר חשבון...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            כניסה למערכת הניהול <ArrowLeft size={20} />
          </span>
        )}
      </Button>
    </div>
  );
};
