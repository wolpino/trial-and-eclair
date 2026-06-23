import type { ReactNode } from "react";

import "./corkboard.css";

type PinnedNoteProps = {
  children: ReactNode;
  className?: string;
  rotation?: number;
  onClick?: () => void;
};

/** Cork board note with stable top-center pin anchor (future freeform canvas). */
export function PinnedNote({
  children,
  className = "",
  rotation = 0,
  onClick,
}: PinnedNoteProps) {
  const classes = [
    "pinned-note",
    onClick ? "pinned-note--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={onClick}
      >
        <div className="pinned-note__pin" aria-hidden="true" />
        <div className="pinned-note__body">{children}</div>
      </button>
    );
  }

  return (
    <article className={classes} style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="pinned-note__pin" aria-hidden="true" />
      <div className="pinned-note__body">{children}</div>
    </article>
  );
}
