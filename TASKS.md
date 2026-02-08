# TASKS.md

## P1 – Forbedre PlaylistEditor modal layout

### Task 1: Hindre at modalen overlapper NowPlayingBar

**Status:** Ferdig

**Beskrivelse:**
Modalen bruker `max-height: 85vh` uten å ta hensyn til NowPlayingBar (ca. 90px) som er fixed i bunnen. Save/Cancel-knappene havner bak baren.

**Forventet oppførsel:**
- Modalen skal aldri overlappe NowPlayingBar
- Save/Cancel-knappene skal alltid være synlige over baren

**Filer som skal endres:**
- `frontend/src/components/common/Modal/Modal.module.css`
  - Endre `max-height` til `calc(85vh - 90px)` eller bruk `bottom`-padding på overlay for å gi plass til NowPlayingBar

---

### Task 2: Utnytt tilgjengelig plass bedre i playlist-kolonnen

**Status:** Ferdig

**Beskrivelse:**
Høyre kolonne (playlist-siden) har mye ubrukt vertikal plass. Sangene i listen tar lite plass, og resten er tom. Kolonnen bør fylle tilgjengelig høyde slik at listen har plass til å vise flere sanger uten scrolling.

**Forventet oppførsel:**
- Begge kolonnene skal strekke seg for å fylle tilgjengelig vertikal plass i modalen
- Playlist-listen (`playlistList`) skal ta opp all ledig plass i sin kolonne
- Placeholder-teksten ("Add a song...") skal være sentrert i den tilgjengelige plassen

**Filer som skal endres:**
- `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.module.css`
  - Sørg for at `.columns` og `.column` bruker `flex: 1` og `min-height: 0` korrekt for å fylle høyden
  - `.playlistList` skal ha `flex: 1` for å ta opp resterende plass

---

### Task 3: Gi modalen mer bredde for bedre utnyttelse av skjermplassen

**Status:** Ferdig

**Beskrivelse:**
Modalen har `max-width: 900px`, noe som gjør at det er mye ubrukt plass på sidene på bredere skjermer. En bredere modal gir mer plass til begge kolonnene.

**Forventet oppførsel:**
- Øk `max-width` til `1100px` for å gi mer horisontal plass
- Modalen skal fortsatt ha tilstrekkelig margin til sidene

**Filer som skal endres:**
- `frontend/src/components/common/Modal/Modal.module.css`
  - Endre `max-width` fra `900px` til `1100px`

---

### Task 4: Tvinge modalen til å fylle tilgjengelig vertikal plass

**Status:** Ferdig

**Beskrivelse:**
Modalen bruker bare `max-height`, som er et tak – ikke et mål. Modalen krymper til innholdsstørrelsen og fyller aldri den tilgjengelige vertikale plassen. Resultatet er at kun 2-3 sanger er synlige i hver kolonne selv om det er masse ledig plass.

**Forventet oppførsel:**
- Modalen skal alltid fylle den tilgjengelige vertikale plassen (opp til maks)
- Begge sangliste-kolonnene skal strekke seg og vise flere sanger

**Filer som skal endres:**
- `frontend/src/components/common/Modal/Modal.module.css`
  - Legg til `height: calc(85vh - 90px)` i tillegg til eksisterende `max-height`, slik at modalen alltid fyller høyden i stedet for å krympe til innhold

---

### Task 5: Utnytt mer av skjermhøyden

**Status:** Ferdig

**Beskrivelse:**
Med NowPlayingBar-offset allerede håndtert er `85vh` konservativt. Modalen kan trygt bruke mer av skjermhøyden for å vise flere sanger.

**Forventet oppførsel:**
- Modalen skal bruke mer av tilgjengelig skjermhøyde
- Det skal fortsatt være litt luft over og under modalen

**Filer som skal endres:**
- `frontend/src/components/common/Modal/Modal.module.css`
  - Endre `85vh` til `92vh` i både `height` og `max-height` beregningene
