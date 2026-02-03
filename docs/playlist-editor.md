# Playlist Editor

## Overview

The PlaylistEditor component handles creating, editing, and managing playlists. It provides drag-and-drop reordering and synchronizes with playback state.

## Data Model

### Key Concepts

- **Playlist**: Container with `id`, `name`, `createdAt`, `updatedAt`
- **PlaylistSongEntry**: Links a song to a playlist with `entryId`, `position`, and `song` (HistoryItem)
- **entryId**: Unique identifier per entry. The same song can appear multiple times (duplicates allowed), each with a different `entryId`
- **Temp entries**: Local entries with IDs starting with `temp-` that haven't been persisted to the backend yet

### Database Tables

- `playlists` - Playlist metadata
- `playlist_songs` - Junction table with `entry_id`, `playlist_id`, `song_id`, `position`

## API Contracts

### Create Playlist

```
POST /api/playlists
Request:  { name: string }
Response: { success: true, id: string }
```

### Add Songs

```
POST /api/playlists/:id/songs
Request:  { songIds: string[] }
Response: { success: true, entryIds: string[] }
```

The `entryIds` array is returned in the same order as `songIds` - this is critical for mapping temp entries to their backend IDs.

### Reorder Songs

```
PATCH /api/playlists/:id/songs/reorder
Request:  { entryIds: string[] }
Response: { success: true }
```

The `entryIds` array must contain **exactly** the same entry IDs currently in the playlist, just in the desired order.

### Remove Song Entry

```
DELETE /api/playlists/:id/songs/:entryId
Response: { success: true, entryId: string }
```

## Save Algorithm

The editor uses a **snapshot-based diff** approach to minimize API calls and avoid race conditions.

### On Load (edit mode)

1. Fetch playlist with songs
2. Store snapshot: `{ name, entryIds: [...] }`

### On Save

```
1. COMPUTE DIFF using snapshot (no fetch needed)
   - existingEntries = entries without temp- prefix
   - tempEntries = entries with temp- prefix  
   - toRemove = snapshot.entryIds NOT in existingEntries

2. CREATE OR UPDATE PLAYLIST
   - If new: POST /playlists → get ID, store in createdPlaylistId
   - If name changed: PATCH /playlists/:id

3. REMOVE DELETED ENTRIES
   - Promise.all(toRemove.map(id => DELETE /playlists/:id/songs/:id))

4. ADD NEW ENTRIES  
   - POST /playlists/:id/songs with songIds from tempEntries
   - Receive entryIds[] in same order as songIds[]

5. REORDER
   - Build finalEntryIds by replacing temp- IDs with returned backend IDs
   - PATCH /playlists/:id/songs/reorder with finalEntryIds
```

### Why This Order?

1. **Remove first**: Ensures we don't hit the 100-song limit when adding
2. **Add second**: Returns backend `entryIds` needed for reorder
3. **Reorder last**: Operates on the final set of entries

### Error Recovery

- If create succeeds but later steps fail, `createdPlaylistId` is set so retries update the same playlist
- Partial failures show error but don't rollback (eventual consistency)

## State Management

### Key State

| State | Purpose |
|-------|---------|
| `playlistName` | Current name in input |
| `playlistEntries` | Current entries (with temp- or backend entryIds) |
| `snapshotRef` | Initial state for computing diff |
| `createdPlaylistId` | Set after creating new playlist |
| `isSaving` | Save in progress |

### hasChanges Computation

Computed dynamically (not stored) by comparing current state to snapshot:
- Name differs from snapshot
- Entry count differs
- Any temp entries exist
- Entry order changed

## Playback Queue Sync

When the editor entries change and a song from the editor is playing:
1. Update `playbackQueueAtom` with new entries
2. Update `currentQueueIndex` to match new position of playing entry

This ensures prev/next navigation works correctly during editing.

## Accessibility

- Input has visually hidden label
- Error messages have `role="alert"`
- Loading state has `role="status"` and `aria-busy`
- All buttons have visible focus styles
- Save button disabled when no changes
