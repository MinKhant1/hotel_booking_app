import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-ink-900 text-sand-50' : 'text-ink-800 hover:bg-sand-200'
  }`;

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-xl font-semibold text-ink-950">
            Harbor House
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              Search
            </NavLink>
            <NavLink to="/rooms" className={linkClass}>
              Rooms
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
                <span className="hidden sm:inline text-sm text-ink-800 px-2">
                  {user?.username}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-sand-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-lg bg-sea px-3 py-2 text-sm font-medium text-white hover:bg-sea-muted"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-sand-200 py-6 text-center text-sm text-ink-800">
        Book any dates (search) · No payments · Demo MERN app
      </footer>
    </div>
  );
}
