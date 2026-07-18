import { useCallback, useMemo, useState } from "react";

export function useCharacterSearch() {
  const [query, setQuery] = useState("");

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const isSearching = useMemo(() => query.trim().length > 0, [query]);

  return { query, setQuery, clearSearch, isSearching };
}
