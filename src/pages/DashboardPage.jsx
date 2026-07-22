import { useState, useEffect, useCallback, useRef } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import ChatModal from '../components/ChatModal';
import ReviewControl from '../components/ReviewControl';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

// Force redeploy: Vercel tenía "Saltar despliegues" activo y no había desplegado b381c8e.

const CONTENT_TYPES = ['Historia de Instagram (24h)', 'Post en feed', 'Reel', 'Combo (Historia + Post)'];

const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook'];
const SOCIAL_PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook' };

const CLOUDINARY_CLOUD_NAME = 'ed5e2nea';
const CLOUDINARY_UPLOAD_PRESET = 'alcance_fotos';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

function statusBadge(status, paymentStatus) {
  if (status === 'accepted') return <span className="badge-accepted">Aceptada</span>;
  if (status === 'delivered') {
    return paymentStatus === 'paid'
      ? <span className="badge-accepted">Pagada</span>
      : <span className="badge-pending">Entregada</span>;
  }
  if (status === 'rejected') return <span className="badge-rejected">Rechazada</span>;
  return null;
}

function payoutBadge(payoutStatus, transactionStatus) {
  if (payoutStatus === 'pagado') return <span className="badge-accepted">Pagado</span>;
  if (transactionStatus !== 'paid') return <span className="badge-unpaid">Sin pagar</span>;
  return <span className="badge-pending">Pendiente</span>;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { toast, showToast } = useToast();
  const firstName = user?.name?.split(' ')[0] || '';

  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const [socialAccounts, setSocialAccounts] = useState({}); // { [platform]: {id, handle, followers_count} }
  const [socialForms, setSocialForms] = useState({});        // { [platform]: {handle, followers_count} }
  const [savingSocial, setSavingSocial] = useState(null);    // platform en guardado/borrado, o null

  const [earnings, setEarnings] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [earningsSlow, setEarningsSlow] = useState(false);
  const [earningsError, setEarningsError] = useState('');

  const [requests, setRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [reqError, setReqError] = useState('');
  const [chatRequest, setChatRequest] = useState(null);

  const [deliverForms, setDeliverForms] = useState({}); // { [requestId]: { url, note } }
  const [deliveringId, setDeliveringId] = useState(null);

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

  useEffect(() => {
    if (!token) return;
    api.getInfluencerProfile(token)
      .then((profile) => {
        setPhotoUrl(profile.photo_url || '');
        setBankName(profile.bank_name || '');
        setBankAccountNumber(profile.bank_account_number || '');

        const byPlatform = {};
        (profile.social_accounts || []).forEach((a) => { byPlatform[a.platform] = a; });
        setSocialAccounts(byPlatform);
        setSocialForms(
          Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [
            p, { handle: byPlatform[p]?.handle || '', followers_count: byPlatform[p]?.followers_count ?? '' },
          ]))
        );
      })
      .catch(() => {});
  }, [token]);

  const loadEarnings = useCallback(async () => {
    setLoadingEarnings(true);
    setEarningsSlow(false);
    setEarningsError('');
    try {
      const data = await api.getEarnings(token, { timeoutMs: 8000 });
      setEarnings(data);
    } catch (err) {
      if (err.name !== 'TimeoutError') {
        setEarningsError(err.message);
        return;
      }
      // El backend gratuito se "duerme" tras inactividad; el primer request
      // tras despertar puede tardar bastante, así que reintentamos con más margen.
      setEarningsSlow(true);
      try {
        const data = await api.getEarnings(token, { timeoutMs: 25000 });
        setEarnings(data);
      } catch (err2) {
        setEarningsError(
          err2.name === 'TimeoutError'
            ? 'El servidor está tardando más de lo normal. Intenta recargar la página en un momento.'
            : err2.message
        );
      }
    } finally {
      setLoadingEarnings(false);
      setEarningsSlow(false);
    }
  }, [token]);

  useEffect(() => { loadEarnings(); }, [loadEarnings]);

  async function saveBankInfo() {
    setSavingBank(true);
    try {
      await api.updateBankInfo({ bank_name: bankName, bank_account_number: bankAccountNumber }, token);
      showToast('Datos bancarios guardados');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSavingBank(false);
    }
  }

  function updateSocialForm(platform, field, value) {
    setSocialForms((prev) => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
  }

  async function saveSocialAccount(platform) {
    const form = socialForms[platform] || {};
    if (!form.handle?.trim()) {
      showToast('Ingresa tu usuario para guardar esta red', true);
      return;
    }
    setSavingSocial(platform);
    try {
      const saved = await api.upsertSocialAccount(
        { platform, handle: form.handle.trim(), followers_count: Number(form.followers_count) || 0 },
        token
      );
      setSocialAccounts((prev) => ({ ...prev, [platform]: saved }));
      showToast(`${SOCIAL_PLATFORM_LABELS[platform]} guardado`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSavingSocial(null);
    }
  }

  async function removeSocialAccount(platform) {
    const account = socialAccounts[platform];
    if (!account?.id) return;
    setSavingSocial(platform);
    try {
      await api.deleteSocialAccount(account.id, token);
      setSocialAccounts((prev) => { const next = { ...prev }; delete next[platform]; return next; });
      setSocialForms((prev) => ({ ...prev, [platform]: { handle: '', followers_count: '' } }));
      showToast(`${SOCIAL_PLATFORM_LABELS[platform]} eliminado`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSavingSocial(null);
    }
  }

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

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Selecciona un archivo de imagen válido', true);
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || 'No se pudo subir la imagen a Cloudinary.');
      }

      await api.updateInfluencerProfile({ photo_url: uploadData.secure_url }, token);
      setPhotoUrl(uploadData.secure_url);
      showToast('Foto de perfil actualizada');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploadingPhoto(false);
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

  function updateDeliverForm(id, field, value) {
    setDeliverForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function markDelivered(id) {
    const form = deliverForms[id] || {};
    if (!form.url?.trim()) {
      showToast('Pega el link de la publicación', true);
      return;
    }
    setDeliveringId(id);
    try {
      await api.markDelivered(id, { evidence_url: form.url.trim(), evidence_note: form.note?.trim() || undefined }, token);
      showToast('Solicitud marcada como entregada');
      setDeliverForms((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadRequests();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setDeliveringId(null);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="dash-hero">
          <div className="dash-hero-decor" aria-hidden="true"></div>
          <div className="dash-hero-top">
            <span className="dash-hero-brand">Alcance</span>
            <div className="avatar-ring">
              {photoUrl ? (
                <img className="avatar avatar-img avatar-hero" src={photoUrl} alt="" />
              ) : (
                <div className="avatar avatar-hero" style={{ background: 'var(--magenta)' }}>
                  {firstName ? firstName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>
          <h1 className="dash-hero-greeting">
            Hola {firstName || 'ahí'},<br />tu espacio te espera.
          </h1>
          <p className="dash-hero-sub">
            {loadingEarnings
              ? earningsSlow
                ? 'El servidor está despertando, esto puede tardar unos segundos…'
                : 'Cargando tu saldo…'
              : earningsError
              ? 'Te pagamos cada lunes.'
              : `Q${Number(earnings?.total_pendiente || 0).toFixed(2)} pendientes · te pagamos cada lunes`}
          </p>
        </div>

        <div className="dash-grid">
          <div className="panel-stack">
            <div className="panel panel-photo">
              <h3>Foto de perfil</h3>
              <p className="sub">Sube una foto tuya desde tu computadora o celular.</p>
              <div className="profile-photo-row">
                <div className="avatar-ring">
                  {photoUrl ? (
                    <img className="avatar avatar-img avatar-lg" src={photoUrl} alt="Tu foto de perfil" />
                  ) : (
                    <div className="avatar avatar-lg" style={{ background: 'var(--teal-700)' }}>?</div>
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn-photo"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? 'Subiendo…' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>
            </div>

            <div className="panel">
              <h3>Redes sociales</h3>
              <p className="sub">Agrega tus redes para que las marcas vean dónde encontrarte.</p>
              {SOCIAL_PLATFORMS.map((p) => (
                <div className="social-row" key={p}>
                  <span className={`badge-social badge-social-${p}`}>{SOCIAL_PLATFORM_LABELS[p]}</span>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={socialForms[p]?.handle || ''}
                    onChange={(e) => updateSocialForm(p, 'handle', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Seguidores"
                    value={socialForms[p]?.followers_count ?? ''}
                    onChange={(e) => updateSocialForm(p, 'followers_count', e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => saveSocialAccount(p)} disabled={savingSocial === p}>
                    {savingSocial === p ? '…' : socialAccounts[p] ? 'Actualizar' : 'Agregar'}
                  </button>
                  {socialAccounts[p] && (
                    <button
                      className="icon-btn reject"
                      title="Eliminar"
                      onClick={() => removeSocialAccount(p)}
                      disabled={savingSocial === p}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

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
              <button className="btn-publish" onClick={publishSpace} disabled={publishing}>
                {publishing ? 'Publicando…' : 'Publicar espacio'}
              </button>
            </div>

            <div className="panel">
              <h3>Datos bancarios</h3>
              <p className="sub">Los usamos para poder pagarte cuando cobres una colaboración.</p>
              <div className="field">
                <label>Nombre del banco</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Ej. Banco Industrial" />
              </div>
              <div className="field">
                <label>Número de cuenta</label>
                <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="Ej. 123456789" />
              </div>
              <button className="btn btn-primary btn-block" onClick={saveBankInfo} disabled={savingBank}>
                {savingBank ? 'Guardando…' : 'Guardar datos bancarios'}
              </button>
            </div>
          </div>

          <div className="panel-stack">
            <div className="panel">
              <h3>Mis ganancias</h3>
              <p className="sub">Lo que te deben y lo que ya te han pagado por tus colaboraciones.</p>
              {loadingEarnings && (
                <div className="loading-state">
                  {earningsSlow ? 'El servidor está despertando, esto puede tardar unos segundos…' : 'Cargando…'}
                </div>
              )}
              {!loadingEarnings && earningsError && <div className="empty-state">{earningsError}</div>}
              {!loadingEarnings && !earningsError && earnings && (
                <>
                  <div className="earnings-summary">
                    <div className="earnings-card earnings-card-paid">
                      <span className="earnings-card-label">Pagado históricamente</span>
                      <span className="earnings-card-value">Q{Number(earnings.total_pagado).toFixed(2)}</span>
                      <div className="earnings-card-divider"></div>
                      <span className="earnings-card-foot">✓ Ganancia confirmada</span>
                    </div>
                    <div className="earnings-card earnings-card-pending">
                      <span className="earnings-card-label">Pendiente</span>
                      <span className="earnings-card-value">Q{Number(earnings.total_pendiente).toFixed(2)}</span>
                      <span className="earnings-card-foot">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        Lunes
                      </span>
                    </div>
                  </div>
                  {earnings.transactions.length === 0 ? (
                    <div className="empty-state">Aún no tienes transacciones.</div>
                  ) : (
                    earnings.transactions.map((t) => (
                      <div className="request-item" key={t.id}>
                        <div>
                          <div className="who">Q{Number(t.influencer_amount).toFixed(2)}</div>
                          <div className="msg">{new Date(t.created_at).toLocaleDateString('es-GT')}</div>
                        </div>
                        {payoutBadge(t.payout_status, t.transaction_status)}
                      </div>
                    ))
                  )}
                </>
              )}
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
                    <div className="deliver-form" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn btn-ghost" onClick={() => setChatRequest(r)}>Ver chat</button>
                        {statusBadge(r.status, r.payment_status)}
                      </div>
                      <input
                        type="text"
                        placeholder="Link de la publicación"
                        value={deliverForms[r.id]?.url || ''}
                        onChange={(e) => updateDeliverForm(r.id, 'url', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Nota (opcional)"
                        value={deliverForms[r.id]?.note || ''}
                        onChange={(e) => updateDeliverForm(r.id, 'note', e.target.value)}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => markDelivered(r.id)}
                        disabled={deliveringId === r.id}
                      >
                        {deliveringId === r.id ? 'Guardando…' : 'Marcar como entregado'}
                      </button>
                    </div>
                  )}
                  {r.status === 'delivered' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn btn-ghost" onClick={() => setChatRequest(r)}>Ver chat</button>
                      {statusBadge(r.status, r.payment_status)}
                      {r.payment_status === 'paid' && <ReviewControl requestId={r.id} />}
                    </div>
                  )}
                  {r.status !== 'pending' && r.status !== 'accepted' && r.status !== 'delivered' && statusBadge(r.status, r.payment_status)}
                </div>
              ))}
            </div>
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
