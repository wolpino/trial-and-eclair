import type { RecipeVersion } from "../../api/development";
import { formatLabDate } from "./labDates";

type VersionFlipProps = {
  versions: RecipeVersion[];
  activeVersionId: string;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
  onSelect: (versionId: string) => void;
};

function VersionStamp({
  currentNumber,
  viewingNumber,
  createdAt,
  updatedAt,
}: {
  currentNumber: number | null;
  viewingNumber: number | null;
  createdAt: string;
  updatedAt: string;
}) {
  const viewingOther =
    currentNumber != null && viewingNumber != null && viewingNumber !== currentNumber;

  return (
    <div className="lab-version-stamp">
      {currentNumber != null ? (
        <p className="lab-version-stamp__number">v{currentNumber}</p>
      ) : null}
      <p className="lab-version-stamp__date">Opened {formatLabDate(createdAt)}</p>
      <p className="lab-version-stamp__date">Updated {formatLabDate(updatedAt)}</p>
      {viewingOther ? (
        <p className="lab-version-stamp__viewing">Viewing v{viewingNumber} (read-only)</p>
      ) : null}
    </div>
  );
}

export function VersionFlip({
  versions,
  activeVersionId,
  currentVersionId,
  createdAt,
  updatedAt,
  onSelect,
}: VersionFlipProps) {
  const current = versions.find((version) => version.id === currentVersionId);
  const active = versions.find((version) => version.id === activeVersionId);

  return (
    <nav className="lab-version-flip" aria-label="Version pages">
      <VersionStamp
        currentNumber={current?.version_number ?? null}
        viewingNumber={active?.version_number ?? null}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
      <p className="lab-column-heading">Pages</p>
      <ul className="lab-version-flip__list">
        {versions.map((version) => {
          const isActive = version.id === activeVersionId;
          const isCurrent = version.id === currentVersionId;
          return (
            <li key={version.id}>
              <button
                type="button"
                className={
                  isActive
                    ? "lab-version-flip__btn lab-version-flip__btn--active"
                    : "lab-version-flip__btn"
                }
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(version.id)}
              >
                v{version.version_number}
                {isCurrent ? " · current" : ""}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
