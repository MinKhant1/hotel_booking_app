import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AdminAuthContext = createContext(null);

const STORAGE_KEY = 'hotel_admin_auth';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const data = JSON.parse(raw);
    return { token: data.token || null, user: data.user || null };
  } catch {
    return { token: null, user: null };
  }
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token: t, user: u } = readStored();
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        const exp = payload.exp * 1000;
        if (Date.now() >= exp) {
          localStorage.removeItem(STORAGE_KEY);
          setTokenState(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setTokenState(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setTokenState(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const setAuth = (t, u) => {
    if (t) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, user: u }));
      setTokenState(t);
      setUser(u || null);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setTokenState(null);
      setUser(null);
    }
  };

  const logout = () => setAuth(null);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      setAuth,
      logout,
    }),
    [user, token, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

/** Admin login uses public endpoint — use default api (no user Bearer). */
export async function adminLoginRequest(username, password) {
  const { data } = await api.post('/admin/auth/login', { username, password });
  return data;
}
