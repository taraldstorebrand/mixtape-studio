# ARCHITECTURE.md

## Overview

Monorepo with frontend, backend, and shared types for a song lyrics generator application ("Sangtekst Generator").

## Project Structure

```
test-cursor/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── history/     # History list components
│   │   │   ├── lyrics/      # Lyrics input components
│   │   │   └── panels/      # Layout panels (DetailPanel, HistoryPanel)
│   │   ├── hooks/        # Custom React hooks (useHistory, useResizable, etc.)
│   │   ├── services/     # API client and localStorage services
│   │   ├── types/        # Re-exports shared types
│   │   └── App.tsx       # Main application orchestration (state, callbacks, layout)
│   └── vite.config.ts
├── backend/           # Express REST API + WebSocket server
│   ├── src/
│   │   ├── db/           # SQLite database layer (index.ts)
│   │   ├── routes/       # Express route handlers (chatgpt.ts, suno.ts, history.ts, genres.ts, mixtape.ts)
│   │   ├── services/     # External API integrations (openai.ts, suno.ts)
│   │   ├── middleware/   # Express middleware (errorHandler.ts)
│   │   ├── utils/        # Utility functions (logger.ts)
│   │   ├── config.ts     # Environment configuration
│   │   └── server.ts     # Express + Socket.IO server entry
│   ├── data/             # SQLite database file (sangtekst.db, gitignored)
│   ├── mp3s/             # Downloaded Suno audio files ({title}_{index}.mp3, gitignored)
│   ├── temp/             # Temporary mixtape files (auto-deleted, gitignored)
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
        │ localStorage                        ├──────────────┐
        │ (panel width)                       │              │
        ▼                                     ▼              ▼
┌─────────────────┐                  ┌─────────────────┐ ┌──────────┐
│  Browser Store  │                  │  External APIs  │ │  SQLite  │
│  (UI prefs)     │                  │  - OpenAI       │ │  (data)  │
└─────────────────┘                  │  - Suno API     │ └──────────┘
                                     └─────────────────┘
```

### Frontend

- **Technology**: React 19, TypeScript, Vite 7
- **Port**: http://localhost:5173
- **Persistence**: localStorage for UI preferences (panel width)
- **State Management**: React useState hooks
- **Proxy**: Vite dev server proxies `/api/*`, `/mp3s/*`, and `/socket.io` to backend

### Backend

- **Technology**: Express 5, TypeScript, Node.js
- **Port**: http://localhost:3001
- **HTTP Server**: Express with CORS enabled
- **WebSocket**: Socket.IO for real-time Suno status updates
- **Database**: SQLite via better-sqlite3 (file: `backend/data/sangtekst.db`)
- **Static Files**: `/mp3s/*` serves downloaded audio from `backend/mp3s/`

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
- No user authentication
- No session management
- No multi-user support
- No cloud database (SQLite is local file-based)

## Notes

1. **Suno integration**: The backend uses polling to check Suno job status (every 5 seconds, up to 5 minutes). Status updates are pushed to clients via Socket.IO `suno-update` events.

2. **Shared types usage**: Both frontend and backend import types from `shared/types/index.ts`. The `HistoryItem` interface is the primary shared type.

3. **SQLite database**: The backend uses better-sqlite3 for persistence. Tables: `history_items` (song history), `genre_history` (used genres). Database file is gitignored.
