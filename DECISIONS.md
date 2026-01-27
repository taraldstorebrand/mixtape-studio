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
The backend uses `gpt-5.2` via the OpenAI Chat Completions API.
The parameter `max_completion_tokens` is used (not `max_tokens`).
This is part of the locked API contract.

Rationale:
- OpenAI Chat Completions API is the chosen integration
- `gpt-5.2` requires `max_completion_tokens` parameter
- The model identifier and API choice are locked

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
Status: Superseded by D-014

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

---

## D-014 – MP3 filename format
Status: Accepted

Decision:
Downloaded MP3 files are named `{title}_{index}.mp3` with unique sequential index.
Index continues from existing files (e.g., if sang_1.mp3 and sang_2.mp3 exist, next becomes sang_3.mp3).
Title is sanitized: special characters replaced with `_`.
Files are stored in `backend/mp3s/` (gitignored).

Rationale:
- Title-based names are more meaningful than jobId
- Sequential numbering avoids overwriting existing files
- Sanitizing ensures filesystem compatibility

---

## D-015 – Two-panel resizable layout
Status: Accepted

Decision:
The UI uses a left/right two-panel layout with a draggable resize handle.
Left panel contains all generation inputs (prompt, lyrics, title, genre, buttons).
Right panel shows a compact song list without lyrics display.
Panel width is persisted to localStorage.

Rationale:
- Separates input controls from output/history for clearer workflow
- Compact song list allows viewing more items at once
- Resizable panels let users optimize for their screen size
- Lyrics remain accessible via "Gjenbruk" button when needed

---

## D-016 – Genre field with searchable history
Status: Accepted

Decision:
The genre input field is replaced with a searchable, creatable dropdown using react-select.
Previously used genres are stored in localStorage (`sangtekst_genre_history`, max 50 items).
Users can type new values or select from history. Each option has a remove button.

Rationale:
- Improves UX by providing quick access to previously used genres
- Creatable dropdown allows both selection and free-text entry
- localStorage persistence maintains history across sessions
- Remove functionality keeps the list manageable

---

## D-017 – Shared types usage
Status: Accepted

Decision:
Both frontend and backend MUST import types from `shared/types/index.ts`.
No duplicate type definitions are allowed in frontend/ or backend/.

Rationale:
- Single source of truth for data structures
- Prevents drift between frontend and backend types

---

## D-018 – Suno polling configuration
Status: Accepted

Decision:
Backend polls Suno API every 5 seconds with a maximum timeout of 5 minutes.
These values are implementation constants, not configurable at runtime.

Rationale:
- 5-second interval balances responsiveness with API rate limits
- 5-minute timeout covers Suno's typical generation time

---

## D-019 – WebSocket disconnect handling
Status: Accepted

Decision:
Frontend does not implement automatic WebSocket reconnection.
If WebSocket disconnects during Suno polling, user must refresh the page.
No error message is shown to the user on disconnect.

Rationale:
- Simplifies implementation for MVP
- Suno status can be recovered by refreshing the page

---

## D-020 – History item limit
Status: Accepted (Updated by D-042)

Decision:
Maximum **10,000** history items are stored in the database.
When limit is exceeded, the oldest items are removed first (FIFO).

Rationale:
- SQLite handles larger datasets than localStorage
- 10,000 items provides ample history for typical usage
- FIFO ensures recent work is preserved

---

## D-021 – Genre history limit
Status: Accepted

Decision:
Maximum 50 genres are stored in localStorage (`sangtekst_genre_history`).
When limit is exceeded, the oldest entries are removed first (FIFO).

Rationale:
- Keeps dropdown list manageable
- Consistent with history item limit behavior (FIFO)

---

## D-022 – localStorage key naming
Status: Accepted

Decision:
All localStorage keys use prefix `sangtekst_` followed by snake_case identifier.
Canonical keys:
- `sangtekst_history` – song history items
- `sangtekst_genre_history` – genre dropdown history
- `sangtekst_panel_width` – resizable panel width

Rationale:
- Consistent naming prevents key collisions
- Prefix isolates app data from other localStorage users

---

## D-023 – HTTP error display
Status: Accepted

Decision:
Frontend displays API errors as inline text below the relevant button.
Error message shows the server's error text if available, otherwise a generic message.
Errors are cleared when user initiates a new request.

Rationale:
- Inline errors are visible without interrupting workflow
- Clears automatically to avoid stale error states

---

