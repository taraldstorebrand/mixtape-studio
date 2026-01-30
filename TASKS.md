# TASKS.md

## Current Task

No active task

## Pending Tasks

Ingen ventende oppgaver

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies
- Minimal changes to existing architecture

---

## Completed

### Task 3: Tone ned visuell dominans for progressbar og volumebar

**Status:** Completed

**Goal:** Gjøre progressbar og volumebar mindre visuelt dominerende

**Changes:**

- Redusert standard høyde fra 4px til 3px
- Redusert hover-høyde fra 6px til 5px (mer diskré)
- Lagt til `opacity: 0.7` på progressFill og volumeFill for mer subtil effekt
- Lagt til hover-effekt som øker opacity til 1 ved interaksjon
- Progress er fortsatt tydelig synlig på mørk bakgrunn

**Files:**

- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`
