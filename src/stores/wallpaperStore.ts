import { create } from "zustand";
import { toggleFavoriteInList } from "../lib/favorites";

type WallpaperStore = {
  favorites: string[];
  favoritesOnly: boolean;
  favoritesOnlyHint: string | null;
  setFavorites: (filenames: string[]) => void;
  setFavoritesOnly: (value: boolean) => void;
  setFavoritesOnlyHint: (hint: string | null) => void;
  applyToggleFavoriteLocal: (filename: string) => void;
};

export const useWallpaperStore = create<WallpaperStore>((set, get) => ({
  favorites: [],
  favoritesOnly: false,
  favoritesOnlyHint: null,
  setFavorites: (filenames) => set({ favorites: filenames }),
  setFavoritesOnly: (value) => set({ favoritesOnly: value }),
  setFavoritesOnlyHint: (hint) => set({ favoritesOnlyHint: hint }),
  applyToggleFavoriteLocal: (filename) =>
    set({ favorites: toggleFavoriteInList(get().favorites, filename) }),
}));
