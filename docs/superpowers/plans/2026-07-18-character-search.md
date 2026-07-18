# Character Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sidebar character-name search (filter-as-you-type) with filtered-set navigation for ‹ › / 换一张, plus a small working-set refactor and Vitest coverage on the same feature branch.

**Architecture:** Pure helpers in `src/lib/search.ts` filter lists and navigate a “working set”. A thin `useCharacterSearch` hook owns the query string. Both sidebars share a `CharacterSearchField` UI. `useWallpaperApp` builds the filtered working set and routes `stepCharacter` / `randomCharacter` through shared nav helpers (no third copy-paste branch).

**Tech Stack:** React 19, TypeScript, Vitest, existing Zustand favorites UI flags, Tauri app unchanged for wallpaper I/O.

**Spec:** [docs/superpowers/specs/2026-07-18-character-search-design.md](../specs/2026-07-18-character-search-design.md)

## Global Constraints

- Code and comments: English only; UI strings from `docs/spec/CONTENT.md` + `src/lib/strings.ts`
- Only **Apply** may call `set_wallpaper`; search / ‹ › / 换一张 must not
- Match **character name only** (contains); do **not** match ID
- Search query is session-only (not persisted); clear on favorites-only toggle
- Implementing Agent writes Vitest (+ verify script) on the **same branch**; run `npm test` and `npm run check` before done
- No Rust changes; no multi-source / crawl work
- Prefer minimal diffs; do not run unrelated REFACTOR_PLAN stages

---

## File structure (locked)

| Path | Role |
|------|------|
| `src/lib/search.ts` | **Create** — `filterCharactersByName`, `filterFavoritesByCharacterName`, `stepInList`, `pickRandomPreferDifferent` |
| `src/__tests__/search.test.ts` | **Create** — Vitest for all search/nav helpers |
| `src/hooks/useCharacterSearch.ts` | **Create** — query / setQuery / clearSearch / isSearching |
| `src/components/sidebars/CharacterSearchField.tsx` | **Create** — input, ×, Esc, hint, empty message |
| `src/components/sidebars/CharacterSidebar.tsx` | **Modify** — mount search field; render filtered `characters` prop as today |
| `src/components/sidebars/FavoritesGallerySidebar.tsx` | **Modify** — same search field; render filtered `items` |
| `src/hooks/useWallpaperApp.ts` | **Modify** — integrate search; clear on mode toggle; step/random via helpers |
| `src/App.tsx` | **Modify** — pass search props; position text uses working-set size |
| `src/lib/strings.ts` | **Modify** — search copy keys |
| `docs/spec/CONTENT.md` | **Modify** — same copy keys |
| `src/styles/theme.css` | **Modify** — search field styles (blue-white, minimal) |
| `scripts/verify/verify_character_search.py` | **Create** — wiring/copy checks |
| `package.json` | **Modify** — `verify:character-search` / `check:character-search` |
| `docs/dev/PROGRESS.md` | **Modify** — mark search [~]/[x] as tasks finish |
| `docs/spec/PRD.md` | **Modify** — mark P1 search row or acceptance note when feature lands |

---

### Task 0: Feature branch

**Files:**
- None (git only)

**Interfaces:**
- Consumes: clean git state; prefer `master` after PR #11 merge if available
- Produces: branch `feature/character-search`

- [ ] **Step 1: Create branch from up-to-date base**

```bash
git fetch origin
git checkout master
git pull origin master
git checkout -b feature/character-search
```

If PR #11 is not merged yet and search docs live only on `ci/auto-review-mvp`, cherry-pick or merge those doc commits into this branch first so AGENTS/VERIFY/test-ownership rules are present:

```bash
git cherry-pick 29561e9 5509a28
```

(Use actual hashes from `git log` if they differ.)

- [ ] **Step 2: Confirm clean starting point**

```bash
git status -sb
npm test
npm run check
```

Expected: tests green; `Assertion Passed` from verify_m0.

---

### Task 1: Pure filter helpers + Vitest (TDD)

**Files:**
- Create: `src/lib/search.ts`
- Create: `src/__tests__/search.test.ts`
- Test: `src/__tests__/search.test.ts`

