import type { Character } from "../types/manifest";
import { CharacterCell } from "./CharacterCell";
import { strings } from "../lib/strings";

interface CharacterGridProps {
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
  onWheel: (delta: number) => void;
  imageUrlFor: (filename: string) => string;
}

export function CharacterGrid({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onWheel,
  imageUrlFor,
}: CharacterGridProps) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{strings.labelCharacters}</h2>
      <div
        className="character-grid"
        onWheel={(e) => {
          e.preventDefault();
          onWheel(e.deltaY > 0 ? 1 : -1);
        }}
        role="list"
      >
        {characters.map((character) => (
          <CharacterCell
            key={character.id}
            character={character}
            selected={character.id === activeCharacterId}
            thumbUrl={imageUrlFor(character.files[0] ?? `${character.id}_00.png`)}
            onSelect={() => onSelectCharacter(character.id)}
          />
        ))}
      </div>
    </div>
  );
}
