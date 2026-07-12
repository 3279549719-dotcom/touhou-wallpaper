import type { Character } from "../types/manifest";
import { AssetImage } from "./AssetImage";
import { strings } from "../lib/strings";

interface VariantStripProps {
  character: Character | null;
  activeVariantIndex: number;
  onSelectVariant: (index: number) => void;
}

export function VariantStrip({
  character,
  activeVariantIndex,
  onSelectVariant,
}: VariantStripProps) {
  if (!character || character.files.length === 0) {
    return <p className="muted">{strings.labelVariants}</p>;
  }

  return (
    <div>
      <p className="muted">{strings.labelVariants}</p>
      <div className="variant-strip">
        {character.files.map((file, index) => (
          <button
            key={file}
            type="button"
            onClick={() => onSelectVariant(index)}
            className={`variant-thumb-btn${index === activeVariantIndex ? " selected" : ""}`}
          >
            <AssetImage
              filename={file}
              alt={file}
              className={`variant-thumb${index === activeVariantIndex ? " selected" : ""}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
