import { Link } from "react-router-dom";

import { canStartDeveloperTrial } from "../auth/access";
import { useAuth } from "../auth/AuthContext";
import { StartTrialCallout } from "../components/StartTrialCallout";
import { LoginPage } from "./LoginPage";

export function HomePage() {
  const { user, loading, hasDeveloperAccess } = useAuth();

  if (loading) {
    return <p className="status-message">Loading…</p>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <main className="home-page">
      <h1>Trial and Eclair</h1>
      <p>Recipe development and collection — not a blog.</p>
      <p>
        Signed in as <strong>{user.username}</strong>
        {user.role === "developer" ? " (developer)" : " (home cook)"}.
      </p>
      <p className="home-actions">
        {hasDeveloperAccess ? (
          <>
            <Link to="/developer">Cork board</Link> ·{" "}
            <Link to="/developer/lab">Lab</Link> ·{" "}
            <Link to="/developer/cookbooks">Cookbooks</Link>
            {" · "}
          </>
        ) : null}
        <Link to="/recipe-box">Recipe box</Link> · <Link to="/references">References</Link>
      </p>
      {canStartDeveloperTrial(user) ? <StartTrialCallout /> : null}
      {!hasDeveloperAccess && user.role === "developer" && !canStartDeveloperTrial(user) ? (
        <p className="home-note">
          Your developer trial has ended. Paid billing is not available yet.
        </p>
      ) : null}
      <p className="home-note">
        <Link to="/r/example">Example public recipe</Link> (404 until you publish one)
      </p>
    </main>
  );
}
