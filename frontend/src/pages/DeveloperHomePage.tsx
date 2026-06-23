import { useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import { fetchIdeas, type Idea, type IdeaStatus } from "../api/development";
import {
  CorkBoardFilters,
  IdeaEditDrawer,
  PinIdeaFab,
  PinnedNoteCard,
} from "../components/corkboard";
import "../components/corkboard/corkboard.css";

export function DeveloperHomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

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
          setError(err instanceof ApiError ? err.message : "Could not load ideas.");
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

  const tags = useMemo(() => {
    const unique = new Set<string>();
    for (const idea of ideas) {
      if (idea.category_tag.trim()) {
        unique.add(idea.category_tag.trim());
      }
    }
    return [...unique].sort((left, right) => left.localeCompare(right));
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (statusFilter !== "all" && idea.status !== statusFilter) {
        return false;
      }
      if (tagFilter && idea.category_tag !== tagFilter) {
        return false;
      }
      return true;
    });
  }, [ideas, statusFilter, tagFilter]);

  function handleCreated(idea: Idea) {
    setIdeas((current) => [idea, ...current]);
  }

  function handleSaved(idea: Idea) {
    setIdeas((current) => current.map((item) => (item.id === idea.id ? idea : item)));
    setSelectedIdea(idea);
  }

  function handleDeleted(id: string) {
    setIdeas((current) => current.filter((item) => item.id !== id));
    setSelectedIdea(null);
  }

  if (loading) {
    return <p className="status-message">Loading cork board…</p>;
  }

  if (error) {
    return (
      <main className="cork-board-page">
        <p className="cork-drawer__error">{error}</p>
      </main>
    );
  }

  return (
    <main className="cork-board-page">
      <header className="cork-board-page__header">
        <h1>Cork board</h1>
        <p className="cork-board-page__note">
          Pin recipe ideas in progress. Promote to the lab when you are ready to develop.
        </p>
      </header>

      <CorkBoardFilters
        statusFilter={statusFilter}
        tagFilter={tagFilter}
        tags={tags}
        onStatusChange={setStatusFilter}
        onTagChange={setTagFilter}
      />

      {filteredIdeas.length === 0 ? (
        <p className="cork-board-empty">
          {ideas.length === 0
            ? "No ideas yet — tap Pin note to add your first one."
            : "No ideas match these filters."}
        </p>
      ) : (
        <section aria-label="Pinned ideas" className="cork-board-grid">
          {filteredIdeas.map((idea) => (
            <PinnedNoteCard
              key={idea.id}
              idea={idea}
              onSelect={setSelectedIdea}
            />
          ))}
        </section>
      )}

      <PinIdeaFab onCreated={handleCreated} />

      <IdeaEditDrawer
        idea={selectedIdea}
        open={selectedIdea !== null}
        onClose={() => setSelectedIdea(null)}
        onDeleted={handleDeleted}
        onSaved={handleSaved}
      />
    </main>
  );
}
