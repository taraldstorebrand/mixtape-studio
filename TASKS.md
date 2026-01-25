# TASKS.md

## Iteration 017 – Introduce Jotai for shared state

### Goal
Introduce Jotai for shared application state (history, selected item, song generation lifecycle). Keep editor draft state and visual UI state local.

---

## In Scope

### Frontend
- Add Jotai dependency
- Create atoms for shared state:
  - `historyAtom` – history items list
  - `selectedItemIdAtom` – currently selected item ID
  - `selectedItemAtom` – derived atom for selected item
  - `isGeneratingSongAtom` – song generation lifecycle
  - `genreHistoryAtom` – genre history list
- Create hook wrappers: `useHistoryAtom`, `useGenreHistoryAtom`
- Update App.tsx to use Jotai atoms
- Update DetailPanel to use shared `isGeneratingSongAtom`
- Keep editor draft state local (lyrics, title, genre, prompt, isLoading, error)

---

## Files Allowed to Change
- frontend/package.json
- frontend/src/store/atoms.ts (new)
- frontend/src/store/useHistoryAtom.ts (new)
- frontend/src/store/useGenreHistoryAtom.ts (new)
- frontend/src/store/index.ts (new)
- frontend/src/App.tsx
- frontend/src/components/panels/DetailPanel.tsx
- DECISIONS.md

---

## Acceptance Criteria
- Jotai installed and atoms created
- History, selected item, and song generation lifecycle use Jotai atoms
- Editor draft state remains local in DetailPanel
- All existing behavior preserved
- D-039 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 016 | DetailPanel owns editor draft state |
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
