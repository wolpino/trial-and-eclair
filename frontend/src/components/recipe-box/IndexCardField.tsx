import type { ReactNode } from "react";

type IndexCardFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function IndexCardField({ label, children, className = "" }: IndexCardFieldProps) {
  return (
    <div className={`index-card-field ${className}`.trim()}>
      <span className="index-card-field__label">{label}</span>
      <div className="index-card-field__value">{children}</div>
    </div>
  );
}
