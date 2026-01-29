# API.md

## Base URL

- Development: `http://localhost:3001`

---

## REST Endpoints

### GET /health

Health check endpoint.

**Response**

```json
{ "status": "ok" }
```

---

## History Endpoints

### GET /api/history

Fetch all history items.

**Success Response (200)**

```json
[
  {
    "id": "string",
    "prompt": "string",
    "title": "string",
    "lyrics": "string",
    "genre": "string (optional)",
    "createdAt": "string (ISO date)",
    "feedback": "up" | "down" | null,
    "sunoJobId": "string (optional)",
    "sunoClipId": "string (optional)",
    "sunoStatus": "pending" | "completed" | "failed" | null,
    "sunoAudioUrl": "string (optional)",
    "sunoLocalUrl": "string (optional)",
    "sunoImageUrl": "string (optional)",
    "variationIndex": 0 | 1 | null
  }
]
```

---

### POST /api/history

Create a new history item.

**Request Body**

```json
{
  "id": "string (required)",
  "prompt": "string (required)",
  "title": "string (required)",
  "lyrics": "string (required)",
  "createdAt": "string (required, ISO date)",
  "genre": "string (optional)",
  "feedback": "up" | "down" (optional),
  "sunoJobId": "string (optional)",
  "sunoClipId": "string (optional)",
  "sunoStatus": "pending" | "completed" | "failed" (optional),
  "sunoAudioUrl": "string (optional)",
  "sunoLocalUrl": "string (optional)",
  "sunoImageUrl": "string (optional)",
  "variationIndex": 0 | 1 (optional)
}
```

**Success Response (201)**

```json
{ "success": true, "id": "string" }
```

**Error Response (400)**

```json
{ "error": "Missing required fields: id, prompt, title, lyrics, createdAt" }
```

---

### PATCH /api/history/:id

Update a history item.

**Path Parameters**

- `id`: string (required) - The history item ID

**Request Body**

```json
{
  "feedback": "up" | "down" | null,
  "sunoStatus": "completed",
  "sunoAudioUrl": "string",
  "sunoLocalUrl": "string"
}
```

Any subset of HistoryItem fields can be provided.

**Success Response (200)**

```json
{ "success": true, "id": "string" }
```

**Error Response (404)**

```json
{ "error": "History item not found" }
```

---

### DELETE /api/history/:id

Delete a history item and its associated MP3 file.

**Path Parameters**

- `id`: string (required) - The history item ID

**Behavior**

- Deletes the history item from the database
- If the item has a `sunoLocalUrl`, deletes the corresponding MP3 file from `backend/mp3s/`
- If the item has a `sunoImageUrl` (not placeholder), deletes the corresponding image file from `backend/images/`
- File deletion failures are logged but do not cause the request to fail

**Success Response (200)**

```json
{ "success": true, "id": "string" }
```

**Error Response (404)**

```json
{ "error": "History item not found" }
```

---

## Genre Endpoints

### GET /api/genres

Fetch all genres (sorted by most recently used).

**Success Response (200)**

```json
["Pop", "Rock", "Jazz", "Electronic"]
```

---

### POST /api/genres

Add or update a genre (updates last_used_at if exists).

**Request Body**

```json
{ "genre": "string (required, non-empty)" }
```

**Success Response (201)**

```json
{ "success": true, "genre": "Pop" }
```

**Error Response (400)**

```json
{ "error": "Genre is required and must be a non-empty string" }
```

---

### DELETE /api/genres/:genre

Remove a genre from history.

**Path Parameters**

- `genre`: string (required, URL-encoded) - The genre to remove

**Success Response (200)**

```json
{ "success": true, "genre": "Pop" }
```

---

## Config Status Endpoints

### GET /api/config-status

Check if API keys are configured.

**Success Response (200)**

```json
{
  "openai": true,
  "suno": true
}
```

**Notes**:

- Returns `true` if the respective API key is set, `false` otherwise
- Used by frontend to show warnings if APIs are not configured

---

## ChatGPT Endpoints

### POST /api/chatgpt/generate-lyrics

Generate song lyrics using OpenAI GPT.

**Request Body**

```json
{
  "prompt": "string (required, non-empty)"
}
```

**Success Response (200)**

```json
{
  "lyrics": "string"
}
```

**Error Response (400)**

```json
{
  "error": "Prompt er påkrevd og må være en ikke-tom streng"
}
```

**Error Response (500)**

```json
{
  "error": "string (error message)"
}
```

---

### POST /api/suno/generate

Submit lyrics for music generation via Suno API.

**Request Body**

```json
{
  "lyrics": "string (required, non-empty, max 500 chars in non-custom mode)",
  "title": "string (required - song title)",
  "genre": "string (optional - enables custom mode when provided)"
}
```

**Success Response (200)**

```json
{
  "jobId": "string (Suno taskId)",
  "status": "PENDING"
}
```

**Error Response (400)**

