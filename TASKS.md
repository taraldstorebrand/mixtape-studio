# TASKS.md

## SSE Migrering – Socket.IO til Server-Sent Events

Migrer fra Socket.IO til native Server-Sent Events (SSE) for sanntidsoppdateringer av Suno-status og mixtape-ferdigstillelse.

---

## Fase 1: Backend SSE-infrastruktur

### Task 1.1: Opprett SSE-tilkoblingsbehandler

**Status:** Ferdig

**Beskrivelse:**
Opprett en ny tjeneste for å administrere aktive SSE-tilkoblinger og kringkaste hendelser til alle tilkoblede klienter. Bruk Node.js EventEmitter for hendelsesstyring.

**Forventet oppførsel:**
- Behandle en liste over aktive SSE-svarobjekter (Response-objekter med aktiv tilkobling)
- Eksporter `broadcastSseEvent(eventType, data)` for å sende hendelser til alle klienter
- Rydde opp i tilkoblinger når klienter kobler fra
- Legg til feilhåndtering for ødelagte tilkoblinger

**Filer som skal endres:**
- `backend/src/services/sse.ts` (NY fil)
  ```typescript
  // Implementer:
  // - clients: Map<string, Response> for aktive tilkoblinger
  // - broadcastSseEvent(eventType: string, data: any): void
  // - addClient(id: string, response: Response): void
  // - removeClient(id: string): void
  // - cleanup(): void for å rydde opp i døde tilkoblinger
  ```

---

### Task 1.2: Opprett SSE-endepunkt

**Status:** Ferdig

**Beskrivelse:**
Opprett et SSE-endepunkt som kunder kobler til for å motta sanntidshendelser. Endepunktet skal holde tilkoblingen åpen og streame hendelser når de skjer.

**Forventet oppførsel:**
- Svar med `Content-Type: text/event-stream`
- Sett `Cache-Control: no-cache` og `Connection: keep-alive`
- Generer unik klient-ID for hver tilkobling
- Send keepalive-meldinger hvert 30. sekund for å forhinde timeout
- Rydde opp klient-ID fra sse.ts når forespørselen lukkes

**Filer som skal endres:**
- `backend/src/server.ts`
  - Fjern `import { Server } from 'socket.io'`
  - Fjern Socket.IO-serverinitialisering (`new Server(server, ...)`)
  - Fjern `io.on('connection', ...)` handler
  - Legg til ny route: `app.get('/api/events', handleSseConnection)`
  - Eksporter `io` ikke lenger (bruk `sse` i stedet)

- `backend/src/services/sse.ts` (fra Task 1.1)
  - Implementer `handleSseConnection(req: Request, res: Response): void`

---

### Task 1.3: Oppdater Suno-tjenesten til å bruke SSE

**Status:** Ferdig

**Beskrivelse:**
Endre Suno-statusoppdateringene fra Socket.IO-emitting til SSE-broadcasting. Oppdateringen skjer når Suno API-polling oppdager endringer.

**Forventet oppførsel:**
- Importer `broadcastSseEvent` fra `services/sse` i stedet for `io`
- Erstatt alle `io.emit('suno-update', ...)` kall med `broadcastSseEvent('suno-update', ...)`
- Sørg for at dataformatet forblir det samme for frontend-kompatibilitet

**Filer som skal endres:**
- `backend/src/services/suno.ts`
  - Linje 4: Endre `import { io } from '../server'` til `import { broadcastSseEvent } from './sse'`
  - Linje 99: Endre `io.emit('suno-update', { jobId, ...status })` til `broadcastSseEvent('suno-update', { jobId, ...status })`

---

### Task 1.4: Oppdater mixtape-ruten til å bruke SSE

**Status:** Ferdig

**Beskrivelse:**
Endre mixtape-ferdigstillelsevarsler fra Socket.IO til SSE-broadcasting. Dette inkluderer både suksess- og feilmeldinger.

**Forventet oppførsel:**
- Importer `broadcastSseEvent` fra `services/sse` i stedet for `io`
- Erstatt alle `io.emit('mixtape-ready', ...)` kall med `broadcastSseEvent('mixtape-ready', ...)`
- Sørg for at dataformatet forblir det samme

**Filer som skal endres:**
- `backend/src/routes/mixtape.ts`
  - Linje 7: Endre `import { io } from '../server'` til `import { broadcastSseEvent } from '../services/sse'`
  - Linje 174: Endre `io.emit('mixtape-ready', { taskId, error: 'No songs found' })`
  - Linje 211: Endre `io.emit('mixtape-ready', { taskId, downloadId, fileName })`
  - Linje 214: Endre `io.emit('mixtape-ready', { taskId, error: 'Failed to create mixtape' })`

