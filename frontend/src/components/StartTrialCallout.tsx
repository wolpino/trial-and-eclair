import { useState } from "react";

import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function StartTrialCallout() {
  const { startTrial } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleStart() {
    setSubmitting(true);
    setError(null);
    try {
      await startTrial();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not start a trial.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="start-trial">
      {error ? <p className="form-error">{error}</p> : null}
      <p className="home-note">
        Developer tools (cork, lab, cookbooks) are a 14-day trial. Recipe box stays yours.
      </p>
      <button
        className="paper-btn"
        disabled={submitting}
        type="button"
        onClick={() => void handleStart()}
      >
        {submitting ? "Starting trial…" : "Start 14-day developer trial"}
      </button>
    </div>
  );
}
