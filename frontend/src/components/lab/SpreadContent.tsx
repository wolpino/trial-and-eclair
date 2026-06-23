import { FormEvent } from "react";

import { AddIngredientLineForm } from "../AddIngredientLineForm";
import type { RecipeVersion } from "../../api/development";
import { displayUnit, formatQuantity } from "../../lib/recipeFormat";
import type { PublicIngredientLine } from "../../api/client";

type SpreadIngredientsProps = {
  version: RecipeVersion;
  editable: boolean;
  onRemoveLine: (lineId: string) => void;
  onAddLine: (data: {
    ingredient: string;
    quantity: string;
    unit: string;
    prep_note: string;
    sort_order: number;
  }) => Promise<unknown>;
  onAdded: () => void;
};

export function SpreadIngredients({
  version,
  editable,
  onRemoveLine,
  onAddLine,
  onAdded,
}: SpreadIngredientsProps) {
  return (
    <section className="lab-spread-column" aria-label="Ingredients">
      <h3 className="lab-column-heading">Ingredients</h3>
      <ul className="lab-ingredient-list">
        {version.ingredient_lines.map((line) => (
          <li key={line.id}>
            <span className="ingredient-qty">
              {formatQuantity(line.quantity)} {displayUnit(line as PublicIngredientLine)}
            </span>{" "}
            {line.ingredient_name}
            {line.prep_note ? (
              <span className="ingredient-note"> ({line.prep_note})</span>
            ) : null}
            {editable ? (
              <button
                className="lab-btn--text"
                type="button"
                onClick={() => onRemoveLine(line.id)}
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {editable ? (
        <AddIngredientLineForm
          sortOrder={version.ingredient_lines.length}
          onAdded={onAdded}
          onAdd={onAddLine}
        />
      ) : null}
    </section>
  );
}

type SpreadStepsProps = {
  version: RecipeVersion;
};

export function SpreadSteps({ version }: SpreadStepsProps) {
  void version;
  return (
    <section className="lab-spread-column" aria-label="Steps">
      <h3 className="lab-column-heading">Steps</h3>
      <p className="lab-steps-placeholder">
        Step editor wiring lands in C6. Use version notes and journal for now.
      </p>
    </section>
  );
}

type SpreadHeaderProps = {
  version: RecipeVersion;
  editable: boolean;
  onFieldChange: <K extends keyof RecipeVersion>(
    field: K,
    value: RecipeVersion[K],
  ) => void;
};

export function SpreadHeader({ version, editable, onFieldChange }: SpreadHeaderProps) {
  return (
    <div className="lab-spread-header">
      <input
        className="lab-spread-title"
        value={version.title}
        disabled={!editable}
        aria-label="Recipe title"
        onChange={(event) => onFieldChange("title", event.target.value)}
      />
      <textarea
        className="lab-spread-description"
        rows={2}
        value={version.description}
        disabled={!editable}
        aria-label="Description"
        placeholder="Description"
        onChange={(event) => onFieldChange("description", event.target.value)}
      />
      <div className="lab-spread-meta">
        <label>
          Prep (min)
          <input
            type="number"
            min={0}
            value={version.prep_minutes ?? ""}
            disabled={!editable}
            onChange={(event) =>
              onFieldChange(
                "prep_minutes",
                event.target.value ? Number(event.target.value) : null,
              )
            }
          />
        </label>
        <label>
          Cook (min)
          <input
            type="number"
            min={0}
            value={version.cook_minutes ?? ""}
            disabled={!editable}
            onChange={(event) =>
              onFieldChange(
                "cook_minutes",
                event.target.value ? Number(event.target.value) : null,
              )
            }
          />
        </label>
        <label className="lab-spread-meta__wide">
          Equipment notes
          <textarea
            rows={2}
            value={version.equipment_notes}
            disabled={!editable}
            onChange={(event) => onFieldChange("equipment_notes", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

type VersionNotesProps = {
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
};

export function VersionNotes({ value, editable, onChange }: VersionNotesProps) {
  return (
    <div className="lab-version-notes-panel">
      <p className="lab-column-heading">Version notes</p>
      <textarea
        className="lab-version-notes"
        rows={5}
        value={value}
        disabled={!editable}
        placeholder="Why this version changed…"
        aria-label="Version notes"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type SpreadActionsProps = {
  editable: boolean;
  saving: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSaveNewVersion: () => void;
};

export function SpreadActions({
  editable,
  saving,
  onSave,
  onSaveNewVersion,
}: SpreadActionsProps) {
  if (!editable) {
    return null;
  }

  return (
    <form className="lab-spread-actions" onSubmit={onSave}>
      <button className="lab-btn" disabled={saving} type="submit">
        Save spread
      </button>
      <button
        className="lab-btn lab-btn--ghost"
        disabled={saving}
        type="button"
        onClick={onSaveNewVersion}
      >
        Save new version
      </button>
    </form>
  );
}
