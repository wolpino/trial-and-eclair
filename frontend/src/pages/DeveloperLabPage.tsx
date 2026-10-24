import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createDevelopmentRecipe,
  deleteDevelopmentRecipe,
  fetchDevelopmentRecipes,
  type DevelopmentRecipe,
} from "../api/development";
import { fetchSampleRecipes } from "../api/samples";
import { RecipeShelf } from "../components/lab/RecipeShelf";
import { RecipeImportPanel } from "../components/RecipeImportPanel";
import "../styles/lab.css";

/** The sample shelf: links into the read-only notebook, no delete. */
function SampleShelf({ recipes }: { recipes: DevelopmentRecipe[] }) {
  return (
    <div className="lab-shelf" role="list" aria-label="Recipe shelf">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="lab-spine-wrap" role="listitem">
          <Link className="lab-spine" to={`/sample/lab/${recipe.id}`} title={recipe.title}>
            <p className="lab-spine__title">{recipe.title}</p>
            <span className="lab-spine__meta">v{recipe.current_version.version_number}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

/** The Lab shelf. `sample` shows the shared read-only sample notebook for home cooks. */
export function DeveloperLabPage({ sample = false }: { sample?: boolean }) {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<DevelopmentRecipe[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadRecipes() {
    setLoading(true);
    try {
      setRecipes(await (sample ? fetchSampleRecipes() : fetchDevelopmentRecipes()));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not load recipes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipes();
  }, [sample]);

  async function handleDelete(id: string) {
    try {
      await deleteDevelopmentRecipe(id);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not delete recipe.");
    }
  }

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

  if (sample) {
    return (
      <main className="lab-page">
        <header className="lab-page__header">
          <h1>Lab</h1>
          <p className="lab-page__note">
            A sample notebook, read only: open a recipe to see how developers test versions.
          </p>
        </header>
        {error ? <p className="lab-form-error">{error}</p> : null}
        {loading ? (
          <p className="lab-page__note">Loading shelf…</p>
        ) : (
          <SampleShelf recipes={recipes} />
        )}
      </main>
    );
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

      <RecipeImportPanel destination="lab" />

      {loading ? (
        <p className="lab-page__note">Loading shelf…</p>
      ) : (
        <RecipeShelf recipes={recipes} onDelete={(id) => void handleDelete(id)} />
      )}
    </main>
  );
}
