import { Link } from "react-router-dom";

import type { CookbookEntry } from "../../api/development";

type CookbookEntryCardProps = {
  entry: CookbookEntry;
  recipeSlug?: string | null;
  onRemove?: () => void;
};

export function CookbookEntryCard({
  entry,
  recipeSlug,
  onRemove,
}: CookbookEntryCardProps) {
  const copy = entry.snapshot;

  return (
    <article className="cookbook-entry-card">
      <header className="cookbook-entry-card__header">
        <h3>{copy.title}</h3>
        <span className="cookbook-entry-card__badge">
          v{copy.version_number} copy
        </span>
      </header>
      {copy.description ? (
        <p className="cookbook-entry-card__description">{copy.description}</p>
      ) : null}
      <footer className="cookbook-entry-card__footer">
        {recipeSlug ? (
          <Link to={`/r/${recipeSlug}`}>Public recipe</Link>
        ) : (
          <span className="cookbook-entry-card__muted">Not on public web</span>
        )}
        {onRemove ? (
          <button className="paper-btn paper-btn--text cookbook-entry-card__remove" type="button" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </footer>
    </article>
  );
}
