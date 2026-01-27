# 🎵 Mixtape Studio

Lag musikk med AI og bygg dine egne mixtapes. En webapplikasjon som bruker ChatGPT til å generere sangtekster basert på brukerprompts, og deretter sender tekstene til Suno API for musikkgenerering.

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

2. Installer backend-avhengigheter:
```bash
cd backend
npm install
```

3. Installer frontend-avhengigheter:
```bash
cd ../frontend
npm install
```

4. Opprett `.env` fil i `backend/` mappen:
```bash
cd ../backend
cp .env-template .env
```

5. Rediger `.env` filen og legg inn dine API-nøkler:
```
OPENAI_API_KEY=din_openai_nøkkel_her
SUNO_API_KEY=din_suno_nøkkel_her
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Kjøring

1. Start backend-serveren:
```bash
cd backend
npm run dev
```

2. I en ny terminal, start frontend:
```bash
cd frontend
npm run dev
```

3. Åpne nettleseren og gå til `http://localhost:5173`

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
test-cursor/
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
│   └── types.ts            # Delte TypeScript typer
└── README.md
```

## API Endpoints

### Backend

- `POST /api/chatgpt/generate-lyrics` - Generer sangtekst fra prompt
- `POST /api/suno/generate` - Generer sang fra tekst
- `GET /api/suno/status/:jobId` - Hent status på sang-generering
- `GET /api/history` - Hent alle historikk-elementer
- `POST /api/history` - Lagre historikk-element
- `PUT /api/history/:id` - Oppdater historikk-element
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
