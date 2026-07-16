import { useEffect, useState } from "react";
import { getAssetImageUrl } from "../../lib/imageUrl";

interface AssetImageProps {
  filename: string;
  alt: string;
  className?: string;
  "aria-hidden"?: boolean;
}

export function AssetImage({
  filename,
  alt,
  className,
  "aria-hidden": ariaHidden,
}: AssetImageProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await getAssetImageUrl(filename);
        if (!cancelled) setSrc(url);
      } catch {
        if (!cancelled) setSrc("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filename]);

  if (!src) {
    return <span className="muted" aria-hidden={ariaHidden} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
