import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth, adminLoginRequest } from '../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const { setAuth, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/bookings';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from === '/admin' ? '/admin/bookings' : from, { replace: true });
    }
  }, [loading, isAuthenticated, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await adminLoginRequest(username, password);
      setAuth(data.token, data.user);
      toast.success('Signed in as admin');
      navigate('/admin/bookings', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-white">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-400">Use the seeded admin username and password.</p>
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div>
          <label htmlFor="admin-user" className="block text-sm font-medium text-slate-300">
            Username
          </label>
          <input
            id="admin-user"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500/60"
          />
        </div>
        <div>
          <label htmlFor="admin-pass" className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="admin-pass"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500/60"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
