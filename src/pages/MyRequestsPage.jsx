import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import ChatModal from '../components/ChatModal';
import ReviewControl from '../components/ReviewControl';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function statusBadge(status) {
  if (status === 'rejected') return <span className="badge-rejected">Rechazada</span>;
  return <span className="badge-pending">Pendiente</span>;
}

export default function MyRequestsPage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getSentRequests(token);
      setRequests(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function payNow(requestId) {
    setPayingId(requestId);
    try {
      const { checkout_url } = await api.createCheckout(requestId, token);
      window.location.href = checkout_url;
    } catch (err) {
      showToast(err.message, true);
      setPayingId(null);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Tus solicitudes</h1>
          <p>Sigue el estado de las propuestas que has enviado y paga las que ya fueron aceptadas.</p>
        </div>

        <div className="panel" style={{ maxWidth: 720 }}>
          {loading && <div className="loading-state">Cargando…</div>}
          {!loading && loadError && <div className="empty-state">{loadError}</div>}
          {!loading && !loadError && requests.length === 0 && (
            <div className="empty-state">Aún no has enviado ninguna solicitud. Ve al catálogo para encontrar un espacio.</div>
          )}
          {!loading && !loadError && requests.map((r) => (
            <div className="request-item" key={r.id}>
              <div>
                <div className="who">{r.influencer_name} <span className="mono" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· Q{Number(r.offered_budget)}</span></div>
                <div className="msg">{r.content_type}</div>
              </div>
              {r.status === 'accepted' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn btn-ghost" onClick={() => setChatRequest(r)}>Ver chat</button>
                  <span className="badge-pending">Esperando entrega</span>
                </div>
              )}
              {r.status === 'delivered' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-ghost" onClick={() => setChatRequest(r)}>Ver chat</button>
                    {r.payment_status === 'paid' ? (
                      <>
                        <span className="badge-accepted">Pagado</span>
                        <ReviewControl requestId={r.id} />
                      </>
                    ) : (
                      <button className="btn btn-primary" onClick={() => payNow(r.id)} disabled={payingId === r.id}>
                        {payingId === r.id ? 'Abriendo pago…' : 'Pagar ahora'}
                      </button>
                    )}
                  </div>
                  {r.evidence_url && (
                    <a href={r.evidence_url} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 13 }}>
                      Ver evidencia de entrega
                    </a>
                  )}
                  {r.evidence_note && <div className="msg">{r.evidence_note}</div>}
                </div>
              )}
              {r.status !== 'accepted' && r.status !== 'delivered' && statusBadge(r.status)}
            </div>
          ))}
        </div>
      </div>
      {chatRequest && (
        <ChatModal
          requestId={chatRequest.id}
          title={chatRequest.influencer_name}
          onClose={() => setChatRequest(null)}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
