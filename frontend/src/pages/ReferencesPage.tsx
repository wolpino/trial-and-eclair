import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { ReferenceEditCard } from "../components/references/ReferenceEditCard";
import { ReferenceShelf } from "../components/references/ReferenceShelf";
import {
  createReference,
  deleteReference,
  fetchReferences,
  patchReference,
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [refType, setRefType] = useState<ReferenceType>("blog");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selected = references.find((reference) => reference.id === selectedId) ?? null;

  async function loadReferences(type: ReferenceType | "all") {
    const data = await fetchReferences(type === "all" ? undefined : type);
    setReferences(data);
    return data;
  }

  useEffect(() => {
    setLoading(true);
    loadReferences(filter)
      .then((data) => {
        setSelectedId((current) =>
          current && data.some((reference) => reference.id === current) ? current : null,
        );
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load references.");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await createReference({
        ref_type: refType,
        title,
        url,
        notes,
      });
      setTitle("");
      setUrl("");
      setNotes("");
      await loadReferences(filter);
      setSelectedId(created.id);
      setError(null);
      setEditError(null);
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
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setEditError(null);
            }}
            onDelete={(id) =>
              void deleteReference(id)
                .then(() => {
                  if (selectedId === id) {
                    setSelectedId(null);
                  }
                  return loadReferences(filter);
                })
                .catch((err: unknown) => {
                  setError(
                    err instanceof ApiError ? err.message : "Could not delete reference.",
                  );
                })
            }
          />
        )}
      </div>

      {selected ? (
        <ReferenceEditCard
          key={selected.id}
          reference={selected}
          error={editError}
          onCancel={() => {
            setSelectedId(null);
            setEditError(null);
          }}
          onSave={async (data) => {
            try {
              const updated = await patchReference(selected.id, data);
              setEditError(null);
              if (filter !== "all" && updated.ref_type !== filter) {
                setSelectedId(null);
                await loadReferences(filter);
                return;
              }
              setReferences((current) =>
                current.map((reference) =>
                  reference.id === updated.id ? updated : reference,
                ),
              );
            } catch (err: unknown) {
              setEditError(
                err instanceof ApiError ? err.message : "Could not save reference.",
              );
            }
          }}
        />
      ) : null}

      <section className="references-add">
        <h2>Pin to shelf</h2>
        <form className="paper-form references-add-form" onSubmit={(event) => void handleCreate(event)}>
          <label>
            Type
            <select
              className="paper-field"
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
            <input
              className="paper-field"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            URL <span className="label-optional">(optional)</span>
            <input
              className="paper-field"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label>
            Notes <span className="label-optional">(optional)</span>
            <textarea
              className="paper-field paper-field--textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button className="paper-btn" type="submit">
            Add to shelf
          </button>
        </form>
      </section>
    </main>
  );
}
