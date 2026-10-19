import { apiFetch } from "./client";
import type { RecipeStep } from "./development";

// Box lines differ from Notebook lines: imports leave ingredient and quantity
// null and keep the original text in raw_text.
export interface IngredientLine {
  id: string;
  ingredient: string | null;
  ingredient_name: string | null;
  raw_text: string;
  quantity: string | null;
  unit: string;
  custom_unit: string;
  prep_note: string;
  substitution_note: string;
  sort_order: number;
}

export type RecipeSourceType =
  | "typed"
  | "handwritten"
  | "recipe_card"
  | "cookbook"
  | "web"
  | "scan";

export interface CollectionRecipe {
  id: string;
  title: string;
  description: string;
  equipment_notes: string;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  source_type: RecipeSourceType;
  hero_image: string | null;
  ingredient_lines: IngredientLine[];
  steps: RecipeStep[];
  created_at: string;
  updated_at: string;
}

/** A card the person owns, or a shared read-only starter card (decision 002). */
export type BoxCard = CollectionRecipe & { is_starter?: boolean };

/** Starter lines and steps come with null ids; give them stable ones for keys. */
function withStarterIds(starter: BoxCard): BoxCard {
  return {
    ...starter,
    is_starter: true,
    ingredient_lines: starter.ingredient_lines.map((line, index) => ({
      ...line,
      id: line.id ?? `${starter.id}-line-${index}`,
    })),
    steps: starter.steps.map((step, index) => ({
      ...step,
      id: step.id ?? `${starter.id}-step-${index}`,
    })),
  };
}

export async function fetchStarterRecipes(): Promise<BoxCard[]> {
  const starters = await apiFetch<BoxCard[]>("/api/v1/starter-recipes/");
  return starters.map(withStarterIds);
}

/** Copies a starter card into the box. For a guest it uses one of the 5 slots. */
export function forkStarterRecipe(id: string): Promise<CollectionRecipe> {
  return apiFetch<CollectionRecipe>(`/api/v1/starter-recipes/${id}/fork/`, { method: "POST" });
}

/** Hides a starter card for this person only. Signed-up people only. */
export function hideStarterRecipe(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/starter-recipes/${id}/hide/`, { method: "POST" });
}

export function fetchRecipeBox(): Promise<CollectionRecipe[]> {
  return apiFetch<CollectionRecipe[]>("/api/v1/recipe-box/");
}

export function fetchRecipeBoxRecipe(id: string): Promise<CollectionRecipe> {
  return apiFetch<CollectionRecipe>(`/api/v1/recipe-box/${id}/`);
}

export function createRecipeBoxRecipe(
  title: string,
): Promise<CollectionRecipe> {
  return apiFetch<CollectionRecipe>("/api/v1/recipe-box/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function patchRecipeBoxRecipe(
  id: string,
  data: Partial<
    Pick<
      CollectionRecipe,
      | "title"
      | "description"
      | "equipment_notes"
      | "prep_minutes"
      | "cook_minutes"
    >
  >,
): Promise<CollectionRecipe> {
  return apiFetch<CollectionRecipe>(`/api/v1/recipe-box/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteRecipeBoxRecipe(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/recipe-box/${id}/`, { method: "DELETE" });
}

export function createBoxIngredientLine(
  recipeId: string,
  data: {
    ingredient: string;
    quantity: string;
    unit?: string;
    custom_unit?: string;
    prep_note?: string;
    sort_order?: number;
  },
): Promise<IngredientLine> {
  return apiFetch<IngredientLine>(
    `/api/v1/recipe-box/${recipeId}/ingredient-lines/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function deleteBoxIngredientLine(
  recipeId: string,
  lineId: string,
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/recipe-box/${recipeId}/ingredient-lines/${lineId}/`,
    { method: "DELETE" },
  );
}

export function createBoxStep(
  recipeId: string,
  data: { order: number; body: string },
): Promise<RecipeStep> {
  return apiFetch<RecipeStep>(`/api/v1/recipe-box/${recipeId}/steps/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function patchBoxStep(
  recipeId: string,
  stepId: string,
  data: Partial<Pick<RecipeStep, "order" | "body">>,
): Promise<RecipeStep> {
  return apiFetch<RecipeStep>(
    `/api/v1/recipe-box/${recipeId}/steps/${stepId}/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function deleteBoxStep(recipeId: string, stepId: string): Promise<void> {
  return apiFetch<void>(`/api/v1/recipe-box/${recipeId}/steps/${stepId}/`, {
    method: "DELETE",
  });
}
