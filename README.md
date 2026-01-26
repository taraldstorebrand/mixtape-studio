# 🎵 Sangtekst Generator

En React-applikasjon som bruker ChatGPT til å generere sangtekster basert på brukerprompts, og deretter sender tekstene til Suno API for musikkgenerering.

## Funksjoner

- ✍️ Generer sangtekster med ChatGPT basert på brukerprompts
- 🎵 Send genererte tekster til Suno for musikkgenerering
- 📝 Rediger tekster før sending til Suno
- 📚 Lagre historikk av alle prompts og genererte tekster
- 👍👎 Gi feedback med thumbs up/down på genererte tekster
- 🔄 Gjenbruk tidligere tekster
- 🎧 Spill av genererte sanger direkte i appen

## Teknisk Stack

### Frontend
- React 19
- TypeScript 5.9
- Vite 7
- localStorage for persistering

### Backend
- Node.js
- Express 5
- TypeScript 5.3
- OpenAI API v6 (ChatGPT)
- Suno API

## Oppsett

### Forutsetninger

- Node.js (v18 eller nyere)
- npm eller yarn
- OpenAI API-nøkkel
- Suno API-nøkkel

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
3. **Generer sang**: Klikk "Generer Sang med Suno" for å lage musikk fra teksten
4. **Gi feedback**: Bruk thumbs up/down knappene på historikk-elementer for å markere hva som var vellykket eller mislykket
5. **Gjenbruk**: Klikk "Gjenbruk" på et historikk-element for å laste teksten inn igjen

## Prosjektstruktur

```
test-cursor/
├── frontend/
│   ├── src/
│   │   ├── components/     # React komponenter
│   │   ├── services/        # API og storage services
│   │   ├── types/          # TypeScript typer
│   │   └── App.tsx         # Hovedkomponent
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # OpenAI og Suno services
│   │   └── server.ts       # Express server
│   └── package.json
├── .env.example            # Eksempel på miljøvariabler
└── README.md
```

## API Endpoints

### Backend

- `POST /api/chatgpt/generate-lyrics` - Generer sangtekst fra prompt
- `POST /api/suno/generate` - Generer sang fra tekst
- `GET /api/suno/status/:jobId` - Hent status på sang-generering
- `GET /health` - Health check

## Notater

- Historikk lagres lokalt i nettleserens localStorage
- Maksimalt 100 historikk-elementer lagres
- Suno-generering kan ta noen minutter - appen poller automatisk for status
- API-nøkler må konfigureres i `.env` filen i backend-mappen

## Lisens

ISC
