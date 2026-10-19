import { Navigate, Outlet, useLocation } from "react-router-dom";

import { canStartDeveloperTrial } from "../auth/access";
import { useAuth } from "../auth/AuthContext";
import { StartTrialCallout } from "../components/StartTrialCallout";
import { usePhoneLayout } from "../lib/usePhoneLayout";

interface ProtectedRouteProps {
  requireDeveloper?: boolean;
  /** Lets visitors in on a phone (the recipe box's starter cards and guest saves). */
  allowVisitorOnPhone?: boolean;
}

export function ProtectedRoute({
  requireDeveloper = false,
  allowVisitorOnPhone = false,
}: ProtectedRouteProps) {
  const { user, loading, hasDeveloperAccess } = useAuth();
  const location = useLocation();
  const isPhone = usePhoneLayout({ sideways: true });

  if (loading) {
    return <p className="status-message">Checking session…</p>;
  }

  if (!user && allowVisitorOnPhone && isPhone) {
    return <Outlet />;
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
