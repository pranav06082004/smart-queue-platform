import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import Logo from "./Logo";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors hover:text-indigo ${isActive ? "text-indigo font-semibold" : ""}`;

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="Smart Queue home">
          <Logo />
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-ink/70">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/organizations" className={linkClass}>Organizations</NavLink>
          <NavLink to="/recommendations" className={linkClass}>Find Best Queue</NavLink>
          <NavLink to="/ask" className={linkClass}>Ask AI</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link
                to="/register"
                className="gradient-brand text-white px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}

          {user?.role === "CUSTOMER" && (
            <NavLink to="/dashboard" className={linkClass}>My Dashboard</NavLink>
          )}
          {user?.role === "STAFF" && (
            <NavLink to="/staff/dashboard" className={linkClass}>Staff Dashboard</NavLink>
          )}

          {user && (
            <>
              <NotificationBell />
              <span className="text-ink/40">{user.name}</span>
              <button onClick={logout} className="text-rose-600 hover:underline">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}