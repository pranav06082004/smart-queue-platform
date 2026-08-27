import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  role,
  children,
}: {
  role: "CUSTOMER" | "STAFF";
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        You do not have access to this page.
      </div>
    );
  }

  return <>{children}</>;
}