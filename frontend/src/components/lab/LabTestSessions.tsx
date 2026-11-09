import { FormEvent, Fragment, useId, useState } from "react";

import { mediaUrl } from "../../api/client";
import type { OvenTempUnit, TestSession, TestSessionBake } from "../../api/development";
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

const RATINGS = [5, 4, 3, 2, 1];

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return Number(value);
}

/** Reads the bake fields from the bake session form. Empty fields become null. */
export function readBakeFields(form: HTMLFormElement): TestSessionBake {
  const data = new FormData(form);
  const ovenTemp = optionalNumber(data.get("oven_temp"));
  return {
    oven_temp: ovenTemp,
    oven_temp_unit: ovenTemp === null ? null : (data.get("oven_temp_unit") as OvenTempUnit),
    bake_minutes: optionalNumber(data.get("bake_minutes")),
    rating: optionalNumber(data.get("rating")),
  };
}

function BakeSummary({ session }: { session: TestSession }) {
  const parts: string[] = [];
  if (session.oven_temp !== null) {
    parts.push(`${session.oven_temp} °${session.oven_temp_unit ?? ""}`);
  }
  if (session.bake_minutes !== null) {
    parts.push(`${session.bake_minutes} min`);
  }
  if (parts.length === 0 && session.rating === null) {
    return null;
  }
  return (
    <p className="lab-test-session-bake">
      {parts.length > 0 ? <span>{parts.join(" · ")}</span> : null}
      {session.rating !== null ? (
        <span
          className="lab-test-session-rating"
          role="img"
          aria-label={`Rated ${session.rating} of 5`}
        >
          {"★".repeat(session.rating)}
          {"☆".repeat(5 - session.rating)}
        </span>
      ) : null}
    </p>
  );
}

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
      <BakeSummary session={session} />
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
  const ratingId = useId();
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
      <div className="lab-test-session-form__row">
        <label>
          Oven temperature
          <input inputMode="numeric" min={0} name="oven_temp" step={1} type="number" />
        </label>
        <select aria-label="Temperature unit" defaultValue="F" name="oven_temp_unit">
          <option value="F">°F</option>
          <option value="C">°C</option>
        </select>
        <label>
          Bake time (minutes)
          <input inputMode="numeric" min={0} name="bake_minutes" step={1} type="number" />
        </label>
      </div>
      <fieldset className="lab-test-session-stars">
        <legend>Rating</legend>
        {/* Highest first in the DOM; CSS reverses the row so checked ~ label fills the stars below it. */}
        <div className="lab-test-session-stars__row">
          {RATINGS.map((value) => (
            <Fragment key={value}>
              <input
                aria-label={value === 1 ? "1 star" : `${value} stars`}
                id={`${ratingId}-${value}`}
                name="rating"
                type="radio"
                value={value}
              />
              <label htmlFor={`${ratingId}-${value}`} aria-hidden="true">
                ★
              </label>
            </Fragment>
          ))}
        </div>
      </fieldset>
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
