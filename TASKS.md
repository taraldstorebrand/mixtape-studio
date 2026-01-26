# TASKS.md

## Iteration 020 – Backend persistence with SQLite (D-042)

### Goal
Replace localStorage-based persistence with SQLite backend storage. Increase history limit to 10,000 items.

---

## Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend Database Layer | ✅ Done |
| 2 | Backend REST Endpoints | ✅ Done |
| 3 | Frontend API Client | ✅ Done |
| 4 | Frontend Hook Updates | ⬜ Pending |
| 5 | One-Time Migration | ⬜ Pending |

---

## Phase 1: Backend Database Layer ✅

**Files created/changed:**
- `backend/package.json` – added `better-sqlite3`
- `backend/src/db/index.ts` – SQLite database with tables and CRUD functions

**Implemented:**
- SQLite database at `backend/data/sangtekst.db`
- `history_items` table with all HistoryItem fields
- `genre_history` table with genre and last_used_at
- CRUD functions for history (get all, get by id, create, bulk create, update, delete)
- CRUD functions for genres (get all, add, remove)
- Automatic limit enforcement (10,000 history items, 50 genres)

---

## Phase 2: Backend REST Endpoints ✅

**Files created/changed:**
- `backend/src/routes/history.ts` – history REST routes
- `backend/src/routes/genres.ts` – genre REST routes
- `backend/src/server.ts` – mount routes, initialize database

**Endpoints:**

History:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Fetch all history items |
| POST | `/api/history` | Create new history item |
| POST | `/api/history/bulk` | Bulk create (for migration) |
| PATCH | `/api/history/:id` | Update history item |
| DELETE | `/api/history/:id` | Delete history item |

Genres:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/genres` | Fetch all genres |
| POST | `/api/genres` | Add genre |
| DELETE | `/api/genres/:genre` | Remove genre |

---

## Phase 3: Frontend API Client ✅

**File:** `frontend/src/services/api.ts`

**Implemented:**
- `fetchHistory()` - GET /api/history
- `createHistoryItem(item)` - POST /api/history
- `createHistoryItemsBulk(items)` - POST /api/history/bulk
- `updateHistoryItem(id, updates)` - PATCH /api/history/:id
- `deleteHistoryItem(id)` - DELETE /api/history/:id
- `fetchGenres()` - GET /api/genres
- `addGenre(genre)` - POST /api/genres
- `removeGenre(genre)` - DELETE /api/genres/:genre (URL-encoded)

---

## Phase 4: Frontend Hook Updates ⬜

### 4.1 Update `frontend/src/store/useHistoryAtom.ts`
- Change from sync localStorage to async API calls
- Load history on mount via `fetchHistory()`
- Replace storage service calls with API calls
- Use optimistic updates for better UX

### 4.2 Update `frontend/src/store/useGenreHistoryAtom.ts`
- Change from direct localStorage to async API calls
- Load genres on mount via `fetchGenres()`
- Replace localStorage operations with API calls

### 4.3 Update `frontend/src/services/storage.ts`
- Add migration function: `migrateToBackend()`
- Check if localStorage has data, if so POST bulk to backend and clear
- Keep `sangtekst_panel_width` localStorage operations

---

## Phase 5: One-Time Migration ⬜

### 5.1 Add migration logic to `useHistoryAtom.ts`
On mount:
1. Check localStorage for `sangtekst_history`
2. If exists and non-empty, POST bulk to `/api/history/bulk`
3. Clear `sangtekst_history` from localStorage
4. Then fetch from API as normal

### 5.2 Add migration logic to `useGenreHistoryAtom.ts`
On mount:
1. Check localStorage for `sangtekst_genre_history`
2. If exists and non-empty, POST each to `/api/genres`
3. Clear `sangtekst_genre_history` from localStorage
4. Then fetch from API as normal

---

## Out of Scope
- User authentication
- Multi-user support
- Cloud sync
- `user_preferences` table

---

## Files Changed (Complete)
- backend/package.json ✅
- backend/src/db/index.ts (new) ✅
- backend/src/routes/history.ts (new) ✅
- backend/src/routes/genres.ts (new) ✅
- backend/src/server.ts ✅
- frontend/src/services/api.ts
- frontend/src/store/useHistoryAtom.ts
- frontend/src/store/useGenreHistoryAtom.ts
- frontend/src/services/storage.ts
- SPEC.md
- DECISIONS.md ✅

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
