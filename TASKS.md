# TASKS.md

## P0 – Kritiske

### Task 1: Fiks duplikat-håndtering i playlist-navigasjon

**Status:** Completed

**Problem:**
Når samme sang finnes flere ganger i en playlist, blir navigasjon (next/prev) forvirret. `indexOf` finner alltid første forekomst av sang-ID, så den hopper til feil posisjon.

**Årsak:**
`playbackQueueAtom` lagrer kun sang-IDer (`string[]`). Ved duplikater gir `queue.indexOf(songId)` alltid første match.

**Løsning:**
Endre `playbackQueueAtom` til å lagre unike entry-IDer eller posisjoner i stedet for sang-IDer, slik at hver forekomst kan identifiseres unikt.

**Filer å endre:**
- `frontend/src/store/atoms.ts` – playbackQueueAtom struktur
- `frontend/src/components/nowplaying/NowPlayingBar/hooks/useAudioPlayback.ts` – navigasjonslogikk
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx` – handleNext/handlePrevious
- `frontend/src/components/playlist/PlaylistEditor/SortablePlaylistItem.tsx` – kø-setting
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx` – kø-synk
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx` – kø-setting
