import { AppShell } from "./components/layout/AppShell";
import { ActionBar } from "./components/ActionBar";
import { CharacterNav } from "./components/CharacterNav";
import { CharacterSidebar } from "./components/CharacterSidebar";
import { CurrentWallpaperPanel } from "./components/CurrentWallpaperPanel";
import { EmptyAssetsBanner } from "./components/EmptyAssetsBanner";
import { PreviewPane } from "./components/PreviewPane";
import { VariantStrip } from "./components/VariantStrip";
import { useWallpaperApp } from "./hooks/useWallpaperApp";
import { characterLabel } from "./lib/grid";
import { strings } from "./lib/strings";
import "./styles/theme.css";

export default function App() {
  const app = useWallpaperApp();

  if (app.loading) {
    return <p className="muted">Loading...</p>;
  }

  if (app.error) {
    return <p className="muted">Error: {app.error}</p>;
  }

  const characters = app.manifest?.characters ?? [];
  const assetsReady = characters.length >= 126;
  const label = app.activeCharacter
    ? characterLabel(app.activeCharacter.id, app.activeCharacter.name)
    : "";

  const activeIndex = characters.findIndex((c) => c.id === app.activeCharacterId);
  const positionText =
    activeIndex >= 0
      ? `${activeIndex + 1} / ${characters.length}`
      : `0 / ${characters.length}`;

  const imageUrlFor = (filename: string) => `/assets/images/${filename}`;
  const previewUrl = app.activeFilename
    ? imageUrlFor(app.activeFilename)
    : null;

  return (
    <>
      {!assetsReady && <EmptyAssetsBanner />}
      <AppShell
        sidebar={
          characters.length > 0 ? (
            <CharacterSidebar
              characters={characters}
              activeCharacterId={app.activeCharacterId}
              onSelectCharacter={app.selectCharacter}
              imageUrlFor={imageUrlFor}
            />
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
                onRandom={app.randomCharacter}
              />
            </div>
            <PreviewPane
              characterLabel={label}
              filename={app.activeFilename}
              imageUrl={previewUrl}
            />
            <div className="main-stage-footer">
              <CharacterNav
                characterLabel={label}
                positionText={positionText}
                onPrevious={() => app.stepCharacter(-1)}
                onNext={() => app.stepCharacter(1)}
              />
              <VariantStrip
                character={app.activeCharacter}
                activeVariantIndex={app.activeVariantIndex}
                onSelectVariant={app.selectVariant}
                imageUrlFor={imageUrlFor}
              />
              <ActionBar
                isFavorite={app.isFavorite}
                onApply={() => void app.applyWallpaper()}
                onToggleFavorite={() => void app.toggleFavorite()}
              />
            </div>
          </>
        }
      />
    </>
  );
}