---

## Fase 2: Frontend SSE-klient

### Task 2.1: Opprett SSE-tilkoblingshook

**Status:** Pending

**Beskrivelse:**
Opprett en React hook som håndterer SSE-tilkobling med automatisk gjenoppretting. Erstatt `socket.io-client` med native `EventSource` API.

**Forventet oppførsel:**
- Opprett EventSource-tilkobling til `/api/events`
- Implementer automatisk gjenoppretting (innebygd i EventSource)
- Legg til reconnection-konfigurasjon (EventSource håndterer dette automatisk)
- Logge tilkoblingsstatus for debugging (kun i dev-modus)

**Filer som skal endres:**
- `frontend/src/hooks/useSse.ts` (NY fil, erstatter `useSunoSocket.ts`)
  ```typescript
  // Implementer:
  // - connectSse(): EventSource
  // - disconnectSse(): void
  // - addEventListener(event: string, handler: (data: any) => void): void
  // - removeEventListener(event: string, handler: (data: any) => void): void
  ```

---

### Task 2.2: Opprett hendelseslytter-hooks

**Status:** Pending

**Beskrivelse:**
Opprett spesifikke hooks for å lytte på `suno-update` og `mixtape-ready` hendelser, som erstatter de gamle Socket.IO-hendelsene.

**Forventet oppførsel:**
- `useSunoUpdates(onUpdate)`: Lytter på `suno-update` hendelser
- `useMixtapeReady(taskId, callback)`: Lytter på `mixtape-ready` for spesifikk taskId
- Begge skal rydde opp lyttere når komponenten avmonteres
- Dataformat skal være kompatibelt med eksisterende kode

**Filer som skal endres:**
- `frontend/src/hooks/useSse.ts`
  - Eksporter `SunoUpdateData` interface (samme som før)
  - Implementer `export function useSunoUpdates(onUpdate: (data: SunoUpdateData) => void)`
  - Implementer `export function useMixtapeReady(taskId: string, callback: (data: { downloadId?: string; fileName?: string; error?: string }) => void)`

---

### Task 2.3: Oppdater api.ts

**Status:** Pending

**Beskrivelse:**
Fjern all Socket.IO-relatert kode fra API-klienten og erstatte med SSE-eksport fra `useSse.ts`.

**Forventet oppførsel:**
- Fjern `import { io, Socket } from 'socket.io-client'`
- Fjern alle socket-variabler og funksjoner
- Eksporter ikke lenger socket-relaterte funksjoner (de håndteres nå av hooks)

**Filer som skal endres:**
- `frontend/src/services/api.ts`
  - Fjern linje 1: `import { io, Socket } from 'socket.io-client'`
  - Fjern linje 8: `let socket: Socket | null = null;`
  - Fjern alle funksjoner: `connectSocket()`, `disconnectSocket()`, `onSunoUpdate()`, `offSunoUpdate()`, `onceMixtapeReady()`
  - Fjern logikk relatert til socket-tilkobling (linje 10-84)

---

### Task 2.4: Oppdater App.tsx

**Status:** Pending

**Beskrivelse:**
Erstatt `useSunoSocket` hook med den nye `useSunoUpdates` hook fra SSE-implementasjonen.

**Forventet oppførsel:**
- Importere `useSunoUpdates` fra `hooks/useSse` i stedet for `useSunoSocket`
- `handleSunoUpdate` skal fungere likt som før (samme dataformat)
- Ingen endringer i logikk, bare bytte av hook

**Filer som skal endres:**
- `frontend/src/App.tsx`
  - Linje 12: Endre `import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket'` til `import { useSunoUpdates, SunoUpdateData } from './hooks/useSse'`
  - Linje 100: Endre `useSunoSocket(handleSunoUpdate)` til `useSunoUpdates(handleSunoUpdate)`

---

### Task 2.5: Oppdater MixtapeButton til å bruke SSE

**Status:** Pending

**Beskrivelse:**
Oppdater MixtapeButton-komponenten til å bruke den nye `useMixtapeReady` hook i stedet for `onceMixtapeReady` fra api.ts.

**Filer som skal endres:**
- Finn fil som inneholder MixtapeButton (sannsynligvis `frontend/src/components/history/MixtapeButton/MixtapeButton.tsx`)
  - Fjern import av `onceMixtapeReady` fra `services/api`
  - Importer `useMixtapeReady` fra `hooks/useSse`
  - Erstatt `onceMixtapeReady(taskId, callback)` med `useMixtapeReady(taskId, callback)`

