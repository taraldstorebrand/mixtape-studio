# TASKS.md

## Current Task

No active task

## Pending Tasks

### Task 1: Fix optical alignment of play icon in song list

**Goal:** Adjust the play triangle icon in the song list overlay button so it appears visually centered. The triangle currently looks left-heavy and needs to be shifted slightly to the right.

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css` - Adjust `.playButtonOverlay` to optically center the play icon

**Details:**

- Add a small horizontal offset to the play icon using CSS (e.g., `padding-left` or transform adjustment)
- Only apply the offset when the button shows the play icon (▶), not the pause icon (⏸)
- Keep button size and click area unchanged
- Maintain existing hover and focus states
- Use minimal CSS changes for optical centering

---

### Task 2: Fix optical alignment of play icon in NowPlayingBar

**Goal:** Adjust the play triangle icon in the NowPlayingBar control button so it appears visually centered, matching the fix applied to the song list.

**Files:**

- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css` - Adjust `.playButton` to optically center the play icon

**Details:**

- Add a small horizontal offset to the play icon using CSS
- Only apply the offset when the button shows the play icon (▶), not the pause icon (⏸)
- Keep button size and click area unchanged
- Maintain existing hover, focus, and aria-pressed states
- Match the optical centering approach used in the song list

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies
- Minimal changes to existing architecture
- Do NOT change button size or click area
- Do NOT adjust pause icon alignment
- Only use CSS for icon positioning
- Always use CSS variables from `frontend/src/styles/variables.css`

---

## Goal

Improve visual centering of play triangle icon without changing button functionality or layout.

---

## Completed

All previous tasks have been completed and archived.
