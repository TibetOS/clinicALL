
import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Badge, Label, Switch } from '../components/ui';
import {
  Check, ChevronLeft, ChevronRight, Globe, Building2, User, MapPin,
  FileBadge, Lock, ArrowLeft, Star, Calendar, Smartphone, Zap, TrendingUp,
  Sparkles, Image as ImageIcon, Palette, Heart, Shield, FileText, Clock,
  CheckCircle2, AlertCircle, Loader2, UserCheck, PenTool, Eraser, Eye, EyeOff, Mail, KeyRound,
  XCircle, Type, Phone, MessageCircle, Instagram, Facebook, Briefcase, Award,
  Languages, Users, HelpCircle, FileCheck
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MOCK_PATIENTS } from '../data';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useHealthTokens, useActivityLog } from '../hooks';
import { HealthDeclarationToken } from '../types';
import { isValidEmail, isValidIsraeliPhone, isStrongPassword } from '../lib/validation';

// -- LANDING PAGE --
export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">C</div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">ClinicALL</span>
           </div>
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-primary">פיצ׳רים</a>
              <Link to="/pricing" className="hover:text-primary">מחירים</Link>
              <a href="#" className="hover:text-primary">אודות</a>
           </div>
           <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">התחבר</Button>
              </Link>
              <Link to="/signup">
                <Button className="shadow-md">נסה חינם</Button>
              </Link>
           </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
               <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 py-1.5 px-4 text-sm">
                  חדש! בונה אתרים לקליניקות ב-5 דקות ✨
               </Badge>
               <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  יותר ממערכת ניהול.<br/>
                  <span className="text-primary">הנוכחות הדיגיטלית</span> המלאה שלך.
               </h1>
               <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  בנה אתר תדמית מהמם, נהל יומן תורים חכם, ושמור על קשר עם המטופלים - הכל בפלטפורמה אחת שמותאמת לאסתטיקה.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20">
                       <span className="flex items-center justify-center gap-2">בנה את הקליניקה שלך בחינם <ArrowLeft size={18} /></span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-white">
                     ראה דוגמה חיה
                  </Button>
               </div>
               <p className="mt-4 text-sm text-gray-500">ללא צורך בכרטיס אשראי • התקנה מיידית</p>
            </div>
         </div>
         
         {/* Background Decor */}
         <div className="absolute top-0 left-0 right-0 h-full -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-3xl translate-y-1/2"></div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">כל מה שצריך כדי לנהל ולהצמיח</h2>
               <p className="text-gray-600 text-lg">בחרנו בקפידה את הכלים החשובים ביותר למרפאות אסתטיקה ואיגדנו אותם במקום אחד.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { icon: Globe, title: 'אתר תדמית מעוצב', desc: 'עמוד נחיתה יוקרתי לקליניקה שלך, כולל גלריית עבודות, מחירון ומידע על הצוות.' },
                  { icon: Calendar, title: 'יומן תורים חכם', desc: 'מניעת כפילויות, תזכורות אוטומטיות ב-SMS ושיבוץ חכם של חדרי טיפול.' },
                  { icon: FileBadge, title: 'תיק רפואי דיגיטלי', desc: 'טפסים דיגיטליים, היסטוריית טיפולים, צילומי לפני/אחרי ומעקב מדויק.' },
                  { icon: Zap, title: 'שיווק ואוטומציה', desc: 'שליחת קמפיינים, מועדון לקוחות, ושימור לקוחות אוטומטי להגדלת המכירות.' },
                  { icon: Smartphone, title: 'אפליקציה למטופלים', desc: 'אזור אישי למטופלים לזימון תורים, צפייה בהיסטוריה ומילוי הצהרות בריאות.' },
                  { icon: TrendingUp, title: 'דוחות וניהול פיננסי', desc: 'מעקב אחר הכנסות, מלאי, הפקת חשבוניות ודוחות ביצועים בזמן אמת.' }
               ].map((f, i) => (
                  <Card key={i} className="p-6 hover:shadow-lg transition-shadow border-none shadow-sm">
                     <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                        <f.icon size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                     <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                  </Card>
               ))}
            </div>
         </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
             <div className="flex justify-center items-center gap-2 mb-4 text-white">
               <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">C</div>
               <span className="font-bold text-xl">ClinicALL</span>
            </div>
            <p className="max-w-sm mx-auto mb-6">מערכת הניהול המתקדמת ביותר לקליניקות אסתטיות. חכמה, פשוטה ומעוצבת.</p>
            <div className="text-sm">© {new Date().getFullYear()} ClinicALL. כל הזכויות שמורות.</div>
         </div>
      </footer>
    </div>
  );
};

// -- LOCK SCREEN --
export const LockScreen = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { logActivity } = useActivityLog();

  const handleLogout = async () => {
    // Log the logout activity before signing out
    await logActivity('logout', 'user', profile?.id, profile?.full_name, {
      reason: 'lock_screen',
    });
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">המנוי שלך הסתיים</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          תקופת הניסיון או המנוי שלך הסתיימו. הנתונים שלך שמורים ומאובטחים, אך הגישה למערכת נחסמה.
          <br/>
          אנא עדכן אמצעי תשלום כדי להמשיך.
        </p>

        <div className="space-y-4">
          <Button className="w-full h-12 text-lg shadow-lg" onClick={() => navigate('/admin/settings?tab=billing')}>
             עדכן אמצעי תשלום
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
             יציאה מהמערכת
          </Button>
        </div>
      </div>
    </div>
  );
};

