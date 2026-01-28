# 🎵 Mixtape Studio

## TL;DR

- Last opp eller generer musikk
- Organiser favoritter
- Slå dem sammen til én offline-vennlig mixtape med kapitler
- AI-funksjoner er helt valgfrie


**Mixtape Studio** er en webapplikasjon for å **samle, organisere og spille av musikk som ferdige mixtapes**.

Appen er laget for praktisk bruk:
- lange lyttesesjoner
- offline-avspilling (fly, bil, trening)
- enkel kuratering av favorittsanger

Støtte for AI-basert tekst- og musikkgenerering finnes som et **valgfritt tillegg**, men er ikke nødvendig for å bruke appen.

![Mixtape Studio Screenshot](docs/hero-screenshot.png)

---

## Hva er en mixtape?

I Mixtape Studio er en mixtape:
- én sammenhengende lydfil
- med tydelige kapitler per sang
- i et format som fungerer godt offline (M4B)

Dette gjør den ideell til:
- reiser uten nett
- lange treningsøkter
- bilkjøring
- fokusarbeid

I stedet for mange enkeltfiler får du **én fil med struktur**.

---

## Funksjoner

### 🎶 Mixtapes (kjernefunksjonalitet)

- 📤 Last opp egne MP3-filer
- 🎧 Spill av sanger direkte i appen
- 👍 Marker favoritter
- 🔍 Filtrer sanger (Alle / Likte / Standard)
- 🎼 Lag ferdige mixtapes (M4B) med kapitler
- ⚙️ Avansert mixtape-modus:
  - velg rekkefølge
  - inkluder / ekskluder sanger
  - navngi mixtapen før generering

Mixtapes kan genereres med ett klikk, eller tilpasses i detalj i avansert modus.
![Advanced Mixtape Screenshot](docs/advanced-mixtape.png)

---

### ✍️ Tekst og musikk (valgfritt)

Mixtape Studio kan også brukes til å **lage nytt innhold**, men dette er helt frivillig.

- Skriv sangtekster manuelt
- Bruk AI til å generere tekst (valgfritt)
- Generer musikk basert på tekst (valgfritt)
- Rediger tekst før musikkgenerering

> ℹ️ Disse funksjonene krever eksterne API-nøkler og kan medføre kostnader.

---

## Abonnementer (kun ved bruk av AI)

Appen fungerer fullt ut **uten abonnementer**.

Følgende tjenester er kun nødvendige hvis du vil bruke AI-funksjoner:

- **OpenAI API** – tekstgenerering  
  https://platform.openai.com

- **Suno API** – musikkgenerering  
  https://sunoapi.org

Hvis API-nøkler mangler, deaktiveres relevante AI-handlinger automatisk i brukergrensesnittet.

---

## Teknisk oversikt

### Frontend
- React 19
- TypeScript
- Vite
- Resizable to-panel layout
- WebSocket for sanntidsoppdateringer

### Backend
- Node.js
- Express
- SQLite (lokal lagring)
- WebSocket
- Valgfri integrasjon mot OpenAI og Suno

---

## Kom i gang

### Forutsetninger
- Node.js v18 eller nyere
- npm

### Installasjon
```bash
npm install
```

### Miljøvariabler (valgfritt)

- Opprett `.env` fil i `backend/` mappen:
```bash
cp backend/.env-template backend/.env
```

- Legg kun inn API-nøkler hvis du vil bruke AI-funksjoner:
```
OPENAI_API_KEY=din_openai_nøkkel_her
SUNO_API_KEY=din_suno_nøkkel_her
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Kjøring

Start både backend og frontend samtidig fra prosjektroten:
```bash
npm run dev
```

Åpne nettleseren og gå til `http://localhost:5173`

#### Alternativt: Kjør separat

Backend:
```bash
npm run dev -w backend
```

Frontend (i en ny terminal):
```bash
npm run dev -w frontend
```

## Bruk

### Lag en sang

1. **Skriv sangtekst**: Skriv teksten direkte i tekstfeltet, eller aktiver "Bruk AI til å generere tekst" for ChatGPT-assistanse
2. **Rediger tekst**: Juster teksten etter behov
3. **Angi tittel**: Fyll inn tittel (påkrevd) og eventuelt sjanger
4. **Generer sang**: Klikk "Generer sang" for å lage musikk fra teksten
5. **Se status**: Suno-generering vises med spinner og oppdateres i sanntid via WebSocket

### Administrer sanger

6. **Spill av**: Ferdige sanger kan spilles direkte i historikklisten
7. **Gi feedback**: Bruk thumbs up/down på historikk-elementer
8. **Filtrer**: Bruk filterknappene for å vise Standard, Likte, eller Alle sanger
9. **Last opp MP3**: Klikk "Last opp MP3" for å legge til egne sanger (maks 10 filer à 10 MB)
10. **Lag mixtape**: Klikk "Lag mixtape" for å laste ned alle likte sanger som én M4B-fil med kapitler

## Prosjektstruktur

```
mixtape-studio/
├── package.json            # Root scripts (dev, build) med npm workspaces
├── frontend/
│   ├── src/
│   │   ├── components/     # React komponenter
│   │   ├── services/       # API og storage services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript typer
│   │   └── App.tsx         # Hovedkomponent
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # OpenAI, Suno og DB services
│   │   └── server.ts       # Express server
│   ├── data/               # SQLite database
│   └── package.json
├── shared/
│   └── types/
│       └── index.ts        # Delte TypeScript typer
└── README.md
```

## API Endpoints

### Backend

- `POST /api/chatgpt/generate-lyrics` - Generer sangtekst fra prompt
- `POST /api/suno/generate` - Generer sang fra tekst
- `GET /api/suno/status/:jobId` - Hent status på sang-generering
- `GET /api/history` - Hent alle historikk-elementer
- `POST /api/history` - Lagre historikk-element
- `PATCH /api/history/:id` - Oppdater historikk-element
- `DELETE /api/history/:id` - Slett historikk-element
- `GET /api/genres` - Hent sjangerhistorikk
- `POST /api/genres` - Lagre ny sjanger
- `DELETE /api/genres/:genre` - Slett sjanger
- `GET /health` - Health check

### WebSocket

- Sanntidsoppdateringer for Suno-jobstatus

## Notater

- Historikk lagres i SQLite database på backend
- Maksimalt 10 000 historikk-elementer lagres
- Maksimalt 50 sjangre i sjangerhistorikk
- Suno genererer 2 sangvariasjoner per request
- Mislykkede genereringer fjernes automatisk fra historikk
- API-nøkler må konfigureres i `.env` filen i backend-mappen
- Resizable to-panel layout (30-70% bredde, huskes mellom økter)
- Mixtape-filer er M4B (AAC, 192 kbps) med innebygde kapitler

## Lisens

ISC
