import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera la sesión guardada al abrir la app (para no perderla al recargar).
  useEffect(() => {
    const savedToken = localStorage.getItem('alcance_token');
    const savedUser = localStorage.getItem('alcance_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function persistSession(data) {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('alcance_token', data.token);
    localStorage.setItem('alcance_user', JSON.stringify(data.user));
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persistSession(data);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    persistSession(data);
    return data;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('alcance_token');
    localStorage.removeItem('alcance_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
