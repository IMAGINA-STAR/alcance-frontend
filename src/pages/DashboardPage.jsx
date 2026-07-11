import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import ChatModal from '../components/ChatModal';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const CONTENT_TYPES = ['Historia de Instagram (24h)', 'Post en feed', 'Reel', 'Combo (Historia + Post)'];

function statusBadge(status, paymentStatus) {
  if (status === 'accepted') {
    return paymentStatus === 'paid'
      ? <span className="badge-accepted">Pagada</span>
      : <span className="badge-accepted">Aceptada</span>;
  }
  if (status === 'rejected') return <span className="badge-rejected">Rechazada</span>;
  return null;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [reqError, setReqError] = useState('');
  const [chatRequest, setChatRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoadingReq(true);
    setReqError('');
    try {
      const data = await api.getReceivedRequests(token);
      setRequests(data);
    } catch (err) {
      setReqError(err.message);
    } finally {
      setLoadingReq(false);
    }
  }, [token]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  async function publishSpace() {
    if (!price) {
      showToast('Ingresa un precio para publicar tu espacio', true);
      return;
    }
    setPublishing(true);
    try {
      await api.createSpace({ content_type: contentType, price: Number(price), description }, token);
      showToast('Espacio publicado en el catálogo');
      setPrice('');
      setDescription('');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setPublishing(false);
    }
  }

  async function respond(id, status) {
    try {
      await api.respondToRequest(id, status, token);
      showToast(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada');
      loadRequests();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Tu espacio, a tu manera</h1>
          <p>Publica tu tarifa, recibe solicitudes de marcas y decide con quién colaborar.</p>
        </div>

        <div className="dash-grid">
          <div className="panel">
            <h3>Publicar espacio</h3>
            <p className="sub">Así te van a encontrar los anunciantes.</p>
            <div className="field">
              <label>Tipo de contenido</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                {CONTENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Precio (Q)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej. 350" />
            </div>
            <div className="field">
              <label>Descripción breve</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Contenido de moda y lifestyle, audiencia 18-30 años en Guatemala." />
            </div>
            <button className="btn btn-primary btn-block" onClick={publishSpace} disabled={publishing}>
              {publishing ? 'Publicando…' : 'Publicar espacio'}
            </button>
          </div>

          <div className="panel">
            <h3>Solicitudes recibidas</h3>
            <p className="sub">Acepta o rechaza propuestas de marcas.</p>
            {loadingReq && <div className="loading-state">Cargando solicitudes…</div>}
            {!loadingReq && reqError && <div className="empty-state">{reqError}</div>}
            {!loadingReq && !reqError && requests.length === 0 && (
              <div className="empty-state">Aún no tienes solicitudes. En cuanto una marca te contacte, aparecerá aquí.</div>
            )}
            {!loadingReq && !reqError && requests.map((r) => (
              <div className="request-item" key={r.id}>
                <div>
                  <div className="who">{r.brand_name} <span className="mono" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· Q{Number(r.offered_budget)}</span></div>
                  <div className="msg">{r.message || 'Sin mensaje adicional.'}</div>
                </div>
                {r.status === 'pending' && (
                  <div className="request-actions">
                    <button className="icon-btn accept" title="Aceptar" onClick={() => respond(r.id, 'accepted')}>✓</button>
                    <button className="icon-btn reject" title="Rechazar" onClick={() => respond(r.id, 'rejected')}>✕</button>
                  </div>
                )}
                {r.status === 'accepted' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-ghost" onClick={() => setChatRequest(r)}>Ver chat</button>
                    {statusBadge(r.status, r.payment_status)}
                  </div>
                )}
                {r.status !== 'pending' && r.status !== 'accepted' && statusBadge(r.status, r.payment_status)}
              </div>
            ))}
          </div>
        </div>
      </div>
      {chatRequest && (
        <ChatModal
          requestId={chatRequest.id}
          title={chatRequest.brand_name}
          onClose={() => setChatRequest(null)}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
