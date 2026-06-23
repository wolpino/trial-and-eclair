const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type AlphabetRailProps = {
  activeLetters: Set<string>;
  onLetterClick: (letter: string) => void;
};

export function AlphabetRail({ activeLetters, onLetterClick }: AlphabetRailProps) {
  return (
    <nav className="recipe-box-rail" aria-label="A–Z index">
      {LETTERS.map((letter) => {
        const active = activeLetters.has(letter);
        return (
          <button
            key={letter}
            className={`recipe-box-rail__letter${active ? " recipe-box-rail__letter--active" : ""}`}
            disabled={!active}
            type="button"
            onClick={() => onLetterClick(letter)}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
}
