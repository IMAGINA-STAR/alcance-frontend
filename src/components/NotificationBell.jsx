import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 25000;

function formatWhen(iso) {
  return new Date(iso).toLocaleString('es-GT', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const loadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadNotificationCount(token);
      setCount(data.count);
    } catch {
      // el próximo poll reintenta
    }
  }, [token]);

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, POLL_MS);
    return () => clearInterval(interval);
  }, [loadCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const data = await api.getNotifications(token);
      setItems(data);
    } catch {
      // deja la lista como estaba; el usuario puede reabrir para reintentar
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead(token);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setCount(0);
    } catch {
      // sin cambios visibles si falla; el próximo poll refleja el estado real
    }
  }

  async function handleItemClick(n) {
    if (!n.read) {
      try {
        await api.markNotificationRead(n.id, token);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setCount((c) => Math.max(0, c - 1));
      } catch {
        // igual navegamos aunque no se haya podido marcar como leída
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button className="notif-bell-btn" onClick={toggleOpen} aria-label="Notificaciones">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className="notif-badge">{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h4>Notificaciones</h4>
            {items.some((n) => !n.read) && (
              <button className="notif-mark-all" onClick={markAllRead}>Marcar todas como leídas</button>
            )}
          </div>
          {loading && <div className="notif-empty">Cargando…</div>}
          {!loading && items.length === 0 && (
            <div className="notif-empty">No tienes notificaciones.</div>
          )}
          {!loading && items.map((n) => (
            <button
              key={n.id}
              className={`notif-item${n.read ? '' : ' unread'}`}
              onClick={() => handleItemClick(n)}
            >
              <div className="notif-item-title">{n.title}</div>
              {n.body && <div className="notif-item-body">{n.body}</div>}
              <div className="notif-item-time">{formatWhen(n.created_at)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
