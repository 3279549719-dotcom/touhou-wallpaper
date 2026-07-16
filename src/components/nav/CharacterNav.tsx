import { strings } from "../../lib/strings";

interface CharacterNavProps {
  characterLabel: string;
  positionText: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function CharacterNav({
  characterLabel,
  positionText,
  onPrevious,
  onNext,
}: CharacterNavProps) {
  return (
    <div className="character-nav">
      <button
        type="button"
        className="character-nav-btn"
        onClick={onPrevious}
        aria-label={strings.btnPrevCharacter}
      >
        ‹
      </button>
      <div className="character-nav-center">
        <strong>{characterLabel}</strong>
        <span className="muted">{positionText}</span>
      </div>
      <button
        type="button"
        className="character-nav-btn"
        onClick={onNext}
        aria-label={strings.btnNextCharacter}
      >
        ›
      </button>
    </div>
  );
}
