# DECISIONS.md

This file records explicit architectural and product decisions.
Entries in this file are authoritative and must not be changed without a new task.

---

## D-001 – Suno callback endpoint
Status: Resolved

Decision:
The backend uses polling only for Suno job status updates.
The `callBackUrl` parameter is required by the Suno API but uses a dummy URL.

Rationale:
- The Suno API requires `callBackUrl` as a mandatory field
- The backend uses polling with WebSocket updates, so the callback is not used
- A dummy URL is acceptable since the callback endpoint is never invoked

---

## D-002 – Socket.IO event scope
Status: Accepted

Decision:
All Socket.IO updates related to Suno job status are broadcast to all connected clients.
This behavior is currently accepted and is not considered a bug.

No user-level scoping or session isolation is implemented at this time.

---

## D-003 – GPT model version
Status: Resolved

Decision:
The backend uses `gpt-5.2` for lyrics generation.
This model is verified as valid and available in the OpenAI Chat Completions API.

Decision:
The backend uses the OpenAI Responses API.
The model `gpt-5.2` requires `max_completion_tokens` instead of `max_tokens`.
This parameter is now considered part of the locked API contract.

Rationale:
- OpenAI documentation confirms `gpt-5.2` is the current GPT-5.2 Thinking model identifier
- The model is available to all API developers
- No change required; the existing model identifier is correct and locked

---

## D-004 – Song title behavior
Status: Superseded by D-010

---

## D-005 – Identifier generation
Status: Accepted

Decision:
Client-side identifiers for history entries are generated using `Date.now()`.
While theoretical collision risk exists, this approach is accepted for now.

No change is planned unless user-visible issues arise.

---

## D-006 – Suno audio URL source
Status: Accepted

Decision:
The backend uses `sourceAudioUrl` (direct Suno CDN) instead of `audioUrl` (proxy).

Rationale:
- `audioUrl` points to `musicfile.api.box`, a third-party proxy with reliability issues
- `sourceAudioUrl` points to `cdn1.suno.ai`, Suno's own CDN, which is stable
- URLs expire after 15 days per Suno documentation; local storage may be considered later

## D-007 – Lyrics truncation scope
Status: Superseded by D-013

---

## D-008 – Local MP3 storage
Status: Accepted

Decision:
Downloaded Suno audio files are stored locally in `backend/mp3s/`.
Files are downloaded when job status reaches `completed`.
Files are named `{jobId}_{index}.mp3` for traceability.

Rationale:
- Suno CDN URLs expire after 15 days
- Local storage ensures permanent access to generated songs
- Directory is gitignored to avoid committing large binary files

---

## D-009 – Local audio URL preference
Status: Accepted

Decision:
Frontend prefers local audio URLs (`/mp3s/{jobId}_{index}.mp3`) over CDN URLs when available.
CDN URLs remain as fallback for backwards compatibility.

Rationale:
- Local files do not expire, unlike Suno CDN URLs (15-day limit)
- Backend serves static files from `backend/mp3s/` via `/mp3s/*` route
- Fallback ensures audio remains playable during transition or if download fails

---

## D-010 – User-defined song title
Status: Accepted

Decision:
Users must provide a song title before generating music with Suno.
The "Generer Sang med Suno" button is disabled until title is filled in.

Rationale:
- Title is required by the Suno API
- Mandatory input ensures intentional, meaningful song names

---

## D-011 – Suno generation spinner
Status: Accepted

Decision:
The "Generer Sang med Suno" button shows a spinner and remains disabled from click until job status reaches "completed" or "failed".

Rationale:
- Prevents duplicate submissions
- Provides clear visual feedback during long-running generation (up to 5 minutes)

---

## D-012 – History entry per Suno generation
Status: Accepted

Decision:
Each Suno song generation creates a new history entry.
Duplicate lyrics across history entries are allowed and preserved.

Rationale:
- Simplifies logic by avoiding matching/updating existing entries
- Allows users to generate multiple songs from the same lyrics
- Each generation has unique title, jobId, and audio results

---

## D-013 – Lyrics truncation in non-custom mode only
Status: Accepted

Decision:
Lyrics truncation to 500 characters applies only in non-custom mode.
When genre is provided (custom mode), full lyrics are sent to Suno.

Rationale:
- Suno API limitation of 500 chars only applies to non-custom mode
- Custom mode supports longer lyrics for full song generation
