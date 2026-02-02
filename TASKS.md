# TASKS.md

## P0 – Kritiske

### Task 1: Fiks next-sang bug ved bytte fra playlist til library

**Status:** ✅ Completed

**Problem:**
Når bruker var i playlist og byttet tilbake til library, spilte "next" feil sang.

**Årsak:**
Playback-logikken sjekket om nåværende sang fantes i playlist for å bestemme kontekst, i stedet for å bruke `currentPlaylistSongsAtom` direkte. Dette førte til at køen ikke ble synkronisert korrekt.

**Løsning:**
- `HistoryItem.tsx`: Bruker nå `currentPlaylistSongs ?? filteredHistory` for å sette playback-kø
- `useAudioPlayback.ts`: 
  - `getSongsToSearch()` bruker nå kontekst direkte (`currentPlaylistSongs` eller `filteredHistory`)
  - `setNowPlaying()` og `handleEnded` bruker samme logikk
