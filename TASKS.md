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

### Task 8: Flytt duration fra thumbnail-overlay til inline ved tittel

**Status:** Completed

**Goal:** Flytte duration-visning fra thumbnail-overlay til ved siden av tittel for å unngå visuell konkurranse med play/pause-knapp.

**Changes:**

- Fjernet duration overlay element fra thumbnailWrapper i HistoryItem.tsx
- Lagt til duration som inline element ved siden av tittel inne i historyMeta
- Duration vises nå som `{displayTitle}{variationLabel} {duration}` på samme linje som tittel
- Fjernet `.durationOverlay` CSS klasse (ikke lenger nødvendig)
- Fjernet `.nowPlaying .thumbnailWrapper` box-shadow (ikke lenger nødvendig siden overlay er borte)
- Lagt til ny `.durationLabel` CSS klasse for inline styling:
  - Margin-left for spacing fra tittel
  - Font-size 0.75rem (mindre enn tittel)
  - Font-weight 400 (normal, ikke bold)
  - Color: `--color-text-dim` for subtil visning
- Play/pause-knapp har nå hele thumbnail for seg selv uten visuell konkurranse
- formatDuration() funksjonen beholdes og brukes fortsatt

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`

---

### Task 7: Klarere visuell distinksjon mellom hovered, selected og currently playing items

**Status:** Completed

**Goal:** Implementere tydelig men subtil visuell distinksjon mellom forskjellige item-states (hover, selected, playing) i sanglisten.

**Changes:**

- **Hover state**: Uendret - kun subtil border-color change til `--color-border-strong`
- **Selected state**:
  - Økt bakgrungs-opacity fra 0.02 til 0.04 (dobbelt så sterk)
  - Lagt til `border-color: var(--color-border-strong)` for ekstra distinksjon
- **Playing state (.nowPlaying)**:
  - Økt border-left tykkelse fra 2px til 3px for tydeligere accent bar
  - Økt bakgrungs-opacity fra 0.03 til 0.05
  - Lagt til `border-color: var(--color-primary)` for tydelig primary accent
  - Lagt til subtil glow rundt thumbnail med `box-shadow: 0 0 0 2px var(--color-primary-alpha)`
- **Play button active state**:
  - Lagt til `box-shadow: 0 0 8px var(--color-primary-alpha)` for subtil glow når sangen spiller
- Ingen strukturelle endringer, kun CSS-oppdateringer
- Bruker kun eksisterende CSS-variabler (følger AGENTS.md)
- Layout uendret

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`

---

### Task 6: Vis play/pause-button oppå thumbnail som i Suno

**Status:** Completed

**Goal:** Flytte play/pause-button fra actions-området til å vises sentrert oppå thumbnail-bildet, akkurat som Suno gjør.

**Changes:**

- Flyttet play/pause button-element fra `.historyActions` til inne i `.thumbnailWrapper`
- Button er nå absolutt posisjonert sentrert med `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`
- Lagt til ny CSS-klasse `.playButtonOverlay` med sirkulær form (border-radius: 50%)
- Semi-transparent bakgrunn (rgba(0, 0, 0, 0.6)) for god synlighet oppå bildet
- Subtil hvit border (rgba(255, 255, 255, 0.3)) for bedre definisjon
- Hover-effekt: mørkere bakgrunn, primary border-color, og scale(1.1) transform
- Active state bruker primary colors for å vise at sangen spiller
- Button vises alltid når audioUrl finnes (ikke kun på hover)
- Duration overlay forblir i nederste høyre hjørne
- Følger AGENTS.md regler: aria-label, aria-pressed, CSS-variabler

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`

---

### Task 5: Vis duration overlay på thumbnail som i Suno

**Status:** Completed

**Goal:** Vise sangens varighet (duration) som overlay på thumbnail-bildet i historikklisten, tilsvarende som Suno gjør.

**Changes:**

- Lagt til `formatDuration()` helper-funksjon som formaterer sekunder til MM:SS format
- Lagt til `.thumbnailWrapper` div rundt thumbnail med relative positioning
- Lagt til `.durationOverlay` div som viser formatert duration
- Duration overlay vises kun når `item.duration` eksisterer
- Overlay er posisjonert nederst i høyre hjørne av thumbnail med semi-transparent bakgrunn
- Redusert størrelse: font-size 0.6rem, padding 1px 4px

**Files:**

- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`

---

### Task 4: Skjul "Create mixtape"-knapp og "Advanced" når upload-skjema er aktivt

**Status:** Completed

**Goal:** Skjule "Create mixtape (6 songs · 28:49)" og "Advanced"-knapp når brukeren holder på med file upload

**Changes:**

- La til `onUploadFormChange` callback prop i UploadButton
- UploadButton kaller callback via useEffect når `showForm` state endrer seg
- HistoryList tracker upload form state med `isUploadFormActive` state
- MixtapeButton og AdvancedMixtapeButton rendres kun når `!isUploadFormActive`

**Files:**

- `frontend/src/components/history/UploadButton/UploadButton.tsx`
- `frontend/src/components/history/HistoryList.tsx`

---

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
