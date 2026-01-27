# TASKS.md

## UX Improvements – First-time Clarity & Mixtape Understanding

### AI Usage Clarity
- [x] Decide how to explicitly signal that AI-generated lyrics are optional (no default assumption of AI use)
- [x] Add minimal microcopy that allows users to understand they can write lyrics manually without invoking AI
- [x] Verify that AI-related affordances do not dominate the primary creation flow

### Creation Flow Signaling
- [x] Decide whether the app should visually suggest a "recommended first action" for first-time users (without enforcing a path)
- [x] Clarify through UI signals when the user is in a draft state vs viewing an existing song
- [x] Ensure transitions between draft → generated song feel intentional, not implicit

### Song Source Transparency
- [x] Decide how to visually distinguish between generated songs and uploaded songs
- [x] Decide whether this distinction should be visible in the history list, detail view, or both
- [x] Ensure source indicators are passive and do not increase cognitive load

### Mixtape Understanding (Critical)
- [x] Clarify what songs are included in a mixtape before generation (scope)
- [x] Clarify how mixtape ordering is determined (e.g. liked order, creation order)
- [x] Decide what level of mixtape preview is appropriate without introducing configuration UI
- [x] Ensure mixtape creation feels like a predictable export, not a "magic" action

### Library Mental Model
- [x] Decide whether the history list should be framed as a "library" conceptually
- [x] Ensure filtering (Default / Liked / All) communicates collection intent, not just sorting
- [x] Clarify the relationship between liking a song and long-term ownership/collection

### Restraint & Non-Goals
- [x] Explicitly decide which advanced capabilities should remain undiscovered for first-time users
- [x] Identify any UX improvements that should be intentionally deferred to avoid over-onboarding


## Iteration 029 – UX Decision Implementation

### Implemented
- [x] UX-001: Mixtape button shows song count + duration ("Lag mixtape (7 sanger · 24:30)")
- [x] UX-002: "Lastet opp" label for uploaded songs in history list
- [x] UX-005: Right panel header renamed to "Sanger" (was already done)
- [x] UX-006: Filter tabs renamed to "Sanger / Likte / Alle"

---

## Iteration 028 – Mixtape-knapp viser total varighet

### Goal
MixtapeButton viser total varighet (timer, minutter, sekunder) av alle likte sanger.
Varigheten oppdateres live når bruker legger til eller fjerner likes.

### Prerequisites
Duration er ikke lagret i dag. Suno API returnerer `duration` per clip, og backend kan hente varighet fra MP3-filer via ffmpeg. Varighet må persisteres slik at frontend kan vise den.

### Approach
1. Legg til `duration` (sekunder, number, nullable) i `HistoryItem` type og database-skjema
2. Backend: Lagre `duration` fra Suno API-respons når clip er ferdig (allerede tilgjengelig i `SunoRecordInfoTrack.duration`)
3. Backend: For opplastede filer, hent varighet via ffmpeg ved upload
4. Frontend: `MixtapeButton` mottar likte items, summerer `duration`, og viser formatert tid (HH:MM:SS)
5. Frontend: Verdien oppdateres reaktivt når likes endres i `HistoryList`

---

## Files to Change
- shared/types/index.ts – Legg til `duration?: number` i HistoryItem ✅
- backend/src/db/index.ts – Legg til `duration` kolonne, oppdater CRUD ✅
- backend/src/services/suno.ts – Lagre duration fra Suno API-respons ✅
- backend/src/routes/upload.ts – Hent og lagre duration ved MP3-upload ✅
- frontend/src/components/history/MixtapeButton/MixtapeButton.tsx – Vis total varighet ✅
- frontend/src/components/history/HistoryList.tsx – Send likte items med duration til MixtapeButton ✅
- frontend/src/hooks/useSunoSocket.ts – Legg til `durations` i SunoUpdateData ✅
- frontend/src/App.tsx – Pass duration ved Suno-oppdatering ✅
- DECISIONS.md ✅

---

## Iteration 027 – Multi-file MP3 upload (D-049)

### Goal
Enable uploading multiple MP3 files at once instead of one file at a time.
Uploaded files use the user-provided title (or original filename) as the server filename.
If a file with the same name exists, a sequential suffix is added (_1.mp3, _2.mp3, etc.).

---

## Files to Change
- backend/src/routes/upload.ts – Accept multiple files, use title-based filenames with deduplication
- frontend/src/components/history/UploadButton/UploadButton.tsx – Multi-file selection and title input
- frontend/src/services/api.ts – Update uploadMp3 to handle multiple files
- SPEC.md ✅
- API.md ✅
- DECISIONS.md ✅

