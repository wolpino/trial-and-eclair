import { Link } from "react-router-dom";

import type { DevelopmentRecipe } from "../../api/development";

type RecipeShelfProps = {
  recipes: DevelopmentRecipe[];
  onDelete: (id: string) => void;
};

function confirmDelete(title: string): boolean {
  return window.confirm(`Delete "${title}" and all its versions? This cannot be undone.`);
}

export function RecipeShelf({ recipes, onDelete }: RecipeShelfProps) {
  if (recipes.length === 0) {
    return <p className="lab-shelf-empty">No recipes on the shelf yet — start a new one above.</p>;
  }

  return (
    <div className="lab-shelf" role="list" aria-label="Recipe shelf">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="lab-spine-wrap" role="listitem">
          <Link className="lab-spine" to={`/developer/lab/${recipe.id}`} title={recipe.title}>
            <p className="lab-spine__title">{recipe.title}</p>
            <span className="lab-spine__meta">v{recipe.current_version.version_number}</span>
          </Link>
          <button
            className="lab-spine__delete"
            type="button"
            aria-label={`Delete ${recipe.title}`}
            onClick={() => {
              if (confirmDelete(recipe.title)) {
                onDelete(recipe.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
