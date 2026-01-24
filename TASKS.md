# TASKS.md

## Iteration 007 – Two-panel resizable layout

### Goal
Reorganize the UI into a left/right two-panel layout with resizable splitter. Left panel contains all generation inputs, right panel shows a compact song list.

---

## In Scope

### Frontend
- Create resizable two-panel layout (left: inputs, right: songs)
- Left panel: ChatGPT prompt input, lyrics textarea, title/genre inputs, generate buttons
- Right panel: Compact song list (no lyrics display)
- Song items show: title, status badge, audio players (if completed), timestamp
- Add drag handle between panels for resizing
- Persist panel width to localStorage (optional)
- Remove lyrics display from history items

### Styling
- Responsive: stack vertically on narrow screens
- Minimum width constraints for both panels

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/App.css
- frontend/src/components/history/HistoryList.tsx
- frontend/src/components/history/HistoryItem.tsx
- frontend/src/components/history/HistoryItem.css (or new file)
- DECISIONS.md
- SPEC.md

---

## Acceptance Criteria
- Left panel contains all input/generation controls
- Right panel shows compact song list without lyrics
- Panels are resizable via drag handle
- Layout responsive on small screens
- D-015 added to DECISIONS.md documenting layout change

---

## Iteration 006 – Required title and generation spinner (Completed)

### Goal
Require song title before Suno generation and show spinner until complete.

---

## In Scope

### Frontend
- Add title input field (required for Suno)
- Disable "Generer Sang med Suno" when title is empty
- Show spinner on button during generation
- Keep button disabled until status is "completed" or "failed"
- Pass title to backend when calling `/api/suno/generate`
- Create new history entry for each Suno generation (allow duplicate lyrics)

### Backend
- Fix lyrics truncation to only apply in non-custom mode
- Change MP3 filename format to `{title}_{index}.mp3` (index starts at 1, title sanitized)

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/services/api.ts
- frontend/vite.config.ts
- backend/src/services/suno.ts
- DECISIONS.md
- SPEC.md

---

## Acceptance Criteria
- Title input visible and required for Suno generation
- Button disabled when title empty
- Spinner shown during generation
- Button re-enabled on completion or failure
- New history entry created per Suno generation
- D-010, D-011, and D-012 added to DECISIONS.md

---

## Iteration 005 – Serve local MP3 files (Completed)

### Goal
Serve downloaded MP3 files from backend and update frontend to use local URLs instead of expiring CDN URLs.

---

## In Scope

### Backend
- Add static file serving for `/mp3s/*` route pointing to `backend/mp3s/`
- Modify `suno-update` payload to include `local_urls` (relative paths like `/mp3s/{jobId}_0.mp3`)

### Frontend
- Update audio player to prefer `local_urls` over `audio_urls` when available
- Update `HistoryItem` type to include `sunoLocalUrls?: string[]`

---

## Files Allowed to Change
- backend/src/server.ts
- backend/src/services/suno.ts
- frontend/src/components/history/HistoryItem.tsx
- shared/types/index.ts
- DECISIONS.md
- ARCHITECTURE.md

---

## Acceptance Criteria
- Audio plays from `/mp3s/*` endpoint when local files exist
- CDN URLs remain as fallback
- D-009 added to DECISIONS.md

---

## Iteration 004 – Local MP3 download (Completed)

### Goal
Download generated songs to local `backend/mp3s/` folder when Suno job completes.

---

## In Scope

### Backend
- Create `backend/mp3s/` directory (gitignored)
- Modify `backend/src/services/suno.ts`:
  - When status becomes `completed`, download each `sourceAudioUrl`
  - Save as `{jobId}_{index}.mp3` in `backend/mp3s/`
  - Add local file paths to WebSocket update payload

---

## Files Allowed to Change
- backend/src/services/suno.ts
- backend/.gitignore
- DECISIONS.md
- ARCHITECTURE.md

---

## Acceptance Criteria
- MP3 files saved to `backend/mp3s/` on job completion
- Files named `{jobId}_{0|1}.mp3`
- Local paths included in `suno-update` payload

---

## Iteration 003 – Fix Suno audio URL source (Completed)

### Goal
Switch from using `audioUrl` (proxy URLs) to `sourceAudioUrl` (direct Suno CDN URLs)
to fix broken audio playback.

---

## Background
The Suno API returns two URL types:
- `audioUrl`: Proxy URLs via `musicfile.api.box` (currently broken/unreliable)
- `sourceAudioUrl`: Direct Suno CDN URLs via `cdn1.suno.ai` (working)

---

## In Scope

### Backend
- Modify `backend/src/services/suno.ts` to use `sourceAudioUrl` instead of `audioUrl`

### Documentation
- Update DECISIONS.md with new decision D-006

---

## Out of Scope
- Local audio file storage (deferred to future iteration)
- Frontend changes
- Any other backend changes

---

## Files Allowed to Change
- backend/src/services/suno.ts
- DECISIONS.md

---

## Acceptance Criteria
- Audio playback works using `cdn1.suno.ai` URLs
- D-006 is added to DECISIONS.md

---

## Iteration 002 – Resolve backend contract gaps (Completed)

### Goal
Resolve explicitly unresolved backend contract decisions identified in Iteration 001,
and update code and documentation to reflect the chosen behavior.

This iteration focuses on making backend behavior explicit, correct, and verifiable.

---

## Decisions in Scope

- D-001 – Suno callback endpoint
- D-003 – GPT model version

All other decisions in DECISIONS.md are considered locked and must not be changed.

---

## In Scope

### Backend
- Decide and implement the correct handling of Suno job completion:
  - Either implement a callback endpoint, or
  - Remove callback usage and rely solely on polling
- Ensure backend behavior matches the chosen approach

- Verify the OpenAI model identifier currently used
- Explicitly lock the intended model version in code and documentation

### Documentation
- Update `API.md` to reflect actual backend behavior
- Update `ARCHITECTURE.md` if backend communication patterns change
- Update `SPEC.md` only if user-visible behavior changes as a result

### Decisions
- Update `DECISIONS.md`:
  - Mark D-001 and D-003 as Resolved
  - Record the final decision taken

---

## Out of Scope
- No frontend UX changes
- No history or ID refactors
- No Socket.IO scoping changes
- No new features unrelated to Suno callback or GPT model selection
- No dependency upgrades unless strictly required

---

## Files Allowed to Change

### Backend
- backend/src/** (only files directly related to Suno integration or OpenAI usage)

### Documentation
- API.md
- ARCHITECTURE.md
- SPEC.md (only if required)
- DECISIONS.md

---

## Constraints
- Do not introduce speculative behavior
- Do not “improve” unrelated code
- Prefer deletion of unused code over partial implementations
- Any ambiguity must be resolved explicitly, not worked around

---

## Acceptance Criteria

### Suno integration
- The backend uses a single, clearly defined mechanism for job completion:
  - Polling only, or
  - Callback-based completion
- No unused callback URLs remain in requests
- All behavior is documented in `API.md`

### OpenAI integration
- The model identifier used for lyrics generation is verified
- The chosen model is explicitly documented and locked
- No ambiguous or placeholder model names remain in code

### Decisions
- D-001 and D-003 in `DECISIONS.md` are updated to `Resolved`
- The resolution text reflects the actual implementation

---

## Notes for Agent
This iteration is contract-focused.
Do not optimize, refactor, or redesign.
If removal of code is the correct resolution, removal is preferred over stubbing.
