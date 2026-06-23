import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { AddIngredientLineForm } from "../components/AddIngredientLineForm";
import {
  createBoxIngredientLine,
  deleteBoxIngredientLine,
  fetchRecipeBoxRecipe,
  patchRecipeBoxRecipe,
  type CollectionRecipe,
} from "../api/collection";
import { displayUnit, formatQuantity } from "../lib/recipeFormat";
import type { PublicIngredientLine } from "../api/client";

export function RecipeBoxRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<CollectionRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    if (!recipeId) {
      return;
    }
    setRecipe(await fetchRecipeBoxRecipe(recipeId));
  }

  useEffect(() => {
    reload().catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : "Could not load recipe.");
    });
  }, [recipeId]);

  if (!recipe) {
    return (
      <main className="page-shell">
        {error ? <p className="form-error">{error}</p> : <p>Loading…</p>}
      </main>
    );
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipe) {
      return;
    }
    const current = recipe;
    setSaving(true);
    try {
      setRecipe(
        await patchRecipeBoxRecipe(current.id, {
          title: current.title,
          description: current.description,
          equipment_notes: current.equipment_notes,
          prep_minutes: current.prep_minutes,
          cook_minutes: current.cook_minutes,
        }),
      );
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell recipe-editor">
      <p>
        <Link to="/recipe-box">← Recipe box</Link>
      </p>
      {error ? <p className="form-error">{error}</p> : null}

      <form className="editor-form panel" onSubmit={(event) => void handleSave(event)}>
        <label>
          Title
          <input
            value={recipe.title}
            onChange={(event) => setRecipe({ ...recipe, title: event.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={recipe.description}
            onChange={(event) =>
              setRecipe({ ...recipe, description: event.target.value })
            }
          />
        </label>
        <label>
          Equipment notes
          <textarea
            rows={2}
            value={recipe.equipment_notes}
            onChange={(event) =>
              setRecipe({ ...recipe, equipment_notes: event.target.value })
            }
          />
        </label>
        <button disabled={saving} type="submit">
          Save
        </button>
      </form>

      <section className="panel">
        <h2>Ingredients</h2>
        <ul className="ingredient-edit-list">
          {recipe.ingredient_lines.map((line) => (
            <li key={line.id}>
              <span className="ingredient-qty">
                {formatQuantity(line.quantity)}{" "}
                {displayUnit(line as PublicIngredientLine)}
              </span>{" "}
              {line.ingredient_name}
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  void deleteBoxIngredientLine(recipe.id, line.id).then(reload)
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <AddIngredientLineForm
          sortOrder={recipe.ingredient_lines.length}
          onAdded={() => void reload()}
          onAdd={(data) => createBoxIngredientLine(recipe.id, data)}
        />
      </section>
    </main>
  );
}
