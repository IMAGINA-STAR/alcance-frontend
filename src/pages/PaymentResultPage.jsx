import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PaymentResultPage({ outcome }) {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');

  const [status, setStatus] = useState('checking'); // checking | paid | pending
  const [error, setError] = useState('');

  useEffect(() => {
    if (outcome === 'cancelled' || !requestId) {
      setStatus('cancelled');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    async function poll() {
      attempts += 1;
      try {
        const data = await api.getPaymentStatus(requestId, token);
        if (data.status === 'paid') {
          setStatus('paid');
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 1500);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        setError(err.message);
        setStatus('pending');
      }
    }
    poll();
  }, [requestId, token, outcome]);

  return (
    <div>
      <Topbar />
      <div className="container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 60 }}>
        {status === 'checking' && (
          <>
            <h1>Confirmando tu pago…</h1>
            <p style={{ color: 'var(--text-muted)' }}>Esto solo toma unos segundos.</p>
          </>
        )}
        {status === 'paid' && (
          <>
            <h1>¡Pago confirmado! 🎉</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Tu solicitud ya fue pagada. El influencer ha sido notificado.
            </p>
          </>
        )}
        {status === 'pending' && (
          <>
            <h1>Seguimos confirmando tu pago</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {error || 'Puede tardar un poco más en reflejarse. Revisa "Tus solicitudes" en unos minutos.'}
            </p>
          </>
        )}
        {status === 'cancelled' && (
          <>
            <h1>Pago cancelado</h1>
            <p style={{ color: 'var(--text-muted)' }}>No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
          </>
        )}
        <div style={{ marginTop: 24 }}>
          <Link to="/mis-solicitudes"><button className="btn btn-primary">Ver mis solicitudes</button></Link>
        </div>
      </div>
    </div>
  );
}
