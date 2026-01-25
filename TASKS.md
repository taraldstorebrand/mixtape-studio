# TASKS.md

## Iteration 010 – History filtering and deletion

### Goal
Add filtering options to the history panel and delete buttons for history items and individual audio tracks.

---

## In Scope

### Frontend
- Add filter bar with "Default", "Liked", "All" buttons to HistoryList
- Add trashcan delete button to each history item
- Add trashcan delete button to each audio track
- Default filter hides disliked items, Liked shows only liked, All shows everything

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/App.css
- frontend/src/components/history/HistoryList.tsx
- frontend/src/components/history/HistoryItem.tsx
- DECISIONS.md
- SPEC.md

---

## Acceptance Criteria
- Filter bar displays with 3 buttons: Default, Liked, All
- Default filter (initial) shows all items except feedback='down'
- Liked filter shows only items with feedback='up'
- All filter shows all items
- Each history item has a trashcan delete button
- Each audio track has a trashcan delete button
- D-030 and D-031 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 009 | History only for successful Suno generations |
| 008 | Genre field with searchable history |
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
