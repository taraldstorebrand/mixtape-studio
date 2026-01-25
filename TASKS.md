# TASKS.md

## Iteration 015 – Split App.tsx into panels and resize hook

### Goal
Extract DetailPanel, HistoryPanel, and a reusable `useResizable` hook from App.tsx. Reduce App.tsx to orchestration only. Preserve all existing behavior.

---

## In Scope

### Frontend
- Create `useResizable` hook in `frontend/src/hooks/useResizable.ts`
  - Accepts containerRef, storageKey, defaultWidth, minWidth, maxWidth
  - Returns { width, isDragging, handleMouseDown }
  - Handles localStorage persistence and mouse events internally
- Create `DetailPanel` component in `frontend/src/components/panels/DetailPanel.tsx`
  - Renders readonly view when item selected, generation section otherwise
  - Receives all necessary props from App.tsx
- Create `HistoryPanel` component in `frontend/src/components/panels/HistoryPanel.tsx`
  - Wraps HistoryList with panel styling
- Refactor App.tsx to use new components/hook
  - App.tsx handles state, callbacks, and layout orchestration only

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/hooks/useResizable.ts (new)
- frontend/src/components/panels/DetailPanel.tsx (new)
- frontend/src/components/panels/HistoryPanel.tsx (new)
- ARCHITECTURE.md
- DECISIONS.md

---

## Acceptance Criteria
- App.tsx contains only state, callbacks, and layout composition
- useResizable hook is reusable and handles all resize logic
- DetailPanel shows readonly view or generation section based on selectedItem
- HistoryPanel wraps HistoryList
- All existing behavior preserved (resize, localStorage, selection, etc.)
- No useCallback or useMemo unless strictly required
- D-037 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 014 | Custom GenreInput component |
| 013 | Song selection and draft state restoration |
| 012 | Lyrics editor and prompt input styling |
| 013-prev | Dark theme consistency |
| 011 | Thumb button styling and toggle behavior |
| 010 | History filtering and deletion |
| 009 | History only for successful Suno generations |
| 008 | Genre field with searchable history |
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
