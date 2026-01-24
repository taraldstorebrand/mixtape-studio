# TASKS.md

## Iteration 009 – History only for successful Suno generations

### Goal
Change history behavior so that only Suno song generations create history entries. ChatGPT lyrics generation alone does not create entries. Failed Suno generations are removed from history.

---

## In Scope

### Frontend
- Remove history creation from `handleGenerateLyrics`
- Add logic to remove history entry when Suno status becomes "failed"

---

## Files Allowed to Change
- frontend/src/App.tsx
- DECISIONS.md
- SPEC.md

---

## Acceptance Criteria
- ChatGPT lyrics generation does NOT create history entries
- Suno generation creates history entry on start (pending status)
- Failed Suno generations are automatically removed from history
- D-029 added to DECISIONS.md

---

## Completed Iterations

| Iteration | Description |
|-----------|-------------|
| 008 | Genre field with searchable history |
| 007 | Two-panel resizable layout |
| 006 | Required title and generation spinner |
| 005 | Serve local MP3 files |
| 004 | Local MP3 download |
| 003 | Fix Suno audio URL source |
| 002 | Resolve backend contract gaps |
