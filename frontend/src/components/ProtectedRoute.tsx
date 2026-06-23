import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  requireDeveloper?: boolean;
}

export function ProtectedRoute({ requireDeveloper = false }: ProtectedRouteProps) {
  const { user, loading, hasDeveloperAccess } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status-message">Checking session…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireDeveloper && !hasDeveloperAccess) {
    return (
      <main className="page-shell">
        <h1>Developer access required</h1>
        <p>
          Your account needs an active developer subscription or trial. Ask an
          admin to set your role and subscription in Django admin.
        </p>
      </main>
    );
  }

  return <Outlet />;
}
