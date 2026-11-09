import { apiFetch } from "./client";
import type { DevelopmentRecipe, Idea, RecipeVersion, TestSession } from "./development";

/** Read-only sample board and notebook for home cooks (seed/data/sample_kitchen.json). */

export interface SampleRecipeVersion extends RecipeVersion {
  test_sessions: TestSession[];
}

export interface SampleRecipe extends DevelopmentRecipe {
  versions: SampleRecipeVersion[];
}

export function fetchSampleIdeas(): Promise<Idea[]> {
  return apiFetch<Idea[]>("/api/v1/sample-ideas/");
}

export function fetchSampleRecipes(): Promise<DevelopmentRecipe[]> {
  return apiFetch<DevelopmentRecipe[]>("/api/v1/sample-recipes/");
}

export function fetchSampleRecipe(id: string): Promise<SampleRecipe> {
  return apiFetch<SampleRecipe>(`/api/v1/sample-recipes/${id}/`);
}
