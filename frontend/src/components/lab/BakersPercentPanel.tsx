import { useState } from "react";

import type { IngredientLine } from "../../api/development";
import { bakersPercentages, formatNumber, isFlour, scaledQuantity } from "../../lib/bakersPercent";
import { displayName, displayUnit, formatQuantity } from "../../lib/recipeFormat";

type BakersPercentPanelProps = {
  lines: IngredientLine[];
};

// A view and a scale preview only: nothing here is saved.
export function BakersPercentPanel({ lines }: BakersPercentPanelProps) {
  const [flour, setFlour] = useState(() => lines.map(isFlour));
  const [target, setTarget] = useState<string | null>(null);
  const { flourGrams, rows } = bakersPercentages(lines, flour);
  const targetGrams = Number(target);
  const factor = target && targetGrams > 0 && flourGrams > 0 ? targetGrams / flourGrams : 1;

  function toggleFlour(index: number) {
    setFlour((current) => current.map((value, i) => (i === index ? !value : value)));
  }

  if (lines.length === 0) {
    return <p className="lab-page__note">This version has no ingredient lines yet.</p>;
  }

  return (
    <div className="lab-bakers-panel">
      {flourGrams > 0 ? (
        <label className="lab-bakers-panel__target">
          Flour weight (g)
          <input
            type="number"
            min="0"
            step="any"
            value={target ?? formatNumber(flourGrams)}
            onChange={(event) => setTarget(event.target.value)}
          />
        </label>
      ) : (
        <p className="lab-page__note">
          No flour by weight. Tick the lines that count as flour, or weigh the flour in g, kg, oz or
          lb.
        </p>
      )}
      <table className="lab-bakers-panel__table">
        <thead>
          <tr>
            <th scope="col">Flour</th>
            <th scope="col">Ingredient</th>
            <th scope="col">Amount</th>
            <th scope="col">Baker&apos;s %</th>
            <th scope="col">Scaled</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const row = rows[index];
            const name = displayName(line.ingredient_name);
            const unit = displayUnit(line);
            const amount = row.flagged
              ? formatQuantity(line.quantity)
              : formatNumber(Number(line.quantity));
            return (
              <tr key={line.id} className={row.flagged ? "lab-bakers-panel__flagged" : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={flour[index]}
                    onChange={() => toggleFlour(index)}
                    aria-label={`Count ${name} as flour`}
                  />
                </td>
                <td>{name}</td>
                <td>{[amount, unit].filter(Boolean).join(" ")}</td>
                <td>{row.percent === null ? "" : `${formatNumber(row.percent)}%`}</td>
                <td>{row.flagged ? "Not by weight" : `${scaledQuantity(line, factor)} ${unit}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="lab-page__note">Preview only. Nothing is saved.</p>
    </div>
  );
}
