# TASKS.md

## P1 – Viktige

### Task 1: Skjul DetailPanel på mobil med toggle-knapp

**Status:** ✅ Done

**Implementert løsning:**
- Hele DetailPanel (panelLeft) skjules på mobil (`max-width: 900px`)
- En "Show details"-knapp vises øverst i HistoryPanel (panelRight)
- Klikk på knappen viser DetailPanel
- En X-knapp øverst til høyre i DetailPanel lukker det igjen

**Endrede filer:**
- `frontend/src/App.tsx` - Lagt til toggle-knapper og state
- `frontend/src/App.module.css` - CSS for mobil-toggle
- `frontend/src/store/atoms.ts` - Ny atom `detailPanelOpenAtom`
- `frontend/src/store/index.ts` - Eksporterer ny atom
- `frontend/src/i18n/en.ts` - Nye tekster for knappene

**Testing:**
1. Åpne appen i mobilvisning (DevTools, ≤900px bredde)
2. Verifiser at DetailPanel er skjult
3. Verifiser at "Show details"-knappen vises øverst
4. Klikk på knappen - DetailPanel skal vises
5. Klikk X-knappen - DetailPanel skal skjules igjen
6. Verifiser at desktop-visning er uendret