**Interfaces:**
- Consumes: `Character` from `src/types/manifest.ts`; `FavoriteGalleryItem` from `src/lib/grid.ts`
- Produces:
  - `filterCharactersByName(characters: Character[], query: string): Character[]`
  - `filterFavoritesByCharacterName(items: FavoriteGalleryItem[], query: string): FavoriteGalleryItem[]`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/search.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  filterCharactersByName,
  filterFavoritesByCharacterName,
} from "../lib/search";
import type { Character } from "../types/manifest";
import type { FavoriteGalleryItem } from "../lib/grid";

const characters: Character[] = [
  { id: "001", name: "博丽灵梦", variants: 1, files: ["001_00.png"] },
  { id: "002", name: "雾雨魔理沙", variants: 1, files: ["002_00.png"] },
  { id: "003", name: "雷欧娜", variants: 1, files: ["003_00.png"] },
];

const gallery: FavoriteGalleryItem[] = [
  {
    filename: "001_00.png",
    characterId: "001",
    characterName: "博丽灵梦",
    variantIndex: 0,
  },
  {
    filename: "002_00.png",
    characterId: "002",
    characterName: "雾雨魔理沙",
    variantIndex: 0,
  },
];

describe("filterCharactersByName", () => {
  it("empty query returns full list", () => {
    expect(filterCharactersByName(characters, "")).toEqual(characters);
    expect(filterCharactersByName(characters, "   ")).toEqual(characters);
  });

  it("matches substring in name", () => {
    const result = filterCharactersByName(characters, "灵");
    expect(result.map((c) => c.id)).toEqual(["001"]);
  });

  it("does not match by id alone", () => {
    expect(filterCharactersByName(characters, "001")).toEqual([]);
  });

  it("returns empty when nothing matches", () => {
    expect(filterCharactersByName(characters, "不存在")).toEqual([]);
  });
});

