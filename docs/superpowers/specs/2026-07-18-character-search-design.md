# Design: Character Search (sidebar filter)

> Date: 2026-07-18  
> Status: Approved (product + engineering) — awaiting Patrick review of this file  
> Project: touhou-wallpaper  
> Audience: Patrick (non-programmer owner) + implementing agent

---

## 1. Problem

The character sidebar lists 100+ rows (`001 博丽灵梦`, …). Finding a character by scrolling is slow. Patrick wants **name search** that filters the list as he types, with clear behavior for favorites mode, prev/next, and random.

This feature also exercises the **business-code PR + Auto Review** path after PR #11.

Deferred (separate future design): multi-source images, scheduled crawl, cloud storage.

---

## 2. Goals and non-goals

### Goals

- Sidebar search box above the character list (Approach 1)
- Filter-as-you-type by **character name only** (substring / contains)
- Empty state with a clear message
- Search scopes to **current browse mode** (all characters vs favorites-only gallery)
- Clear via **×** or **Esc**; query **not** persisted across app restart
- While a query is active: **‹ ›** and **换一张** navigate only within the filtered set; show one hint line of copy
- Targeted prep refactor so nav does not grow a third copy-paste branch
- Same-branch **Vitest** coverage for pure filter/nav helpers; wiring checks as needed
- UI strings in `src/lib/strings.ts` (aligned with CONTENT.md)

### Non-goals

- Search by ID, pinyin, tags, or filename
- Fuzzy / typo-tolerant matching
- Ctrl+K command palette or top-bar global search
- Remembering query across restarts
- Auto-clear query on character select
- Multi-source assets / scheduled fetch / cloud
- Unrelated large refactors (REFACTOR_PLAN stages beyond what search needs)
- Rust / `set_wallpaper` changes

---

## 3. Product decisions (locked)

| # | Decision |
|---|----------|
| 1 | Match **name only** (not ID) |
| 2 | **Contains** match |
| 3 | Zero results → empty list + message |
| 4 | Search applies to **current mode** only |
| 5 | Clear: **×** and **Esc** |
| 6 | ‹ › / 换一张 stay in filtered set + **one hint line** |
| 7 | Do **not** persist query |
| Layout | Search box under sidebar title, above scrollable list |
| Mode switch | Toggling favorites-only **clears** the search query |

### Hint copy (when query non-empty)

「当前在搜索结果中浏览；清空搜索后恢复全部。」

### Other copy

| Key (conceptual) | Text |
|------------------|------|
| Placeholder | 搜索角色名 |
| Empty (all mode) | 没有匹配的角色 |
| Empty (favorites mode) | 没有匹配的收藏 |

Hard rule unchanged: only **应用** may call `set_wallpaper`. Search, ‹ ›, and 换一张 never apply wallpaper.

---

## 4. Architecture

### Approach

**Sidebar filter + shared “working set” navigation** (recommended Approach 1).

### Layers (follow existing layout)

| Layer | Responsibility |
|-------|----------------|
| `src/lib/` pure helpers | Filter by name; step/random over a working list (characters or favorite gallery items) |
| `src/types/` | Small types for search query / working-set items if not already covered |
| `src/lib/strings.ts` | All user-visible search strings |
| Hook (e.g. `useCharacterSearch` or equivalent boundary) | Query state, clear, derived filtered list, whether hint/empty show |
| `useWallpaperApp` | Consumes working set for `stepCharacter` / `randomCharacter`; clears query on favorites toggle |
| `CharacterSidebar` / favorites sidebar UI | Render input, ×, hint, empty message; no business rules inline |

### Targeted refactor (in-scope tech debt)

Today `stepCharacter` / `randomCharacter` branch on `favoritesOnly` inside `useWallpaperApp`. Search would force a third branch if left as-is.

**In scope:** extract “navigate within current working set” so the working set can be:

1. Full character list  
2. Favorites gallery  
3. Filtered subset of (1) or (2)

**Out of scope:** wholesale rewrite of `useWallpaperApp`, Zustand migration of all state, folder reshuffles from REFACTOR_PLAN.

### Data flow (conceptual)

```text
query + mode + source list
  → filterByName(...)
  → workingSet
  → sidebar renders workingSet
  → step / random operate on workingSet only
```

Empty working set with non-empty query: show empty copy; step/random no-op (or disabled).

---

## 5. Testing and ownership (process)

### Who writes tests (locked)

| Role | Duty |
|------|------|
| **Implementing Agent** | **Must** add Vitest (and verify script updates if needed) on the **same feature branch**; run until green |
| **CI Auto Review Agent** | Runs `tsc` + `vitest` and comments; does **not** author feature tests |
| **Patrick** | Manual UI smoke only; does not write automated tests |

Canonical short rule: root [AGENTS.md](../../../AGENTS.md).  
Human-oriented ladder: [docs/dev/VERIFY.md](../../dev/VERIFY.md).

### Feature test plan (mechanical)

Vitest (primary), pure `lib` helpers:

- Empty query → full list unchanged  
- Name contains match (e.g. 「灵」 matches 博丽灵梦)  
- ID-only query does **not** match by design  
- No matches → empty array  
- Favorites gallery filter by character name  
- `next` / `prev` / random stay inside a given working set  
- Random with size 1 stays on that item; size > 1 prefers a different item when possible (match existing random behavior)

Optional verify script / wiring checks: search strings present; sidebar exposes a stable `data-testid` for the search input.

### Manual smoke (Patrick)

1. Type in search → list shrinks  
2. × / Esc → list restores; hint disappears  
3. With query: ‹ › and 换一张 stay in results; hint visible  
4. Favorites-only: search filters favorites; toggling mode clears query  
5. 换一张 / ‹ › do not change desktop wallpaper  

### Done gate for the PR

- `npm test` green  
- `npm run check` → Assertion Passed  
- Product acceptance above  
- Open PR for Auto Review confidence round  

---

## 6. Implementation shape (for the later plan)

Enough scope for **one writing-plans plan** on one feature branch, roughly:

1. Process docs already updated (AGENTS / VERIFY) — this design session  
2. Pure `lib` filter + working-set nav + Vitest  
3. Wire search state + clear-on-mode-toggle  
4. Sidebar UI + strings + hint/empty  
5. Point step/random at working set  
6. Full gate + PR  

No separate “refactor-only” epic before search.

---

## 7. Out of scope / later

- Multi-source images, scheduled crawl, categorization, cloud or third-party hosting strategy  
- Search by ID / pinyin  
- Stage 2 Auto Review autofix  

---

## 8. Approval record

- Product UI/behavior: approved in brainstorming (2026-07-18)  
- Engineering (lib + hook boundary + tests + minimal refactor): approved  
- Test ownership doc placement: **A** — short in AGENTS.md, detail in VERIFY.md  
- Patrick to review **this file** before implementation plan  
