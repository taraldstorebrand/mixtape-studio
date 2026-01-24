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
  "error": "string" (optional)
}
```

**Notes**:

- Backend polls Suno every 5 seconds for up to 5 minutes (60 attempts)
- Updates are broadcast to all connected clients

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

## Implementation Notes

1. **Suno job completion**: The backend uses polling only. No callback endpoint is implemented. The backend polls Suno every 5 seconds and pushes updates to clients via WebSocket.

2. **WebSocket broadcast**: Status updates are broadcast to all connected clients via `io.emit()`. This is accepted behavior (see D-002 in DECISIONS.md).

3. **OpenAI model**: The backend uses `gpt-5.2` (GPT-5.2 Thinking) for lyrics generation.
