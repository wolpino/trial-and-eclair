import { FormEvent, useState } from "react";

import { mediaUrl } from "../../api/client";
import type { TestSession } from "../../api/development";

type LabTestSessionsProps = {
  sessions: TestSession[];
  editable: boolean;
  notes: string;
  outcome: string;
  photos: File[];
  onNotesChange: (value: string) => void;
  onOutcomeChange: (value: string) => void;
  onPhotosChange: (files: File[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (sessionId: string) => void;
  onDeletePhoto: (sessionId: string, photoId: string) => void;
};

export function LabTestSessions({
  sessions,
  editable,
  notes,
  outcome,
  onNotesChange,
  onOutcomeChange,
  onPhotosChange,
  onSubmit,
  onDelete,
  onDeletePhoto,
}: LabTestSessionsProps) {
  const [error, setError] = useState<string | null>(null);

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 5) {
      setError("A test session may have at most 5 photos.");
      onPhotosChange(files.slice(0, 5));
      return;
    }
    setError(null);
    onPhotosChange(files);
  }

  return (
    <div className="lab-test-sessions">
      <p className="lab-column-heading">Bake sessions</p>
      {sessions.length === 0 ? (
        <p className="lab-page__note">No bake sessions logged yet.</p>
      ) : (
        <ul className="lab-test-session-list">
          {sessions.map((session) => (
            <li key={session.id}>
              {session.notes ? <p>{session.notes}</p> : null}
              {session.outcome ? (
                <p className="lab-test-session__outcome">Outcome: {session.outcome}</p>
              ) : null}
              <span className="lab-journal-entry__meta">
                {new Date(session.tested_at).toLocaleString()}
              </span>
              {session.photos.length > 0 ? (
                <ul className="lab-test-session-photos">
                  {session.photos.map((photo) => {
                    const url = mediaUrl(photo.image);
                    return (
                      <li key={photo.id}>
                        {url ? (
                          <img alt={photo.caption || ""} src={url} />
                        ) : null}
                        {photo.caption ? <span>{photo.caption}</span> : null}
                        {editable ? (
                          <button
                            className="lab-btn--text"
                            type="button"
                            onClick={() => onDeletePhoto(session.id, photo.id)}
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {editable ? (
                <button
                  className="lab-btn--text"
                  type="button"
                  onClick={() => onDelete(session.id)}
                >
                  Delete session
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {editable ? (
        <form className="lab-test-session-form" onSubmit={onSubmit}>
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            Session notes
            <textarea
              rows={2}
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </label>
          <label>
            Outcome
            <textarea
              rows={2}
              value={outcome}
              onChange={(event) => onOutcomeChange(event.target.value)}
            />
          </label>
          <label>
            Photos (up to 5)
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={handlePhotoSelect}
            />
          </label>
          <button className="lab-btn" type="submit">
            Log bake session
          </button>
        </form>
      ) : null}
    </div>
  );
}
