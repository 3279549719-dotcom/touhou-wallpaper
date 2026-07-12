import type { Character } from "../types/manifest";
import { AssetImage } from "./AssetImage";
import { characterLabel } from "../lib/grid";
import { strings } from "../lib/strings";

interface CharacterSidebarProps {
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
}

export function CharacterSidebar({
  characters,
  activeCharacterId,
  onSelectCharacter,
}: CharacterSidebarProps) {
  return (
    <aside className="character-sidebar">
      <div className="character-sidebar-header">
        <h2>{strings.labelCharacters}</h2>
        <span className="muted">{strings.sidebarScrollHint}</span>
      </div>
      <div className="character-sidebar-scroll" role="list">
        {characters.map((character) => {
          const label = characterLabel(character.id, character.name);
          const selected = character.id === activeCharacterId;
          const thumb = character.files[0] ?? `${character.id}_00.png`;
          return (
            <button
              key={character.id}
              type="button"
              data-character-id={character.id}
              className={`character-sidebar-item${selected ? " selected" : ""}`}
              onClick={() => onSelectCharacter(character.id)}
              aria-pressed={selected}
              aria-label={label}
            >
              <AssetImage
                filename={thumb}
                alt=""
                className="character-sidebar-thumb"
                aria-hidden
              />
              <span className="character-sidebar-label">{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
