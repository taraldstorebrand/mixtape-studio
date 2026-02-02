# SPEC.md

## Product Overview

"Sangtekst Generator" is a web application that generates song lyrics using ChatGPT and creates music from those lyrics using the Suno API.

---

## Layout

The application uses a two-panel resizable layout:
- **Left panel**: All generation controls (prompt input, lyrics editor, title/genre fields, buttons)
- **Right panel**: Compact song history list
- **Resize handle**: Draggable divider between panels (30-70% width range)
- **Responsive**: Stacks vertically on screens < 768px

Panel width is persisted to localStorage (`sangtekst_panel_width`).

---

## User-Visible Features

### 1. Write or Generate Lyrics

**Flow (Manual)**:

1. User writes lyrics directly in the lyrics textarea
2. Lyrics textarea is always visible and editable

**Flow (AI-Assisted)**:

1. User enables "Bruk AI til å generere tekst" toggle (default: OFF)
2. AI prompt input and "Generer tekst" button appear
3. User enters a text prompt describing the desired song (e.g., "En sang om sommer")
4. User clicks "Generer tekst" button
5. System sends prompt to backend → OpenAI API
6. Generated lyrics appear in the text area

**Constraints**:

- AI toggle defaults to OFF (UX-014)
- When AI is disabled, prompt input and generate button are hidden
- Lyrics textarea is always visible regardless of AI toggle state
- Loading state shown during AI generation

### 2. Edit Lyrics

**Flow**:

1. User modifies lyrics directly in the text area (whether written manually or AI-generated)
2. Changes are local only (not saved until song generation)

### 3. Set Genre (Optional)

**Flow**:

1. User types in the genre input field
2. Dropdown appears with matching genres from history
3. User can select from dropdown (arrow keys + Enter) or type a new value
4. New genres are saved to history on use
5. User can remove saved genres via × button on dropdown options (does not select)
6. Genre is sent to Suno when generating music
7. Enables Suno "custom mode" for more control

**Keyboard**:
- Arrow Up/Down: Navigate dropdown options
- Enter: Select highlighted option
- Escape: Close dropdown

**Storage**: SQLite `genre_history` table (max 50 genres)

### 3.5. Set Title (Required for Suno)

**Flow**:

1. User enters a song title in the title input field
2. Title is sent to Suno when generating music

**Constraints**:

- Title is required before generating a song with Suno
- "Generer Sang med Suno" button is disabled until title is provided

### 4. Generate Song with Suno

**Flow**:

1. User clicks "Generer sang" button (primary action at top of left panel, UX-015)
2. Button shows spinner and is disabled during generation
3. System sends title, lyrics (and optional genre) to backend → Suno API
4. History item is updated with job ID and "pending" status
5. Backend polls Suno and pushes status updates via WebSocket
6. When complete, spinner stops and audio URLs appear in the history item

**Constraints**:

- Title must be non-empty
- Lyrics must be non-empty
- Button is disabled until both title and lyrics are filled (UX-015)
- Button is positioned at the top of the left panel and remains visible (sticky)
- Lyrics truncated to 500 characters (only when genre is not provided)
- Generation can take several minutes
- Suno generates 2 song variations, each stored as a separate history item
- Button remains disabled with spinner until both variations are "completed" or "failed"

**Note:** Suno allocates all song variations upfront; individual track fields such as `audioUrl` are populated asynchronously and may change without any change in job status. Clients must react to payload changes, not only status transitions.


### 5. View Song History

**Flow**:

1. Songs appear in a compact scrollable list in the right panel
2. Each item represents one song (Suno generates 2 variations per request, each becomes a separate item)
3. Each item shows: cover image thumbnail (if available), title, status badge (only for non-completed), timestamp (dd.MM.yyyy HH:mm), audio player (if completed)
4. Lyrics are not displayed in the list (use "Gjenbruk" to view)
5. Completed items have inline audio player
6. Filter bar at top with "Default", "Liked", "All" options
7. Each item has a trashcan delete button
8. "Lag mixtape av likte sanger" button at top creates downloadable MP3 from all liked songs

**Filtering**:
- Default (initial): Shows everything except items with feedback = 'down'
- Liked: Shows only items with feedback = 'up'
- All: Shows everything including disliked items

**Deletion**:
- History item delete removes that song entry from database
- Backend also deletes the associated MP3 file from `backend/mp3s/` if it exists
- Each variation can be deleted independently

**Storage rules**:
- Only Suno song generations create history entries (not ChatGPT lyrics alone)
- History entry is created when Suno generation starts (status: pending)
- Failed generations are automatically removed from history
- This allows viewing status and accessing partial results during generation

### 6. Provide Feedback

**Flow**:

1. User clicks thumbs up or thumbs down on a history item
2. Feedback is saved to localStorage
3. Visual indicator shows selected feedback

**Values**: `up` | `down` | (none)

### 7. Select Song from History

**Flow**:

