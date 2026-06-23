import type { ReactNode } from "react";

type NotebookMarginProps = {
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
};

export function NotebookMargin({
  children,
  side = "left",
  className = "",
}: NotebookMarginProps) {
  return (
    <aside
      className={`notebook-margin notebook-margin--${side} ${className}`.trim()}
      aria-label="Notebook tools"
    >
      {children}
    </aside>
  );
}
