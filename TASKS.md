# TASKS.md

## P0 – Kritiske (korrekthet / policy-brudd)

### Task 1: Splitt useHistoryAtom for å unngå dobbel init

**Status:** ✅ Completed

**Verifisert:**
- `useInitializeHistory()` oppretter og returnerer history, kjører fetch kun én gang
- `useHistoryActions()` gir add/update/delete/feedback uten init-effekt
- App.tsx bruker `useInitializeHistory()`, NowPlayingBar bruker `useHistoryActions()`
- Begge bruker `globalErrorAtom` for feilhåndtering

---

### Task 2: Fiks A11y/AGENTS-brudd

**Status:** ✅ Completed

**Verifisert:**
- Header bruker `t.headings.mixtapeStudio` og `t.headings.tagline`
- NowPlayingBar har `title={displayTitle + variationLabel}` på trunkert tekst
- Resize-handle har `role="separator"`, `tabIndex={0}`, `onKeyDown`, `aria-label`
- useResizable returnerer `handleKeyDown` for ArrowLeft/ArrowRight

---

### Task 3: Legg til ErrorBoundary

**Status:** ✅ Completed

**Verifisert:**
- ErrorBoundary-komponent med `getDerivedStateFromError`, fallback UI, reload-knapp
- Bruker CSS-variabler, har `role="alert"` og `aria-label`
- App.tsx wrapper `<main>` og `<NowPlayingBar>` med ErrorBoundary

---

## P1 – Viktige forbedringer

### Task 4: Fjern redundant playlist-state

**Status:** ✅ Completed

**Verifisert:**
- `playlistSongs` lokal state er fjernet fra HistoryList
- Bruker kun `currentPlaylistSongsAtom` via `useAtomValue`
- Feedback-oppdatering synkroniserer med `setCurrentPlaylistSongs`

---

### Task 5: Fiks filteredHistoryAtom-synk

**Status:** ✅ Completed

**Verifisert:**
- `filteredHistoryAtom` er nå en derived atom (linje 48-57 i atoms.ts)
- Leser fra `historyAtom` og `filterAtom`
- Ingen imperativ setting via useEffect
- HistoryList bruker `useAtomValue(filteredHistoryAtom)` og `useAtom(filterAtom)`

---

### Task 6: Optimaliser playlist-save

**Status:** ✅ Completed

**Verifisert:**
- PlaylistEditor.handleClose beregner nå diff:
  - `toRemove`: entries som finnes i existing men ikke i nye
  - `toAdd`: entries som finnes i nye men ikke i existing
- Kun nødvendige API-kall gjøres

---

### Task 7: Standardiser feilhåndtering

**Status:** ✅ Completed

**Verifisert:**
- `globalErrorAtom` eksisterer i atoms.ts
- `ErrorBanner` komponent med `role="alert"` og auto-dismiss
- useHistoryAtom bruker `setGlobalError` ved feil
- DetailPanel har `role="alert" aria-live="polite"` på error-div

---

### Task 8: Fjern redundant nowPlayingItem-lookup

**Status:** ✅ Completed

**Verifisert:**
- App.tsx bruker `nowPlaying` direkte fra `nowPlayingAtom`
- Sender `nowPlaying ?? null` til DetailPanel som `nowPlayingItem`
- Ingen ekstra `.find()` i App.tsx

---

## P2 – Nice-to-have

### Task 9: Type guards for errors

**Status:** ✅ Completed

**Verifisert:**
- `frontend/src/utils/errors.ts` inneholder `getErrorMessage(err: unknown): string`
- Håndterer Error, string, og objekter med message-property
- Brukes i DetailPanel og PlaylistEditor med `catch (err: unknown)`

---

### Task 10: Fjern debug logging

**Status:** ✅ Completed

**Verifisert:**
- App.tsx: `console.log` er wrappet i `if (import.meta.env.DEV)` ✅
- api.ts: WebSocket-logging er nå wrappet i `if (import.meta.env.DEV)` ✅

---

### Task 11: Oppdater dokumentasjon (fjern D-055)

**Status:** ✅ Completed

**Verifisert:**
- D-055 ble aldri lagt til DECISIONS.md (filen sluttet ved D-054)
- SPEC.md inneholder ikke §14 Advanced Mixtape Editor
- ARCHITECTURE.md oppdatert: fjernet "mixtape editors" fra drag-and-drop-beskrivelsen
