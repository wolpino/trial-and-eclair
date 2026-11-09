import { useAuth } from "../auth/AuthContext";
import { KitchenScene } from "../components/kitchen/KitchenScene";
import { LoginPage } from "./LoginPage";

export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="status-message">Loading…</p>;
  }

  if (!user) {
    return <LoginPage />;
  }

  // The kitchen scene, on wide screens and phones alike (decision 004).
  return <KitchenScene />;
}
