import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

type AccountStepProps = Omit<SignupStepProps, 'onBack'>;

export const AccountStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
}: AccountStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="text-sm font-medium text-gray-700">שם מלא</label>
        <Input
          name="name"
          autoComplete="name"
          value={formData.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          placeholder="ישראל ישראלי"
          autoFocus
          className={fieldErrors.fullName ? 'border-red-500' : ''}
        />
        {fieldErrors.fullName && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">אימייל</label>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="name@example.com"
          className={`text-left ${fieldErrors.email ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">סיסמה</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="new-password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="לפחות 8 תווים"
            className={`text-left pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">אישור סיסמה</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm-password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="הזן סיסמה שוב"
            className={`text-left pl-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
        )}
      </div>
      <div className="pt-2">
        <Button onClick={onNext} className="w-full h-12 text-lg">
          <span className="flex items-center justify-center gap-2">
            התחל לבנות <ChevronLeft size={20} />
          </span>
        </Button>
      </div>
    </div>
  );
};
