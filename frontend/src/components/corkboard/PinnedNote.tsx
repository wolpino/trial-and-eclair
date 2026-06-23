import type { ReactNode } from "react";

import "./pinned-note.css";

type PinnedNoteProps = {
  children: ReactNode;
  className?: string;
  rotation?: number;
};

/** Cork board note stub — full build in C2. Pin anchor at top-center for future canvas. */
export function PinnedNote({ children, className = "", rotation = 0 }: PinnedNoteProps) {
  return (
    <article
      className={`pinned-note ${className}`.trim()}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="pinned-note__pin" aria-hidden="true" />
      <div className="pinned-note__body">{children}</div>
    </article>
  );
}
