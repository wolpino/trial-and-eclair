import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  addCookbookEntry,
  fetchCookbook,
  fetchDevelopmentRecipes,
  publishCookbook,
  unpublishCookbook,
  type Cookbook,
  type DevelopmentRecipe,
} from "../api/development";

export function CookbookDetailPage() {
  const { cookbookId } = useParams<{ cookbookId: string }>();
  const [cookbook, setCookbook] = useState<Cookbook | null>(null);
  const [recipes, setRecipes] = useState<DevelopmentRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cookbookId) {
      return;
    }
    Promise.all([fetchCookbook(cookbookId), fetchDevelopmentRecipes()])
      .then(([cookbookData, recipeData]) => {
        setCookbook(cookbookData);
        setRecipes(recipeData.filter((r) => r.status === "published"));
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load cookbook.");
      });
  }, [cookbookId]);

  if (!cookbook) {
    return (
      <main className="page-shell">
        {error ? <p className="form-error">{error}</p> : <p>Loading…</p>}
      </main>
    );
  }

  async function handleAddEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cookbookId || !selectedRecipe) {
      return;
    }
    try {
      await addCookbookEntry(cookbookId, selectedRecipe);
      setCookbook(await fetchCookbook(cookbookId));
      setSelectedRecipe("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not add recipe.");
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cookbookId) {
      return;
    }
    try {
      setCookbook(await publishCookbook(cookbookId, slug || undefined));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not publish.");
    }
  }

  return (
    <main className="page-shell">
      <p>
        <Link to="/developer/cookbooks">← Cookbooks</Link>
      </p>
      <h1>{cookbook.title}</h1>
      <p className="page-note">{cookbook.description}</p>
      {error ? <p className="form-error">{error}</p> : null}

      <section className="panel">
        <h2>Recipes in cookbook</h2>
        <ul className="item-list">
          {cookbook.entries.map((entry) => (
            <li key={entry.id}>
              {entry.snapshot_version.title}
              {entry.snapshot_version.title && cookbook.slug ? (
                <span className="item-meta"> frozen snapshot</span>
              ) : null}
            </li>
          ))}
        </ul>
        <form className="inline-form" onSubmit={(event) => void handleAddEntry(event)}>
          <div className="inline-form-row">
            <select
              required
              value={selectedRecipe}
              onChange={(event) => setSelectedRecipe(event.target.value)}
            >
              <option value="">Add published recipe…</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
            <button type="submit">Add</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Publish cookbook</h2>
        {cookbook.status === "published" ? (
          <div className="button-row">
            {cookbook.slug ? (
              <Link to={`/c/${cookbook.slug}`}>View public</Link>
            ) : null}
            <button
              type="button"
              onClick={() =>
                void unpublishCookbook(cookbook.id).then(() =>
                  fetchCookbook(cookbook.id).then(setCookbook),
                )
              }
            >
              Unpublish
            </button>
          </div>
        ) : (
          <form className="inline-form" onSubmit={(event) => void handlePublish(event)}>
            <div className="inline-form-row">
              <input
                placeholder="Slug (optional)"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <button type="submit">Publish</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
