import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(!!localStorage.getItem('sph_token'));
  useEffect(() => { if (!localStorage.getItem('sph_token')) return; api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('sph_token')).finally(() => setLoading(false)); }, []);
  const accept = (r) => { localStorage.setItem('sph_token', r.data.token); setUser(r.data.user); return r.data.user; };
  const login = (body) => api.post('/auth/login', body).then(accept);
  const register = (body) => api.post('/auth/register', body).then(accept);
  const logout = async () => { try { await api.post('/auth/logout'); } catch {} localStorage.removeItem('sph_token'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
