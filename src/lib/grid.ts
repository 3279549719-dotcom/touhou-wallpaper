/** Character list helpers (scheme A: sidebar + prev/next nav). */
import type { Character } from "../types/manifest";

export const SIDEBAR_LAYOUT = "split";

export interface FavoriteGalleryItem {
  filename: string;
  characterId: string;
  characterName: string;
  variantIndex: number;
}

export function characterLabel(id: string, name: string): string {
  return `${id} ${name}`;
}

export function favoriteGalleryLabel(
  characterId: string,
  name: string,
  variantIndex: number,
): string {
  return `${characterId} ${name} · ${String(variantIndex).padStart(2, "0")}`;
}

export function nextCharacterIndex(
  currentIndex: number,
  delta: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return (currentIndex + delta + total) % total;
}

/** Build gallery rows: one per favorited file, ordered by character then variant. */
export function buildFavoritesGallery(
  favorites: Iterable<string>,
  characters: Character[],
): FavoriteGalleryItem[] {
  const favSet = favorites instanceof Set ? favorites : new Set(favorites);
  const items: FavoriteGalleryItem[] = [];
  for (const character of characters) {
    character.files.forEach((filename, variantIndex) => {
      if (favSet.has(filename)) {
        items.push({
          filename,
          characterId: character.id,
          characterName: character.name,
          variantIndex,
        });
      }
    });
  }
  return items;
}
