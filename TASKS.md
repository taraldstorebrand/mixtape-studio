# TASKS.md

## Current Task

No active task

## Pending Tasks

### Task 1: Skjul copy-ikon for uploadede sanger

**Goal:** Ikke vis copy-ikonet i ReadonlyView dersom den valgte sangen er uploaded (item.isUploaded === true), da vi mangler data som kan kopieres (lyrics, prompt, etc.).

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`

---

### Task 2: Aligner timestamp og "Uploaded"-label til høyre

**Goal:** Sørg for at timestamp og eventuelt "Uploaded"-label er alignet over hverandre, trolig orientert i forhold til høyresiden ettersom lengden på sangtitler kan variere.

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`
- Eventuelt `frontend/src/components/history/HistoryItem/HistoryItem.tsx` hvis strukturelle endringer er nødvendig

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies
- Minimal changes to existing architecture

---

## Completed

Tasks completed before this session have been archived.
