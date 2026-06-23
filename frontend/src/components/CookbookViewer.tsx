import { Link } from "react-router-dom";

import type { PublicCookbook } from "../api/client";

interface CookbookViewerProps {
  cookbook: PublicCookbook;
}

export function CookbookViewer({ cookbook }: CookbookViewerProps) {
  const publishedDate = new Date(cookbook.published_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="cookbook-viewer">
      <Link className="public-site-mark" to="/">
        Trial &amp; Eclair
      </Link>

      <header className="public-cookbook-header">
        <p className="public-meta">
          by {cookbook.author}
          {" · "}
          <time dateTime={cookbook.published_at}>{publishedDate}</time>
        </p>
        <h1>{cookbook.title}</h1>
        {cookbook.description ? (
          <p className="public-description">{cookbook.description}</p>
        ) : null}
      </header>

      <section className="public-cookbook-entries" aria-label="Recipes in cookbook">
        {cookbook.recipes.map((entry) => (
          <article key={`${entry.sort_order}-${entry.title}`} className="public-cookbook-entry">
            <span className="public-cookbook-entry__order">Recipe {entry.sort_order}</span>
            <h2>
              {entry.recipe_slug ? (
                <Link to={`/r/${entry.recipe_slug}`}>{entry.title}</Link>
              ) : (
                entry.title
              )}
            </h2>
            {entry.description ? <p>{entry.description}</p> : null}
          </article>
        ))}
      </section>
    </article>
  );
}
