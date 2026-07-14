import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <Link to="/" className="brand">
        <div className="brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 15V9M9 18V6M14 21V3M19 12V12" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
        Alcance
      </Link>
      {user && (
        <div className="nav-right">
          {user.role === 'anunciante' && (
            <>
              <Link to="/catalogo" style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Catálogo</Link>
              <Link to="/mis-solicitudes" style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Mis solicitudes</Link>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin/payouts" style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Pagos pendientes</Link>
              <Link to="/admin/cambiar-contrasena" style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Cambiar contraseña</Link>
            </>
          )}
          <span className="role-pill">
            {user.role === 'influencer' ? 'Influencer' : user.role === 'admin' ? 'Admin' : 'Anunciante'}
          </span>
          <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{user.name}</span>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
