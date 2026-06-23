import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { ReferenceShelf } from "../components/references/ReferenceShelf";
import {
  createReference,
  deleteReference,
  fetchReferences,
  type Reference,
  type ReferenceType,
} from "../api/library";
import { REFERENCE_TYPE_LABELS } from "../lib/constants";
import "../styles/references.css";

const REF_TYPES: ReferenceType[] = [
  "cookbook",
  "blog",
  "chef",
  "article",
  "tool",
];

export function ReferencesPage() {
  const [filter, setFilter] = useState<ReferenceType | "all">("all");
  const [references, setReferences] = useState<Reference[]>([]);
  const [title, setTitle] = useState("");
  const [refType, setRefType] = useState<ReferenceType>("blog");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReferences(type: ReferenceType | "all") {
    const data = await fetchReferences(type === "all" ? undefined : type);
    setReferences(data);
  }

  useEffect(() => {
    setLoading(true);
    loadReferences(filter)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load references.");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createReference({ ref_type: refType, title, url });
      setTitle("");
      setUrl("");
      await loadReferences(filter);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create reference.");
    }
  }

  return (
    <main className="references-page">
      <header className="references-page__header">
        <h1>Reference shelf</h1>
        <p className="references-page__note">
          Cookbooks you own, blogs, chefs, and tools — your research shelf.
        </p>
      </header>

      {error ? <p className="references-form-error">{error}</p> : null}

      <div className="reference-filter-rail" role="tablist" aria-label="Reference types">
        <button
          aria-pressed={filter === "all"}
          type="button"
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {REF_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={filter === type}
            type="button"
            onClick={() => setFilter(type)}
          >
            {REFERENCE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="reference-shelf-wrap">
        {loading ? (
          <p className="references-page__note">Loading shelf…</p>
        ) : (
          <ReferenceShelf
            references={references}
            onDelete={(id) =>
              void deleteReference(id)
                .then(() => loadReferences(filter))
                .catch((err: unknown) => {
                  setError(
                    err instanceof ApiError ? err.message : "Could not delete reference.",
                  );
                })
            }
          />
        )}
      </div>

      <section className="references-add">
        <h2>Pin to shelf</h2>
        <form className="references-add-form" onSubmit={(event) => void handleCreate(event)}>
          <label>
            Type
            <select
              value={refType}
              onChange={(event) => setRefType(event.target.value as ReferenceType)}
            >
              {REF_TYPES.map((type) => (
                <option key={type} value={type}>
                  {REFERENCE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            URL <span className="label-optional">(optional)</span>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </label>
          <button className="cookbooks-btn" type="submit">
            Add to shelf
          </button>
        </form>
      </section>
    </main>
  );
}
