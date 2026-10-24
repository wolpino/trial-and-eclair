import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import type { PublicRecipe } from "../api/client";
import { mediaUrl } from "../api/client";
import { IngredientLineText, formatTiming } from "../lib/recipeFormat";

interface RecipeViewerProps {
  recipe: PublicRecipe;
  actions?: ReactNode;
}

export function RecipeViewer({ recipe, actions }: RecipeViewerProps) {
  const heroUrl = mediaUrl(recipe.hero_image);
  const timing = formatTiming(recipe.prep_minutes, recipe.cook_minutes);
  const publishedDate = new Date(recipe.published_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="recipe-viewer">
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
            {recipe.fork_lineage.title === null ? (
              "a recipe"
            ) : recipe.fork_lineage.slug ? (
              <Link to={`/r/${recipe.fork_lineage.slug}`}>
                {recipe.fork_lineage.title}
              </Link>
            ) : (
              recipe.fork_lineage.title
            )}
            {recipe.fork_lineage.author === null
              ? null
              : ` by ${recipe.fork_lineage.author}`}
            {recipe.fork_lineage.title === null
              ? " · original recipe removed"
              : null}
            {recipe.fork_lineage.author === null
              ? " · original by a deleted user"
              : null}
          </p>
        ) : null}
        {recipe.description ? (
          <p className="public-description">{recipe.description}</p>
        ) : null}
        {actions}
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
                <IngredientLineText line={line} />
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

      <footer className="public-colophon">
        <Link to="/">Trial &amp; Eclair</Link>
      </footer>
    </article>
  );
}
