# TASKS.md

## Iteration 012 – Lyrics editor and prompt input styling

### Goal
Improve the lyrics display and input controls with editor-style visuals.

---

## In Scope

### Frontend
- Convert lyrics textarea to editable editor-style component (not read-only)
- Style lyrics area as content display rather than raw textarea appearance
- Use small multiline textarea for ChatGPT prompt input
- Keep song title as clear, editable input field associated with the lyrics

---

## Files Allowed to Change
- frontend/src/App.css
- frontend/src/App.tsx
- frontend/src/components/lyrics/LyricsEditor.tsx (if exists)
- DECISIONS.md

---

## Acceptance Criteria
- Lyrics display in an editable, editor-style text area
- Lyrics area is styled as content (not raw textarea look)
- ChatGPT prompt uses small multiline textarea
- Song title is a clear, editable input field
- D-033 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 011 | Thumb button styling and toggle behavior |
| 010 | History filtering and deletion |
| 009 | History only for successful Suno generations |
| 008 | Genre field with searchable history |
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
