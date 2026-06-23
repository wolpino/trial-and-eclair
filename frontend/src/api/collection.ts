import { apiFetch } from "./client";
import type { IngredientLine } from "./development";

export interface CollectionRecipe {
  id: string;
  title: string;
  description: string;
  equipment_notes: string;
  prep_minutes: number | null;
  cook_minutes: number | null;
  hero_image: string | null;
  ingredient_lines: IngredientLine[];
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
