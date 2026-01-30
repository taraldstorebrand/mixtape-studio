# TASKS.md

## Current Task

_No active task_

## Pending Tasks

_No pending tasks_

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies
- Minimal changes to existing architecture

---

## Completed

### Task 2: Refine ReadonlyView layout

**Status:** Completed

**Goal:** Improve spacing and discretion of copy button

**Changes:**

- Moved copy button inline with title (closer to the text)
- Made copy button smaller (14px icon) and more discreet (lower opacity, subtle hover)
- Added more spacing between title/genre and cover image
- ChatGPT prompt field now hidden when no prompt exists

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`
- `frontend/src/components/panels/DetailPanel.module.css`

---

### Task 1: Improve ReadonlyView header in DetailPanel

**Status:** Completed

**Goal:** Make the readonly view header more informative and visually refined

**Changes:**

- Replaced "Copy" button text with a discreet copy icon (SVG)
- Replaced "Selected song" heading with the actual song title
- Added genre display on the line below the title (when present)
- Removed separate title and genre fields from below (now in header)

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`
- `frontend/src/components/panels/DetailPanel.module.css`