```json
{
  "error": "Lyrics er påkrevd og må være en ikke-tom streng"
}
```

**Error Response (500)**

```json
{
  "error": "string (error message)"
}
```

**Notes**:

- When `genre` is provided, Suno custom mode is enabled
- Lyrics are truncated to 500 characters in non-custom mode
- Backend starts polling Suno for status and pushes updates via WebSocket

---

### GET /api/suno/status/:jobId

Get status of a Suno music generation job.

**Path Parameters**

- `jobId`: string (required) - The Suno task ID

**Success Response (200)**

```json
{
  "status": "pending" | "partial" | "completed" | "failed",
  "audio_urls": ["string"] (optional, present when audio is ready),
  "error": "string" (optional, present on failure)
}
```

**Status Values**:

- `pending` - Job is queued or generating
- `partial` - First song is ready (Suno generates 2 variations)
- `completed` - All songs are ready
- `failed` - Generation failed

**Error Response (400)**

```json
{
  "error": "Job ID er påkrevd"
}
```

**Error Response (500)**

```json
{
  "error": "string (error message)"
}
```

---

## WebSocket Events (Socket.IO)

### Connection

Frontend connects to the same origin as the backend.

### Event: `suno-update`

Server pushes Suno job status updates to clients.

**Payload**

```json
{
  "jobId": "string",
  "status": "pending" | "partial" | "completed" | "failed",
  "audio_urls": ["string"] (optional),
  "image_urls": ["string"] (optional),
  "error": "string" (optional)
}
```

**Notes**:

- Backend polls Suno every 5 seconds for up to 10 minutes (120 attempts)
- Updates are broadcast to all connected clients
- `image_urls` contains Suno-generated cover art URLs for each track

---

### Event: `mixtape-ready`

Server notifies clients when mixtape generation is complete.

**Payload (success)**

```json
{
  "taskId": "string",
  "downloadId": "string (unique ID for download endpoint)"
}
```

**Payload (error)**

```json
{
  "taskId": "string",
  "error": "Kunne ikke lage mixtape"
}
```

**Notes**:

- Frontend should match taskId to the pending request
- Frontend fetches file via `GET /api/mixtape/download/:downloadId`
- Backend deletes temp file after successful download

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "string (human-readable error message)"
}
```

In development mode (`NODE_ENV=development`), the error handler also includes a `stack` property.

---

## Mixtape Endpoints

### POST /api/mixtape/liked

Start async mixtape generation from all liked songs (feedback = 'up').

**Behavior**

- Validates that liked songs with local MP3 files exist
- Returns immediately with a taskId
- Generates M4B file with embedded chapters in background
- Emits `mixtape-ready` WebSocket event when complete

**Success Response (200)**

```json
{ "taskId": "1706000000000" }
```

**Error Response (400)**

```json
{ "error": "No liked songs found" }
```

---

### GET /api/mixtape/download/:downloadId

Download a generated mixtape file.

**Path Parameters**

- `downloadId`: string (required) - Unique ID from `mixtape-ready` event

**Success Response (200)**

- Content-Type: `audio/mp4`
- Content-Disposition: `attachment; filename="mixtape_likte_sanger.m4b"`
- Body: M4B file stream

**Behavior**

- Streams the file to client
- Deletes the temp file immediately after successful transfer
- Returns 404 if file not found (expired or already downloaded)

**Error Response (404)**

```json
{ "error": "Fil ikke funnet eller utløpt" }
```

---

## Upload Endpoints

### POST /api/upload

Upload one or more MP3 files and create history items.

**Request Body (multipart/form-data)**

- `files`: MP3 file(s) (max 10 files, max 10 MB each)
- `titles`: JSON array of titles (must match number of files)

**Success Response (201)**

```json
{
  "success": true,
  "items": [
    { "id": "string", "localUrl": "string", "duration": 123.45, "imageUrl": "string" },
    { "id": "string", "localUrl": "string", "duration": 234.56, "imageUrl": "string" }
  ]
}
```

**Error Response (400)**

```json
{ "error": "No files uploaded" }
```

```json
{ "error": "Title count must match file count" }
```

```json
{ "error": "Maximum 10 files per upload" }
```

**Filename behavior**:

- Server uses sanitized title as filename
- If file exists, sequential suffix added (_1.mp3, _2.mp3, etc.)

---

## Implementation Notes

1. **Suno job completion**: The backend uses polling only. No callback endpoint is implemented. The backend polls Suno every 5 seconds and pushes updates to clients via WebSocket.

2. **WebSocket broadcast**: Status updates are broadcast to all connected clients via `io.emit()`. This is accepted behavior (see D-002 in DECISIONS.md).

3. **OpenAI model**: The backend uses `gpt-5.2` (GPT-5.2 Thinking) for lyrics generation.

4. **Mixtape generation**: Uses `ffmpeg-static` for bundled ffmpeg binary, no system ffmpeg required.
