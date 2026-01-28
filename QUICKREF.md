# QUICKREF.md

**Hurtigreferanse for Sangtekst Generator - Bruk denne i stedet for å laste alle specs**

---

## Gjeldende Status

- **Iterasjon**: 026 (Manual MP3 upload for mixtapes)
- **Stack**: React 19, TypeScript, Express 5, Node.js, SQLite, Socket.IO
- **Ports**: Frontend (5173), Backend (3001)

---

## Arkitektur (30-second versjon)

```
Frontend (React SPA)          Backend (Express + Socket.IO)
├─ components/                ├─ routes/ (REST endpoints)
│  ├─ panels/                 ├─ services/ (OpenAI, Suno)
│  ├─ history/                ├─ db/ (SQLite)
│  └─ lyrics/                 ├─ mp3s/ (downloaded audio)
├─ hooks/                     └─ temp/ (mixtape files)
├─ services/ (API client)
└─ store/ (Jotai atoms)
```

**Data flow**: 
- User input → ChatGPT (lyrics) → User edits → Suno (music) → History (SQLite)
- Real-time updates via Socket.IO (`suno-update`, `mixtape-ready` events)

---

## Kritiske Regler (fra AGENTS.md)

✅ **DO**
- Følg SPEC.md og ARCHITECTURE.md
- Endre kun filer nevnt i TASKS.md
- TypeScript strict
- Functional React only
- Minimal diffs

❌ **DON'T**
- Bruk useCallback/useMemo/React.memo (React 19 optimaliserer selv)
- Definer render-funksjoner inne i komponenter (ekstraher som separate komponenter)
- Refaktorer ukontrollert
- Opprett nye endepunkter uten instruksjon
- Bruk class components eller global state libraries

---

## Filnavnkonvensjoner

- Filer MÅ matche hovedkomponenten: `HistoryItem.tsx`, ikke `index.tsx`
- Helper-komponenter går i subfolder: `history/HistoryItem/StatusBadge/StatusBadge.tsx`

---

## Data Modell (forenklet)

**HistoryItem** (SQLite: `history_items`)
```typescript
{
  id: string
  prompt: string
  title: string
  lyrics: string
  genre?: string
  createdAt: string (ISO)
  feedback?: 'up' | 'down'
  sunoJobId?: string
  sunoClipId?: string
  sunoStatus?: 'pending' | 'completed' | 'failed'
  sunoAudioUrl?: string
  sunoLocalUrl?: string
  variationIndex?: 0 | 1
  isUploaded?: boolean
}
```

---

## API Endepunkter (kun de viktigste)

**REST**
- `POST /api/chatgpt/generate-lyrics` - Generer tekst
- `POST /api/suno/generate` - Generer sang
- `GET /api/history` - Hent historikk
- `POST /api/history` - Opprett item
- `PATCH /api/history/:id` - Oppdater item
- `DELETE /api/history/:id` - Slett item (+ MP3 fil)
- `POST /api/upload` - Last opp MP3-fil
- `POST /api/mixtape/liked` - Start mixtape-generering
- `GET /api/mixtape/download/:downloadId` - Last ned mixtape

**WebSocket (Socket.IO)**
- `suno-update` - Status-oppdateringer fra Suno
- `mixtape-ready` - Mixtape klar til nedlasting

---

## Nåværende Iterasjon (026)

**Mål**: La brukere laste opp eksisterende MP3-filer til mixtapes

**Endrede filer**:
- `shared/types/index.ts` - Legg til isUploaded felt
- `backend/src/routes/upload.ts` (ny) - Upload endpoint med multer
- `backend/src/server.ts` - Mount upload routes
- `backend/src/db/index.ts` - Håndter isUploaded i CRUD
- `frontend/src/components/history/UploadButton/UploadButton.tsx` (ny) - Upload-knapp
- `frontend/src/components/history/HistoryList.tsx` - Inkluder upload-knapp
- `frontend/src/services/api.ts` - Upload API-funksjon
- Spec-filer (SPEC.md, API.md, ARCHITECTURE.md, DECISIONS.md)

**Oppførsel**:
- Bruker velger MP3-fil og angir tittel
- Backend lagrer fil i `backend/mp3s/`
- Backend oppretter history item med `isUploaded: true`
- Opplastede sanger vises i historikk og kan likes/dislikes
- Maks filstørrelse: 10 MB

---

## Vanlige Mønstre

**Jotai state (frontend)**
```typescript
// Definer atom
const myAtom = atom<MyType>(initialValue);

// Bruk i komponent
const [value, setValue] = useAtom(myAtom);
```

**API kall (frontend)**
```typescript
// services/api.ts
export async function fetchSomething(): Promise<SomeType> {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`);
  return response.json();
}
```

**SQLite queries (backend)**
```typescript
// db/index.ts
const stmt = db.prepare('SELECT * FROM table WHERE id = ?');
const result = stmt.get(id);
```

---

## Eksterne APIer

- **OpenAI**: `gpt-5.2` (GPT-5.2 Thinking) for lyrics
- **Suno**: `api.sunoapi.org` for music generation
  - Custom mode aktiveres med genre-parameter
  - Genererer 2 variasjoner per request
  - Polling hver 5 sek, maks 10 min

---

## Når å Referere Fullstendige Specs

**Bruk QUICKREF.md for**:
- Daglig koding
- Hurtige endringer
- Arkitektur-oversikt

**Bruk fullstendige specs for**:
- Nye features
- API-endringer
- Komplekse beslutninger
- Tvetydigheter

**Spesifikke filer**:
- `TASKS.md` - Nåværende og kommende iterasjoner
- `SPEC.md` - Komplett feature-dokumentasjon
- `ARCHITECTURE.md` - Detaljert system-design
- `API.md` - Fullstendig API-dokumentasjon
- `DECISIONS.md` - Arkitektur-beslutninger og begrunnelser
- `AGENTS.md` - Kodestil og regler

---

## Siste Oppdatering

**Dato**: Iterasjon 026
**Av**: Oppdater denne når nye iterasjoner fullføres
