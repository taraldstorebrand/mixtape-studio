# TASKS.md

## Backend Code Review

### Overview
Systematic review of the largest backend files to identify potential improvements, refactoring opportunities, and code quality issues.

---

## Files to Review (sorted by size)

| # | File | Lines | Status |
|---|------|-------|--------|
| 1 | `backend/src/services/suno.ts` | 369 | ✅ Done |
| 2 | `backend/src/routes/mixtape.ts` | 300 | ✅ Done |
| 3 | `backend/src/db/index.ts` | 294 | ✅ Done |
| 4 | `backend/src/routes/upload.ts` | 177 | ✅ Done |
| 5 | `backend/src/routes/history.ts` | 107 | ✅ Done |
| 6 | `backend/src/server.ts` | 78 | ✅ Done |

---

## Review Checklist (per file)

For each file, evaluate:

- [ ] **Structure**: Is the code well-organized? Should it be split into smaller modules?
- [ ] **Error handling**: Are errors handled consistently and appropriately?
- [ ] **Types**: Are TypeScript types properly defined and used?
- [ ] **Duplication**: Is there repeated code that could be extracted?
- [ ] **Security**: Are there any security concerns (input validation, etc.)?
- [ ] **Performance**: Any obvious performance issues?
- [ ] **Documentation**: Are complex parts adequately commented?

---

## Review Notes

### 1. backend/src/services/suno.ts (369 lines)
> Status: ✅ Reviewed

**Oppsummering:** Suno API-integrasjon for generering av sanger. Håndterer polling, nedlasting av MP3/bilder, og WebSocket-oppdateringer.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ⚠️ OK | Kunne splittes: types → `suno.types.ts`, helpers → `suno.utils.ts` |
| Error handling | ⚠️ OK | Blandet språk i feilmeldinger (norsk/engelsk) |
| Types | ✅ Bra | Gode TypeScript-typer definert (L16-72) |
| Duplication | ⚠️ | `downloadMp3` og `downloadImage` er nesten identiske (L110-134) |
| Security | ✅ OK | API-nøkkel sjekkes, ingen åpenbare sårbarheter |
| Performance | ✅ OK | Polling: 5s intervall, maks 10 min (L152-153) |
| Documentation | ⚠️ | Noen kommentarer, men komplekse funksjoner mangler docs |

#### Forbedringsforslag:

1. **Refaktorer download-funksjoner** - Slå sammen `downloadMp3` og `downloadImage` til én generisk funksjon
2. **Konsistent språk** - Endre alle feilmeldinger til engelsk:
   - L208: `"Kunne ikke hente status"` → `"Failed to fetch status"`
   - L282: `"Kunne ikke generere sang..."` → `"Failed to generate song..."`
   - L367: `"Kunne ikke hente status..."` → `"Failed to fetch song status..."`
3. **Ekstraher typer** - Flytt interfaces til egen fil for gjenbruk
4. **Legg til JSDoc** - Dokumenter `pollAndUpdate`, `generateSong`, `getSongStatus`

---

### 2. backend/src/routes/mixtape.ts (300 lines)
> Status: ✅ Reviewed

**Oppsummering:** Håndterer generering av mixtape-filer (M4B med kapitler). Bruker ffmpeg for å slå sammen MP3-filer.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ⚠️ | `generateMixtape()` er lang (~130 linjer), kunne splittes |
| Error handling | ⚠️ | Blandet norsk/engelsk i feilmeldinger |
| Types | ✅ OK | `MixtapeOptions` interface definert |
| Duplication | ⚠️ | Cleanup-logikk duplisert i ffmpeg handlers (L191-194, L203-206) |
| Security | ⚠️ | `downloadId` valideres ikke for path traversal |
| Performance | ⚠️ | `spawnSync` blokkerer event loop (L40) |
| Documentation | ⚠️ | Mangler JSDoc for hovedfunksjoner |

#### Forbedringsforslag:

1. **Security** - Valider `downloadId` parameter:
   ```typescript
   if (!/^[\w-]+$/.test(downloadId)) {
     return res.status(400).json({ error: 'Invalid download ID' });
   }
   ```
2. **Performance** - Vurder async alternativ til `spawnSync` i `getAudioDurationMs()`
3. **Konsistent språk** - Endre til engelsk:
   - L214: `"Kunne ikke lage mixtape"` → `"Failed to create mixtape"`
   - L267: `"Fil ikke funnet eller utløpt"` → `"File not found or expired"`
   - L293: `"Kunne ikke laste ned fil"` → `"Failed to download file"`
