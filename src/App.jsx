import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import DashboardPage from './pages/DashboardPage';
import MyRequestsPage from './pages/MyRequestsPage';
import PaymentResultPage from './pages/PaymentResultPage';
import AdminPayoutsPage from './pages/AdminPayoutsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function homePathForRole(role) {
  if (role === 'influencer') return '/dashboard';
  if (role === 'admin') return '/admin/payouts';
  return '/catalogo';
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
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
          <Route
            path="/admin/payouts"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPayoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transacciones"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cambiar-contrasena"
            element={
              <ProtectedRoute allowedRole="admin">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
