# TASKS.md

## Iteration 020 – Backend persistence with SQLite (D-042)

### Goal
Replace localStorage-based persistence with SQLite backend storage. Increase history limit to 10,000 items.

---

## In Scope

### Backend
- Add SQLite database (`better-sqlite3`)
- Create `data/sangtekst.db` with `history_items` and `genre_history` tables
- Implement REST endpoints for history and genre CRUD
- Add database initialization on server startup

### Frontend
- Create API client for history and genre endpoints
- Update `useHistoryAtom` to fetch/mutate via API
- Update `useGenreHistoryAtom` to fetch/mutate via API
- Remove localStorage usage for `sangtekst_history` and `sangtekst_genre_history`
- Keep `sangtekst_panel_width` in localStorage
- Add one-time migration from localStorage to backend

### Documentation
- Add D-042 to DECISIONS.md
- Update D-020 (history limit 100 → 10,000)
- Update SPEC.md data persistence section

---

## Out of Scope
- User authentication
- Multi-user support
- Cloud sync
- `user_preferences` table

---

## Files Changed
- backend/package.json
- backend/src/db/index.ts (new)
- backend/src/routes/history.ts (new)
- backend/src/routes/genres.ts (new)
- backend/src/server.ts
- frontend/src/services/api.ts (new)
- frontend/src/store/useHistoryAtom.ts
- frontend/src/store/useGenreHistoryAtom.ts
- frontend/src/services/storage.ts
- SPEC.md
- DECISIONS.md

---

## Iteration 019 – One history item per song variation (D-041)

### Goal
Refactor the domain model so each Suno song variation is stored as a separate history item, instead of storing both variations in arrays on a single item.

---

## In Scope

### Shared Types
- Change `sunoAudioUrls[]` → `sunoAudioUrl` (single URL)
- Change `sunoLocalUrls[]` → `sunoLocalUrl` (single URL)
- Remove `'partial'` from `sunoStatus`
- Add `sunoClipId` and `variationIndex` fields
- Add `LegacyHistoryItem` interface for migration

### Frontend
- Create migration script (`migration-v041.ts`) to split legacy items
- Update `DetailPanel` to create 2 history items per Suno generation
- Update `handleSunoUpdate` to update items by `variationIndex`
- Simplify `HistoryItem` component to single audio player
- Remove track-level delete functionality
- Show variation number in title (#1, #2)

### Backend
- Remove `'partial'` status mapping from Suno service

### Documentation
- Add D-041 to DECISIONS.md
- Supersede D-025 (partial status)
- Update D-031 (remove track delete)
- Update SPEC.md data structure and descriptions

---

## Files Changed
- shared/types/index.ts
- frontend/src/services/migration-v041.ts (new, delete after use)
- frontend/src/services/storage.ts
- frontend/src/App.tsx
- frontend/src/components/panels/DetailPanel.tsx
- frontend/src/components/panels/HistoryPanel.tsx
- frontend/src/components/history/HistoryList.tsx
- frontend/src/components/history/HistoryItem.tsx
- backend/src/services/suno.ts
- SPEC.md
- DECISIONS.md

---

## Post-Migration Cleanup
After running the app once to migrate localStorage:
1. Remove import from App.tsx: `import './services/migration-v041';`
2. Delete file: `frontend/src/services/migration-v041.ts`

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 018 | Refine Jotai atoms (no side effects, semantic status) |
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
