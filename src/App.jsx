import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import DashboardPage from './pages/DashboardPage';
import MyRequestsPage from './pages/MyRequestsPage';
import PaymentResultPage from './pages/PaymentResultPage';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'influencer' ? '/dashboard' : '/catalogo'} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'influencer' ? '/dashboard' : '/catalogo'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route
            path="/catalogo"
            element={
              <ProtectedRoute allowedRole="anunciante">
                <CatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="influencer">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-solicitudes"
            element={
              <ProtectedRoute allowedRole="anunciante">
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pago-exitoso"
            element={
              <ProtectedRoute allowedRole="anunciante">
                <PaymentResultPage outcome="success" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pago-cancelado"
            element={
              <ProtectedRoute allowedRole="anunciante">
                <PaymentResultPage outcome="cancelled" />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
