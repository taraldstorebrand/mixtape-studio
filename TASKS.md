# TASKS.md

## Tekstsøk / filtreringsfelt i historikkpanelet

Legg til et tekstbasert søkefelt i historikkpanelet, på raden direkte under «Upload music»-knappen. Feltet filtrerer listen over sanger i sanntid basert på tittel og artist, og har en ×-knapp på høyre side for å tømme søketeksten.

**Bakgrunn:**
- Historikkpanelet har i dag kun knappbasert filtrering (Songs / Liked / All) og ingen fritekst-søk.
- `filteredHistoryAtom` i `atoms.ts` filtrerer kun på `feedback`-feltet – ikke på tekst.
- Søkefeltet skal fungere i **begge** modi: bibliotekvisning og playlistvisning, fordi `displayItems` i begge tilfeller er en liste med `HistoryItem`.
- `HistoryList.tsx` er i dag en løs fil og må flyttes til sin egen mappe slik at reglene i AGENTS.md for subkomponenter kan overholdes.

---

## Task 1: Flytt `HistoryList` til egen mappe

**Status:** Ikke påbegynt

**Beskrivelse:**
Flytt komponent og CSS-modul til en ny mappe slik at `SearchInput`-subkomponenten kan plasseres korrekt iht. AGENTS.md.

**Filer som endres / opprettes:**

- Opprett mappe: `frontend/src/components/history/HistoryList/`
- Flytt: `frontend/src/components/history/HistoryList.tsx` → `frontend/src/components/history/HistoryList/HistoryList.tsx`
- Flytt: `frontend/src/components/history/HistoryList.module.css` → `frontend/src/components/history/HistoryList/HistoryList.module.css`
- Oppdater importen i `frontend/src/components/panels/HistoryPanel.tsx`:
  - Fra: `import { HistoryList } from '../history/HistoryList';`
  - Til: `import { HistoryList } from '../history/HistoryList/HistoryList';`

Ingen logikk eller stil endres i dette steget.

---

## Task 2: Legg til `searchQueryAtom` i `atoms.ts`

**Status:** Ikke påbegynt

**Fil:** `frontend/src/store/atoms.ts`

**Endringer:**

Legg til en ny atom rett etter `filterAtom` (linje 9):

```ts
export const searchQueryAtom = atom('');
```

Ingen endringer i `filteredHistoryAtom` – tekstfiltreringen håndteres i `HistoryList` mot `displayItems` slik at den fungerer både i bibliotek- og playlistmodus.

---

## Task 3: Opprett `SearchInput`-komponenten

**Status:** Ikke påbegynt

**Filer som opprettes:**
- `frontend/src/components/history/HistoryList/SearchInput/SearchInput.tsx`
- `frontend/src/components/history/HistoryList/SearchInput/SearchInput.module.css`

### `SearchInput.tsx`

Komponenten har ingen props. Den leser og skriver direkte til `searchQueryAtom`.

**Forventet struktur:**

```tsx
<div className={styles.searchWrapper}>
  <input
    type="text"
    className={styles.searchInput}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder={t.placeholders.searchForSongs}
    aria-label={t.placeholders.searchForSongs}
  />
  {searchQuery && (
    <button
      type="button"
      className={styles.clearButton}
      onClick={() => setSearchQuery('')}
      aria-label={t.tooltips.clearSearch}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  )}
</div>
```

- Bruk `useAtom(searchQueryAtom)` for å lese og sette søketekst.
- ×-knappen vises kun når `searchQuery` er ikke-tom.
- Bruk eksisterende i18n-nøkkel `t.placeholders.searchForSongs` for `placeholder` og `aria-label`.
- Bruk ny i18n-nøkkel `t.tooltips.clearSearch` for ×-knappens `aria-label` (legges til i Task 4).

### `SearchInput.module.css`

