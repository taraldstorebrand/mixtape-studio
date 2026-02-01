# TASKS.md

## Current Task

Implement playlist functionality - Frontend (Phase 2).

## Goal

Add playlist UI to the Songs panel. Playlists act as alternate viewing contexts. Users can create, edit, delete playlists and manage songs within them via a modal editor.

---

## Phase 2: Frontend

### Task 2.1: Playlist state and API

**Status:** Not started

**Description:**

- Add Jotai atoms for playlist state:
  - `playlistsAtom` - list of all playlists (metadata only, no songs)
  - `selectedPlaylistIdAtom` - currently selected playlist ID (null = library mode)
  - Note: This atom represents view context only. HistoryList fetches playlist data on change and may cache it locally for the active view.
- Add API functions in a new service file:
  - `fetchPlaylists()`
  - `fetchPlaylist(id)`
  - `createPlaylist(name)`
  - `updatePlaylist(id, updates)`
  - `deletePlaylist(id)`
  - `addSongsToPlaylist(id, songIds)`
  - `removeSongFromPlaylist(id, entryId)`
  - `reorderPlaylistSongs(id, entryIds)`

**Files to modify:**

- `frontend/src/store/index.ts`
- `frontend/src/services/playlists.ts` (new file)

---

### Task 2.2: Playlist dropdown in HistoryList header

**Status:** Not started

**Description:**

- Add playlist dropdown button in HistoryList header (replaces "Songs" label when in playlist mode)
- Dropdown shows:
  - List of all playlists
  - Option to return to library (when in playlist mode)
  - If no playlists exist: empty state with CTA to create playlist
- When playlist selected → set `selectedPlaylistIdAtom`
- Note: Playlist mode overrides existing history filters (Songs/Liked/All are hidden)

**Files to modify:**

- `frontend/src/components/history/HistoryList.tsx`
- `frontend/src/components/history/PlaylistDropdown/PlaylistDropdown.tsx` (new)
- `frontend/src/components/history/HistoryList.module.css`

---

### Task 2.3: Playlist mode header actions

**Status:** Not started

**Description:**

- When in playlist mode (selectedPlaylistId !== null):
  - Hide "Songs", "Liked", "All" filter buttons
  - Show instead:
    - Library icon/button (return to full library)
    - Edit button (opens playlist editor)
    - Delete button (with confirmation) → after delete, return to library mode
    - Create new playlist button
- Create new playlist button also visible in library mode (next to dropdown)
- "Create playlist" opens editor in new playlist mode

**Files to modify:**

- `frontend/src/components/history/HistoryList.tsx`
- `frontend/src/components/history/PlaylistActions/PlaylistActions.tsx` (new)
- `frontend/src/components/history/HistoryList.module.css`

---

### Task 2.4: Playlist editor modal

**Status:** Not started

**Description:**

- Create PlaylistEditor component (similar to MixtapeEditor):
  - Left column: SongPicker (reuse existing component)
  - Right column: Drag-and-drop sortable playlist songs
  - Header: Editable playlist name input
- Props: `onClose`, `playlistId?` (if provided: edit mode, else: new playlist mode)
- Handles one playlist at a time (no playlist switching inside editor)
- New playlist mode:
  - Do not create playlist until first user action (add song or rename)
  - If editor closed before first action, no playlist is created
  - Show placeholder until playlist is created
- Auto-save (no explicit Save button):
  - Add/remove: save immediately
  - Reorder: save once on drag end (single API call)
- On save error: show non-blocking toast error, do not rollback UI
- Handle empty playlist with placeholder message
- Note: Playlist editing does not affect mixtape state

**Files to modify:**

- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx` (new)
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.module.css` (new)
- `frontend/src/components/playlist/PlaylistEditor/SortablePlaylistItem.tsx` (new)

---

### Task 2.5: i18n strings

**Status:** Not started

**Description:**

- Add English strings for all new playlist UI:
  - Button labels, tooltips, placeholders
  - Error messages, confirmations
  - Headings

**Files to modify:**

- `frontend/src/i18n/en.ts`

---

### Task 2.6: Wire up HistoryList with playlist filtering

**Status:** Not started

**Description:**

- When `selectedPlaylistIdAtom` is set:
  - Fetch playlist with songs using API from Task 2.1
  - Display only songs in that playlist (in playlist order)
  - Override existing filters (do not combine with Songs/Liked/All)
- Update header to show playlist name instead of "Songs"
- Handle empty playlist with placeholder message

**Files to modify:**

- `frontend/src/components/history/HistoryList.tsx`

---

## Constraints

- Reuse existing SongPicker component for playlist editor
- Follow MixtapeEditor patterns for drag-and-drop
- Use CSS variables from `variables.css`
- Follow AGENTS.md accessibility rules
- No routing changes, no new navigation
- Minimal diffs
