import { MapPin, ChevronLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

const CITIES = [
  'תל אביב',
  'ירושלים',
  'חיפה',
  'ראשון לציון',
  'פתח תקווה',
  'אשדוד',
  'נתניה',
  'באר שבע',
  'בני ברק',
  'חולון',
  'רמת גן',
  'אשקלון',
  'רחובות',
  'בת ים',
  'הרצליה',
  'כפר סבא',
  'רעננה',
  'מודיעין',
  'אחר',
];

export const BusinessStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="text-sm font-medium text-gray-700">שם הקליניקה</label>
        <Input
          value={formData.clinicName}
          onChange={(e) => {
            onChange('clinicName', e.target.value);
            // Auto-generate slug
            if (!formData.slug) {
              onChange(
                'slug',
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
              );
            }
          }}
          placeholder="לדוג׳: אסתטיקה ויופי - ד״ר כהן"
          autoFocus
          className={fieldErrors.clinicName ? 'border-red-500' : ''}
        />
        {fieldErrors.clinicName && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.clinicName}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">סוג עסק</label>
        <select
          value={formData.businessType}
          onChange={(e) =>
            onChange('businessType', e.target.value as typeof formData.businessType)
          }
          className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${
            fieldErrors.businessType ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="">בחר סוג עסק...</option>
          <option value="exempt">עוסק פטור</option>
          <option value="authorized">עוסק מורשה</option>
          <option value="company">חברה בע"מ</option>
          <option value="partnership">שותפות</option>
        </select>
        {fieldErrors.businessType && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.businessType}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {formData.businessType === 'company' || formData.businessType === 'partnership'
            ? 'ח.פ.'
            : 'ת.ז.'}{' '}
          (לצורכי חשבונית)
        </label>
        <Input
          value={formData.businessId}
          onChange={(e) => onChange('businessId', e.target.value)}
          placeholder="000000000"
          className={`direction-ltr text-right ${fieldErrors.businessId ? 'border-red-500' : ''}`}
        />
        {fieldErrors.businessId && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.businessId}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">כתובת ה-URL שלך</label>
        <div
          className={`flex direction-ltr ${fieldErrors.slug ? '[&>input]:border-red-500' : ''}`}
        >
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
            clinicall.com/c/
          </span>
          <Input
            value={formData.slug}
            onChange={(e) => onChange('slug', e.target.value)}
            className={`rounded-l-none ${fieldErrors.slug ? 'border-red-500' : ''}`}
          />
        </div>
        {fieldErrors.slug ? (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.slug}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">זו הכתובת שבה המטופלים ימצאו אותך.</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">עיר</label>
        <select
          value={formData.city}
          onChange={(e) => onChange('city', e.target.value)}
          className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${
            fieldErrors.city ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="">בחר עיר...</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {fieldErrors.city && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">כתובת מלאה (אופציונלי)</label>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="pr-9"
            placeholder="רוטשילד 45"
          />
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
