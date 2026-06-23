import { Link } from "react-router-dom";

import type { DevelopmentRecipe } from "../../api/development";

type RecipeShelfProps = {
  recipes: DevelopmentRecipe[];
};

export function RecipeShelf({ recipes }: RecipeShelfProps) {
  if (recipes.length === 0) {
    return <p className="lab-shelf-empty">No recipes on the shelf yet — start a new one above.</p>;
  }

  return (
    <div className="lab-shelf" role="list" aria-label="Recipe shelf">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          className="lab-spine"
          role="listitem"
          to={`/developer/lab/${recipe.id}`}
          title={recipe.title}
        >
          <p className="lab-spine__title">{recipe.title}</p>
          <span className="lab-spine__meta">v{recipe.current_version.version_number}</span>
        </Link>
      ))}
    </div>
  );
}
