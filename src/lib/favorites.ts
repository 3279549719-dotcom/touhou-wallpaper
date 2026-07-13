/** Pure favorites list helpers (shared by Tauri client mock and tests). */

export function toggleFavoriteInList(
  favorites: readonly string[],
  filename: string,
): string[] {
  const next = new Set(favorites);
  if (next.has(filename)) {
    next.delete(filename);
  } else {
    next.add(filename);
  }
  return [...next].sort();
}
