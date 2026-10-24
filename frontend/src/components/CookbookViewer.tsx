import { Link } from "react-router-dom";

import type { PublicCookbook, PublicCookbookEntry } from "../api/client";
import { mediaUrl } from "../api/client";
import { IngredientLineText, formatTiming } from "../lib/recipeFormat";
import { CookbookBinder } from "./cookbooks/CookbookBinder";
import "../styles/cookbooks.css";

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
    <CookbookBinder className="cookbook-viewer">
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
            <CookbookEntryCopy entry={entry} />
          </article>
        ))}
      </section>

      <footer className="public-colophon">
        <Link to="/">Trial &amp; Eclair</Link>
      </footer>
    </CookbookBinder>
  );
}

// The entry's copy as plain text (React escapes it); never the live Lab recipe.
function CookbookEntryCopy({ entry }: { entry: PublicCookbookEntry }) {
  const heroUrl = mediaUrl(entry.hero_image);
  const timing = formatTiming(entry.prep_minutes, entry.cook_minutes);

  return (
    <div className="public-cookbook-entry__copy">
      {timing ? <p className="public-meta">{timing}</p> : null}
      {heroUrl ? (
        <figure className="public-hero">
          <img src={heroUrl} alt={entry.title} />
        </figure>
      ) : null}
      {entry.story ? <p className="recipe-story">{entry.story}</p> : null}
      {entry.ingredient_lines.length > 0 ? (
        <section aria-label={`Ingredients for ${entry.title}`}>
          <h3>Ingredients</h3>
          {entry.equipment_notes ? (
            <p className="equipment-notes">{entry.equipment_notes}</p>
          ) : null}
          <ul className="ingredient-list">
            {entry.ingredient_lines.map((line, index) => (
              <li key={index}>
                <IngredientLineText line={line} />
                {line.prep_note ? (
                  <span className="ingredient-note">, {line.prep_note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {entry.steps.length > 0 ? (
        <section className="recipe-steps" aria-label={`Directions for ${entry.title}`}>
          <h3>Directions</h3>
          <ol>
            {entry.steps.map((step) => (
              <li key={step.order}>{step.body}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
