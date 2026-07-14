import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Stars({ value }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

// Botón/formulario para calificar una solicitud ya pagada, o la calificación
// ya dada si el usuario actual ya calificó esta solicitud.
export default function ReviewControl({ requestId }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const reviews = await api.getReviews(requestId, token);
      setMyReview(reviews.find((rv) => rv.reviewer_id === user.id) || null);
    } catch {
      setMyReview(null);
    } finally {
      setLoading(false);
    }
  }, [requestId, token, user.id]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const review = await api.createReview(requestId, { rating, comment: comment.trim() || undefined }, token);
      setMyReview(review);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  if (myReview) {
    return (
      <span className="review-done">
        <Stars value={myReview.rating} /> · Ya calificado
      </span>
    );
  }

  if (!showForm) {
    return <button className="btn btn-ghost" onClick={() => setShowForm(true)}>Calificar</button>;
  }

  return (
    <div className="review-form">
      <div className="review-star-picker">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n <= rating ? 'star on' : 'star'}
            onClick={() => setRating(n)}
            role="button"
            tabIndex={0}
            aria-label={`${n} estrellas`}
          >★</span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario opcional"
      />
      {error && <div className="review-error">{error}</div>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar calificación'}
        </button>
      </div>
    </div>
  );
}
