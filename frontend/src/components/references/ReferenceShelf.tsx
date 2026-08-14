import type { Reference } from "../../api/library";
import { ReferenceSpine } from "./ReferenceSpine";

type ReferenceShelfProps = {
  references: Reference[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ReferenceShelf({
  references,
  selectedId = null,
  onSelect,
  onDelete,
}: ReferenceShelfProps) {
  if (references.length === 0) {
    return (
      <p className="reference-shelf-empty">
        Nothing on the shelf yet — pin a cookbook, blog, or tool below.
      </p>
    );
  }

  return (
    <div className="reference-shelf" role="list" aria-label="Reference shelf">
      {references.map((reference) => (
        <ReferenceSpine
          key={reference.id}
          reference={reference}
          selected={reference.id === selectedId}
          onSelect={() => onSelect(reference.id)}
          onDelete={() => onDelete(reference.id)}
        />
      ))}
    </div>
  );
}
