import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminPayoutsPage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [references, setReferences] = useState({});
  const [payingId, setPayingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getAdminPayouts(token);
      setPayouts(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function markPaid(transactionId) {
    setPayingId(transactionId);
    try {
      await api.markPayoutPaid(transactionId, { payout_reference: references[transactionId] || undefined }, token);
      showToast('Pago marcado como pagado');
      load();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Pagos pendientes a influencers</h1>
          <p>Colaboraciones ya cobradas al anunciante, listas para pagarle al influencer.</p>
        </div>

        <div className="panel">
          {loading && <div className="loading-state">Cargando…</div>}
          {!loading && loadError && <div className="empty-state">{loadError}</div>}
          {!loading && !loadError && payouts.length === 0 && (
            <div className="empty-state">No hay pagos pendientes por el momento.</div>
          )}
          {!loading && !loadError && payouts.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Influencer</th>
                    <th>Monto a pagar</th>
                    <th>Datos bancarios</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.transaction_id}>
                      <td>
                        <div className="who">{p.influencer_name}</div>
                        <div className="msg">{p.influencer_email}</div>
                      </td>
                      <td className="mono">Q{Number(p.influencer_amount).toFixed(2)}</td>
                      <td>
                        {p.bank_name || p.bank_account_number ? (
                          <>
                            <div>{p.bank_name || 'Sin banco registrado'}</div>
                            <div className="msg">{p.bank_account_number || 'Sin número de cuenta'}</div>
                          </>
                        ) : (
                          <span className="msg">Aún no registró sus datos bancarios.</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="payout-ref-input"
                          placeholder="Referencia (opcional)"
                          value={references[p.transaction_id] || ''}
                          onChange={(e) => setReferences((r) => ({ ...r, [p.transaction_id]: e.target.value }))}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => markPaid(p.transaction_id)}
                          disabled={payingId === p.transaction_id}
                        >
                          {payingId === p.transaction_id ? 'Guardando…' : 'Marcar como pagado'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
