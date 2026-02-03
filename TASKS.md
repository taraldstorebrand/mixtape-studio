# TASKS.md

## P0 – Kritiske

### Task 1: HistoryItem mobilvisning er ødelagt

**Status:** Completed

**Problem:**
På mobil vises sangtittelen som en liten, blinkende terning. Tittelen får ikke nok plass og kollapser. Marquee-animasjonen kjører på et element med null bredde.

**Årsak:**
- `historyMeta` bruker `flex: 1` og `min-width: 0`, men parent-containeren har ikke riktig flex-oppsett for mobil
- `historyHeader` bruker `gap: var(--spacing-sm)` som tar for mye plass på små skjermer
- `historyActions` med feedbackButtons og deleteButton tar for mye horisontal plass
- Mangler dedikert `@media (max-width: 768px)` responsive styling

**Løsning:**
Legg til mobil-responsive CSS i `HistoryItem.module.css`:

1. **Reduser thumbnail-størrelse** på mobil (48px → 40px)
2. **Stack layout vertikalt** eller bruk kompakt horisontal layout:
   - Tittel + varighet på én linje
   - Flytt actions til egen rad eller gjør dem mindre
3. **Skjul dato** på mobil (allerede gjort ved 900px, men kan flyttes til 768px)
4. **Reduser padding og gap** for å spare plass
5. **Sørg for at titleWithDuration får flex: 1** og ikke kollapser

**Forslag til mobil-layout:**
```
[Thumbnail] [Title...] [👍👎🗑]
            [Duration]
```

**Filer å endre:**
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`
- Eventuelt `HistoryItem.tsx` hvis markup må endres

---

## P1 – Viktige

### Task 2: Gjennomgå mobil-layout for hele appen

**Status:** Open

**Problem:**
Flere komponenter mangler konsistent mobil-styling. Breakpoints varierer (768px, 900px).

**Oppgaver:**
- [ ] Standardiser breakpoints (bruk 768px for mobil, 1024px for tablet)
- [ ] Sjekk at NowPlayingBar fungerer på mobil
- [ ] Sjekk at HistoryPanel/HistoryList har riktig scroll-oppførsel
- [ ] Test at PlaylistEditor fungerer på mobil (allerede har styling)

**Filer å sjekke:**
- `frontend/src/components/history/HistoryItem/HistoryItem.module.css`
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`
- `frontend/src/components/panels/HistoryPanel.module.css`
- `frontend/src/App.module.css`
