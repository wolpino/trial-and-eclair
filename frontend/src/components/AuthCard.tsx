import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import "./recipe-box/index-card.css";

type AuthCardProps = {
  title: string;
  note?: string;
  children: ReactNode;
  switchPrompt: string;
  switchTo: string;
  switchLabel: string;
};

export function AuthCard({
  title,
  note,
  children,
  switchPrompt,
  switchTo,
  switchLabel,
}: AuthCardProps) {
  return (
    <main className="auth-stage">
      <section className="auth-card index-card-scaffold" aria-labelledby="auth-card-title">
        <h1 id="auth-card-title">{title}</h1>
        {note ? <p className="auth-note">{note}</p> : null}
        {children}
        <p className="auth-switch">
          {switchPrompt} <Link to={switchTo}>{switchLabel}</Link>
        </p>
      </section>
    </main>
  );
}
