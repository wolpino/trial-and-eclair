import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../../api/client";
import { fetchDevelopmentRecipe, type IngredientLine } from "../../api/development";
import { BakersPercentPanel } from "./BakersPercentPanel";
import { NotebookOverlay } from "./NotebookOverlay";

type RecipeStatus = "draft" | "published" | "unpublished";

type MarginToolsProps = {
  status: RecipeStatus;
  slug: string | null;
  onCompare: () => void;
  onPublish: () => void;
  onToggleJournal: () => void;
  journalOpen: boolean;
};

const STATUS_LABEL: Record<RecipeStatus, string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
};

export function MarginTools({
  status,
  slug,
  onCompare,
  onPublish,
  onToggleJournal,
  journalOpen,
}: MarginToolsProps) {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [bakersOpen, setBakersOpen] = useState(false);
  const [bakersLines, setBakersLines] = useState<IngredientLine[] | null>(null);
  const [bakersError, setBakersError] = useState<string | null>(null);

  function openBakers() {
    setBakersOpen(true);
    setBakersLines(null);
    setBakersError(null);
    if (!recipeId) {
      return;
    }
    // The saved current version: ingredient lines save as they are added.
    fetchDevelopmentRecipe(recipeId)
      .then((recipe) => setBakersLines(recipe.current_version.ingredient_lines))
      .catch((err: unknown) => {
        setBakersError(err instanceof ApiError ? err.message : "Could not load ingredients.");
      });
  }

  return (
    <div className="lab-margin-tools">
      <p className={`lab-margin-tools__status lab-margin-tools__status--${status}`}>
        {STATUS_LABEL[status]}
      </p>
      {slug ? (
        <Link className="lab-margin-tools__public" to={`/r/${slug}`}>
          Public page
        </Link>
      ) : null}
      <p className="lab-column-heading">Tools</p>
      <button type="button" className="lab-margin-tools__btn" onClick={onCompare}>
        Compare ↔
      </button>
      <button type="button" className="lab-margin-tools__btn" onClick={onPublish}>
        Publish ✎
      </button>
      <button type="button" className="lab-margin-tools__btn" onClick={openBakers}>
        Baker&apos;s %
      </button>
      <button
        type="button"
        className="lab-margin-tools__btn"
        aria-expanded={journalOpen}
        aria-controls="lab-log-pages"
        onClick={onToggleJournal}
      >
        {journalOpen ? "Hide log pages ↑" : "Log pages ↓"}
      </button>
      <NotebookOverlay title="Baker's %" open={bakersOpen} onClose={() => setBakersOpen(false)}>
        {bakersError ? <p className="lab-form-error">{bakersError}</p> : null}
        {bakersLines ? <BakersPercentPanel lines={bakersLines} /> : null}
      </NotebookOverlay>
    </div>
  );
}
