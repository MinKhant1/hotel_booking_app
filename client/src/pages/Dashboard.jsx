import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MIN_Y = 2000;
const MAX_Y = 2100;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthLabelUtc(year, month0) {
  return new Date(Date.UTC(year, month0, 1, 12)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Flat list with leading nulls for empty weekday slots, then YYYY-MM-DD strings */
function utcMonthGrid(year, month0) {
  const firstDow = new Date(Date.UTC(year, month0, 1, 12)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0, 12)).getUTCDate();
  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const ymd = `${year}-${String(month0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(ymd);
  }
  return cells;
}

function clampYear(y) {
  return Math.min(MAX_Y, Math.max(MIN_Y, y));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const now = new Date();
  const [viewY, setViewY] = useState(() => clampYear(now.getUTCFullYear()));
  const [viewM, setViewM] = useState(() => now.getUTCMonth());
  const [type, setType] = useState('');
  const [selected, setSelected] = useState(() => new Set());

  const sortedSelected = useMemo(() => [...selected].sort(), [selected]);

  const monthCells = useMemo(() => utcMonthGrid(viewY, viewM), [viewY, viewM]);

  function shiftMonth(delta) {
    let y = viewY;
    let m = viewM + delta;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    setViewY(clampYear(y));
    setViewM(m);
  }

  function toggleDate(ymd) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ymd)) next.delete(ymd);
      else next.add(ymd);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleSearch(e) {
    e.preventDefault();
    if (sortedSelected.length === 0) return;
    const params = new URLSearchParams();
    params.set('dates', sortedSelected.join(','));
    if (type) params.set('type', type);
    navigate(`/rooms?${params.toString()}`);
  }

  const canPrevMonth = viewY > MIN_Y || viewM > 0;
  const canNextMonth = viewY < MAX_Y || viewM < 11;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950">Search available rooms</h1>
      <p className="mt-2 max-w-2xl text-ink-800">
        Choose a <strong>month</strong> (UTC calendar), click one or more <strong>nights</strong> (you can change
        month and keep adding), optionally filter by room type, then see rooms free on{' '}
        <strong>every</strong> selected night. Years {MIN_Y}–{MAX_Y}.
      </p>

      <form onSubmit={handleSearch} className="mt-10 space-y-8">
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sea">Room type</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 px-4 py-2 has-[:checked]:border-sea has-[:checked]:bg-sand-50">
              <input type="radio" name="type" value="" checked={type === ''} onChange={() => setType('')} />
              Any
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 px-4 py-2 has-[:checked]:border-sea has-[:checked]:bg-sand-50">
              <input
                type="radio"
                name="type"
                value="single"
                checked={type === 'single'}
                onChange={() => setType('single')}
              />
              Single
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 px-4 py-2 has-[:checked]:border-sea has-[:checked]:bg-sand-50">
              <input
                type="radio"
                name="type"
                value="double"
                checked={type === 'double'}
                onChange={() => setType('double')}
              />
              Double
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-sea">Dates (UTC)</h2>
              <p className="mt-1 text-sm text-ink-800">
                Navigate months, then click days. Selection carries across months.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ink-950">
                {sortedSelected.length} night{sortedSelected.length === 1 ? '' : 's'} selected
              </p>
              {sortedSelected.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-sand-100 pb-4">
            <button
              type="button"
              disabled={!canPrevMonth}
              onClick={() => shiftMonth(-1)}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium text-ink-900 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-lg font-semibold text-ink-950">{monthLabelUtc(viewY, viewM)}</span>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                Year
                <input
                  type="number"
                  min={MIN_Y}
                  max={MAX_Y}
                  value={viewY}
                  onChange={(e) => setViewY(clampYear(Number(e.target.value) || viewY))}
                  className="w-24 rounded-lg border border-sand-200 px-2 py-1 text-ink-950"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!canNextMonth}
              onClick={() => shiftMonth(1)}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium text-ink-900 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink-600">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((ymd, idx) =>
              ymd ? (
                <button
                  key={ymd}
                  type="button"
                  onClick={() => toggleDate(ymd)}
                  className={`min-h-[2.75rem] rounded-xl border px-1 py-2 text-center text-sm font-medium transition ${
                    selected.has(ymd)
                      ? 'border-sea bg-sea text-white shadow-md shadow-sea/20'
                      : 'border-sand-200 bg-sand-50 text-ink-900 hover:border-sea/40'
                  }`}
                >
                  <span className="text-lg leading-none">{Number(ymd.slice(8))}</span>
                </button>
              ) : (
                <div key={`empty-${idx}`} className="min-h-[2.75rem]" />
              )
            )}
          </div>

          {sortedSelected.length > 0 && (
            <p className="mt-4 text-xs text-ink-700">
              <span className="font-semibold text-ink-900">Selected:</span>{' '}
              {sortedSelected.length <= 12
                ? sortedSelected.join(', ')
                : `${sortedSelected.slice(0, 12).join(', ')} … (+${sortedSelected.length - 12} more)`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={sortedSelected.length === 0}
            className="rounded-xl bg-sea px-8 py-3 font-semibold text-white shadow-lg shadow-sea/25 hover:bg-sea-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Find available rooms
          </button>
          <Link
            to="/rooms"
            className="inline-flex items-center rounded-xl border border-sand-200 bg-white px-6 py-3 font-semibold text-ink-900 hover:bg-sand-100"
          >
            Open room list (needs search)
          </Link>
        </div>
      </form>
    </div>
  );
}
