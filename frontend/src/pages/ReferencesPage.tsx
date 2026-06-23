import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import {
  createReference,
  deleteReference,
  fetchReferences,
  type Reference,
  type ReferenceType,
} from "../api/library";
import { REFERENCE_TYPE_LABELS } from "../lib/constants";

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

  async function loadReferences(type: ReferenceType | "all") {
    const data = await fetchReferences(type === "all" ? undefined : type);
    setReferences(data);
  }

  useEffect(() => {
    loadReferences(filter).catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : "Could not load references.");
    });
  }, [filter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createReference({ ref_type: refType, title, url });
      setTitle("");
      setUrl("");
      await loadReferences(filter);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create reference.");
    }
  }

  return (
    <main className="page-shell">
      <h1>Reference library</h1>
      <p className="page-note">Cookbooks, blogs, chefs, and tools you follow.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="filter-tabs">
        <button
          className={filter === "all" ? "filter-tab-active" : "filter-tab"}
          type="button"
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {REF_TYPES.map((type) => (
          <button
            key={type}
            className={filter === type ? "filter-tab-active" : "filter-tab"}
            type="button"
            onClick={() => setFilter(type)}
          >
            {REFERENCE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <section className="panel">
        <h2>Add reference</h2>
        <form className="editor-form" onSubmit={(event) => void handleCreate(event)}>
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
          <button type="submit">Add</button>
        </form>
      </section>

      <ul className="item-list">
        {references.map((ref) => (
          <li key={ref.id}>
            <strong>{ref.title}</strong>
            <span className="item-meta"> {REFERENCE_TYPE_LABELS[ref.ref_type]}</span>
            {ref.url ? (
              <>
                {" "}
                ·{" "}
                <a href={ref.url} rel="noreferrer" target="_blank">
                  link
                </a>
              </>
            ) : null}
            <button
              className="text-button"
              type="button"
              onClick={() =>
                void deleteReference(ref.id).then(() => loadReferences(filter))
              }
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
