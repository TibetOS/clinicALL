import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type UserRole = 'owner' | 'admin' | 'client';

type RoleProtectedPageProps = {
  children: React.ReactNode;
  requiredRole: 'owner' | 'admin';
};

const roleHierarchy: Record<UserRole, number> = {
  owner: 2,   // App owner (super admin)
  admin: 1,   // Clinic owner
  client: 0   // Patient
};

/**
 * Role-protected page wrapper for granular access control.
 * Roles: owner (app owner) > admin (clinic owner) > client (patient)
 */
export function RoleProtectedPage({ children, requiredRole }: RoleProtectedPageProps) {
  const { profile, loading } = useAuth();

  // Wait for profile to load before checking role
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-teal-200 rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  const userLevel = roleHierarchy[profile.role as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
          <p className="text-gray-500">אין לך הרשאה לצפות בדף זה. פנה למנהל המערכת לקבלת גישה.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
