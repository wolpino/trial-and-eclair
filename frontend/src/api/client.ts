export interface PublicIngredientLine {
  ingredient_name: string;
  quantity: string;
  unit: string;
  custom_unit: string;
  prep_note: string;
  substitution_note: string;
  sort_order: number;
}

export interface PublicRecipeStep {
  order: number;
  body: string;
}

export interface PublicForkLineage {
  title: string;
  author: string;
  slug: string | null;
}

export interface PublicRecipe {
  slug: string;
  title: string;
  description: string;
  story: string;
  hero_image: string | null;
  equipment_notes: string;
  prep_minutes: number | null;
  cook_minutes: number | null;
  author: string;
  published_at: string;
  ingredient_lines: PublicIngredientLine[];
  steps: PublicRecipeStep[];
  fork_lineage: PublicForkLineage | null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

export function fetchPublicRecipe(slug: string): Promise<PublicRecipe> {
  return apiFetch<PublicRecipe>(`/api/v1/public/recipes/${slug}/`);
}

export function mediaUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path}`;
}
