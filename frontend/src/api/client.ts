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
  /** Passwordless account made on the first save; registering upgrades it (decision 002). */
  is_guest: boolean;
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
  /** Machine-readable code from the API body, e.g. "guest_card_limit". */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// `?.` keeps this module importable outside Vite (Playwright unit specs).
const API_BASE = import.meta.env?.VITE_API_BASE_URL ?? "";

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isMutatingMethod(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

const SERVER_ERROR_MESSAGE = "Something went wrong on our side. Please try again.";
const FALLBACK_ERROR_MESSAGE = "That did not work. Please try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Builds the ApiError for a failed response. The API's error shape is in README "API errors". */
export async function toApiError(response: Response): Promise<ApiError> {
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Body was not JSON (for example a proxy's HTML error page).
  }
  const code = isRecord(data) && typeof data.code === "string" ? data.code : undefined;
  return new ApiError(response.status, parseApiErrorMessage(response, data), code);
}

export function parseApiErrorMessage(response: Response, data: unknown): string {
  if (response.status === 429) {
    return retryMessage(response.headers.get("Retry-After"));
  }
  if (isRecord(data) && typeof data.detail === "string") {
    return data.detail;
  }
  const messages = isRecord(data) || Array.isArray(data) ? fieldMessages("", data) : [];
  if (messages.length > 0) {
    return messages.join(" ");
  }
  return response.status >= 500 ? SERVER_ERROR_MESSAGE : FALLBACK_ERROR_MESSAGE;
}

function retryMessage(retryAfter: string | null): string {
  const seconds = Number(retryAfter);
  if (!retryAfter || !Number.isFinite(seconds) || seconds <= 0) {
    return "Too many tries. Please try again later.";
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 90) {
    return `Too many tries. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }
  const hours = Math.ceil(minutes / 60);
  return `Too many tries. Try again in ${hours} hours.`;
}

/** Field errors as sentences: {"title": ["This field is required."]} -> "Title is required." */
function fieldMessages(key: string, value: unknown): string[] {
  if (typeof value === "string") {
    return [withFieldName(key, value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => fieldMessages(key, item));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([childKey, child]) =>
      childKey === "code" ? [] : fieldMessages(childKey, child),
    );
  }
  return [];
}

function withFieldName(key: string, message: string): string {
  if (!key || key === "non_field_errors" || key === "detail") {
    return message;
  }
  const name = key.replace(/_/g, " ");
  return message
    .replace(/^This field\b/, name.charAt(0).toUpperCase() + name.slice(1))
    .replace(/\bthis field\b/g, name);
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
    throw await toApiError(response);
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

export function createGuest(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/guest/", { method: "POST" });
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

export function patchCurrentUser(data: Pick<User, "show_forks">): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function startDeveloperTrial(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/start-trial/", { method: "POST" });
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
