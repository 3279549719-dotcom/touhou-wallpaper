import { strings } from "../../lib/strings";

export interface CharacterSearchFieldProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  showHint: boolean;
  emptyMessage: string | null;
}

export function CharacterSearchField({
  query,
  onQueryChange,
  onClear,
  showHint,
  emptyMessage,
}: CharacterSearchFieldProps) {
  return (
    <div className="character-search">
      <div className="character-search-row">
        <input
          type="text"
          className="character-search-input"
          data-testid="character-search-input"
          placeholder={strings.searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClear();
            }
          }}
          aria-label={strings.searchPlaceholder}
        />
        {query.trim().length > 0 ? (
          <button
            type="button"
            className="character-search-clear"
            data-testid="character-search-clear"
            onClick={onClear}
            aria-label={strings.searchClearAria}
          >
            ×
          </button>
        ) : null}
      </div>
      {showHint ? (
        <p className="character-search-hint" role="status">
          {strings.searchActiveHint}
        </p>
      ) : null}
      {emptyMessage ? (
        <p className="character-search-empty" role="status">
          {emptyMessage}
        </p>
      ) : null}
    </div>
  );
}
