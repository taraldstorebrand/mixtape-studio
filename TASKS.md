# TASKS.md

## CSS Modules Migration

Migrer fra monolittisk `App.css` (~1000 linjer) til co-located CSS Modules.

### Mål
- Scoped stiler per komponent (ingen navnekollisjoner)
- Bedre vedlikeholdbarhet og lesbarhet
- Tydelig kobling mellom komponent og stil

### Filstruktur etter migrering

```
frontend/src/
├── index.css                          # Globale resets, CSS-variabler, keyframes
├── App.module.css                     # App-layout stiler
├── components/
│   ├── history/
│   │   ├── HistoryList.module.css
│   │   ├── HistoryList.tsx
│   │   ├── HistoryItem/
│   │   │   ├── HistoryItem.module.css
│   │   │   └── HistoryItem.tsx
│   │   ├── MixtapeButton/
│   │   │   ├── MixtapeButton.module.css
│   │   │   └── MixtapeButton.tsx
│   │   └── UploadButton/
│   │       ├── UploadButton.module.css
│   │       └── UploadButton.tsx
│   ├── lyrics/
│   │   ├── LyricsTextarea.module.css
│   │   ├── LyricsTextarea.tsx
│   │   ├── PromptInput.module.css
│   │   └── PromptInput.tsx
│   ├── panels/
│   │   ├── DetailPanel.module.css
│   │   ├── DetailPanel.tsx
│   │   ├── HistoryPanel.module.css
│   │   └── HistoryPanel.tsx
│   └── GenreInput.module.css
│       GenreInput.tsx
```

### Oppgaver

#### Fase 1: Forberedelser
- [ ] **1.1** Opprett `frontend/src/styles/variables.css` med CSS custom properties for farger, spacing, border-radius
- [ ] **1.2** Flytt globale stiler (resets, keyframes som `skeleton-pulse`, `spinner-rotate`) til `index.css`

#### Fase 2: Komponent-migrering (én om gangen)
- [ ] **2.1** `App.tsx` → `App.module.css` (`.app`, `.app-header`, `.app-main`, `.panel-left`, `.panel-right`, `.resize-handle`)
- [ ] **2.2** `GenreInput.tsx` → `GenreInput.module.css` (`.input-group`, `.genre-*` stiler)
- [ ] **2.3** `LyricsTextarea.tsx` → `LyricsTextarea.module.css` (`.lyrics-container`, `.lyrics-editor`, `.lyrics-label`)
- [ ] **2.4** `PromptInput.tsx` → `PromptInput.module.css` (`.prompt-*`, `.ai-assist-section`, `.ai-toggle-*`)
- [ ] **2.5** `HistoryList.tsx` → `HistoryList.module.css` (`.history-list`, `.history-header`, `.history-scroll`)
- [ ] **2.6** `HistoryItem.tsx` → `HistoryItem.module.css` (`.history-item`, `.status-badge`, `.audio-preview`, `.feedback-buttons`, `.thumb-button`)
- [ ] **2.7** `MixtapeButton.tsx` → `MixtapeButton.module.css` (`.mixtape-*` stiler)
- [ ] **2.8** `UploadButton.tsx` → `UploadButton.module.css` (`.upload-*` stiler)
- [ ] **2.9** `DetailPanel.tsx` → `DetailPanel.module.css` (`.detail-*`, `.song-meta-*` stiler)
- [ ] **2.10** `HistoryPanel.tsx` → `HistoryPanel.module.css`

#### Fase 3: Delte stiler
- [ ] **3.1** Opprett `frontend/src/styles/buttons.module.css` for gjenbrukbare knappestiler (`.generate-button`, `.primary`, `.delete-button`)
- [ ] **3.2** Opprett `frontend/src/styles/skeleton.module.css` for skeleton loader-stiler

#### Fase 4: Opprydding
- [ ] **4.1** Slett `App.css` når all migrering er verifisert
- [ ] **4.2** Kjør visuell testing av alle komponenter
- [ ] **4.3** Oppdater eventuelle tester som refererer til klassenavn

### Notater
- Vite støtter CSS Modules out-of-the-box (`.module.css` suffix)
- Bruk `styles.className` syntax i TSX
- Kombiner klasser med template literals: `` className={`${styles.button} ${styles.primary}`} ``
- Responsive stiler (`@media`) forblir i samme modul-fil
