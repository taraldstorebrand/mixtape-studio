# TASKS.md

## Current Task

No active task

## Pending Tasks

### Task 1: Reduce visual dominance of list titles

**Goal:** Lower brightness/contrast of song titles in the list slightly. Keep main app and details titles brighter than list items for better visual hierarchy.

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css` - Adjust title color to be less dominant

**Details:**

- Reduce brightness of song titles in the history list
- Use a dimmer CSS variable (e.g., `var(--color-text-soft)` instead of `var(--color-text)`)
- Do NOT change the main app title or selected song title in DetailPanel
- Maintain readability while reducing visual weight

---

### Task 2: Improve text hierarchy for section headers

**Goal:** Reduce font-size of "Songs (N)" header slightly (≈10–15%) to make it feel like a section label rather than a primary title.

**Files:**

- `frontend/src/components/history/HistoryPanel.module.css` - Adjust header font-size and styling

**Details:**

- Reduce font-size by approximately 10-15%
- Ensure it still feels like a header but less dominant
- Should look like a section label, not a primary title
- Maintain existing spacing and layout

---

### Task 3: Tone down metadata text

**Goal:** Use slightly dimmer color for date, duration and secondary info to ensure titles remain the primary visual focus.

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css` - Adjust metadata color

**Details:**

- Make date and duration text more subtle
- Use a dimmer CSS variable (e.g., `var(--color-text-subtle)` or `var(--color-text-dim)`)
- Ensure metadata doesn't compete with song titles for attention
- Maintain readability

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies
- Minimal changes to existing architecture
- Do NOT change layout or structure - only adjust colors and font sizes
- Do NOT change main app title or selected song title styling in DetailPanel
- Always use CSS variables from `frontend/src/styles/variables.css`

---

## Goal

Clearer visual hierarchy without changing layout or structure.

---

## Completed

All previous tasks from the artist/album/genre implementation have been completed and archived.
