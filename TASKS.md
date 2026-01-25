# TASKS.md

## Iteration 018 – Refine Jotai atoms

### Goal
Remove side effects from atom initialization; use explicit initialization in hooks. Replace boolean `isGeneratingSongAtom` with semantic `songGenerationStatusAtom`.

---

## In Scope

### Frontend
- Initialize atoms with empty/default values (no localStorage or service calls in atom definitions)
- Add `useEffect` in hook wrappers to load initial data on mount
- Replace `isGeneratingSongAtom: boolean` with `songGenerationStatusAtom: 'idle' | 'pending' | 'completed' | 'failed'`
- Update App.tsx and DetailPanel to use new status atom

---

## Files Allowed to Change
- frontend/src/store/atoms.ts
- frontend/src/store/useHistoryAtom.ts
- frontend/src/store/useGenreHistoryAtom.ts
- frontend/src/store/index.ts
- frontend/src/App.tsx
- frontend/src/components/panels/DetailPanel.tsx
- DECISIONS.md

---

## Acceptance Criteria
- Atoms initialize without side effects
- Hook wrappers load initial data via `useEffect`
- Song generation status uses semantic values
- All existing behavior preserved
- D-040 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 017 | Introduce Jotai for shared state |
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
