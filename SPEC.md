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

### 1. Generate Lyrics

**Flow**:

1. User enters a text prompt describing the desired song (e.g., "En sang om sommer")
2. User clicks "Generer Tekst" button
3. System sends prompt to backend → OpenAI API
4. Generated lyrics appear in the text area

**Constraints**:

- Prompt must be non-empty
- Loading state shown during generation

### 2. Edit Lyrics

**Flow**:

1. User modifies the generated lyrics directly in the text area
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

**Storage**: `sangtekst_genre_history` (array of strings, max 50)

### 3.5. Set Title (Required for Suno)

**Flow**:

1. User enters a song title in the title input field
2. Title is sent to Suno when generating music

**Constraints**:

- Title is required before generating a song with Suno
- "Generer Sang med Suno" button is disabled until title is provided

### 4. Generate Song with Suno

**Flow**:

1. User clicks "Generer Sang med Suno" button
2. Button shows spinner and is disabled during generation
3. System sends title, lyrics (and optional genre) to backend → Suno API
4. History item is updated with job ID and "pending" status
5. Backend polls Suno and pushes status updates via WebSocket
6. When complete, spinner stops and audio URLs appear in the history item

**Constraints**:

- Title must be non-empty
- Lyrics must be non-empty
- Lyrics truncated to 500 characters (only when genre is not provided)
- Generation can take several minutes
- Suno generates 2 song variations, each stored as a separate history item
- Button remains disabled with spinner until both variations are "completed" or "failed"

**Note:** Suno allocates all song variations upfront; individual track fields such as `audioUrl` are populated asynchronously and may change without any change in job status. Clients must react to payload changes, not only status transitions.


### 5. View Song History

**Flow**:

1. Songs appear in a compact scrollable list in the right panel
2. Each item represents one song (Suno generates 2 variations per request, each becomes a separate item)
3. Each item shows: title, status badge (only for non-completed), timestamp (dd.MM.yyyy HH:mm), audio player (if completed)
4. Lyrics are not displayed in the list (use "Gjenbruk" to view)
5. Completed items have inline audio player
6. Filter bar at top with "Default", "Liked", "All" options
7. Each item has a trashcan delete button

**Filtering**:
- Default (initial): Shows everything except items with feedback = 'down'
- Liked: Shows only items with feedback = 'up'
- All: Shows everything including disliked items

**Deletion**:
- History item delete removes that song entry from localStorage
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
6. Deselecting resets left panel to "new draft" state with only ChatGPT prompt visible

**States**:
- **New draft state**: Only ChatGPT prompt input is visible; title, lyrics, genre fields are hidden or empty
- **Read-only state**: All fields displayed but not editable; shows the selected song's complete state; includes "Kopier" button

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
| variation_index | INTEGER | 0 or 1 |

**genre_history**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment |
| genre | TEXT UNIQUE NOT NULL | Genre name |
| last_used_at | TEXT NOT NULL | ISO 8601 timestamp |

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


