import { Phone, MessageCircle, Instagram, Facebook, ChevronLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

export const ContactStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="text-sm font-medium text-gray-700">טלפון</label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="050-1234567"
            className={`pr-9 text-left ${fieldErrors.phone ? 'border-red-500' : ''}`}
            dir="ltr"
            autoFocus
          />
        </div>
        {fieldErrors.phone && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">וואטסאפ (אופציונלי)</label>
        <div className="relative">
          <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          <Input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => onChange('whatsapp', e.target.value)}
            placeholder="אותו מספר או מספר אחר"
            className={`pr-9 text-left ${fieldErrors.whatsapp ? 'border-red-500' : ''}`}
            dir="ltr"
          />
        </div>
        {fieldErrors.whatsapp ? (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.whatsapp}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            הלקוחות יוכלו ליצור קשר ישירות בוואטסאפ
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">אינסטגרם (אופציונלי)</label>
        <div className="relative">
          <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
          <div className="flex direction-ltr">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
              @
            </span>
            <Input
              value={formData.instagram}
              onChange={(e) => onChange('instagram', e.target.value.replace('@', ''))}
              placeholder="your_clinic"
              className={`rounded-l-none ${fieldErrors.instagram ? 'border-red-500' : ''}`}
            />
          </div>
        </div>
        {fieldErrors.instagram && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.instagram}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">פייסבוק (אופציונלי)</label>
        <div className="relative">
          <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
          <Input
            value={formData.facebook}
            onChange={(e) => onChange('facebook', e.target.value)}
            placeholder="שם העמוד או קישור"
            className="pr-9"
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
