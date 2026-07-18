import { useCallback, useEffect, useMemo, useState } from "react";
import type { Manifest } from "../types/manifest";
import { buildFavoritesGallery } from "../lib/grid";
import {
  filterCharactersByName,
  filterFavoritesByCharacterName,
  pickRandomPreferDifferent,
  stepInList,
} from "../lib/search";
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
import { useWallpaperStore } from "../stores/wallpaperStore";
import { useCharacterSearch } from "./useCharacterSearch";

export function useWallpaperApp() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState("001");
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const favoritesList = useWallpaperStore((s) => s.favorites);
  const favoritesOnly = useWallpaperStore((s) => s.favoritesOnly);
  const favoritesOnlyHint = useWallpaperStore((s) => s.favoritesOnlyHint);
  const setFavorites = useWallpaperStore((s) => s.setFavorites);
  const setFavoritesOnly = useWallpaperStore((s) => s.setFavoritesOnly);
  const setFavoritesOnlyHint = useWallpaperStore((s) => s.setFavoritesOnlyHint);
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    clearSearch,
    isSearching,
  } = useCharacterSearch();
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

  const favorites = useMemo(() => new Set(favoritesList), [favoritesList]);

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
        setFavorites(fav);
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
  }, [bootToken, setFavorites, setFavoritesOnly, setFavoritesOnlyHint]);

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

  const visibleCharacters = useMemo(() => {
    if (!manifest) return [];
    return filterCharactersByName(manifest.characters, searchQuery);
  }, [manifest, searchQuery]);

  const visibleFavoritesGallery = useMemo(() => {
    return filterFavoritesByCharacterName(favoritesGallery, searchQuery);
  }, [favoritesGallery, searchQuery]);

  const searchEmptyMessage = useMemo(() => {
    if (!isSearching) return null;
    if (favoritesOnly) {
      return visibleFavoritesGallery.length === 0
        ? strings.searchEmptyFavorites
        : null;
    }
    return visibleCharacters.length === 0
      ? strings.searchEmptyCharacters
      : null;
  }, [
    isSearching,
    favoritesOnly,
    visibleFavoritesGallery.length,
    visibleCharacters.length,
  ]);

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
    clearSearch();
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
    clearSearch,
    favoritesOnly,
    favorites,
    manifest,
    activeCharacterId,
    activeVariantIndex,
    setFavoritesOnly,
    setFavoritesOnlyHint,
  ]);

  const stepCharacter = useCallback(
    (delta: number) => {
      if (!manifest) return;

      if (favoritesOnly) {
        const list = visibleFavoritesGallery;
        if (list.length === 0) return;
        const current = getActiveFilename(
          activeCharacterId,
          activeVariantIndex,
          manifest,
        );
        const idx = list.findIndex((g) => g.filename === current);
        const pick = stepInList(list, idx < 0 ? 0 : idx, delta);
        if (!pick) return;
        setActiveCharacterId(pick.characterId);
        setActiveVariantIndex(pick.variantIndex);
        return;
      }

      const list = visibleCharacters;
      if (list.length === 0) return;
      const idx = list.findIndex((c) => c.id === activeCharacterId);
      const pick = stepInList(list, idx < 0 ? 0 : idx, delta);
      if (!pick) return;
      selectCharacter(pick.id);
    },
    [
      manifest,
      favoritesOnly,
      visibleFavoritesGallery,
      visibleCharacters,
      activeCharacterId,
      activeVariantIndex,
      selectCharacter,
    ],
  );

  const randomCharacter = useCallback(() => {
    if (!manifest) return;

    if (favoritesOnly) {
      const list = visibleFavoritesGallery;
      const current = getActiveFilename(
        activeCharacterId,
        activeVariantIndex,
        manifest,
      );
      const pick = pickRandomPreferDifferent(
        list,
        (item) => item.filename === current,
      );
      if (!pick) return;
      setActiveCharacterId(pick.characterId);
      setActiveVariantIndex(pick.variantIndex);
      return;
    }

    const list = visibleCharacters;
    const pick = pickRandomPreferDifferent(
      list,
      (item) => item.id === activeCharacterId,
    );
    if (!pick) return;
    selectCharacter(pick.id);
  }, [
    manifest,
    favoritesOnly,
    visibleFavoritesGallery,
    visibleCharacters,
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
    setFavorites(updated);

    if (!favoritesOnly) return;

    if (updated.length === 0) {
      clearSearch();
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
  }, [
    activeFilename,
    favoritesOnly,
    favorites,
    manifest,
    clearSearch,
    setFavorites,
    setFavoritesOnly,
    setFavoritesOnlyHint,
  ]);

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
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearching,
    visibleCharacters,
    visibleFavoritesGallery,
    searchEmptyMessage,
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
