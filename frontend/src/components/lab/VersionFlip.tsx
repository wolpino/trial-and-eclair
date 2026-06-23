import type { RecipeVersion } from "../../api/development";

type VersionFlipProps = {
  versions: RecipeVersion[];
  activeVersionId: string;
  currentVersionId: string;
  onSelect: (versionId: string) => void;
};

export function VersionFlip({
  versions,
  activeVersionId,
  currentVersionId,
  onSelect,
}: VersionFlipProps) {
  return (
    <nav className="lab-version-flip" aria-label="Version pages">
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
