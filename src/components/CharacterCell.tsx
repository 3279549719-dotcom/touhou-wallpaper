import type { Character } from "../types/manifest";

interface CharacterCellProps {
  character: Character;
  selected: boolean;
  thumbUrl: string;
  onSelect: () => void;
}

export function CharacterCell({
  character,
  selected,
  thumbUrl,
  onSelect,
}: CharacterCellProps) {
  const label = `${character.id} ${character.name}`;
  return (
    <button
      type="button"
      className={`character-cell${selected ? " selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <img
        src={thumbUrl}
        alt={label}
        style={{
          width: "100%",
          maxHeight: 64,
          objectFit: "contain",
          borderRadius: 4,
          marginBottom: 4,
          background: "var(--grid-selected)",
        }}
      />
      <span style={{ fontSize: "0.75rem" }}>{label}</span>
    </button>
  );
}
