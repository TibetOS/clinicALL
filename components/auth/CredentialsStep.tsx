import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '../ui';
import type { SignupStepProps } from './types';

export const CredentialsStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
  loading,
}: SignupStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">פרטי התחברות</h2>
        <p className="text-gray-500 mt-2">צור סיסמה חזקה לחשבון שלך</p>
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
          autoFocus
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
        <p className="text-xs text-gray-500 mt-1">לפחות 8 תווים, אות גדולה, אות קטנה ומספר</p>
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
          disabled={loading}
          loading={loading}
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
