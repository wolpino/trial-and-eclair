import { useLocation } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { usePhoneLayout } from "../../lib/usePhoneLayout";

/** True when `/` shows the kitchen scene: signed in, on a wide screen (decision 004). */
export function useKitchenHome(): boolean {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isPhoneOrSideways = usePhoneLayout({ sideways: true });
  return Boolean(user) && pathname === "/" && !isPhoneOrSideways;
}
