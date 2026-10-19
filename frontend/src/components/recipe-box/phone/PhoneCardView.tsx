import { useEffect, useRef, useState } from "react";

import { ApiError, apiFetch } from "../../../api/client";
import {
  fetchRecipeBoxRecipe,
  patchBoxStep,
  patchRecipeBoxRecipe,
  type CollectionRecipe,
  type IngredientLine,
} from "../../../api/collection";
import { ingredientText, metaText, sourceLabel } from "./cardText";
import { useWakeLock, wakeLockSupported } from "./useWakeLock";
import "./phone-card-view.css";

type PhoneCardViewProps = {
  recipe: CollectionRecipe;
  onClose: () => void;
  /** Opens the whole card editor (add or remove lines and steps). Starter cards have none. */
  onEdit?: () => void;
  onSaved: (recipe: CollectionRecipe) => void;
};

type Draft = {
  title: string;
  prep: string;
  cook: string;
  description: string;
  equipment: string;
  lines: Record<string, string>;
  steps: Record<string, string>;
};

function sortedSteps(recipe: CollectionRecipe) {
  return [...recipe.steps].sort((left, right) => left.order - right.order);
}

function draftFrom(recipe: CollectionRecipe): Draft {
  return {
    title: recipe.title,
    prep: recipe.prep_minutes?.toString() ?? "",
    cook: recipe.cook_minutes?.toString() ?? "",
    description: recipe.description,
    equipment: recipe.equipment_notes,
    lines: Object.fromEntries(recipe.ingredient_lines.map((line) => [line.id, ingredientText(line)])),
    steps: Object.fromEntries(recipe.steps.map((step) => [step.id, step.body])),
  };
}

