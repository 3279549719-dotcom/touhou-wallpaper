/** Favorites service — manage favorites across Tauri / browser. */
import { toggleFavoriteInList } from "../lib/favorites";

const BROWSER_FAVORITES_KEY = "touhou…ites";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function readBrowserFavorites(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(BROWSER_FAVORITES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as { favorites?: unknown };
    if (!Array.isArray(data.favorites)) return [];
    return [
      ...new Set(
        data.favorites.filter((item): item is string => typeof item === "string"),
      ),
    ].sort();
  } catch {
    return [];
  }
}

function writeBrowserFavorites(favorites: string[]): string[] {
  const unique = [...new Set(favorites)].sort();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(
        BROWSER_FAVORITES_KEY,
        JSON.stringify({ favorites: unique }),
      );
    } catch {
      // Ignore quota / private-mode failures.
    }
  }
  return unique;
}

export async function listFavorites(): Promise<string[]> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string[]>("list_favorites");
  }
  return readBrowserFavorites();
}

export async function toggleFavorite(filename: string): Promise<string[]> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string[]>("toggle_favorite", { filename });
  }
  const updated = toggleFavoriteInList(readBrowserFavorites(), filename);
  return writeBrowserFavorites(updated);
}
