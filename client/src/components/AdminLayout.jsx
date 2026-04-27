import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const tabClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
  }`;

export default function AdminLayout() {
  const { isAuthenticated, user, logout } = useAdminAuth();
  const brandTo = isAuthenticated ? '/admin/bookings' : '/admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link to={brandTo} className="font-semibold tracking-tight text-white">
              Admin
            </Link>
            {isAuthenticated && (
              <nav className="flex items-center gap-1 border-l border-slate-700 pl-3 sm:pl-4">
                <NavLink to="/admin/bookings" className={tabClass} end>
                  Bookings
                </NavLink>
                <NavLink to="/admin/rooms" className={tabClass}>
                  Rooms
                </NavLink>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <span className="text-sm text-slate-400">{user?.username}</span>
            )}
            <Link to="/" className="text-sm text-slate-400 hover:text-white">
              Site home
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
