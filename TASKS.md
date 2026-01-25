# TASKS.md

## Iteration 011 – Thumb button styling and toggle behavior

### Goal
Improve thumb button visibility and interaction with proper styling and toggle behavior.

---

## In Scope

### Frontend
- Add color to `.delete-button` and `.thumb-button` for visibility
- Replace "+" and "-" with 👍 and 👎 emoji symbols
- Add grayscale/opacity filter for unselected state, full color when selected
- Implement toggle behavior: clicking selected thumb deselects it
- Clicking opposite thumb switches selection (auto-deselects the other)

---

## Files Allowed to Change
- frontend/src/App.css
- frontend/src/components/history/HistoryItem.tsx
- frontend/src/components/history/HistoryList.tsx
- frontend/src/hooks/useHistory.ts
- frontend/src/services/storage.ts
- DECISIONS.md

---

## Acceptance Criteria
- Thumb buttons and delete buttons are visible (have color)
- Thumb icons display as 👍 and 👎
- Unselected thumbs appear faded/grayscale
- Selected thumbs appear full color
- Clicking a selected thumb deselects it (sets feedback to null)
- Clicking opposite thumb switches selection
- D-032 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 010 | History filtering and deletion |
| 009 | History only for successful Suno generations |
| 008 | Genre field with searchable history |
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
