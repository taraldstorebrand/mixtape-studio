# TASKS.md

## P1 – Toolbar-redesign for HistoryList

### Task 1: Vis antall i dropdown-knappen og fjern redundant h2-tittel

**Status:** Ferdig

**Beskrivelse:**
Dropdown-knappen viser kun kontekstnavn ("Songs" eller playlistnavn), mens antallet vises separat i en h2 til hoyre. Fjern h2-tittelen og inkluder antallet direkte i dropdown-knappen.

**Forventet oppforsel:**
- Library-modus: `[Songs (61) ▼]` i stedet for `[Songs ▼]` ... `Songs (61)`
- Playlist-modus: `[Venter bare pa deg (14) ▼]` i stedet for `[Venter bare pa deg ▼]` ... `Venter bare pa deg (14)`
- h2-elementet fjernes fra headerBar

**Filer som skal endres:**
- `frontend/src/components/history/PlaylistDropdown/PlaylistDropdown.tsx`
  - Legg til `itemCount` prop
  - Vis antall i parentes etter navnet i dropdown-knappen
- `frontend/src/components/history/HistoryList.tsx`
  - Fjern h2-elementene (linje 152 og 179)
  - Send `itemCount` til PlaylistDropdown
- `frontend/src/components/history/HistoryList.module.css`
  - Fjern `.historyList h2`-stilen

---

### Task 2: Omorganiser toolbar-layout til venstre/hoyre-gruppering

**Status:** Ferdig

**Beskrivelse:**
Organiser toolbaren slik at navigasjon er til venstre og handlinger er til hoyre. Bruk en tydelig visuell separasjon.

**Forventet layout:**
- Library-modus: `[Songs (61) ▼] [Songs|Liked|All]` ............ `[+ Create playlist]`
- Playlist-modus: `[← Library] [Venter bare pa deg (14) ▼]` ............ `[✏] [🗑]`

**Filer som skal endres:**
- `frontend/src/components/history/HistoryList.tsx`
  - Wrap dropdown + filterknapper i en venstre-gruppe
  - Wrap handlingsknapper i en hoyre-gruppe
- `frontend/src/components/history/HistoryList.module.css`
  - Legg til `.headerBarLeft` og `.headerBarRight` med flex-layout
  - Behold `justify-content: space-between` pa `.headerBar`

---

### Task 3: Flytt "← Library"-knappen ut av dropdown og PlaylistActions

**Status:** Ferdig

**Beskrivelse:**
"Tilbake til library" finnes pa to steder: som menypunkt i dropdown-menyen OG som ikonknapp i PlaylistActions. Erstatt begge med en tydelig tekstknapp `← Library` som vises til venstre for dropdownen kun i playlist-modus.

**Forventet oppforsel:**
- I playlist-modus: `[← Library]` vises som en synlig knapp til venstre for dropdown
- Fjernes fra dropdown-menyen ("`← Library`"-menypunktet)
- Fjernes fra PlaylistActions (pil-ikonknappen)
- I library-modus: knappen vises ikke

**Filer som skal endres:**
- `frontend/src/components/history/HistoryList.tsx`
  - Legg til en `← Library`-knapp i headerBar, betinget pa `selectedPlaylistId !== null`
- `frontend/src/components/history/PlaylistDropdown/PlaylistDropdown.tsx`
  - Fjern "`← Library`"-menypunktet fra dropdown-menyen
- `frontend/src/components/history/PlaylistActions/PlaylistActions.tsx`
  - Fjern tilbake-knappen (pilikonet) fra playlist-modus
  - Fjern `onReturnToLibrary` prop
- `frontend/src/components/history/HistoryList.module.css`
  - Stil for den nye tilbake-knappen

---

### Task 4: Flytt "+ Create playlist" til dropdown-menyen i playlist-modus

**Status:** Ferdig

**Beskrivelse:**
Nar man er inne i en playlist, er "opprett ny playlist" (+) sjelden brukt. Flytt den inn i dropdown-menyen som et menypunkt nederst. Behold den som en synlig knapp kun i library-modus.

**Forventet oppforsel:**
- Library-modus: `[+ Create playlist]`-knappen vises i headerBar til hoyre (som for)
- Playlist-modus: `+ New playlist` vises som siste menypunkt i dropdown-menyen
- Ikonknappen (+) fjernes fra PlaylistActions i playlist-modus

**Filer som skal endres:**
- `frontend/src/components/history/PlaylistDropdown/PlaylistDropdown.tsx`
  - Legg til `onCreatePlaylist` prop
  - Legg til "+ New playlist" som menypunkt nederst i dropdown (med separator)
- `frontend/src/components/history/PlaylistActions/PlaylistActions.tsx`
  - Fjern (+)-knappen fra playlist-modus (behold kun ✏ og 🗑)
- `frontend/src/components/history/PlaylistDropdown/PlaylistDropdown.module.css`
  - Stil for separator og create-menypunktet
