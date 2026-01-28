# TASKS.md

## Feature: Avansert Mixtape Editor

### Oversikt
En ny knapp i GUI som åpner en modal med to-panel editor for å lage mixtapes med full kontroll over sangvalg og rekkefølge.

### Foreslått Design

```
┌─────────────────────────────────────────────────────────────────────┐
│  Lag Mixtape                                                    [X] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ Tilgjengelige sanger ─────────┐  ┌─ Din mixtape ─────────────┐ │
│  │ [Søk...] [Filter: Alle ▼]      │  │ Mixtape-navn: [________]  │ │
│  │                                │  │                           │ │
│  │ ♪ Sang 1            [+]       │  │ 1. ♪ Sang 3    [↑][↓][×] │ │
│  │ ♪ Sang 2            [+]       │  │ 2. ♪ Sang 1    [↑][↓][×] │ │
│  │ ♪ Sang 3            [+]       │  │ 3. ♪ Sang 3    [↑][↓][×] │ │
│  │ ♪ Sang 4            [+]       │  │                           │ │
│  │ ...                            │  │ ─────────────────────────│ │
│  │                                │  │ Totalt: 3 sanger (12:34) │ │
│  └────────────────────────────────┘  └───────────────────────────┘ │
│                                                                     │
│                              [Avbryt]  [Lag Mixtape]                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Beslutninger tatt

| Spørsmål | Beslutning |
|----------|------------|
| 1. Drag-and-drop bibliotek | **@dnd-kit** |
| 2. Modal | **Egenbygd** |
| 3. Lagring | **Kun "lag og last ned"** (foreløpig) |
| 4. Filtre | **Tekstsøk + Likte** |
| 5. Mixtape-navn | **Valgfritt input**, default: "Mixtape YYYY-MM-DD" |
| 6. Interaksjon | **Full drag-and-drop + tastaturstøtte** |

---

## Subtasks

### Fase 1: Infrastruktur ✅
- [x] **1.1** Installer valgt bibliotek (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- [x] **1.2** Lag Modal-komponent (basis) → `components/common/Modal/`
- [x] **1.3** Legg til "Avansert mixtape"-knapp i HistoryPanel → `components/mixtape/AdvancedMixtapeButton/`
- [x] **1.4** Lag MixtapeEditor placeholder → `components/mixtape/MixtapeEditor/`

### Fase 2: Venstre panel - Sangvelger ✅
- [x] **2.1** Lag SongPicker-komponent → `components/mixtape/SongPicker/`
- [x] **2.2** Implementer søk/filter-funksjonalitet (tekstsøk + alle/likte)
- [x] **2.3** Legg til [+]-knapp for å legge til sang i mixtape
- [x] **2.4** Oppdater MixtapeEditor med SongPicker og state-håndtering

### Fase 3: Høyre panel - Mixtape-liste ✅
- [x] **3.1** Lag MixtapeList-komponent (integrert i MixtapeEditor)
- [x] **3.2** Vis sanger med rekkefølge-nummer
- [x] **3.3** Implementer sortering (drag-and-drop med @dnd-kit + tastaturstøtte)
- [x] **3.4** Implementer fjerning av sanger
- [x] **3.5** Vis total varighet

### Fase 4: Integrasjon ✅
- [x] **4.1** Ny backend-endpoint `/api/mixtape/custom` med songIds og name
- [x] **4.2** Ny frontend-funksjon `startCustomMixtapeGeneration()`
- [x] **4.3** Mixtape-navn input felt med default "Mixtape YYYY-MM-DD"
- [x] **4.4** Loading-state med spinner under generering
- [x] **4.5** Feilhåndtering med error-melding

### Fase 5: Polish ✅
- [x] **5.1** Styling som matcher eksisterende dark theme
- [x] **5.2** Keyboard-navigasjon (Escape lukker modal, etc.)
- [x] **5.3** Responsiv design for mindre skjermer

---

## Tekniske notater

**Eksisterende stack:**
- React + TypeScript
- Jotai (state management)
- CSS Modules (styling)
- Socket.IO (real-time updates)
- Ingen UI-bibliotek (vanilla CSS med dark theme)

**Eksisterende mixtape-API:**
- `startMixtapeGeneration()` - må utvides til å ta liste med sang-IDer
- `mixtape-ready` WebSocket-event
- `downloadMixtape(downloadId)`
