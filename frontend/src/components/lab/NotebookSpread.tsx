import type { ReactNode } from "react";

import "./notebook.css";

type NotebookSpreadProps = {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
};

export function NotebookSpread({ children, className = "", header }: NotebookSpreadProps) {
  return (
    <div className={`notebook-spread ${className}`.trim()}>
      {header ? <header className="notebook-spread__header">{header}</header> : null}
      <div className="notebook-spread__body">{children}</div>
    </div>
  );
}
