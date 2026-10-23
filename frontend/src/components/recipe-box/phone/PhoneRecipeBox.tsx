import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import type { User } from "../../../api/client";
import type { BoxCard, CollectionRecipe } from "../../../api/collection";
import { useAuth } from "../../../auth/AuthContext";
import { useDismiss } from "../../../lib/useDismiss";
import { PhoneBoxTabs } from "./PhoneBoxTabs";
import { PhoneCardView } from "./PhoneCardView";
import { ingredientText, metaText, tabKey } from "./cardText";
import "./phone-box.css";

type PhoneRecipeBoxProps = {
  /** The person's cards and the starter cards, sorted A–Z together. */
  recipes: BoxCard[];
  selected: BoxCard | undefined;
  menu: ReactNode;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onSaved: (recipe: CollectionRecipe) => void;
  onAdd: () => void;
  onFork: (starter: BoxCard) => void;
  /** Only signed-up people can hide a starter card (decision 002). */
  onHide?: (starter: BoxCard) => void;
  busy?: boolean;
};

const LID_STEP_PREVIEW = 2;

/** Engraved on the box front: "Ari's Recipes · est. 2026" (decision 003, Box label). */
function boxLabel(user: User | null): string {
  if (!user) {
    return "Recipes";
  }
  if (user.is_guest) {
    return `Recipes · est. ${user.date_joined.slice(0, 4)}`;
  }
  return `${user.first_name || user.username}'s Recipes · est. ${user.date_joined.slice(0, 4)}`;
}

export function PhoneRecipeBox({
  recipes,
  selected,
  menu,
  onSelect,
  onEdit,
  onSaved,
  onAdd,
  onFork,
  onHide,
  busy = false,
}: PhoneRecipeBoxProps) {
  const { user } = useAuth();
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const lidCardRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const byTab = useMemo(() => {
    const groups: Record<string, BoxCard[]> = {};
    for (const recipe of recipes) {
      const key = tabKey(recipe);
      groups[key] = [...(groups[key] ?? []), recipe];
    }
    return groups;
  }, [recipes]);

  const closeFan = useCallback(() => setOpenTab(null), []);
  useDismiss(tabsRef, openTab !== null, closeFan);

  const openTabKey = useCallback(
    (key: string | null) => {
      setOpenTab(key);
      if (key) {
        const count = byTab[key]?.length ?? 0;
        setAnnouncement(`${key}, ${count} ${count === 1 ? "card" : "cards"}`);
      }
    },
    [byTab],
  );

  const closeCardView = useCallback(() => {
    setCardViewOpen(false);
    requestAnimationFrame(() => lidCardRef.current?.focus());
  }, []);

  const meta = selected ? metaText(selected) : "";

  return (
    <div className="phone-box">
      <section aria-label="Selected recipe" className="phone-box-lid">
        {selected ? (
          <>
            <article
              ref={lidCardRef}
              key={selected.id}
              className="phone-box-lid__card"
              tabIndex={0}
              onClick={() => setCardViewOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setCardViewOpen(true);
                }
              }}
            >
              {selected.is_starter ? <p className="phone-box-starter">Starter card</p> : null}
              <h2 className="phone-box-lid__title">{selected.title}</h2>
              {meta ? <p className="phone-box-lid__meta">{meta}</p> : null}
              {selected.ingredient_lines.length > 0 ? (
                <>
                  <h3 className="phone-box-lid__label">Ingredients</h3>
                  <ul className="phone-box-lid__list">
                    {selected.ingredient_lines.map((line) => (
                      <li key={line.id}>{ingredientText(line)}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {selected.steps.length > 0 ? (
                <>
                  <h3 className="phone-box-lid__label">Directions</h3>
                  <ol className="phone-box-lid__list">
                    {selected.steps.slice(0, LID_STEP_PREVIEW).map((step) => (
                      <li key={step.id}>{step.body}</li>
                    ))}
                  </ol>
                </>
              ) : null}
              {selected.ingredient_lines.length === 0 && selected.steps.length === 0 ? (
                <p className="phone-box-lid__empty">
                  {selected.description || "No ingredients or steps yet."}
                </p>
              ) : null}
            </article>
            {selected.is_starter ? (
              <div className="phone-box-lid__actions">
                <button
                  className="phone-box-btn phone-box-btn--primary phone-box-btn--tall"
                  disabled={busy}
                  type="button"
                  onClick={() => onFork(selected)}
                >
                  Fork to my box
                </button>
                {onHide ? (
                  <button
                    className="phone-box-btn phone-box-btn--tall"
                    disabled={busy}
                    type="button"
                    onClick={() => onHide(selected)}
                  >
                    Hide
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="phone-box-lid__card phone-box-lid__card--empty">
            <button className="phone-box-btn phone-box-btn--primary" type="button" onClick={onAdd}>
              Add your first recipe
            </button>
          </div>
        )}
        <div className="phone-box-lid__menu">{menu}</div>
      </section>

      <section aria-label="Recipe box" className="phone-box-box">
        <div aria-hidden="true" className="phone-box-stack" />
        {/* The fan and the tabs; a press anywhere else closes the fan. */}
        <div ref={tabsRef} style={{ display: "contents" }}>
          <PhoneBoxTabs
            byTab={byTab}
            openTab={openTab}
            selectedId={selected?.id}
            onOpenTab={openTabKey}
            onPick={(recipe) => {
              onSelect(recipe.id);
              setOpenTab(null);
              setAnnouncement(`${recipe.title} selected`);
            }}
          />
        </div>
        <div className="phone-box-front">
          <i aria-hidden="true" className="phone-box-latch" />
          {boxLabel(user)}
        </div>
      </section>

      {!openTab && !cardViewOpen ? (
        <button aria-label="Add recipe" className="phone-box-plus" type="button" onClick={onAdd}>
          +
        </button>
      ) : null}

      <p aria-live="polite" className="phone-box-sr">
        {announcement}
      </p>

      {cardViewOpen && selected ? (
        <PhoneCardView
          recipe={selected}
          onClose={closeCardView}
          onEdit={selected.is_starter ? undefined : () => onEdit(selected.id)}
          onSaved={onSaved}
        />
      ) : null}
    </div>
  );
}
