import { useState } from "react";
import { Link } from "react-router-dom";

import type { IngredientLine } from "../../api/development";
import { BakersPercentPanel } from "./BakersPercentPanel";
import { NotebookOverlay } from "./NotebookOverlay";

type RecipeStatus = "draft" | "published" | "unpublished";

type MarginToolsProps = {
  status: RecipeStatus;
  slug: string | null;
  /** Lines of the version shown on the page, so Baker's % matches what the developer sees. */
  ingredientLines: IngredientLine[];
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
  ingredientLines,
  onCompare,
  onPublish,
  onToggleJournal,
  journalOpen,
}: MarginToolsProps) {
  const [bakersOpen, setBakersOpen] = useState(false);

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
      <button type="button" className="lab-margin-tools__btn" onClick={() => setBakersOpen(true)}>
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
        <BakersPercentPanel lines={ingredientLines} />
      </NotebookOverlay>
    </div>
  );
}