1. User clicks on a history item (anywhere on the item)
2. The item becomes selected and highlighted
3. Left panel switches to read-only mode showing all saved fields (title, lyrics, genre, prompt)
4. Audio players and status remain visible in the history item
5. Clicking the same item again deselects it
6. Deselecting resets left panel to "new draft" state with empty editor fields

**States**:
- **New draft state**: Primary "Generer sang" button at top (sticky), then title/lyrics/genre fields, then AI assistance toggle (collapsed by default). User can write lyrics directly or enable AI toggle to generate via ChatGPT (UX-014, UX-015, UX-016). A "Nytt utkast" button appears when any field has content; clicking it clears all fields (title, lyrics, genre, prompt) and any error messages.
- **Read-only state**: All fields displayed but not editable; shows the selected song's complete state; includes cover image (large, if available) and "Kopier" button

### 8. Copy Song as New Draft

**Flow**:

1. User clicks "Kopier" button in the read-only view (left panel)
2. Values (prompt, title, lyrics, genre) are copied to a new editable draft
3. The history item is deselected
4. Left panel switches to edit mode with the copied values

### 9. Play Generated Audio

**Flow**:

1. Completed Suno jobs display audio player(s)
2. User can play generated songs directly in the browser

### 10. Create Mixtape from Liked Songs

**Flow**:

1. User clicks "Lag mixtape av likte sanger" button at the top of the history panel
2. Button shows "Lager mixtape..." and is disabled
3. Backend validates and returns taskId immediately
4. Backend generates mixtape in background to `backend/temp/` (may take time for many songs)
5. When complete, backend sends WebSocket event `mixtape-ready` with `downloadId`
6. Frontend fetches file via `GET /api/mixtape/download/:downloadId`
7. Backend streams file and deletes it immediately after successful download
8. Browser automatically downloads the M4B file with embedded chapters

**Temporary file handling**:

- Mixtape files are stored temporarily in `backend/temp/` (gitignored)
- Files are deleted immediately after frontend downloads them
- Fallback cleanup: Files older than 10 minutes are deleted on server startup and periodically

**Constraints**:

- Button is disabled if no liked songs with local MP3 exist
- Button is disabled while generation is in progress
- Output format: M4B (AAC audio, 256 kbps)
- Each song becomes a chapter with the song title as chapter name
- Chapters are embedded in the file (no external chapter file)
- Returns 400 if no liked songs are found

### 11. Upload MP3 Files

**Flow**:

1. User clicks "Last opp MP3" button in history panel
2. File picker opens, user can select one or multiple MP3 files
3. For each selected file, a title input appears (pre-filled with filename)
4. User can edit titles before uploading
5. User clicks "Last opp" to upload all files
6. Server saves files using sanitized title as filename
7. Each file creates a separate history item with `isUploaded: true`

**Filename rules**:

- Title is sanitized (special characters → `_`)
- If file exists: sequential suffix added (_1.mp3, _2.mp3, etc.)

**Constraints**:

- Maximum 10 files per upload
- Maximum 10 MB per file
- Only MP3 format accepted
- Uploaded songs appear in history and can be liked/disliked
- Uploaded songs are included in mixtape if liked

---

### 12. Now Playing Bar

**Flow**:

1. Clicking play on a song starts playback and shows the now playing bar at the bottom
2. Bar shows: cover image thumbnail, song title, play/pause button, prev/next buttons, progress bar, volume control, feedback buttons
3. Prev button: if >3 seconds into song, restarts; otherwise plays previous song in queue
4. Next button: plays next song in queue
5. Queue wraps around (last → first, first → last)

**Playback queue behavior** (D-052):

- Queue is captured when user starts playback (current filtered list)
- Queue remains stable during filter changes
- Queue resets when user manually selects a new song
- Autoplay advances to next song when current ends
- Playback stops at end of queue (no loop)

---

### 13. Playlists

**Flow**:

1. User clicks PlaylistDropdown to see available playlists
2. Selecting a playlist switches view from library to playlist songs
3. Filter buttons are hidden when viewing a playlist
4. PlaylistActions provides create/edit/delete/return-to-library buttons

**Create/Edit Playlist**:

1. User clicks "+" (create) or edit button
2. Modal opens with PlaylistEditor
3. Left column: SongPicker shows all available songs
4. Right column: Current playlist with drag-and-drop reordering
5. User can add songs (click), remove songs (×), reorder (drag)
6. User enters playlist name
7. Changes are saved on close

**Constraints**:

- Maximum 100 playlists
- Maximum 100 songs per playlist
- Same song can appear multiple times in a playlist
- Deleting a playlist does not delete songs

---

### 14. Advanced Mixtape Editor

**Flow**:

1. User clicks "⚙ Advanced" button next to regular mixtape button
2. Modal opens with MixtapeEditor
3. Left column: SongPicker shows available completed songs
4. Right column: Mixtape tracklist with drag-and-drop reordering
5. User can add songs (click), remove songs (×), reorder (drag)
6. User enters mixtape name (defaults to "Mixtape YYYY-MM-DD")
7. Total duration is displayed
8. User clicks "Lag mixtape" to generate
9. Same backend process as simple mixtape (M4B with chapters)

