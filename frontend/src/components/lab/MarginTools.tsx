type MarginToolsProps = {
  onCompare: () => void;
  onPublish: () => void;
  onToggleJournal: () => void;
  journalOpen: boolean;
};

export function MarginTools({
  onCompare,
  onPublish,
  onToggleJournal,
  journalOpen,
}: MarginToolsProps) {
  return (
    <div className="lab-margin-tools">
      <p className="lab-column-heading">Tools</p>
      <button type="button" className="lab-margin-tools__btn" onClick={onCompare}>
        Compare ↔
      </button>
      <button type="button" className="lab-margin-tools__btn" onClick={onPublish}>
        Publish ✎
      </button>
      <button type="button" className="lab-margin-tools__btn" onClick={onToggleJournal}>
        {journalOpen ? "Hide test log ↑" : "Test log ↓"}
      </button>
    </div>
  );
}
