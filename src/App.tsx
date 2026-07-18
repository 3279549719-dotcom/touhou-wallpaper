import { AppShell } from "./components/layout/AppShell";
import { ActionBar } from "./components/nav/ActionBar";
import { CharacterNav } from "./components/nav/CharacterNav";
import { CharacterSidebar } from "./components/sidebars/CharacterSidebar";
import { CurrentWallpaperPanel } from "./components/panels/CurrentWallpaperPanel";
import { DownloadScreen } from "./components/common/DownloadScreen";
import { EmptyAssetsBanner } from "./components/common/EmptyAssetsBanner";
import { FavoritesGallerySidebar } from "./components/sidebars/FavoritesGallerySidebar";
import { PreviewPane } from "./components/panels/PreviewPane";
import { VariantStrip } from "./components/panels/VariantStrip";
import { useWallpaperApp } from "./hooks/useWallpaperApp";
import { characterLabel, favoriteGalleryLabel } from "./lib/grid";
import { strings } from "./lib/strings";
import "./styles/theme.css";

export default function App() {
  const app = useWallpaperApp();

  if (app.loading) {
    return <p className="muted">Loading...</p>;
  }

  if (app.needsDownload) {
    return (
      <div className="app-shell">
        <DownloadScreen onComplete={app.reloadApp} />
      </div>
    );
  }

  if (app.error) {
    return <p className="muted">Error: {app.error}</p>;
  }

  const allCharacters = app.manifest?.characters ?? [];
  const characters = app.visibleCharacters;
  const assetsReady = allCharacters.length >= 126;
  const gallery = app.visibleFavoritesGallery;

  const label = app.favoritesOnly
    ? app.activeFilename && app.activeCharacter
      ? favoriteGalleryLabel(
          app.activeCharacter.id,
          app.activeCharacter.name,
          app.activeVariantIndex,
        )
      : ""
    : app.activeCharacter
      ? characterLabel(app.activeCharacter.id, app.activeCharacter.name)
      : "";

  const activeIndex = app.favoritesOnly
    ? gallery.findIndex((g) => g.filename === app.activeFilename)
    : characters.findIndex((c) => c.id === app.activeCharacterId);
  const total = app.favoritesOnly ? gallery.length : characters.length;
  const positionText =
    activeIndex >= 0 ? `${activeIndex + 1} / ${total}` : `0 / ${total}`;

  return (
    <>
      {!assetsReady && <EmptyAssetsBanner />}
      <AppShell
        sidebar={
          allCharacters.length > 0 ? (
            app.favoritesOnly ? (
              <FavoritesGallerySidebar
                items={gallery}
                activeFilename={app.activeFilename}
                favoritesOnly={app.favoritesOnly}
                favoritesOnlyHint={app.favoritesOnlyHint}
                onToggleFavoritesOnly={app.toggleFavoritesOnly}
                onSelectFilename={app.selectFavoriteFilename}
                searchQuery={app.searchQuery}
                onSearchQueryChange={app.setSearchQuery}
                onClearSearch={app.clearSearch}
                searchShowHint={app.isSearching}
                searchEmptyMessage={app.searchEmptyMessage}
              />
            ) : (
              <CharacterSidebar
                characters={characters}
                activeCharacterId={app.activeCharacterId}
                favoritesOnly={app.favoritesOnly}
                favoritesOnlyHint={app.favoritesOnlyHint}
                onToggleFavoritesOnly={app.toggleFavoritesOnly}
                onSelectCharacter={app.selectCharacter}
                searchQuery={app.searchQuery}
                onSearchQueryChange={app.setSearchQuery}
                onClearSearch={app.clearSearch}
                searchShowHint={app.isSearching}
                searchEmptyMessage={app.searchEmptyMessage}
              />
            )
          ) : (
            <aside className="character-sidebar panel">
              <p className="muted">{strings.emptyAssets}</p>
            </aside>
          )
        }
        main={
          <>
            <div className="main-stage-header">
              <CurrentWallpaperPanel
                path={app.currentWallpaperPath}
                imageUrl={app.currentWallpaperUrl}
                onRandom={app.randomCharacter}
              />
            </div>
            <PreviewPane
              characterLabel={label}
              filename={app.activeFilename}
            />
            <div className="main-stage-actions">
              <ActionBar
                isFavorite={app.isFavorite}
                onApply={() => void app.applyWallpaper()}
                onToggleFavorite={() => void app.toggleFavorite()}
              />
              {app.applyError ? (
                <p className="muted apply-error">
                  {strings.applyFailed}: {app.applyError}
                </p>
              ) : null}
            </div>
            <div className="main-stage-footer">
              <CharacterNav
                characterLabel={label}
                positionText={positionText}
                onPrevious={() => app.stepCharacter(-1)}
                onNext={() => app.stepCharacter(1)}
              />
              {!app.favoritesOnly ? (
                <VariantStrip
                  character={app.activeCharacter}
                  activeVariantIndex={app.activeVariantIndex}
                  onSelectVariant={app.selectVariant}
                />
              ) : null}
            </div>
          </>
        }
      />
    </>
  );
}
