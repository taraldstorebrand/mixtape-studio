# TASKS.md

## Iteration 016 – DetailPanel owns editor draft state

### Goal
Refactor so DetailPanel owns all editor draft state and logic. Reduce App.tsx to thin orchestration. Preserve all existing behavior.

---

## In Scope

### Frontend
- Move all editor draft state into DetailPanel:
  - lyrics, title, genre, prompt, isLoading, isGeneratingSong, error
- Move handlers into DetailPanel:
  - generateLyrics, generateSong, copy-from-history
- DetailPanel exposes imperative handle for Suno completion notification
- Reduce DetailPanel props to: selectedItem, genreHistory, onAddHistoryItem, onAddGenre, onRemoveGenre, onClearSelection
- HistoryPanel remains unchanged (immutable history concerns only)
- App.tsx remains thin orchestrator (history, genre history, selection, Suno socket, layout)

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/components/panels/DetailPanel.tsx
- DECISIONS.md

---

## Acceptance Criteria
- DetailPanel owns all editor draft state internally
- App.tsx does not manage editor draft state (lyrics, title, genre, prompt, loading, error)
- DetailPanel props reduced to only external dependencies
- HistoryPanel unchanged
- All existing behavior preserved
- D-038 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 015 | Split App.tsx into panels and resize hook |
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
