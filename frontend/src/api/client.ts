export interface PublicCookbookEntry {
  title: string;
  description: string;
  sort_order: number;
  recipe_slug: string | null;
}

export interface PublicCookbook {
  slug: string;
  title: string;
  description: string;
  author: string;
  published_at: string;
  recipes: PublicCookbookEntry[];
}

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

export type UserRole = "home_cook" | "developer";

export type SubscriptionStatus =
  | "none"
  | "trial"
  | "active"
  | "expired"
  | "cancelled";

export type MeasurementPreference = "original" | "metric" | "imperial";

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  measurement_preference: MeasurementPreference;
  show_forks: boolean;
  date_joined: string;
}

export interface RegisterInput {
  username: string;
  email?: string;
  password: string;
  password_confirm: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isMutatingMethod(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

async function parseApiErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "string") {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map(String).join(" ");
    }
    if (data && typeof data === "object") {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (key === "detail") {
          parts.push(typeof value === "string" ? value : String(value));
        } else if (Array.isArray(value)) {
          const label = key === "non_field_errors" ? "" : `${key}: `;
          parts.push(`${label}${value.map(String).join(" ")}`);
        } else if (typeof value === "string") {
          parts.push(value);
        }
      }
      if (parts.length > 0) {
        return parts.join(" ");
      }
    }
  } catch {
    // Response body was not JSON.
  }
  return response.statusText;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  const csrfToken = getCsrfToken();
  if (csrfToken && isMutatingMethod(method)) {
    headers.set("X-CSRFToken", csrfToken);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    method,
    headers,
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchPublicRecipe(slug: string): Promise<PublicRecipe> {
  return apiFetch<PublicRecipe>(`/api/v1/public/recipes/${slug}/`);
}

export function fetchPublicCookbook(slug: string): Promise<PublicCookbook> {
  return apiFetch<PublicCookbook>(`/api/v1/public/cookbooks/${slug}/`);
}

export function fetchCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me/");
}

export function registerUser(input: RegisterInput): Promise<User> {
  return apiFetch<User>("/api/v1/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function loginUser(input: LoginInput): Promise<User> {
  return apiFetch<User>("/api/v1/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function logoutUser(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/logout/", { method: "POST" });
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
