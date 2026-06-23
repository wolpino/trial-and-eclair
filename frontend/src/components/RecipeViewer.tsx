import { Link } from "react-router-dom";

import type { PublicRecipe } from "../api/client";
import { mediaUrl } from "../api/client";
import {
  displayUnit,
  formatQuantity,
  formatTiming,
} from "../lib/recipeFormat";

interface RecipeViewerProps {
  recipe: PublicRecipe;
}

export function RecipeViewer({ recipe }: RecipeViewerProps) {
  const heroUrl = mediaUrl(recipe.hero_image);
  const timing = formatTiming(recipe.prep_minutes, recipe.cook_minutes);
  const publishedDate = new Date(recipe.published_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="recipe-viewer">
      <Link className="public-site-mark" to="/">
        Trial &amp; Eclair
      </Link>

      <header className="public-recipe-header">
        <p className="public-meta">
          by {recipe.author}
          {timing ? ` · ${timing}` : null}
          {" · "}
          <time dateTime={recipe.published_at}>{publishedDate}</time>
        </p>
        <h1>{recipe.title}</h1>
        {recipe.fork_lineage ? (
          <p className="fork-lineage">
            Based on{" "}
            {recipe.fork_lineage.slug ? (
              <Link to={`/r/${recipe.fork_lineage.slug}`}>
                {recipe.fork_lineage.title}
              </Link>
            ) : (
              recipe.fork_lineage.title
            )}{" "}
            by {recipe.fork_lineage.author}
          </p>
        ) : null}
        {recipe.description ? (
          <p className="public-description">{recipe.description}</p>
        ) : null}
      </header>

      {heroUrl ? (
        <figure className="public-hero">
          <img src={heroUrl} alt={recipe.title} />
        </figure>
      ) : null}

      <div className="recipe-body">
        <aside className="ingredients-panel public-ingredients-panel">
          <h2>Ingredients</h2>
          {recipe.equipment_notes ? (
            <p className="equipment-notes">{recipe.equipment_notes}</p>
          ) : null}
          <ul className="ingredient-list">
            {recipe.ingredient_lines.map((line) => (
              <li key={`${line.sort_order}-${line.ingredient_name}`}>
                <span className="ingredient-qty">
                  {formatQuantity(line.quantity)}
                  {displayUnit(line) ? ` ${displayUnit(line)}` : ""}
                </span>{" "}
                <span className="ingredient-name">{line.ingredient_name}</span>
                {line.prep_note ? (
                  <span className="ingredient-note">, {line.prep_note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

        <section className="directions-panel public-directions-panel">
          {recipe.story ? (
            <div className="recipe-story">
              <h2>Story</h2>
              <p>{recipe.story}</p>
            </div>
          ) : null}

          {recipe.steps.length > 0 ? (
            <div className="recipe-steps">
              <h2>Directions</h2>
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step.order}>{step.body}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}
