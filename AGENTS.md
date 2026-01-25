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
- Do NOT use useCallback, useMemo, or React.memo unless strictly required for correctness (e.g., breaking infinite loops). React 19 handles optimization automatically; premature memoization reduces readability and maintainability with little or no performance gain.

## Output
- Prefer minimal diffs
- Explain deviations explicitly
