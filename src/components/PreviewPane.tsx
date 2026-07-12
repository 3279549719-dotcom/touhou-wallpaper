import { strings } from "../lib/strings";

interface PreviewPaneProps {
  characterLabel: string;
  filename: string | null;
  imageUrl: string | null;
}

export function PreviewPane({
  characterLabel,
  filename,
  imageUrl,
}: PreviewPaneProps) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{strings.labelPreview}</h2>
      <p className="muted">{characterLabel}</p>
      <div
        style={{
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed var(--border)",
          borderRadius: 8,
          background: "var(--surface)",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={filename ?? strings.labelPreview}
            className="preview-image"
          />
        ) : filename ? (
          <span className="muted">{filename}</span>
        ) : (
          <span className="muted">{strings.emptyAssets}</span>
        )}
      </div>
    </div>
  );
}
