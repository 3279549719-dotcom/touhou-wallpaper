## Purpose

Independent favorites-gallery browsing mode (【只看收藏】): browse favorited images as a gallery, with scoped navigation and clear favorite/unfavorite labels.

## Requirements

### Requirement: Favorites-only mode toggle

The app SHALL provide a control labeled 【只看收藏】 that switches between normal character browsing and favorites-gallery browsing. The control SHALL default to off (normal browsing) on every application launch and MUST NOT persist the on/off state across restarts.

#### Scenario: Default is normal browsing on launch

- **WHEN** the user starts the application
- **THEN** 【只看收藏】 is off and the sidebar shows the full character list as in V1

#### Scenario: Enter favorites gallery when favorites exist

- **WHEN** the user has at least one favorited image and turns 【只看收藏】 on
- **THEN** the app enters favorites-gallery browsing

#### Scenario: Exit favorites gallery via toggle

- **WHEN** 【只看收藏】 is on and the user turns it off
- **THEN** the app returns to full character-list browsing with V1 navigation behavior

### Requirement: Block enter when favorites are empty

When there are zero favorited images, the app MUST NOT enter favorites-gallery mode. Activating 【只看收藏】 MUST show the message 「请至少收藏一张图片」 and leave the user in normal browsing.

#### Scenario: Click toggle with no favorites

- **WHEN** the user has no favorites and clicks 【只看收藏】
- **THEN** the app stays in normal browsing and shows 「请至少收藏一张图片」

### Requirement: Gallery list items are favorited images

In favorites-gallery mode, the sidebar SHALL list one row per favorited image (not one row per character). Rows SHALL be ordered by character ID ascending, then by variant index ascending within the same character. After the user favorites N distinct images (N ≥ 2), entering favorites-gallery mode SHALL show exactly N rows (all retained; the gallery MUST NOT collapse to only the last favorited image).

#### Scenario: Multiple favorites of same character appear as separate rows

- **WHEN** the user has favorited two variants of the same character and enters 【只看收藏】
- **THEN** the sidebar shows two separate rows for those images

#### Scenario: Multiple distinct favorites all appear

- **WHEN** the user favorites at least two different images in sequence and then turns 【只看收藏】 on
- **THEN** the sidebar shows one row for each favorited image (count equals the number of favorites)

#### Scenario: Stable ordering

- **WHEN** favorites-gallery mode is shown
- **THEN** rows appear sorted by character ID then variant index

### Requirement: Favorite and unfavorite button labels

While the current preview image is not favorited, the app SHALL show a control labeled 【收藏】. While the current preview image is favorited, the app SHALL show a control labeled 【取消收藏】 (not 「已收藏」). The unfavorite action SHALL be available only when the current image is already favorited.

#### Scenario: Label when not favorited

- **WHEN** the current preview image is not in favorites
- **THEN** the favorite control shows 【收藏】

#### Scenario: Label when favorited

- **WHEN** the current preview image is in favorites
- **THEN** the favorite control shows 【取消收藏】

#### Scenario: Unfavorite removes current image only

- **WHEN** the user clicks 【取消收藏】 on a favorited preview
- **THEN** that image is removed from favorites and other favorites remain

### Requirement: Preview shows only the selected favorite

In favorites-gallery mode, selecting a sidebar row SHALL preview that image only. The app MUST NOT show the full same-character variant thumbnail strip while in this mode.

#### Scenario: Select a favorite row

- **WHEN** the user selects a favorites-gallery row
- **THEN** the preview shows that image and no full-character variant strip is shown

#### Scenario: Apply and unfavorite target the selected image

- **WHEN** the user clicks 【应用】 or 【取消收藏】 while a gallery row is selected
- **THEN** the action applies only to the currently selected favorited image

### Requirement: Navigation stays within favorites

While 【只看收藏】 is on, previous/next character controls and 【换一张】 MUST operate only over the current favorites-gallery list (favorited images), not the full character set.

#### Scenario: Next/previous within favorites

- **WHEN** 【只看收藏】 is on and the user activates previous or next
- **THEN** selection moves to another favorited image in the gallery list

#### Scenario: Random within favorites

- **WHEN** 【只看收藏】 is on and the user clicks 【换一张】
- **THEN** the selection jumps to a favorited image from the current gallery list and the desktop wallpaper is unchanged until 【应用】

#### Scenario: Normal navigation restored when off

- **WHEN** 【只看收藏】 is off
- **THEN** previous/next and 【换一张】 behave as in V1 (character-scoped)

### Requirement: Auto-exit when last favorite is removed

If the user removes favorites while in favorites-gallery mode such that zero favorites remain, the app SHALL turn 【只看收藏】 off and return to normal character browsing.

#### Scenario: Unfavorite last image while in gallery

- **WHEN** 【只看收藏】 is on and the user clicks 【取消收藏】 on the last remaining favorited image
- **THEN** 【只看收藏】 turns off and the sidebar returns to the full character list

### Requirement: Wallpaper apply rule unchanged

Entering or using favorites-gallery mode MUST NOT change the desktop wallpaper except when the user explicitly clicks 【应用】.

#### Scenario: Browsing favorites does not set wallpaper

- **WHEN** the user navigates favorites-gallery rows or clicks 【换一张】 in this mode
- **THEN** the Windows desktop wallpaper remains unchanged until 【应用】 is clicked

### Requirement: Favorites accumulate across toggles

Toggling favorite on distinct images MUST accumulate in the favorites set (and in any non-Tauri development mock used for browsing). Returning only the latest filename as the entire favorites list is forbidden.

#### Scenario: Sequential favorites retain all

- **WHEN** the user favorites image A then favorites image B (A ≠ B)
- **THEN** the favorites set contains both A and B before and after entering 【只看收藏】
