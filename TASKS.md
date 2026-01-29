# TASKS.md

## Current Task

_No active task_

## Pending Tasks

### Task 1: Fiks pause-knappen i HistoryItem
**Files:**
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`

**Details:**
Pause-knappen i listen fungerer ikke - kun baren nederst fungerer.

**Mulig årsak:**
- `isPlayingAtom` oppdateres ikke korrekt når audio pauses
- Eller `audioRef.pause()` kallet trigger ikke state-oppdatering

**Undersøk:**
- Hvordan `isPlayingAtom` settes i `useAudioPlayback.ts`
- Om det er event listeners på audio-elementet som oppdaterer state

---

## Completed

### ✅ Task: Endre "selected" til "active" styling i HistoryItem
**Files:**
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`

**Changes:**
- `.selected`: Fjernet border og box-shadow, kun subtle bakgrunn
- `.nowPlaying`: Erstattet grønn med primary-farge, la til venstre-kant
- `.playButton:hover` og `.playButtonActive`: Byttet grønn til primary

**Status:** ✅ Completed

---

## Backlog

_No backlog items_
