import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  CookbookBinder,
  CookbookEntryCard,
} from "../components/cookbooks";
import {
  addCookbookEntry,
  deleteCookbookEntry,
  fetchCookbook,
  fetchDevelopmentRecipes,
  publishCookbook,
  unpublishCookbook,
  type Cookbook,
  type DevelopmentRecipe,
} from "../api/development";
import "../styles/cookbooks.css";

export function CookbookDetailPage() {
  const { cookbookId } = useParams<{ cookbookId: string }>();
  const [cookbook, setCookbook] = useState<Cookbook | null>(null);
  const [recipes, setRecipes] = useState<DevelopmentRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cookbookId) {
      setLoading(false);
      return;
    }
    Promise.all([fetchCookbook(cookbookId), fetchDevelopmentRecipes()])
      .then(([cookbookData, recipeData]) => {
        setCookbook(cookbookData);
        setRecipes(recipeData.filter((recipe) => recipe.status === "published"));
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load cookbook.");
      })
      .finally(() => setLoading(false));
  }, [cookbookId]);

  const slugByRecipeId = useMemo(() => {
    const map = new Map<string, string>();
    for (const recipe of recipes) {
      if (recipe.slug) {
        map.set(recipe.id, recipe.slug);
      }
    }
    return map;
  }, [recipes]);

  if (loading) {
    return (
      <main className="cookbooks-page">
        <p className="cookbooks-page__note">Opening binder…</p>
      </main>
    );
  }

  if (!cookbook) {
    return (
      <main className="cookbooks-page">
        {error ? <p className="cookbooks-form-error">{error}</p> : <p>Binder not found.</p>}
        <Link className="cookbooks-back-link" to="/developer/cookbooks">
          ← Cookbooks
        </Link>
      </main>
    );
  }

  async function reloadCookbook() {
    if (!cookbookId) {
      return;
    }
    setCookbook(await fetchCookbook(cookbookId));
  }

  async function handleAddEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cookbookId || !selectedRecipe) {
      return;
    }
    try {
      await addCookbookEntry(cookbookId, selectedRecipe);
      await reloadCookbook();
      setSelectedRecipe("");
      setError(null);
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
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not publish.");
    }
  }

  return (
    <main className="cookbooks-page">
      <Link className="cookbooks-back-link" to="/developer/cookbooks">
        ← Cookbook rack
      </Link>

      {error ? <p className="cookbooks-form-error">{error}</p> : null}

      <CookbookBinder>
        <header className="cookbook-detail__header">
          <p className="cookbook-detail__status">{cookbook.status}</p>
          <h1>{cookbook.title}</h1>
          {cookbook.description ? (
            <p className="cookbook-detail__description">{cookbook.description}</p>
          ) : null}
        </header>

        <div className="cookbook-entries-grid">
          {cookbook.entries.length === 0 ? (
            <p className="cookbooks-page__note">No recipe cards in this binder yet.</p>
          ) : (
            cookbook.entries.map((entry) => (
              <CookbookEntryCard
                key={entry.id}
                entry={entry}
                recipeSlug={slugByRecipeId.get(entry.recipe) ?? null}
                onRemove={() =>
                  void deleteCookbookEntry(cookbook.id, entry.id)
                    .then(reloadCookbook)
                    .catch((err: unknown) => {
                      setError(
                        err instanceof ApiError ? err.message : "Could not remove entry.",
                      );
                    })
                }
              />
            ))
          )}
        </div>

        <form className="cookbook-add-entry" onSubmit={(event) => void handleAddEntry(event)}>
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
          <button className="cookbooks-btn" type="submit">
            Add card
          </button>
        </form>

        <section className="cookbook-publish">
          <h2>Share binder</h2>
          {cookbook.status === "published" ? (
            <div className="cookbooks-create-form__row">
              {cookbook.slug ? (
                <Link className="cookbooks-btn cookbooks-btn--ghost" to={`/c/${cookbook.slug}`}>
                  View public binder
                </Link>
              ) : null}
              <button
                className="cookbooks-btn"
                type="button"
                onClick={() =>
                  void unpublishCookbook(cookbook.id)
                    .then(reloadCookbook)
                    .catch((err: unknown) => {
                      setError(
                        err instanceof ApiError ? err.message : "Could not unpublish.",
                      );
                    })
                }
              >
                Unpublish
              </button>
            </div>
          ) : (
            <form className="cookbook-publish-form" onSubmit={(event) => void handlePublish(event)}>
              <input
                placeholder="Slug (optional)"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <button className="cookbooks-btn" type="submit">
                Publish binder
              </button>
            </form>
          )}
        </section>
      </CookbookBinder>
    </main>
  );
}