---

## Fase 3: Konfigurasjon og avhengigheter

### Task 3.1: Oppdater Vite proxy

**Status:** Pending

**Beskrivelse:**
Fjern Socket.IO proxy-konfigurasjon fra Vite. SSE bruker standard HTTP-kommunikasjon og trenger ingen spesiell proxy-konfigurasjon.

**Forventet oppførsel:**
- Fjern `/socket.io` proxy-seksjon
- `/api` proxy vil håndtere SSE-kommunikasjon automatisk

**Filer som skal endres:**
- `frontend/vite.config.ts`
  - Fjern linje 26-30 (Socket.IO proxy-konfigurasjon)

---

### Task 3.2: Fjern Socket.IO-avhengigheter

**Status:** Pending

**Beskrivelse:**
Fjern socket.io-pakker fra både backend og frontend package.json.

**Forventet oppførsel:**
- Ingen socket.io-pakker i avhengigheter
- Renere dependencies

**Filer som skal endres:**
- `backend/package.json`
  - Fjern `"socket.io": "^4.8.3"` fra dependencies

- `frontend/package.json`
  - Fjern `"socket.io-client": "^4.8.3"` fra dependencies

Kjør etterpå:
- `cd backend && npm uninstall socket.io`
- `cd frontend && npm uninstall socket.io-client`

---

### Task 3.3: Rydd opp i gamle filer

**Status:** Pending

**Beskrivelse:**
Slett den gamle useSunoSocket.ts filen som er erstattet av useSse.ts.

**Filer som skal slettes:**
- `frontend/src/hooks/useSunoSocket.ts`

---

## Fase 4: Dokumentasjon

### Task 4.1: Oppdater ARCHITECTURE.md

**Status:** Pending

**Beskrivelse:**
Oppdater arkitektdokumentasjonen for å reflektere endringen fra Socket.IO til SSE.

**Forventet oppførsel:**
- Linje 37: Endre "Express + Socket.IO server entry" til "Express + SSE server entry"
- Linje 80: Endre "WebSocket: Socket.IO for real-time Suno status updates" til "SSE (Server-Sent Events) for real-time Suno status updates"
- Linje 91-95: Endre WebSocket-seksjonen til SSE
- Linje 121: Oppdater notatet om Suno-integrasjon til å nevne SSE

**Filer som skal endres:**
- `ARCHITECTURE.md`

---

### Task 4.2: Oppdater API.md

**Status:** Pending

**Beskrivelse:**
Erstatt WebSocket-events-dokumentasjon med SSE-events-dokumentasjon.

**Forventet oppførsel:**
- Erstatt hele "WebSocket Events (Socket.IO)" seksjon med "Server-Sent Events"
- Dokumenter `/api/events` endepunkt
- Dokumenter hendelsesformater: `suno-update`, `mixtape-ready`
- Oppdater alle referanser til WebSocket til SSE

**Filer som skal endres:**
- `API.md`

---

### Task 4.3: Oppdater QUICKREF.md

**Status:** Pending

**Beskrivelse:**
Oppdater hurtigreferansen for å reflektere SSE-teknologien.

**Forventet oppførsel:**
- Linje 9: Endre teknologistack-liste til å inkludere SSE i stedet for Socket.IO
- Linje 17: Endre "Backend (Express + Socket.IO)" til "Backend (Express + SSE)"
- Linje 29: Endre "Real-time updates via Socket.IO" til "Real-time updates via SSE"
- Linje 104-106: Oppdater WebSocket-seksjonen til SSE

**Filer som skal endres:**
- `QUICKREF.md`

---

### Task 4.4: Oppdater DECISIONS.md

**Status:** Pending

**Beskrivelse:**
Oppdater beslutningsdokumentet for å fjerne Socket.IO-spesifikke beslutninger og legge til SSE-beslutninger.

**Filer som skal endres:**
- `DECISIONS.md`
  - Fjern eller oppdater seksjon om "D-002 – Socket.IO event scope"
  - Fjern referanser til Socket.IO gjenoppretting (linje 217-222)
  - Legg til ny beslutning om SSE valg hvis ønskelig

---

## Testplan (etter gjennomføring)

### Verifisering

1. Start backend og frontend
2. Generer en ny sang
3. Verifiser at statusoppdateringer kommer gjennom i sanntid
4. Generer en mixtape
5. Verifiser at mixtape-ferdigstillelse kommer gjennom
6. Sjekk konsollen for feilmeldinger
7. Verifiser at automatisk gjenoppretting fungerer ved nettverksbrudd
