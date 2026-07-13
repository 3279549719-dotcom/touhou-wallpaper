## 1. Copy and product docs

- [x] 1.1 Add CONTENT.md strings for 【只看收藏】 toggle and 「请至少收藏一张图片」 empty-block message
- [x] 1.3 Add CONTENT.md + strings for 【取消收藏】 (replace button use of 「已收藏」)
- [x] 1.2 Update PRD.md P1 / acceptance mapping to match favorites-gallery decisions (mode C, empty block, scoped nav, auto-exit, default off)
- [x] 1.4 Update PRD acceptance row for multi-favorite gallery count + 【取消收藏】 label

## 2. Favorites gallery mode (UI + state)

- [x] 2.1 Add session-only 【只看收藏】 on/off state (default off; not persisted)
- [x] 2.2 When favorites count is 0, clicking the toggle stays in normal mode and shows 「请至少收藏一张图片」
- [x] 2.3 When on and favorites exist, sidebar lists one row per favorited image, ordered by character ID then variant index
- [x] 2.4 Selecting a gallery row previews that image only; hide full-character variant strip in this mode
- [x] 2.5 Turning the toggle off restores V1 character list + variant strip behavior

## 3. Navigation and actions in gallery mode

- [x] 3.1 Previous/next move only among current favorites-gallery rows while mode is on
- [x] 3.2 【换一张】 jumps only among current favorites while mode is on (does not set wallpaper)
- [x] 3.3 【应用】 and favorite/unfavorite still target the currently selected image only
- [x] 3.4 Unfavoriting the last remaining favorite while mode is on auto-exits to normal browsing

## 5. Fixes from user feedback (re-open)

- [x] 5.1 Fix favorites accumulation so sequential favorites of distinct images all remain (Tauri + any Vite/browser mock); gallery row count must equal favorites count
- [x] 5.2 ActionBar: show 【收藏】 when not favorited; show 【取消收藏】 when favorited (do not use 「已收藏」 as the button label)
- [x] 5.3 Strengthen verify script: assert multi-favorite accumulate (≥2), gallery build length ≥2, and 【取消收藏】 string wiring; keep static checks as helpers only
- [x] 5.4 Run `npm run check:favorites-gallery` until Assertion Passed; update PROGRESS.md; do not claim done without multi-favorite coverage

## 4. Verify (initial pass — insufficient alone)

- [x] 4.1 Add or extend verify script covering: empty block, enter with favorites, scoped random/prev-next, auto-exit on last unfavorite, launch defaults off, apply-only wallpaper rule
- [x] 4.2 Run `npm run check` (or module verify) until Assertion Passed; update PROGRESS.md
