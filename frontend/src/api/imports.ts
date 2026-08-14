import { apiFetch } from "./client";

export type ForkType = "save_to_box" | "rework";

export interface ForkedRecipeRef {
  id: string;
  title: string;
}

export interface ForkResult {
  fork_type: ForkType;
  fork_id: string;
  recipe: ForkedRecipeRef;
}

export interface UrlRecipeImport {
  id: string;
  normalized_url: string;
  source_title: string;
  source_author: string;
  source_site: string;
  parsed_data: Record<string, unknown>;
  last_fetched_at: string | null;
  fetch_error: string;
  created_at: string;
  updated_at: string;
}

export interface ImportSaveResult {
  fork_type: ForkType;
  recipe: ForkedRecipeRef;
}

export interface ScanImportResult {
  destination: "box" | "lab";
  recipe: ForkedRecipeRef;
}

export function forkPublicRecipe(
  slug: string,
  forkType: ForkType,
): Promise<ForkResult> {
  return apiFetch<ForkResult>(`/api/v1/public/recipes/${slug}/fork/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fork_type: forkType }),
  });
}

export function importFromUrl(url: string): Promise<UrlRecipeImport> {
  return apiFetch<UrlRecipeImport>("/api/v1/imports/url/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function saveUrlImport(
  id: string,
  forkType: ForkType,
): Promise<ImportSaveResult> {
  return apiFetch<ImportSaveResult>(`/api/v1/imports/url/${id}/save/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fork_type: forkType }),
  });
}

export function scanImport(
  file: File,
  destination: "box" | "lab",
): Promise<ScanImportResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("destination", destination);
  return apiFetch<ScanImportResult>("/api/v1/imports/scan/", {
    method: "POST",
    body,
  });
}
