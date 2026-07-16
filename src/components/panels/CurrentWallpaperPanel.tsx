import { strings } from "../../lib/strings";

interface CurrentWallpaperPanelProps {
  path: string | null;
  imageUrl: string | null;
  onRandom: () => void;
}

function basename(path: string | null): string | null {
  if (!path) return null;
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || null;
}

export function CurrentWallpaperPanel({
  path,
  imageUrl,
  onRandom,
}: CurrentWallpaperPanelProps) {
  const filename = basename(path);

  return (
    <div className="current-wallpaper-panel">
      <div className="current-wallpaper-info">
        <strong>{strings.labelCurrentWallpaper}</strong>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={filename ?? strings.labelCurrentWallpaper}
            className="current-wallpaper-thumb"
          />
        ) : (
          <div className="current-wallpaper-thumb current-wallpaper-thumb--empty">
            <span className="muted">{strings.noCurrentWallpaper}</span>
          </div>
        )}
        <p className="muted current-wallpaper-caption">
          {filename ?? strings.noCurrentWallpaper}
        </p>
      </div>
      <button type="button" onClick={onRandom}>
        {strings.btnRandom}
      </button>
    </div>
  );
}