describe("filterFavoritesByCharacterName", () => {
  it("filters by characterName contains", () => {
    const result = filterFavoritesByCharacterName(gallery, "魔理沙");
    expect(result.map((g) => g.filename)).toEqual(["002_00.png"]);
  });

  it("empty query returns all favorites items", () => {
    expect(filterFavoritesByCharacterName(gallery, "")).toEqual(gallery);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- src/__tests__/search.test.ts
```

Expected: FAIL (module `../lib/search` not found).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/search.ts`:

```typescript
import type { Character } from "../types/manifest";
import type { FavoriteGalleryItem } from "./grid";

function normalizedQuery(query: string): string {
  return query.trim();
}

/** Filter characters by name substring. Empty/whitespace query → unchanged list. Does not match id. */
export function filterCharactersByName(
  characters: Character[],
  query: string,
): Character[] {
  const q = normalizedQuery(query);
  if (!q) return characters;
  return characters.filter((c) => c.name.includes(q));
}

/** Filter favorite gallery rows by characterName substring. */
export function filterFavoritesByCharacterName(
  items: FavoriteGalleryItem[],
  query: string,
): FavoriteGalleryItem[] {
  const q = normalizedQuery(query);
  if (!q) return items;
  return items.filter((item) => item.characterName.includes(q));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/__tests__/search.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/search.ts src/__tests__/search.test.ts
git commit -m "feat(search): add name filter helpers with tests"
```

---

### Task 2: Working-set nav helpers + Vitest (TDD)

**Files:**
- Modify: `src/lib/search.ts`
- Modify: `src/__tests__/search.test.ts`

**Interfaces:**
- Consumes: `nextCharacterIndex` from `src/lib/grid.ts`
- Produces:
  - `stepInList<T>(items: T[], currentIndex: number, delta: number): T | null`
  - `pickRandomPreferDifferent<T>(items: T[], isCurrent: (item: T) => boolean, random?: () => number): T | null`

- [ ] **Step 1: Append failing tests** to `src/__tests__/search.test.ts`:

```typescript
import { stepInList, pickRandomPreferDifferent } from "../lib/search";

describe("stepInList", () => {
  const items = ["a", "b", "c"];

  it("steps forward and wraps", () => {
    expect(stepInList(items, 0, 1)).toBe("b");
    expect(stepInList(items, 2, 1)).toBe("a");
  });

  it("steps backward and wraps", () => {
    expect(stepInList(items, 0, -1)).toBe("c");
  });

  it("returns null for empty list", () => {
    expect(stepInList([], 0, 1)).toBeNull();
  });

  it("treats negative currentIndex as 0", () => {
    expect(stepInList(items, -1, 1)).toBe("b");
  });
});

describe("pickRandomPreferDifferent", () => {
  it("returns null for empty list", () => {
    expect(pickRandomPreferDifferent([], () => false)).toBeNull();
  });

  it("returns the only item when size is 1", () => {
    expect(pickRandomPreferDifferent(["only"], () => true)).toBe("only");
  });

  it("prefers a different item when possible", () => {
    const items = ["a", "b"];
    // Always return 0 first, then 0.9 → index 1
    let calls = 0;
    const random = () => {
      calls += 1;
      return calls === 1 ? 0 : 0.9;
    };
    const pick = pickRandomPreferDifferent(items, (x) => x === "a", random);
    expect(pick).toBe("b");
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/__tests__/search.test.ts
```

Expected: FAIL on missing exports.

- [ ] **Step 3: Implement helpers** in `src/lib/search.ts` (append):

```typescript
import { nextCharacterIndex } from "./grid";

export function stepInList<T>(
  items: T[],
  currentIndex: number,
  delta: number,
): T | null {
  if (items.length === 0) return null;
  const idx = currentIndex < 0 ? 0 : currentIndex;
  const next = nextCharacterIndex(idx, delta, items.length);
  return items[next] ?? null;
}

export function pickRandomPreferDifferent<T>(
  items: T[],
  isCurrent: (item: T) => boolean,
  random: () => number = Math.random,
): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  let pick = items[Math.floor(random() * items.length)]!;
  let attempts = 0;
  while (isCurrent(pick) && attempts < 8) {
    pick = items[Math.floor(random() * items.length)]!;
    attempts += 1;
  }
  return pick;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/__tests__/search.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/search.ts src/__tests__/search.test.ts
git commit -m "feat(search): add working-set step and random helpers"
```

---

### Task 3: Copy + CONTENT + strings

**Files:**
- Modify: `docs/spec/CONTENT.md`
- Modify: `src/lib/strings.ts`
- Test: assert via later verify script; optional quick grep

**Interfaces:**
- Produces string keys on `strings`:
  - `searchPlaceholder: "搜索角色名"`
  - `searchEmptyCharacters: "没有匹配的角色"`
  - `searchEmptyFavorites: "没有匹配的收藏"`
  - `searchActiveHint: "当前在搜索结果中浏览；清空搜索后恢复全部。"`

- [ ] **Step 1: Update CONTENT.md** — add rows under UI strings table:

```markdown
| search_placeholder | 搜索角色名 |
| search_empty_characters | 没有匹配的角色 |
| search_empty_favorites | 没有匹配的收藏 |
| search_active_hint | 当前在搜索结果中浏览；清空搜索后恢复全部。 |
```

- [ ] **Step 2: Update `src/lib/strings.ts`** — add matching fields next to other sidebar strings:

```typescript
  searchPlaceholder: "搜索角色名",
  searchEmptyCharacters: "没有匹配的角色",
  searchEmptyFavorites: "没有匹配的收藏",
  searchActiveHint: "当前在搜索结果中浏览；清空搜索后恢复全部。",
```

- [ ] **Step 3: Commit**

```bash
git add docs/spec/CONTENT.md src/lib/strings.ts
git commit -m "docs(content): add character search UI strings"
```

---

### Task 4: `useCharacterSearch` hook

**Files:**
- Create: `src/hooks/useCharacterSearch.ts`
- Create: `src/__tests__/useCharacterSearch.test.ts` (optional but preferred — lightweight)

**Interfaces:**
- Produces:
  - `useCharacterSearch(): { query: string; setQuery: (q: string) => void; clearSearch: () => void; isSearching: boolean }`
  - `isSearching` === `query.trim().length > 0`

- [ ] **Step 1: Write hook**

Create `src/hooks/useCharacterSearch.ts`:

```typescript
import { useCallback, useMemo, useState } from "react";

export function useCharacterSearch() {
  const [query, setQuery] = useState("");

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const isSearching = useMemo(() => query.trim().length > 0, [query]);

  return { query, setQuery, clearSearch, isSearching };
}
```

- [ ] **Step 2: Optional Vitest** — if adding `src/__tests__/useCharacterSearch.test.ts`, use `@testing-library/react` `renderHook` only if already easy in repo; otherwise skip UI-hook test and rely on lib tests + verify wiring. **Do not** add new dependencies for this.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCharacterSearch.ts
git commit -m "feat(search): add useCharacterSearch hook"
```

---

### Task 5: `CharacterSearchField` UI + CSS

**Files:**
- Create: `src/components/sidebars/CharacterSearchField.tsx`
- Modify: `src/styles/theme.css`

**Interfaces:**
- Consumes: `strings` from `src/lib/strings.ts`
- Produces component props:

```typescript
export interface CharacterSearchFieldProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  showHint: boolean;
  emptyMessage: string | null;
}
```

- [ ] **Step 1: Implement component**

```tsx
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
          type="search"
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
        {query.length > 0 ? (
          <button
            type="button"
            className="character-search-clear"
            data-testid="character-search-clear"
            onClick={onClear}
            aria-label="Clear search"
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
```

- [ ] **Step 2: Add CSS** after `.favorites-only-hint` in `src/styles/theme.css`:

```css
.character-search {
  margin-top: 10px;
}

.character-search-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.character-search-input {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
}

.character-search-input:focus {
  outline: 2px solid var(--grid-selected);
  outline-offset: 1px;
}

.character-search-clear {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  font-size: 1.1rem;
}

.character-search-hint,
.character-search-empty {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebars/CharacterSearchField.tsx src/styles/theme.css
git commit -m "feat(search): add CharacterSearchField UI"
```

---

### Task 6: Mount search in both sidebars

**Files:**
- Modify: `src/components/sidebars/CharacterSidebar.tsx`
- Modify: `src/components/sidebars/FavoritesGallerySidebar.tsx`

**Interfaces:**
- Consumes: `CharacterSearchField`
- Produces: both sidebars accept:

```typescript
searchQuery: string;
onSearchQueryChange: (value: string) => void;
onClearSearch: () => void;
searchShowHint: boolean;
searchEmptyMessage: string | null;
```

Parent still passes **already-filtered** `characters` / `items`. Sidebars do not filter.

- [ ] **Step 1: Update `CharacterSidebar.tsx`**

Add props and render `CharacterSearchField` inside the header **after** the favorites-only toggle / hint, **before** closing `character-sidebar-header` (so the scroll list stays below). Keep list mapping unchanged.

```tsx
import { CharacterSearchField } from "./CharacterSearchField";

// extend props:
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClearSearch: () => void;
  searchShowHint: boolean;
  searchEmptyMessage: string | null;

// inside header, after favoritesOnlyHint block:
      <CharacterSearchField
        query={searchQuery}
        onQueryChange={onSearchQueryChange}
        onClear={onClearSearch}
        showHint={searchShowHint}
        emptyMessage={searchEmptyMessage}
      />
```

- [ ] **Step 2: Update `FavoritesGallerySidebar.tsx`** the same way (same prop names, same field placement).

- [ ] **Step 3: Commit** (may not typecheck until Task 7 wires App — if `tsc` fails, continue immediately to Task 7 in the same sitting, then commit Tasks 6+7 together). Prefer landing Task 7 next without a broken HEAD commit.

---

### Task 7: Wire `useWallpaperApp` + `App.tsx`

**Files:**
- Modify: `src/hooks/useWallpaperApp.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useCharacterSearch`, `filterCharactersByName`, `filterFavoritesByCharacterName`, `stepInList`, `pickRandomPreferDifferent`, `buildFavoritesGallery`
- Produces from hook (add to return):
  - `searchQuery`, `setSearchQuery`, `clearSearch`, `isSearching`
  - `visibleCharacters: Character[]`
  - `visibleFavoritesGallery: FavoriteGalleryItem[]`
  - `searchEmptyMessage: string | null`
  - existing `stepCharacter` / `randomCharacter` operate on visible working set

**Behavior rules to implement:**

1. `clearSearch()` whenever favorites-only mode successfully toggles on or off (including auto-exit when favorites become empty). Also clear when empty-block attempt leaves mode unchanged? **Clear whenever `toggleFavoritesOnly` runs and actually changes `favoritesOnly`, and also when entering is blocked** — simplest rule from spec: clear on toggle interaction that changes mode; also call `clearSearch()` at start of `toggleFavoritesOnly` always so switching intent resets search.
2. `visibleCharacters = filterCharactersByName(manifest.characters, query)` when not favorites-only (App uses this for sidebar).
3. `visibleFavoritesGallery = filterFavoritesByCharacterName(favoritesGallery, query)` when favorites-only.
4. `searchShowHint = isSearching`
5. `searchEmptyMessage`: if `isSearching` and visible list length 0 → mode-specific empty string; else `null`
6. `stepCharacter`: build working list = visible characters or visible gallery; find current index; `stepInList`; apply selection (character → `selectCharacter(id)`; gallery item → set id+variant).
7. `randomCharacter`: `pickRandomPreferDifferent` on the same working list.
8. Empty working set → no-op for step/random.
9. `App.tsx` positionText uses visible list length and index within visible list.

- [ ] **Step 1: Integrate search state into `useWallpaperApp`**

Near top of hook body:

```typescript
import { useCharacterSearch } from "./useCharacterSearch";
import {
  filterCharactersByName,
  filterFavoritesByCharacterName,
  stepInList,
  pickRandomPreferDifferent,
} from "../lib/search";

// inside useWallpaperApp:
  const { query: searchQuery, setQuery: setSearchQuery, clearSearch, isSearching } =
    useCharacterSearch();
```

At start of `toggleFavoritesOnly`:

```typescript
  clearSearch();
```

Add memos:

```typescript
  const visibleCharacters = useMemo(() => {
    if (!manifest) return [];
    return filterCharactersByName(manifest.characters, searchQuery);
  }, [manifest, searchQuery]);

  const visibleFavoritesGallery = useMemo(() => {
    return filterFavoritesByCharacterName(favoritesGallery, searchQuery);
  }, [favoritesGallery, searchQuery]);

  const searchEmptyMessage = useMemo(() => {
    if (!isSearching) return null;
    if (favoritesOnly) {
      return visibleFavoritesGallery.length === 0
        ? strings.searchEmptyFavorites
        : null;
    }
    return visibleCharacters.length === 0
      ? strings.searchEmptyCharacters
      : null;
  }, [
    isSearching,
    favoritesOnly,
    visibleFavoritesGallery.length,
    visibleCharacters.length,
  ]);
```

Replace `stepCharacter` body with working-set version:

```typescript
  const stepCharacter = useCallback(
    (delta: number) => {
      if (!manifest) return;

      if (favoritesOnly) {
        const list = visibleFavoritesGallery;
        if (list.length === 0) return;
        const current = getActiveFilename(
          activeCharacterId,
          activeVariantIndex,
          manifest,
        );
        const idx = list.findIndex((g) => g.filename === current);
        const pick = stepInList(list, idx < 0 ? 0 : idx, delta);
        if (!pick) return;
        setActiveCharacterId(pick.characterId);
        setActiveVariantIndex(pick.variantIndex);
        return;
      }

      const list = visibleCharacters;
      if (list.length === 0) return;
      const idx = list.findIndex((c) => c.id === activeCharacterId);
      const pick = stepInList(list, idx < 0 ? 0 : idx, delta);
      if (!pick) return;
      selectCharacter(pick.id);
    },
    [
      manifest,
      favoritesOnly,
      visibleFavoritesGallery,
      visibleCharacters,
      activeCharacterId,
      activeVariantIndex,
      selectCharacter,
    ],
  );
```

Replace `randomCharacter` body:

```typescript
  const randomCharacter = useCallback(() => {
    if (!manifest) return;

    if (favoritesOnly) {
      const list = visibleFavoritesGallery;
      const current = getActiveFilename(
        activeCharacterId,
        activeVariantIndex,
        manifest,
      );
      const pick = pickRandomPreferDifferent(
        list,
        (item) => item.filename === current,
      );
      if (!pick) return;
      setActiveCharacterId(pick.characterId);
      setActiveVariantIndex(pick.variantIndex);
      return;
    }

    const list = visibleCharacters;
    const pick = pickRandomPreferDifferent(
      list,
      (item) => item.id === activeCharacterId,
    );
    if (!pick) return;
    selectCharacter(pick.id);
  }, [
    manifest,
    favoritesOnly,
    visibleFavoritesGallery,
    visibleCharacters,
    activeCharacterId,
    activeVariantIndex,
    selectCharacter,
  ]);
```

Return new fields:

```typescript
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearching,
    visibleCharacters,
    visibleFavoritesGallery,
    searchEmptyMessage,
```

Ensure `toggleFavoritesOnly` dependency array includes `clearSearch`.

- [ ] **Step 2: Update `App.tsx`**

Use visible lists for sidebar + position:

```tsx
  const characters = app.visibleCharacters;
  const gallery = app.visibleFavoritesGallery;
  const allCharacters = app.manifest?.characters ?? [];
  const assetsReady = allCharacters.length >= 126;

  // activeIndex / total already based on characters/gallery — keep, but source from visible lists above

  // CharacterSidebar / FavoritesGallerySidebar: add
        searchQuery={app.searchQuery}
        onSearchQueryChange={app.setSearchQuery}
        onClearSearch={app.clearSearch}
        searchShowHint={app.isSearching}
        searchEmptyMessage={app.searchEmptyMessage}
```

Pass `characters={app.visibleCharacters}` and `items={app.visibleFavoritesGallery}`.

Keep using `app.manifest` only for assetsReady count from full list.

- [ ] **Step 3: Typecheck and unit tests**

```bash
npm test
npx tsc -b --noEmit
```

Expected: PASS / no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useWallpaperApp.ts src/App.tsx src/components/sidebars/CharacterSidebar.tsx src/components/sidebars/FavoritesGallerySidebar.tsx
git commit -m "feat(search): wire sidebar search and working-set navigation"
```

---

### Task 8: Verify script + package.json

**Files:**
- Create: `scripts/verify/verify_character_search.py`
- Modify: `package.json`

**Interfaces:**
- Produces npm scripts:
  - `verify:character-search`
  - `check:character-search` → `tsc -b --noEmit && python scripts/verify/verify_character_search.py`

- [ ] **Step 1: Write verify script**

Create `scripts/verify/verify_character_search.py`:

```python
#!/usr/bin/env python3
"""Character search (sidebar name filter) verification."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT = ROOT / "docs/spec/CONTENT.md"
STRINGS = ROOT / "src/lib/strings.ts"
SEARCH_LIB = ROOT / "src/lib/search.ts"
SEARCH_TEST = ROOT / "src/__tests__/search.test.ts"
HOOK_SEARCH = ROOT / "src/hooks/useCharacterSearch.ts"
HOOK_APP = ROOT / "src/hooks/useWallpaperApp.ts"
FIELD = ROOT / "src/components/sidebars/CharacterSearchField.tsx"
SIDEBAR = ROOT / "src/components/sidebars/CharacterSidebar.tsx"
GALLERY = ROOT / "src/components/sidebars/FavoritesGallerySidebar.tsx"
APP = ROOT / "src/App.tsx"


def read(path: Path) -> str:
    assert path.is_file(), f"Missing {path}"
    return path.read_text(encoding="utf-8")


def main() -> int:
    content = read(CONTENT)
    strings = read(STRINGS)
    for key, text in [
        ("search_placeholder", "搜索角色名"),
        ("search_empty_characters", "没有匹配的角色"),
        ("search_empty_favorites", "没有匹配的收藏"),
        ("search_active_hint", "当前在搜索结果中浏览；清空搜索后恢复全部。"),
    ]:
        assert key in content and text in content, f"CONTENT missing {key}"
        assert text in strings, f"strings.ts missing {text}"

    search_lib = read(SEARCH_LIB)
    assert "filterCharactersByName" in search_lib
    assert "filterFavoritesByCharacterName" in search_lib
    assert "stepInList" in search_lib
    assert "pickRandomPreferDifferent" in search_lib
    assert "c.id.includes" not in search_lib  # must not match by id

    assert read(SEARCH_TEST)
    assert "useCharacterSearch" in read(HOOK_SEARCH)

    app_hook = read(HOOK_APP)
    assert "clearSearch" in app_hook
    assert "visibleCharacters" in app_hook or "filterCharactersByName" in app_hook
    assert "setWallpaper" not in read(FIELD)

    field = read(FIELD)
    assert 'data-testid="character-search-input"' in field
    assert "searchActiveHint" in field or "searchPlaceholder" in field

    assert "CharacterSearchField" in read(SIDEBAR)
    assert "CharacterSearchField" in read(GALLERY)
    assert "searchQuery" in read(APP)

    print("character-search verify: copy + wiring OK")
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"Assertion Failed: {e}", file=sys.stderr)
        raise SystemExit(1)
```

- [ ] **Step 2: Add scripts to `package.json`** next to other verify scripts:

```json
    "check:character-search": "tsc -b --noEmit && python scripts/verify/verify_character_search.py",
    "verify:character-search": "python scripts/verify/verify_character_search.py",
```

- [ ] **Step 3: Run verify**

```bash
npm run check:character-search
npm test
npm run check
```

Expected: all green; `Assertion Passed`.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify/verify_character_search.py package.json
git commit -m "test(search): add character-search verify script"
```

---

### Task 9: Docs pulse + PRD note + manual smoke checklist

**Files:**
- Modify: `docs/dev/PROGRESS.md`
- Modify: `docs/spec/PRD.md` (P1 search line / acceptance mapping)
- Modify: `docs/superpowers/specs/2026-07-18-character-search-design.md` status → Implemented (optional)

- [ ] **Step 1: Update PROGRESS** — stage `Character search · implemented`; module row `[x]` after gates pass; Next = open PR / Merge.

- [ ] **Step 2: PRD** — under P1, note search delivered; or add acceptance row checked `[~]`/`[x]` for name search.

- [ ] **Step 3: Manual smoke (Patrick or agent with `npm run tauri:dev`)**

1. Type 「灵」→ list shrinks; hint visible  
2. × and Esc clear; hint gone  
3. With query, ‹ › / 换一张 stay in results  
4. Favorites-only search works; toggling mode clears query  
5. Confirm desktop wallpaper unchanged until 应用  

- [ ] **Step 4: Commit docs**

```bash
git add docs/dev/PROGRESS.md docs/spec/PRD.md docs/superpowers/specs/2026-07-18-character-search-design.md
git commit -m "docs: mark character search complete in PROGRESS/PRD"
```

- [ ] **Step 5: Push and open PR** (when Patrick asks)

```bash
git push -u origin HEAD
gh pr create --title "feat: character name search in sidebar" --body "$(cat <<'EOF'
## Summary
- Sidebar filter-as-you-type by character name
- ‹ › / random navigate within filtered working set
- Vitest + verify_character_search.py

## Test plan
- [ ] npm test
- [ ] npm run check:character-search
- [ ] Manual smoke checklist in plan Task 9
EOF
)"
```

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| Sidebar search box, filter as you type | 5, 6, 7 |
| Name only / contains | 1 |
| Empty message | 3, 5, 7 |
| Current mode only | 7 |
| × / Esc clear; not persisted | 4, 5, 7 |
| Hint line + nav in filtered set | 2, 5, 7 |
| Clear on favorites toggle | 7 |
| Targeted working-set refactor | 2, 7 |
| Vitest same branch | 1, 2 |
| strings + CONTENT | 3 |
| verify wiring | 8 |
| No set_wallpaper from search | 5 (field), 7 (nav only selection) |
| Manual smoke + PR | 9 |

## Placeholder scan

No TBD steps; function names consistent (`filterCharactersByName`, `stepInList`, `pickRandomPreferDifferent`, `useCharacterSearch`, `CharacterSearchField`).

## Type consistency

- `FavoriteGalleryItem` from `grid.ts` used in filter + gallery sidebar  
- Hook returns `visibleCharacters` / `visibleFavoritesGallery` consumed by `App.tsx`  
- String keys aligned across CONTENT / strings / verify script  
