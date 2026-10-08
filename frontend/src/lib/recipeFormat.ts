import type { PublicIngredientLine } from "../api/client";

export function formatQuantity(quantity: string): string {
  const value = Number.parseFloat(quantity);
  if (Number.isNaN(value)) {
    return quantity;
  }
  return Number.isInteger(value) ? String(value) : String(value);
}

export function displayUnit(line: PublicIngredientLine): string {
  if (line.custom_unit) {
    return line.custom_unit;
  }
  if (line.unit) {
    return line.unit.replaceAll("_", " ");
  }
  return "";
}

export function formatTiming(
  prepMinutes: number | null,
  cookMinutes: number | null,
): string | null {
  const parts: string[] = [];
  if (prepMinutes) {
    parts.push(`${prepMinutes} min prep`);
  }
  if (cookMinutes) {
    parts.push(`${cookMinutes} min cook`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
