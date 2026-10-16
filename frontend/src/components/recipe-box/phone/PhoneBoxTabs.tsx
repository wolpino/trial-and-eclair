import { Fragment, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import type { CollectionRecipe } from "../../../api/collection";
import { TAB_KEYS } from "./cardText";

type PhoneBoxTabsProps = {
  byTab: Record<string, CollectionRecipe[]>;
  openTab: string | null;
  selectedId: string | undefined;
  onOpenTab: (key: string | null) => void;
  onPick: (recipe: CollectionRecipe) => void;
};

/** Above this many tabs, they stagger in two rows (decision 003). */
const ONE_ROW_MAX = 12;

/** Two staggered rows: 1st, 3rd… low in front; 2nd, 4th… high behind. Each tab is 3/N wide. */
function staggerStyle(index: number, total: number): CSSProperties {
  const n = total + 2;
  const back = index % 2 === 1;
  return {
    left: `${(index / n) * 100}%`,
    width: `${(3 / n) * 100}%`,
    top: back ? 0 : "24px",
    height: back ? "38px" : "30px",
    zIndex: back ? 1 : 2,
  };
}

/** A thin sliver for skipped letters between two tabs (one-row layout only). */
function hasGapAfter(key: string, next: string | undefined): boolean {
  const end = next ? TAB_KEYS.indexOf(next) : TAB_KEYS.length;
  return end - TAB_KEYS.indexOf(key) > 1;
}

export function PhoneBoxTabs({ byTab, openTab, selectedId, onOpenTab, onPick }: PhoneBoxTabsProps) {
  const keys = TAB_KEYS.filter((key) => (byTab[key]?.length ?? 0) > 0);
  const stagger = keys.length > ONE_ROW_MAX;
  const fanCards = openTab ? (byTab[openTab] ?? []) : [];

  const scrubbing = useRef(false);
  const scrubbed = useRef(false);
  const [bubble, setBubble] = useState<{ key: string; x: number; y: number } | null>(null);

  useEffect(() => {
    function stop() {
      scrubbing.current = false;
      setBubble(null);
    }
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== "mouse") {
      scrubbing.current = true;
      scrubbed.current = false;
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (!scrubbing.current) {
      return;
    }
    const tab = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>(".phone-box-tab");
    const key = tab?.dataset.key;
    if (!key) {
      return;
    }
    setBubble({ key, x: event.clientX, y: event.clientY });
    if (key !== openTab) {
      scrubbed.current = true;
      onOpenTab(key);
    }
  }

  return (
    <>
      {openTab ? (
        <ul aria-label={`Cards under ${openTab}`} className="phone-box-fan" id="phone-box-fan">
          {fanCards.map((recipe, index) => (
            <li key={recipe.id} style={{ "--i": index } as CSSProperties}>
              <button
                aria-current={recipe.id === selectedId ? "true" : undefined}
                className="phone-box-fan__card"
                type="button"
                onClick={() => onPick(recipe)}
              >
                {recipe.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        aria-label="Divider tabs"
        className={stagger ? "phone-box-tabs phone-box-tabs--stagger" : "phone-box-tabs"}
        role="group"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        {keys.map((key, index) => {
          const count = byTab[key]?.length ?? 0;
          const open = openTab === key;
          return (
            <Fragment key={key}>
              <button
                aria-controls={open ? "phone-box-fan" : undefined}
                aria-expanded={open}
                aria-label={`${key}, ${count} ${count === 1 ? "card" : "cards"}`}
                className="phone-box-tab"
                data-key={key}
                style={stagger ? staggerStyle(index, keys.length) : undefined}
                type="button"
                onClick={() => {
                  if (scrubbed.current) {
                    scrubbed.current = false;
                    return;
                  }
                  onOpenTab(open ? null : key);
                }}
              >
                {key}
              </button>
              {!stagger && hasGapAfter(key, keys[index + 1]) ? (
                <span aria-hidden="true" className="phone-box-sliver" />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {bubble ? (
        <div aria-hidden="true" className="phone-box-bubble" style={{ left: bubble.x, top: bubble.y }}>
          {bubble.key}
        </div>
      ) : null}
    </>
  );
}
