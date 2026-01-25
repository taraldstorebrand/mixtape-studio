# TASKS.md

## Iteration 013 – Song selection and draft state restoration

### Goal
Enable selecting a song from history to view its details in read-only mode. Clicking the selected song again deselects it and resets to "new draft" state. History items store complete draft state for full restoration.

---

## In Scope

### Frontend
- Add selection state to history items (clicking selects, clicking again deselects)
- Selected song displays all fields in read-only mode in left panel
- Read-only view includes a "Kopier" button to create an editable copy of the values
- Remove "Gjenbruk" button from history items
- Deselecting resets left panel to default "new draft" state (only ChatGPT prompt visible)
- History items must store complete draft state (prompt, title, lyrics, genre, all outputs)

### Shared Types
- Update HistoryItem interface if needed to ensure all draft fields are stored

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/components/history/SongHistory.tsx
- frontend/src/components/history/SongHistoryItem.tsx
- frontend/src/services/storageService.ts
- shared/types/index.ts
- SPEC.md
- DECISIONS.md

---

## Acceptance Criteria
- Clicking a history item selects it and shows details in read-only mode in left panel
- Clicking the already-selected item deselects it
- Deselecting resets left panel to "new draft" state with only ChatGPT prompt visible
- Read-only view has "Kopier" button that creates editable copy and deselects
- "Gjenbruk" button removed from history items
- History items store complete draft state (prompt, title, lyrics, genre)
- Selecting an item fully restores its state in read-only mode
- D-035 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 013 | Song selection and draft state restoration |
| 012 | Lyrics editor and prompt input styling |
| 013-prev | Dark theme consistency |
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
