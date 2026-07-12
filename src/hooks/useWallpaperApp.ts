import { useCallback, useEffect, useMemo, useState } from "react";
import type { Manifest } from "../types/manifest";
import { nextCharacterIndex } from "../lib/grid";
import {
  getActiveFilename,
  getCurrentWallpaper,
  getManifest,
  listFavorites,
  setWallpaper,
  toggleFavorite as apiToggleFavorite,
  wallpaperPathToImageUrl,
} from "../lib/tauri";

export function useWallpaperApp() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState("001");
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentWallpaperPath, setCurrentWallpaperPath] = useState<string | null>(
    null,
  );
  const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, wp, fav] = await Promise.all([
          getManifest(),
          getCurrentWallpaper(),
          listFavorites(),
        ]);
        if (cancelled) return;
        setManifest(m);
        setCurrentWallpaperPath(wp || null);
        setCurrentWallpaperUrl(await wallpaperPathToImageUrl(wp || null));
        setFavorites(new Set(fav));
        if (m.characters.length > 0) {
          setActiveCharacterId(m.characters[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCharacter = useMemo(
    () => manifest?.characters.find((c) => c.id === activeCharacterId) ?? null,
    [manifest, activeCharacterId],
  );

  const activeFilename = useMemo(
    () => getActiveFilename(activeCharacterId, activeVariantIndex, manifest),
    [activeCharacterId, activeVariantIndex, manifest],
  );

  const selectCharacter = useCallback((id: string) => {
    setActiveCharacterId(id);
    setActiveVariantIndex(0);
  }, []);

  const selectVariant = useCallback((index: number) => {
    setActiveVariantIndex(index);
  }, []);

  const stepCharacter = useCallback(
    (delta: number) => {
      if (!manifest || manifest.characters.length === 0) return;
      const idx = manifest.characters.findIndex(
        (c) => c.id === activeCharacterId,
      );
      const next = nextCharacterIndex(
        idx < 0 ? 0 : idx,
        delta,
        manifest.characters.length,
      );
      selectCharacter(manifest.characters[next].id);
    },
    [manifest, activeCharacterId, selectCharacter],
  );

  const randomCharacter = useCallback(() => {
    if (!manifest || manifest.characters.length === 0) return;
    const idx = Math.floor(Math.random() * manifest.characters.length);
    selectCharacter(manifest.characters[idx].id);
  }, [manifest, selectCharacter]);

  const applyWallpaper = useCallback(async () => {
    if (!activeFilename) return;
    await setWallpaper(activeFilename);
    const wp = await getCurrentWallpaper();
    setCurrentWallpaperPath(wp || null);
    setCurrentWallpaperUrl(await wallpaperPathToImageUrl(wp || null));
  }, [activeFilename]);

  const toggleFavorite = useCallback(async () => {
    if (!activeFilename) return;
    const updated = await apiToggleFavorite(activeFilename);
    setFavorites(new Set(updated));
  }, [activeFilename]);

  const isFavorite = activeFilename ? favorites.has(activeFilename) : false;

  return {
    manifest,
    activeCharacterId,
    activeVariantIndex,
    activeCharacter,
    activeFilename,
    favorites,
    currentWallpaperPath,
    currentWallpaperUrl,
    loading,
    error,
    isFavorite,
    selectCharacter,
    selectVariant,
    stepCharacter,
    randomCharacter,
    applyWallpaper,
    toggleFavorite,
  };
}
