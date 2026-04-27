import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi.js';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/bookings');
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

  async function remove(id) {
    if (!window.confirm('Remove this booking? The room becomes available for those dates.')) return;
    try {
      await adminApi.delete(`/admin/bookings/${id}`);
      toast.success('Booking removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-slate-400">
            All guest reservations. Delete to cancel a stay and free those nights.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id} className="border-b border-slate-800/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{b.user?.username || '—'}</div>
                    <div className="text-xs text-slate-500">{b.user?.email || ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{b.room?.roomId || '—'}</div>
                    <div className="text-xs capitalize text-slate-500">
                      {b.room?.type} · ${b.room?.price ?? '—'}/night
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{b.dates?.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(b._id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
