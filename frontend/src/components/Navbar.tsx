import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-semibold text-slate-900">
        Smart Queue
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link
          to="/organizations"
          className="text-slate-600 hover:text-slate-900"
        >
          Organizations
        </Link>

        {/* Find Best Queue */}
        <Link
          to="/recommendations"
          className="text-slate-600 hover:text-slate-900"
        >
          Find Best Queue
        </Link>

        {/* Ask AI */}
        <Link
          to="/ask"
          className="text-slate-600 hover:text-slate-900"
        >
          Ask AI
        </Link>

        {!user && (
          <>
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-slate-600 hover:text-slate-900"
            >
              Register
            </Link>
          </>
        )}

        {user?.role === "CUSTOMER" && (
          <Link
            to="/dashboard"
            className="text-slate-600 hover:text-slate-900"
          >
            My Dashboard
          </Link>
        )}

        {user?.role === "STAFF" && (
          <Link
            to="/staff/dashboard"
            className="text-slate-600 hover:text-slate-900"
          >
            Staff Dashboard
          </Link>
        )}

        {user && (
          <>
            <NotificationBell />
            <span className="text-slate-400">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}