import { FormEvent, useRef, useState } from "react";

import { ApiError } from "../api/client";
import { createIdea, type Idea } from "../api/development";

interface CreateIdeaFormProps {
  onCreated: (idea: Idea) => void;
}

export function CreateIdeaForm({ onCreated }: CreateIdeaFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const image = fileInputRef.current?.files?.[0];

    try {
      const idea = await createIdea({ title, image });
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onCreated(idea);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Could not save idea.");
      } else {
        setError("Could not save idea.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="create-idea-panel" aria-labelledby="create-idea-heading">
      <h2 id="create-idea-heading">Pin a new idea</h2>
      <form className="create-idea-form" onSubmit={(event) => void handleSubmit(event)}>
        {error ? <p className="form-error">{error}</p> : null}
        <label>
          Title
          <input
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Photo <span className="label-optional">(optional)</span>
          <input
            ref={fileInputRef}
            accept="image/*"
            name="image"
            type="file"
          />
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? "Pinning…" : "Pin idea"}
        </button>
      </form>
    </section>
  );
}
