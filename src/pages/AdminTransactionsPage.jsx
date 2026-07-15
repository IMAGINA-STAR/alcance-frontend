import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function businessStatusBadge(transactionStatus, payoutStatus) {
  if (transactionStatus !== 'paid') return <span className="badge-unpaid">Sin pagar</span>;
  if (payoutStatus === 'pagado') return <span className="badge-accepted">Completada</span>;
  return <span className="badge-pending">Pendiente</span>;
}

export default function AdminTransactionsPage() {
  const { token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getAdminTransactions(token);
      setSummary(data.summary);
      setTransactions(data.transactions);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Transacciones de la plataforma</h1>
          <p>Visibilidad completa del negocio: todas las transacciones, sin importar su estado.</p>
        </div>

        {loading && <div className="loading-state">Cargando…</div>}
        {!loading && loadError && <div className="empty-state">{loadError}</div>}

        {!loading && !loadError && summary && (
          <div className="admin-summary-grid">
            <div className="admin-summary-tile admin-summary-tile-commission">
              <span className="admin-summary-label">Comisión ganada por IMAGINA</span>
              <span className="admin-summary-value">Q{Number(summary.total_commission).toFixed(2)}</span>
            </div>
            <div className="admin-summary-tile admin-summary-tile-processed">
              <span className="admin-summary-label">Monto total procesado</span>
              <span className="admin-summary-value">Q{Number(summary.total_processed).toFixed(2)}</span>
            </div>
            <div className="admin-summary-tile admin-summary-tile-count admin-summary-tile-count-completed">
              <span className="admin-summary-label">Completadas</span>
              <span className="admin-summary-value">{summary.completadas_count}</span>
            </div>
            <div className="admin-summary-tile admin-summary-tile-count admin-summary-tile-count-pending">
              <span className="admin-summary-label">Pendientes</span>
              <span className="admin-summary-value">{summary.pendientes_count}</span>
            </div>
            <div className="admin-summary-tile admin-summary-tile-count admin-summary-tile-count-unpaid">
              <span className="admin-summary-label">Sin pagar</span>
              <span className="admin-summary-value">{summary.sin_pagar_count}</span>
            </div>
          </div>
        )}

        <div className="panel">
          {!loading && !loadError && transactions.length === 0 && (
            <div className="empty-state">Aún no hay transacciones registradas.</div>
          )}
          {!loading && !loadError && transactions.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Anunciante</th>
                    <th>Influencer</th>
                    <th>Monto</th>
                    <th>Comisión</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.transaction_id}>
                      <td>
                        <div className="who">{t.advertiser_name}</div>
                        <div className="msg">{t.advertiser_email}</div>
                      </td>
                      <td>
                        <div className="who">{t.influencer_name}</div>
                        <div className="msg">{t.influencer_email}</div>
                      </td>
                      <td className="mono">Q{Number(t.amount).toFixed(2)}</td>
                      <td className="mono">
                        Q{Number(t.commission_amount).toFixed(2)}
                        <div className="msg">{Number(t.commission_rate).toFixed(0)}%</div>
                      </td>
                      <td>{businessStatusBadge(t.transaction_status, t.payout_status)}</td>
                      <td>{new Date(t.created_at).toLocaleDateString('es-GT')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
