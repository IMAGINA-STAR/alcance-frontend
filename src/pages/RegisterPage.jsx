import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const CATEGORIES = ['Moda', 'Comida', 'Fitness', 'Belleza', 'Lifestyle'];
const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook'];
const SOCIAL_PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('anunciante');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // campos específicos de influencer
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [followers, setFollowers] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [handle, setHandle] = useState('');

  // campos específicos de anunciante
  const [brandName, setBrandName] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile =
        role === 'influencer'
          ? { category, followers: Number(followers) || 0 }
          : { brand_name: brandName || name };

      const { user, token } = await register({ name, email, password, role, profile });

      if (role === 'influencer' && handle.trim()) {
        try {
          await api.upsertSocialAccount(
            { platform, handle: handle.trim(), followers_count: Number(followers) || 0 },
            token
          );
        } catch {
          // No bloquea el registro; puede agregarla después desde el dashboard.
        }
      }

      navigate(user.role === 'influencer' ? '/dashboard' : '/catalogo');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Crea tu cuenta en Alcance</h1>
        <p className="sub">Elige cómo quieres usar la plataforma.</p>

        <div className="role-toggle">
          <button type="button" className={role === 'anunciante' ? 'active' : ''} onClick={() => setRole('anunciante')}>
            Soy anunciante
          </button>
          <button type="button" className={role === 'influencer' ? 'active' : ''} onClick={() => setRole('influencer')}>
            Soy influencer
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre completo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {role === 'influencer' ? (
            <>
              <div className="field">
                <label>Categoría</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Seguidores</label>
                <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Ej. 15000" />
              </div>
              <div className="field">
                <label>Red social principal (opcional)</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{SOCIAL_PLATFORM_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Usuario / handle</label>
                <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@tuusuario" />
              </div>
            </>
          ) : (
            <div className="field">
              <label>Nombre de tu marca</label>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ej. Café Rústico" />
            </div>
          )}

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <span>
              He leído y acepto los{' '}
              <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
              {' '}y el{' '}
              <a href="/privacidad" target="_blank" rel="noopener noreferrer">Aviso de Privacidad</a>
            </span>
          </label>

          <button className="btn btn-primary btn-block" disabled={loading || !acceptedTerms}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login"><button type="button">Inicia sesión</button></Link>
        </div>
      </div>
    </div>
  );
}
