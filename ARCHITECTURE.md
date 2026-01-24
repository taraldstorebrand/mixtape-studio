# ARCHITECTURE.md

## Overview

Monorepo with frontend, backend, and shared types for a song lyrics generator application ("Sangtekst Generator").

## Project Structure

```
test-cursor/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/   # React components (history/, lyrics/)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client and localStorage services
│   │   ├── types/        # Re-exports shared types
│   │   └── App.tsx       # Main application component
│   └── vite.config.ts
├── backend/           # Express REST API + WebSocket server
│   ├── src/
│   │   ├── routes/       # Express route handlers (chatgpt.ts, suno.ts)
│   │   ├── services/     # External API integrations (openai.ts, suno.ts)
│   │   ├── middleware/   # Express middleware (errorHandler.ts)
│   │   ├── utils/        # Utility functions
│   │   ├── config.ts     # Environment configuration
│   │   └── server.ts     # Express + Socket.IO server entry
│   ├── mp3s/             # Downloaded Suno audio files (gitignored)
│   └── package.json
├── shared/            # Shared TypeScript types
│   └── types/
│       └── index.ts      # HistoryItem interface
└── AGENTS.md
```

## Runtime Topology

```
┌─────────────────┐     HTTP/WS      ┌─────────────────┐
│    Frontend     │◄────────────────►│     Backend     │
│  localhost:5173 │                  │  localhost:3001 │
└─────────────────┘                  └────────┬────────┘
        │                                     │
        │ localStorage                        │ HTTPS
        ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Browser Store  │                  │  External APIs  │
│  (history)      │                  │  - OpenAI       │
└─────────────────┘                  │  - Suno API     │
                                     └─────────────────┘
```

### Frontend

- **Technology**: React 19, TypeScript, Vite 7
- **Port**: http://localhost:5173
- **Persistence**: localStorage (client-side only)
- **State Management**: React useState hooks

### Backend

- **Technology**: Express 5, TypeScript, Node.js
- **Port**: http://localhost:3001
- **HTTP Server**: Express with CORS enabled
- **WebSocket**: Socket.IO for real-time Suno status updates

## Communication Patterns

### REST API

- Frontend communicates with backend via REST endpoints under `/api/*`
- All requests use JSON content type

### WebSocket (Socket.IO)

- Backend pushes Suno job status updates to frontend via `suno-update` event
- Frontend connects to same origin as backend
- Used for real-time polling updates instead of client-side polling

### External API Integration

- **OpenAI API**: Used for lyrics generation (GPT-5.2 model)
- **Suno API**: Used for music generation from lyrics (api.sunoapi.org)

## Configuration

Environment variables (`.env` in backend/):

- `PORT` - Backend server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- `OPENAI_API_KEY` - OpenAI API key (required)
- `SUNO_API_KEY` - Suno API key (required)

## Non-Goals

- No server-side rendering (SSR)
- No server-side database persistence
- No user authentication
- No session management
- No multi-user support

## Notes

1. **Suno integration**: The backend uses polling to check Suno job status (every 5 seconds, up to 5 minutes). Status updates are pushed to clients via Socket.IO `suno-update` events.

2. **Shared types usage**: The shared/ folder contains types, but it's unclear if the backend uses them (frontend imports via re-export, backend imports from environment directly).

3. **utils/ folder**: The backend has a `utils/` directory but its contents were not examined. Purpose unclear.
