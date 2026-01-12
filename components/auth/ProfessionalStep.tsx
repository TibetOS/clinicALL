import { Award, ChevronLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

const LANGUAGES = [
  { value: 'hebrew', label: 'עברית' },
  { value: 'english', label: 'אנגלית' },
  { value: 'russian', label: 'רוסית' },
  { value: 'arabic', label: 'ערבית' },
  { value: 'french', label: 'צרפתית' },
  { value: 'spanish', label: 'ספרדית' },
];

const SPECIALIZATIONS = [
  { value: 'botox', label: 'בוטוקס' },
  { value: 'fillers', label: 'חומרי מילוי' },
  { value: 'laser', label: 'לייזר' },
  { value: 'skincare', label: 'טיפולי עור' },
  { value: 'threads', label: 'חוטים' },
  { value: 'prp', label: 'PRP' },
  { value: 'mesotherapy', label: 'מזותרפיה' },
  { value: 'body', label: 'עיצוב גוף' },
];

export const ProfessionalStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  const toggleArrayItem = <K extends 'languages' | 'specializations'>(
    field: K,
    value: string
  ) => {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(field, updated);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="text-sm font-medium text-gray-700">סוג מטפל/ת</label>
        <select
          value={formData.practitionerType}
          onChange={(e) =>
            onChange('practitionerType', e.target.value as typeof formData.practitionerType)
          }
          className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${
            fieldErrors.practitionerType ? 'border-red-500' : 'border-gray-200'
          }`}
          autoFocus
        >
          <option value="">בחר התמחות...</option>
          <option value="doctor">רופא/ה</option>
          <option value="nurse">אח/ות מוסמכ/ת</option>
          <option value="aesthetician">אסתטיקאי/ת רפואי/ת</option>
          <option value="cosmetician">קוסמטיקאי/ת</option>
          <option value="other">אחר</option>
        </select>
        {fieldErrors.practitionerType && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.practitionerType}</p>
        )}
      </div>

      {['doctor', 'nurse'].includes(formData.practitionerType) && (
        <div>
          <label className="text-sm font-medium text-gray-700">
            מספר רישיון משרד הבריאות
          </label>
          <div className="relative">
            <Award className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={formData.licenseNumber}
              onChange={(e) => onChange('licenseNumber', e.target.value)}
              placeholder="מספר רישיון"
              className={`pr-9 ${fieldErrors.licenseNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {fieldErrors.licenseNumber && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.licenseNumber}</p>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">שפות שירות</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => toggleArrayItem('languages', lang.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                formData.languages.includes(lang.value)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          התמחויות (אופציונלי)
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec.value}
              type="button"
              onClick={() => toggleArrayItem('specializations', spec.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                formData.specializations.includes(spec.value)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          חזור
        </Button>
        <Button onClick={onNext}>
          <span className="flex items-center gap-2">
            המשך <ChevronLeft size={16} />
          </span>
        </Button>
      </div>
    </div>
  );
};