4. **Refaktorering** - Ekstraher ffmpeg Promise-logikk til egen funksjon
5. **Cleanup** - Ekstraher duplisert cleanup til `finally`-blokk eller egen funksjon

---

### 3. backend/src/db/index.ts (294 lines)
> Status: ✅ Reviewed

**Oppsummering:** SQLite database layer med better-sqlite3. Håndterer history items og genre history med prepared statements.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ✅ Bra | Godt organisert med seksjoner og prepared statements |
| Error handling | ⚠️ | Ingen try/catch rundt db-operasjoner |
| Types | ⚠️ | Bruker `Record<string, unknown>` + type assertions (L154-173) |
| Duplication | ⚠️ | `enforceHistoryLimit` og `enforceGenreLimit` er nesten like |
| Security | ✅ Bra | Prepared statements, WAL mode |
| Performance | ✅ OK | Indekser, cached statements. Startup cleanup kan være treg |
| Documentation | ⚠️ | Seksjonkommentarer, men ingen JSDoc |

#### Forbedringsforslag:

1. **Types** - Definer proper row types i stedet for `Record<string, unknown>`:
   ```typescript
   interface HistoryItemRow {
     id: string;
     prompt: string;
     // ...
   }
   ```
2. **Error handling** - Wrap database-operasjoner i try/catch
3. **Refaktorering** - Slå sammen `enforceHistoryLimit` og `enforceGenreLimit`:
   ```typescript
   function enforceLimit(countStmt, deleteStmt, limit) { ... }
   ```
4. **Migrations** - Ekstraher migrations til egen fil/funksjon (L52-65)
5. **Startup cleanup** - Vurder å kjøre async eller lazy for raskere oppstart (L67-99)

---

### 4. backend/src/routes/upload.ts (177 lines)
> Status: ✅ Reviewed

**Oppsummering:** Håndterer opplasting av MP3-filer med multer. Ekstraherer cover art og varighet fra filene.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ✅ OK | Logisk organisert med helpers først |
| Error handling | ⚠️ | Norske feilmeldinger, men god try/catch |
| Types | ✅ OK | Bruker Express.Multer.File |
| Duplication | ⚠️ | Duration-parsing duplisert (L44-49, L54-60), lik mixtape.ts |
| Security | ✅ Bra | Filtype-validering, størrelsesbegrensning, sanitizeFilename |
| Performance | ⚠️ | `execSync` blokkerer, sekvensiell prosessering |
| Documentation | ⚠️ | Minimale kommentarer |

#### Forbedringsforslag:

1. **Konsistent språk** - Endre til engelsk:
   - L105: `"Kun MP3-filer er tillatt"` → `"Only MP3 files allowed"`
   - L115: `"Ingen filer lastet opp"` → `"No files uploaded"`
   - L119: `"Maksimalt 10 filer..."` → `"Maximum 10 files..."`
   - L126: `"Ugyldig tittel-format"` → `"Invalid title format"`
   - L130: `"Antall titler må matche..."` → `"Title count must match..."`
   - L140: `"Tittel mangler..."` → `"Title missing..."`
   - L173: `"Kunne ikke laste opp..."` → `"Failed to upload..."`
2. **Refaktorering** - Ekstraher duration-parsing til delt util (brukes også i mixtape.ts)
3. **Performance** - Vurder `Promise.all` for parallell filprosessering
4. **Security** - Bruk array-basert spawn i stedet for string interpolation i `getMp3Duration`

---

### 5. backend/src/routes/history.ts (107 lines)
> Status: ✅ Reviewed

**Oppsummering:** CRUD API for historikk-elementer. Håndterer også sletting av tilknyttede MP3/bilde-filer.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ✅ Bra | Ryddig CRUD-struktur med route-kommentarer |
| Error handling | ✅ OK | God try/catch, men norske feilmeldinger |
| Types | ✅ Bra | Bruker shared HistoryItem type |
| Duplication | ⚠️ | 404-sjekk repetert (L52-55, L70-73), fil-sletting kunne vært util |
| Security | ⚠️ | Ingen validering av `id`-format, path traversal-risiko i filsletting |
| Performance | ✅ OK | Enkle sync-operasjoner |
| Documentation | ✅ OK | Route-kommentarer på plass |

#### Forbedringsforslag:

