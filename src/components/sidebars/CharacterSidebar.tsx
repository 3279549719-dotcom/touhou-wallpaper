import type { Character } from "../../types/manifest";
import { AssetImage } from "../common/AssetImage";
import { characterLabel } from "../../lib/grid";
import { strings } from "../../lib/strings";

interface CharacterSidebarProps {
  characters: Character[];
  activeCharacterId: string;
  favoritesOnly: boolean;
  favoritesOnlyHint: string | null;
  onToggleFavoritesOnly: () => void;
  onSelectCharacter: (id: string) => void;
}

export function CharacterSidebar({
  characters,
  activeCharacterId,
  favoritesOnly,
  favoritesOnlyHint,
  onToggleFavoritesOnly,
  onSelectCharacter,
}: CharacterSidebarProps) {
  return (
    <aside className="character-sidebar">
      <div className="character-sidebar-header">
        <h2>{strings.labelCharacters}</h2>
        <span className="muted">{strings.sidebarScrollHint}</span>
        <label className="favorites-only-toggle">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={onToggleFavoritesOnly}
            data-testid="favorites-only-toggle"
          />
          <span>{strings.btnFavoritesOnly}</span>
        </label>
        {favoritesOnlyHint ? (
          <p className="favorites-only-hint" role="status">
            {favoritesOnlyHint}
          </p>
        ) : null}
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
