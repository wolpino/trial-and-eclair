import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { CookbookSpine } from "../components/cookbooks";
import {
  createCookbook,
  fetchCookbooks,
  type Cookbook,
} from "../api/development";
import "../styles/cookbooks.css";

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
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create cookbook.");
    }
  }

  return (
    <main className="cookbooks-page">
      <header className="cookbooks-page__header">
        <h1>Cookbooks</h1>
        <p className="cookbooks-page__note">
          Virtual binders of published recipes — share a collection link when ready.
        </p>
      </header>

      <section className="cookbooks-create">
        <h2>New binder</h2>
        <form className="cookbooks-create-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="cookbooks-form-error">{error}</p> : null}
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
          <div className="cookbooks-create-form__row">
            <button className="cookbooks-btn" type="submit">
              Create binder
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="cookbooks-page__note">Loading binders…</p>
      ) : cookbooks.length === 0 ? (
        <p className="cookbooks-rack-empty">No binders on the rack yet.</p>
      ) : (
        <div className="cookbooks-rack" role="list" aria-label="Cookbook binders">
          {cookbooks.map((cookbook) => (
            <CookbookSpine key={cookbook.id} cookbook={cookbook} />
          ))}
        </div>
      )}
    </main>
  );
}
