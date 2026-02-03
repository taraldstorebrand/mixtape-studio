# TASKS.md

## P0 – Kritiske

### Task 1: selectedItem skal kun markere spilles sang, ikke dubletter

**Status:** Completed

**Problem:**
Når samme sang finnes flere ganger i en playlist, markerer `selectedItemAtom` alle forekomstene av den sangen. Hvis sang A (ID: "123") står to ganger i køen og spilles, markeres begge forekomstene som valgt i stedet for bare den som faktisk spilles.

**Årsak:**
`selectedItemAtom` lagrer kun sang-ID (`string`). Når duplikater finnes, kan ikke systemet skille mellom forekomstene - de har samme ID.

**Løsning:**
Endret seleksjonssystemet til å bruke unike entry-referanser i playlist-modus:
- Lagt til `selectedQueueEntryIdAtom` som lagrer entry-ID fra `playbackQueueAtom`
- Lagt til `currentPlaylistEntriesAtom` som lagrer full `PlaylistSongEntry[]` (med entry-IDs)
- I playlist-modus: bruk entry-ID for å identifisere hvilken forekomst som spilles
- I library-modus: behold eksisterende sang-ID-basert seleksjon

**Filer endret:**
- `frontend/src/store/atoms.ts` – lagt til `selectedQueueEntryIdAtom` og `currentPlaylistEntriesAtom`
- `frontend/src/store/index.ts` – eksportert nye atomer
- `frontend/src/components/nowplaying/NowPlayingBar/hooks/useAudioPlayback.ts` – oppdatert `setNowPlaying` for å sette `selectedQueueEntryIdAtom` og bruke entry-IDs fra `currentPlaylistEntriesAtom` i playlist-modus
- `frontend/src/components/history/HistoryList.tsx` – oppdatert for å bruke `currentPlaylistEntriesAtom` og pass inn `entryId` til `HistoryItem`
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx` – lagt til `entryId` prop, bruker `selectedQueueEntryIdAtom` for å bestemme seleksjon og nowPlaying-markering i playlist-modus
- `frontend/src/components/playlist/PlaylistEditor/SortablePlaylistItem.tsx` – bruker `selectedQueueEntryIdAtom` for nowPlaying-markering og oppdaterer den når sang spilles
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx` – bruker entry-IDs fra playlist-entries når playbackQueue oppdateres