## D-024 – ID collision risk
Status: Accepted

Decision:
The theoretical risk of `Date.now()` ID collisions is ignored.
No collision detection or handling is implemented.

Rationale:
- Probability is nearly zero (requires two items in same millisecond)
- Not worth added complexity for MVP

---

## D-025 – Suno "partial" status definition
Status: Superseded by D-041

---

## D-026 – Genre string handling
Status: Accepted

Decision:
Genre strings are stored and sent to Suno as-is without sanitization.
No character restrictions apply to genre input.

Rationale:
- Suno API accepts free-text genre descriptions
- No filesystem interaction requires sanitization

---

## D-027 – Backend utils folder purpose
Status: Accepted

Decision:
The `backend/src/utils/` folder contains shared utility functions.
Currently contains `logger.ts` – a simple console logger with timestamps.
No external logging libraries are used.

Rationale:
- Centralizes logging format for consistency
- Avoids third-party logging dependencies for MVP

---

## D-028 – Vite proxy routes
Status: Accepted

Decision:
Vite dev server proxies the following paths to backend (localhost:3001):
- `/api/*` – REST API endpoints
- `/mp3s/*` – Static audio files
- `/socket.io` – WebSocket connection

New backend routes must use `/api/` prefix. No other proxy paths are added without updating this decision.

Rationale:
- Clear separation between frontend and backend routes
- Prevents accidental route conflicts

---

## D-029 – History only for Suno generations
Status: Accepted

Decision:
History entries are only created for Suno song generations, not for ChatGPT lyrics generation alone.
History entry is created when Suno generation starts (pending status).
Failed Suno generations are automatically removed from history.

Rationale:
- History should represent completed or in-progress songs, not intermediate text generation
- Pending entries allow users to see status and access partial results during generation
- Removing failed entries keeps history clean and focused on successful outputs

---

## D-030 – History filtering
Status: Accepted

Decision:
The right panel includes a filter bar with three options: "Default", "Liked", "All".
- Default: Shows all items except those with `feedback: 'down'`
- Liked: Shows only items with `feedback: 'up'`
- All: Shows all items including disliked
Default filter is "Default".

Rationale:
- Allows users to focus on preferred content
- Disliked items are hidden by default but recoverable via "All" filter

---

## D-031 – Delete history items
Status: Accepted (Updated by D-041)

Decision:
Each history item displays a trashcan icon button to delete that item.
Deletions are immediate with no confirmation dialog.

Rationale:
- Gives users full control over their history
- Each item represents one song, so no track-level deletion needed
- No confirmation for MVP simplicity

---

## D-032 – Thumb button styling and toggle behavior
Status: Accepted

Decision:
Thumb buttons use 👍 and 👎 emoji symbols instead of "+" and "-".
Unselected state: grayscale filter (100%) with 50% opacity for faded/outline appearance.
Selected state: full color with no filter for filled appearance.
Toggle behavior: clicking a selected thumb deselects it (sets feedback to null).
Clicking the opposite thumb automatically switches selection.

Rationale:
- Emoji symbols are more intuitive than text characters
- Visual distinction between selected/unselected improves usability
- Toggle behavior allows users to undo accidental clicks
- Switching logic prevents conflicting up+down states

---

## D-033 – Lyrics editor and prompt input styling
Status: Accepted

Decision:
Lyrics are displayed in an editable, editor-style text area styled as content (not raw textarea appearance).
ChatGPT prompt uses a small multiline textarea for input.
Song title is a clear, editable input field visually associated with the lyrics editor.

Rationale:
- Editor-style lyrics area improves readability and content feel
- Multiline prompt textarea allows better visibility for longer prompts
- Distinct styling for title/lyrics/prompt clarifies input purpose

---

## D-034 – Dark theme consistency
Status: Accepted

