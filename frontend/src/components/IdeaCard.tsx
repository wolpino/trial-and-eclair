import type { Idea, IdeaStatus } from "../api/client";
import { mediaUrl } from "../api/client";

const STATUS_LABELS: Record<IdeaStatus, string> = {
  researching: "Researching",
  testing: "Testing",
  ready: "Ready to publish",
  archived: "Archived",
};

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const imageUrl = mediaUrl(idea.image);

  return (
    <article className="idea-card">
      {imageUrl ? (
        <div className="idea-card-image">
          <img alt="" src={imageUrl} />
        </div>
      ) : null}
      <div className="idea-card-body">
        <p className="idea-card-status">{STATUS_LABELS[idea.status]}</p>
        <h3 className="idea-card-title">{idea.title}</h3>
        {idea.category_tag ? (
          <p className="idea-card-tag">{idea.category_tag}</p>
        ) : null}
      </div>
    </article>
  );
}
