# TASKS.md

## Støtte for flere lydfilformater ved opplasting

Utvid opplastingsfunksjonen til å akseptere de vanligste lydfilformatene i tillegg til MP3: FLAC, WAV, OGG, M4A, AAC, AIFF og Opus.

**Bakgrunn:**
- Backend-validering i `backend/src/routes/upload.ts` avviser alle filer som ikke er `audio/mpeg` eller `audio/mp3`.
- `getUniqueFilename` hardkoder `.mp3`-endelsen (linje 73).
- Frontend-filinputtet aksepterer bare `audio/mpeg,audio/mp3,.mp3` (linje 110 i `UploadButton.tsx`).
- Tittel-strippingen i `UploadButton.tsx` fjerner kun `.mp3`-endelsen (linje 36).
- FFmpeg og `music-metadata` støtter allerede alle disse formatene – ingen nye avhengigheter trengs.
- Det eksisterende `/mp3s`-endepunktet og `backend/mp3s/`-mappen brukes som de er (nye filtyper lagres der).

**Støttede MIME-typer som skal aksepteres:**

| Format | MIME-typer |
|--------|-----------|
| MP3 | `audio/mpeg`, `audio/mp3` |
| FLAC | `audio/flac`, `audio/x-flac` |
| WAV | `audio/wav`, `audio/x-wav`, `audio/wave` |
| OGG | `audio/ogg` |
| M4A | `audio/mp4`, `audio/x-m4a` |
| AAC | `audio/aac` |
| AIFF | `audio/aiff`, `audio/x-aiff` |
| Opus | `audio/opus` |

---

## Task 1.1: Backend – Utvid aksepterte lydformater i upload.ts

**Status:** Ikke påbegynt

**Fil:** `backend/src/routes/upload.ts`

**Endringer:**

1. **Oppdater multer `fileFilter`** (linje 95–101): Erstatt den eksisterende sjekken med en liste over alle aksepterte MIME-typer:
   ```typescript
   const ALLOWED_AUDIO_MIMETYPES = new Set([
     'audio/mpeg',
     'audio/mp3',
     'audio/flac',
     'audio/x-flac',
     'audio/wav',
     'audio/x-wav',
     'audio/wave',
     'audio/ogg',
     'audio/mp4',
     'audio/x-m4a',
     'audio/aac',
     'audio/aiff',
     'audio/x-aiff',
     'audio/opus',
   ]);
   ```
   Sjekk: `if (ALLOWED_AUDIO_MIMETYPES.has(file.mimetype))`.
   Feilmelding ved avvisning: `'Only audio files are allowed (MP3, FLAC, WAV, OGG, M4A, AAC, AIFF, Opus)'`.

2. **Oppdater `getUniqueFilename`** (linje 72–85): Legg til parameter `ext: string` og erstatt den hardkodede `'.mp3'` med `ext`:
   ```typescript
   function getUniqueFilename(baseFilename: string, ext: string): string {
     let filename = `${baseFilename}${ext}`;
     let filePath = path.join(mp3Dir, filename);
     let counter = 1;
     while (fs.existsSync(filePath)) {
       filename = `${baseFilename}_${counter}${ext}`;
       filePath = path.join(mp3Dir, filename);
       counter++;
     }
     return filename;
   }
   ```

3. **Oppdater route-handleren** (linje 129–165): I løkken, hent filendelsen fra det originale filnavnet og pass den til `getUniqueFilename`:
   ```typescript
   const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
   const filename = getUniqueFilename(sanitized, ext);
   ```

---

## Task 1.2: Frontend – Oppdater UploadButton til å akseptere alle lydformater

**Status:** Ikke påbegynt

**Fil:** `frontend/src/components/history/UploadButton/UploadButton.tsx`

**Endringer:**

1. **Oppdater `accept`-attributtet** på `<input type="file">` (linje 110):
   ```
   accept="audio/mpeg,audio/mp3,audio/flac,audio/x-flac,audio/wav,audio/x-wav,audio/wave,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/aiff,audio/x-aiff,audio/opus,.mp3,.flac,.wav,.ogg,.m4a,.aac,.aiff,.aif,.opus"
   ```

2. **Oppdater tittel-strippingen** i `handleFileSelect` (linje 36): Erstatt `.replace(/\.mp3$/i, '')` med regex som fjerner alle støttede endelser:
   ```typescript
   title: file.name.replace(/\.(mp3|flac|wav|ogg|m4a|aac|aiff|aif|opus)$/i, ''),
   ```

3. **Bytt `t.actions.uploadMp3` med `t.actions.uploadAudio`** begge steder det brukes (linje 114 og 122).

---

## Task 1.3: Frontend – Oppdater i18n-strenger i en.ts

**Status:** Ikke påbegynt

**Fil:** `frontend/src/i18n/en.ts`

**Endringer:**

1. I `actions`-objektet: gi nytt navn fra `uploadMp3: 'Upload MP3'` til `uploadAudio: 'Upload music'`.

---

## Task 1.4: Oppdater SPEC.md

**Status:** Ikke påbegynt

**Fil:** `SPEC.md`

**Endringer:**

1. I seksjon **11. Upload MP3 Files**, oppdater:
   - Overskriften fra `### 11. Upload MP3 Files` til `### 11. Upload Audio Files`
   - Punkt 2 fra `"File picker opens, user can select one or multiple MP3 files"` til `"File picker opens, user can select one or multiple audio files"`
   - Kravet `"Only MP3 format accepted"` til `"Accepted formats: MP3, FLAC, WAV, OGG, M4A, AAC, AIFF, Opus"`
   - Punkt 7 i **Filename rules**: fjern `.mp3` fra eksemplene (`_1.mp3, _2.mp3` → `_1, _2` med korrekt endelse)
   - Flytt/oppdater `"Uploaded songs appear in history and can be liked/disliked"` – beholder seg uendret

---

## Testplan (etter gjennomføring)

1. Last opp en `.flac`-fil – verifiser at den vises i historikken og kan spilles av
2. Last opp en `.wav`-fil – verifiser det samme
3. Last opp en `.ogg`-fil – verifiser det samme
4. Last opp en `.m4a`-fil – verifiser det samme
5. Last opp en `.aac`-fil – verifiser det samme
6. Last opp en `.aiff`-fil – verifiser det samme
7. Last opp en `.opus`-fil – verifiser det samme
8. Verifiser at tittelfeltet forhåndsfylles uten filendelsen (f.eks. `song.flac` → `song`)
9. Verifiser at en fil med ugyldig type (f.eks. `.pdf`) avvises med feilmelding
10. Verifiser at en likt FLAC-sang inkluderes korrekt i mixtape-generering
11. Verifiser at eksisterende MP3-opplasting fortsatt fungerer