Decision:
The application uses a dark theme exclusively. Light mode is disabled.
All surfaces use dark/tinted backgrounds (#242424 base, #1a1a1f header) instead of pure white.
The `prefers-color-scheme: light` media query is removed.

Rationale:
- Dark UI is the design direction for this application
- Consistent dark surfaces improve visual cohesion
- Removing light mode prevents jarring white surfaces on any system preference

---

## D-035 – Song selection and draft state restoration
Status: Accepted (Updated by D-044)

Decision:
Clicking a history item selects it and displays its complete state in read-only mode in the left panel.
Clicking the already-selected item deselects it and resets the left panel to "new draft" state.
"New draft" state shows all editor fields (prompt, title, lyrics, genre, generate button) with empty values.
Read-only view includes a "Kopier" button to create an editable copy (replaces the "Gjenbruk" button on history items).
History items store complete draft state (prompt, title, lyrics, genre) to enable full restoration on selection.

Rationale:
- Selection provides quick preview of past work without modifying current draft
- Toggle deselection allows easy return to blank slate for new content
- "Kopier" in read-only view is more intuitive than "Gjenbruk" on compact history items
- Complete state storage ensures no data loss when viewing history
- Read-only mode prevents accidental modification of historical entries

---

## D-036 – Custom GenreInput component
Status: Accepted

Decision:
The genre input field uses a custom `GenreInput` component built with native `<input>` and controlled dropdown.
No external select/combobox libraries (react-select, etc.) are used.
Component behavior:
- User can type freely (creatable)
- Dropdown shows matching items from genre history
- Arrow Up/Down navigate options, Enter selects, Escape closes
- Each dropdown option has a remove (×) button that removes the genre without selecting it

Rationale:
- Reduces bundle size by eliminating react-select dependency
- Simpler implementation with native elements
- Full control over styling and behavior
- Avoids react-select's complex API and styling overrides

---

## D-037 – App.tsx component extraction
Status: Superseded by D-038

---

## D-038 – DetailPanel owns editor draft state
Status: Accepted

Decision:
DetailPanel owns all editor draft state and logic internally:
- State: lyrics, title, genre, prompt, isLoading, isGeneratingSong, error
- Handlers: generateLyrics, generateSong, copy-from-history
- DetailPanel exposes an imperative handle (`notifySongGenerationComplete`) for App to notify when Suno generation completes or fails

App.tsx props to DetailPanel are reduced to:
- selectedItem, genreHistory, onAddHistoryItem, onAddGenre, onRemoveGenre, onClearSelection

HistoryPanel remains focused on immutable history concerns (list, selection, feedback, deletion).
App.tsx is a thin orchestrator: manages history, genre history, selection, Suno socket updates, and layout.

Rationale:
- Co-locates editor state with the component that uses it
- Reduces prop drilling and simplifies App.tsx
- Clearer separation: DetailPanel = editor, HistoryPanel = history, App = orchestration
- Imperative handle is minimal surface for cross-component communication (Suno completion)

---

## D-039 – Jotai for shared application state
Status: Accepted

Decision:
Jotai is used for shared application state that needs to be accessed across multiple components:
- `historyAtom` – history items list (synced with localStorage)
- `selectedItemIdAtom` – currently selected item ID
- `selectedItemAtom` – derived atom for selected item
- `isGeneratingSongAtom` – song generation lifecycle state
- `genreHistoryAtom` – genre history list (synced with localStorage)

Editor draft state (lyrics, title, genre, prompt, isLoading, error) remains local in DetailPanel.
Visual UI state (panel width, dragging, filter) remains local in components/hooks.

Rationale:
- Jotai provides simple, minimal API for shared state without boilerplate
- Atoms are granular and composable, avoiding unnecessary re-renders
- Shared state enables components to react to changes without prop drilling
- Local state for editor drafts keeps component self-contained
- Clear separation: Jotai = shared/cross-component, useState = local/component-specific

---

## D-040 – Jotai atom initialization without side effects
Status: Accepted

Decision:
Jotai atoms are initialized with empty/default values. Side effects (localStorage reads, service calls) are performed in hook wrappers using `useEffect` on mount.
- `historyAtom` initializes as `[]`, loaded via `useEffect` in `useHistoryAtom`
- `genreHistoryAtom` initializes as `[]`, loaded via `useEffect` in `useGenreHistoryAtom`
- `songGenerationStatusAtom` replaces `isGeneratingSongAtom` with semantic status: `'idle' | 'pending' | 'completed' | 'failed'`

Rationale:
- Avoids side effects during module evaluation (atom definition)
- Makes atoms pure and predictable
- Semantic status provides richer state information than boolean
- Explicit initialization in hooks ensures proper React lifecycle integration

---

## D-041 – One history item per song variation
Status: Accepted

Decision:
Each Suno song variation is stored as a separate history item.
When Suno generates 2 variations from one request, 2 history items are created.
Both items share the same `sunoJobId` but have unique `sunoClipId` and `variationIndex`.

Changes from previous model:
- `sunoAudioUrls` (array) → `sunoAudioUrl` (string)
- `sunoLocalUrls` (array) → `sunoLocalUrl` (string)
- `sunoStatus: 'partial'` is removed (each item is either pending, completed, or failed)
- New field `sunoClipId` identifies the specific Suno clip
- New field `variationIndex` (0 or 1) identifies which variation

Rationale:
- Simplifies data model (each item = one song)
- Enables per-song feedback (like/dislike applies to one song, not two)
- Enables per-song deletion without affecting the other variation
- Removes need for track-level delete buttons
- More intuitive mental model for users

---

## D-042 – Backend persistence with SQLite
Status: Accepted

Decision:
History items and genre history are persisted server-side using SQLite.
UI-related state (panel width) remains in localStorage.

Storage locations:
- History items: SQLite `history_items` table
- Genre history: SQLite `genre_history` table
- Panel width: localStorage `sangtekst_panel_width`

No `user_preferences` table is created; UI state stays client-side.

Rationale:
- SQLite provides durable storage not affected by browser cache clearing
- Supports larger datasets (10,000 items vs previous 100)
- Enables future features (backup, export, cross-device sync)
- UI preferences are cosmetic and appropriately stored client-side
- SQLite is simple, file-based, requires no external database server

---

## D-043 – Mixtape from liked songs
Status: Accepted

Decision:
A "Lag mixtape av likte sanger" button creates a downloadable MP3 by concatenating all liked songs.
Backend uses ffmpeg-static (bundled binary) with concat demuxer and -c copy (no re-encoding).
Songs are ordered chronologically (createdAt ASC).

Constraints:
- Only songs with feedback = 'up' and a valid sunoLocalUrl are included
- Returns 400 if no liked songs exist
- No playlist management, no custom ordering, no stored mixtapes

Rationale:
- Simple feature for users to export their favorite songs
- Using ffmpeg-static removes dependency on system-installed ffmpeg
- Concat demuxer with -c copy is fast and preserves audio quality

---

## D-044 – Always-visible editor fields
Status: Accepted

Decision:
All editor fields (title, lyrics textarea, genre, generate button) are always visible in "new draft" state.
Users can write lyrics directly without first generating them via ChatGPT.

Rationale:
- Allows users to manually write or paste lyrics without using ChatGPT
- Simpler UX: no hidden fields that appear conditionally
- ChatGPT prompt remains optional for generating lyrics

---

## D-045 – Mixtape output format with chapters
Status: Accepted

Decision:
Mixtape output uses M4B format (AAC audio with chapter markers) instead of MP3.
Chapters are embedded in the file using ffmpeg metadata, one chapter per song.
Audio is transcoded to AAC at 256 kbps (high quality for archival).
File extension: `.m4b` (recognized as audiobook by iPhone/iOS).

Global metadata embedded in output file:
- title: "Liked Songs – Mixtape"
- album: "Suno and others Mixtape"
- artist: "Tarald"

Technical approach:
- Generate ffmpeg metadata file with chapter start/end times and titles
- Use `-f concat` to combine MP3 inputs
- Transcode to AAC: `-c:a aac -b:a 256k`
- Embed chapters: `-i metadata.txt -map_metadata 1`
- Embed global metadata via `-metadata` flags

Rationale:
- M4B is natively supported by iPhone as audiobook format
- Embedded chapters allow skipping between songs
- 256 kbps AAC provides high quality for archival purposes
- Global metadata ensures proper display in audiobook players
- No GUI tools or third-party libraries beyond ffmpeg required

---

## D-046 – Async mixtape generation via WebSocket
Status: Accepted (Updated by D-047)

Decision:
Mixtape generation runs asynchronously with progress notification via WebSocket.
POST /api/mixtape/liked returns immediately with a taskId.
When generation completes, server emits `mixtape-ready` event with downloadId.
Frontend fetches file via GET /api/mixtape/download/:downloadId.

Rationale:
- Mixtape generation can take significant time with many songs
- Async approach prevents HTTP timeout issues
- WebSocket notification is consistent with existing Suno update pattern
- HTTP download provides proper Content-Disposition and progress support

---

## D-047 – Temporary mixtape file storage
Status: Accepted

Decision:
Mixtape files are stored temporarily on disk during generation, then deleted after download.
Files are stored in `backend/temp/` (gitignored).

Lifecycle:
1. Backend generates M4B to `backend/temp/{downloadId}.m4b`
2. Backend emits `mixtape-ready` with `downloadId`
3. Frontend fetches via `GET /api/mixtape/download/:downloadId`
4. Backend streams file and deletes it immediately after successful transfer
5. Fallback cleanup: Files older than 10 minutes are deleted on server startup and periodically

Rationale:
- Avoids sending large files over WebSocket (base64 bloat, memory pressure)
- Disk storage handles large files better than in-memory buffers
- Immediate deletion after download prevents disk accumulation
- 10-minute TTL handles edge cases (client disconnect, download failure)
- Temp folder is gitignored to keep repo clean


## D-048 – Manual MP3 upload for mixtapes
Status: Accepted

Decision:
Users can upload existing MP3 files to include in mixtapes alongside generated songs.
Upload endpoint saves files to `backend/mp3s/` and creates a history item.
Uploaded items have Suno fields set to null and are marked with `isUploaded: true`.

Constraints:
- Files must be MP3 format
- Maximum file size: 10 MB
- User must provide a title for the uploaded song
- Uploaded songs appear in history and can be liked/disliked like generated songs

Rationale:
- Enables mixtapes with personal music collection
- Leverages existing mp3s/ storage and history infrastructure
- Simple addition to existing workflow

---

## D-050 – Duration tracking for mixtape button
Status: Accepted

Decision:
Each history item stores a `duration` field (seconds, nullable number).
MixtapeButton displays the total duration of all liked songs in HH:MM:SS format.
Duration updates reactively as likes change.

Sources:
- Suno API: `duration` from `SunoRecordInfoTrack` is saved when song generation completes
- Uploaded MP3s: duration extracted via ffmpeg at upload time
- Database: `duration REAL` column in `history_items` table

Rationale:
- Users can see total mixtape length before generating
- Duration from Suno API is already available but was not persisted
- ffmpeg is already a dependency (via ffmpeg-static) so no new dependencies needed

---

## D-049 – Multi-file MP3 upload
Status: Accepted

Decision:
Users can select and upload multiple MP3 files in a single operation.
Each file gets its own title (defaulting to filename without extension).
Server filename uses the sanitized title with `.mp3` extension.
If a file with the same name exists, a sequential suffix is added (_1.mp3, _2.mp3, etc.).

Request format:
- files: multiple MP3 files (field name: "files")
- titles: JSON array of titles matching file order

Filename examples:
- "Min Sang" → `Min_Sang.mp3`
- "Min Sang" (duplicate) → `Min_Sang_1.mp3`, `Min_Sang_2.mp3`

Constraints:
- Maximum 10 files per upload
- Maximum 10 MB per file
- Titles are sanitized (special characters replaced with `_`)

Rationale:
- Meaningful filenames are easier to identify on disk
- Sequential suffix matches existing D-014 pattern for Suno downloads
- Multi-file upload speeds up workflow

---

## D-050 – Upload endpoint returns duration
Status: Accepted

Decision:
The POST /api/upload endpoint includes `duration` (in seconds) in the response for each uploaded file.

Response format:
```json
{ "id": "string", "localUrl": "string", "duration": 123.45 }
```

Rationale:
- Duration is calculated server-side via ffmpeg during upload
- Frontend needs duration immediately to update MixtapeButton reactively
- Returning duration in response avoids requiring a page refresh to see updated totals

---

## UX-001 – Mixtape button shows song count alongside duration
Status: Accepted

Decision:
The mixtape button displays both the number of liked songs and total duration inline, e.g. "Lag mixtape (7 sanger · 24:30)". No confirmation dialog or preview list before generation.

Rationale:
- The core "magic" problem is invisible scope — users can't see what's included before pressing the button
- Song count + duration makes the input fully transparent at zero interaction cost
- A confirmation dialog was rejected as heavier than the problem warrants; the action is already low-risk (just discard the file)

---

## UX-003 – Draft vs viewing state: no additional signal needed
Status: Rejected (no change)

Decision:
No visual indicator is added to distinguish draft state from viewing an existing song. The existing behavioral difference (editable fields vs read-only fields + "Kopier" button) is sufficient. Adding a label or banner would restate what the interaction already communicates.

---

## UX-004 – Mixtape ordering: no signal needed
Status: Rejected (no change)

Decision:
No UX element is added to communicate mixtape track ordering. Chronological order (createdAt ASC, per D-043) matches the history list order users already see. Adding microcopy about ordering would over-explain a detail that is already consistent with the visible mental model.

---

## UX-002 – Song source distinction: label uploaded items only
Status: Accepted

Decision:
Uploaded songs show a small, muted "Lastet opp" text label in the history list (alongside the timestamp line). Generated songs show no source indicator. Detail view has no source indicator — the absence of prompt/lyrics fields already communicates source implicitly.

Rejected alternative:
Icon badges on both generated and uploaded items were rejected. Marking every item adds visual noise for no gain since generated songs are the default expectation.

Rationale:
- Only the minority case (uploaded) needs marking; the default (generated) is self-evident
- Passive text label adds near-zero cognitive load
- Supports collection awareness when curating mixtapes without cluttering the list

---

## UX-005 – History list framed as "Sanger"
Status: Accepted

Decision:
The right panel header is renamed from "History" (or equivalent) to "Sanger". No other changes to structure, filtering, or behavior.

Rejected alternative:
"Bibliotek" was considered but implies browsing/search capabilities that do not exist. "Sanger" accurately describes the content without overpromising.

Rationale:
- "Sanger" frames the list as a collection rather than a log, matching how users already interact with it (liking, curating mixtapes)
- Neutral label that doesn't imply features beyond what exists

---

## UX-006 – Filter tab "Default" renamed to "Sanger"
Status: Accepted

Decision:
The filter bar labels change from "Default / Liked / All" to "Sanger / Likte / Alle". Behavior is unchanged — "Sanger" shows everything except disliked items (same as the old "Default").

Rejected alternative:
Adding tooltips or subtitles to explain each filter tab. If the labels describe their contents, no meta-explanation is needed.

Rationale:
- "Default" describes which option is pre-selected, not what the user sees — it's a programmer label
- "Sanger" describes the subset (your songs minus rejected ones) and is consistent with the panel header (UX-005)
- All three tabs now describe contents: Sanger (collection), Likte (favorites), Alle (everything)

---

## UX-007 – Mixtape preview: no additional preview needed
Status: Rejected (no change)

Decision:
No mixtape preview UI is added. The "Likte" filter tab already shows the exact songs included, and UX-001 provides song count + duration on the button. Adding a preview list, tooltip, or confirmation dialog would duplicate information already accessible in one tap.

---

## UX-008 – Like/collection relationship: no signal needed
Status: Rejected (no change)

Decision:
No additional UX element is added to clarify what "liking" means. The three-tier tab structure (Sanger / Likte / Alle) and the mixtape button label ("Lag mixtape av likte sanger") already communicate that liking = favorite = mixtape-eligible. This follows standard app conventions and needs no explanation.

---

## UX-009 – Draft → generated song transition: no signal needed
Status: Rejected (no change)

Decision:
No additional transition signal is added after song generation completes. The flow already requires two mandatory fields and an explicit button click with a multi-minute spinner. The spinner stopping and history items appearing are sufficient signals. Adding a toast, editor clear, or auto-selection would either add noise or destroy draft state the user may want to iterate on.

---

## UX-010 – AI-generated lyrics optionality: no signal needed
Status: Rejected (no change)

Decision:
No additional signal is added to communicate that AI-generated lyrics are optional. The always-visible lyrics textarea (D-044) already affords direct manual input. The ChatGPT prompt is visually separate and clearly optional. Adding microcopy would restate what the editable field already communicates through standard affordance.

---

## UX-011 – First-time recommended action: no signal needed
Status: Rejected (no change)

Decision:
No visual suggestion for a "recommended first action" is added for first-time users. The empty draft state (all fields visible per D-044) already forms a natural top-to-bottom flow that communicates what to do. Adding highlights, tooltips, or guidance would over-explain a layout that is self-evident.

---

## UX-012 – Advanced capability discoverability: no action needed
Status: Rejected (no change)

Decision:
No explicit discoverability policy is created for "advanced" features. The app's feature surface is flat — all capabilities are either always visible or appear contextually when relevant (e.g. "Kopier" in read-only view, genre history in dropdown). There is no power-user layer that requires a deliberate hiding or progressive disclosure decision.

---

## UX-013 – Deferred UX improvements: no deferral list needed
Status: Rejected (no change)

Decision:
No list of intentionally deferred UX improvements is maintained. The UX review (UX-003 through UX-012) already rejected every proposed onboarding or explanatory addition on its own merits. The restraint principle is demonstrated by the decisions themselves — a meta-policy restating it adds nothing.

---
