# TASKS.md

## Iteration 013 – Dark theme consistency

### Goal
Remove pure white surfaces and use subtle dark/tinted backgrounds for visual cohesion with the dark UI.

---

## In Scope

### Frontend
- Remove light mode media query (force dark theme)
- Apply subtle dark/tinted background to header instead of inheriting white
- Ensure all surfaces use dark backgrounds for visual consistency

---

## Files Allowed to Change
- frontend/src/App.css
- frontend/src/index.css
- DECISIONS.md

---

## Acceptance Criteria
- No pure white (#ffffff) surfaces anywhere in the app
- Header has subtle dark/tinted background matching the dark UI
- Light mode media query removed or disabled
- D-034 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 012 | Lyrics editor and prompt input styling |
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
