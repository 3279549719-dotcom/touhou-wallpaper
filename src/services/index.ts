/** Services layer — business logic modules. */
export { getCurrentWallpaper, setWallpaper, wallpaperPathToImageUrl } from "./wallpaper";
export { listFavorites, toggleFavorite } from "./favorites";
export { getManifest, assetsReady, downloadAssets, resolveImagePath, getActiveFilename } from "./assets";
