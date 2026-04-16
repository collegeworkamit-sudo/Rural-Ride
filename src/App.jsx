import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CommuterView from './pages/CommuterView';
import DriverView from './pages/DriverView';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Guest route — redirect to home if already logged in
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// Auto-redirect based on user role
function RoleRedirect() {
  const { user } = useAuth();

  if (user?.role === 'driver') return <DriverView />;
  return <CommuterView />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1f2e',
              color: '#e5e7eb',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#06b6d4', secondary: '#0a0f1c' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0f1c' },
            },
          }}
        />

        <Routes>
          {/* Guest routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <DriverView />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
