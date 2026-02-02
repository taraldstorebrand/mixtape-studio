# TASKS.md

## P0 – Kritiske

### Task 1: Legg til avspilling i PlaylistEditor

**Status:** ✅ Completed

**Krav:**
- Legg til play/pause-funksjonalitet på `SortablePlaylistItem`
- Bruk samme visuelle stil som `HistoryItem` (thumbnail overlay med ▶/⏸, nowPlaying-styling)
- Avspilling fra editor skal sette `playbackQueue` til editorens sangliste
- Next/previous skal navigere innenfor editorens liste
- NowPlaying-markering skal vises på sangen som spilles

**Filer å endre:**
- `frontend/src/components/playlist/PlaylistEditor/SortablePlaylistItem.tsx`
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.module.css`

**Referanse:**
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx` (visuell stil og playback-logikk)
