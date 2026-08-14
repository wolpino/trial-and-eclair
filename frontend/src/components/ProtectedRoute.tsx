import { Navigate, Outlet, useLocation } from "react-router-dom";

import { canStartDeveloperTrial } from "../auth/access";
import { useAuth } from "../auth/AuthContext";
import { StartTrialCallout } from "../components/StartTrialCallout";

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
        {canStartDeveloperTrial(user) ? (
          <StartTrialCallout />
        ) : (
          <p>
            Your developer trial has ended. Paid billing is not available yet.
          </p>
        )}
      </main>
    );
  }

  return <Outlet />;
}
