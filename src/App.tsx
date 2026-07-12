import { AppShell } from "./components/layout/AppShell";
import { ActionBar } from "./components/ActionBar";
import { CharacterGrid } from "./components/CharacterGrid";
import { CurrentWallpaperPanel } from "./components/CurrentWallpaperPanel";
import { EmptyAssetsBanner } from "./components/EmptyAssetsBanner";
import { PreviewPane } from "./components/PreviewPane";
import { VariantStrip } from "./components/VariantStrip";
import { useWallpaperApp } from "./hooks/useWallpaperApp";
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
  const characterLabel = app.activeCharacter
    ? `${app.activeCharacter.id} ${app.activeCharacter.name}`
    : "";

  const imageUrlFor = (filename: string) => `/assets/images/${filename}`;

  const previewUrl = app.activeFilename
    ? imageUrlFor(app.activeFilename)
    : null;

  return (
    <>
      {!assetsReady && <EmptyAssetsBanner />}
      <AppShell
        top={
          <CurrentWallpaperPanel
            path={app.currentWallpaperPath}
            onRandom={app.randomCharacter}
          />
        }
        preview={
          <>
            <PreviewPane
              characterLabel={characterLabel}
              filename={app.activeFilename}
              imageUrl={previewUrl}
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
          </>
        }
        grid={
          characters.length > 0 ? (
            <CharacterGrid
              characters={characters}
              activeCharacterId={app.activeCharacterId}
              onSelectCharacter={app.selectCharacter}
              onWheel={app.wheelCharacter}
              imageUrlFor={imageUrlFor}
            />
          ) : (
            <p className="muted">{strings.emptyAssets}</p>
          )
        }
      />
    </>
  );
}
