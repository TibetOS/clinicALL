import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { Button, Dialog } from '../../ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useActivityLog } from '../../../hooks';

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Logout confirmation dialog with activity logging.
 */
export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { logActivity } = useActivityLog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Log the logout activity before signing out
      await logActivity('logout', 'user', profile?.id, profile?.full_name, {
        reason: 'user_initiated',
      });

      // Perform sign out
      const { error: signOutError } = await signOut();

      if (signOutError) {
        setError('שגיאה בהתנתקות. אנא נסה שוב.');
        setLoading(false);
        return;
      }

      // Close dialog and navigate to login
      onOpenChange(false);
      navigate('/login');
    } catch {
      setError('שגיאה בהתנתקות. אנא נסה שוב.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="יציאה מהמערכת"
    >
      <div className="space-y-6">
        <p className="text-gray-600 text-center">
          אתה בטוח שברצונך לצאת מהמערכת?
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            ביטול
          </Button>
          <Button
            variant="destructive"
            className="gap-2 min-w-[120px]"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                מתנתק...
              </>
            ) : (
              <>
                <LogOut size={16} />
                כן, התנתק
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
