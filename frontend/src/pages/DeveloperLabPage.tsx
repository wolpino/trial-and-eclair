import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createDevelopmentRecipe,
  fetchDevelopmentRecipes,
  type DevelopmentRecipe,
} from "../api/development";
import { RecipeShelf } from "../components/lab/RecipeShelf";
import "../styles/lab.css";

export function DeveloperLabPage() {
  const navigate = useNavigate();
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
      navigate(`/developer/lab/${recipe.id}`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create recipe.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="lab-page">
      <header className="lab-page__header">
        <h1>Lab</h1>
        <p className="lab-page__note">
          Open a notebook from the shelf or start a new recipe — no idea required.
        </p>
      </header>

      <section className="lab-new-recipe" aria-label="New recipe">
        <h2>New recipe</h2>
        <form className="lab-new-recipe-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="lab-form-error">{error}</p> : null}
          <input
            placeholder="Recipe title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button className="lab-btn" disabled={submitting} type="submit">
            {submitting ? "Creating…" : "Open notebook"}
          </button>
        </form>
      </section>

      {loading ? (
        <p className="lab-page__note">Loading shelf…</p>
      ) : (
        <RecipeShelf recipes={recipes} />
      )}
    </main>
  );
}
