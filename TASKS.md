# TASKS.md

## P1 – Viktige

### Task 1: Implementer Media Session API for iOS lock screen-kontroller

**Status:** ✅ Completed

**Beskrivelse:**
Legg til Media Session API-integrasjon for å vise playback-kontroller på iOS lock screen og andre plattform-mediekontroller.

**Forventet oppførsel:**
- Next/previous-knapper skal vises på iOS lock screen
- Play/pause-knapp skal fungere fra lock screen
- Song metadata (tittel, artist, album, artwork) skal vises
- Fremdriftsbar skal vise avspillingsposisjon

**Filer som skal endres:**
- `frontend/src/components/nowplaying/NowPlayingBar/hooks/useAudioPlayback.ts`
  - Flytt handlePrevious og handleNext fra NowPlayingBar.tsx
  - Legg til Media Session setup med metadata
  - Konfigurer action handlers (play, pause, nexttrack, previoustrack)
  - Oppdater playbackState og positionState
  
- `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`
  - Fjern handlePrevious og handleNext (flyttet til hook)
  - Bruk funksjonene fra useAudioPlayback hook

**Implementeringssteg:**
1. Flytt handlePrevious og handleNext fra NowPlayingBar.tsx til useAudioPlayback.ts og eksporter dem
2. Oppdater useAudioPlayback return-verdi for å inkludere handlePrevious og handleNext
3. Oppdater NowPlayingBar.tsx for å bruke de flyttede funksjonene fra hook
4. Legg til useEffect i useAudioPlayback for å sette opp Media Session API
5. Implementer metadata-oppdatering når nowPlaying endres
6. Implementer action handlers for play, pause, nexttrack, previoustrack
7. Implementer playbackState og positionState oppdateringer
8. Sjekk for støtte med `'mediaSession' in navigator`
9. Håndter artwork i flere størrelser for optimal iOS-visning
10. Legg til feilhåndtering for nettlesere uten støtte

**Tester å utføre:**
- Start avspilling av en sang
- Lås iOS-enhet (eller bruk simulator)
- Verifiser at lock screen viser riktig metadata
- Test at next/previous fungerer fra lock screen
- Test at play/pause fungerer fra lock screen
- Verifiser at fremdriftsbar oppdateres
- Test på Chrome/Edge (desktop) for å verifisere cross-platform
