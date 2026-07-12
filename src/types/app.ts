import type { Manifest } from "./manifest";

export interface AppSelection {
  characterId: string;
  variantIndex: number;
}

export interface WallpaperAppState {
  manifest: Manifest | null;
  selection: AppSelection;
  favorites: Set<string>;
  currentWallpaperPath: string | null;
  loading: boolean;
  error: string | null;
}
