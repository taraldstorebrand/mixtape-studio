# 🎵 Mixamp Studio

Lag musikk og mixtapes med AI. En webapplikasjon som bruker ChatGPT til å generere sangtekster basert på brukerprompts, og deretter sender tekstene til Suno API for musikkgenerering.

## Krav til abonnementer

Denne løsningen krever aktive abonnementer på:

- **OpenAI API** - For ChatGPT-tilgang til sangtekstgenerering  
  Registrer deg og kjøp tokens på: https://platform.openai.com
  
- **Suno API** - For musikkgenerering fra tekst  
  Abonner på: https://sunoapi.org

## Funksjoner

- ✍️ Generer sangtekster med ChatGPT basert på brukerprompts
- 🎵 Send genererte tekster til Suno for musikkgenerering (2 variasjoner per request)
- 📝 Rediger tekster før sending til Suno
- 🎼 Angi tittel og sjanger for sangene
- 📚 Historikk lagret i SQLite database
- 👍👎 Gi feedback med thumbs up/down på genererte sanger
- 🔄 Kopier tidligere sanger som nye utkast
- 🎧 Spill av genererte sanger direkte i appen
- 🔀 Resizable to-panel layout

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

1. **Generer sangtekst**: Skriv inn en prompt (f.eks. "En sang om sommer") og klikk "Generer Tekst"
2. **Rediger tekst**: Du kan redigere den genererte teksten før du sender den til Suno
3. **Angi tittel**: Fyll inn tittel (påkrevd) og eventuelt sjanger
4. **Generer sang**: Klikk "Generer Sang med Suno" for å lage musikk fra teksten
5. **Se status**: Suno-generering vises med spinner og oppdateres via WebSocket
6. **Spill av**: Ferdige sanger kan spilles direkte i historikklisten
7. **Gi feedback**: Bruk thumbs up/down på historikk-elementer
8. **Filtrer**: Bruk filterknappene for å vise standard, likede, eller alle sanger

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

## Lisens

ISC
