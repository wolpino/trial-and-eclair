import type { RecipeVersion, VersionDiff } from "../../api/development";

type ComparePanelProps = {
  versions: RecipeVersion[];
  leftVersion: string;
  rightVersion: string;
  diff: VersionDiff | null;
  onLeftChange: (versionId: string) => void;
  onRightChange: (versionId: string) => void;
  onCompare: () => void;
};

export function ComparePanel({
  versions,
  leftVersion,
  rightVersion,
  diff,
  onLeftChange,
  onRightChange,
  onCompare,
}: ComparePanelProps) {
  return (
    <div className="lab-compare-panel">
      <div className="lab-compare-form">
        <select value={leftVersion} onChange={(event) => onLeftChange(event.target.value)}>
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              v{version.version_number}
            </option>
          ))}
        </select>
        <span aria-hidden="true">↔</span>
        <select value={rightVersion} onChange={(event) => onRightChange(event.target.value)}>
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              v{version.version_number}
            </option>
          ))}
        </select>
        <button className="lab-btn lab-btn--ghost" type="button" onClick={onCompare}>
          Compare
        </button>
      </div>
      {diff ? (
        <div className="lab-diff-panel">
          {diff.field_changes.length > 0 ? (
            <ul className="lab-diff-list">
              {diff.field_changes.map((change) => (
                <li key={change.field}>
                  <strong>{change.field}</strong>: {String(change.left)} → {String(change.right)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="lab-page__note">No field changes.</p>
          )}
          {diff.ingredient_changes.added.length > 0 ? (
            <p>
              Added:{" "}
              {diff.ingredient_changes.added.map((line) => line.ingredient_name).join(", ")}
            </p>
          ) : null}
          {diff.ingredient_changes.removed.length > 0 ? (
            <p>
              Removed:{" "}
              {diff.ingredient_changes.removed.map((line) => line.ingredient_name).join(", ")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="lab-page__note">Pick two versions and compare.</p>
      )}
    </div>
  );
}
