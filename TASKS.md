# TASKS.md

## Current Task

_No active task_

## Pending Tasks

_No pending tasks_

---

## Completed

### ✅ Task 1: Add volume and filtered history atoms to store
**Files:**
- `frontend/src/store/atoms.ts`
- `frontend/src/store/index.ts`

**Details:**
Added two new atoms:
- `volumeAtom` - number (0-1) for audio volume, initialized from localStorage if available, default 1.0
- `filteredHistoryAtom` - array of HistoryItem, stores the currently filtered/visible history list

**Implementation:**
- Created `getInitialVolume()` helper function to load volume from localStorage
- Added `volumeAtom` with localStorage initialization and validation
- Added `filteredHistoryAtom` as empty array by default
- Exported both atoms from `store/index.ts`

**Status:** ✅ Completed

---

### ✅ Task 2: Add volume control to NowPlayingBar
**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`

**Details:**
Added complete volume control functionality:
- Volume slider with drag and click support
- Mute/unmute button with dynamic icons (🔇/🔉/🔊)
- Audio element volume synced with volumeAtom
- Volume persisted to localStorage on change
- Responsive design for mobile

**Implementation:**
- Added `volumeBarRef`, `isVolumeDragging`, `isMuted`, `previousVolumeRef` state
- Created `handleVolumeClick`, `handleVolumeMouseDown`, `handleMuteToggle` handlers
- Added useEffect for drag handling and localStorage persistence
- Styled with `.volumeContainer`, `.muteButton`, `.volumeBar`, `.volumeFill`, `.volumeHandle`

**Status:** ✅ Completed

---

### ✅ Task 3: Update HistoryList to populate filteredHistoryAtom
**Files:**
- `frontend/src/components/history/HistoryList.tsx`

**Details:**
HistoryList now updates global filtered history state:
- Imported `useEffect`, `useSetAtom`, and `filteredHistoryAtom`
- Added useEffect that syncs `filteredItems` to `filteredHistoryAtom`
- Automatically updates when filter changes or items change

**Implementation:**
- Used `useSetAtom(filteredHistoryAtom)` to get setter
- Added useEffect with dependency on `[filteredItems, setFilteredHistory]`
- Ensures NowPlayingBar always has access to current filtered list

**Status:** ✅ Completed

---

### ✅ Task 4: Add next/previous buttons to NowPlayingBar
**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`

**Details:**
Added navigation controls with full loop functionality:
- Previous (⏮) and Next (⏭) buttons
- Loop behavior: at end goes to start, at start goes to end
- Buttons disabled when filteredHistory is empty
- Respects current filter ('default', 'liked', 'all')

**Implementation:**
- Imported `useAtomValue` and `filteredHistoryAtom`
- Created `handlePrevious()` and `handleNext()` with loop logic
- Added `.controls` container with Previous, Play/Pause, Next buttons
- Styled with `.navButton` class (hover effects, disabled state)
- Responsive design for mobile

**Edge cases handled:**
- Empty list (buttons disabled)
- Single item (loops to itself)
- Current item not in filtered list (starts from end/start)

**Status:** ✅ Completed

---

### ✅ Task 5: Export new atoms from store
**Files:**
- `frontend/src/store/index.ts`

**Details:**
Exported `volumeAtom` and `filteredHistoryAtom` from store barrel export.

**Status:** ✅ Completed (done as part of Task 1)

---

## Backlog

_No backlog items_

---

## Summary

All tasks completed successfully! The NowPlayingBar now includes:

**Volume Control:**
- 🔊 Slider with drag/click support
- 🔇 Mute/unmute button with dynamic icons
- 💾 Persisted in localStorage

**Navigation:**
- ⏮ Previous button
- ⏯ Play/Pause button
- ⏭ Next button
- 🔄 Loop behavior at list boundaries
- 🎯 Respects active filter ('default', 'liked', 'all')

**Files Modified:**
- `frontend/src/store/atoms.ts` - Added volumeAtom and filteredHistoryAtom
- `frontend/src/store/index.ts` - Exported new atoms
- `frontend/src/components/history/HistoryList.tsx` - Syncs filtered list to global state
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx` - Added volume and navigation controls
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css` - Styled new controls
