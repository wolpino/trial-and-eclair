import { Navigate, Outlet, useLocation } from "react-router-dom";

import { defaultRouteForUser } from "../auth/access";
import { useAuth } from "../auth/AuthContext";

export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ??
    (user ? defaultRouteForUser(user) : "/");

  if (loading) {
    return <p className="status-message">Checking session…</p>;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
