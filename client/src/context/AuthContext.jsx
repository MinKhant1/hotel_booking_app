import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../api/client.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'hotel_auth';

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

export function AuthProvider({ children }) {
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
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setAuthToken(t);
      setTokenState(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const setAuth = (t, u) => {
    if (t) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, user: u }));
      setAuthToken(t);
      setTokenState(t);
      setUser(u || null);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
