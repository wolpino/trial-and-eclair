import { mediaUrl } from "../../api/client";
import type { Idea } from "../../api/development";
import { rotationFromIdeaId } from "../../lib/ideaRotation";
import { IDEA_STATUS_LABELS } from "./constants";
import { PinnedNote } from "./PinnedNote";

type PinnedNoteCardProps = {
  idea: Idea;
  onSelect: (idea: Idea) => void;
};

export function PinnedNoteCard({ idea, onSelect }: PinnedNoteCardProps) {
  const imageUrl = mediaUrl(idea.image);

  return (
    <PinnedNote
      rotation={rotationFromIdeaId(idea.id)}
      onClick={() => onSelect(idea)}
    >
      {imageUrl ? (
        <div className="pinned-note__image">
          <img alt="" src={imageUrl} />
        </div>
      ) : null}
      <p className="pinned-note__status">{IDEA_STATUS_LABELS[idea.status]}</p>
      <h3 className="pinned-note__title">{idea.title}</h3>
      {idea.category_tag ? (
        <p className="pinned-note__tag">{idea.category_tag}</p>
      ) : null}
      {idea.promoted_recipe ? (
        <p className="pinned-note__promoted">In lab</p>
      ) : null}
    </PinnedNote>
  );
}
