import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isStrongPassword } from '../lib/validation';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Check for recovery session on mount
  useEffect(() => {
    // First check for errors in the URL hash (e.g., #error=access_denied&error_code=otp_expired)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlError = hashParams.get('error');
    const errorCode = hashParams.get('error_code');

    if (urlError || errorCode) {
      // There's an error in the URL - link is invalid/expired
      setHasValidSession(false);
      setSessionChecked(true);
      return;
    }

    // Set up auth state listener FIRST to catch any events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasValidSession(true);
        setSessionChecked(true);
      } else if (event === 'SIGNED_IN' && session) {
        // Sometimes recovery comes as SIGNED_IN
        setHasValidSession(true);
        setSessionChecked(true);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token was refreshed - session is valid
        setHasValidSession(true);
        setSessionChecked(true);
      }
    });

    // Then check for existing session (in case event already fired)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setSessionChecked(true);
          return;
        }
        if (session) {
          setHasValidSession(true);
          setSessionChecked(true);
        }
      } catch {
        setSessionChecked(true);
      }
    };
    checkSession();

    // Timeout to prevent infinite loading - show error page if no session found
    const timeout = setTimeout(() => {
      if (!sessionChecked) {
        setSessionChecked(true);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [sessionChecked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation - use strong password check
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError('שגיאה בעדכון הסיסמה. אנא נסה שוב.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('שגיאה בעדכון הסיסמה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No valid session - show error
  if (!hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-0 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">הקישור אינו תקף</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            הקישור לאיפוס הסיסמה פג תוקף או אינו תקין.
            <br />
            אנא בקש קישור חדש.
          </p>
          <Link to="/login">
            <Button className="w-full">חזרה להתחברות</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-0 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">הסיסמה עודכנה בהצלחה!</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            כעת תוכל להתחבר עם הסיסמה החדשה שלך.
          </p>
          <Button className="w-full" onClick={() => navigate('/login')}>
            התחבר למערכת
          </Button>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg border-0">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <KeyRound className="text-white" size={24} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">יצירת סיסמה חדשה</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          הזן סיסמה חדשה לחשבון שלך
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">סיסמה חדשה</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 8 תווים"
                required
                className="text-left pl-10"
                dir="ltr"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">אישור סיסמה</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן סיסמה שוב"
                required
                className="text-left pl-10"
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
          </div>
          <Button type="submit" className="w-full shadow-md" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> מעדכן...
              </span>
            ) : 'עדכן סיסמה'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            חזרה להתחברות
          </Link>
        </div>
      </Card>
    </div>
  );
};
