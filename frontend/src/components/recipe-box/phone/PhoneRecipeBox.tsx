import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import type { CollectionRecipe } from "../../../api/collection";
import { PhoneCardView } from "./PhoneCardView";
import { TAB_KEYS, ingredientText, metaText, tabKey } from "./cardText";
import "./phone-box.css";

type PhoneRecipeBoxProps = {
  recipes: CollectionRecipe[];
  selected: CollectionRecipe | undefined;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAddFirst: () => void;
};

const LID_STEP_PREVIEW = 2;

export function PhoneRecipeBox({
  recipes,
  selected,
  onSelect,
  onEdit,
  onAddFirst,
}: PhoneRecipeBoxProps) {
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const byTab = useMemo(() => {
    const groups: Record<string, CollectionRecipe[]> = {};
    for (const recipe of recipes) {
      const key = tabKey(recipe);
      groups[key] = [...(groups[key] ?? []), recipe];
    }
    return groups;
  }, [recipes]);

  useEffect(() => {
    if (!openTab) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenTab(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openTab]);

  const closeCardView = useCallback(() => {
    setCardViewOpen(false);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }, []);

  const meta = selected ? metaText(selected) : "";
  const fanCards = openTab ? (byTab[openTab] ?? []) : [];

  return (
    <div className="phone-box">
      <section aria-label="Selected recipe" className="phone-box-lid">
        {selected ? (
          <article
            key={selected.id}
            className="phone-box-card phone-box-lid__card"
            onClick={() => setCardViewOpen(true)}
          >
            <h2 className="phone-box-card__title">{selected.title}</h2>
            {meta ? <p className="phone-box-card__meta">{meta}</p> : null}
            {selected.ingredient_lines.length > 0 ? (
              <>
                <h3 className="phone-box-card__label">Ingredients</h3>
                <ul className="phone-box-card__list">
                  {selected.ingredient_lines.map((line) => (
                    <li key={line.id}>{ingredientText(line)}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {selected.steps.length > 0 ? (
              <>
                <h3 className="phone-box-card__label">Directions</h3>
                <ol className="phone-box-card__list">
                  {selected.steps.slice(0, LID_STEP_PREVIEW).map((step) => (
                    <li key={step.id}>{step.body}</li>
                  ))}
                </ol>
              </>
            ) : null}
            {selected.ingredient_lines.length === 0 && selected.steps.length === 0 ? (
              <p className="phone-box-card__empty">
                {selected.description || "No ingredients or steps yet."}
              </p>
            ) : null}
            <button
              ref={openButtonRef}
              className="phone-box-btn phone-box-lid__open"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setCardViewOpen(true);
              }}
            >
              Open recipe
            </button>
          </article>
        ) : (
          <div className="phone-box-card phone-box-lid__card phone-box-lid__card--empty">
            <button className="phone-box-btn phone-box-btn--primary" type="button" onClick={onAddFirst}>
              Add your first recipe
            </button>
          </div>
        )}
      </section>

      <section aria-label="Recipe box" className="phone-box-front">
        {openTab ? (
          <ul aria-label={`Cards under ${openTab}`} className="phone-box-fan" id="phone-box-fan">
            {fanCards.map((recipe, index) => (
              <li key={recipe.id} style={{ "--i": index } as CSSProperties}>
                <button
                  aria-current={recipe.id === selected?.id ? "true" : undefined}
                  className="phone-box-fan__card"
                  type="button"
                  onClick={() => {
                    onSelect(recipe.id);
                    setOpenTab(null);
                  }}
                >
                  {recipe.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div aria-label="Divider tabs" className="phone-box-tabs" role="group">
          {TAB_KEYS.map((key) => {
            const count = byTab[key]?.length ?? 0;
            const open = openTab === key;
            return (
              <button
                key={key}
                aria-controls={open ? "phone-box-fan" : undefined}
                aria-expanded={open}
                aria-label={`${key}, ${count} ${count === 1 ? "card" : "cards"}`}
                className="phone-box-tab"
                disabled={count === 0}
                type="button"
                onClick={() => setOpenTab(open ? null : key)}
              >
                {key}
              </button>
            );
          })}
        </div>
        <div aria-hidden="true" className="phone-box-front__panel">
          Recipes
        </div>
      </section>

      {cardViewOpen && selected ? (
        <PhoneCardView
          recipe={selected}
          onClose={closeCardView}
          onEdit={() => onEdit(selected.id)}
        />
      ) : null}
    </div>
  );
}
