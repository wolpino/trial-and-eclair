import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import { CookbookSpine } from "../components/cookbooks";
import {
  createCookbook,
  fetchCookbooks,
  fetchDevelopmentRecipes,
  setCookbookOnShelf,
  type Cookbook,
} from "../api/development";
import "../styles/cookbooks.css";

export function CookbooksPage() {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [hasLabRecipes, setHasLabRecipes] = useState(true);
  const [savingShelfId, setSavingShelfId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCookbooks(), fetchDevelopmentRecipes()])
      .then(([loadedCookbooks, recipes]) => {
        setCookbooks(loadedCookbooks);
        setHasLabRecipes(recipes.length > 0);
      })
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

  function replaceCookbook(updated: Cookbook) {
    setCookbooks((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function handleShelfChange(cookbook: Cookbook, onShelf: boolean) {
    setSavingShelfId(cookbook.id);
    replaceCookbook({ ...cookbook, on_shelf: onShelf });
    try {
      replaceCookbook(await setCookbookOnShelf(cookbook.id, onShelf));
      setError(null);
    } catch (err: unknown) {
      replaceCookbook(cookbook);
      setError(err instanceof ApiError ? err.message : "Could not update the shelf.");
    } finally {
      setSavingShelfId(null);
    }
  }

  return (
    <main className="cookbooks-page">
      <header className="cookbooks-page__header">
        <h1>Cookbooks</h1>
        <p className="cookbooks-page__note">
          Virtual binders of Lab recipes — share a collection link when ready. Tick
          “On shelf” to set a binder on your kitchen shelf.
        </p>
      </header>

      <section className="cookbooks-create">
        <h2>New binder</h2>
        <form className="paper-form cookbooks-create-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="cookbooks-form-error">{error}</p> : null}
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
            Description
            <textarea
              className="paper-field paper-field--textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="cookbooks-create-form__row">
            <button className="paper-btn" type="submit">
              Create binder
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="cookbooks-page__note">Loading binders…</p>
      ) : (
        <>
          {!hasLabRecipes ? (
            <p className="cookbooks-empty">
              Add a few <Link to="/developer/lab">Lab</Link> recipes first, then bind them
              into a cookbook.
            </p>
          ) : null}
          {cookbooks.length === 0 ? (
            hasLabRecipes ? (
              <p className="cookbooks-rack-empty">No binders on the rack yet.</p>
            ) : null
          ) : (
            <div className="cookbooks-rack" role="list" aria-label="Cookbook binders">
              {cookbooks.map((cookbook) => (
                <div key={cookbook.id} className="cookbook-slot" role="listitem">
                  <CookbookSpine cookbook={cookbook} />
                  <label className="cookbook-slot__shelf">
                    <input
                      type="checkbox"
                      aria-label={`On shelf: ${cookbook.title}`}
                      checked={cookbook.on_shelf}
                      disabled={savingShelfId === cookbook.id}
                      onChange={(e) => void handleShelfChange(cookbook, e.target.checked)}
                    />
                    On shelf
                  </label>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
