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
Status: Accepted

Decision:
Clicking a history item selects it and displays its complete state in read-only mode in the left panel.
Clicking the already-selected item deselects it and resets the left panel to "new draft" state.
"New draft" state shows only the ChatGPT prompt input; title, lyrics, and genre fields are hidden or cleared.
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
