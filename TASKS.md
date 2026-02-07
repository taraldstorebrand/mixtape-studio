# TASKS.md

## P1 – Viktige

### Task 1: Fikse skeletons som ikke vises ved sanggenerering

**Status:** 🔄 In Progress

**Problembeskrivelse:**
Når vi genererer nye sanger, dukker ikke lengre skeletons opp i HistoryList. Skeletons skal vises mens sanger genereres for å gi visuell feedback til brukeren.

**Gjeldende situasjon:**
- `HistoryList.tsx` renderer items direkte med `displayItems.map()`
- Ingen skeletons vises mens sanger genereres
- Brukeren får ingen visuell feedback under generering

**Forventet oppførsel:**
- Når en sang har status "generating" (eller lignende), skal en skeleton vises i listen
- Skeleton skal være plassert på samme sted som sangen vil ende opp når den er ferdig
- Skeleton skal være synlig frem til sangen er ferdig generert

**Mål:**
Gjenopprett funksjonalitet som viser skeletons mens sanger genereres i HistoryList.

**Filer som skal undersøkes og potensielt endres:**
- `frontend/src/components/history/HistoryList.tsx`
- `frontend/src/components/history/HistoryItem/HistoryItem.tsx`

**Status:** ✅ Done

**Løsning:**
- Fjernet håndtering av 'pending' status som satte audio_urls i `App.tsx:handleSunoUpdate`
- Når Suno API sender FIRST_SUCCESS status, blir ikke lenger audioUrls satt før status er 'completed'
- Dette gjør at skeletons vises korrekt mens sanger genereres

**Endret fil:**
- `frontend/src/App.tsx:73-91` - Fjernet 'pending' status handler

**Testing:**
1. Generer en ny sang
2. Verifiser at en skeleton vises i listen mens sangen genereres
3. Verifiser at skeleton forsvinner og erstattes med ferdig sang når generering er fullført
