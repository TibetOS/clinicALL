import { Smartphone, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';

export type AuthenticationFormProps = {
  customerName: string;
  authPhone: string;
  phoneValidationError: string | null;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onContinue: () => void;
};

export function AuthenticationForm({
  customerName,
  authPhone,
  phoneValidationError,
  onNameChange,
  onPhoneChange,
  onContinue,
}: AuthenticationFormProps) {
  return (
    <div className="p-4 animate-in fade-in slide-in-from-right-4">
      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">פרטי התקשרות</h2>
        <p className="text-gray-500 text-sm mt-1">נשתמש בפרטים אלו לתיאום התור</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="customer-name" className="text-sm font-medium">
            שם מלא
          </label>
          <Input
            id="customer-name"
            type="text"
            name="name"
            autoComplete="name"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-12"
            placeholder="הכנס את שמך"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="auth-phone" className="text-sm font-medium">
            מספר נייד
          </label>
          <Input
            id="auth-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={authPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`text-center text-lg tracking-widest h-12 direction-ltr ${
              phoneValidationError ? 'border-red-500' : ''
            }`}
            placeholder="050-000-0000"
            aria-invalid={!!phoneValidationError}
            aria-describedby={phoneValidationError ? 'phone-error' : undefined}
          />
          {phoneValidationError && (
            <p id="phone-error" className="text-sm text-red-600 flex items-center gap-1 justify-center">
              <AlertCircle size={14} /> {phoneValidationError}
            </p>
          )}
        </div>
        <Button className="w-full h-12" onClick={onContinue} disabled={!authPhone.trim()}>
          המשך לאישור
        </Button>
      </div>
    </div>
  );
}
