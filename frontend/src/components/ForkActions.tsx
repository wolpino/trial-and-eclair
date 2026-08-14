import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { forkPublicRecipe, type ForkType } from "../api/imports";
import { useAuth } from "../auth/AuthContext";

type ForkActionsProps = {
  slug: string;
};

export function ForkActions({ slug }: ForkActionsProps) {
  const { user, hasDeveloperAccess } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<ForkType | null>(null);

  async function handleFork(forkType: ForkType) {
    setBusy(forkType);
    setError(null);
    try {
      const result = await forkPublicRecipe(slug, forkType);
      if (forkType === "save_to_box") {
        navigate(`/recipe-box/${result.recipe.id}`);
      } else {
        navigate(`/developer/lab/${result.recipe.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not copy this recipe.");
    } finally {
      setBusy(null);
    }
  }

  if (!user) {
    return (
      <div className="public-fork-actions">
        <Link className="paper-btn" to="/login" state={{ from: `/r/${slug}` }}>
          Log in to save
        </Link>
      </div>
    );
  }

  return (
    <div className="public-fork-actions">
      {error ? <p className="form-error">{error}</p> : null}
      <button
        className="paper-btn"
        disabled={busy !== null}
        type="button"
        onClick={() => void handleFork("save_to_box")}
      >
        {busy === "save_to_box" ? "Saving…" : "Save to box"}
      </button>
      {hasDeveloperAccess ? (
        <button
          className="paper-btn paper-btn--ghost"
          disabled={busy !== null}
          type="button"
          onClick={() => void handleFork("rework")}
        >
          {busy === "rework" ? "Opening lab…" : "Rework"}
        </button>
      ) : null}
    </div>
  );
}
