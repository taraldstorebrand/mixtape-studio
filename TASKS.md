# TASKS.md

## P1 – Scroll til og highlight "Now playing"-sang

### Task 1: Legg til atom for scroll-til-item-funksjonalitet

**Status:** Ikke startet

**Beskrivelse:**
Opprett et nytt atom som holder styr på hvilket item som skal scrolles til når bruker klikker "Now playing"-knappen i DetailPanel.

**Forventet oppførsel:**
- Atomet skal lagre item-ID som skal scrolles til
- Atomet skal kunne nullstilles

**Filer som skal endres:**
- `frontend/src/store/atoms.ts`
  - Legg til `scrollToItemIdAtom` av typen `string | null`

---

### Task 2: Eksporter det nye atomet

**Status:** Ikke startet

**Beskrivelse:**
Eksporter det nye atomet slik at det kan brukes i andre komponenter.

**Filer som skal endres:**
- `frontend/src/store/index.ts`
  - Legg til `scrollToItemIdAtom` i eksportlisten

---

### Task 3: Oppdater App.tsx for å sette scroll-mål ved "Now playing"-klikk

**Status:** Ikke startet

**Beskrivelse:**
Når bruker klikker "Now playing"-knappen i DetailPanel (via onSelectItem), skal App.tsx sette scroll-målet i det nye atomet. Dette skal kun skje når item faktisk finnes i den nåværende listen (library eller playlist).

**Forventet oppførsel:**
- I library-modus: Sjekk om item finnes i `filteredHistoryAtom` (respekter filtre)
- I playlist-modus: Sjekk om item finnes i `currentPlaylistSongsAtom` (valgte playlist)
- Hvis item ikke finnes i den nåværende listen, skal INGEN scroll eller highlight skje
- Hvis item finnes, sett `scrollToItemIdAtom` til item-ID
- Scroll-målet skal settes regardless av om item er valgt fra før
- Nullstill scroll-målet etter kort tid (f.eks. 2 sekunder)

**Filer som skal endres:**
- `frontend/src/App.tsx`
  - Importer `scrollToItemIdAtom`, `useSetAtom`, `useAtomValue`
  - Importer `filteredHistoryAtom` og `currentPlaylistSongsAtom`
  - Oppdater `handleSelectItemById` for å sjekke om item finnes i nåværende liste
  - Kun sett scroll-mål hvis item finnes
  - Nullstill scroll-målet etter kort tid (f.eks. 2 sekunder)

---

### Task 4: Implementer scroll og highlight i HistoryList

**Status:** Ikke startet

**Beskrivelse:**
HistoryList skal overvåke `scrollToItemIdAtom` og når den endres, skal komponenten:
1. Finne elementet som matcher item-ID
2. Sjekke om elementet finnes i nåværende liste (library eller playlist)
3. Sjekke om elementet er synlig i viewport
4. Hvis elementet finnes men ikke er synlig, scroll til elementet
5. Vise en subtil highlight-effekt på elementet

**Forventet oppførsel:**
- Hvis elementet ikke finnes i listen, gjør ingenting (returner tidlig)
- Elementet skal scrolles til sentrert i viewport hvis det ikke er synlig
- En subtil highlight-animasjon skal vises på elementet
- Funksjonen skal håndtere både library-modus og playlist-modus
- Funksjonen skal håndtere filtrerte views (kun scrolle til items som er synlige i det filtrerte viewet)

**Filer som skal endres:**
- `frontend/src/components/history/HistoryList.tsx`
  - Importer `scrollToItemIdAtom` og `useAtomValue`
  - Legg til `useEffect` som overvåker endringer i `scrollToItemIdAtom`
  - Implementer sjekk for om element er synlig i viewport (bruk Intersection Observer)
  - Implementer scroll til element med `scrollIntoView({ behavior: 'smooth', block: 'center' })`
  - Gi HistoryItem en `highlight`-prop når det skal highlightes

---

### Task 5: Legg til highlight-prop i HistoryItem

**Status:** Ikke startet

**Beskrivelse:**
HistoryItem skal akseptere en `highlight`-prop som styrer om en subtil highlight-effekt skal vises.

**Forventet oppførsel:**
- Når `highlight` er `true`, skal en CSS-animasjon klasse legges til
- Effekten skal være subtil og ikke forstyrrende

**Filer som skal endres:**
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`
  - Legg til `highlight?: boolean` i interface
  - Bruk `highlight` til å legge til en CSS-klasse på root-elementet

---

### Task 6: Implementer CSS-animasjon for highlight-effekt

**Status:** Ikke startet

**Beskrivelse:**
Legg til en subtil CSS-animasjon som highlighter elementet når det blir scrollet til.

**Forventet oppførsel:**
- En subtil bakgrunnsfarge-animasjon som fader inn og ut
- Effekten bør vare ca. 1-2 sekunder
- Bruk eksisterende CSS-variabler for farger

**Filer som skal endres:**
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`
  - Legg til `.highlight`-klasse med CSS-animasjon
  - Bruk `@keyframes` for å lage en subtil farge-animasjon
