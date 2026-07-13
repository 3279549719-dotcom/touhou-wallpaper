import type { FavoriteGalleryItem } from "../lib/grid";
import { favoriteGalleryLabel } from "../lib/grid";
import { strings } from "../lib/strings";
import { AssetImage } from "./AssetImage";

interface FavoritesGallerySidebarProps {
  items: FavoriteGalleryItem[];
  activeFilename: string | null;
  favoritesOnly: boolean;
  favoritesOnlyHint: string | null;
  onToggleFavoritesOnly: () => void;
  onSelectFilename: (filename: string) => void;
}

export function FavoritesGallerySidebar({
  items,
  activeFilename,
  favoritesOnly,
  favoritesOnlyHint,
  onToggleFavoritesOnly,
  onSelectFilename,
}: FavoritesGallerySidebarProps) {
  return (
    <aside className="character-sidebar">
      <div className="character-sidebar-header">
        <h2>{strings.labelFavoritesGallery}</h2>
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
        {items.map((item) => {
          const label = favoriteGalleryLabel(
            item.characterId,
            item.characterName,
            item.variantIndex,
          );
          const selected = item.filename === activeFilename;
          return (
            <button
              key={item.filename}
              type="button"
              data-favorite-filename={item.filename}
              className={`character-sidebar-item${selected ? " selected" : ""}`}
              onClick={() => onSelectFilename(item.filename)}
              aria-pressed={selected}
              aria-label={label}
            >
              <AssetImage
                filename={item.filename}
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
