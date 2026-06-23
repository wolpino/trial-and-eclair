import { FormEvent, useEffect, useRef, useState } from "react";

import { ApiError } from "../api/client";
import { resolveIngredient, searchIngredients, type Ingredient } from "../api/catalog";
import { STANDARD_UNITS } from "../lib/constants";

interface AddIngredientLineFormProps {
  sortOrder: number;
  onAdded: () => void;
  onAdd: (data: {
    ingredient: string;
    quantity: string;
    unit: string;
    prep_note: string;
    sort_order: number;
  }) => Promise<unknown>;
}

export function AddIngredientLineForm({
  sortOrder,
  onAdded,
  onAdd,
}: AddIngredientLineFormProps) {
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [prepNote, setPrepNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    const query = ingredientName.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void searchIngredients(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [ingredientName]);

  function selectSuggestion(ingredient: Ingredient) {
    setIngredientName(ingredient.name);
    if (ingredient.default_unit) {
      setUnit(ingredient.default_unit);
    }
    setSuggestions([]);
    setSuggestionsOpen(false);
  }

  function handleIngredientBlur() {
    blurTimer.current = window.setTimeout(() => setSuggestionsOpen(false), 150);
  }

  function handleIngredientFocus() {
    if (blurTimer.current !== null) {
      window.clearTimeout(blurTimer.current);
    }
    setSuggestionsOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ingredient = await resolveIngredient(ingredientName);
      await onAdd({
        ingredient: ingredient.id,
        quantity,
        unit,
        prep_note: prepNote,
        sort_order: sortOrder,
      });
      setIngredientName("");
      setQuantity("");
      setUnit("");
      setPrepNote("");
      setSuggestions([]);
      onAdded();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not add ingredient.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={(event) => void handleSubmit(event)}>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="inline-form-row">
        <div className="ingredient-autocomplete">
          <input
            placeholder="Ingredient"
            required
            value={ingredientName}
            autoComplete="off"
            onBlur={handleIngredientBlur}
            onFocus={handleIngredientFocus}
            onChange={(event) => {
              setIngredientName(event.target.value);
              setSuggestionsOpen(true);
            }}
          />
          {suggestionsOpen && suggestions.length > 0 ? (
            <ul className="ingredient-autocomplete__list" role="listbox">
              {suggestions.map((ingredient) => (
                <li key={ingredient.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(ingredient)}
                  >
                    {ingredient.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <input
          placeholder="Qty"
          required
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <select value={unit} onChange={(event) => setUnit(event.target.value)}>
          {STANDARD_UNITS.map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Prep note"
          value={prepNote}
          onChange={(event) => setPrepNote(event.target.value)}
        />
        <button disabled={submitting} type="submit">
          Add
        </button>
      </div>
    </form>
  );
}
