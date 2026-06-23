import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createCookbook,
  fetchCookbooks,
  type Cookbook,
} from "../api/development";

export function CookbooksPage() {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCookbooks()
      .then(setCookbooks)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load cookbooks.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const cookbook = await createCookbook({ title, description });
      setCookbooks((current) => [cookbook, ...current]);
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create cookbook.");
    }
  }

  return (
    <main className="page-shell">
      <h1>Cookbooks</h1>
      <section className="panel">
        <h2>New cookbook</h2>
        <form className="editor-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button type="submit">Create</button>
        </form>
      </section>

      {loading ? (
        <p className="page-note">Loading…</p>
      ) : (
        <ul className="item-list">
          {cookbooks.map((cookbook) => (
            <li key={cookbook.id}>
              <Link to={`/developer/cookbooks/${cookbook.id}`}>{cookbook.title}</Link>
              <span className="item-meta">
                {cookbook.entries.length} recipes · {cookbook.status}
                {cookbook.slug ? (
                  <>
                    {" "}
                    · <Link to={`/c/${cookbook.slug}`}>public</Link>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
