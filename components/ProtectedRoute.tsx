import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading, isConfigured } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50" dir="rtl">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  // SECURITY: In production, always require authentication
  // Mock mode is only enabled when VITE_ALLOW_DEMO_MODE=true AND Supabase is not configured
  const isDemoModeAllowed = import.meta.env.VITE_ALLOW_DEMO_MODE === 'true';
  if (!isConfigured && isDemoModeAllowed) {
    // Show a warning banner in demo mode
    return (
      <div>
        <div className="bg-yellow-500 text-yellow-900 text-center text-sm py-2 px-4 font-medium">
          מצב הדגמה - הנתונים אינם מאובטחים. להגדרת Supabase, עיין ב-CLAUDE.md
        </div>
        {children}
      </div>
    );
  }

  // If Supabase is not configured and demo mode is not allowed, show configuration error
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4" dir="rtl">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">שגיאת הגדרות</h1>
          <p className="text-gray-600 mb-4">המערכת לא מוגדרת כראוי. אנא הגדר את משתני הסביבה של Supabase.</p>
          <code className="block bg-gray-100 p-3 rounded text-xs text-left direction-ltr">
            VITE_SUPABASE_URL=...<br/>
            VITE_SUPABASE_ANON_KEY=...
          </code>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role hierarchy if required
  // Roles: owner (app owner) > admin (clinic owner) > client (patient)
  if (requiredRole && profile) {
    const roleHierarchy: Record<string, number> = {
      owner: 2,   // App owner (super admin)
      admin: 1,   // Clinic owner
      client: 0   // Patient
    };
    const userLevel = roleHierarchy[profile.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
