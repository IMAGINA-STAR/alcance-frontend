import { useState } from 'react';
import Topbar from '../components/Topbar';
import { Toast, useToast } from '../components/Toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordPage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (newPassword.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('La nueva contraseña y la confirmación no coinciden.', true);
      return;
    }

    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword }, token);
      showToast('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Topbar />
      <div className="container">
        <div className="view-header">
          <h1>Cambiar contraseña</h1>
          <p>Actualiza tu contraseña de acceso.</p>
        </div>

        <div className="panel">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
