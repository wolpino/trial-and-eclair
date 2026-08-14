import type { Reference } from "../../api/library";
import { REFERENCE_TYPE_LABELS } from "../../lib/constants";

type ReferenceSpineProps = {
  reference: Reference;
  selected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function ReferenceSpine({
  reference,
  selected = false,
  onSelect,
  onDelete,
}: ReferenceSpineProps) {
  return (
    <div
      className="reference-spine-wrap"
      data-ref-type={reference.ref_type}
      data-selected={selected ? "true" : undefined}
    >
      <button
        aria-pressed={selected}
        className="reference-spine"
        title={reference.title}
        type="button"
        onClick={onSelect}
      >
        <span className="reference-spine__band" aria-hidden="true" />
        <p className="reference-spine__title">{reference.title}</p>
        <span className="reference-spine__type">
          {REFERENCE_TYPE_LABELS[reference.ref_type]}
        </span>
      </button>
      <button className="reference-spine__delete" type="button" onClick={onDelete}>
        Remove
      </button>
    </div>
  );
}
