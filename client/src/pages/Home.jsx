import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-sea">Hotel booking</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-950 sm:text-5xl">
          Quiet rooms by the water — pick your dates.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-800">
          Search by date and room type, book one or several nights, and manage your stays from
          your profile. Availability is live from MongoDB — no double bookings.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-sea px-6 py-3 font-semibold text-white shadow-lg shadow-sea/25 hover:bg-sea-muted"
          >
            Search rooms
          </Link>
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-sand-200 bg-white px-6 py-3 font-semibold text-ink-900 hover:bg-sand-100"
            >
              Create account
            </Link>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-sand-200 bg-white p-8 shadow-xl shadow-ink-900/5">
        <h2 className="font-display text-xl font-semibold text-ink-950">This month</h2>
        <ul className="mt-4 space-y-3 text-ink-800">
          <li className="flex justify-between border-b border-sand-100 pb-2">
            <span>Single rooms</span>
            <span className="font-medium text-ink-950">20</span>
          </li>
          <li className="flex justify-between border-b border-sand-100 pb-2">
            <span>Double rooms</span>
            <span className="font-medium text-ink-950">10</span>
          </li>
          <li className="flex justify-between pt-1">
            <span>Booking window</span>
            <span className="font-medium text-sea">Flexible dates</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
