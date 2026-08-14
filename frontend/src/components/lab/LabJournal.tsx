import { FormEvent } from "react";

import type { JournalEntry } from "../../api/development";
import { formatLabDate } from "./labDates";

type LabJournalProps = {
  entries: JournalEntry[];
  body: string;
  onBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (entryId: string) => void;
};

function JournalEntryItem({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: (entryId: string) => void;
}) {
  return (
    <li className="lab-log-entry">
      <time className="lab-log-entry__date" dateTime={entry.logged_at}>
        {formatLabDate(entry.logged_at)}
      </time>
      <p className="lab-log-entry__body">{entry.body}</p>
      <button className="lab-btn--text" type="button" onClick={() => onDelete(entry.id)}>
        Delete
      </button>
    </li>
  );
}

export function LabJournal({
  entries,
  body,
  onBodyChange,
  onSubmit,
  onDelete,
}: LabJournalProps) {
  return (
    <section className="lab-log-page" aria-label="Journal">
      <h3 className="lab-column-heading">Journal</h3>
      {entries.length === 0 ? (
        <p className="lab-page__note">No journal entries yet.</p>
      ) : (
        <ul className="lab-log-entries">
          {entries.map((entry) => (
            <JournalEntryItem key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </ul>
      )}
      <form className="lab-journal-form lab-log-page__write" onSubmit={onSubmit}>
        <label>
          New entry
          <textarea
            required
            rows={3}
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
          />
        </label>
        <button className="lab-btn" type="submit">
          Log entry
        </button>
      </form>
    </section>
  );
}