```css
.searchWrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.searchInput {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  padding-right: 2rem;
  background-color: var(--color-bg-inset);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: border-color var(--transition-base);
  box-sizing: border-box;
}

.searchInput::placeholder {
  color: var(--color-text-dim);
}

.searchInput:focus {
  outline: none;
  border-color: var(--color-primary);
}

.searchInput:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.clearButton {
  position: absolute;
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--color-text-dim);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: color var(--transition-base);
}

.clearButton:hover {
  color: var(--color-text);
}

.clearButton:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Task 4: Legg til `clearSearch` i i18n

**Status:** Ikke påbegynt

**Fil:** `frontend/src/i18n/en.ts`

**Endring:**

I `tooltips`-objektet, legg til én ny nøkkel (plasser den alfabetisk eller etter `clear`):

```ts
clearSearch: 'Clear search',
```

---

## Task 5: Integrer `SearchInput` i `HistoryList`

**Status:** Ikke påbegynt

**Fil:** `frontend/src/components/history/HistoryList/HistoryList.tsx`

**Endringer:**

### 5a – Importer

Legg til to nye importer:

```ts
import { SearchInput } from './SearchInput/SearchInput';
import { searchQueryAtom } from '../../store/atoms';
```

Legg til `searchQueryAtom` i den eksisterende import-linjen fra `'../../store/atoms'`.

### 5b – Atom-bruk

Legg til i komponentkroppen, rett etter eksisterende atom-kall:

```ts
const searchQuery = useAtomValue(searchQueryAtom);
```

### 5c – Filtrer `displayItems` på søketekst

Erstatt bruken av `displayItems` til rendering med en lokal `searchedItems`-variabel. Legg til rett etter `const displayItems = ...`-linjen (linje 44):

```ts
const lowerQuery = searchQuery.toLowerCase();
const searchedItems = searchQuery.trim()
  ? displayItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        (item.artist?.toLowerCase().includes(lowerQuery) ?? false)
    )
  : displayItems;
```

Erstatt alle videre referanser til `displayItems` i JSX med `searchedItems`, **unntatt** der `displayItems.length` brukes for å sende antall sanger til `PlaylistDropdown` og `MixtapeButton` – der skal `displayItems.length` beholdes.

### 5d – Plasser `<SearchInput />` i panelet

I JSX, legg til `<SearchInput />` mellom `panelActionsButtons`-diven og `headerBar`-diven, inni `{!isUploadFormActive && (...)}`:

```tsx
{!isUploadFormActive && (
  <>
    <SearchInput />
    <div className={styles.headerBar}>
      {/* eksisterende innhold */}
    </div>
  </>
)}
```

### 5e – Tom-liste-melding ved søk

I den eksisterende tom-liste-blokken, vis `t.messages.noSongsFound` når `searchQuery` er satt, ellers eksisterende melding:

```tsx
{searchedItems.length === 0 ? (
  <div className={styles.empty}>
    <p>
      {searchQuery.trim()
        ? t.messages.noSongsFound
        : selectedPlaylistId !== null
          ? t.messages.noSongsInPlaylist
          : t.messages.noSongsAvailable}
    </p>
  </div>
) : (
  /* eksisterende liste-rendering, men med searchedItems */
)}
```

---

## Testplan (etter gjennomføring)

1. Skriv inn deler av en sangtittel – verifiser at listen filtreres i sanntid
2. Skriv inn et artistnavn – verifiser at sanger med den artisten vises
3. Verifiser at ×-knappen vises mens det er tekst i feltet, og er skjult ellers
4. Klikk ×-knappen – verifiser at feltet tømmes og full liste vises igjen
5. Søk etter noe som ikke finnes – verifiser at «No songs found» vises
6. Bytt til «Liked»-filter mens søk er aktivt – verifiser at begge filtre kombineres
7. Åpne en playlist – verifiser at søkefeltet fortsatt fungerer mot playlistens sanger
8. Åpne opplastingsskjemaet (Upload music) – verifiser at søkefeltet skjules
