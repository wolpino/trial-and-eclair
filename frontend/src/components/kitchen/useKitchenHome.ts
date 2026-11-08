import { useLocation } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

/**
 * True when `/` shows the kitchen scene: signed in, on any screen. Phones get
 * the simpler tall crop (decision 004).
 */
export function useKitchenHome(): boolean {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return Boolean(user) && pathname === "/";
}
