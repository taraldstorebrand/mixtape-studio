# TASKS.md

## P1 – Viktige

### Task 2: Genre-dropdown vises ikke korrekt

**Status:** 🔄 In Progress

**Problembeskrivelse:**
Dropdown-listen for genre-valg vises ikke oppå resten av skjerminnholdet. I stedet må brukeren scrolle inni panelet for å se valgene.

**Forventet oppførsel:**
- Genre-dropdown options skal vises som en overlay/popup oppå resten av innholdet
- Brukeren skal kunne se alle tilgjengelige valg uten å scrolle i panelet

**Filer som skal undersøkes og potensielt endres:**
- `frontend/src/components/lyrics/LyricsTextarea/GenreInput/GenreInput.tsx`
- `frontend/src/components/lyrics/LyricsTextarea/GenreInput/GenreInput.module.css`
