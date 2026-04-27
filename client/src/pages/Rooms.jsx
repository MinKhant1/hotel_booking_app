import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const datesParam = searchParams.get('dates') || searchParams.get('date');
  const typeParam = searchParams.get('type') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (searchParams.get('dates')) p.set('dates', searchParams.get('dates'));
    else if (searchParams.get('date')) p.set('date', searchParams.get('date'));
    if (typeParam) p.set('type', typeParam);
    return p.toString();
  }, [searchParams, typeParam]);

  useEffect(() => {
    if (!datesParam) {
      setPayload(null);
      setError('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/rooms/available?${queryString}`);
        if (!cancelled) setPayload(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not load rooms';
        if (!cancelled) {
          setError(msg);
          setPayload(null);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [datesParam, queryString]);

  function goBook(room) {
    if (!isAuthenticated) {
      sessionStorage.setItem(
        `book_${room._id}`,
        JSON.stringify({ room, dates: payload?.dates || [] })
      );
      toast.error('Please log in to book');
      navigate('/login', { state: { from: { pathname: `/book/${room._id}` } } });
      return;
    }
    navigate(`/book/${room._id}`, {
      state: { dates: payload?.dates || [], room },
    });
  }

  if (!datesParam) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-300 bg-white/60 p-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Room listings</h1>
        <p className="mt-3 text-ink-800">
          Start from the dashboard and pick one or more nights. You will only see rooms that are available for
          every night you select.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-sea px-6 py-3 font-semibold text-white hover:bg-sea-muted"
        >
          Go to search
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-950">Available rooms</h1>
          <p className="mt-2 text-ink-800">
            {typeParam ? (
              <span className="capitalize">{typeParam}</span>
            ) : (
              'All types'
            )}
            {' · '}
            {payload?.dates?.join(', ') || datesParam}
          </p>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-sea hover:underline">
          Change search
        </Link>
      </div>

      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-sea border-t-transparent" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">{error}</div>
      )}

      {!loading && payload && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payload.rooms.length === 0 ? (
            <p className="col-span-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-6 text-center text-ink-800">
              No rooms match your filters for those nights. Try different dates or room type.
            </p>
          ) : (
            payload.rooms.map((room) => (
              <article
                key={room._id}
                className="flex flex-col rounded-2xl border border-sand-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sea">{room.type} room</p>
                    <h2 className="font-display text-xl font-semibold text-ink-950">{room.roomId}</h2>
                  </div>
                  <p className="text-lg font-semibold text-ink-950">${room.price}</p>
                </div>
                <p className="mt-2 flex-1 text-sm text-ink-800">Per night</p>
                <button
                  type="button"
                  onClick={() => goBook(room)}
                  className="mt-4 w-full rounded-xl bg-ink-900 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
                >
                  Book this room
                </button>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
