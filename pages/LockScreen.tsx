import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useActivityLog } from '../hooks';

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