---

## Iteration 026 – Manual MP3 upload for mixtapes (D-048) ✅

### Goal
Allow users to upload existing MP3 files to include in mixtapes alongside generated songs.
Uploaded files are saved to `backend/mp3s/` and create a history item with `isUploaded: true`.

---

## Files to Change
- shared/types/index.ts – Add `isUploaded` field to HistoryItem
- backend/src/routes/upload.ts (new) – Upload endpoint with multer
- backend/src/server.ts – Mount upload routes
- backend/src/db/index.ts – Handle isUploaded field in CRUD
- frontend/src/components/history/UploadButton/UploadButton.tsx (new) – Upload button component
- frontend/src/components/history/HistoryList.tsx – Include upload button
- frontend/src/services/api.ts – Upload API function
- SPEC.md
- API.md
- ARCHITECTURE.md
- DECISIONS.md ✅

---

## Iteration 025 – Temporary mixtape file storage (D-047) ✅

### Goal
Change mixtape delivery from base64 over WebSocket to temporary file download.
Backend stores generated M4B in `backend/temp/`, frontend downloads via HTTP endpoint.
Files are deleted after download or after 10-minute TTL.

---

## Files Changed
- backend/src/routes/mixtape.ts ✅
- backend/src/server.ts ✅
- backend/.gitignore ✅
- frontend/src/components/history/MixtapeButton/MixtapeButton.tsx ✅
- frontend/src/services/api.ts ✅
- SPEC.md ✅
- API.md ✅
- ARCHITECTURE.md ✅
- DECISIONS.md ✅

---

## Iteration 024 – Mixtape with embedded chapters (D-045, D-046) ✅

### Goal
Change mixtape output from MP3 to M4B with embedded chapter markers for iPhone compatibility.
Use WebSocket to notify when generation is complete.

---

## Files Changed
- backend/src/routes/mixtape.ts ✅
- frontend/src/services/api.ts ✅
- frontend/src/components/history/MixtapeButton/MixtapeButton.tsx ✅
- SPEC.md ✅
- API.md ✅
- DECISIONS.md ✅

---

## Iteration 023 – Always-visible editor fields (D-044)

### Goal
Show all editor fields (title, lyrics, genre, generate button) in "new draft" state, allowing users to write lyrics directly without generating via ChatGPT first.

---

## Files Changed
- frontend/src/components/lyrics/LyricsTextarea.tsx ✅
- SPEC.md ✅
- DECISIONS.md ✅

---

## Iteration 022 – Mixtape from liked songs (D-043)

### Goal
Add a "Lag mixtape av likte sanger" button that creates a downloadable MP3 from all liked songs.

---

## Files Changed
- backend/src/routes/mixtape.ts (new) ✅
- backend/src/server.ts ✅
- backend/package.json (added ffmpeg-static) ✅
- frontend/src/components/history/MixtapeButton/MixtapeButton.tsx (new) ✅
- frontend/src/components/history/HistoryList.tsx ✅
- frontend/src/services/api.ts ✅
- frontend/src/App.css ✅
- SPEC.md ✅
- API.md ✅
- DECISIONS.md ✅

---

## Iteration 021 – Delete MP3 files on history deletion

### Goal
When a history item is deleted, also delete the associated MP3 file from `backend/mp3s/` if it exists.

---

## Files Changed
- backend/src/routes/history.ts – extract filename from sunoLocalUrl and delete file
- SPEC.md ✅
- API.md ✅

---

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
| 4 | Frontend Hook Updates | ✅ Done |
| 5 | One-Time Migration | ✅ Done |

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

## Phase 4: Frontend Hook Updates ✅

**Files changed:**
- `frontend/src/store/useHistoryAtom.ts` – async API calls with optimistic updates
- `frontend/src/store/useGenreHistoryAtom.ts` – async API calls with optimistic updates
- `frontend/src/services/storage.ts` – simplified to migration helpers only
- `frontend/src/hooks/useHistory.ts` – deleted (unused legacy hook)

**Implemented:**
- Load history/genres from backend on mount
- Optimistic updates with rollback on error
- One-time migration integrated (Phase 5)

---

## Phase 5: One-Time Migration ✅

**Implemented in Phase 4:**
- `useHistoryAtom.ts`: On mount, migrates `sangtekst_history` from localStorage to backend via bulk API, then clears localStorage
- `useGenreHistoryAtom.ts`: On mount, migrates `sangtekst_genre_history` from localStorage to backend, then clears localStorage

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