function minutes(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// Same save as the wide box's line editor: the whole line goes into raw_text.
function patchLineText(recipeId: string, lineId: string, text: string) {
  return apiFetch<IngredientLine>(`/api/v1/recipe-box/${recipeId}/ingredient-lines/${lineId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text: text }),
  });
}

/**
 * Card View for cooking (decision 003): ingredients beside the steps sideways,
 * a pinned ingredient band in portrait, a back for notes and source, the
 * screen kept awake, and in-place editing. Marks are not saved.
 */
export function PhoneCardView({ recipe, onClose, onEdit, onSaved }: PhoneCardViewProps) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [bandOpen, setBandOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set());
  const [awake, setAwake] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canWake = wakeLockSupported();
  useWakeLock(awake);

  const editing = draft !== null;
  const steps = sortedSteps(recipe);
  const lines = recipe.ingredient_lines;
  const meta = metaText(recipe);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      if (menuOpen) {
        setMenuOpen(false);
      } else if (!editing) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, editing, onClose]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  function startEditing() {
    setMenuOpen(false);
    setError(null);
    setDraft(draftFrom(recipe));
  }

  async function save() {
    if (!draft) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await patchRecipeBoxRecipe(recipe.id, {
        title: draft.title.trim() || recipe.title,
        prep_minutes: minutes(draft.prep),
        cook_minutes: minutes(draft.cook),
        description: draft.description,
        equipment_notes: draft.equipment,
      });
      for (const line of lines) {
        const text = draft.lines[line.id]?.trim();
        if (text && text !== ingredientText(line)) {
          await patchLineText(recipe.id, line.id, text);
        }
      }
      for (const step of steps) {
        const body = draft.steps[step.id]?.trim();
        if (body && body !== step.body) {
          await patchBoxStep(recipe.id, step.id, { body });
        }
      }
      onSaved(await fetchRecipeBoxRecipe(recipe.id));
      setDraft(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save the card.");
    } finally {
      setSaving(false);
    }
  }

  function toggleTick(id: string) {
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const front = (
    <>
      <section aria-label="Ingredients" className="phone-cv__band">
        <h3 className="phone-cv__label">
          <button
            aria-expanded={bandOpen}
            className="phone-cv__band-toggle"
            type="button"
            onClick={() => setBandOpen(!bandOpen)}
          >
            Ingredients ({lines.length})
            <span aria-hidden="true" className="phone-cv__chevron">
              ▾
            </span>
          </button>
        </h3>
        {bandOpen ? (
          lines.length > 0 ? (
            <ul className="phone-cv__ingredients">
              {lines.map((line, index) => (
                <li key={line.id}>
                  {draft ? (
                    <input
                      aria-label={`Ingredient ${index + 1}`}
                      className="phone-cv__input"
                      value={draft.lines[line.id] ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          lines: { ...draft.lines, [line.id]: event.target.value },
                        })
                      }
                    />
                  ) : (
                    <label className="phone-cv__tick">
                      <input
                        checked={ticked.has(line.id)}
                        type="checkbox"
                        onChange={() => toggleTick(line.id)}
                      />
                      <span>{ingredientText(line)}</span>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="phone-cv__empty">No ingredients yet.</p>
          )
        ) : null}
      </section>

      <section aria-label="Steps" className="phone-cv__steps">
        <h3 className="phone-cv__label">Steps</h3>
        {steps.length > 0 ? (
          <ol className="phone-cv__step-list">
            {steps.map((step, index) => (
              <li key={step.id}>
                {draft ? (
                  <textarea
                    aria-label={`Step ${index + 1}`}
                    className="phone-cv__input"
                    rows={3}
                    value={draft.steps[step.id] ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        steps: { ...draft.steps, [step.id]: event.target.value },
                      })
                    }
                  />
                ) : (
                  <button
                    aria-current={currentStep === step.id ? "step" : undefined}
                    className="phone-cv__step"
                    type="button"
                    onClick={() => setCurrentStep(currentStep === step.id ? null : step.id)}
                  >
                    {step.body}
                  </button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="phone-cv__empty">No steps yet.</p>
        )}
      </section>
    </>
  );

  const back = (
    <div className="phone-cv__back">
      <h3 className="phone-cv__label">Notes</h3>
      {draft ? (
        <>
          <textarea
            aria-label="Notes"
            className="phone-cv__input"
            rows={3}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
          <textarea
            aria-label="Equipment"
            className="phone-cv__input"
            placeholder="Equipment"
            rows={2}
            value={draft.equipment}
            onChange={(event) => setDraft({ ...draft, equipment: event.target.value })}
          />
        </>
      ) : recipe.description || recipe.equipment_notes ? (
        <>
          {recipe.description ? <p>{recipe.description}</p> : null}
          {recipe.equipment_notes ? <p>Equipment: {recipe.equipment_notes}</p> : null}
        </>
      ) : (
        <p className="phone-cv__empty">No notes yet.</p>
      )}
      <h3 className="phone-cv__label">Source</h3>
      <p>{sourceLabel(recipe)}</p>
      {recipe.hero_image ? (
        <img alt="Original photo or scan" className="phone-cv__scan" src={recipe.hero_image} />
      ) : null}
    </div>
  );

  return (
    <div aria-label={recipe.title} aria-modal="true" className="phone-cv" role="dialog">
      <header className="phone-cv__head">
        <div className="phone-cv__heading">
          {draft ? (
            <input
              aria-label="Title"
              className="phone-cv__input phone-cv__title-input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          ) : (
            <h2 className="phone-cv__title">{recipe.title}</h2>
          )}
          {draft ? (
            <div className="phone-cv__meta-fields">
              <label>
                Prep
                <input
                  className="phone-cv__input"
                  inputMode="numeric"
                  placeholder="min"
                  value={draft.prep}
                  onChange={(event) => setDraft({ ...draft, prep: event.target.value })}
                />
              </label>
              <label>
                Cook
                <input
                  className="phone-cv__input"
                  inputMode="numeric"
                  placeholder="min"
                  value={draft.cook}
                  onChange={(event) => setDraft({ ...draft, cook: event.target.value })}
                />
              </label>
            </div>
          ) : meta ? (
            <p className="phone-cv__meta">{meta}</p>
          ) : null}
        </div>
        <div className="phone-cv__controls">
          {canWake ? (
            <button
              aria-label="Keep screen on"
              aria-pressed={awake}
              className="phone-cv__icon phone-cv__sun"
              title={awake ? "Screen stays on" : "Screen can turn off"}
              type="button"
              onClick={() => setAwake(!awake)}
            >
              ☀
            </button>
          ) : null}
          {draft || !onEdit ? null : (
            <div ref={menuRef} className="phone-cv__menu-wrap">
              <button
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Card menu"
                className="phone-cv__icon"
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ⋯
              </button>
              {menuOpen ? (
                <ul className="phone-cv__menu" role="menu">
                  <li role="none">
                    <button role="menuitem" type="button" onClick={startEditing}>
                      Edit card
                    </button>
                  </li>
                  <li role="none">
                    <button role="menuitem" type="button" onClick={onEdit}>
                      Full editor
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          )}
          <button ref={closeRef} className="phone-box-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </header>

      {error ? (
        <p className="phone-cv__error" role="alert">
          {error}
        </p>
      ) : null}

      <div key={side} className={`phone-cv__face phone-cv__face--${side}`}>
        {side === "front" ? front : back}
      </div>

      <footer className="phone-cv__tools">
        <span aria-live="polite" className="phone-cv__side">
          {side === "front" ? "Front" : "Back"}
        </span>
        <button
          className="phone-box-btn"
          type="button"
          onClick={() => setSide(side === "front" ? "back" : "front")}
        >
          Turn over
        </button>
        {editing ? (
          <>
            <button
              className="phone-box-btn"
              disabled={saving}
              type="button"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
            <button
              className="phone-box-btn phone-box-btn--primary"
              disabled={saving}
              type="button"
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Done"}
            </button>
          </>
        ) : null}
      </footer>
    </div>
  );
}
