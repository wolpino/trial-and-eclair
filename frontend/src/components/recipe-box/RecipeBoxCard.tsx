import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../../api/client";
import type { PublicIngredientLine } from "../../api/client";
import {
  createBoxIngredientLine,
  createBoxStep,
  deleteBoxIngredientLine,
  deleteBoxStep,
  fetchRecipeBoxRecipe,
  patchBoxStep,
  patchRecipeBoxRecipe,
  type CollectionRecipe,
} from "../../api/collection";
import { displayUnit, formatQuantity } from "../../lib/recipeFormat";
import { AddIngredientLineForm } from "../AddIngredientLineForm";
import { RecipeStepsEditor } from "../RecipeStepsEditor";
import { IndexCard } from "./IndexCard";
import { IndexCardField } from "./IndexCardField";

type RecipeBoxCardProps = {
  recipe: CollectionRecipe;
  expanded: boolean;
  onCollapse: () => void;
  onSaved: (recipe: CollectionRecipe) => void;
  onDelete: () => void;
};

function confirmDelete(title: string): boolean {
  return window.confirm(`Delete "${title}" from your recipe box? This cannot be undone.`);
}

function parseOptionalMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function RecipeBoxCard({
  recipe,
  expanded,
  onCollapse,
  onSaved,
  onDelete,
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
        {recipe.prep_minutes != null || recipe.cook_minutes != null ? (
          <p className="recipe-box-card__summary-meta">
            {recipe.prep_minutes != null ? `Prep ${recipe.prep_minutes} min` : null}
            {recipe.prep_minutes != null && recipe.cook_minutes != null ? " · " : null}
            {recipe.cook_minutes != null ? `Cook ${recipe.cook_minutes} min` : null}
          </p>
        ) : null}
      </IndexCard>
    );
  }

  return (
    <IndexCard className="recipe-box-card recipe-box-card--expanded" focused>
      <form onSubmit={(event) => void handleSave(event)}>
        {error ? <p className="recipe-box-form-error">{error}</p> : null}

        <div className="recipe-box-card__head">
          <IndexCardField label="Name">
            <input
              className="recipe-box-card__input recipe-box-card__title-input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </IndexCardField>

          <div className="recipe-box-card__meta">
            <label className="recipe-box-card__meta-field">
              <span className="index-card-field__label">Prep</span>
              <input
                className="recipe-box-card__meta-input"
                inputMode="numeric"
                min={0}
                placeholder="min"
                value={draft.prep_minutes ?? ""}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    prep_minutes: parseOptionalMinutes(event.target.value),
                  })
                }
              />
            </label>
            <label className="recipe-box-card__meta-field">
              <span className="index-card-field__label">Cook</span>
              <input
                className="recipe-box-card__meta-input"
                inputMode="numeric"
                min={0}
                placeholder="min"
                value={draft.cook_minutes ?? ""}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    cook_minutes: parseOptionalMinutes(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </div>

        <IndexCardField label="Description">
          <textarea
            className="recipe-box-card__textarea"
            rows={2}
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

        <div className="recipe-box-card__spread">
          <div className="recipe-box-card__spread-col">
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
                              err instanceof ApiError
                                ? err.message
                                : "Could not remove ingredient.",
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
          </div>

          <div className="recipe-box-card__spread-col">
            <IndexCardField label="Directions">
              <RecipeStepsEditor
                steps={draft.steps ?? []}
                editable
                listClassName="recipe-box-card__steps"
                onAdd={(data) => createBoxStep(draft.id, data)}
                onUpdate={(stepId, data) => patchBoxStep(draft.id, stepId, data)}
                onDelete={(stepId) => deleteBoxStep(draft.id, stepId)}
                onChanged={() => void refreshRecipe()}
              />
            </IndexCardField>
          </div>
        </div>

        <div className="recipe-box-card__toolbar">
          <button className="recipe-box-btn" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="recipe-box-btn recipe-box-btn--ghost" type="button" onClick={onCollapse}>
            Close
          </button>
          <button
            className="recipe-box-card__remove"
            type="button"
            onClick={() => {
              if (confirmDelete(recipe.title)) {
                onDelete();
              }
            }}
          >
            Delete card
          </button>
        </div>
      </form>
    </IndexCard>
  );
}
