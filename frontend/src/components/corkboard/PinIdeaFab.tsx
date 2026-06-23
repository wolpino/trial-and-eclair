import { FormEvent, useRef, useState } from "react";

import { ApiError } from "../../api/client";
import { createIdea, type Idea } from "../../api/development";

type PinIdeaFabProps = {
  onCreated: (idea: Idea) => void;
};

export function PinIdeaFab({ onCreated }: PinIdeaFabProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const idea = await createIdea({
        title,
        image: fileInputRef.current?.files?.[0],
      });
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onCreated(idea);
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not pin idea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        aria-label="Pin new idea"
        className="pin-idea-fab"
        type="button"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">+</span>
        Pin note
      </button>

      {open ? (
        <div
          className="cork-drawer cork-drawer--fab"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-idea-title"
        >
          <div
            className="cork-drawer__backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="cork-drawer__panel">
            <header className="cork-drawer__header">
              <h2 id="pin-idea-title">Pin a new idea</h2>
              <button className="cork-drawer__close" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </header>
            <form className="cork-drawer__form" onSubmit={(event) => void handleSubmit(event)}>
              {error ? <p className="cork-drawer__error">{error}</p> : null}
              <label>
                Title
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label>
                Photo <span className="label-optional">(optional)</span>
                <input ref={fileInputRef} accept="image/*" type="file" />
              </label>
              <button className="cork-btn" disabled={submitting} type="submit">
                {submitting ? "Pinning…" : "Pin to board"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
