# TASKS.md

## Current Task

No active task

## Pending Tasks

### Task 1: Refine Upload MP3 button styling

**Goal:** Apply premium button styling to the Upload MP3 button using a neutral/gray variant of the gradient treatment.

**Files:**

- `frontend/src/components/history/UploadButton/UploadButton.module.css` - Update `.button` class styling

**Details:**

- Apply the same visual style as primary gradient buttons (Create mixtape, etc.) but in neutral/gray tones
- Add subtle vertical gradient using existing gray/border color variables
- Add hover lift effect (`transform: translateY(-1px)`)
- Add hover brightness increase (slightly toned down compared to primary buttons)
- Add soft shadow and inset highlight for depth
- Use existing CSS variables from `frontend/src/styles/variables.css`
- Do NOT change layout, structure, or interaction logic
- Only update CSS for visual refinement

---

### Task 2: Improve selected item contrast in song list

**Goal:** Make selected items in the history list more visually distinct by adding a slightly darker background.

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css` - Update `.selected` class styling

**Details:**

- Make selected items slightly darker than normal items for clearer selection feedback
- Keep existing border styling
- Add slightly stronger background contrast (very subtle, not harsh)
- Maintain clear visual distinction that item is selected
- Use existing CSS variables from `frontend/src/styles/variables.css`
- Do NOT change layout, structure, or click behavior
- Only adjust background color/opacity for selected state

---

### Task 3: Add hover feedback to Now Playing progress bar

**Goal:** Increase progress bar thickness slightly on hover for better interaction feedback.

**Files:**

- `frontend/src/components/NowPlaying/NowPlaying.module.css` - Update progress bar hover styling

**Details:**

- Increase bar thickness slightly on hover (e.g., from current height to +2px or similar)
- Keep default state subtle and minimal
- Add smooth transition for thickness change
- Do NOT change layout or progress bar functionality
- Only update CSS for hover state visual feedback
- Use existing CSS variables for transitions

---

### Task 4: Improve disabled button readability

**Goal:** Improve visual contrast of disabled buttons (e.g., Generate song) to make them look disabled but more readable.

**Files:**

- `frontend/src/components/panels/DetailPanel.module.css` - Update `.generateSongButton:disabled` styling
- Other button modules as needed for consistency

**Details:**

- Increase contrast slightly so disabled buttons are more readable
- Keep disabled appearance clear (do not make them look active/clickable)
- Adjust opacity or color values to improve text legibility
- Maintain consistency across all disabled primary buttons
- Use existing CSS variables from `frontend/src/styles/variables.css`
- Do NOT change layout, structure, or interaction logic
- Only update CSS color/opacity values for disabled state

---

## Constraints

- CSS changes only
- No new dependencies
- No layout or component structure changes
- Maintain current dark theme and design language
- Keep changes subtle and consistent with existing premium button styles
- Always use CSS variables from `frontend/src/styles/variables.css`
- Follow AGENTS.md style rules

---

## Goal

Subtle, consistent visual refinements to improve polish and interaction feedback across primary UI elements.

---

## Completed

All previous tasks have been completed and archived.
