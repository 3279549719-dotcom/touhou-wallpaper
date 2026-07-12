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
    <section className="preview-pane" aria-label={strings.labelPreview}>
      <div className="preview-pane-meta">
        <h2>{strings.labelPreview}</h2>
        <p className="muted">{characterLabel}</p>
      </div>
      <div className="preview-stage-body">
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
    </section>
  );
}