1. **Konsistent språk** - Endre til engelsk:
   - L22: `"Kunne ikke hente historikk"` → `"Failed to fetch history"`
   - L33: `"Mangler påkrevde felt..."` → `"Missing required fields..."`
   - L41: `"Kunne ikke opprette..."` → `"Failed to create..."`
   - L54, L72: `"Historikk-element ikke funnet"` → `"History item not found"`
   - L61: `"Kunne ikke oppdatere..."` → `"Failed to update..."`
   - L103: `"Kunne ikke slette..."` → `"Failed to delete..."`
2. **Security** - Valider `id` og filnavn før path-konstruksjon
3. **Refaktorering** - Ekstraher fil-sletting til en util-funksjon `deleteAssociatedFiles(item)`

---

### 6. backend/src/server.ts (78 lines)
> Status: ✅ Reviewed

**Oppsummering:** Express server med Socket.IO. Setter opp middleware, routes og statisk filservering.

#### Funn:

| Kategori | Vurdering | Kommentar |
|----------|-----------|-----------|
| Structure | ✅ Bra | Ryddig oppsett: middleware → routes → error handler |
| Error handling | ✅ Bra | Sentralisert errorHandler middleware |
| Types | ✅ OK | Standard Express types |
| Duplication | ✅ OK | Ingen duplisering |
| Security | ⚠️ | Mangler rate limiting, helmet, compression |
| Performance | ✅ OK | Cleanup-intervall på 5 min |
| Documentation | ✅ OK | Gode seksjonkommentarer |

#### Forbedringsforslag:

1. **Konsistent språk** - Endre til engelsk:
   - L76: `"Server kjører på port"` → `"Server running on port"`
2. **Security** - Legg til sikkerhetsmiddleware:
   ```typescript
   import helmet from 'helmet';
   import rateLimit from 'express-rate-limit';

   app.use(helmet());
   app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
   ```
3. **Performance** - Vurder compression middleware for responses:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

---

## Summary & Action Items

### Gjennomgående funn

| Problem | Forekomst | Prioritet | Status |
|---------|-----------|-----------|--------|
| Norske feilmeldinger | 19 stk på tvers av alle filer | 🔴 Høy | ✅ 13/19 fikset (upload.ts, history.ts) |
| Blokkerende sync-operasjoner | `spawnSync`/`execSync` i 3 filer | 🟡 Medium | ⏳ Pågår |
| Duplisert kode | Duration-parsing, download-funksjoner, enforce*Limit | 🟡 Medium | ✅ enforce*Limit fikset |
| Manglende input-validering | downloadId, id-parametere | 🟡 Medium | ✅ history.ts fikset |
| Manglende security middleware | helmet, rate limiting | 🟢 Lav | ⏳ Ikke startet |

### Prioriterte action items

#### 🔴 Høy prioritet
1. **Oversett alle norske feilmeldinger til engelsk** (19 stk)
   - suno.ts: 3 stk ⏳
   - mixtape.ts: 3 stk ⏳
   - ~~upload.ts: 7 stk~~ ✅
   - ~~history.ts: 6 stk~~ ✅

2. **Valider input-parametere** for path traversal-sikkerhet
   - mixtape.ts: `downloadId` ⏳
   - ~~history.ts: `id` og filnavn~~ ✅

#### 🟡 Medium prioritet
3. **Ekstraher delt utility-kode**
   - Duration-parsing → `utils/ffmpeg.ts`
   - Download-funksjoner (suno.ts) → generisk `downloadFile()`
   - ~~File deletion (history.ts) → `deleteAssociatedFiles()`~~ (validering lagt til)

4. **Vurder async alternativer** til `spawnSync`/`execSync`
   - mixtape.ts: `getAudioDurationMs()`
   - upload.ts: `getMp3Duration()` (byttet til spawnSync med array-args for sikkerhet)

#### 🟢 Lav prioritet
5. **Legg til security middleware** i server.ts
   - helmet
   - rate limiting
   - compression

6. **Forbedre TypeScript-typing**
   - ~~db/index.ts: Proper row types~~ ✅ (HistoryItemRow interface)
   - Ekstraher interfaces til egne filer

---

## Implementerte endringer

### db/index.ts
- ✅ Lagt til `HistoryItemRow` interface for proper typing
- ✅ Refaktorert `enforceHistoryLimit` og `enforceGenreLimit` til generisk `enforceLimit()`

### upload.ts
- ✅ Oversatt 7 norske feilmeldinger til engelsk
- ✅ Byttet `execSync` til `spawnSync` med array-baserte argumenter (security)

### history.ts
- ✅ Oversatt 6 norske feilmeldinger til engelsk
- ✅ Lagt til `isValidId()` validering i PATCH og DELETE routes
- ✅ Lagt til `isValidFilename()` validering før fil-sletting
