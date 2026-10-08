import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { resolveIngredient } from "../api/catalog";
import {
  createBoxIngredientLine,
  createBoxStep,
  createRecipeBoxRecipe,
  deleteRecipeBoxRecipe,
  fetchRecipeBox,
  fetchRecipeBoxRecipe,
  type CollectionRecipe,
} from "../api/collection";
import { useAuth } from "../auth/AuthContext";
import { RecipeBoxCard } from "../components/recipe-box/RecipeBoxCard";
import { RecipeBoxFrame } from "../components/recipe-box/RecipeBoxFrame";
import { RecipeBoxIndex } from "../components/recipe-box/RecipeBoxIndex";
import { RecipeImportPanel } from "../components/RecipeImportPanel";
import { usePhoneLayout } from "../lib/usePhoneLayout";
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

function errorText(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

async function addFirstDetail(
  recipeId: string,
  ingredientName: string,
  stepBody: string,
): Promise<void> {
  if (ingredientName) {
    const ingredient = await resolveIngredient(ingredientName);
    await createBoxIngredientLine(recipeId, {
      ingredient: ingredient.id,
      quantity: "1",
    });
    return;
  }
  await createBoxStep(recipeId, { order: 1, body: stepBody });
}

export function RecipeBoxPage() {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPhone = usePhoneLayout();
  const isHomeCook = user?.role === "home_cook";

  const [recipes, setRecipes] = useState<CollectionRecipe[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [stepBody, setStepBody] = useState("");
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
        setError(errorText(err, "Could not load recipe box."));
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

  function clearAddForm() {
    setNewTitle("");
    setIngredientName("");
    setStepBody("");
  }

  async function handleDelete(id: string) {
    try {
      await deleteRecipeBoxRecipe(id);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
      setError(null);
      if (recipeId === id) {
        navigate("/recipe-box");
      }
    } catch (err: unknown) {
      setError(errorText(err, "Could not delete card."));
    }
  }

  async function handleAddCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    const ingredient = ingredientName.trim();
    const step = stepBody.trim();
    if (isHomeCook && !title) {
      setError("Add a title.");
      return;
    }
    if (isHomeCook && !ingredient && !step) {
      setError("Add an ingredient or a step.");
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const created = await createRecipeBoxRecipe(title || "Untitled recipe");
      upsertRecipe(created);
      let saved = created;
      if (isHomeCook) {
        try {
          await addFirstDetail(created.id, ingredient, step);
        } catch (err: unknown) {
          clearAddForm();
          navigate(`/recipe-box/${created.id}`);
          setError(
            errorText(err, "The card was saved, but the ingredient or step was not."),
          );
          return;
        }
        try {
          saved = await fetchRecipeBoxRecipe(created.id);
        } catch {
          saved = created;
        }
      }
      upsertRecipe(saved);
      clearAddForm();
      navigate(`/recipe-box/${saved.id}`);
    } catch (err: unknown) {
      setError(errorText(err, "Could not add card."));
    } finally {
      setAdding(false);
    }
  }

  const addForm = (
    <form className="recipe-box-add" onSubmit={(event) => void handleAddCard(event)}>
      {error ? <p className="recipe-box-form-error">{error}</p> : null}
      {isHomeCook ? (
        <>
          <label className="recipe-box-add__field">
            Title
            <input
              required
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </label>
          <label className="recipe-box-add__field">
            Ingredient
            <input
              value={ingredientName}
              onChange={(event) => setIngredientName(event.target.value)}
            />
          </label>
          <label className="recipe-box-add__field">
            Step
            <input value={stepBody} onChange={(event) => setStepBody(event.target.value)} />
          </label>
          <p className="recipe-box-page__note">Add an ingredient or a step.</p>
        </>
      ) : (
        <input
          placeholder="New card title (optional)"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
        />
      )}
      <button className="recipe-box-btn" disabled={adding} type="submit">
        {adding ? "Adding…" : "Add card"}
      </button>
    </form>
  );

  let collection: ReactNode;
  if (loading) {
    collection = <p className="recipe-box-page__note">Loading…</p>;
  } else if (recipes.length === 0) {
    collection = (
      <p className="recipe-box-empty">Your recipe box is empty — add a card above.</p>
    );
  } else {
    collection = (
      <RecipeBoxIndex
        activeLetter={activeLetter}
        grouped={grouped}
        letters={letters}
        selectedRecipeId={recipeId}
        onLetterSelect={setActiveLetter}
        onRecipeSelect={focusCard}
        onDelete={(id) => void handleDelete(id)}
      />
    );
  }

  if (isPhone && recipeId) {
    return (
      <main className="recipe-box-page recipe-box-page--phone recipe-box-page--phone-card">
        <Link className="recipe-box-back" to="/recipe-box">
          Back to list
        </Link>
        {error ? <p className="recipe-box-form-error">{error}</p> : null}
        {focusedRecipe ? (
          <RecipeBoxCard
            expanded
            recipe={focusedRecipe}
            onCollapse={collapseCard}
            onSaved={upsertRecipe}
            onDelete={() => void handleDelete(focusedRecipe.id)}
          />
        ) : loading ? (
          <p className="recipe-box-page__note">Loading…</p>
        ) : (
          <p className="recipe-box-page__note">That card is not in your box.</p>
        )}
      </main>
    );
  }

  if (isPhone) {
    return (
      <main className="recipe-box-page recipe-box-page--phone">
        <header className="recipe-box-page__header">
          <h1>Recipe box</h1>
          <RecipeImportPanel destination="box" />
          {addForm}
        </header>
        {collection}
      </main>
    );
  }

  const lidContent = focusedRecipe ? (
    <RecipeBoxCard
      expanded
      recipe={focusedRecipe}
      onCollapse={collapseCard}
      onSaved={upsertRecipe}
      onDelete={() => void handleDelete(focusedRecipe.id)}
    />
  ) : (
    <div className="recipe-box-lid__empty">
      <p className="recipe-box-lid__empty-title">Open your recipe box</p>
      <p className="recipe-box-lid__empty-note">
        Pick a card below to read and edit it here in the lid.
      </p>
    </div>
  );

  return (
    <main className="recipe-box-page">
      <header className="recipe-box-page__header">
        <h1>Recipe box</h1>
        <p className="recipe-box-page__note">
          The lid holds the card you are working on; the box below is your A–Z collection.
        </p>
        {addForm}
        <RecipeImportPanel destination="box" />
      </header>
      <RecipeBoxFrame lid={lidContent}>{collection}</RecipeBoxFrame>
    </main>
  );
}
