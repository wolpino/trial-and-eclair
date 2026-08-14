import { type CSSProperties, type KeyboardEvent } from "react";

import type { CollectionRecipe } from "../../api/collection";

type RecipeBoxIndexProps = {
  grouped: Record<string, CollectionRecipe[]>;
  letters: string[];
  activeLetter: string;
  selectedRecipeId?: string;
  onLetterSelect: (letter: string) => void;
  onRecipeSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function confirmDelete(title: string): boolean {
  return window.confirm(`Delete "${title}" from your recipe box? This cannot be undone.`);
}

const TABS_PER_ROW = 8;

function tabPlacement(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / TABS_PER_ROW),
    col: index % TABS_PER_ROW,
  };
}

function formatTiming(recipe: CollectionRecipe): string | null {
  const parts: string[] = [];
  if (recipe.prep_minutes != null) {
    parts.push(`Prep ${recipe.prep_minutes} min`);
  }
  if (recipe.cook_minutes != null) {
    parts.push(`Cook ${recipe.cook_minutes} min`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function RecipeBoxIndex({
  grouped,
  letters,
  activeLetter,
  selectedRecipeId,
  onLetterSelect,
  onRecipeSelect,
  onDelete,
}: RecipeBoxIndexProps) {
  const activeRecipes = grouped[activeLetter] ?? [];

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    letter: string,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + delta + letters.length) % letters.length;
      const nextLetter = letters[nextIndex]!;
      onLetterSelect(nextLetter);
      document.getElementById(`tab-${nextLetter}`)?.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onLetterSelect(letter);
    }
  }

  return (
    <div className="recipe-box-index">
      <div className="recipe-box-index__band" role="tablist" aria-label="A–Z index">
        {letters.map((letter, index) => {
          const { row, col } = tabPlacement(index);
          const active = letter === activeLetter;
          return (
            <button
              key={letter}
              id={`tab-${letter}`}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? "recipe-box-tab recipe-box-tab--active" : "recipe-box-tab"}
              style={{ "--tab-row": row, "--tab-col": col } as CSSProperties}
              onClick={() => onLetterSelect(letter)}
              onKeyDown={(event) => handleTabKeyDown(event, letter, index)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div
        className="recipe-box-index__stack"
        role="tabpanel"
        id={`panel-${activeLetter}`}
        aria-labelledby={`tab-${activeLetter}`}
      >
        <div className="recipe-box-index__card-edges" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="recipe-box-index__card-edge" />
          ))}
        </div>

        {activeRecipes.length === 0 ? (
          <p className="recipe-box-index__empty">No recipes under {activeLetter}.</p>
        ) : (
          <ul className="recipe-box-index__list">
            {activeRecipes.map((recipe) => {
              const timing = formatTiming(recipe);
              const selected = recipe.id === selectedRecipeId;
              return (
                <li key={recipe.id} className="recipe-box-index__item">
                  <button
                    type="button"
                    className={
                      selected
                        ? "recipe-box-index__row recipe-box-index__row--selected"
                        : "recipe-box-index__row"
                    }
                    onClick={() => onRecipeSelect(recipe.id)}
                  >
                    <span className="recipe-box-index__row-title">{recipe.title}</span>
                    {timing ? (
                      <span className="recipe-box-index__row-meta">{timing}</span>
                    ) : null}
                  </button>
                  <button
                    className="recipe-box-index__delete"
                    type="button"
                    aria-label={`Delete ${recipe.title}`}
                    onClick={() => {
                      if (confirmDelete(recipe.title)) {
                        onDelete(recipe.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
