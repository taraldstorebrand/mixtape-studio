# TASKS.md

## Current Task

_No active task_

### ✅ Code Review Fixes
**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`

**Fixed issues:**
- Reset time/duration atoms on song change (prevents stale progress display)
- Handle `nowPlaying === null` properly (pause + cleanup audio)
- Add audio `error` event listener (resets state on broken URLs)
- Add `.catch()` to `audioRef.play()` in HistoryItem
- Replace `document.querySelector` with `useRef` for progress bar
- Remove unused imports (`useAtomValue`, `useSetAtom`)
- Use refs for drag state to reduce listener churn
- Fix import consistency (use `../../../store` barrel)
- Add `aria-pressed` to play buttons
- Add keyboard navigation for progress bar (ArrowLeft/Right, Home/End)
- Add ARIA slider attributes to progress bar (`role`, `aria-valuemin/max/now`)

**Status:** ✅ Completed

---

## Completed

### ✅ Task 1: Create global audio state atoms
**Files:**
- `frontend/src/store/atoms.ts` - Add new atoms for now playing state

**Details:**
Create jotai atoms to manage global audio playback state:
- `nowPlayingAtom` - stores current playing song (HistoryItem | null)
- `audioRefAtom` - stores reference to the global audio element
- `isPlayingAtom` - boolean for play/pause state
- `currentTimeAtom` - current playback position in seconds
- `durationAtom` - total song duration in seconds

**Status:** ✅ Completed. All atoms created in store/atoms.ts.

### ✅ Task 2: Create NowPlayingBar component
**Files:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx` ✅
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css` ✅
- `frontend/src/components/nowplaying/NowPlayingBar/index.ts` ✅

**Details:**
Create a sticky bottom bar that:
- Only visible when a song is playing (slides up/down animation)
- Shows currently playing song title and thumbnail
- Has play/pause button
- Shows seekable progress bar (click/drag to seek)
- Updates progress bar in real-time during playback
- Uses global audio element from audioRefAtom
- Styled consistently with existing app design

**Status:** ✅ Completed. Component created with all features including seekable progress, slide-up animation, and play/pause controls.

### ✅ Task 5: Export new atoms from store
**Files:**
- `frontend/src/store/index.ts` - Export new atoms

**Details:**
Export the new atoms (nowPlayingAtom, isPlayingAtom, etc.) so components can import them.

**Status:** ✅ Completed. All new atoms exported from store/index.ts.

### ✅ Task 3: Update HistoryItem component
**Files:**
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx` ✅
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css` ✅

**Details:**
Modify HistoryItem to:
- Remove the existing `<audio>` element and controls (lines 103-109)
- Add a simple play/pause button icon
- Button should use nowPlayingAtom to start/stop playback
- Show visual indicator when this item is currently playing
- Auto-switch: clicking play on different song stops current and plays new one

**Status:** ✅ Completed. HistoryItem now uses global audio state with play/pause button. Removed local audio element. Added visual indicator for currently playing item (green border). Auto-switching between songs works correctly.

### ✅ Task 4: Integrate NowPlayingBar into App
**Files:**
- `frontend/src/App.tsx` ✅
- `frontend/src/App.module.css` ✅

**Details:**
- Import and render NowPlayingBar at the bottom of the app
- Ensure it appears above all other content (z-index)
- Add bottom padding/margin to main content so it doesn't overlap
- The bar should be fixed at bottom of viewport

**Status:** ✅ Completed. NowPlayingBar integrated at bottom of App. Added 100px bottom padding to both panels to prevent content overlap.

## Backlog

_No remaining tasks_

---

## Notes

**User Requirements:**
- Only one song can play at a time
- Now Playing bar only visible when playing
- Auto-switch behavior when clicking play on different song
- Progress bar should be seekable (drag/click to seek)
- Remove all individual audio controls from history items

**Architecture Guidelines:**
- Use jotai for global state
- Functional React components only
- No useCallback/useMemo unless strictly required
- Helper components in subfolders matching parent name
- File names must match component names
- TypeScript strict mode
