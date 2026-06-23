import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createRecipeBoxRecipe,
  fetchRecipeBox,
  type CollectionRecipe,
} from "../api/collection";

export function RecipeBoxPage() {
  const [recipes, setRecipes] = useState<CollectionRecipe[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipeBox()
      .then(setRecipes)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load recipe box.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const recipe = await createRecipeBoxRecipe(title);
      setRecipes((current) => [...current, recipe].sort((a, b) => a.title.localeCompare(b.title)));
      setTitle("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create recipe.");
    }
  }

  const grouped = recipes.reduce<Record<string, CollectionRecipe[]>>((acc, recipe) => {
    const letter = recipe.title.charAt(0).toUpperCase() || "#";
    acc[letter] = acc[letter] ?? [];
    acc[letter].push(recipe);
    return acc;
  }, {});

  return (
    <main className="page-shell recipe-box">
      <header className="section-header">
        <h1>Recipe box</h1>
        <p className="page-note">Your personal recipes, sorted A–Z.</p>
      </header>

      <section className="panel">
        <form className="inline-form" onSubmit={(event) => void handleCreate(event)}>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="inline-form-row">
            <input
              placeholder="New recipe title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button type="submit">Add</button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="page-note">Loading…</p>
      ) : recipes.length === 0 ? (
        <p className="page-note">Your recipe box is empty.</p>
      ) : (
        Object.keys(grouped)
          .sort()
          .map((letter) => (
            <section key={letter} className="recipe-box-section">
              <h2 className="recipe-box-letter">{letter}</h2>
              <div className="recipe-box-grid">
                {grouped[letter].map((recipe) => (
                  <Link
                    key={recipe.id}
                    className="index-card"
                    to={`/recipe-box/${recipe.id}`}
                  >
                    <h3>{recipe.title}</h3>
                    {recipe.description ? (
                      <p>{recipe.description}</p>
                    ) : (
                      <p className="index-card-empty">No description yet</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))
      )}
    </main>
  );
}
