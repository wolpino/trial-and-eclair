import { FormEvent } from "react";

import type { JournalEntry } from "../../api/development";

type LabJournalProps = {
  entries: JournalEntry[];
  open: boolean;
  onToggle: () => void;
  body: string;
  onBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (entryId: string) => void;
};

export function LabJournal({
  entries,
  open,
  onToggle,
  body,
  onBodyChange,
  onSubmit,
  onDelete,
}: LabJournalProps) {
  return (
    <section className="lab-journal" aria-label="Test log">
      <button type="button" className="lab-journal__toggle" onClick={onToggle}>
        <span>Test log</span>
        <span aria-hidden="true">{open ? "↑" : "↓"}</span>
      </button>
      <div className={open ? "lab-journal__body" : "lab-journal__body lab-journal__body--collapsed"}>
        {entries.length === 0 ? (
          <p className="lab-page__note">No journal entries yet.</p>
        ) : (
          <ul className="lab-journal-list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <p className="lab-journal-entry__body">{entry.body}</p>
                <span className="lab-journal-entry__meta">
                  {new Date(entry.logged_at).toLocaleString()}
                </span>
                <button
                  className="lab-btn--text"
                  type="button"
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <form className="lab-journal-form" onSubmit={onSubmit}>
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
      </div>
    </section>
  );
}
