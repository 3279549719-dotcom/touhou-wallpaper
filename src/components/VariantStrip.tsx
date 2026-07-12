import type { Character } from "../types/manifest";
import { strings } from "../lib/strings";

interface VariantStripProps {
  character: Character | null;
  activeVariantIndex: number;
  onSelectVariant: (index: number) => void;
  imageUrlFor: (filename: string) => string;
}

export function VariantStrip({
  character,
  activeVariantIndex,
  onSelectVariant,
  imageUrlFor,
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
            style={{
              padding: 2,
              border:
                index === activeVariantIndex
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--surface)",
            }}
          >
            <img
              src={imageUrlFor(file)}
              alt={file}
              className={`variant-thumb${index === activeVariantIndex ? " selected" : ""}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
