import { apiFetch } from "./client";

export type ReferenceType =
  | "cookbook"
  | "blog"
  | "chef"
  | "article"
  | "tool";

export interface Reference {
  id: string;
  ref_type: ReferenceType;
  title: string;
  url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function fetchReferences(refType?: ReferenceType): Promise<Reference[]> {
  const query = refType ? `?ref_type=${refType}` : "";
  return apiFetch<Reference[]>(`/api/v1/references/${query}`);
}

export function createReference(data: {
  ref_type: ReferenceType;
  title: string;
  url?: string;
  notes?: string;
}): Promise<Reference> {
  return apiFetch<Reference>("/api/v1/references/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteReference(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/references/${id}/`, { method: "DELETE" });
}
