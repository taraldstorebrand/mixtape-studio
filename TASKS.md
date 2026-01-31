# TASKS.md

## Current Task

Task 1: Implement autoplay to next song

## Goal

Automatically play the next song when the current song finishes, matching Suno's behavior.

---

## Design Decision: What is "next"?

**Problem:** When user changes filter while a song is playing, what should happen?

**Suno's approach:** The queue is "locked in" when playback starts. Changing filters doesn't affect what plays next.

**Proposed solution:** 
- Store a `playbackQueueAtom` that captures the filtered list *at the moment playback starts*
- "Next" always refers to the next song in this queue, not the current filter view
- Queue resets when user manually selects a new song (user intent = new queue)

**Alternative considered:**
- Always use current `filteredHistoryAtom` for next song
- Risk: Song disappears from queue if user filters it out mid-playback (confusing UX)

---

## Task 1: Create playbackQueueAtom and capture queue on play

**Status:** ✓ Completed

**Description:**
- Add `playbackQueueAtom` to store (array of HistoryItem IDs)
- When a song starts playing (via setNowPlaying or clicking play on HistoryItem), capture current `filteredHistoryAtom` as the playback queue
- Store only IDs to avoid stale data; resolve to full items when needed

**Files to modify:**
- `frontend/src/store/atoms.ts`

---

## Task 2: Add onEnded callback to trigger next song

**Status:** ✓ Completed

**Description:**
- Modify `handleEnded` in `useAudioPlayback.ts` to call a new `playNext` function instead of just stopping
- `playNext` finds current song index in `playbackQueueAtom`, plays next song
- If at end of queue, either stop or loop (decide: stop is safer default)

**Files to modify:**
- `frontend/src/components/nowplaying/NowPlayingBar/hooks/useAudioPlayback.ts`

---

## Task 3: Update handleNext/handlePrevious to use playback queue

**Status:** ✓ Completed

**Description:**
- `handleNext` and `handlePrevious` in NowPlayingBar should navigate within `playbackQueueAtom`, not `filteredHistoryAtom`
- This ensures consistent behavior: next button = same as autoplay next

**Files to modify:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`

---

## Task 4: Reset queue when user manually selects a song

**Status:** ✓ Completed

**Description:**
- When user clicks a song in HistoryList, update `playbackQueueAtom` to current filtered list
- This gives user control: "I want to play from this filtered view"

**Files to modify:**
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx` (or wherever play is triggered)

---

## Constraints

- No new dependencies
- Maintain existing keyboard/button controls
- Preserve accessibility
- Follow AGENTS.md style rules
- Use existing Jotai atoms pattern

---

## Edge Cases

1. **Current song deleted:** If nowPlaying song is deleted, stop playback immediately
2. **Next song deleted:** Skip deleted songs when advancing; find next valid song in queue
3. **All songs in queue deleted:** Stop playback
4. **End of queue:** Stop playback (no loop)
