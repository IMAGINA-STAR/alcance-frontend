import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Moda', 'Comida', 'Fitness', 'Belleza', 'Lifestyle'];
const COLORS = ['#FF6B4A', '#12302B', '#FFC857', '#1D4A42', '#D95F8A', '#3C7A6E'];

function initials(name) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
}
function colorFor(id) {
  return COLORS[id % COLORS.length];
}
function engagementLevel(rate) {
  if (!rate) return 1;
  if (rate >= 5) return 4;
  if (rate >= 3.5) return 3;
  if (rate >= 2) return 2;
  return 1;
}
function SignalBars({ level }) {
  return (
    <div className="signal">
      {[1, 2, 3, 4].map((i) => <span key={i} className={i <= level ? 'on' : ''} />)}
    </div>
  );
}

export default function CatalogPage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [checkedCats, setCheckedCats] = useState(CATEGORIES);
  const [minFollowers, setMinFollowers] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);

  const [modalSpace, setModalSpace] = useState(null);
  const [reqMsg, setReqMsg] = useState('');
  const [reqBudget, setReqBudget] = useState('');
  const [sending, setSending] = useState(false);

  const loadSpaces = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getSpaces({ minFollowers, maxPrice });
      setSpaces(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [minFollowers, maxPrice]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);

  function toggleCategory(cat) {
    setCheckedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }

  const filtered = spaces.filter((s) => checkedCats.includes(s.category));

  function openModal(space) {
    setModalSpace(space);
    setReqMsg('');
    setReqBudget(space.price);
  }

  async function sendRequest() {
    setSending(true);
    try {
      await api.sendRequest(
        { space_id: modalSpace.id, message: reqMsg, offered_budget: Number(reqBudget) },
        token
      );
      setModalSpace(null);
      showToast(`Solicitud enviada a ${modalSpace.influencer_name}`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Encuentra el influencer ideal para tu marca</h1>
          <p>Filtra por categoría, alcance y presupuesto — contacta y contrata directo desde la plataforma.</p>
        </div>

        <div className="layout">
          <aside className="filters">
            <h3>Categoría</h3>
            <div className="filter-group">
              {CATEGORIES.map((c) => (
                <label key={c}>
                  <input type="checkbox" checked={checkedCats.includes(c)} onChange={() => toggleCategory(c)} />
                  {c}
                </label>
              ))}
            </div>
            <h3>Alcance mínimo</h3>
            <div className="filter-group">
              <input type="range" min="0" max="60000" step="1000" value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))} />
              <div className="range-val">{minFollowers.toLocaleString()}+ seguidores</div>
            </div>
            <h3>Presupuesto máximo</h3>
            <div className="filter-group">
              <input type="range" min="0" max="3000" step="50" value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))} />
              <div className="range-val">Hasta Q{maxPrice}</div>
            </div>
          </aside>

          <main>
            {loading && <div className="loading-state">Cargando catálogo…</div>}
            {!loading && loadError && (
              <div className="empty-state">
                No se pudo conectar con el servidor. Verifica que el backend esté corriendo en {import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}.
              </div>
            )}
            {!loading && !loadError && (
              <div className="grid">
                {filtered.length === 0 && (
                  <div className="empty-state">No hay espacios que coincidan con estos filtros.</div>
                )}
                {filtered.map((s) => (
                  <div className="card" key={s.id}>
                    <div className="card-top">
                      <div className="avatar" style={{ background: colorFor(s.influencer_id) }}>
                        {initials(s.influencer_name)}
                      </div>
                      <div>
                        <div className="card-name">{s.influencer_name}</div>
                        <span className="card-tag">{s.category}</span>
                      </div>
                    </div>
                    <div className="stats-row">
                      <span>Seguidores<br /><strong>{Number(s.followers).toLocaleString()}</strong></span>
                      <span style={{ textAlign: 'right' }}>Alcance<br /><SignalBars level={engagementLevel(s.engagement_rate)} /></span>
                    </div>
                    <div className="card-desc">{s.description}</div>
                    <div className="card-bottom">
                      <div className="price">Q{Number(s.price)}<span> / {s.content_type.toLowerCase()}</span></div>
                      <button className="btn btn-primary" onClick={() => openModal(s)}>Solicitar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {modalSpace && (
        <div className="overlay" onClick={() => setModalSpace(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Solicitar espacio a {modalSpace.influencer_name}</h3>
            <p className="sub">{modalSpace.content_type} · Q{Number(modalSpace.price)}</p>
            <div className="field">
              <label>Mensaje para el influencer</label>
              <textarea value={reqMsg} onChange={(e) => setReqMsg(e.target.value)}
                placeholder="Contale qué producto quieres promocionar y cuándo." />
            </div>
            <div className="field">
              <label>Presupuesto ofrecido (Q)</label>
              <input type="number" value={reqBudget} onChange={(e) => setReqBudget(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModalSpace(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={sendRequest} disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
