import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi.js';

const emptyForm = { roomId: '', type: 'single', price: '' };

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [filterType, setFilterType] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  const filteredRooms = useMemo(() => {
    const min = filterMinPrice === '' ? null : Number(filterMinPrice);
    const max = filterMaxPrice === '' ? null : Number(filterMaxPrice);
    const minOk = min === null || !Number.isNaN(min);
    const maxOk = max === null || !Number.isNaN(max);

    return rooms.filter((r) => {
      if (filterType && r.type !== filterType) return false;
      if (minOk && min !== null && r.price < min) return false;
      if (maxOk && max !== null && r.price > max) return false;
      return true;
    });
  }, [rooms, filterType, filterMinPrice, filterMaxPrice]);

  const hasActiveFilters = Boolean(filterType || filterMinPrice || filterMaxPrice);

  function clearFilters() {
    setFilterType('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/rooms');
      setRooms(data);
    } catch {
      toast.error('Could not load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await adminApi.post('/admin/rooms', {
        roomId: form.roomId.trim(),
        type: form.type,
        price: Number(form.price),
      });
      toast.success('Room created');
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  }

  function startEdit(room) {
    setEditingId(room._id);
    setEditForm({
      roomId: room.roomId,
      type: room.type,
      price: String(room.price),
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await adminApi.put(`/admin/rooms/${editingId}`, {
        roomId: editForm.roomId.trim(),
        type: editForm.type,
        price: Number(editForm.price),
      });
      toast.success('Room updated');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this room?')) return;
    try {
      await adminApi.delete(`/admin/rooms/${id}`);
      toast.success('Room deleted');
      if (editingId === id) setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Rooms</h1>
      <p className="mt-1 text-sm text-slate-400">Create, edit, or remove rooms in MongoDB.</p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-medium text-white">Add room</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
          <div>
            <label className="text-xs text-slate-400">roomId</label>
            <input
              required
              value={form.roomId}
              onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              placeholder="e.g. S-21"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="single">single</option>
              <option value="double">double</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">price</label>
            <input
              required
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Create
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-white">Filter rooms</h2>
            <p className="mt-1 text-xs text-slate-400">
              Narrow the table by type and price (USD). Leave fields empty to ignore.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="text-xs text-slate-400">Room type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">All types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Min price ($)</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 80"
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Max price ($)</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 150"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            />
          </div>
        </div>
        {!loading && rooms.length > 0 && (
          <p className="mt-3 text-sm text-slate-400">
            Showing <span className="font-medium text-slate-200">{filteredRooms.length}</span> of{' '}
            <span className="font-medium text-slate-200">{rooms.length}</span> rooms
            {hasActiveFilters ? ' (filtered)' : ''}
          </p>
        )}
      </section>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">roomId</th>
              <th className="px-4 py-3">type</th>
              <th className="px-4 py-3">price</th>
              <th className="px-4 py-3 text-right">actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No rooms
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No rooms match these filters.{' '}
                  <button type="button" onClick={clearFilters} className="text-amber-400 hover:underline">
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredRooms.map((r) => (
                <tr key={r._id} className="border-b border-slate-800/80">
                  {editingId === r._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.roomId}
                          onChange={(e) => setEditForm((f) => ({ ...f, roomId: e.target.value }))}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        >
                          <option value="single">single</option>
                          <option value="double">double</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          value={editForm.price}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => saveEdit()}
                          className="mr-2 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-600 px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-white">{r.roomId}</td>
                      <td className="px-4 py-3 capitalize">{r.type}</td>
                      <td className="px-4 py-3">${r.price}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="mr-2 text-amber-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(r._id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
