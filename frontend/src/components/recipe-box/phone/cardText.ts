import type { CollectionRecipe, IngredientLine, RecipeSourceType } from "../../../api/collection";
import { ingredientText as formatLine } from "../../../lib/recipeFormat";

export const TAB_KEYS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];

const SOURCE_LABELS: Record<RecipeSourceType, string> = {
  typed: "Typed",
  handwritten: "Handwritten card",
  recipe_card: "Recipe card",
  cookbook: "Cookbook",
  web: "Web import",
  scan: "Scan",
};

export function tabKey(recipe: CollectionRecipe): string {
  const first = recipe.title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export function metaText(recipe: CollectionRecipe): string {
  const parts: string[] = [];
  if (recipe.servings != null) {
    parts.push(`Serves ${recipe.servings}`);
  }
  if (recipe.prep_minutes != null) {
    parts.push(`Prep ${recipe.prep_minutes} min`);
  }
  if (recipe.cook_minutes != null) {
    parts.push(`Cook ${recipe.cook_minutes} min`);
  }
  return parts.join(" · ");
}

// Box cards show the line as typed or imported when there is one (decision 003).
export function ingredientText(line: IngredientLine): string {
  if (line.raw_text || !line.ingredient) {
    return line.raw_text;
  }
  return formatLine(line);
}

export function sourceLabel(recipe: CollectionRecipe): string {
  return SOURCE_LABELS[recipe.source_type] ?? "Typed";
}
