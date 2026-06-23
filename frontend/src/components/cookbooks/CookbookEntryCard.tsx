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
  const version = entry.snapshot_version;

  return (
    <article className="cookbook-entry-card">
      <header className="cookbook-entry-card__header">
        <h3>{version.title}</h3>
        <span className="cookbook-entry-card__badge">
          v{version.version_number} snapshot
        </span>
      </header>
      {version.description ? (
        <p className="cookbook-entry-card__description">{version.description}</p>
      ) : null}
      <footer className="cookbook-entry-card__footer">
        {recipeSlug ? (
          <Link to={`/r/${recipeSlug}`}>Public recipe</Link>
        ) : (
          <span className="cookbook-entry-card__muted">Not on public web</span>
        )}
        {onRemove ? (
          <button className="cookbook-entry-card__remove" type="button" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </footer>
    </article>
  );
}
