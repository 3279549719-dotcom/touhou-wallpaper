import { useCallback, useEffect, useMemo, useState } from "react";
import type { Manifest } from "../types/manifest";
import {
  buildFavoritesGallery,
  nextCharacterIndex,
} from "../lib/grid";
import {
  assetsReady,
  getActiveFilename,
  getCurrentWallpaper,
  getManifest,
  listFavorites,
  setWallpaper,
  toggleFavorite as apiToggleFavorite,
  wallpaperPathToImageUrl,
} from "../services";
import { clearAssetImageUrlCache } from "../lib/imageUrl";
import { strings } from "../lib/strings";

export function useWallpaperApp() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState("001");
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoritesOnlyHint, setFavoritesOnlyHint] = useState<string | null>(
    null,
  );
  const [currentWallpaperPath, setCurrentWallpaperPath] = useState<string | null>(
    null,
  );
  const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [needsDownload, setNeedsDownload] = useState(false);
  const [bootToken, setBootToken] = useState(0);

  const reloadApp = useCallback(() => {
    clearAssetImageUrlCache();
    setBootToken((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setNeedsDownload(false);
      try {
        const ready = await assetsReady();
        if (!ready) {
          const isDesktop =
            typeof window !== "undefined" &&
            "__TAURI_INTERNALS__" in window;
          if (isDesktop) {
            if (!cancelled) {
              setNeedsDownload(true);
              setLoading(false);
            }
            return;
          }
        }

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
        setFavoritesOnly(false);
        setFavoritesOnlyHint(null);
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
  }, [bootToken]);

  const activeCharacter = useMemo(
    () => manifest?.characters.find((c) => c.id === activeCharacterId) ?? null,
    [manifest, activeCharacterId],
  );

  const activeFilename = useMemo(
    () => getActiveFilename(activeCharacterId, activeVariantIndex, manifest),
    [activeCharacterId, activeVariantIndex, manifest],
  );

  const favoritesGallery = useMemo(() => {
    if (!manifest) return [];
    return buildFavoritesGallery(favorites, manifest.characters);
  }, [manifest, favorites]);

  const selectCharacter = useCallback((id: string) => {
    setActiveCharacterId(id);
    setActiveVariantIndex(0);
  }, []);

  const selectVariant = useCallback((index: number) => {
    setActiveVariantIndex(index);
  }, []);

  const selectFavoriteFilename = useCallback(
    (filename: string) => {
      if (!manifest) return;
      for (const character of manifest.characters) {
        const variantIndex = character.files.indexOf(filename);
        if (variantIndex >= 0) {
          setActiveCharacterId(character.id);
          setActiveVariantIndex(variantIndex);
          return;
        }
      }
    },
    [manifest],
  );

  const toggleFavoritesOnly = useCallback(() => {
    if (favoritesOnly) {
      setFavoritesOnly(false);
      setFavoritesOnlyHint(null);
      return;
    }
    if (favorites.size === 0) {
      setFavoritesOnlyHint(strings.favoritesOnlyEmpty);
      return;
    }
    setFavoritesOnlyHint(null);
    setFavoritesOnly(true);
    if (!manifest) return;
    const gallery = buildFavoritesGallery(favorites, manifest.characters);
    const current = getActiveFilename(
      activeCharacterId,
      activeVariantIndex,
      manifest,
    );
    const match = gallery.find((g) => g.filename === current);
    const pick = match ?? gallery[0];
    if (pick) {
      setActiveCharacterId(pick.characterId);
      setActiveVariantIndex(pick.variantIndex);
    }
  }, [
    favoritesOnly,
    favorites,
    manifest,
    activeCharacterId,
    activeVariantIndex,
  ]);

  const stepCharacter = useCallback(
    (delta: number) => {
      if (!manifest || manifest.characters.length === 0) return;

      if (favoritesOnly) {
        const gallery = buildFavoritesGallery(favorites, manifest.characters);
        if (gallery.length === 0) return;
        const current = getActiveFilename(
          activeCharacterId,
          activeVariantIndex,
          manifest,
        );
        const idx = gallery.findIndex((g) => g.filename === current);
        const next = nextCharacterIndex(
          idx < 0 ? 0 : idx,
          delta,
          gallery.length,
        );
        const pick = gallery[next];
        setActiveCharacterId(pick.characterId);
        setActiveVariantIndex(pick.variantIndex);
        return;
      }

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
    [
      manifest,
      activeCharacterId,
      activeVariantIndex,
      favoritesOnly,
      favorites,
      selectCharacter,
    ],
  );

  const randomCharacter = useCallback(() => {
    if (!manifest || manifest.characters.length === 0) return;

    if (favoritesOnly) {
      const gallery = buildFavoritesGallery(favorites, manifest.characters);
      if (gallery.length === 0) return;
      const current = getActiveFilename(
        activeCharacterId,
        activeVariantIndex,
        manifest,
      );
      let pick = gallery[Math.floor(Math.random() * gallery.length)];
      if (gallery.length > 1 && current) {
        let attempts = 0;
        while (pick.filename === current && attempts < 8) {
          pick = gallery[Math.floor(Math.random() * gallery.length)];
          attempts += 1;
        }
      }
      setActiveCharacterId(pick.characterId);
      setActiveVariantIndex(pick.variantIndex);
      return;
    }

    const idx = Math.floor(Math.random() * manifest.characters.length);
    selectCharacter(manifest.characters[idx].id);
  }, [
    manifest,
    favoritesOnly,
    favorites,
    activeCharacterId,
    activeVariantIndex,
    selectCharacter,
  ]);

  const applyWallpaper = useCallback(async () => {
    if (!activeFilename) return;
    setApplyError(null);
    try {
      await setWallpaper(activeFilename);
      const wp = await getCurrentWallpaper();
      setCurrentWallpaperPath(wp || null);
      setCurrentWallpaperUrl(await wallpaperPathToImageUrl(wp || null));
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : String(e));
    }
  }, [activeFilename]);

  const toggleFavorite = useCallback(async () => {
    if (!activeFilename) return;
    const previousFilename = activeFilename;
    const previousGallery = favoritesOnly
      ? buildFavoritesGallery(favorites, manifest?.characters ?? [])
      : [];
    const updated = await apiToggleFavorite(previousFilename);
    const nextSet = new Set(updated);
    setFavorites(nextSet);

    if (!favoritesOnly) return;

    if (updated.length === 0) {
      setFavoritesOnly(false);
      setFavoritesOnlyHint(null);
      return;
    }

    if (!nextSet.has(previousFilename) && manifest) {
      const nextGallery = buildFavoritesGallery(nextSet, manifest.characters);
      const oldIdx = previousGallery.findIndex(
        (g) => g.filename === previousFilename,
      );
      const pick =
        nextGallery[Math.min(Math.max(oldIdx, 0), nextGallery.length - 1)] ??
        nextGallery[0];
      if (pick) {
        setActiveCharacterId(pick.characterId);
        setActiveVariantIndex(pick.variantIndex);
      }
    }
  }, [activeFilename, favoritesOnly, favorites, manifest]);

  const isFavorite = activeFilename ? favorites.has(activeFilename) : false;

  return {
    manifest,
    activeCharacterId,
    activeVariantIndex,
    activeCharacter,
    activeFilename,
    favorites,
    favoritesGallery,
    favoritesOnly,
    favoritesOnlyHint,
    currentWallpaperPath,
    currentWallpaperUrl,
    loading,
    error,
    applyError,
    isFavorite,
    needsDownload,
    reloadApp,
    selectCharacter,
    selectVariant,
    selectFavoriteFilename,
    toggleFavoritesOnly,
    stepCharacter,
    randomCharacter,
    applyWallpaper,
    toggleFavorite,
  };
}
