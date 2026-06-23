import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../../api/client";
import type { PublicIngredientLine } from "../../api/client";
import {
  createBoxIngredientLine,
  deleteBoxIngredientLine,
  fetchRecipeBoxRecipe,
  patchRecipeBoxRecipe,
  type CollectionRecipe,
} from "../../api/collection";
import { displayUnit, formatQuantity } from "../../lib/recipeFormat";
import { AddIngredientLineForm } from "../AddIngredientLineForm";
import { IndexCard } from "./IndexCard";
import { IndexCardField } from "./IndexCardField";

type RecipeBoxCardProps = {
  recipe: CollectionRecipe;
  expanded: boolean;
  onCollapse: () => void;
  onSaved: (recipe: CollectionRecipe) => void;
};

export function RecipeBoxCard({
  recipe,
  expanded,
  onCollapse,
  onSaved,
}: RecipeBoxCardProps) {
  const [draft, setDraft] = useState(recipe);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(recipe);
  }, [recipe]);

  async function refreshRecipe() {
    const fresh = await fetchRecipeBoxRecipe(recipe.id);
    setDraft(fresh);
    onSaved(fresh);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = await patchRecipeBoxRecipe(draft.id, {
        title: draft.title,
        description: draft.description,
        equipment_notes: draft.equipment_notes,
        prep_minutes: draft.prep_minutes,
        cook_minutes: draft.cook_minutes,
      });
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!expanded) {
    return (
      <IndexCard className="recipe-box-card">
        <h3 className="recipe-box-card__summary-title">{recipe.title}</h3>
        {recipe.description ? (
          <p className="recipe-box-card__summary-text">{recipe.description}</p>
        ) : (
          <p className="recipe-box-card__summary-text recipe-box-card__summary-empty">
            No description yet
          </p>
        )}
      </IndexCard>
    );
  }

  return (
    <IndexCard className="recipe-box-card recipe-box-card--expanded" focused>
      <form onSubmit={(event) => void handleSave(event)}>
        {error ? <p className="recipe-box-form-error">{error}</p> : null}

        <IndexCardField label="Title">
          <input
            className="recipe-box-card__input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </IndexCardField>

        <IndexCardField label="Description">
          <textarea
            className="recipe-box-card__textarea"
            rows={3}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </IndexCardField>

        <IndexCardField label="Equipment">
          <textarea
            className="recipe-box-card__textarea"
            rows={2}
            value={draft.equipment_notes}
            onChange={(event) =>
              setDraft({ ...draft, equipment_notes: event.target.value })
            }
          />
        </IndexCardField>

        <IndexCardField label="Ingredients">
          <ul className="recipe-box-card__ingredients">
            {draft.ingredient_lines.map((line) => (
              <li key={line.id}>
                <span>
                  {formatQuantity(line.quantity)}{" "}
                  {displayUnit(line as PublicIngredientLine)} {line.ingredient_name}
                </span>
                <button
                  className="recipe-box-card__remove"
                  type="button"
                  onClick={() =>
                    void deleteBoxIngredientLine(draft.id, line.id)
                      .then(refreshRecipe)
                      .catch((err: unknown) => {
                        setError(
                          err instanceof ApiError ? err.message : "Could not remove ingredient.",
                        );
                      })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="recipe-box-card__add-form">
            <AddIngredientLineForm
              sortOrder={draft.ingredient_lines.length}
              onAdded={() => void refreshRecipe()}
              onAdd={(data) => createBoxIngredientLine(draft.id, data)}
            />
          </div>
        </IndexCardField>

        <div className="recipe-box-card__toolbar">
          <button className="recipe-box-btn" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="recipe-box-btn recipe-box-btn--ghost" type="button" onClick={onCollapse}>
            Close
          </button>
        </div>
      </form>
    </IndexCard>
  );
}
