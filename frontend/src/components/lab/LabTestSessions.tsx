import { FormEvent, useState } from "react";

import { mediaUrl } from "../../api/client";
import type { TestSession } from "../../api/development";
import { formatLabDate } from "./labDates";

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

function TestSessionEntry({
  session,
  editable,
  onDelete,
  onDeletePhoto,
}: {
  session: TestSession;
  editable: boolean;
  onDelete: (sessionId: string) => void;
  onDeletePhoto: (sessionId: string, photoId: string) => void;
}) {
  return (
    <li className="lab-log-entry">
      <time className="lab-log-entry__date" dateTime={session.tested_at}>
        {formatLabDate(session.tested_at)}
      </time>
      {session.notes ? <p className="lab-log-entry__body">{session.notes}</p> : null}
      {session.outcome ? (
        <p className="lab-log-entry__aside">{session.outcome}</p>
      ) : null}
      {session.photos.length > 0 ? (
        <ul className="lab-test-session-photos">
          {session.photos.map((photo) => {
            const url = mediaUrl(photo.image);
            return (
              <li key={photo.id}>
                {url ? <img alt={photo.caption || ""} src={url} /> : null}
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
        <button className="lab-btn--text" type="button" onClick={() => onDelete(session.id)}>
          Delete session
        </button>
      ) : null}
    </li>
  );
}

function TestSessionWriteForm({
  error,
  notes,
  outcome,
  onNotesChange,
  onOutcomeChange,
  onPhotoSelect,
  onSubmit,
}: {
  error: string | null;
  notes: string;
  outcome: string;
  onNotesChange: (value: string) => void;
  onOutcomeChange: (value: string) => void;
  onPhotoSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="lab-test-session-form lab-log-page__write" onSubmit={onSubmit}>
      {error ? <p className="form-error">{error}</p> : null}
      <label>
        Session notes
        <textarea rows={2} value={notes} onChange={(event) => onNotesChange(event.target.value)} />
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
        <input accept="image/*" multiple type="file" onChange={onPhotoSelect} />
      </label>
      <button className="lab-btn" type="submit">
        Log bake session
      </button>
    </form>
  );
}

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
    <section className="lab-log-page" aria-label="Bake sessions">
      <h3 className="lab-column-heading">Bake log</h3>
      {sessions.length === 0 ? (
        <p className="lab-page__note">No bake sessions logged yet.</p>
      ) : (
        <ul className="lab-log-entries">
          {sessions.map((session) => (
            <TestSessionEntry
              key={session.id}
              session={session}
              editable={editable}
              onDelete={onDelete}
              onDeletePhoto={onDeletePhoto}
            />
          ))}
        </ul>
      )}
      {editable ? (
        <TestSessionWriteForm
          error={error}
          notes={notes}
          outcome={outcome}
          onNotesChange={onNotesChange}
          onOutcomeChange={onOutcomeChange}
          onPhotoSelect={handlePhotoSelect}
          onSubmit={onSubmit}
        />
      ) : null}
    </section>
  );
}
