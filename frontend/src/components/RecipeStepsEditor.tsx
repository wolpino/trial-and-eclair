import { FormEvent, useState } from "react";

import { ApiError } from "../api/client";
import type { RecipeStep } from "../api/development";

type RecipeStepsEditorProps = {
  steps: RecipeStep[];
  editable: boolean;
  onAdd: (data: { order: number; body: string }) => Promise<unknown>;
  onUpdate: (stepId: string, data: { body: string }) => Promise<unknown>;
  onDelete: (stepId: string) => Promise<unknown>;
  onChanged: () => void;
  listClassName?: string;
};

export function RecipeStepsEditor({
  steps,
  editable,
  onAdd,
  onUpdate,
  onDelete,
  onChanged,
  listClassName = "lab-step-list",
}: RecipeStepsEditorProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedSteps = [...steps].sort((left, right) => left.order - right.order);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const nextOrder =
        sortedSteps.length > 0
          ? Math.max(...sortedSteps.map((step) => step.order)) + 1
          : 1;
      await onAdd({ order: nextOrder, body: body.trim() });
      setBody("");
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not add step.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBodyBlur(step: RecipeStep, value: string) {
    if (value.trim() === step.body || !editable) {
      return;
    }
    try {
      await onUpdate(step.id, { body: value.trim() });
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save step.");
    }
  }

  async function handleDelete(stepId: string) {
    setError(null);
    try {
      await onDelete(stepId);
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not remove step.");
    }
  }

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}
      <ol className={listClassName}>
        {sortedSteps.map((step) => (
          <li key={step.id}>
            {editable ? (
              <textarea
                className="lab-step-body"
                rows={2}
                defaultValue={step.body}
                aria-label={`Step ${step.order}`}
                onBlur={(event) => void handleBodyBlur(step, event.target.value)}
              />
            ) : (
              <p className="lab-step-body">{step.body}</p>
            )}
            {editable ? (
              <button
                className="lab-btn--text"
                type="button"
                onClick={() => void handleDelete(step.id)}
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      {editable ? (
        <form className="lab-step-form" onSubmit={(event) => void handleAdd(event)}>
          <label>
            New step
            <textarea
              rows={2}
              value={body}
              placeholder="Describe the next step…"
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <button className="lab-btn" disabled={submitting} type="submit">
            Add step
          </button>
        </form>
      ) : null}
    </>
  );
}
