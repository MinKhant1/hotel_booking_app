import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/user');
      setBookings(data);
    } catch {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not cancel';
      toast.error(msg);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950">Your profile</h1>
      <p className="mt-2 text-ink-800">View and cancel your reservations.</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-950">My bookings</h2>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sea border-t-transparent" />
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <p className="mt-6 rounded-xl border border-sand-200 bg-white px-4 py-6 text-ink-800">
            You have no bookings yet. Search the dashboard and confirm a room to see it here.
          </p>
        )}

        {!loading && bookings.length > 0 && (
          <ul className="mt-6 space-y-4">
            {bookings.map((b) => (
              <li
                key={b._id}
                className="flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl font-semibold text-ink-950">{b.room?.roomId}</p>
                  <p className="text-sm capitalize text-ink-800">
                    {b.room?.type} room · ${b.room?.price}/night
                  </p>
                  <p className="mt-2 text-sm text-ink-900">
                    <span className="font-medium">Dates:</span> {b.dates.join(', ')}
                  </p>
                  {b.createdAt && (
                    <p className="mt-1 text-xs text-ink-800">
                      Booked {new Date(b.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => cancel(b._id)}
                  className="shrink-0 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
                >
                  Cancel booking
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
