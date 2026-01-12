import { Check, ChevronLeft } from 'lucide-react';
import { Button } from '../ui';
import type { SignupStepProps } from './types';

const BRAND_COLORS = ['#0D9488', '#BCA48D', '#EC4899', '#6366F1', '#1F2937'];

const OPERATING_HOURS_OPTIONS = [
  { value: 'sunday-thursday', label: 'א׳-ה׳ 9:00-18:00' },
  { value: 'sunday-friday', label: 'א׳-ו׳ 9:00-14:00' },
  { value: 'flexible', label: 'שעות גמישות' },
  { value: 'by-appointment', label: 'בתיאום מראש בלבד' },
];

const REFERRAL_SOURCES = [
  { value: 'google', label: 'חיפוש בגוגל' },
  { value: 'instagram', label: 'אינסטגרם' },
  { value: 'facebook', label: 'פייסבוק' },
  { value: 'friend', label: 'המלצה מחבר/ה' },
  { value: 'colleague', label: 'המלצה מקולגה' },
  { value: 'conference', label: 'כנס / תערוכה' },
  { value: 'other', label: 'אחר' },
];

export const BrandingStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">צבע מותג ראשי</label>
        <div className="flex gap-3 flex-wrap">
          {BRAND_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onChange('brandColor', color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                formData.brandColor === color
                  ? 'border-gray-900 scale-110 shadow-md'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden relative">
            <input
              type="color"
              className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-0"
              value={formData.brandColor}
              onChange={(e) => onChange('brandColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">תמונת נושא</label>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => onChange('coverImage', 'default')}
            className={`border-2 rounded-xl overflow-hidden cursor-pointer h-20 relative ${
              formData.coverImage === 'default' ? 'border-primary' : 'border-gray-200'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600"
              alt="תמונת נושא קליניקה רפואית"
              className="w-full h-full object-cover"
            />
            {formData.coverImage === 'default' && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="text-white drop-shadow-md" />
              </div>
            )}
          </div>
          <div
            onClick={() => onChange('coverImage', 'spa')}
            className={`border-2 rounded-xl overflow-hidden cursor-pointer h-20 relative ${
              formData.coverImage === 'spa' ? 'border-primary' : 'border-gray-200'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
              alt="תמונת נושא ספא"
              className="w-full h-full object-cover"
            />
            {formData.coverImage === 'spa' && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="text-white drop-shadow-md" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">שעות פעילות (אופציונלי)</label>
        <select
          value={formData.operatingHours}
          onChange={(e) => onChange('operatingHours', e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
        >
          <option value="">בחר שעות פעילות...</option>
          {OPERATING_HOURS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">איך שמעת עלינו? (אופציונלי)</label>
        <select
          value={formData.referralSource}
          onChange={(e) => onChange('referralSource', e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
        >
          <option value="">בחר...</option>
          {REFERRAL_SOURCES.map((src) => (
            <option key={src.value} value={src.value}>
              {src.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`p-4 rounded-lg border ${
          fieldErrors.termsAccepted ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => onChange('termsAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            אני מאשר/ת את{' '}
            <a href="/terms" target="_blank" className="text-primary hover:underline">
              תנאי השימוש
            </a>{' '}
            ו
            <a href="/privacy" target="_blank" className="text-primary hover:underline">
              מדיניות הפרטיות
            </a>
            , כולל עיבוד מידע רפואי בהתאם לחוק הגנת הפרטיות.
          </span>
        </label>
        {fieldErrors.termsAccepted && (
          <p className="text-red-500 text-xs mt-2">{fieldErrors.termsAccepted}</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          חזור
        </Button>
        <Button onClick={onNext}>
          <span className="flex items-center gap-2">
            סיום <ChevronLeft size={16} />
          </span>
        </Button>
      </div>
    </div>
  );
};
