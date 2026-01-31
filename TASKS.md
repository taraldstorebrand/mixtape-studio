# TASKS.md

## Current Task

Refactor left panel state handling to separate nowPlaying, selected, and editor states.

## Goal

Make the editor act as a temporary overlay mode, not navigation. Opening/closing the editor should not affect which song is selected or playing.

---

## Design Decision: Editor as Overlay

**Current behavior (problem):**
- `selectedItem` controls both detail view and editor visibility
- `onClearSelection()` sets `selectedId = null` to show editor
- This loses track of which song was being viewed

**New behavior:**
- Introduce `editorOpenAtom` (boolean) as independent state
- `selectedId` remains unchanged when opening editor
- Editor is an overlay that can be dismissed to return to previous detail view

**State model:**
```
editorOpen = true  → Show editor (selectedId preserved but hidden)
editorOpen = false → Show detail view for selectedId (or empty if null)
```

---

## Task 1: Add editorOpenAtom to store

**Status:** ✅ Complete

**Description:**
- Add `editorOpenAtom` to `frontend/src/store/atoms.ts`
- Export from `frontend/src/store/index.ts`
- Type: `atom<boolean>` with default `false`

**Files to modify:**
- `frontend/src/store/atoms.ts`
- `frontend/src/store/index.ts`

---

## Task 2: Update DetailPanel to use editorOpenAtom

**Status:** ✅ Complete

**Description:**
- Replace `selectedItem ? <ReadonlyView> : <Editor>` logic with `editorOpen` check
- Render logic:
  - `editorOpen = true` → Show editor
  - `editorOpen = false && selectedItem` → Show ReadonlyView
  - `editorOpen = false && !selectedItem` → Show editor (initial state)
- Remove `onClearSelection()` calls that were used to "open editor"

**Files to modify:**
- `frontend/src/components/panels/DetailPanel.tsx`

---

## Task 3: Update "Create song" button in ReadonlyView

**Status:** ✅ Complete

**Description:**
- Change `onClearSelection()` to `setEditorOpen(true)`
- Do NOT modify `selectedId`
- Button opens editor as overlay, preserving which song was selected

**Files to modify:**
- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`

---

## Task 4: Add "Back to details" button in editor mode

**Status:** ✅ Complete

**Description:**
- Show "Back to details" button in editor when `selectedId` is not null
- On click: `setEditorOpen(false)` - returns to ReadonlyView for same song
- Do NOT modify `selectedId`

**Files to modify:**
- `frontend/src/components/panels/DetailPanel.tsx`

---

## Task 5: Update handleCopy and handleNewDraft

**Status:** ✅ Complete

**Description:**
- `handleCopy`: Copy values to editor, set `editorOpen = true`, do NOT clear selection
- `handleNewDraft`: Clear editor fields, set `editorOpen = true`, do NOT clear selection
- Selection should only change when user explicitly clicks a song in the list

**Files to modify:**
- `frontend/src/components/panels/DetailPanel.tsx`

---

## Task 6: Implement initial state logic (empty state views)

**Status:** ✅ Complete

**Description:**
- When `editorOpen = false` and `selectedId = null`, show appropriate empty state:
  - **Suno API key missing:** Show "📤 Upload songs to start" message
  - **Suno key present, no songs:** Show "✨ Create your first song" button that opens editor
  - **Songs exist:** Auto-select first song in history on app load
- Use existing `checkConfigStatus()` to determine API key availability
- Create new `EmptyState` component for these views

**Files to modify:**
- `frontend/src/components/panels/DetailPanel.tsx`
- `frontend/src/components/panels/DetailPanel/EmptyState/EmptyState.tsx` (new)
- `frontend/src/App.tsx` (auto-select first song on load)

---

## Task 7: Update i18n for new button labels and empty states

**Status:** ✅ Complete

**Description:**
- Add `backToDetails` key (already exists: "Back")
- Add `uploadToStart` key: "📤 Upload songs to start"
- Add `createFirstSong` key: "✨ Create your first song"
- Ensure `createSong` is used when in ReadonlyView
- Ensure `newDraft` is used when in editor mode

**Files to modify:**
- `frontend/src/i18n/en.ts`

---

## Constraints

- No new dependencies
- Preserve all existing functionality
- Editor state is independent of selectedId and nowPlayingId
- Only list item clicks should change selectedId
- Follow AGENTS.md style rules

---

## Edge Cases

1. **User clicks song in list:** `selectedId` changes, `editorOpen = false` → Show detail view
2. **User clicks "Create song":** `editorOpen = true`, `selectedId` unchanged → Show editor
3. **User clicks "Back to details":** `editorOpen = false`, `selectedId` unchanged → Show detail view
4. **User clicks different song while editor open:** `selectedId` changes, `editorOpen = false` → Show new song's detail view

---

## Initial State Logic (App Start)

When `editorOpen = false` and `selectedId = null`:

| Condition | Display |
|-----------|---------|
| Suno API key missing | Empty state: "📤 Upload songs to start" |
| Suno key present, no songs | Empty state: "✨ Create your first song" (link/button to open editor) |
| Songs exist | Auto-select first song → Show detail view |

**Rationale:** 
- Don't push users toward Suno/AI features if they haven't configured API keys
- Guide new users with appropriate first action based on their setup
- Existing users see their content immediately

---

## First Song Upload Behavior

When user uploads their first song (history was empty):
- Set `selectedId` to the newly uploaded song
- Set `editorOpen = false`
- Show detail view for the uploaded song
- Do NOT start playback automatically

**Rationale:**
- User should see their upload immediately without manual selection
- Auto-play would be unexpected and intrusive
