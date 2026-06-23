import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createRecipeBoxRecipe,
  fetchRecipeBox,
  type CollectionRecipe,
} from "../api/collection";
import { AlphabetRail } from "../components/recipe-box/AlphabetRail";
import { RecipeBoxCard } from "../components/recipe-box/RecipeBoxCard";
import { RecipeBoxFrame } from "../components/recipe-box/RecipeBoxFrame";
import "../styles/recipe-box.css";

function sortRecipes(recipes: CollectionRecipe[]): CollectionRecipe[] {
  return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
}

function groupByLetter(recipes: CollectionRecipe[]): Record<string, CollectionRecipe[]> {
  return recipes.reduce<Record<string, CollectionRecipe[]>>((acc, recipe) => {
    const letter = recipe.title.charAt(0).toUpperCase() || "#";
    acc[letter] = acc[letter] ?? [];
    acc[letter].push(recipe);
    return acc;
  }, {});
}

export function RecipeBoxPage() {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();
  const focusedRef = useRef<HTMLDivElement | null>(null);

  const [recipes, setRecipes] = useState<CollectionRecipe[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const grouped = useMemo(() => groupByLetter(recipes), [recipes]);
  const activeLetters = useMemo(() => new Set(Object.keys(grouped)), [grouped]);
  const letters = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  useEffect(() => {
    fetchRecipeBox()
      .then((items) => setRecipes(sortRecipes(items)))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load recipe box.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (recipeId && focusedRef.current) {
      focusedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [recipeId, loading]);

  function upsertRecipe(updated: CollectionRecipe) {
    setRecipes((current) => sortRecipes([...current.filter((r) => r.id !== updated.id), updated]));
  }

  function focusCard(id: string) {
    navigate(`/recipe-box/${id}`);
  }

  function collapseCard() {
    navigate("/recipe-box");
  }

  function scrollToLetter(letter: string) {
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleAddCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const recipe = await createRecipeBoxRecipe(newTitle.trim() || "Untitled recipe");
      setRecipes((current) => sortRecipes([...current, recipe]));
      setNewTitle("");
      navigate(`/recipe-box/${recipe.id}`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not add card.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="recipe-box-page">
      <header className="recipe-box-page__header">
        <h1>Recipe box</h1>
        <p className="recipe-box-page__note">
          Index cards in your box — tap a card to edit in place. No idea required.
        </p>
      </header>

      <RecipeBoxFrame rail={<AlphabetRail activeLetters={activeLetters} onLetterClick={scrollToLetter} />}>
        <form className="recipe-box-add" onSubmit={(event) => void handleAddCard(event)}>
          {error ? <p className="recipe-box-form-error">{error}</p> : null}
          <input
            placeholder="Card title (optional)"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <button className="recipe-box-btn" disabled={adding} type="submit">
            {adding ? "Adding…" : "Add card"}
          </button>
        </form>

        {loading ? (
          <p className="recipe-box-page__note">Loading…</p>
        ) : recipes.length === 0 ? (
          <p className="recipe-box-empty">Your recipe box is empty — add a card above.</p>
        ) : (
          letters.map((letter) => (
            <section key={letter} className="recipe-box-section" id={`letter-${letter}`}>
              <h2 className="recipe-box-section__letter">{letter}</h2>
              <div className="recipe-box-grid">
                {grouped[letter].map((recipe) => {
                  const expanded = recipeId === recipe.id;
                  return (
                    <div
                      key={recipe.id}
                      className={
                        expanded
                          ? "recipe-box-card-slot recipe-box-card-slot--expanded"
                          : "recipe-box-card-slot"
                      }
                      ref={expanded ? focusedRef : undefined}
                      id={`recipe-${recipe.id}`}
                      role={expanded ? undefined : "button"}
                      tabIndex={expanded ? undefined : 0}
                      onClick={expanded ? undefined : () => focusCard(recipe.id)}
                      onKeyDown={
                        expanded
                          ? undefined
                          : (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                focusCard(recipe.id);
                              }
                            }
                      }
                    >
                      <RecipeBoxCard
                        expanded={expanded}
                        recipe={recipe}
                        onCollapse={collapseCard}
                        onSaved={upsertRecipe}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </RecipeBoxFrame>
    </main>
  );
}
