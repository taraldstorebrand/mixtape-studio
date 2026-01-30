# TASKS.md

## Current Task

No active task

## Pending Tasks

### Task 1: Utvid database med artist og album-felter

**Goal:** Legg til `artist` og `album` som nye kolonner i `history_items`-tabellen. Oppdater TypeScript-typer og database-funksjonalitet for å håndtere disse feltene. Når vi genererer sanger selv, skal artist settes til "Mixtapte Studio AI" og album skal være blankt.

**Files:**

- `shared/types/index.ts` - Legg til artist og album i HistoryItem-interfacet
- `backend/src/db/index.ts` - Legg til kolonner i database schema og migrering
- `backend/src/db/index.ts` - Oppdater rowToHistoryItem, createHistoryItem, og updateHistoryItem funksjoner

**Details:**

- Legg til `artist TEXT` og `album TEXT` kolonner i history_items-tabellen
- Kjør migrering for eksisterende databaser (sjekk om kolonnene eksisterer)
- Oppdater HistoryItemRow interface med de nye feltene
- Håndter mapping mellom database og TypeScript typer

---

### Task 2: Ekstraher metadata fra uploaded MP3-filer

**Goal:** Når brukere laster opp MP3-filer, ekstraher artist, album og genre fra filens metadata (ID3 tags). Bruk disse verdiene når de er tilgjengelige.

**Files:**

- `backend/src/routes/upload.ts` (eller relevant upload-handler fil)
- `package.json` - Legg til metadata-bibliotek hvis nødvendig (f.eks. music-metadata)

**Details:**

- Les ID3 tags fra uploaded MP3-filer
- Ekstraher artist, album og genre fra metadata
- Bruk disse verdiene når du oppretter history item for uploaded fil
- Hvis metadata mangler: la feltene være undefined/null

---

### Task 3: Vis artist og genre i DetailPanel ReadonlyView

**Goal:** Vis "artist - genre" under tittelen i ReadonlyView-komponenten i DetailPanel. Dette gir brukeren mer informasjon om sangen.

**Files:**

- `frontend/src/components/panels/DetailPanel/ReadonlyView/ReadonlyView.tsx`
- `frontend/src/components/panels/DetailPanel.module.css` (styling hvis nødvendig)

**Details:**

- Legg til visning av artist under tittel i ReadonlyView
- Format: "[artist] - [genre]" (kun vis hvis verdier finnes)
- Hvis bare artist finnes: vis bare artist
- Hvis bare genre finnes: vis bare genre
- Bruk eksisterende styles eller legg til nye om nødvendig

---

### Task 4: Lag engangs-migreringsscript

**Goal:** Lag et engangs-migreringsscript som setter artist="Mixtapte Studio AI" for alle eksisterende genererte sanger (der isUploaded !== true), og som ekstraherer metadata fra eksisterende uploaded filer. Scriptet skal slettes etter kjøring.

**Files:**

- `backend/src/scripts/migrate-existing-songs.ts` - Nytt migreringsscript

**Details:**

- Hent alle history items
- For genererte sanger (isUploaded !== true):
  - Sett artist="Mixtapte Studio AI"
- For uploaded sanger (isUploaded === true):
  - Kjør metadata-ekstraksjon (music-metadata eller mediainfo) på filen
  - Ekstraher artist, album og genre fra filens metadata
  - Oppdater history item med ekstraherte verdier
- Logg antall oppdaterte sanger i begge kategorier
- Dette scriptet skal bare kjøres én gang etter brukerens godkjenning
- Scriptet skal slettes etter vellykket kjøring

---

## Constraints

- Follow AGENTS.md style rules
- No new dependencies (unntatt metadata-bibliotek for Task 2 hvis nødvendig)
- Minimal changes to existing architecture
- Bakoverkompatibilitet: eksisterende sanger uten artist/album skal fortsatt fungere

---

## Completed

Tasks completed before this session have been archived.
