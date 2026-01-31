# TASKS.md

## Current Task

Improve ReadonlyView in DetailPanel with duration badge and reorder sections.

## Goal

Display song duration as a small badge on the cover art (bottom-right corner, similar to Suno's style but proportionally smaller since our image is larger). Also reorder collapsible sections so Lyrics comes before ChatGPT prompt.

---

## Task 1: Add duration badge to cover art

**Status:** ✅ Complete

**Description:**
- Wrap cover image in a container with `position: relative`
- Add duration badge as overlay positioned bottom-right
- Format duration as `m:ss` (e.g., "3:24")
- Only show badge if `item.duration` exists and is > 0
- Style: semi-transparent dark background, white text, small font, rounded corners

**Files to modify:**
- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`
- `frontend/src/components/panels/DetailPanel.module.css`

---

## Task 2: Add duration formatting utility

**Status:** ✅ Complete

**Description:**
- Create `formatDuration(seconds: number): string` function
- Returns `m:ss` format (e.g., 204 → "3:24")
- Handle edge cases: 0, undefined, negative values
- Place in existing utils or create if needed

**Files to modify:**
- `frontend/src/utils/formatDuration.ts` (new)

---

## Task 3: Reorder collapsible sections (Lyrics before Prompt)

**Status:** ✅ Complete

**Description:**
- Move Lyrics CollapsibleSection before ChatGPT Prompt section
- No logic changes, just reorder JSX

**Files to modify:**
- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`

---

## Constraints

- Use CSS variables from `variables.css` for colors
- Follow AGENTS.md accessibility rules
- No new dependencies
