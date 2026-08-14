import { FormEvent, useEffect, useState } from "react";

import type { Reference, ReferenceType } from "../../api/library";
import { REFERENCE_TYPE_LABELS } from "../../lib/constants";

const REF_TYPES: ReferenceType[] = [
  "cookbook",
  "blog",
  "chef",
  "article",
  "tool",
];

type ReferenceEditCardProps = {
  reference: Reference;
  error?: string | null;
  onSave: (data: {
    ref_type: ReferenceType;
    title: string;
    url: string;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function ReferenceEditCard({
  reference,
  error,
  onSave,
  onCancel,
}: ReferenceEditCardProps) {
  const [title, setTitle] = useState(reference.title);
  const [refType, setRefType] = useState<ReferenceType>(reference.ref_type);
  const [url, setUrl] = useState(reference.url);
  const [notes, setNotes] = useState(reference.notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(reference.title);
    setRefType(reference.ref_type);
    setUrl(reference.url);
    setNotes(reference.notes);
  }, [reference]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ ref_type: refType, title, url, notes });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="reference-edit" aria-labelledby="reference-edit-heading">
      <p className="reference-edit__kicker">Pulled from the shelf</p>
      <h2 id="reference-edit-heading">{reference.title}</h2>
      <form className="paper-form references-add-form" onSubmit={(event) => void handleSubmit(event)}>
        {error ? <p className="references-form-error">{error}</p> : null}
        <label>
          Type
          <select
            className="paper-field"
            value={refType}
            onChange={(event) => setRefType(event.target.value as ReferenceType)}
          >
            {REF_TYPES.map((type) => (
              <option key={type} value={type}>
                {REFERENCE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            className="paper-field"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          URL <span className="label-optional">(optional)</span>
          <input
            className="paper-field"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <label>
          Notes <span className="label-optional">(optional)</span>
          <textarea
            className="paper-field paper-field--textarea"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <div className="reference-edit__actions">
          <button className="paper-btn" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="paper-btn paper-btn--ghost" type="button" onClick={onCancel}>
            Back on shelf
          </button>
          {url ? (
            <a className="reference-edit__visit" href={url} rel="noreferrer" target="_blank">
              Open link
            </a>
          ) : null}
        </div>
      </form>
    </section>
  );
}
