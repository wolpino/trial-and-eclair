import { useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { fetchIdeas, type Idea } from "../api/development";
import { CreateIdeaForm } from "../components/CreateIdeaForm";
import { IdeaCard } from "../components/IdeaCard";

export function DeveloperHomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchIdeas()
      .then((data) => {
        if (!cancelled) {
          setIdeas(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message || "Could not load ideas.");
          } else {
            setError("Could not load ideas.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreated(idea: Idea) {
    setIdeas((current) => [idea, ...current]);
  }

  if (loading) {
    return <p className="status-message">Loading cork board…</p>;
  }

  if (error) {
    return (
      <main className="page-shell">
        <p className="form-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="page-shell cork-board">
      <header className="cork-board-header">
        <h1>Cork board</h1>
        <p className="page-note">
          Pin recipe ideas in progress. Promote to the lab in a later chunk.
        </p>
      </header>

      <CreateIdeaForm onCreated={handleCreated} />

      {ideas.length === 0 ? (
        <p className="cork-board-empty">No ideas yet — pin your first one above.</p>
      ) : (
        <section aria-label="Pinned ideas" className="cork-board-grid">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </section>
      )}
    </main>
  );
}
