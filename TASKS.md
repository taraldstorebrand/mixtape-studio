# TASKS.md

## Playlist Cover – Redigering og inkludering i mixtape

Legg til støtte for å laste opp og redigere et forsidebilde (cover) for en playlist, og sørg for at dette bildet brukes som cover art når en mixtape genereres fra playlisten.

**Bakgrunn:**
- `coverImageUrl`-feltet finnes allerede i `Playlist`-typen (`shared/types/index.ts`) og i databaseskjemaet (`cover_image_url`-kolonne i `playlists`-tabellen), men er ikke implementert i UI eller backend-endepunkter.
- Mixtape-generering i `backend/src/routes/mixtape.ts` bruker alltid `/assets/placeholder.png` som cover art i FFmpeg-kommandoen, uavhengig av om playlisten har et eget bilde.

---

## Fase 1: Backend

### Task 1.1: Opprett endepunkt for opplasting av playlist-cover

**Status:** Ferdig

**Beskrivelse:**
Opprett et nytt endepunkt som tar imot en bildefil og lagrer den som cover for en playlist. Bruk eksisterende `multer`-oppsett fra `upload.ts` som referanse.

**Forventet oppførsel:**
- Rute: `POST /api/playlists/:id/cover`
- Aksepter én bildefil (JPEG eller PNG), maks 5 MB
- Lagre bildet i `backend/images/playlists/` (opprett mappen hvis den ikke finnes)
- Filnavn: `{playlistId}.{ext}` (overskriv hvis cover allerede finnes)
- Oppdater `cover_image_url`-kolonnen i `playlists`-tabellen for den aktuelle playlisten
- Svar med `{ coverImageUrl: '/images/playlists/{playlistId}.{ext}' }`
- Returner 404 hvis playlisten ikke finnes
- Returner 400 hvis ingen fil er lastet opp eller filtypen er ugyldig

**Filer som skal endres:**
- `backend/src/routes/playlists.ts`
  - Legg til multer-instans konfigurert for bildeopplasting (kun `image/jpeg` og `image/png`, maks 5 MB)
  - Legg til route: `router.post('/:id/cover', upload.single('cover'), handleCoverUpload)`
  - Implementer `handleCoverUpload`-handler

- `backend/src/server.ts` (hvis nødvendig)
  - Sørg for at `/images/playlists` serveres statisk (det finnes allerede `app.use('/images', express.static(...))`, så undermapper dekkes automatisk)

---

### Task 1.2: Bruk playlist-cover som cover art i mixtape-generering

**Status:** Ferdig

**Beskrivelse:**
Oppdater mixtape-genereringen slik at den bruker playlistens `coverImageUrl` som cover art i den genererte lydfilen, i stedet for alltid å bruke placeholder-bildet.

**Forventet oppførsel:**
- Hent `cover_image_url` fra databasen for playlisten når mixtape genereres via `POST /api/mixtape/playlist/:playlistId`
- Hvis `cover_image_url` er satt: bruk dette bildet som cover i FFmpeg-kommandoen
- Hvis `cover_image_url` er `null`: fall tilbake til eksisterende placeholder (`/assets/placeholder.png`)
- Liked-mixtape (`POST /api/mixtape/liked`) påvirkes ikke av denne endringen

**Filer som skal endres:**
- `backend/src/routes/mixtape.ts`
  - I playlist-mixtape-handleren: hent playlist-raden fra databasen og les `cover_image_url`
  - Bygg opp riktig absolutt filsti til bildet basert på URL-en (f.eks. `/images/playlists/abc.jpg` → `backend/images/playlists/abc.jpg`)
  - Send filstien til den eksisterende FFmpeg-logikken som allerede håndterer cover art-innsetting
  - Legg til sjekk: verifiser at bildefilen faktisk eksisterer på disk før bruk, ellers fall tilbake til placeholder

---

## Fase 2: Frontend

### Task 2.1: Legg til cover-editor i PlaylistEditor

