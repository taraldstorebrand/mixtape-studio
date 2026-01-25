# TASKS.md

## Iteration 014 – Custom GenreInput component

### Goal
Replace `react-select` with a lightweight custom `GenreInput` component using native `<input>` and controlled dropdown.

---

## In Scope

### Frontend
- Create new `GenreInput` component in `frontend/src/components/`
- Remove `react-select` dependency from App.tsx
- Implement dropdown with matching items from `genreHistory`
- Arrow keys navigate, Enter selects, Escape closes
- Each dropdown option has a remove (×) button that does not select the option
- User can type freely (creatable behavior)

### Component Props
- `value: string`
- `onChange(value: string)`
- `genreHistory: string[]`
- `onRemoveGenre(genre: string)`

---

## Files Allowed to Change
- frontend/src/App.tsx
- frontend/src/components/GenreInput.tsx (new)
- frontend/package.json (remove react-select)
- SPEC.md
- DECISIONS.md

---

## Acceptance Criteria
- GenreInput works as a text input with dropdown suggestions
- Dropdown shows matching genres from history as user types
- Arrow Up/Down navigate dropdown, Enter selects, Escape closes
- Each option has × button to remove genre without selecting
- No react-select or other select/combobox library used
- No useCallback or useMemo unless strictly necessary
- Uses existing CSS classes
- D-036 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 014 | Custom GenreInput component |
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
