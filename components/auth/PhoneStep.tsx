import { ChevronLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

type PhoneStepProps = Omit<SignupStepProps, 'onBack'>;

export const PhoneStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  loading,
}: PhoneStepProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">מה מספר הטלפון שלך?</h2>
        <p className="text-gray-500 mt-2">נשתמש במספר הזה להתחברות לחשבון</p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">מספר טלפון</label>
        <Input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="050-1234567"
          autoFocus
          className={`text-lg h-12 ${fieldErrors.phone ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {fieldErrors.phone && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      <div className="pt-4">
        <Button
          onClick={onNext}
          disabled={loading}
          loading={loading}
          className="w-full h-12 text-lg"
        >
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={20} />
          </span>
        </Button>
      </div>
    </div>
  );
};
