// Baker's percentages: each line as a percent of the flour weight.
// Weight units only; volume to weight needs density data (out of scope, see docs/PRD.md).

type BakersLine = {
  ingredient_name: string;
  quantity: string | null;
  unit: string;
  custom_unit?: string;
};

const GRAMS_PER_UNIT: Record<string, number> = {
  milligram: 0.001,
  gram: 1,
  kilogram: 1000,
  ounce: 28.349523125,
  pound: 453.59237,
};

export type BakersRow = {
  grams: number | null;
  percent: number | null;
  flagged: boolean;
};

/** The line's weight in grams, or null when it is not in a weight unit. */
export function gramsOf(line: BakersLine): number | null {
  const perUnit = line.custom_unit ? undefined : GRAMS_PER_UNIT[line.unit];
  const quantity = Number(line.quantity);
  if (perUnit === undefined || !line.quantity || !Number.isFinite(quantity)) {
    return null;
  }
  return quantity * perUnit;
}

export function isFlour(line: BakersLine): boolean {
  return line.ingredient_name.toLowerCase().includes("flour");
}

/** `flour[i]` says whether line i counts as flour; by default, names containing "flour". */
export function bakersPercentages(
  lines: BakersLine[],
  flour: boolean[] = lines.map(isFlour),
): { flourGrams: number; rows: BakersRow[] } {
  const grams = lines.map(gramsOf);
  const flourGrams = grams.reduce<number>(
    (total, weight, index) => (flour[index] && weight !== null ? total + weight : total),
    0,
  );
  const rows = grams.map((weight) => ({
    grams: weight,
    percent: weight !== null && flourGrams > 0 ? (weight / flourGrams) * 100 : null,
    flagged: weight === null,
  }));
  return { flourGrams, rows };
}

/** The line's quantity times `factor`, in its own unit; null for lines not in a weight unit. */
export function scaledQuantity(line: BakersLine, factor: number): string | null {
  if (gramsOf(line) === null) {
    return null;
  }
  return formatNumber(Number(line.quantity) * factor);
}

export function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}
