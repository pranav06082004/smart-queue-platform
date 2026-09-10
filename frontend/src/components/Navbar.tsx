import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-indigo">
          <span className="relative inline-flex w-2.5 h-2.5">
            <span className="live-pulse absolute inset-0" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-teal" />
          </span>
          Smart Queue
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-ink/70">
          <Link to="/organizations" className="hover:text-indigo transition-colors">Organizations</Link>
          <Link to="/recommendations" className="hover:text-indigo transition-colors">Find Best Queue</Link>
          <Link to="/ask" className="hover:text-indigo transition-colors">Ask AI</Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-indigo transition-colors">Login</Link>
              <Link
                to="/register"
                className="gradient-brand text-white px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}

          {user?.role === "CUSTOMER" && (
            <Link to="/dashboard" className="hover:text-indigo transition-colors">My Dashboard</Link>
          )}
          {user?.role === "STAFF" && (
            <Link to="/staff/dashboard" className="hover:text-indigo transition-colors">Staff Dashboard</Link>
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