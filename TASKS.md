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
- Keep existing functionality (play/pause, prev/next, feedback, volume)

---

## Completed

### Task 1: Restructure NowPlayingBar layout
**Status:** Completed

**Goal:** Center playback controls above the progress bar, similar to YouTube Music

**Changes:**
- Restructured `.content` layout with three sections (left, center, right)
- Left section: thumbnail + title (flex: 1)
- Center section: controls above progress bar (flex: 0 0 auto, min-width: 400px)
- Right section: feedback buttons + volume (flex: 1, justify-content: flex-end)
- Added extra padding-right to content
- Mobile: volume control hidden, compact layout

**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`

---

### Task 2: Add scrolling/marquee effect for long titles
**Status:** Completed

**Goal:** When the song title is too long to fit, animate it with a horizontal scroll

**Changes:**
- Added useEffect to detect title overflow using ref and scrollWidth/clientWidth comparison
- Applied `.titleMarquee` class conditionally when title overflows
- Added CSS `@keyframes marquee` animation (10s linear infinite)
- Animation pauses on hover for readability
- Includes pause at start/end (0-10% and 90-100% keyframes)

**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`
