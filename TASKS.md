# TASKS.md

## P0 – Kritiske (korrekthet / policy-brudd)

### Task 3: Legg til ErrorBoundary

**Status:** Completed

**Problem:**
Ingen error boundary – én runtime-feil kan ta ned hele appen.

**Løsning:**
1. Lag `ErrorBoundary`-komponent med fallback UI og "Reload"-knapp
2. Wrap `<main>` i `App.tsx` med ErrorBoundary
3. Vurder separate boundaries for DetailPanel/HistoryPanel/NowPlayingBar

**Filer:**
- `frontend/src/components/common/ErrorBoundary/ErrorBoundary.tsx` (ny)
- `frontend/src/App.tsx`

---

### Task 2: Fiks A11y/AGENTS-brudd

**Status:** Completed

**Problem:**
- Hardkodet tekst i `App.tsx` header (mangler i18n)
- Trunkert tittel i NowPlayingBar uten `title`-attributt
- Resize-handle uten `role`, `tabIndex`, keyboard handlers

**Løsning:**
1. Legg til i18n-nøkler for "Mixtape Studio" og "Upload your music..."
2. Legg til `title={displayTitle + variationLabel}` på trunkert tekst
3. Gjør resize-handle til `role="separator"` med `tabIndex={0}` og keyboard-støtte (piltaster)

**Filer:**
- `frontend/src/App.tsx`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
- `frontend/src/i18n/en.ts`

---

### Task 3: Legg til ErrorBoundary

**Status:** Pending

**Problem:**
Ingen error boundary – én runtime-feil kan ta ned hele appen.

**Løsning:**
1. Lag `ErrorBoundary`-komponent med fallback UI og "Reload"-knapp
2. Wrap `<main>` i `App.tsx` med ErrorBoundary
3. Vurder separate boundaries for DetailPanel/HistoryPanel/NowPlayingBar

**Filer:**
- `frontend/src/components/common/ErrorBoundary/ErrorBoundary.tsx` (ny)
- `frontend/src/App.tsx`

---

## P1 – Viktige forbedringer

### Task 4: Fjern redundant playlist-state

**Status:** Completed

**Problem:**
`playlistSongs` (lokal i HistoryList) + `currentPlaylistSongsAtom` (global) holdes i sync manuelt → drift-risiko.

**Løsning:**
Fjern `playlistSongs` lokal state og bruk kun `currentPlaylistSongsAtom`. Oppdater alle referanser.

**Filer:**
- `frontend/src/components/history/HistoryList.tsx`

---

### Task 5: Fiks filteredHistoryAtom-synk

**Status:** Completed

**Problem:**
`filteredHistoryAtom` settes i `useEffect` med ny array hver render → unødvendige atom-updates og re-renders.

**Løsning:**
Gjør `filteredHistoryAtom` til en derived atom som leser fra `historyAtom` og en `filterAtom`, i stedet for imperativ setting.

**Filer:**
- `frontend/src/store/atoms.ts`
- `frontend/src/components/history/HistoryList.tsx`

---

### Task 6: Optimaliser playlist-save

**Status:** Completed

**Problem:**
`PlaylistEditor.handleClose` fjerner alle sanger via O(n) API-kall før re-adding. Tregt med mange sanger.

**Løsning:**
Beregn diff i frontend: `toRemove` og `toAdd`, kall bare nødvendige APIer.

**Filer:**
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx`

---

### Task 7: Standardiser feilhåndtering

**Status:** Completed

**Problem:**
Noen komponenter viser feil i UI, andre bare `console.error`.

**Løsning:**
1. Lag `globalErrorAtom` + `ErrorBanner`-komponent med `role="alert"`
2. Oppdater `useHistoryAtom` actions til å sette global error ved feil
3. Legg til `role="alert"` på eksisterende error-meldinger i DetailPanel

**Filer:**
- `frontend/src/store/atoms.ts`
- `frontend/src/store/useHistoryAtom.ts`
- `frontend/src/components/common/ErrorBanner/ErrorBanner.tsx` (ny)
- `frontend/src/components/panels/DetailPanel.tsx`
- `frontend/src/App.tsx`

---

### Task 8: Fjern redundant nowPlayingItem-lookup

**Status:** Completed

**Problem:**
`App.tsx` slår opp `nowPlayingItem` selv om `nowPlayingAtom` allerede gjør dette.

**Løsning:**
Fjern `nowPlayingItem`-variabelen og bruk `nowPlaying` direkte (eller pass `nowPlayingAtom` til DetailPanel).

**Filer:**
- `frontend/src/App.tsx`

---

## P2 – Nice-to-have

### Task 9: Type guards for errors

**Status:** Completed

**Problem:**
Bruker `err: any` i catch-blokker.

**Løsning:**
Lag en utility `getErrorMessage(err: unknown): string` og bruk den i alle catch-blokker.

**Filer:**
- `frontend/src/utils/errors.ts` (ny)
- `frontend/src/components/panels/DetailPanel.tsx`
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx`

---

### Task 10: Fjern debug logging

**Status:** Completed

**Problem:**
`console.log('Received Suno update:', data)` og annen debug-logging bør fjernes i produksjon.

**Løsning:**
Fjern eller guard med `import.meta.env.DEV`.

**Filer:**
- `frontend/src/App.tsx`
- `frontend/src/store/useHistoryAtom.ts`

---

## Oppdater dokumentasjon

### Task 11: Fjern D-055 fra DECISIONS.md

**Status:** Completed

**Problem:**
Advanced Mixtape Editor er fjernet (per TASKS.md completed task), men D-055 dokumenterer fortsatt denne funksjonaliteten.

**Løsning:**
Marker D-055 som "Superseded" eller fjern den.

**Filer:**
- `DECISIONS.md`
- `SPEC.md` (fjern §14 Advanced Mixtape Editor)
- `ARCHITECTURE.md` (fjern mixtape-referanser)
