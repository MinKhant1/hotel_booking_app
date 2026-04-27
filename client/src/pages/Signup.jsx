import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { setAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      setAuth(data.token, data.user);
      toast.success('Account created!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Sign up</h1>
      <p className="mt-2 text-ink-800">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-sea hover:underline">
          Log in
        </Link>
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-ink-900">
            Username
          </label>
          <input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2 outline-none ring-sea focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-900">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2 outline-none ring-sea focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-900">
            Password (min 6 characters)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2 outline-none ring-sea focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-sea py-3 font-semibold text-white hover:bg-sea-muted disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
