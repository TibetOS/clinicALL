import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { loginAttemptLimiter } from '../lib/rateLimiter';
import { ForgotPasswordModal } from '../components/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // SECURITY: Client-side rate limiting to prevent brute force attacks
    const rateLimit = loginAttemptLimiter.checkLimit();
    if (!rateLimit.allowed) {
      const retrySeconds = Math.ceil((rateLimit.retryAfterMs || 60000) / 1000);
      setError(`יותר מדי ניסיונות התחברות. נסה שוב בעוד ${retrySeconds} שניות`);
      setLoading(false);
      return;
    }

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="ltr">
      <Card className="w-full max-w-md p-8 shadow-lg border-0" dir="rtl">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">ברוכים הבאים</h1>
        <p className="text-center text-muted-foreground mb-8">התחברות למערכת ClinicALL</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">אימייל</label>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="text-left"
              dir="ltr"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">סיסמה</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary hover:underline"
              >
                שכחת סיסמה?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזן סיסמה"
                required
                className="text-left pl-10"
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
          </div>
          <Button type="submit" className="w-full shadow-md" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> מתחבר...
              </span>
            ) : (
              'התחבר'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm">
          <span className="text-gray-500">אין לך עדיין חשבון? </span>
          <Link to="/signup" className="font-medium text-primary hover:underline">
            פתח קליניקה חדשה
          </Link>
        </div>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={email}
        onSubmit={resetPassword}
      />
    </div>
  );
};
