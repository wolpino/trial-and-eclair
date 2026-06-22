import { Link } from "react-router-dom";

import type { PublicCookbook } from "../api/client";

interface CookbookViewerProps {
  cookbook: PublicCookbook;
}

export function CookbookViewer({ cookbook }: CookbookViewerProps) {
  return (
    <article className="cookbook-viewer">
      <header className="recipe-header">
        <p className="recipe-meta">by {cookbook.author}</p>
        <h1>{cookbook.title}</h1>
        {cookbook.description ? (
          <p className="recipe-description">{cookbook.description}</p>
        ) : null}
      </header>

      <section className="cookbook-recipes">
        <h2>Recipes</h2>
        <ol className="cookbook-recipe-list">
          {cookbook.recipes.map((entry) => (
            <li key={`${entry.sort_order}-${entry.title}`}>
              {entry.recipe_slug ? (
                <Link to={`/r/${entry.recipe_slug}`}>{entry.title}</Link>
              ) : (
                <span>{entry.title}</span>
              )}
              {entry.description ? (
                <p className="cookbook-recipe-description">{entry.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