**Status:** Ferdig

**Beskrivelse:**
Legg til en klikk-for-å-laste-opp cover-seksjon øverst i `PlaylistEditor`-komponenten. Bruker skal kunne klikke på et bilde (eller placeholder) for å velge en bildefil fra disk. Bildet lastes opp umiddelbart og forhåndsvisning vises.

**Forventet oppførsel:**
- Vis et kvadratisk bilde øverst i editoren (f.eks. 120×120 px)
  - Hvis playlisten har `coverImageUrl`: vis dette bildet
  - Ellers: vis et nøytralt placeholder-bilde eller et ikon med teksten «Legg til cover»
- Ved klikk: åpne en skjult `<input type="file" accept="image/jpeg,image/png">` via `ref`
- Når bruker velger fil:
  1. Valider at filen er JPEG eller PNG og maks 5 MB – vis feilmelding ellers
  2. Kall `uploadPlaylistCover(playlistId, file)` fra api.ts
  3. Oppdater lokal state med den returnerte `coverImageUrl` slik at bildet vises umiddelbart
  4. Vis en lastespinner over bildet mens opplasting pågår
- Dersom det allerede finnes et cover: erstatt det (samme klikk-for-å-endre-oppførsel)

**Filer som skal endres:**
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx`
  - Legg til cover-bilde-seksjon med `<input type="file" ref={...} hidden>`
  - Legg til `handleCoverChange`-handler
  - Vis opplastingsstatus (spinner/feil)

---

### Task 2.2: Legg til `uploadPlaylistCover` i api.ts

**Status:** Ferdig

**Beskrivelse:**
Legg til en funksjon i `frontend/src/services/api.ts` for å laste opp et cover-bilde til en playlist.

**Forventet oppførsel:**
- Funksjonssignatur: `uploadPlaylistCover(playlistId: string, file: File): Promise<{ coverImageUrl: string }>`
- Send `multipart/form-data` POST-request til `/api/playlists/{playlistId}/cover` med feltet `cover`
- Kast feil med beskrivende melding ved HTTP-feil

**Filer som skal endres:**
- `frontend/src/services/api.ts`
  - Legg til `uploadPlaylistCover`-funksjon

---

### Task 2.3: Oppdater `updatePlaylist` / Playlist-state til å inkludere coverImageUrl

**Status:** Ferdig

**Beskrivelse:**
Sørg for at `coverImageUrl` returneres fra backend når en playlist hentes, og at frontend-tilstanden oppdateres korrekt etter cover-opplasting.

**Forventet oppførsel:**
- Verifiser at `GET /api/playlists/:id` og `GET /api/playlists` returnerer `coverImageUrl` i responsen (sjekk eksisterende backend-kode – feltet mappes muligens allerede fra `cover_image_url`)
- Hvis feltet ikke mappes: oppdater db-spørringer i `backend/src/routes/playlists.ts` til å inkludere det
- Etter vellykket `uploadPlaylistCover`-kall i `PlaylistEditor`: oppdater den relevante Jotai-atomen / lokale state slik at den nye `coverImageUrl` reflekteres uten side-refresh

**Filer som skal endres:**
- `backend/src/routes/playlists.ts` (ved behov – legg til `cover_image_url` i SELECT-spørringer)
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx` (state-oppdatering)
- Eventuelle Jotai-atomer eller hooks som holder playlist-data

---

## Testplan (etter gjennomføring)

### Verifisering

1. Åpne en eksisterende playlist i PlaylistEditor
2. Klikk på cover-området – velg en JPEG/PNG-fil
3. Verifiser at bildet vises umiddelbart i editoren
4. Generer en mixtape fra playlisten
5. Åpne den nedlastede filen i en mediespiller – verifiser at playlistens cover vises som album art
6. Test at liked-mixtape fortsatt bruker placeholder
7. Test at en playlist uten cover bruker placeholder i mixtapen
8. Test avvisning av ugyldig filtype og for stor fil
