# SPEC.md

## Product Overview

"Sangtekst Generator" is a web application that generates song lyrics using ChatGPT and creates music from those lyrics using the Suno API.

---

## User-Visible Features

### 1. Generate Lyrics

**Flow**:

1. User enters a text prompt describing the desired song (e.g., "En sang om sommer")
2. User clicks "Generer Tekst" button
3. System sends prompt to backend → OpenAI API
4. Generated lyrics appear in the text area
5. A new history entry is created

**Constraints**:

- Prompt must be non-empty
- Loading state shown during generation

### 2. Edit Lyrics

**Flow**:

1. User modifies the generated lyrics directly in the text area
2. Changes are local only (not saved until song generation)

### 3. Set Genre (Optional)

**Flow**:

1. User enters a genre/style in the genre input field
2. Genre is sent to Suno when generating music
3. Enables Suno "custom mode" for more control

### 4. Generate Song with Suno

**Flow**:

1. User clicks "Generer Sang med Suno" button
2. System sends lyrics (and optional genre) to backend → Suno API
3. Loading state shown during submission
4. History item is updated with job ID and "pending" status
5. Backend polls Suno and pushes status updates via WebSocket
6. When complete, audio URLs appear in the history item

**Constraints**:

- Lyrics must be non-empty
- Lyrics truncated to 500 characters (in non-custom mode)
- Generation can take several minutes
- Suno generates 2 song variations

**Note:** Suno allocates all song variations upfront; individual track fields such as `audioUrl` are populated asynchronously and may change without any change in job status. Clients must react to payload changes, not only status transitions.


### 5. View History

**Flow**:

1. All generated lyrics appear in a scrollable history list
2. Each item shows: prompt, lyrics, timestamp
3. Items with Suno jobs show generation status
4. Completed items have playable audio

### 6. Provide Feedback

**Flow**:

1. User clicks thumbs up or thumbs down on a history item
2. Feedback is saved to localStorage
3. Visual indicator shows selected feedback

**Values**: `up` | `down` | (none)

### 7. Reuse Previous Lyrics

**Flow**:

1. User clicks "Gjenbruk" on a history item
2. The lyrics are loaded into the text area
3. Page scrolls to top

### 8. Play Generated Audio

**Flow**:

1. Completed Suno jobs display audio player(s)
2. User can play generated songs directly in the browser

---

## Data Persistence

### Location

All data is stored in the browser's `localStorage`.

### Storage Key

`sangtekst_history`

### Data Structure (HistoryItem)

```typescript
interface HistoryItem {
  id: string;                    // Unique ID (timestamp-based)
  prompt: string;                // Original user prompt
  lyrics: string;                // Generated or edited lyrics
  createdAt: string;             // ISO 8601 timestamp
  feedback?: 'up' | 'down';      // User feedback
  sunoJobId?: string;            // Suno task ID
  sunoStatus?: 'pending' | 'partial' | 'completed' | 'failed';
  sunoAudioUrls?: string[];      // Array of generated audio URLs
  genre?: string;                // User-specified genre
  sunoAudioUrl?: string;         // Legacy field (migrated to sunoAudioUrls)
}
```

### Limits

- Maximum 100 history items stored
- Older items are dropped when limit is exceeded

### Migration

- Legacy `sunoAudioUrl` (single URL) is automatically migrated to `sunoAudioUrls` (array) on read

---

## Known Limitations

1. **No persistence beyond browser**: History is lost if localStorage is cleared
2. **No cross-device sync**: Data is local to the browser
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

3. **Genre without title**: When genre is provided to Suno, title defaults to "Untitled" if not specified. Users cannot currently set a title via the UI.

4. **History item update logic**: When generating a song, the system attempts to update the latest history item if the lyrics match. If not, it creates a new item with prompt "Generert direkte". This could lead to unexpected behavior if user edits lyrics before generating.
