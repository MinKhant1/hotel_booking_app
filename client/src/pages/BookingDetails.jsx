import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookingDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [ctx, setCtx] = useState(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (location.state?.room && location.state?.dates?.length) {
      const payload = { room: location.state.room, dates: location.state.dates };
      sessionStorage.setItem(`book_${roomId}`, JSON.stringify(payload));
      setCtx(payload);
      setReady(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`book_${roomId}`);
      if (raw) {
        setCtx(JSON.parse(raw));
        setReady(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [location.state, roomId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/${roomId}` } } });
    }
  }, [authLoading, isAuthenticated, navigate, roomId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && ready && (!ctx?.room || !ctx?.dates?.length)) {
      toast.error('Missing booking context. Start from search.');
      navigate('/dashboard');
    }
  }, [authLoading, isAuthenticated, ready, ctx, navigate]);

  async function confirmBooking() {
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', { roomId, dates: ctx.dates });
      setDone(data);
      sessionStorage.removeItem(`book_${roomId}`);
      toast.success('Booking confirmed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-800">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sea border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const room = ctx?.room;
  const dates = ctx?.dates || [];

  if (!room || dates.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-800">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sea border-t-transparent" />
      </div>
    );
  }

  if (done) {
    const r = done.roomId;
    const dateLabels = Array.isArray(done.dates)
      ? done.dates.map((d) => new Date(d).toISOString().slice(0, 10))
      : [];
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-sea/30 bg-white p-8 text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-sea">Confirmed</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">You are booked</h1>
        <p className="mt-4 text-ink-800">
          <span className="font-semibold text-ink-950">{r?.roomId}</span> ({r?.type}) for {dateLabels.join(', ')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/profile"
            className="rounded-xl bg-sea px-6 py-3 font-semibold text-white hover:bg-sea-muted"
          >
            View my bookings
          </Link>
          <Link to="/dashboard" className="rounded-xl border border-sand-200 px-6 py-3 font-semibold hover:bg-sand-50">
            New search
          </Link>
        </div>
      </div>
    );
  }

  const nights = dates.length;
  const total = nights * (room.price || 0);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Booking details</h1>
      <p className="mt-2 text-ink-800">Review your stay before confirming. No payment is collected.</p>

      <div className="mt-8 space-y-4 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4 border-b border-sand-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-sea">Room</p>
            <p className="text-xl font-semibold text-ink-950">{room.roomId}</p>
            <p className="text-sm capitalize text-ink-800">{room.type} · ${room.price} / night</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-sea">Nights</p>
          <p className="mt-1 text-ink-900">{dates.join(', ')}</p>
        </div>
        <div className="flex justify-between border-t border-sand-100 pt-4 text-lg font-semibold text-ink-950">
          <span>Estimated total</span>
          <span>${total}</span>
        </div>
        <p className="text-xs text-ink-800">Display total is informational only; payment is not integrated.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={confirmBooking}
          className="rounded-xl bg-sea px-8 py-3 font-semibold text-white hover:bg-sea-muted disabled:opacity-60"
        >
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </button>
        <Link to="/dashboard" className="rounded-xl border border-sand-200 px-6 py-3 font-semibold hover:bg-sand-50">
          Cancel
        </Link>
      </div>
    </div>
  );
}
