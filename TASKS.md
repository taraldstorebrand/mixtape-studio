# TASKS.md

## Iteration 008 – Genre field with searchable history

### Goal
Replace the genre text input with a searchable dropdown (react-select) that remembers previously used genres, allows free-text entry, and supports removing saved values.

---

## In Scope

### Frontend
- Install `react-select`
- Replace genre input with Creatable Select component
- Store genre history in localStorage (`sangtekst_genre_history`)
- Load saved genres as dropdown options
- Allow typing new values (creates new option)
- Add remove button (×) to delete saved genres from history
- Limit stored genres (max 50)

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/App.css
- frontend/package.json
- DECISIONS.md
- SPEC.md

---

## Acceptance Criteria
- Genre field is a searchable/creatable dropdown
- Previously used genres appear as options
- New genres are saved to localStorage on use
- Users can remove genres from history
- D-016 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
