import type { ReactNode } from "react";

type CookbookBinderProps = {
  children: ReactNode;
  className?: string;
};

export function CookbookBinder({ children, className = "" }: CookbookBinderProps) {
  return (
    <div className={`cookbook-binder ${className}`.trim()}>
      <div aria-hidden="true" className="cookbook-binder__rings">
        <span />
        <span />
        <span />
      </div>
      <div className="cookbook-binder__body">{children}</div>
    </div>
  );
}
