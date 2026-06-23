import type { IdeaStatus } from "../../api/development";
import { IDEA_STATUS_LABELS, IDEA_STATUS_OPTIONS } from "./constants";

type CorkBoardFiltersProps = {
  statusFilter: IdeaStatus | "all";
  tagFilter: string;
  tags: string[];
  onStatusChange: (status: IdeaStatus | "all") => void;
  onTagChange: (tag: string) => void;
};

export function CorkBoardFilters({
  statusFilter,
  tagFilter,
  tags,
  onStatusChange,
  onTagChange,
}: CorkBoardFiltersProps) {
  return (
    <div className="cork-board-filters">
      <div className="cork-board-filters__group" role="tablist" aria-label="Filter by status">
        <button
          aria-pressed={statusFilter === "all"}
          type="button"
          onClick={() => onStatusChange("all")}
        >
          All
        </button>
        {IDEA_STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            aria-pressed={statusFilter === status}
            type="button"
            onClick={() => onStatusChange(status)}
          >
            {IDEA_STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      {tags.length > 0 ? (
        <label className="cork-board-filters__tag">
          Tag
          <select value={tagFilter} onChange={(event) => onTagChange(event.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
