import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function HomePage() {
  const { user, loading, hasDeveloperAccess } = useAuth();

  if (loading) {
    return <p className="status-message">Loading…</p>;
  }

  return (
    <main className="home-page">
      <h1>Trial and Eclair</h1>
      <p>Recipe development and collection — not a blog.</p>

      {user ? (
        <>
          <p>
            Signed in as <strong>{user.username}</strong>
            {user.role === "developer" ? " (developer)" : " (home cook)"}.
          </p>
          <p className="home-actions">
            {hasDeveloperAccess ? (
              <Link to="/developer">Go to cork board</Link>
            ) : null}
            {user.role === "home_cook" ? (
              <>
                {hasDeveloperAccess ? " · " : null}
                <Link to="/recipe-box">Go to recipe box</Link>
              </>
            ) : null}
          </p>
          {!hasDeveloperAccess && user.role === "developer" ? (
            <p className="home-note">
              Developer tools need an active trial or subscription. Update your
              account in Django admin.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="home-note">
            Log in to manage recipes, or open a published recipe at{" "}
            <code>/r/your-recipe-slug</code>.
          </p>
          <p className="home-actions">
            <Link to="/login">Log in</Link> · <Link to="/register">Register</Link>
          </p>
        </>
      )}

      <p className="home-note">
        <Link to="/r/example">Example public recipe</Link> (404 until you publish
        one)
      </p>
    </main>
  );
}
