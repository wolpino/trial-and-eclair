import { useEffect, useRef, useState } from "react";

import type { CollectionRecipe } from "../../../api/collection";
import { ingredientText, metaText, sourceLabel } from "./cardText";

type PhoneCardViewProps = {
  recipe: CollectionRecipe;
  onClose: () => void;
  onEdit: () => void;
};

export function PhoneCardView({ recipe, onClose, onEdit }: PhoneCardViewProps) {
  const [side, setSide] = useState<"front" | "back">("front");
  const closeRef = useRef<HTMLButtonElement>(null);
  const meta = metaText(recipe);
  const titleId = `phone-card-${recipe.id}`;

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="phone-box-cardview"
      role="dialog"
    >
      <header className="phone-box-cardview__head">
        <h2 className="phone-box-card__title" id={titleId}>
          {recipe.title}
        </h2>
        <button ref={closeRef} className="phone-box-btn" type="button" onClick={onClose}>
          Close
        </button>
      </header>

      <div key={side} className="phone-box-cardview__face">
        {side === "front" ? (
          <>
            {meta ? <p className="phone-box-card__meta">{meta}</p> : null}
            <h3 className="phone-box-card__label">Ingredients</h3>
            {recipe.ingredient_lines.length > 0 ? (
              <ul className="phone-box-card__list">
                {recipe.ingredient_lines.map((line) => (
                  <li key={line.id}>{ingredientText(line)}</li>
                ))}
              </ul>
            ) : (
              <p className="phone-box-card__empty">No ingredients yet.</p>
            )}
            <h3 className="phone-box-card__label">Directions</h3>
            {recipe.steps.length > 0 ? (
              <ol className="phone-box-card__list">
                {recipe.steps.map((step) => (
                  <li key={step.id}>{step.body}</li>
                ))}
              </ol>
            ) : (
              <p className="phone-box-card__empty">No steps yet.</p>
            )}
          </>
        ) : (
          <>
            <h3 className="phone-box-card__label">Notes</h3>
            {recipe.description || recipe.equipment_notes ? (
              <>
                {recipe.description ? <p>{recipe.description}</p> : null}
                {recipe.equipment_notes ? <p>Equipment: {recipe.equipment_notes}</p> : null}
              </>
            ) : (
              <p className="phone-box-card__empty">No notes yet.</p>
            )}
            <h3 className="phone-box-card__label">Source</h3>
            <p>{sourceLabel(recipe)}</p>
          </>
        )}
      </div>

      <footer className="phone-box-cardview__tools">
        <span className="phone-box-card__meta" aria-live="polite">
          {side === "front" ? "Front" : "Back"}
        </span>
        <button
          className="phone-box-btn"
          type="button"
          onClick={() => setSide(side === "front" ? "back" : "front")}
        >
          Flip card
        </button>
        <button className="phone-box-btn phone-box-btn--primary" type="button" onClick={onEdit}>
          Edit
        </button>
      </footer>
    </div>
  );
}
