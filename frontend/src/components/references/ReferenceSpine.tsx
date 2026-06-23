import type { Reference, ReferenceType } from "../../api/library";
import { REFERENCE_TYPE_LABELS } from "../../lib/constants";

type ReferenceSpineProps = {
  reference: Reference;
  onDelete: () => void;
};

export function ReferenceSpine({ reference, onDelete }: ReferenceSpineProps) {
  const content = (
    <>
      <p className="reference-spine__title">{reference.title}</p>
      <span className="reference-spine__type">
        {REFERENCE_TYPE_LABELS[reference.ref_type]}
      </span>
    </>
  );

  if (reference.url) {
    return (
      <div className="reference-spine-wrap" data-ref-type={reference.ref_type}>
        <a
          className="reference-spine"
          href={reference.url}
          rel="noreferrer"
          target="_blank"
          title={reference.title}
        >
          {content}
        </a>
        <button
          className="reference-spine__delete"
          type="button"
          onClick={onDelete}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      className="reference-spine reference-spine--static"
      data-ref-type={reference.ref_type}
      title={reference.title}
    >
      {content}
      <button
        className="reference-spine__delete"
        type="button"
        onClick={onDelete}
      >
        Remove
      </button>
    </div>
  );
}

export type { ReferenceType };
