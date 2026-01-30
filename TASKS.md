# TASKS.md

## Current Task

No active task

## Completed Tasks

### Task 1: Add collapsible section state

**Goal:** Add state for tracking expanded/collapsed status of prompt and lyrics sections.

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx` - Add expanded/collapsed state

**Details:**

- Mode is determined by `selectedItem` prop:
  - `selectedItem !== null` → read-only mode
  - `selectedItem === null` → template/edit mode
- Add state for tracking expanded/collapsed status of ChatGPT prompt and Lyrics sections
- Initialize collapsed state based on mode:
  - Read-only mode: both sections collapsed by default
  - Template/edit mode: both sections expanded by default
- Reset state when selectedItem changes
- Use existing state management patterns (React useState/useEffect)

---

### Task 2: Create collapsible section component structure

**Goal:** Build reusable collapsible section component for ChatGPT prompt and Lyrics panels.

**Files:**

- `frontend/src/components/panels/DetailPanel/CollapsibleSection/CollapsibleSection.tsx` - New component
- `frontend/src/components/panels/DetailPanel/CollapsibleSection/CollapsibleSection.module.css` - New styles

**Details:**

- Create component with header (label + toggle button) and content area
- Support expand/collapse interaction with smooth transitions
- Accept props: label, children, isExpanded, onToggle, mode (read-only vs edit)
- Header should be clickable to toggle expand/collapse
- Use consistent icon/indicator for collapse state (chevron or similar)
- Keep component generic and reusable
- Follow existing component patterns in the codebase

---

### Task 3: Implement read-only mode layout for prompt and lyrics

**Goal:** Apply collapsible, compact layout for ChatGPT prompt and Lyrics sections in read-only mode.

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx` - Update to use CollapsibleSection
- `frontend/src/components/panels/DetailPanel.module.css` - Add read-only mode styles

**Details:**

- Wrap existing prompt and lyrics display in CollapsibleSection components
- Collapsed by default when viewing existing songs
- When expanded, limit height with max-height and internal scrolling
  - ChatGPT prompt: max-height ~150px with overflow-y: auto
  - Lyrics: max-height ~300px with overflow-y: auto
- Keep layout compact so artwork and metadata remain primary focus
- Section headers always visible with expand/collapse toggle
- Ensure no layout jumps when toggling sections
- Use smooth transitions for expand/collapse animations

---

### Task 4: Implement template/edit mode layout for prompt and lyrics

**Goal:** Apply expanded, editable layout for prompt and Lyrics sections in template/edit mode.

**Files:**

- `frontend/src/components/lyrics/LyricsTextarea.tsx` - Wrap in CollapsibleSection or update styling
- `frontend/src/components/lyrics/PromptInput.tsx` - Wrap in CollapsibleSection or update styling
- `frontend/src/components/panels/DetailPanel.module.css` - Add edit mode styles

**Details:**

- Sections expanded by default when creating or editing
- Provide comfortable editing space but constrain height to prevent panel overflow
  - Use max-height with internal scrolling instead of expanding entire panel
  - PromptInput: constrain container height if needed
  - LyricsTextarea: maintain existing textarea but ensure container has max-height
- Keep panel layout stable during editing
- Sections should still be collapsible for user preference
- Maintain existing editing functionality and UX

---

### Task 5: Unify styling across both sections

**Goal:** Apply consistent visual styling to ChatGPT prompt and Lyrics sections in both modes.

**Files:**

- `frontend/src/components/panels/DetailPanel/CollapsibleSection/CollapsibleSection.module.css` - Unified styles
- `frontend/src/components/panels/DetailPanel.module.css` - Shared section styles

**Details:**

- Same header style and spacing for both sections
  - Font size, weight, color
  - Padding and margins
  - Toggle icon/button styling
- Same expand/collapse interaction behavior
- Same container styling:
  - Background color (use existing variables)
  - Border style and color
  - Border radius
  - Padding and internal spacing
- Same transition timing for expand/collapse
- Consistent scrollbar styling when content overflows
- Use existing CSS variables from `frontend/src/styles/variables.css`
- Maintain dark theme and design language

---

### Task 6: Handle mode transitions and edge cases

**Goal:** Ensure smooth behavior when switching between songs, modes, and interaction states.

**Files:**

- `frontend/src/components/panels/DetailPanel.tsx` - Mode transition logic
- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx` - State reset logic

**Details:**

- Reset expanded/collapsed state appropriately when:
  - Switching from one song to another
  - Switching from read-only to edit mode (copy to draft)
  - Switching from edit mode to read-only (selecting a song)
  - Creating new draft
- Prevent layout jumps during transitions
- Preserve user's expand/collapse preferences within same session if appropriate
- Handle empty/missing content gracefully (don't show empty collapsible sections)
- Ensure accessibility: keyboard navigation, ARIA attributes for expand/collapse
- Test with various content lengths and viewport sizes

---

## Constraints

- Maintain existing functionality and user workflows
- No new dependencies unless absolutely necessary
- Use existing CSS variables from `frontend/src/styles/variables.css`
- Keep changes consistent with current dark theme and design language
- Ensure accessibility (keyboard navigation, screen readers)
- Preserve existing component structure where possible
- Follow React best practices and existing codebase patterns
- CSS transitions should be smooth and performant

---

## Goal

Create unified, mode-aware layout for ChatGPT prompt and Lyrics panels that provides:
- Compact, scannable layout when viewing existing songs (read-only mode)
- Comfortable, spacious editing experience when creating content (template/edit mode)
- Consistent UI structure and visual styling across both modes
- Smooth transitions without layout jumps

---

## Summary

Successfully implemented mode-aware collapsible layout for ChatGPT prompt and Lyrics sections:

**Completed:**
- ✓ Task 1: Added state management for tracking expanded/collapsed status
- ✓ Task 2: Created reusable CollapsibleSection component with smooth transitions
- ✓ Task 3: Implemented read-only mode (collapsed by default, max-height with scrolling)
- ✓ Task 4: Implemented template/edit mode (expanded by default, constrained height)
- ✓ Task 5: Unified styling across both modes using CSS variables
- ✓ Task 6: Handled mode transitions and edge cases

**Result:**
- Compact, scannable layout when viewing existing songs (read-only mode)
- Comfortable editing experience when creating content (template/edit mode)
- Consistent UI structure and visual styling
- Smooth transitions without layout jumps
- Full accessibility support with ARIA attributes
