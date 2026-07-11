import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif)(\?\S*)?$/i;
const DRIVE_RE = /(drive\.google\.com|photos\.google\.com|photos\.app\.goo\.gl)/i;

function isImageLink(text) {
  const trimmed = text.trim();
  if (!/^https?:\/\/\S+$/i.test(trimmed)) return false;
  return IMAGE_EXT_RE.test(trimmed) || DRIVE_RE.test(trimmed);
}

function toImageSrc(url) {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  return url;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatModal({ requestId, title, onClose }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [brokenImages, setBrokenImages] = useState(() => new Set());
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getMessages(requestId, token);
      setMessages(data);
    } catch {
      // el próximo refresco automático reintenta
    } finally {
      setLoading(false);
    }
  }, [requestId, token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api.sendMessage(requestId, body, token);
      setDraft('');
      await load();
    } catch {
      // el usuario puede reintentar
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>{title}</h3>
          <button className="chat-close" onClick={onClose} aria-label="Cerrar chat">✕</button>
        </div>

        <div className="chat-messages" ref={listRef}>
          {loading && <div className="loading-state">Cargando mensajes…</div>}
          {!loading && messages.length === 0 && (
            <div className="empty-state">Aún no hay mensajes. Escribe el primero.</div>
          )}
          {!loading && messages.map((m) => {
            const showImage = isImageLink(m.body) && !brokenImages.has(m.id);
            return (
              <div key={m.id} className={`chat-msg${m.sender_id === user.id ? ' own' : ''}`}>
                <div className="chat-msg-meta">{m.sender_name} · {formatTime(m.created_at)}</div>
                {showImage ? (
                  <a href={m.body} target="_blank" rel="noreferrer">
                    <img
                      src={toImageSrc(m.body)}
                      alt="Imagen compartida"
                      className="chat-msg-img"
                      onError={() => setBrokenImages((prev) => new Set(prev).add(m.id))}
                    />
                  </a>
                ) : (
                  <span className="chat-msg-bubble">{m.body}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="chat-input-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje…"
            disabled={sending}
          />
          <button className="btn btn-primary" onClick={send} disabled={sending || !draft.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
