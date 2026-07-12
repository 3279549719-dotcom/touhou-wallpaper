import { strings } from "../lib/strings";

interface ActionBarProps {
  isFavorite: boolean;
  onApply: () => void;
  onToggleFavorite: () => void;
}

export function ActionBar({
  isFavorite,
  onApply,
  onToggleFavorite,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      <button type="button" className="primary" onClick={onApply}>
        {strings.btnApply}
      </button>
      <button type="button" onClick={onToggleFavorite}>
        {isFavorite ? strings.favoriteOn : strings.favoriteOff}
      </button>
      <span className="muted">{strings.scaffoldNote}</span>
    </div>
  );
}
