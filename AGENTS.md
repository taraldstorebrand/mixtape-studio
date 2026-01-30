# AGENTS.md

## Authority
You MUST follow SPEC.md and ARCHITECTURE.md.
If there is a conflict, STOP and ask for clarification.

## Scope
- Modify only files explicitly mentioned in TASKS.md
- Do NOT introduce new endpoints, folders, or dependencies unless instructed

## Safety
- Do NOT refactor unrelated code
- Do NOT invent features
- Preserve existing behavior unless explicitly told otherwise

## Style
- TypeScript strict
- Functional React only
- No class components
- No new global state libraries
- Use `useAtomValue` when only reading, `useSetAtom` when only writing, `useAtom` only when both are needed
- Do NOT use useCallback, useMemo, or React.memo unless strictly required for correctness (e.g., breaking infinite loops). React 19 handles optimization automatically; premature memoization reduces readability and maintainability with little or no performance gain.
- Do NOT define render functions inside components (functions that return JSX). Extract them as separate components instead. This improves readability, testability, and avoids re-creating functions on every render.
- Helper components used by only one parent component MUST be placed in a subfolder named after the parent component, inside its own folder matching the component name. Example: `StatusBadge` used only by `HistoryItem` goes in `history/HistoryItem/StatusBadge/StatusBadge.tsx`.
- File names MUST match the primary component they export. Avoid generic names like `index.tsx`. Example: a file exporting `HistoryItem` must be named `HistoryItem.tsx`, not `index.tsx`.

## Accessibility (WCAG 2.1 AA)
- All interactive elements MUST have `type="button"` unless they are submit buttons
- Toggle buttons MUST have `aria-pressed` to expose state to screen readers
- All buttons MUST have `aria-label` or visible text content
- SVG icons inside buttons MUST have `aria-hidden="true"` and `focusable="false"`
- Truncated text (`text-overflow: ellipsis`) MUST have a `title` attribute for tooltip
- Use i18n for all user-facing strings, including tooltips
- Interactive elements MUST have visible `:focus-visible` styling (outline)
- Avoid `filter` effects that reduce contrast below 4.5:1 ratio
- Guard against NaN/undefined in time-based calculations
- Never use hardcoded color values (e.g., `#bbb`), always use CSS variables/design tokens

## Output
- Prefer minimal diffs
- Explain deviations explicitly
