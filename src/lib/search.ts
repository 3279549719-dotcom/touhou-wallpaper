import type { Character } from "../types/manifest";
import type { FavoriteGalleryItem } from "./grid";
import { nextCharacterIndex } from "./grid";

function normalizedQuery(query: string): string {
  return query.trim();
}

/** Filter characters by name substring. Empty/whitespace query → unchanged list. Does not match id. */
export function filterCharactersByName(
  characters: Character[],
  query: string,
): Character[] {
  const q = normalizedQuery(query);
  if (!q) return characters;
  return characters.filter((c) => c.name.startsWith(q));
}

/** Filter favorite gallery rows by characterName substring. */
export function filterFavoritesByCharacterName(
  items: FavoriteGalleryItem[],
  query: string,
): FavoriteGalleryItem[] {
  const q = normalizedQuery(query);
  if (!q) return items;
  return items.filter((item) => item.characterName.startsWith(q));
}

export function stepInList<T>(
  items: T[],
  currentIndex: number,
  delta: number,
): T | null {
  if (items.length === 0) return null;
  // Not in the working set: enter at first (› / next) or last (‹ / prev).
  if (currentIndex < 0) {
    return delta < 0 ? (items[items.length - 1] ?? null) : (items[0] ?? null);
  }
  const next = nextCharacterIndex(currentIndex, delta, items.length);
  return items[next] ?? null;
}

export function pickRandomPreferDifferent<T>(
  items: T[],
  isCurrent: (item: T) => boolean,
  random: () => number = Math.random,
): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  let pick = items[Math.floor(random() * items.length)]!;
  let attempts = 0;
  while (isCurrent(pick) && attempts < 8) {
    pick = items[Math.floor(random() * items.length)]!;
    attempts += 1;
  }
  return pick;
}
