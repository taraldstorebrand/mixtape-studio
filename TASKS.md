# TASKS.md

## Iteration 002 – Resolve backend contract gaps

### Goal
Resolve explicitly unresolved backend contract decisions identified in Iteration 001,
and update code and documentation to reflect the chosen behavior.

This iteration focuses on making backend behavior explicit, correct, and verifiable.

---

## Decisions in Scope

- D-001 – Suno callback endpoint
- D-003 – GPT model version

All other decisions in DECISIONS.md are considered locked and must not be changed.

---

## In Scope

### Backend
- Decide and implement the correct handling of Suno job completion:
  - Either implement a callback endpoint, or
  - Remove callback usage and rely solely on polling
- Ensure backend behavior matches the chosen approach

- Verify the OpenAI model identifier currently used
- Explicitly lock the intended model version in code and documentation

### Documentation
- Update `API.md` to reflect actual backend behavior
- Update `ARCHITECTURE.md` if backend communication patterns change
- Update `SPEC.md` only if user-visible behavior changes as a result

### Decisions
- Update `DECISIONS.md`:
  - Mark D-001 and D-003 as Resolved
  - Record the final decision taken

---

## Out of Scope
- No frontend UX changes
- No history or ID refactors
- No Socket.IO scoping changes
- No new features unrelated to Suno callback or GPT model selection
- No dependency upgrades unless strictly required

---

## Files Allowed to Change

### Backend
- backend/src/** (only files directly related to Suno integration or OpenAI usage)

### Documentation
- API.md
- ARCHITECTURE.md
- SPEC.md (only if required)
- DECISIONS.md

---

## Constraints
- Do not introduce speculative behavior
- Do not “improve” unrelated code
- Prefer deletion of unused code over partial implementations
- Any ambiguity must be resolved explicitly, not worked around

---

## Acceptance Criteria

### Suno integration
- The backend uses a single, clearly defined mechanism for job completion:
  - Polling only, or
  - Callback-based completion
- No unused callback URLs remain in requests
- All behavior is documented in `API.md`

### OpenAI integration
- The model identifier used for lyrics generation is verified
- The chosen model is explicitly documented and locked
- No ambiguous or placeholder model names remain in code

### Decisions
- D-001 and D-003 in `DECISIONS.md` are updated to `Resolved`
- The resolution text reflects the actual implementation

---

## Notes for Agent
This iteration is contract-focused.
Do not optimize, refactor, or redesign.
If removal of code is the correct resolution, removal is preferred over stubbing.
