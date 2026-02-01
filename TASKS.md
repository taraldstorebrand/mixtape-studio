# TASKS.md

## Current Task

Add spacer in ReadonlyView when "Create song" button is hidden.

## Goal

Maintain consistent vertical positioning of header/content when `sunoAvailable` is false by adding a spacer element with the same height as the button.

---

## Task 1: Add spacer when button is hidden

**Status:** ✅ Complete

**Description:**
- When `sunoAvailable` is false, render a spacer div instead of the button
- Spacer should have same height as `.newDraftButton` to maintain layout consistency
- Use CSS class for the spacer

**Files to modify:**
- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`
- `frontend/src/components/panels/DetailPanel.module.css`

---

## Constraints

- Use CSS variables from `variables.css`
- Follow AGENTS.md accessibility rules
- Minimal diff
