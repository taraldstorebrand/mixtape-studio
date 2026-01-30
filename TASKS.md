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
- Reuse existing patterns from HistoryItem where possible

---

## Completed

### Task 1: Standard previous button behavior
**Status:** Completed

**Changes:**
- Modified `handlePrevious` in NowPlayingBar.tsx
- If `currentTime > 3`: seeks to 0 (restarts song)
- If `currentTime ≤ 3`: goes to previous track

---

### Task 2: Add like/dislike buttons to NowPlayingBar
**Status:** Completed

**Changes:**
- Added `useHistoryAtom` import for `handleFeedback`
- Added thumbs up/down buttons after VolumeControl
- Added `.feedbackButtons`, `.thumbButton`, `.thumbButtonActive` styles
- Hidden on mobile (≤900px) to save space
