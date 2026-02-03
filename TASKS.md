# TASKS.md

## P0 – Kritiske

### Task 1: NowPlayingBar går utenfor skjermen på mobil

**Status:** Completed

**Problem:**
NowPlayingBar strekker seg langt utenfor høyre side av skjermen på mobil. Dette gjør at brukeren må scrolle horisontalt.

**Årsak:**
- `centerSection` har `min-width: 400px` (linje 44) som ikke overstyres i mobil media query
- `content` har `max-width: 1400px` men ingen `width: 100%` eller `overflow: hidden`
- `.nowPlayingBar` mangler `overflow: hidden` for å hindre horisontal overflow

**Løsning:**
1. Legg til `min-width: 0` på `.centerSection` i mobil media query
2. Legg til `overflow: hidden` på `.nowPlayingBar`
3. Legg til `width: 100%` og `box-sizing: border-box` på `.content` i mobil
4. Vurder å endre layout til vertikal stacking på svært små skjermer

**Filer å endre:**
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.module.css`
