import { strings } from "../lib/strings";

interface CurrentWallpaperPanelProps {
  path: string | null;
  onRandom: () => void;
}

export function CurrentWallpaperPanel({
  path,
  onRandom,
}: CurrentWallpaperPanelProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div>
        <strong>{strings.labelCurrentWallpaper}</strong>
        <p className="muted">{path || strings.noCurrentWallpaper}</p>
      </div>
      <button type="button" onClick={onRandom}>
        {strings.btnRandom}
      </button>
    </div>
  );
}