// -- RESET PASSWORD PAGE --
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
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

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

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);

    const { error } = await resetPassword(forgotEmail.trim());

    if (error) {
      setForgotError('שגיאה בשליחת הקישור. אנא נסה שוב.');
      setForgotLoading(false);
    } else {
      setForgotSuccess(true);
      setForgotLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError(null);
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
                onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                className="text-xs text-primary hover:underline"
              >
                שכחת סיסמה?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
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
            ) : 'התחבר'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm">
          <span className="text-gray-500">אין לך עדיין חשבון? </span>
          <Link to="/signup" className="font-medium text-primary hover:underline">
            פתח קליניקה חדשה
          </Link>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeForgotPassword}>
          <Card className="w-full max-w-md p-8 shadow-xl border-0 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {!forgotSuccess ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-2 text-gray-900">איפוס סיסמה</h2>
                <p className="text-center text-muted-foreground mb-6 text-sm">
                  הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
                </p>

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-gray-700">אימייל</label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="text-left"
                      dir="ltr"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={closeForgotPassword}>
                      ביטול
                    </Button>
                    <Button type="submit" className="flex-1 shadow-md" disabled={forgotLoading}>
                      {forgotLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> שולח...
                        </span>
                      ) : 'שלח קישור'}
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
                <h2 className="text-xl font-bold text-center mb-2 text-gray-900">הקישור נשלח!</h2>
                <p className="text-center text-muted-foreground mb-6 text-sm">
                  שלחנו קישור לאיפוס סיסמה ל-<br/>
                  <span className="font-medium text-gray-900">{forgotEmail}</span>
                </p>
                <p className="text-center text-xs text-gray-500 mb-6">
                  לא קיבלת את המייל? בדוק את תיקיית הספאם או נסה שוב
                </p>
                <Button className="w-full" onClick={closeForgotPassword}>
                  חזרה להתחברות
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Clinic & Business
    clinicName: '',
    businessId: '',
    businessType: '' as '' | 'exempt' | 'authorized' | 'company' | 'partnership',
    slug: '',
    city: '',
    address: '',
    // Step 3: Contact & Social
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    // Step 4: Professional
    practitionerType: '' as '' | 'doctor' | 'nurse' | 'aesthetician' | 'cosmetician' | 'other',
    licenseNumber: '',
    specializations: [] as string[],
    languages: [] as string[],
    // Step 5: Branding & Final
    brandColor: '#0D9488',
    coverImage: 'default',
    operatingHours: '',
    referralSource: '',
    termsAccepted: false,
    niche: 'aesthetics',
  });

  // Type-safe form field update handler
  type SignupFormData = typeof formData;
  const handleChange = <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation functions using imported validators

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'נא להזין שם מלא';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'שם חייב להכיל לפחות 2 תווים';
    }

    if (!formData.email.trim()) {
      errors.email = 'נא להזין כתובת אימייל';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'כתובת האימייל אינה תקינה';
    }

    if (!formData.password) {
      errors.password = 'נא להזין סיסמה';
    } else {
      const passwordCheck = isStrongPassword(formData.password);
      if (!passwordCheck.valid) {
        errors.password = passwordCheck.message;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'נא לאשר סיסמה';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!formData.clinicName.trim()) {
      errors.clinicName = 'נא להזין שם קליניקה';
    } else if (formData.clinicName.trim().length < 2) {
      errors.clinicName = 'שם הקליניקה חייב להכיל לפחות 2 תווים';
    }

    if (!formData.businessType) {
      errors.businessType = 'נא לבחור סוג עסק';
    }

    if (!formData.businessId.trim()) {
      errors.businessId = 'נא להזין ת.ז. או ח.פ.';
    } else if (!/^\d{9}$/.test(formData.businessId.replace(/\D/g, ''))) {
      errors.businessId = 'ת.ז. או ח.פ. חייב להכיל 9 ספרות';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'נא להזין כתובת URL';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'כתובת URL יכולה להכיל רק אותיות קטנות באנגלית, מספרים ומקפים';
    }

    if (!formData.city) {
      errors.city = 'נא לבחור עיר';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      errors.phone = 'נא להזין מספר טלפון';
    } else if (!isValidIsraeliPhone(formData.phone)) {
      errors.phone = 'מספר טלפון אינו תקין';
    }

    // WhatsApp is optional but validate if provided
    if (formData.whatsapp && !isValidIsraeliPhone(formData.whatsapp)) {
      errors.whatsapp = 'מספר וואטסאפ אינו תקין';
    }

    // Instagram validation - optional but check format if provided
    if (formData.instagram && !/^[a-zA-Z0-9._]{1,30}$/.test(formData.instagram)) {
      errors.instagram = 'שם משתמש אינסטגרם אינו תקין';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    if (!formData.practitionerType) {
      errors.practitionerType = 'נא לבחור סוג מטפל/ת';
    }

    // License number is required for medical professionals
    if (['doctor', 'nurse'].includes(formData.practitionerType) && !formData.licenseNumber.trim()) {
      errors.licenseNumber = 'נא להזין מספר רישיון';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep5 = () => {
    const errors: Record<string, string> = {};

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'נא לאשר את תנאי השימוש';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleNextStep1 = () => {
    if (validateStep1()) {
      nextStep();
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      nextStep();
    }
  };

  const handleNextStep3 = () => {
    if (validateStep3()) {
      nextStep();
    }
  };

  const handleNextStep4 = () => {
    if (validateStep4()) {
      nextStep();
    }
  };

  const handleNextStep5 = () => {
    if (validateStep5()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      clinicName: formData.clinicName,
      slug: formData.slug,
      businessId: formData.businessId,
      address: formData.address,
      phone: formData.phone,
      // New fields
      whatsapp: formData.whatsapp || undefined,
      city: formData.city || undefined,
      businessType: formData.businessType || undefined,
      practitionerType: formData.practitionerType || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      instagram: formData.instagram || undefined,
      facebook: formData.facebook || undefined,
      languages: formData.languages.length > 0 ? formData.languages : undefined,
      operatingHours: formData.operatingHours || undefined,
      referralSource: formData.referralSource || undefined,
      specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
    });

    if (error) {
      setError(error.message || 'שגיאה בהרשמה');
      setLoading(false);
    } else {
      // Navigate to dashboard after successful signup
      navigate('/admin/dashboard');
    }
  };

  const steps = [
    { title: 'פרטי חשבון', icon: User },
    { title: 'פרטי עסק', icon: Building2 },
    { title: 'יצירת קשר', icon: Phone },
    { title: 'פרופיל מקצועי', icon: Award },
    { title: 'מיתוג ואישורים', icon: Palette },
    { title: 'סיום', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Simplified Nav */}
       <div className="p-4 flex justify-between items-center max-w-6xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2">
             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">C</div>
             <span className="font-bold text-gray-900">ClinicALL</span>
          </Link>
          <div className="text-sm text-gray-500">
             כבר יש לך חשבון? <Link to="/login" className="text-primary hover:underline">התחבר</Link>
          </div>
       </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           
           {/* Left Column: Form */}
           <Card className="w-full p-0 shadow-xl border-0 overflow-hidden order-2 lg:order-1">
             {/* Progress Bar */}
             <div className="bg-gray-50 p-6 border-b">
                <div className="flex justify-between max-w-md mx-auto relative mb-2">
                   {/* Line */}
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-0"></div>
                   <div 
                     className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 -z-0 transition-all duration-500"
                     style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                   ></div>

                   {steps.map((s, idx) => {
                     const Icon = s.icon;
                     const isActive = step >= idx + 1;
                     return (
                        <div key={idx} className="relative z-10 bg-gray-50 px-2">
                           <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2
                              ${isActive ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}
                           `}>
                              <Icon size={14} />
                           </div>
                        </div>
                     );
                   })}
                </div>
                <div className="text-center">
                   <h2 className="text-lg font-bold text-gray-900">{steps[step-1]?.title}</h2>
                </div>
             </div>

             <div className="p-8 min-h-[400px]">
                {/* STEP 1: ACCOUNT */}
                {step === 1 && (
                   <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                      <div>
                         <label className="text-sm font-medium text-gray-700">שם מלא</label>
                         <Input
                            name="name"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={e => handleChange('fullName', e.target.value)}
                            placeholder="ישראל ישראלי"
                            autoFocus
                            className={fieldErrors.fullName ? 'border-red-500' : ''}
                         />
                         {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
                      </div>
                      <div>
                         <label className="text-sm font-medium text-gray-700">אימייל</label>
                         <Input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            placeholder="name@example.com"
                            className={`text-left ${fieldErrors.email ? 'border-red-500' : ''}`}
                            dir="ltr"
                         />
                         {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                      </div>
                      <div>
                         <label className="text-sm font-medium text-gray-700">סיסמה</label>
                         <div className="relative">
                            <Input
                               type={showPassword ? "text" : "password"}
                               name="new-password"
                               autoComplete="new-password"
                               value={formData.password}
                               onChange={e => handleChange('password', e.target.value)}
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
                         {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                      </div>
                      <div>
                         <label className="text-sm font-medium text-gray-700">אישור סיסמה</label>
                         <div className="relative">
                            <Input
                               type={showConfirmPassword ? "text" : "password"}
                               name="confirm-password"
                               autoComplete="new-password"
                               value={formData.confirmPassword}
                               onChange={e => handleChange('confirmPassword', e.target.value)}
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
                         {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                      </div>
                      <div className="pt-2">
                         <Button onClick={handleNextStep1} className="w-full h-12 text-lg">
                            <span className="flex items-center justify-center gap-2">התחל לבנות <ChevronLeft size={20} /></span>
                         </Button>
                      </div>
                   </div>
                )}

                {/* STEP 2: BUSINESS DETAILS */}
                {step === 2 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                      <div>
                         <label className="text-sm font-medium text-gray-700">שם הקליניקה</label>
                         <Input
                            value={formData.clinicName}
                            onChange={e => {
                               handleChange('clinicName', e.target.value);
                               // Auto-generate slug
                               if (!formData.slug) {
                                  handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                               }
                            }}
                            placeholder="לדוג׳: אסתטיקה ויופי - ד״ר כהן"
                            autoFocus
                            className={fieldErrors.clinicName ? 'border-red-500' : ''}
                         />
                         {fieldErrors.clinicName && <p className="text-red-500 text-xs mt-1">{fieldErrors.clinicName}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">סוג עסק</label>
                         <select
                            value={formData.businessType}
                            onChange={e => handleChange('businessType', e.target.value as typeof formData.businessType)}
                            className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${fieldErrors.businessType ? 'border-red-500' : 'border-gray-200'}`}
                         >
                            <option value="">בחר סוג עסק...</option>
                            <option value="exempt">עוסק פטור</option>
                            <option value="authorized">עוסק מורשה</option>
                            <option value="company">חברה בע"מ</option>
                            <option value="partnership">שותפות</option>
                         </select>
                         {fieldErrors.businessType && <p className="text-red-500 text-xs mt-1">{fieldErrors.businessType}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">
                            {formData.businessType === 'company' || formData.businessType === 'partnership' ? 'ח.פ.' : 'ת.ז.'} (לצורכי חשבונית)
                         </label>
                         <Input
                            value={formData.businessId}
                            onChange={e => handleChange('businessId', e.target.value)}
                            placeholder="000000000"
                            className={`direction-ltr text-right ${fieldErrors.businessId ? 'border-red-500' : ''}`}
                         />
                         {fieldErrors.businessId && <p className="text-red-500 text-xs mt-1">{fieldErrors.businessId}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">כתובת ה-URL שלך</label>
                         <div className={`flex direction-ltr ${fieldErrors.slug ? '[&>input]:border-red-500' : ''}`}>
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                               clinicall.com/c/
                            </span>
                            <Input
                               value={formData.slug}
                               onChange={e => handleChange('slug', e.target.value)}
                               className={`rounded-l-none ${fieldErrors.slug ? 'border-red-500' : ''}`}
                            />
                         </div>
                         {fieldErrors.slug ? (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.slug}</p>
                         ) : (
                            <p className="text-xs text-gray-500 mt-1">זו הכתובת שבה המטופלים ימצאו אותך.</p>
                         )}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">עיר</label>
                         <select
                            value={formData.city}
                            onChange={e => handleChange('city', e.target.value)}
                            className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${fieldErrors.city ? 'border-red-500' : 'border-gray-200'}`}
                         >
                            <option value="">בחר עיר...</option>
                            <option value="תל אביב">תל אביב</option>
                            <option value="ירושלים">ירושלים</option>
                            <option value="חיפה">חיפה</option>
                            <option value="ראשון לציון">ראשון לציון</option>
                            <option value="פתח תקווה">פתח תקווה</option>
                            <option value="אשדוד">אשדוד</option>
                            <option value="נתניה">נתניה</option>
                            <option value="באר שבע">באר שבע</option>
                            <option value="בני ברק">בני ברק</option>
                            <option value="חולון">חולון</option>
                            <option value="רמת גן">רמת גן</option>
                            <option value="אשקלון">אשקלון</option>
                            <option value="רחובות">רחובות</option>
                            <option value="בת ים">בת ים</option>
                            <option value="הרצליה">הרצליה</option>
                            <option value="כפר סבא">כפר סבא</option>
                            <option value="רעננה">רעננה</option>
                            <option value="מודיעין">מודיעין</option>
                            <option value="אחר">אחר</option>
                         </select>
                         {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">כתובת מלאה (אופציונלי)</label>
                         <div className="relative">
                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                               value={formData.address}
                               onChange={e => handleChange('address', e.target.value)}
                               className="pr-9"
                               placeholder="רוטשילד 45"
                            />
                         </div>
                      </div>

                      <div className="flex justify-between pt-4">
                         <Button variant="ghost" onClick={prevStep}>חזור</Button>
                         <Button onClick={handleNextStep2}><span className="flex items-center gap-2">המשך <ChevronLeft size={16} /></span></Button>
                      </div>
                   </div>
                )}

                {/* STEP 3: CONTACT & SOCIAL */}
                {step === 3 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                      <div>
                         <label className="text-sm font-medium text-gray-700">טלפון</label>
                         <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                               type="tel"
                               value={formData.phone}
                               onChange={e => handleChange('phone', e.target.value)}
                               placeholder="050-1234567"
                               className={`pr-9 text-left ${fieldErrors.phone ? 'border-red-500' : ''}`}
                               dir="ltr"
                               autoFocus
                            />
                         </div>
                         {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">וואטסאפ (אופציונלי)</label>
                         <div className="relative">
                            <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                            <Input
                               type="tel"
                               value={formData.whatsapp}
                               onChange={e => handleChange('whatsapp', e.target.value)}
                               placeholder="אותו מספר או מספר אחר"
                               className={`pr-9 text-left ${fieldErrors.whatsapp ? 'border-red-500' : ''}`}
                               dir="ltr"
                            />
                         </div>
                         {fieldErrors.whatsapp ? (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.whatsapp}</p>
                         ) : (
                            <p className="text-xs text-gray-500 mt-1">הלקוחות יוכלו ליצור קשר ישירות בוואטסאפ</p>
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
                                  onChange={e => handleChange('instagram', e.target.value.replace('@', ''))}
                                  placeholder="your_clinic"
                                  className={`rounded-l-none ${fieldErrors.instagram ? 'border-red-500' : ''}`}
                               />
                            </div>
                         </div>
                         {fieldErrors.instagram && <p className="text-red-500 text-xs mt-1">{fieldErrors.instagram}</p>}
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">פייסבוק (אופציונלי)</label>
                         <div className="relative">
                            <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                            <Input
                               value={formData.facebook}
                               onChange={e => handleChange('facebook', e.target.value)}
                               placeholder="שם העמוד או קישור"
                               className="pr-9"
                            />
                         </div>
                      </div>

                      <div className="flex justify-between pt-4">
                         <Button variant="ghost" onClick={prevStep}>חזור</Button>
                         <Button onClick={handleNextStep3}><span className="flex items-center gap-2">המשך <ChevronLeft size={16} /></span></Button>
                      </div>
                   </div>
                )}

                {/* STEP 4: PROFESSIONAL PROFILE */}
                {step === 4 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                      <div>
                         <label className="text-sm font-medium text-gray-700">סוג מטפל/ת</label>
                         <select
                            value={formData.practitionerType}
                            onChange={e => handleChange('practitionerType', e.target.value as typeof formData.practitionerType)}
                            className={`w-full h-10 px-3 rounded-lg border bg-white text-sm ${fieldErrors.practitionerType ? 'border-red-500' : 'border-gray-200'}`}
                            autoFocus
                         >
                            <option value="">בחר התמחות...</option>
                            <option value="doctor">רופא/ה</option>
                            <option value="nurse">אח/ות מוסמכ/ת</option>
                            <option value="aesthetician">אסתטיקאי/ת רפואי/ת</option>
                            <option value="cosmetician">קוסמטיקאי/ת</option>
                            <option value="other">אחר</option>
                         </select>
                         {fieldErrors.practitionerType && <p className="text-red-500 text-xs mt-1">{fieldErrors.practitionerType}</p>}
                      </div>

                      {['doctor', 'nurse'].includes(formData.practitionerType) && (
                         <div>
                            <label className="text-sm font-medium text-gray-700">מספר רישיון משרד הבריאות</label>
                            <div className="relative">
                               <Award className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                               <Input
                                  value={formData.licenseNumber}
                                  onChange={e => handleChange('licenseNumber', e.target.value)}
                                  placeholder="מספר רישיון"
                                  className={`pr-9 ${fieldErrors.licenseNumber ? 'border-red-500' : ''}`}
                               />
                            </div>
                            {fieldErrors.licenseNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.licenseNumber}</p>}
                         </div>
                      )}

                      <div>
                         <label className="text-sm font-medium text-gray-700 mb-2 block">שפות שירות</label>
                         <div className="flex flex-wrap gap-2">
                            {[
                               { value: 'hebrew', label: 'עברית' },
                               { value: 'english', label: 'אנגלית' },
                               { value: 'russian', label: 'רוסית' },
                               { value: 'arabic', label: 'ערבית' },
                               { value: 'french', label: 'צרפתית' },
                               { value: 'spanish', label: 'ספרדית' },
                            ].map(lang => (
                               <button
                                  key={lang.value}
                                  type="button"
                                  onClick={() => {
                                     const newLangs = formData.languages.includes(lang.value)
                                        ? formData.languages.filter(l => l !== lang.value)
                                        : [...formData.languages, lang.value];
                                     handleChange('languages', newLangs);
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                     formData.languages.includes(lang.value)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                  }`}
                               >
                                  {lang.label}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700 mb-2 block">התמחויות (אופציונלי)</label>
                         <div className="flex flex-wrap gap-2">
                            {[
                               { value: 'botox', label: 'בוטוקס' },
                               { value: 'fillers', label: 'חומרי מילוי' },
                               { value: 'laser', label: 'לייזר' },
                               { value: 'skincare', label: 'טיפולי עור' },
                               { value: 'threads', label: 'חוטים' },
                               { value: 'prp', label: 'PRP' },
                               { value: 'mesotherapy', label: 'מזותרפיה' },
                               { value: 'body', label: 'עיצוב גוף' },
                            ].map(spec => (
                               <button
                                  key={spec.value}
                                  type="button"
                                  onClick={() => {
                                     const newSpecs = formData.specializations.includes(spec.value)
                                        ? formData.specializations.filter(s => s !== spec.value)
                                        : [...formData.specializations, spec.value];
                                     handleChange('specializations', newSpecs);
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                     formData.specializations.includes(spec.value)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                  }`}
                               >
                                  {spec.label}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="flex justify-between pt-4">
                         <Button variant="ghost" onClick={prevStep}>חזור</Button>
                         <Button onClick={handleNextStep4}><span className="flex items-center gap-2">המשך <ChevronLeft size={16} /></span></Button>
                      </div>
                   </div>
                )}

                {/* STEP 5: BRANDING & FINAL */}
                {step === 5 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                      <div>
                         <label className="text-sm font-medium text-gray-700 mb-2 block">צבע מותג ראשי</label>
                         <div className="flex gap-3 flex-wrap">
                            {['#0D9488', '#BCA48D', '#EC4899', '#6366F1', '#1F2937'].map(color => (
                               <button
                                 key={color}
                                 onClick={() => handleChange('brandColor', color)}
                                 className={`w-10 h-10 rounded-full border-2 transition-all ${formData.brandColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                 style={{ backgroundColor: color }}
                               />
                            ))}
                            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden relative">
                               <input
                                 type="color"
                                 className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-0"
                                 value={formData.brandColor}
                                 onChange={e => handleChange('brandColor', e.target.value)}
                               />
                            </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700 mb-2 block">תמונת נושא</label>
                         <div className="grid grid-cols-2 gap-3">
                            <div
                              onClick={() => handleChange('coverImage', 'default')}
                              className={`border-2 rounded-xl overflow-hidden cursor-pointer h-20 relative ${formData.coverImage === 'default' ? 'border-primary' : 'border-gray-200'}`}
                            >
                               <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600" alt="תמונת נושא קליניקה רפואית" className="w-full h-full object-cover" />
                               {formData.coverImage === 'default' && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="text-white drop-shadow-md"/></div>}
                            </div>
                            <div
                              onClick={() => handleChange('coverImage', 'spa')}
                              className={`border-2 rounded-xl overflow-hidden cursor-pointer h-20 relative ${formData.coverImage === 'spa' ? 'border-primary' : 'border-gray-200'}`}
                            >
                               <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" alt="תמונת נושא ספא" className="w-full h-full object-cover" />
                               {formData.coverImage === 'spa' && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="text-white drop-shadow-md"/></div>}
                            </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">שעות פעילות (אופציונלי)</label>
                         <select
                            value={formData.operatingHours}
                            onChange={e => handleChange('operatingHours', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
                         >
                            <option value="">בחר שעות פעילות...</option>
                            <option value="sunday-thursday">א׳-ה׳ 9:00-18:00</option>
                            <option value="sunday-friday">א׳-ו׳ 9:00-14:00</option>
                            <option value="flexible">שעות גמישות</option>
                            <option value="by-appointment">בתיאום מראש בלבד</option>
                         </select>
                      </div>

                      <div>
                         <label className="text-sm font-medium text-gray-700">איך שמעת עלינו? (אופציונלי)</label>
                         <select
                            value={formData.referralSource}
                            onChange={e => handleChange('referralSource', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
                         >
                            <option value="">בחר...</option>
                            <option value="google">חיפוש בגוגל</option>
                            <option value="instagram">אינסטגרם</option>
                            <option value="facebook">פייסבוק</option>
                            <option value="friend">המלצה מחבר/ה</option>
                            <option value="colleague">המלצה מקולגה</option>
                            <option value="conference">כנס / תערוכה</option>
                            <option value="other">אחר</option>
                         </select>
                      </div>

                      <div className={`p-4 rounded-lg border ${fieldErrors.termsAccepted ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                         <label className="flex items-start gap-3 cursor-pointer">
                            <input
                               type="checkbox"
                               checked={formData.termsAccepted}
                               onChange={e => handleChange('termsAccepted', e.target.checked)}
                               className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">
                               אני מאשר/ת את{' '}
                               <a href="/terms" target="_blank" className="text-primary hover:underline">תנאי השימוש</a>
                               {' '}ו
                               <a href="/privacy" target="_blank" className="text-primary hover:underline">מדיניות הפרטיות</a>
                               , כולל עיבוד מידע רפואי בהתאם לחוק הגנת הפרטיות.
                            </span>
                         </label>
                         {fieldErrors.termsAccepted && <p className="text-red-500 text-xs mt-2">{fieldErrors.termsAccepted}</p>}
                      </div>

                      <div className="flex justify-between pt-4">
                         <Button variant="ghost" onClick={prevStep}>חזור</Button>
                         <Button onClick={handleNextStep5}><span className="flex items-center gap-2">סיום <ChevronLeft size={16} /></span></Button>
                      </div>
                   </div>
                )}

                {/* STEP 6: SUCCESS */}
                {step === 6 && (
                   <div className="text-center py-8 animate-in fade-in zoom-in-95">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Check size={40} />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">האתר שלך מוכן!</h2>
                     <p className="text-gray-500 mb-8">
                        הגדרנו עבורך את הכל. כעת נעביר אותך למערכת הניהול כדי להוסיף שירותים וצוות.
                     </p>

                     {error && (
                       <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center max-w-sm mx-auto">
                         {error}
                       </div>
                     )}

                     <div className="bg-gray-50 p-4 rounded-xl text-right max-w-sm mx-auto mb-8 text-sm">
                        <div className="flex justify-between py-1">
                           <span className="text-gray-500">כתובת האתר:</span>
                           <span className="font-mono font-bold text-primary">clinicall.com/c/{formData.slug || 'my-clinic'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                           <span className="text-gray-500">עיר:</span>
                           <span className="font-bold">{formData.city || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                           <span className="text-gray-500">סוג מטפל/ת:</span>
                           <span className="font-bold">
                              {formData.practitionerType === 'doctor' && 'רופא/ה'}
                              {formData.practitionerType === 'nurse' && 'אח/ות'}
                              {formData.practitionerType === 'aesthetician' && 'אסתטיקאי/ת'}
                              {formData.practitionerType === 'cosmetician' && 'קוסמטיקאי/ת'}
                              {formData.practitionerType === 'other' && 'אחר'}
                              {!formData.practitionerType && '-'}
                           </span>
                        </div>
                        <div className="flex justify-between py-1">
                           <span className="text-gray-500">חבילה:</span>
                           <span className="font-bold">ניסיון חינם (Pro)</span>
                        </div>
                     </div>

                     <Button onClick={handleSubmit} disabled={loading} className="px-12 h-12 text-lg shadow-xl shadow-primary/20 w-full md:w-auto">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> יוצר חשבון...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">כניסה למערכת הניהול <ArrowLeft size={20} /></span>
                        )}
                     </Button>
                   </div>
                )}
             </div>
           </Card>

           {/* Right Column: Live Preview */}
           <div className="hidden lg:block sticky top-8 order-1 lg:order-2">
              <div className="text-center mb-4">
                 <Badge variant="outline" className="bg-white">תצוגה מקדימה חיה</Badge>
              </div>
              
              {/* Phone Frame */}
              <div className="mx-auto w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 w-full h-full bg-white flex flex-col overflow-y-auto no-scrollbar">
                    
                    {/* Preview Content */}
                    <div className="relative h-48 bg-gray-200 shrink-0">
                       <img 
                          src={formData.coverImage === 'spa' 
                             ? "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
                             : "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600"
                          } 
                          className="w-full h-full object-cover" 
                       />
                       <div className="absolute inset-0 bg-black/20"></div>
                       <div className="absolute bottom-4 right-4 text-white">
                          <h2 className="font-bold text-xl drop-shadow-md">{formData.clinicName || 'שם הקליניקה'}</h2>
                          <p className="text-xs opacity-90">{formData.address || 'תל אביב'}</p>
                       </div>
                    </div>

                    <div className="p-4 space-y-4">
                       <div className="flex gap-2">
                          <Button 
                             className="flex-1 rounded-full text-xs h-8" 
                             style={{ backgroundColor: formData.brandColor }}
                          >
                             קבע תור
                          </Button>
                          <Button variant="outline" className="flex-1 rounded-full text-xs h-8">
                             WhatsApp
                          </Button>
                       </div>

                       <div>
                          <h3 className="font-bold text-sm mb-2">טיפולים פופולריים</h3>
                          {[1,2].map(i => (
                             <div key={i} className="flex justify-between items-center border p-2 rounded-lg mb-2 shadow-sm">
                                <div className="flex gap-2 items-center">
                                   <div className="w-8 h-8 bg-gray-100 rounded-md"></div>
                                   <div>
                                      <div className="text-xs font-bold">טיפול {i}</div>
                                      <div className="text-[10px] text-gray-500">30 דק׳</div>
                                   </div>
                                </div>
                                <span className="text-xs font-bold">₪450</span>
                             </div>
                          ))}
                       </div>

                       <div className="p-3 bg-gray-50 rounded-xl text-center">
                          <p className="text-xs text-gray-500 italic">"השירות היה מדהים, ממליצה בחום!"</p>
                          <div className="flex justify-center gap-1 mt-1 text-amber-400">
                             <Star size={10} fill="currentColor"/>
                             <Star size={10} fill="currentColor"/>
                             <Star size={10} fill="currentColor"/>
                             <Star size={10} fill="currentColor"/>
                             <Star size={10} fill="currentColor"/>
                          </div>
                       </div>
                    </div>

                 </div>

                 {/* Phone Notch */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

// -- HEALTH DECLARATION --

const HEALTH_QUESTIONS = [
  { id: 'q1', text: { en: 'Are you pregnant or breastfeeding?', he: 'האם את בהריון או מניקה?' }, details: false },
  { id: 'q2', text: { en: 'Do you suffer from any allergies (medications, food, latex)?', he: 'האם ידועה רגישות לתרופות, מזון או לטקס?' }, details: true },
  { id: 'q3', text: { en: 'Have you taken Roaccutane in the past 6 months?', he: 'האם נטלת רואקוטן ב-6 החודשים האחרונים?' }, details: false },
  { id: 'q4', text: { en: 'Do you have any autoimmune diseases?', he: 'האם את/ה סובל/ת ממחלות אוטואימוניות?' }, details: true },
  { id: 'q5', text: { en: 'Do you take blood thinners or have coagulation problems?', he: 'האם את/ה נוטל/ת מדללי דם או סובל/ת מבעיות קרישה?' }, details: false },
  { id: 'q6', text: { en: 'Do you have diabetes?', he: 'האם את/ה סובל/ת מסוכרת?' }, details: false },
  { id: 'q7', text: { en: 'Do you suffer from Herpes Simplex (cold sores)?', he: 'האם את/ה סובל/ת מהרפס?' }, details: false },
  { id: 'q8', text: { en: 'Do you have permanent fillers or implants in the treated area?', he: 'האם ישנם חומרי מילוי קבועים או שתלים באזור הטיפול?' }, details: true },
  { id: 'q9', text: { en: 'Do you have any active skin infection or open wounds?', he: 'האם יש דלקת עור פעילה או פצעים פתוחים?' }, details: false },
];

// Accessible signature component with draw and type options
const SignaturePad = ({ onEnd, onClear, lang = 'he' }: { onEnd: (data: string | null) => void, onClear?: () => void, lang?: 'he' | 'en' }) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const [isDrawing, setIsDrawing] = useState(false);
   const [hasSignature, setHasSignature] = useState(false);
   const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
   const [typedName, setTypedName] = useState('');

   // Translations
   const t = (he: string, en: string) => lang === 'he' ? he : en;

   const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
      setIsDrawing(true);

      // Prevent scrolling on touch
      if ('touches' in e) e.preventDefault();
   };

   const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
      if ('touches' in e) e.preventDefault();
   };

   const endDrawing = () => {
      if (isDrawing) {
         setIsDrawing(false);
         setHasSignature(true);
         onEnd(canvasRef.current?.toDataURL() || null);
      }
   };

   const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      setTypedName('');
      onEnd(null);
      if (onClear) onClear();
   };

   // Handle typed signature - renders text to canvas
   const handleTypedSignature = (name: string) => {
      setTypedName(name);
      if (!name.trim()) {
         clearCanvas();
         return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear and draw typed signature
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'italic 32px "Brush Script MT", "Segoe Script", cursive';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);

      setHasSignature(true);
      onEnd(canvas.toDataURL());
   };

   // Initial setup
   useEffect(() => {
     const canvas = canvasRef.current;
     if (canvas) {
       canvas.width = canvas.parentElement?.offsetWidth || 500;
       canvas.height = 200;
       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.strokeStyle = "#000";
         ctx.lineWidth = 2;
         ctx.lineCap = "round";
       }
     }
   }, []);

   return (
      <div className="space-y-3">
         {/* Mode toggle for accessibility */}
         <div className="flex gap-2 text-sm" role="tablist" aria-label={t('בחר שיטת חתימה', 'Choose signature method')}>
            <button
               role="tab"
               aria-selected={signatureMode === 'draw'}
               onClick={() => { setSignatureMode('draw'); clearCanvas(); }}
               className={`px-3 py-1.5 rounded-lg transition-colors ${
                  signatureMode === 'draw'
                     ? 'bg-primary text-white'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
            >
               <PenTool size={14} className="inline mr-1" />
               {t('צייר חתימה', 'Draw signature')}
            </button>
            <button
               role="tab"
               aria-selected={signatureMode === 'type'}
               onClick={() => { setSignatureMode('type'); clearCanvas(); }}
               className={`px-3 py-1.5 rounded-lg transition-colors ${
                  signatureMode === 'type'
                     ? 'bg-primary text-white'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
            >
               <Type size={14} className="inline mr-1" />
               {t('הקלד שם', 'Type name')}
            </button>
         </div>

         {/* Type signature input (accessibility alternative) */}
         {signatureMode === 'type' && (
            <div className="space-y-2">
               <Input
                  type="text"
                  value={typedName}
                  onChange={(e) => handleTypedSignature(e.target.value)}
                  placeholder={t('הקלד את שמך המלא', 'Type your full name')}
                  className="text-lg"
                  aria-label={t('הקלד את שמך לחתימה', 'Type your name for signature')}
               />
               <p className="text-xs text-gray-500">
                  {t('החתימה שלך תופיע בסגנון כתב יד', 'Your signature will appear in handwriting style')}
               </p>
            </div>
         )}

         {/* Canvas signature pad */}
         <div
            className={`relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 ${signatureMode === 'draw' ? 'touch-none' : ''}`}
            role="img"
            aria-label={t('אזור חתימה', 'Signature area')}
         >
            <canvas
               ref={canvasRef}
               onMouseDown={signatureMode === 'draw' ? startDrawing : undefined}
               onMouseMove={signatureMode === 'draw' ? draw : undefined}
               onMouseUp={signatureMode === 'draw' ? endDrawing : undefined}
               onMouseLeave={signatureMode === 'draw' ? endDrawing : undefined}
               onTouchStart={signatureMode === 'draw' ? startDrawing : undefined}
               onTouchMove={signatureMode === 'draw' ? draw : undefined}
               onTouchEnd={signatureMode === 'draw' ? endDrawing : undefined}
               className={`w-full h-[200px] rounded-xl ${signatureMode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
               aria-hidden={signatureMode === 'type'}
            />
            <div className="absolute top-2 right-2 flex gap-2">
               <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 bg-white/80 backdrop-blur-sm shadow-sm"
                  onClick={clearCanvas}
                  aria-label={t('נקה חתימה', 'Clear signature')}
               >
                  <Eraser size={14} className="mr-1"/> {t('נקה', 'Clear')}
               </Button>
            </div>
            {!hasSignature && signatureMode === 'draw' && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="text-center">
                     <PenTool className="mx-auto mb-2" />
                     <span className="text-sm">{t('חתום כאן', 'Sign Here')}</span>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export const HealthDeclaration = () => {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const navigate = useNavigate();
  const { token: tokenParam } = useParams<{ token?: string }>();
  const { validateToken, markTokenAsUsed } = useHealthTokens();

  // Token validation state
  const [tokenValidation, setTokenValidation] = useState<{
    loading: boolean;
    valid: boolean;
    token?: HealthDeclarationToken;
    reason?: string;
  }>({ loading: !!tokenParam, valid: false });

  // Validate token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!tokenParam) {
        // No token provided - show access denied
        setTokenValidation({ loading: false, valid: false, reason: 'NO_TOKEN' });
        return;
      }

      const result = await validateToken(tokenParam);
      setTokenValidation({ loading: false, ...result });
    };

    checkToken();
  }, [tokenParam, validateToken]);

  // Get patient data from token or mock
  const patient = tokenValidation.token?.patientId
    ? MOCK_PATIENTS.find(p => p.id === tokenValidation.token?.patientId)
    : undefined;

  // Form State - initialized with token data or patient data
  const [formData, setFormData] = useState({
     fullName: '',
     dob: '',
     phone: '',
     email: '',
     healthQuestions: {} as Record<string, boolean>,
     healthDetails: {} as Record<string, string>,
     lifestyle: { smoke: false, alcohol: false, sun: false, sunReaction: 'burns' },
     treatments: { activeIngredients: false, retinA: false, pastTreatments: false, abnormalReaction: false },
     consent: false,
     signature: null as string | null
  });

  // Validation error state for inline error messages
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when token validation completes
  useEffect(() => {
    if (tokenValidation.valid && tokenValidation.token) {
      setFormData(prev => ({
        ...prev,
        fullName: tokenValidation.token?.patientName || patient?.name || prev.fullName,
        phone: tokenValidation.token?.patientPhone || patient?.phone || prev.phone,
        email: tokenValidation.token?.patientEmail || patient?.email || prev.email,
      }));
    }
  }, [tokenValidation.valid, tokenValidation.token, patient]);

  type FormDataKey = keyof typeof formData;
  type NestedFormKey = 'lifestyle' | 'treatments' | 'healthQuestions' | 'healthDetails';

  const updateForm = <K extends FormDataKey>(key: K, value: typeof formData[K]) => {
     setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = <K extends NestedFormKey>(category: K, key: string, value: boolean | string) => {
     setFormData(prev => ({
        ...prev,
        [category]: { ...prev[category], [key]: value }
     }));
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'he' : 'en';
    setLang(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const nextStep = async () => {
     // Clear previous validation errors
     setValidationErrors({});
     const errors: Record<string, string> = {};

     if (step === 1) {
        // Validate required fields
        if (!formData.fullName.trim()) {
           errors.fullName = lang === 'he' ? 'שם מלא הוא שדה חובה' : 'Full name is required';
        }
        if (!formData.phone.trim()) {
           errors.phone = lang === 'he' ? 'מספר טלפון הוא שדה חובה' : 'Phone number is required';
        } else if (!isValidIsraeliPhone(formData.phone)) {
           errors.phone = lang === 'he' ? 'מספר טלפון לא תקין' : 'Invalid phone number format';
        }
        // Optional email validation
        if (formData.email && !isValidEmail(formData.email)) {
           errors.email = lang === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address';
        }

        if (Object.keys(errors).length > 0) {
           setValidationErrors(errors);
           return;
        }
     }

     if (step === 3) {
        if (!formData.consent) {
           errors.consent = lang === 'he' ? 'יש לאשר את התנאים' : 'You must agree to the terms';
        }
        if (!formData.signature) {
           errors.signature = lang === 'he' ? 'נדרשת חתימה' : 'Signature is required';
        }

        if (Object.keys(errors).length > 0) {
           setValidationErrors(errors);
           return;
        }

        // On final submission, mark token as used
        if (tokenValidation.token) {
           await markTokenAsUsed(tokenValidation.token.id);
        }
     }

     setStep(prev => prev + 1);
     window.scrollTo(0, 0);
  };

  const prevStep = () => setStep(prev => prev - 1);

  // Translations helper
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  // Loading state while validating token
  if (tokenValidation.loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">מאמת גישה...</h2>
          <p className="text-gray-500">אנא המתן/י בזמן שאנו מאמתים את הקישור</p>
        </Card>
      </div>
    );
  }

  // Invalid/expired token states
  if (!tokenValidation.valid) {
    const getErrorContent = () => {
      switch (tokenValidation.reason) {
        case 'TOKEN_NOT_FOUND':
        case 'NO_TOKEN':
          return {
            icon: <XCircle size={48} strokeWidth={2} />,
            title: t('קישור לא תקין', 'Invalid Link'),
            description: t(
              'הקישור אינו תקין או שפג תוקפו. אנא פנה למרפאה לקבלת קישור חדש.',
              'This link is invalid or has expired. Please contact the clinic for a new link.'
            ),
            color: 'red'
          };
        case 'TOKEN_ALREADY_USED':
          return {
            icon: <CheckCircle2 size={48} strokeWidth={2} />,
            title: t('הטופס כבר הוגש', 'Form Already Submitted'),
            description: t(
              'הצהרת הבריאות כבר הוגשה באמצעות קישור זה. אם יש צורך בהצהרה נוספת, אנא פנה למרפאה.',
              'The health declaration has already been submitted using this link. For a new declaration, please contact the clinic.'
            ),
            color: 'yellow'
          };
        case 'TOKEN_EXPIRED':
          return {
            icon: <Clock size={48} strokeWidth={2} />,
            title: t('פג תוקף הקישור', 'Link Expired'),
            description: t(
              'תוקף הקישור פג. אנא פנה למרפאה לקבלת קישור חדש.',
              'This link has expired. Please contact the clinic for a new link.'
            ),
            color: 'orange'
          };
        default:
          return {
            icon: <AlertCircle size={48} strokeWidth={2} />,
            title: t('שגיאה', 'Error'),
            description: t('אירעה שגיאה. אנא נסה שוב מאוחר יותר.', 'An error occurred. Please try again later.'),
            color: 'red'
          };
      }
    };

    const error = getErrorContent();
    const colorClasses = {
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      orange: 'bg-orange-50 text-orange-600',
    }[error.color] || 'bg-red-50 text-red-600';

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500">
          <div className={`w-20 h-20 ${colorClasses} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {error.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error.title}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{error.description}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12">
            {t('חזרה לעמוד הבית', 'Back to Home')}
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 4) {
     return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
           <Card className="max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('תודה רבה!', 'Thank You!')}</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                 {t('הצהרת הבריאות שלך נקלטה בהצלחה במערכת.', 'Your health declaration has been submitted successfully.')}
              </p>
              <Button onClick={() => navigate('/')} className="w-full h-12 text-lg">
                 {t('סיום', 'Done')}
              </Button>
           </Card>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 font-sans text-stone-800">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">C</div>
            <span className="font-bold text-xl text-gray-800">ClinicALL</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2 text-gray-600 hover:bg-white">
            <Globe size={16} /> {lang === 'en' ? 'עברית' : 'English'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                 className="h-full bg-primary transition-all duration-700 ease-out" 
                 style={{ width: `${(step / 3) * 100}%` }}
              ></div>
           </div>
           <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
              <span className={step >= 1 ? 'text-primary' : ''}>{t('פרטים אישיים', 'Personal Info')}</span>
              <span className={step >= 2 ? 'text-primary' : ''}>{t('אורח חיים', 'Lifestyle')}</span>
              <span className={step >= 3 ? 'text-primary' : ''}>{t('חתימה', 'Signature')}</span>
           </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
           
           {/* Step 1: Personal & Medical */}
           {step === 1 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><User size={20}/></div>
                       <h2 className="text-xl font-bold text-gray-900">{t('פרטים אישיים', 'Personal Information')}</h2>
                    </div>
                    {(patient || tokenValidation.token?.patientName) && (
                       <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-primary/10 flex items-center gap-3 text-sm text-primary mt-2">
                          <UserCheck size={16} />
                          <span className="font-medium">{t(`שלום, ${tokenValidation.token?.patientName || patient?.name}`, `Hello, ${tokenValidation.token?.patientName || patient?.name}`)}</span>
                       </div>
                    )}
                 </div>

                 <div className="p-6 space-y-6">
                    <div>
                       <Label>{t('שם מלא *', 'FULL NAME *')}</Label>
                       <Input
                          value={formData.fullName}
                          onChange={e => updateForm('fullName', e.target.value)}
                          className={`h-12 bg-gray-50 border-gray-200 focus:bg-white ${validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                          aria-invalid={!!validationErrors.fullName}
                          aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                       />
                       {validationErrors.fullName && (
                          <p id="fullName-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                             <AlertCircle size={14} /> {validationErrors.fullName}
                          </p>
                       )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <Label>{t('תאריך לידה *', 'DATE OF BIRTH *')}</Label>
                          <Input type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} className="h-12 bg-gray-50 border-gray-200 focus:bg-white" />
                       </div>
                       <div>
                          <Label>{t('טלפון *', 'PHONE *')}</Label>
                          <Input
                             type="tel"
                             value={formData.phone}
                             onChange={e => updateForm('phone', e.target.value)}
                             className={`h-12 bg-gray-50 border-gray-200 focus:bg-white text-left direction-ltr ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                             aria-invalid={!!validationErrors.phone}
                             aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
                          />
                          {validationErrors.phone && (
                             <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} /> {validationErrors.phone}
                             </p>
                          )}
                       </div>
                    </div>
                    <div>
                       <Label>{t('אימייל', 'EMAIL')}</Label>
                       <Input
                          type="email"
                          value={formData.email}
                          onChange={e => updateForm('email', e.target.value)}
                          className={`h-12 bg-gray-50 border-gray-200 focus:bg-white text-left direction-ltr ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                          aria-invalid={!!validationErrors.email}
                          aria-describedby={validationErrors.email ? 'email-error' : undefined}
                       />
                       {validationErrors.email && (
                          <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                             <AlertCircle size={14} /> {validationErrors.email}
                          </p>
                       )}
                    </div>
                 </div>

                 <div className="bg-red-50/50 p-6 border-t border-red-100">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm"><Heart size={20}/></div>
                       <div>
                          <h2 className="text-lg font-bold text-gray-900">{t('שאלון רפואי', 'Health Questions')}</h2>
                          <p className="text-xs text-gray-500">{t('אנא עני בכנות למען בטיחותך', 'Answer honestly for safety')}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       {HEALTH_QUESTIONS.map((q) => (
                          <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-red-200 transition-colors">
                             <div className="flex justify-between items-start gap-4">
                                <span className="text-sm font-medium text-gray-800 pt-1">{lang === 'he' ? q.text.he : q.text.en}</span>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
                                   <button 
                                      onClick={() => updateNested('healthQuestions', q.id, false)}
                                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.healthQuestions[q.id] === false ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                   >
                                      {t('לא', 'No')}
                                   </button>
                                   <button 
                                      onClick={() => updateNested('healthQuestions', q.id, true)}
                                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.healthQuestions[q.id] === true ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:text-gray-700'}`}
                                   >
                                      {t('כן', 'Yes')}
                                   </button>
                                </div>
                             </div>
                             {q.details && formData.healthQuestions[q.id] && (
                                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                   <Input 
                                      placeholder={t('אנא פרטי...', 'Please specify...')} 
                                      value={formData.healthDetails[q.id] || ''}
                                      onChange={(e) => updateNested('healthDetails', q.id, e.target.value)}
                                      className="text-sm border-red-100 focus:border-red-300 focus:ring-red-200"
                                   />
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {/* Step 2: Lifestyle & Treatments */}
           {step === 2 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="bg-purple-50/50 p-6 border-b border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm"><Heart size={20}/></div>
                       <h2 className="text-xl font-bold text-gray-900">{t('אורח חיים', 'Lifestyle')}</h2>
                    </div>
                 </div>

                 <div className="p-6 space-y-6">
                     {[
                        { id: 'smoke', label: t('האם את מעשנת?', 'Do you smoke?') },
                        { id: 'alcohol', label: t('האם את שותה אלכוהול בקביעות?', 'Drink alcohol regularly?') },
                        { id: 'sun', label: t('חשיפה קבועה לשמש / מיטת שיזוף?', 'Regular sun exposure?') },
                     ].map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0">
                           <span className="text-sm font-medium">{item.label}</span>
                           <Switch 
                              checked={(formData.lifestyle as any)[item.id]} 
                              onCheckedChange={(val) => updateNested('lifestyle', item.id, val)} 
                           />
                        </div>
                     ))}
                     
                     <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Label className="text-orange-800 mb-3 block">{t('כיצד עורך מגיב לשמש?', 'How does your skin react to sun?')}</Label>
                        <div className="grid grid-cols-3 gap-2">
                           {['burns', 'tans', 'rarely'].map(opt => (
                              <button
                                 key={opt}
                                 onClick={() => updateNested('lifestyle', 'sunReaction', opt)}
                                 className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                                    formData.lifestyle.sunReaction === opt 
                                    ? 'bg-white border-orange-300 text-orange-700 shadow-sm' 
                                    : 'bg-white/50 border-transparent text-gray-500 hover:bg-white'
                                 }`}
                              >
                                 {opt === 'burns' ? t('נשרף בקלות', 'Burns') : opt === 'tans' ? t('משתזף', 'Tans') : t('כמעט ולא', 'Rarely')}
                              </button>
                           ))}
                        </div>
                     </div>
                 </div>

                 <div className="bg-teal-50/50 p-6 border-t border-teal-100">
                     <div className="flex items-center gap-3 mb-6">
                       <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm"><Sparkles size={20}/></div>
                       <h2 className="text-lg font-bold text-gray-900">{t('טיפולים ותכשירים', 'Treatments & Products')}</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                           { id: 'activeIngredients', label: t('שימוש בחומרים פעילים (חומצות/רטינול)?', 'Use active ingredients?') },
                           { id: 'retinA', label: t('שימוש ברטין-A / רואקוטן לאחרונה?', 'Used prescription Retin-A?') },
                           { id: 'pastTreatments', label: t('האם עברת טיפולים אסתטיים בעבר?', 'Past aesthetic treatments?') },
                           { id: 'abnormalReaction', label: t('האם הייתה תגובה חריגה לטיפול?', 'Had abnormal reaction?') },
                        ].map(item => (
                           <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                              <Switch 
                                 checked={(formData.treatments as any)[item.id]} 
                                 onCheckedChange={(val) => updateNested('treatments', item.id, val)} 
                              />
                           </div>
                        ))}
                    </div>
                 </div>
              </div>
           )}

           {/* Step 3: Consent & Signature */}
           {step === 3 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><Shield size={20}/></div>
                       <h2 className="text-xl font-bold text-gray-900">{t('הסכמה וחתימה', 'Consent & Signature')}</h2>
                    </div>
                 </div>

                 <div className="p-6 space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                       <h4 className="font-bold flex items-center gap-2 mb-2"><Sparkles size={14}/> {t('הנחיות חשובות', 'Instructions')}</h4>
                       <ul className="list-disc list-inside space-y-1 opacity-80">
                          <li>{t('אין לשטוף פנים במים חמים ב-24 שעות הקרובות', 'Avoid hot water on face for 24h')}</li>
                          <li>{t('יש להימנע מחשיפה לשמש', 'Avoid sun exposure')}</li>
                          <li>{t('במקרה של אדמומיות חריגה יש לפנות למרפאה', 'Contact clinic if unusual redness occurs')}</li>
                       </ul>
                    </div>

                    {/* Policy */}
                    <div className="border rounded-xl p-4 bg-gray-50/50">
                        <div className="flex items-start gap-3 mb-4">
                           <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                           <div>
                              <h4 className="font-bold text-gray-900 text-sm mb-1">{t('מדיניות ביטולים', 'Cancellation Policy')}</h4>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                 {t(
                                    'ביטול תור עד 48 שעות מראש - ללא עלות. ביטול בטווח של פחות מ-48 שעות יחויב במלוא עלות הטיפול. איחור של מעל 15 דקות עלול לגרור ביטול התור.',
                                    'Cancellation up to 48 hours in advance - no charge. Less than 48 hours - full charge. Being late over 15 mins may result in cancellation.'
                                 )}
                              </p>
                           </div>
                        </div>
                        <div className="h-px bg-gray-200 my-4"></div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <div className={`mt-0.5 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.consent ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                              {formData.consent && <Check size={14} />}
                           </div>
                           <input type="checkbox" className="hidden" checked={formData.consent} onChange={e => updateForm('consent', e.target.checked)} />
                           <span className="text-sm text-gray-700 select-none group-hover:text-gray-900">{t('קראתי והבנתי את כל האמור לעיל ואני מאשר/ת את התנאים', 'I have read and agree to all terms above')}</span>
                        </label>
                    </div>

                    {/* Signature */}
                    <div>
                       <div className="flex justify-between items-end mb-2">
                          <Label className="mb-0 flex items-center gap-2"><FileText size={14}/> {t('חתימה דיגיטלית', 'Digital Signature')}</Label>
                          <span className="text-xs text-gray-400 font-mono">{new Date().toLocaleDateString('he-IL')}</span>
                       </div>
                       <Input value={formData.fullName} readOnly className="mb-3 bg-gray-50 border-none text-gray-500" />
                       <SignaturePad 
                          onEnd={(data) => updateForm('signature', data)}
                          onClear={() => updateForm('signature', null)}
                       />
                    </div>
                 </div>
              </div>
           )}

           {/* Footer Navigation */}
           <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              {step > 1 ? (
                 <Button variant="ghost" onClick={prevStep} className="text-gray-500">
                    <ChevronRight size={16} className="ml-1"/> {t('חזור', 'Back')}
                 </Button>
              ) : <div></div>}
              
              <Button onClick={nextStep} className="px-8 shadow-lg shadow-primary/20" disabled={step === 3 && (!formData.consent || !formData.signature)}>
                 {step === 3 ? t('שלח הצהרה', 'Submit') : t('המשך', 'Next')} 
                 {step !== 3 && <ChevronLeft size={16} className="mr-1" />}
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
};
