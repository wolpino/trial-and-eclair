import { createElement, type ReactNode } from "react";

// Decision 003, Ingredient text: every screen prints ingredient lines through
// this file, e.g. "1½ cups flour", "¾ tsp salt", "2 eggs".

// The fields every kind of ingredient line (Notebook, public, box) shares.
export type FormattableLine = {
  ingredient_name: string | null;
  quantity: string | null;
  unit: string;
  custom_unit: string;
};

// Common cooking fractions, by value, with the character and spoken words.
const FRACTIONS: { value: number; glyph: string; words: string; afterAnd: string }[] = [
  { value: 1 / 8, glyph: "⅛", words: "one eighth", afterAnd: "an eighth" },
  { value: 1 / 4, glyph: "¼", words: "one quarter", afterAnd: "a quarter" },
  { value: 1 / 3, glyph: "⅓", words: "one third", afterAnd: "a third" },
  { value: 1 / 2, glyph: "½", words: "one half", afterAnd: "a half" },
  { value: 2 / 3, glyph: "⅔", words: "two thirds", afterAnd: "two thirds" },
  { value: 3 / 4, glyph: "¾", words: "three quarters", afterAnd: "three quarters" },
];

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

// Short units never take a plural; "whole" is never shown ("2 eggs").
const UNIT_LABELS: Record<string, { one: string; many: string }> = {
  teaspoon: { one: "tsp", many: "tsp" },
  tablespoon: { one: "tbsp", many: "tbsp" },
  fluid_ounce: { one: "fl oz", many: "fl oz" },
  cup: { one: "cup", many: "cups" },
  quart: { one: "quart", many: "quarts" },
  gallon: { one: "gallon", many: "gallons" },
  milliliter: { one: "ml", many: "ml" },
  liter: { one: "liter", many: "liters" },
  pound: { one: "lb", many: "lb" },
  ounce: { one: "oz", many: "oz" },
  milligram: { one: "mg", many: "mg" },
  gram: { one: "g", many: "g" },
  kilogram: { one: "kg", many: "kg" },
  inch: { one: "inch", many: "inches" },
  centimeter: { one: "cm", many: "cm" },
  whole: { one: "", many: "" },
};

// Words people capitalise on purpose. Anything else that only has a leading
// capital (title or sentence case from the catalog) reads lowercase.
const PROPER_WORDS = new Set([
  "dijon", "parmesan", "parmigiano", "reggiano", "gruyère", "gruyere",
  "worcestershire", "tabasco", "greek", "italian", "french", "thai",
  "mexican", "spanish", "swiss", "english", "granny", "smith",
]);

// Plurals the simple rules below get wrong.
const IRREGULAR_PLURALS: Record<string, string> = {
  tomato: "tomatoes",
  potato: "potatoes",
  leaf: "leaves",
  loaf: "loaves",
};

type Parts = { whole: number; fraction: (typeof FRACTIONS)[number] | null };

function quantityParts(quantity: string | null): Parts | null {
  if (quantity === null || quantity === "") {
    return null;
  }
  const value = Number.parseFloat(quantity);
  if (Number.isNaN(value)) {
    return null;
  }
  let whole = Math.floor(value);
  const rest = value - whole;
  // Nearest of 0, the fractions, and 1.
  let best: Parts = { whole, fraction: null };
  let bestDistance = rest;
  for (const fraction of FRACTIONS) {
    const distance = Math.abs(rest - fraction.value);
    if (distance < bestDistance) {
      best = { whole, fraction };
      bestDistance = distance;
    }
  }
  if (1 - rest < bestDistance) {
    whole += 1;
    best = { whole, fraction: null };
  }
  // A small but real amount never prints as 0.
  if (best.whole === 0 && best.fraction === null && value > 0) {
    best = { whole: 0, fraction: FRACTIONS[0] };
  }
  return best;
}

export function formatQuantity(quantity: string | null): string {
  const parts = quantityParts(quantity);
  if (parts === null) {
    return quantity ?? "";
  }
  if (parts.fraction === null) {
    return String(parts.whole);
  }
  return `${parts.whole > 0 ? parts.whole : ""}${parts.fraction.glyph}`;
}

// Spoken form for screen readers, or null when the digits already say it.
export function quantityWords(quantity: string | null): string | null {
  const parts = quantityParts(quantity);
  if (parts === null || parts.fraction === null) {
    return null;
  }
  if (parts.whole === 0) {
    return parts.fraction.words;
  }
  const whole = NUMBER_WORDS[parts.whole] ?? String(parts.whole);
  return `${whole} and ${parts.fraction.afterAnd}`;
}

function isPlural(quantity: string | null): boolean {
  const parts = quantityParts(quantity);
  return parts !== null && (parts.whole > 1 || (parts.whole === 1 && parts.fraction !== null));
}

export function displayUnit(line: FormattableLine): string {
  if (line.custom_unit) {
    return line.custom_unit;
  }
  if (!line.unit) {
    return "";
  }
  const label = UNIT_LABELS[line.unit];
  if (!label) {
    return line.unit.replaceAll("_", " ");
  }
  return isPlural(line.quantity) ? label.many : label.one;
}

export function displayName(name: string | null): string {
  if (!name) {
    return "";
  }
  return name
    .split(" ")
    .map((word) => {
      const capitalisedOnly = /^\p{Lu}[^\p{Lu}]*$/u.test(word);
      if (!capitalisedOnly || PROPER_WORDS.has(word.toLowerCase())) {
        return word;
      }
      return word.toLowerCase();
    })
    .join(" ");
}

function pluralWord(word: string): string {
  const irregular = IRREGULAR_PLURALS[word.toLowerCase()];
  if (irregular) {
    return irregular;
  }
  if (/s$/i.test(word)) {
    return word;
  }
  if (/[^aeiou]y$/i.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }
  return `${word}s`;
}

// The name as shown on the line: plural for a count with no unit ("2 eggs").
function lineName(line: FormattableLine): string {
  const name = displayName(line.ingredient_name);
  const counted = !line.custom_unit && (!line.unit || line.unit === "whole");
  if (!name || !counted || !isPlural(line.quantity)) {
    return name;
  }
  const words = name.split(" ");
  words[words.length - 1] = pluralWord(words[words.length - 1]);
  return words.join(" ");
}

// The whole line as plain text, e.g. "1½ cups flour".
export function ingredientText(line: FormattableLine): string {
  return [formatQuantity(line.quantity), displayUnit(line), lineName(line)]
    .filter(Boolean)
    .join(" ");
}

// The quantity for screens: the fraction character, named in words.
export function IngredientAmount({ quantity }: { quantity: string | null }): ReactNode {
  const text = formatQuantity(quantity);
  const words = quantityWords(quantity);
  if (!words) {
    return text;
  }
  return createElement("span", { role: "img", "aria-label": words }, text);
}

// The whole line for screens: amount and unit (bold), then the name.
export function IngredientLineText({ line }: { line: FormattableLine }): ReactNode {
  const unit = displayUnit(line);
  const name = lineName(line);
  const hasAmount = Boolean(line.quantity) || Boolean(unit);
  return createElement(
    "span",
    { className: "ingredient-line" },
    hasAmount
      ? createElement(
          "span",
          { className: "ingredient-qty" },
          line.quantity ? createElement(IngredientAmount, { quantity: line.quantity }) : null,
          line.quantity && unit ? " " : null,
          unit,
        )
      : null,
    hasAmount && name ? " " : null,
    name,
  );
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
