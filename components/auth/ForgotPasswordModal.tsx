import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button, Input, Card } from '../ui';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSubmit: (email: string) => Promise<{ error: Error | null }>;
};

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSubmit,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: submitError } = await onSubmit(email.trim());

    if (submitError) {
      setError('שגיאה בשליחת הקישור. אנא נסה שוב.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-md p-8 shadow-xl border-0 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {!success ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-900">
              איפוס סיסמה
            </h2>
            <p className="text-center text-muted-foreground mb-6 text-sm">
              הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700">
                  אימייל
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="text-left"
                  dir="ltr"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  className="flex-1 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> שולח...
                    </span>
                  ) : (
                    'שלח קישור'
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-900">
              הקישור נשלח!
            </h2>
            <p className="text-center text-muted-foreground mb-6 text-sm">
              שלחנו קישור לאיפוס סיסמה ל-
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-center text-xs text-gray-500 mb-6">
              לא קיבלת את המייל? בדוק את תיקיית הספאם או נסה שוב
            </p>
            <Button className="w-full" onClick={handleClose}>
              חזרה להתחברות
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};
