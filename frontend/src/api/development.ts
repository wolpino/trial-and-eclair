import { apiFetch } from "./client";

export type IdeaStatus = "researching" | "testing" | "ready" | "archived";

export interface Idea {
  id: string;
  title: string;
  notes: string;
  category_tag: string;
  status: IdeaStatus;
  is_pinned: boolean;
  image: string | null;
  promoted_recipe: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIdeaInput {
  title: string;
  image?: File;
}

export interface IngredientLine {
  id: string;
  ingredient: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
  custom_unit: string;
  prep_note: string;
  substitution_note: string;
  sort_order: number;
}

export interface RecipeStep {
  id: string;
  order: number;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeVersion {
  id: string;
  version_number: number;
  title: string;
  description: string;
  version_notes: string;
  equipment_notes: string;
  prep_minutes: number | null;
  cook_minutes: number | null;
  hero_image: string | null;
  story: string;
  ingredient_lines: IngredientLine[];
  steps: RecipeStep[];
  created_at: string;
  updated_at: string;
}

export interface DevelopmentRecipe {
  id: string;
  title: string;
  slug: string | null;
  status: "draft" | "published" | "unpublished";
  current_version: RecipeVersion;
  published_version: RecipeVersion | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VersionDiff {
  left_version: { id: string; version_number: number; version_notes: string };
  right_version: { id: string; version_number: number; version_notes: string };
  field_changes: { field: string; left: unknown; right: unknown }[];
  ingredient_changes: {
    added: { ingredient_name: string; quantity: string; unit: string }[];
    removed: { ingredient_name: string; quantity: string; unit: string }[];
    changed: {
      ingredient_name: string;
      fields: string[];
      left: Record<string, unknown>;
      right: Record<string, unknown>;
    }[];
  };
}

export interface JournalEntry {
  id: string;
  recipe: string;
  version_snapshot: string | null;
  title: string;
  body: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface TestSessionPhoto {
  id: string;
  image: string;
  caption: string;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  notes: string;
  outcome: string;
  tested_at: string;
  photos: TestSessionPhoto[];
  created_at: string;
  updated_at: string;
}

export interface CookbookEntry {
  id: string;
  recipe: string;
  snapshot_version: RecipeVersion;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Cookbook {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  status: string;
  published_at: string | null;
  entries: CookbookEntry[];
  created_at: string;
  updated_at: string;
}

export function fetchIdeas(): Promise<Idea[]> {
  return apiFetch<Idea[]>("/api/v1/ideas/");
}

export function createIdea(input: CreateIdeaInput): Promise<Idea> {
  const body = new FormData();
  body.append("title", input.title);
  if (input.image) {
    body.append("image", input.image);
  }
  return apiFetch<Idea>("/api/v1/ideas/", { method: "POST", body });
}

export function promoteIdea(id: string, title?: string): Promise<Idea> {
  return apiFetch<Idea>(`/api/v1/ideas/${id}/promote/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(title ? { title } : {}),
  });
}

export function fetchDevelopmentRecipes(): Promise<DevelopmentRecipe[]> {
  return apiFetch<DevelopmentRecipe[]>("/api/v1/recipes/");
}

export function fetchDevelopmentRecipe(id: string): Promise<DevelopmentRecipe> {
  return apiFetch<DevelopmentRecipe>(`/api/v1/recipes/${id}/`);
}

export function createDevelopmentRecipe(title: string): Promise<DevelopmentRecipe> {
  return apiFetch<DevelopmentRecipe>("/api/v1/recipes/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function deleteDevelopmentRecipe(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/recipes/${id}/`, { method: "DELETE" });
}

export function patchRecipeVersion(
  recipeId: string,
  versionId: string,
  data: Partial<
    Pick<
      RecipeVersion,
      | "title"
      | "description"
      | "version_notes"
      | "equipment_notes"
      | "prep_minutes"
      | "cook_minutes"
      | "story"
    >
  >,
): Promise<RecipeVersion> {
  return apiFetch<RecipeVersion>(
    `/api/v1/recipes/${recipeId}/versions/${versionId}/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function fetchRecipeVersions(recipeId: string): Promise<RecipeVersion[]> {
  return apiFetch<RecipeVersion[]>(`/api/v1/recipes/${recipeId}/versions/`);
}

export function saveNewVersion(
  recipeId: string,
  versionNotes = "",
): Promise<RecipeVersion> {
  return apiFetch<RecipeVersion>(
    `/api/v1/recipes/${recipeId}/save-new-version/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version_notes: versionNotes }),
    },
  );
}

export function compareVersions(
  recipeId: string,
  left: string,
  right: string,
): Promise<VersionDiff> {
  const params = new URLSearchParams({ left, right });
  return apiFetch<VersionDiff>(
    `/api/v1/recipes/${recipeId}/compare-versions/?${params}`,
  );
}

export function createVersionIngredientLine(
  versionId: string,
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
    `/api/v1/versions/${versionId}/ingredient-lines/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function deleteVersionIngredientLine(
  versionId: string,
  lineId: string,
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/versions/${versionId}/ingredient-lines/${lineId}/`,
    { method: "DELETE" },
  );
}

export function createVersionStep(
  versionId: string,
  data: { order: number; body: string },
): Promise<RecipeStep> {
  return apiFetch<RecipeStep>(`/api/v1/versions/${versionId}/steps/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function patchVersionStep(
  versionId: string,
  stepId: string,
  data: Partial<Pick<RecipeStep, "order" | "body">>,
): Promise<RecipeStep> {
  return apiFetch<RecipeStep>(
    `/api/v1/versions/${versionId}/steps/${stepId}/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function deleteVersionStep(
  versionId: string,
  stepId: string,
): Promise<void> {
  return apiFetch<void>(`/api/v1/versions/${versionId}/steps/${stepId}/`, {
    method: "DELETE",
  });
}

export function fetchTestSessions(versionId: string): Promise<TestSession[]> {
  return apiFetch<TestSession[]>(
    `/api/v1/versions/${versionId}/test-sessions/`,
  );
}

export function createTestSession(
  versionId: string,
  data: { notes?: string; outcome?: string },
): Promise<TestSession> {
  return apiFetch<TestSession>(
    `/api/v1/versions/${versionId}/test-sessions/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}

export function deleteTestSession(
  versionId: string,
  sessionId: string,
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/versions/${versionId}/test-sessions/${sessionId}/`,
    { method: "DELETE" },
  );
}

export function uploadTestSessionPhoto(
  sessionId: string,
  file: File,
  caption = "",
): Promise<TestSessionPhoto> {
  const body = new FormData();
  body.append("image", file);
  if (caption) {
    body.append("caption", caption);
  }
  return apiFetch<TestSessionPhoto>(
    `/api/v1/test-sessions/${sessionId}/photos/`,
    { method: "POST", body },
  );
}

export function deleteTestSessionPhoto(
  sessionId: string,
  photoId: string,
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/test-sessions/${sessionId}/photos/${photoId}/`,
    { method: "DELETE" },
  );
}

export function publishRecipe(
  recipeId: string,
  input: { slug?: string; story?: string; hero_image?: File },
): Promise<DevelopmentRecipe> {
  const body = new FormData();
  if (input.slug) {
    body.append("slug", input.slug);
  }
  if (input.story) {
    body.append("story", input.story);
  }
  if (input.hero_image) {
    body.append("hero_image", input.hero_image);
  }
  return apiFetch<DevelopmentRecipe>(`/api/v1/recipes/${recipeId}/publish/`, {
    method: "POST",
    body,
  });
}

export function unpublishRecipe(recipeId: string): Promise<DevelopmentRecipe> {
  return apiFetch<DevelopmentRecipe>(`/api/v1/recipes/${recipeId}/unpublish/`, {
    method: "POST",
  });
}

export function fetchJournal(recipeId?: string): Promise<JournalEntry[]> {
  const query = recipeId ? `?recipe=${recipeId}` : "";
  return apiFetch<JournalEntry[]>(`/api/v1/journal/${query}`);
}

export function createJournalEntry(data: {
  recipe: string;
  body: string;
  title?: string;
  version_snapshot?: string;
}): Promise<JournalEntry> {
  return apiFetch<JournalEntry>("/api/v1/journal/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteJournalEntry(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/journal/${id}/`, { method: "DELETE" });
}

export function fetchCookbooks(): Promise<Cookbook[]> {
  return apiFetch<Cookbook[]>("/api/v1/cookbooks/");
}

export function fetchCookbook(id: string): Promise<Cookbook> {
  return apiFetch<Cookbook>(`/api/v1/cookbooks/${id}/`);
}

export function createCookbook(data: {
  title: string;
  description?: string;
}): Promise<Cookbook> {
  return apiFetch<Cookbook>("/api/v1/cookbooks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function addCookbookEntry(
  cookbookId: string,
  recipeId: string,
): Promise<CookbookEntry> {
  return apiFetch<CookbookEntry>(
    `/api/v1/cookbooks/${cookbookId}/entries/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe: recipeId }),
    },
  );
}

export function publishCookbook(
  cookbookId: string,
  slug?: string,
): Promise<Cookbook> {
  return apiFetch<Cookbook>(`/api/v1/cookbooks/${cookbookId}/publish/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slug ? { slug } : {}),
  });
}

export function unpublishCookbook(cookbookId: string): Promise<Cookbook> {
  return apiFetch<Cookbook>(`/api/v1/cookbooks/${cookbookId}/unpublish/`, {
    method: "POST",
  });
}
