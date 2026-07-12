import { strings } from "../lib/strings";

export function EmptyAssetsBanner() {
  return (
    <div className="panel" style={{ borderColor: "var(--primary)" }}>
      <strong>{strings.emptyAssets}</strong>
      <p className="muted">{strings.downloadHint}</p>
    </div>
  );
}
