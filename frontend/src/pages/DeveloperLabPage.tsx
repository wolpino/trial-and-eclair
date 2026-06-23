import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createDevelopmentRecipe,
  fetchDevelopmentRecipes,
  type DevelopmentRecipe,
} from "../api/development";

export function DeveloperLabPage() {
  const [recipes, setRecipes] = useState<DevelopmentRecipe[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadRecipes() {
    setLoading(true);
    try {
      setRecipes(await fetchDevelopmentRecipes());
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not load recipes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipes();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const recipe = await createDevelopmentRecipe(title);
      setTitle("");
      setRecipes((current) => [recipe, ...current]);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create recipe.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="section-header">
        <h1>Lab</h1>
        <p className="page-note">Development recipes with version history.</p>
      </header>

      <section className="panel">
        <h2>New recipe</h2>
        <form className="inline-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="inline-form-row">
            <input
              placeholder="Recipe title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button disabled={submitting} type="submit">
              Create
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="page-note">Loading recipes…</p>
      ) : recipes.length === 0 ? (
        <p className="page-note">No recipes yet.</p>
      ) : (
        <ul className="item-list">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/developer/lab/${recipe.id}`}>{recipe.title}</Link>
              <span className="item-meta">
                v{recipe.current_version.version_number} · {recipe.status}
                {recipe.slug ? (
                  <>
                    {" "}
                    · <Link to={`/r/${recipe.slug}`}>public</Link>
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
