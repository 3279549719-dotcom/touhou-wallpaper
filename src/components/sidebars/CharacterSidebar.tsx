import type { Character } from "../../types/manifest";
import { AssetImage } from "../common/AssetImage";
import { characterLabel } from "../../lib/grid";
import { strings } from "../../lib/strings";
import { CharacterSearchField } from "./CharacterSearchField";

interface CharacterSidebarProps {
  characters: Character[];
  activeCharacterId: string;
  favoritesOnly: boolean;
  favoritesOnlyHint: string | null;
  onToggleFavoritesOnly: () => void;
  onSelectCharacter: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClearSearch: () => void;
  searchShowHint: boolean;
  searchEmptyMessage: string | null;
}

export function CharacterSidebar({
  characters,
  activeCharacterId,
  favoritesOnly,
  favoritesOnlyHint,
  onToggleFavoritesOnly,
  onSelectCharacter,
  searchQuery,
  onSearchQueryChange,
  onClearSearch,
  searchShowHint,
  searchEmptyMessage,
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
        <CharacterSearchField
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          onClear={onClearSearch}
          showHint={searchShowHint}
          emptyMessage={searchEmptyMessage}
        />
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
