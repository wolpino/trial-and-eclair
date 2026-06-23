import { apiFetch } from "./client";

export interface Ingredient {
  id: string;
  name: string;
  default_unit: string;
}

export function searchIngredients(query: string): Promise<Ingredient[]> {
  const params = new URLSearchParams({ search: query });
  return apiFetch<Ingredient[]>(`/api/v1/ingredients/?${params}`);
}

export function resolveIngredient(name: string): Promise<Ingredient> {
  return apiFetch<Ingredient>("/api/v1/ingredients/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() }),
  });
}
