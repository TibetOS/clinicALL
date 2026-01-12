import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Public';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { ResetPasswordPage } from './pages/ResetPassword';
import { LockScreen } from './pages/LockScreen';
import { HealthDeclarationPage } from './pages/HealthDeclaration';
import { ClinicLanding } from './pages/ClinicLanding';
import { BookingApp } from './pages/Booking';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout, PageLoader, RoleProtectedPage } from './components/layout';

// Lazy load admin pages for code splitting
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const PatientList = lazy(() => import('./pages/admin/PatientList').then(m => ({ default: m.PatientList })));
const Calendar = lazy(() => import('./pages/admin/Calendar').then(m => ({ default: m.Calendar })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ServicesPage = lazy(() => import('./pages/admin/Services').then(m => ({ default: m.ServicesPage })));
const InventoryPage = lazy(() => import('./pages/admin/Inventory').then(m => ({ default: m.InventoryPage })));
const PatientDetails = lazy(() => import('./pages/PatientDetails').then(m => ({ default: m.PatientDetails })));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/health/:token" element={<HealthDeclarationPage />} />
            <Route path="/health" element={<HealthDeclarationPage />} />
            <Route path="/locked" element={<LockScreen />} />

            {/* PUBLIC CLINIC LANDING PAGE */}
            <Route path="/c/:slug" element={<ClinicLanding />} />

            {/* Legacy/Direct Booking Link */}
            <Route path="/book/:clinicId" element={<BookingApp />} />

            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin routes with role-based access control */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Admin+ can access dashboard, patients, calendar */}
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="patients" element={<PatientList />} />
                        <Route path="patients/:id" element={<PatientDetails />} />
                        <Route path="calendar" element={<Calendar />} />

                        {/* Admin+ can manage services and inventory */}
                        <Route
                          path="services"
                          element={
                            <RoleProtectedPage requiredRole="admin">
                              <ServicesPage />
                            </RoleProtectedPage>
                          }
                        />
                        <Route
                          path="inventory"
                          element={
                            <RoleProtectedPage requiredRole="admin">
                              <InventoryPage />
                            </RoleProtectedPage>
                          }
                        />

                        {/* Owner only can access settings */}
                        <Route
                          path="settings"
                          element={
                            <RoleProtectedPage requiredRole="owner">
                              <SettingsPage />
                            </RoleProtectedPage>
                          }
                        />

                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
        <Toaster position="bottom-center" richColors closeButton dir="rtl" />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
