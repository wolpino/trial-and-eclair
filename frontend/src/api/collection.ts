import { apiFetch } from "./client";
import type { IngredientLine, RecipeStep } from "./development";

export interface CollectionRecipe {
  id: string;
  title: string;
  description: string;
  equipment_notes: string;
  prep_minutes: number | null;
  cook_minutes: number | null;
  hero_image: string | null;
  ingredient_lines: IngredientLine[];
  steps: RecipeStep[];
  created_at: string;
  updated_at: string;
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
