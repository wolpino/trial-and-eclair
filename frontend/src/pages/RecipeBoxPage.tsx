import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  createRecipeBoxRecipe,
  fetchRecipeBox,
  type CollectionRecipe,
} from "../api/collection";
import { RecipeBoxCard } from "../components/recipe-box/RecipeBoxCard";
import { RecipeBoxFrame } from "../components/recipe-box/RecipeBoxFrame";
import { RecipeBoxIndex } from "../components/recipe-box/RecipeBoxIndex";
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

function letterForRecipe(recipe: CollectionRecipe): string {
  return recipe.title.charAt(0).toUpperCase() || "#";
}

export function RecipeBoxPage() {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<CollectionRecipe[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeLetter, setActiveLetter] = useState("");

  const grouped = useMemo(() => groupByLetter(recipes), [recipes]);
  const letters = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const focusedRecipe = useMemo(
    () => (recipeId ? recipes.find((recipe) => recipe.id === recipeId) : undefined),
    [recipeId, recipes],
  );

  useEffect(() => {
    fetchRecipeBox()
      .then((items) => setRecipes(sortRecipes(items)))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load recipe box.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (letters.length === 0) {
      return;
    }
    if (focusedRecipe) {
      const letter = letterForRecipe(focusedRecipe);
      if (letters.includes(letter)) {
        setActiveLetter(letter);
      }
      return;
    }
    if (!activeLetter || !letters.includes(activeLetter)) {
      setActiveLetter(letters[0]!);
    }
  }, [letters, focusedRecipe, activeLetter]);

  function upsertRecipe(updated: CollectionRecipe) {
    setRecipes((current) => sortRecipes([...current.filter((r) => r.id !== updated.id), updated]));
    setActiveLetter(letterForRecipe(updated));
  }

  function focusCard(id: string) {
    navigate(`/recipe-box/${id}`);
  }

  function collapseCard() {
    navigate("/recipe-box");
  }

  async function handleAddCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const recipe = await createRecipeBoxRecipe(newTitle.trim() || "Untitled recipe");
      setRecipes((current) => sortRecipes([...current, recipe]));
      setNewTitle("");
      setActiveLetter(letterForRecipe(recipe));
      navigate(`/recipe-box/${recipe.id}`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not add card.");
    } finally {
      setAdding(false);
    }
  }

  const lidContent = focusedRecipe ? (
    <RecipeBoxCard
      expanded
      recipe={focusedRecipe}
      onCollapse={collapseCard}
      onSaved={upsertRecipe}
    />
  ) : (
    <div className="recipe-box-lid__empty">
      <p className="recipe-box-lid__empty-title">Open your recipe box</p>
      <p className="recipe-box-lid__empty-note">Pick a card below to read and edit it here in the lid.</p>
    </div>
  );

  return (
    <main className="recipe-box-page">
      <header className="recipe-box-page__header">
        <h1>Recipe box</h1>
        <p className="recipe-box-page__note">
          The lid holds the card you are working on; the box below is your A–Z collection.
        </p>
        <form className="recipe-box-add" onSubmit={(event) => void handleAddCard(event)}>
          {error ? <p className="recipe-box-form-error">{error}</p> : null}
          <input
            placeholder="New card title (optional)"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <button className="recipe-box-btn" disabled={adding} type="submit">
            {adding ? "Adding…" : "Add card"}
          </button>
        </form>
      </header>

      <RecipeBoxFrame lid={lidContent}>
        {loading ? (
          <p className="recipe-box-page__note">Loading…</p>
        ) : recipes.length === 0 ? (
          <p className="recipe-box-empty">Your recipe box is empty — add a card above.</p>
        ) : (
          <RecipeBoxIndex
            activeLetter={activeLetter}
            grouped={grouped}
            letters={letters}
            selectedRecipeId={recipeId}
            onLetterSelect={setActiveLetter}
            onRecipeSelect={focusCard}
          />
        )}
      </RecipeBoxFrame>
    </main>
  );
}
