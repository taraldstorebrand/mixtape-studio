# 🎵 Mixtape Studio

Mixtape Studio er en webapplikasjon for å bygge egne mixtapes av musikk – enten du bruker eksisterende lydfiler eller genererer nytt innhold underveis.

Appen er først og fremst laget som et praktisk verktøy for miksing, avspilling og organisering av sanger, med støtte for AI-basert tekst- og musikkgenerering som et valgfritt tillegg.

![Mixtape Studio Screenshot](docs/hero-screenshot.png)

## Krav til abonnementer

Denne løsningen krever aktive abonnementer på:

- **OpenAI API** - For ChatGPT-tilgang til sangtekstgenerering  
  Registrer deg og kjøp tokens på: https://platform.openai.com
  
- **Suno API** - For musikkgenerering fra tekst  
  Abonner på: https://sunoapi.org

## Funksjoner

- ✍️ Skriv sangtekster manuelt eller få hjelp av ChatGPT (valgfri AI-toggle)
- 🎵 Generer musikk med Suno API (2 variasjoner per request)
- 📝 Rediger tekster før musikkgenerering
- 🎼 Angi tittel (påkrevd) og sjanger (valgfritt) med dropdown-historikk
- 📚 Historikk lagret i SQLite database (maks 10 000 elementer)
- 👍👎 Gi feedback med thumbs up/down på genererte sanger
- 🔍 Filtrer historikk: Standard, Likte, eller Alle sanger
- 🔄 Kopier tidligere sanger som nye utkast
- 🎧 Spill av genererte sanger direkte i appen
- 📤 Last opp egne MP3-filer (maks 10 filer, 10 MB per fil)
- 🎶 Lag mixtape (M4B med kapitler) av likte sanger
- 🔀 Resizable to-panel layout med sanntidsoppdateringer via WebSocket

## Teknisk Stack

### Frontend
- React 19
- TypeScript 5.9
- Vite 7
- WebSocket for sanntidsoppdateringer

### Backend
- Node.js
- Express 5
- TypeScript 5.3
- SQLite for persistering
- OpenAI API v6 (ChatGPT)
- Suno API via sunoapi.org
- WebSocket for Suno-statusoppdateringer

## Oppsett

### Forutsetninger

- Node.js (v18 eller nyere)
- npm eller yarn
- OpenAI API-nøkkel (krever abonnement)
- Suno API-nøkkel fra sunoapi.org (krever abonnement)

### Installasjon

1. Klon eller last ned prosjektet

2. Installer alle avhengigheter (fra prosjektroten):
```bash
npm install
npm run install:all
```

3. Opprett `.env` fil i `backend/` mappen:
```bash
cp backend/.env-template backend/.env
```

4. Rediger `backend/.env` filen og legg inn dine API-nøkler:
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
npm run dev -C backend
```

Frontend (i en ny terminal):
```bash
npm run dev -C frontend
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
├── package.json            # Root scripts (dev, build, install:all)
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
