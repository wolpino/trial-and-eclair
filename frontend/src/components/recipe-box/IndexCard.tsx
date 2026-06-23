import type { ReactNode } from "react";

import "./index-card.css";

type IndexCardProps = {
  children: ReactNode;
  className?: string;
  focused?: boolean;
};

export function IndexCard({ children, className = "", focused = false }: IndexCardProps) {
  const classes = ["index-card-scaffold", focused ? "index-card-scaffold--focused" : "", className]
    .filter(Boolean)
    .join(" ");

  return <article className={classes}>{children}</article>;
}
