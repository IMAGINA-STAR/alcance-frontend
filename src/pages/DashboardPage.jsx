import { useState, useEffect, useCallback, useRef } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import ChatModal from '../components/ChatModal';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const CONTENT_TYPES = ['Historia de Instagram (24h)', 'Post en feed', 'Reel', 'Combo (Historia + Post)'];

const CLOUDINARY_CLOUD_NAME = 'ed5e2nea';
const CLOUDINARY_UPLOAD_PRESET = 'alcance_fotos';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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

  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

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

  useEffect(() => {
    if (!token) return;
    api.getInfluencerProfile(token)
      .then((profile) => setPhotoUrl(profile.photo_url || ''))
      .catch(() => {});
  }, [token]);

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

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Tu espacio, a tu manera</h1>
          <p>Publica tu tarifa, recibe solicitudes de marcas y decide con quién colaborar.</p>
        </div>

        <div className="dash-grid">
          <div className="panel-stack">
            <div className="panel">
              <h3>Foto de perfil</h3>
              <p className="sub">Sube una foto tuya desde tu computadora o celular.</p>
              <div className="profile-photo-row">
                {photoUrl ? (
                  <img className="avatar avatar-img profile-photo-preview" src={photoUrl} alt="Tu foto de perfil" />
                ) : (
                  <div className="avatar profile-photo-preview" style={{ background: 'var(--teal-700)' }}>?</div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? 'Subiendo…' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>
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
              <button className="btn btn-primary btn-block" onClick={publishSpace} disabled={publishing}>
                {publishing ? 'Publicando…' : 'Publicar espacio'}
              </button>
            </div>
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
