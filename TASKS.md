# TASKS.md

## Completed Tasks

### Task: Fix playlist reorder and playback queue issues

**Status:** Completed

**Description:**

Fixed multiple issues with playlist functionality:

1. **Playlist reorder with deleted songs:**
   - Problem: Reorder failed when songs were deleted in the editor
   - Solution: Delete all existing songs, then re-add all songs in correct order before reordering
   - Files: `frontend/src/components/playlist/PlaylistEditor/PlaylistEditor.tsx`

2. **History panel playlist refresh:**
   - Problem: Editing a playlist that is currently viewed did not update the displayed songs
   - Solution: Added `currentPlaylistSongsAtom` to track playlist songs and update on edit
   - Files:
     - `frontend/src/store/atoms.ts`
     - `frontend/src/store/index.ts`
     - `frontend/src/components/history/HistoryList.tsx`

3. **NowPlayingBar follows playlist context:**
   - Problem: Next/previous buttons and autoplay followed library queue instead of playlist when in playlist mode
   - Solution:
     - Added `currentPlaylistSongsAtom` to track active playlist
     - Updated `setNowPlaying` to use playlist queue when song is from playlist
     - Updated `handleNext`, `handlePrevious`, and `handleEnded` to search in correct song list
     - Added wrap-to-start support for playlists
   - Files:
     - `frontend/src/components/nowplaying/NowPlayingBar/hooks/useAudioPlayback.ts`
     - `frontend/src/components/nowplaying/NowPlayingBar/NowPlayingBar.tsx`

4. **Remove Advanced Mixtape functionality:**
   - Problem: Redundant functionality - playlist mode already covers custom mixtape creation
   - Solution: Removed AdvancedMixtapeButton, MixtapeEditor, and related API endpoints
   - Files removed:
     - `frontend/src/components/mixtape/AdvancedMixtapeButton/`
     - `frontend/src/components/mixtape/MixtapeEditor/`
   - Files modified:
     - `frontend/src/components/history/HistoryList.tsx`
     - `frontend/src/services/api.ts`
     - `backend/src/routes/mixtape.ts`
     - `frontend/src/i18n/en.ts`

**Key Changes:**

- `currentPlaylistSongsAtom`: Global atom storing songs from currently selected playlist (null = library mode)
- Playlist songs are now updated when playlist is edited, deleted, or changed
- Playback queue respects playlist context when song is from a playlist
- Next/previous and autoplay follow playlist order when in playlist mode
- Removed redundant Advanced Mixtape button and editor

---

## Future Tasks

No current tasks pending. All playlist and mixtape functionality is working as intended.