**Difference from simple mixtape**:

- Simple: all liked songs in chronological order
- Advanced: user-selected songs in user-defined order, duplicates allowed

---

## Data Persistence

### Backend Storage (SQLite)

History items and genre history are persisted server-side in a SQLite database.

**Database file**: `backend/data/sangtekst.db`

#### Tables

**history_items**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Unique ID (timestamp-based) |
| prompt | TEXT NOT NULL | Original user prompt |
| title | TEXT NOT NULL | Song title |
| lyrics | TEXT NOT NULL | Generated or edited lyrics |
| genre | TEXT | User-specified genre |
| created_at | TEXT NOT NULL | ISO 8601 timestamp |
| feedback | TEXT | 'up' or 'down' |
| suno_job_id | TEXT | Suno task ID |
| suno_clip_id | TEXT | Suno clip ID |
| suno_status | TEXT | 'pending', 'completed', or 'failed' |
| suno_audio_url | TEXT | CDN audio URL |
| suno_local_url | TEXT | Local audio URL |
| suno_image_url | TEXT | Suno cover image URL |
| variation_index | INTEGER | 0 or 1 |
| is_uploaded | INTEGER | 1 if manually uploaded, 0 otherwise |
| duration | REAL | Audio duration in seconds |

**genre_history**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment |
| genre | TEXT UNIQUE NOT NULL | Genre name |
| last_used_at | TEXT NOT NULL | ISO 8601 timestamp |

**playlists**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | UUID |
| name | TEXT NOT NULL | Playlist name |
| description | TEXT | Optional description |
| cover_image_url | TEXT | Optional cover image |
| created_at | TEXT NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT NOT NULL | ISO 8601 timestamp |

**playlist_songs**
| Column | Type | Description |
|--------|------|-------------|
| entry_id | TEXT PRIMARY KEY | UUID |
| playlist_id | TEXT NOT NULL | Foreign key to playlists |
| song_id | TEXT NOT NULL | Foreign key to history_items |
| position | INTEGER NOT NULL | Order within playlist |

### Client-Side Storage (localStorage)

UI-related state remains in localStorage:

| Key | Type | Description |
|-----|------|-------------|
| `sangtekst_panel_width` | number | Resizable panel width percentage |

### Limits

- Maximum **10,000** history items stored
- Maximum **50** genres stored in genre history
- Oldest items are removed when limits are exceeded (FIFO)

### Migration

- On first backend connection, existing localStorage data is migrated to SQLite
- localStorage keys `sangtekst_history` and `sangtekst_genre_history` are cleared after migration

---

## Loading States

All long-running operations provide visual feedback to the user.

### Loading Components

**Skeleton Loaders**: Pulsating placeholder content that mimics the shape of the expected result.

**Spinner with Text**: Rotating circle icon with contextual message on buttons that trigger actions.

### Operation-Specific Loading States

| Operation | Duration | Loading UI |
|-----------|----------|------------|
| Tekst-generering (OpenAI) | 2-10 sek | Skeleton lines in lyrics textarea + button spinner with "Genererer tekst..." |
| Sang-generering (Suno) | 1-5 min | Button spinner with "Genererer sang... (1-5 min)" + skeleton in history list for pending items |
| Mixtape-generering | 10-60 sek | Button spinner with "Lager mixtape..." + disabled state |

### Skeleton Loader Specifications

- **Lyrics skeleton**: 4-6 animated horizontal bars of varying width (60-90%) in the textarea area
- **History item skeleton**: Thumbnail placeholder (48×48) + title bar + status badge placeholder
- **Animation**: CSS pulse animation (opacity 0.4 → 1.0, 1.5s duration, infinite)

### Button States During Loading

- Disabled (no hover effects)
- Shows spinner icon (CSS animated rotate)
- Text changes to action-specific message
- For Suno: includes estimated time range

---

## Known Limitations

1. **Single-device storage**: SQLite database is local to the server; no cloud sync
2. **No cross-device sync**: Data is stored on the server, but no sync to external services
3. **No authentication**: Anyone with access to the app can use it
4. **Single user**: No concept of user accounts or separate histories
5. **No offline support**: Requires network connection for all features
6. **Broadcast updates**: All connected clients receive all Suno status updates (not filtered by user/job)
7. **Lyrics length limit**: Suno non-custom mode limits lyrics to 500 characters
8. **No editing after generation**: Once a song is submitted to Suno, the lyrics cannot be changed for that job
9. **API key required**: Backend requires valid OpenAI and Suno API keys to function

---

## Ambiguities / Undocumented Behavior

1. **ID generation**: History item IDs are generated using `Date.now().toString()` which could theoretically cause collisions if two items are created in the same millisecond.

2. **Error handling for WebSocket**: Behavior when WebSocket disconnects during Suno polling is not explicitly handled in the frontend.


