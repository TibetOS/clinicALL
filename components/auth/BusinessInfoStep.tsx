import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '../ui';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import type { SignupStepProps } from './types';
import { ISRAELI_CITIES, generateSlug } from './types';

export const BusinessInfoStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  const handleBusinessNameChange = (value: string) => {
    onChange('businessName', value);
    // Auto-generate slug from business name
    const slug = generateSlug(value);
    onChange('slug', slug);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">פרטי העסק שלך</h2>
        <p className="text-gray-500 mt-2">המידע יופיע בדף הנחיתה שלך</p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">שם העסק</label>
        <Input
          name="businessName"
          value={formData.businessName}
          onChange={(e) => handleBusinessNameChange(e.target.value)}
          placeholder="למשל: סטודיו יופי"
          autoFocus
          className={fieldErrors.businessName ? 'border-red-500' : ''}
        />
        {fieldErrors.businessName && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.businessName}</p>
        )}
        {formData.slug && (
          <p className="text-xs text-gray-500 mt-1" dir="ltr">
            clinicall.co.il/c/{formData.slug}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">טלפון העסק</label>
        <Input
          type="tel"
          name="businessPhone"
          value={formData.businessPhone}
          onChange={(e) => onChange('businessPhone', e.target.value)}
          placeholder="050-1234567"
          className={`text-left ${fieldErrors.businessPhone ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {fieldErrors.businessPhone && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.businessPhone}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">עיר</label>
        <Select
          value={formData.city}
          onValueChange={(value) => onChange('city', value)}
        >
          <SelectTrigger className={fieldErrors.city ? 'border-red-500' : ''}>
            <SelectValue placeholder="בחר עיר" />
          </SelectTrigger>
          <SelectContent>
            {ISRAELI_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.city && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">כתובת</label>
        <Input
          name="address"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="רחוב, מספר בניין"
          className={fieldErrors.address ? 'border-red-500' : ''}
        />
        {fieldErrors.address && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronRight size={20} /> חזרה
          </span>
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={20} />
          </span>
        </Button>
      </div>
    </div>
  );
};
