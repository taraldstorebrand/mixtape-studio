# TASKS.md

## Current Task

Implement playlist functionality (CRUD + song management).

## Goal

Allow users to create, edit, and delete playlists. Each playlist can contain 0–100 songs. Songs can belong to multiple playlists. When a song is deleted, all playlist references to it are automatically removed.

---

## Phase 1: Backend

### Task 1.1: Database schema for playlists

**Status:** ✅ Complete

**Description:**

- Add `playlists` table with columns:
  - `id` TEXT PRIMARY KEY
  - `name` TEXT NOT NULL
  - `description` TEXT (nullable, for future use)
  - `cover_image_url` TEXT (nullable, for future use)
  - `created_at` TEXT NOT NULL
  - `updated_at` TEXT NOT NULL
- Add `playlist_songs` junction table with columns:
  - `id` TEXT PRIMARY KEY
  - `playlist_id` TEXT NOT NULL (FK → playlists.id, ON DELETE CASCADE)
  - `song_id` TEXT NOT NULL (FK → history_items.id, ON DELETE CASCADE)
  - `position` INTEGER NOT NULL
- Note: No unique constraint on (playlist_id, song_id) — same song can appear multiple times in a playlist
- Add index on `playlist_songs(playlist_id, position)`
- Add migration logic for existing databases

**Files to modify:**

- `backend/src/db/index.ts`

---

### Task 1.2: Database functions for playlists

**Status:** ✅ Complete

**Description:**

- `getAllPlaylists()` → returns all playlists (without songs)
- `getPlaylistById(id)` → returns playlist with songs (ordered by position)
- `createPlaylist(playlist)` → insert new playlist (enforce 100 limit)
- `updatePlaylist(id, updates)` → update name (and description/cover later)
- `deletePlaylist(id)` → delete playlist (CASCADE removes song refs)
- `addSongsToPlaylist(playlistId, songIds)` → add songs at end (enforce 100 limit)
- `removeSongFromPlaylist(playlistId, entryId)` → remove single entry by id
- `reorderPlaylistSongs(playlistId, entryIds)` → update positions by entry id

**Files to modify:**

- `backend/src/db/index.ts`

---

### Task 1.3: Shared types for playlists

**Status:** ✅ Complete

**Description:**

- Add `Playlist` interface:
  ```ts
  interface Playlist {
    id: string;
    name: string;
    description?: string;
    coverImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```
- Add `PlaylistSongEntry` interface:
  ```ts
  interface PlaylistSongEntry {
    entryId: string;
    position: number;
    song: HistoryItem;
  }
  ```
- Add `PlaylistWithSongs` interface:
  ```ts
  interface PlaylistWithSongs extends Playlist {
    songs: PlaylistSongEntry[];
  }
  ```

**Files to modify:**

- `shared/types/index.ts`

---

### Task 1.4: REST API endpoints for playlists

**Status:** ✅ Complete

**Description:**

- `GET /api/playlists` → list all playlists
- `POST /api/playlists` → create playlist (body: `{ name }`)
- `GET /api/playlists/:id` → get playlist with songs
- `PATCH /api/playlists/:id` → update playlist (body: `{ name? }`)
- `DELETE /api/playlists/:id` → delete playlist
- `POST /api/playlists/:id/songs` → add songs (body: `{ songIds: string[] }`)
- `DELETE /api/playlists/:id/songs/:entryId` → remove song entry
- `PATCH /api/playlists/:id/songs/reorder` → reorder (body: `{ entryIds: string[] }`)

**Files to modify:**

- `backend/src/routes/playlists.ts` (new file)
- `backend/src/index.ts` (register routes)

---

### Task 1.5: Update API.md documentation

**Status:** ✅ Complete

**Description:**

- Document all new playlist endpoints
- Include request/response schemas and error codes

**Files to modify:**

- `API.md`

---

## Phase 2: Frontend (future)

_Tasks will be added after Phase 1 is complete._

---

## Constraints

- Max 100 playlists total
- Max 100 songs per playlist
- Songs can belong to multiple playlists
- Deleting a song cascades to remove playlist references
- Use CSS variables from `variables.css`
- Follow AGENTS.md accessibility rules
- Minimal diffs
