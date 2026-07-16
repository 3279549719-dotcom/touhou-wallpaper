import { AssetImage } from "../common/AssetImage";
import { strings } from "../../lib/strings";

interface PreviewPaneProps {
  characterLabel: string;
  filename: string | null;
}

export function PreviewPane({
  characterLabel,
  filename,
}: PreviewPaneProps) {
  return (
    <section className="preview-pane" aria-label={strings.labelPreview}>
      <div className="preview-pane-meta">
        <h2>{strings.labelPreview}</h2>
        <p className="muted">{characterLabel}</p>
      </div>
      <div className="preview-stage-body">
        {filename ? (
          <AssetImage
            filename={filename}
            alt={filename}
            className="preview-image"
          />
        ) : (
          <span className="muted">{strings.emptyAssets}</span>
        )}
      </div>
    </section>
  );
}
