import type { CollectionRecipe, IngredientLine } from "../api/collection";

// Words dropped from a typed line so "2 cups" finds nothing (Design Bash B1).
const UNITS = new Set([
  "c", "cup", "cups", "tbsp", "tbs", "tablespoon", "tablespoons", "tsp", "teaspoon",
  "teaspoons", "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds", "g", "gram",
  "grams", "kg", "ml", "l", "liter", "liters", "litre", "litres", "pinch", "dash",
]);

/** Lower case with accents removed, so "Crème" matches "creme". */
function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The ingredient name, or a typed line without its amounts and units. */
function ingredientName(line: IngredientLine): string {
  if (line.ingredient_name) {
    return fold(line.ingredient_name);
  }
  return fold(line.raw_text)
    .split(/\s+/)
    .filter((word) => !/[\d¼½¾⅓⅔⅛]/.test(word) && !UNITS.has(word.replace(/[.,]$/, "")))
    .join(" ");
}

/** True when the title or an ingredient name contains the query. */
export function matchesSearch(recipe: CollectionRecipe, query: string): boolean {
  const needle = fold(query.trim());
  if (!needle) {
    return true;
  }
  return (
    fold(recipe.title).includes(needle) ||
    recipe.ingredient_lines.some((line) => ingredientName(line).includes(needle))
  );
}
