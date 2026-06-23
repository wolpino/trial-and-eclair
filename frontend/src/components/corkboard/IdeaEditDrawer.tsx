import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError, mediaUrl } from "../../api/client";
import {
  deleteIdea,
  patchIdea,
  promoteIdea,
  type Idea,
  type IdeaStatus,
} from "../../api/development";
import { IDEA_STATUS_LABELS, IDEA_STATUS_OPTIONS } from "./constants";

type IdeaEditDrawerProps = {
  idea: Idea | null;
  open: boolean;
  onClose: () => void;
  onSaved: (idea: Idea) => void;
  onDeleted: (id: string) => void;
};

export function IdeaEditDrawer({
  idea,
  open,
  onClose,
  onSaved,
  onDeleted,
}: IdeaEditDrawerProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [status, setStatus] = useState<IdeaStatus>("researching");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (!idea) {
      return;
    }
    setTitle(idea.title);
    setNotes(idea.notes);
    setCategoryTag(idea.category_tag);
    setStatus(idea.status);
    setError(null);
  }, [idea]);

  if (!open || !idea) {
    return null;
  }

  const imageUrl = mediaUrl(idea.image);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idea) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const image = fileInputRef.current?.files?.[0];
      const updated = await patchIdea(idea.id, {
        title,
        notes,
        category_tag: categoryTag,
        status,
        image,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save idea.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!idea) {
      return;
    }
    try {
      await deleteIdea(idea.id);
      onDeleted(idea.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not delete idea.");
    }
  }

  async function handlePromote() {
    if (!idea) {
      return;
    }
    setPromoting(true);
    setError(null);
    try {
      const updated = await promoteIdea(idea.id, title.trim() || undefined);
      onSaved(updated);
      if (updated.promoted_recipe) {
        navigate(`/developer/lab/${updated.promoted_recipe}`);
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not promote to lab.");
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="cork-drawer" role="dialog" aria-modal="true" aria-labelledby="cork-drawer-title">
      <div className="cork-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="cork-drawer__panel">
        <header className="cork-drawer__header">
          <h2 id="cork-drawer-title">Edit note</h2>
          <button className="cork-drawer__close" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <form className="cork-drawer__form" onSubmit={(event) => void handleSave(event)}>
          {error ? <p className="cork-drawer__error">{error}</p> : null}
          {imageUrl ? (
            <img alt="" className="cork-drawer__preview" src={imageUrl} />
          ) : null}
          <label>
            Title
            <input required value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Notes
            <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as IdeaStatus)}>
              {IDEA_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {IDEA_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category tag
            <input value={categoryTag} onChange={(event) => setCategoryTag(event.target.value)} />
          </label>
          <label>
            Photo <span className="label-optional">(optional)</span>
            <input ref={fileInputRef} accept="image/*" type="file" />
          </label>
          <div className="cork-drawer__actions">
            <button className="cork-btn" disabled={saving} type="submit">
              {saving ? "Saving…" : "Save"}
            </button>
            {idea.promoted_recipe ? (
              <Link className="cork-btn cork-btn--ghost" to={`/developer/lab/${idea.promoted_recipe}`}>
                Open in lab
              </Link>
            ) : (
              <button
                className="cork-btn cork-btn--ghost"
                disabled={promoting}
                type="button"
                onClick={() => void handlePromote()}
              >
                {promoting ? "Promoting…" : "Promote to lab"}
              </button>
            )}
            <button className="cork-btn cork-btn--danger" type="button" onClick={() => void handleDelete()}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
