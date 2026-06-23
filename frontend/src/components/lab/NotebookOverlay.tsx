import type { ReactNode } from "react";

type NotebookOverlayProps = {
  children: ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
  className?: string;
};

export function NotebookOverlay({
  children,
  title,
  open,
  onClose,
  className = "",
}: NotebookOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={`notebook-overlay ${className}`.trim()} role="dialog" aria-modal="true">
      <div className="notebook-overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="notebook-overlay__panel">
        <header className="notebook-overlay__header">
          <h2 className="notebook-overlay__title">{title}</h2>
          <button type="button" className="notebook-overlay__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="notebook-overlay__body">{children}</div>
      </div>
    </div>
  );
}
